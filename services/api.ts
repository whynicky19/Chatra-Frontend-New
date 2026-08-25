import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { useRuntimeConfig } from '#app'
import { useAuthStore } from '~/stores/auth.store'

let _api: AxiosInstance | null = null
let _baseURL: string | null = null
let _loggingOut = false
let _refreshing = false
let _refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = []

// Серверные сбои (5xx и обрывы сети) уводим в Sentry вручную: такие ошибки
// обычно перехватываются try/catch в коде страниц и до глобальных хендлеров
// не доходят. 4xx не отправляем — это штатные сценарии (валидация, права).
// Отправляем только URL и статус, без тела ответа и заголовков.
const captureApiError = async (e: any) => {
  const status = e?.response?.status
  const isServerError = !e?.response || (status >= 500 && status < 600)
  if (!isServerError || import.meta.server) return
  // Динамический импорт: если Sentry выключен (нет DSN), модуль просто
  // не инициализирован и captureException ничего не отправит.
  try {
    const { captureException } = await import('@sentry/nuxt')
    captureException(e, {
      tags: { api_error: true },
      extra: {
        url: e?.config?.url,
        method: e?.config?.method,
        status: status ?? 'network_error',
      },
    })
  } catch {}
}

export const resetLogoutFlag = () => { _loggingOut = false }

const doLogout = () => {
  if (_loggingOut) return
  _loggingOut = true
  try { useAuthStore().logout() } catch {}
  if (import.meta.client) window.location.href = '/login'
}

export const useApi = (): AxiosInstance => {
  const cfg = useRuntimeConfig()
  const base = cfg.public.apiBase as string

  if (_api && _baseURL === base) return _api

  _baseURL = base
  _api = axios.create({
    baseURL: base,
    // ngrok free показывает браузеру HTML-заглушку без этого заголовка
    headers: { 'ngrok-skip-browser-warning': 'true' },
  })

  _api.interceptors.request.use((r: InternalAxiosRequestConfig) => {
    try {
      const auth = useAuthStore()
      if (auth.token) r.headers.Authorization = `Bearer ${auth.token}`
    } catch {}
    return r
  })

  _api.interceptors.response.use(
    r => r,
    async (e) => {
      await captureApiError(e)
      const original = e.config as InternalAxiosRequestConfig & { _retry?: boolean }

      // Заблокированный (user_inactive) или неподтверждённый (email_not_verified)
      // по сохранённому токену — принудительный разлогин на /login.
      // ВАЖНО: исключаем сами auth-эндпоинты входа/верификации — там 403 должен
      // вернуться в useAuth (login уведёт на экран кода / покажет причину), иначе
      // doLogout перебивал бы этот сценарий жёстким редиректом.
      const detail = e.response?.data?.detail
      const isAuthEntry = /\/auth\/(login|register|verify-email|resend-verification|forgot-password|reset-password)/.test(original?.url || '')
      if (e.response?.status === 403 && !isAuthEntry &&
          (detail === 'user_inactive' || detail === 'email_not_verified')) {
        doLogout()
        return Promise.reject(e)
      }

      if (e.response?.status !== 401 || original._retry) {
        return Promise.reject(e)
      }

      // Неверный логин/пароль (или другая auth-ручка) отвечает 401 сама по
      // себе — это не "токен протух", а ответ на конкретную попытку входа.
      // Раньше это ловилось общей веткой ниже: без refreshToken шёл doLogout()
      // (жёсткий redirect на /login), из-за чего форма входа не успевала
      // показать ошибку — просто перезагружалась молча.
      if (isAuthEntry) {
        return Promise.reject(e)
      }

      if (original.url?.includes('/auth/refresh')) {
        doLogout()
        return Promise.reject(e)
      }

      original._retry = true

      if (_refreshing) {
        return new Promise((resolve, reject) => {
          _refreshQueue.push({
            resolve: (token) => {
              original.headers.Authorization = `Bearer ${token}`
              resolve(_api!.request(original))
            },
            reject,
          })
        })
      }

      let refreshToken: string | null = null
      try { refreshToken = useAuthStore().refreshToken } catch {}

      if (!refreshToken) {
        doLogout()
        return Promise.reject(e)
      }

      _refreshing = true
      try {
        const { data } = await axios.post(`${base}/auth/refresh`, {
          refresh_token: refreshToken,
        })

        try {
          const auth = useAuthStore()
          auth.setToken(data.access_token)
          auth.setRefreshToken(data.refresh_token)
        } catch {}

        _refreshQueue.forEach(q => q.resolve(data.access_token))
        _refreshQueue = []

        original.headers.Authorization = `Bearer ${data.access_token}`
        return _api!.request(original)
      } catch (refreshErr) {
        // Иначе запросы, вставшие в очередь пока шёл refresh, зависали бы
        // навсегда (их промис никогда не resolve/reject) — бесконечный
        // спиннер, хотя пользователя уже увело на /login через doLogout().
        _refreshQueue.forEach(q => q.reject(refreshErr))
        _refreshQueue = []
        doLogout()
        return Promise.reject(e)
      } finally {
        _refreshing = false
      }
    }
  )

  return _api
}
