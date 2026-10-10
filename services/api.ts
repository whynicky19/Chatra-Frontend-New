import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { useRuntimeConfig } from '#app'
import { useAuthStore } from '~/stores/auth.store'

let _api: AxiosInstance | null = null
let _baseURL: string | null = null
let _loggingOut = false
let _refreshPromise: Promise<string> | null = null
let _csrfToken: string | null = null
let _lastBroadcast: { token: string; at: number } | null = null
let _sessionChannel: BroadcastChannel | null = null

export const resetLogoutFlag = () => { _loggingOut = false }

export const rememberSessionMetadata = (data: { csrf_token?: string }) => {
  if (data.csrf_token) _csrfToken = data.csrf_token
}

const sessionChannel = () => {
  if (!import.meta.client || typeof BroadcastChannel === 'undefined') return null
  if (!_sessionChannel) {
    _sessionChannel = new BroadcastChannel('chatra-session')
    _sessionChannel.addEventListener('message', (event) => {
      const data = event.data
      if (data?.type === 'access-token' && typeof data.token === 'string') {
        _lastBroadcast = { token: data.token, at: Date.now() }
        try { useAuthStore().setToken(data.token) } catch {}
      } else if (data?.type === 'logout') {
        try { useAuthStore().logout() } catch {}
      }
    })
  }
  return _sessionChannel
}

const publishAccessToken = (token: string) => {
  _lastBroadcast = { token, at: Date.now() }
  sessionChannel()?.postMessage({ type: 'access-token', token })
}

const getCsrfToken = async (base: string): Promise<string> => {
  if (_csrfToken) return _csrfToken
  const { data } = await axios.get(`${base}/auth/csrf`, { withCredentials: true })
  _csrfToken = data.csrf_token
  return _csrfToken!
}

const performCookieRefresh = async (base: string, legacyToken?: string | null): Promise<string> => {
  const headers: Record<string, string> = {}
  if (!legacyToken) headers['X-CSRF-Token'] = await getCsrfToken(base)
  const { data } = await axios.post(
    `${base}/auth/refresh?session=cookie`,
    legacyToken ? { refresh_token: legacyToken } : null,
    { withCredentials: true, headers },
  )
  rememberSessionMetadata(data)
  publishAccessToken(data.access_token)
  return data.access_token
}

const refreshAcrossTabs = async (base: string, legacyToken?: string | null): Promise<string> => {
  sessionChannel()
  const startedAt = Date.now()
  const locks = import.meta.client ? (navigator as any).locks : null
  if (!locks?.request) return performCookieRefresh(base, legacyToken)
  return locks.request('chatra-session-refresh', async () => {
    // Another tab may have completed rotation while this tab waited. Reuse its
    // short-lived access token instead of replaying the old shared cookie.
    if (!legacyToken && _lastBroadcast && _lastBroadcast.at >= startedAt) {
      return _lastBroadcast.token
    }
    return performCookieRefresh(base, legacyToken)
  })
}

export const refreshWebSession = async (base: string, legacyToken?: string | null): Promise<string> => {
  if (_refreshPromise) return _refreshPromise
  _refreshPromise = refreshAcrossTabs(base, legacyToken)
  try {
    return await _refreshPromise
  } finally {
    _refreshPromise = null
  }
}

export const csrfHeader = async (base: string) => ({
  'X-CSRF-Token': await getCsrfToken(base),
})

const doLogout = () => {
  if (_loggingOut) return
  _loggingOut = true
  try { useAuthStore().logout() } catch {}
  sessionChannel()?.postMessage({ type: 'logout' })
  if (import.meta.client) window.location.href = '/login'
}

export const useApi = (): AxiosInstance => {
  const cfg = useRuntimeConfig()
  const base = cfg.public.apiBase as string

  if (_api && _baseURL === base) return _api

  _baseURL = base
  _api = axios.create({
    baseURL: base,
    withCredentials: true,
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

      try {
        const accessToken = await refreshWebSession(base)
        try {
          useAuthStore().setToken(accessToken)
        } catch {}
        original.headers.Authorization = `Bearer ${accessToken}`
        if (original.url?.includes('/auth/logout') && _csrfToken) {
          original.headers['X-CSRF-Token'] = _csrfToken
        }
        return _api!.request(original)
      } catch (refreshErr: any) {
        // Разлогин только по вердикту сервера: 401/403 на сам refresh —
        // токен реально отозван/протух. Сетевой сбой, таймаут или 5xx —
        // не повод рвать сессию: следующий запрос повторит refresh.
        const st = refreshErr?.response?.status
        if (st === 401 || st === 403) doLogout()
        return Promise.reject(e)
      }
    }
  )

  return _api
}
