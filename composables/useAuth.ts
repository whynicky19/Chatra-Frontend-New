import { useAuthStore } from '~/stores/auth.store'
import { useOrgStore, applyOrgTheme } from '~/stores/org.store'
import { useAuthSvc } from '~/services/auth'
import { resetLogoutFlag } from '~/services/api'

export const useAuth = () => {
  const auth = useAuthStore()
  const org  = useOrgStore()
  const svc  = useAuthSvc()

  // Общая пост-обработка успешно полученной пары токенов: тянем профиль,
  // применяем тему и отложенные ФИО/ник. Используется login/verifyEmail/reset.
  const applyTokens = async (t: { access_token: string; refresh_token?: string }) => {
    auth.setToken(t.access_token)
    if (t.refresh_token) auth.setRefreshToken(t.refresh_token)
    const u = await svc.me()
    auth.setUser(u)
    if (import.meta.client) {
      applyOrgTheme(org.orgTypeString as any)
      if (u.full_name) {
        auth.setFullname(u.full_name)
        localStorage.removeItem('_pending_fullname')
      } else {
        const pendingFn = localStorage.getItem('_pending_fullname')
        if (pendingFn) { auth.setFullname(pendingFn); localStorage.removeItem('_pending_fullname') }
      }
      const pending = localStorage.getItem('_pending_nick')
      if (pending) { auth.setNickname(pending); localStorage.removeItem('_pending_nick') }
    }
  }

  // Возвращает { ok, reason }. reason ∈ 'email_not_verified' | 'blocked' |
  // 'rate_limited' | 'wrong' — страница входа сама решает, что показать/куда вести.
  const login = async (email: string, pw: string): Promise<{ ok: boolean; reason?: string }> => {
    try {
      resetLogoutFlag()
      const t = await svc.login(email, pw, org.orgTypeString)
      await applyTokens(t)
      return { ok: true }
    } catch (e: any) {
      const status = e?.response?.status
      const detail = e?.response?.data?.detail
      if (status === 403 && detail === 'email_not_verified') return { ok: false, reason: 'email_not_verified' }
      if (status === 403) return { ok: false, reason: 'blocked' }
      if (status === 429) return { ok: false, reason: 'rate_limited' }
      return { ok: false, reason: 'wrong' }
    }
  }

  const register = async (
    email: string,
    pw: string,
    role = 'student',
    full_name?: string
  ): Promise<{ ok: boolean; taken?: boolean }> => {
    try {
      await svc.register(email, pw, role, full_name, org.orgTypeString)
      return { ok: true }
    } catch (e: any) {
      const status = e?.response?.status
      if (status === 409) return { ok: false, taken: true }
      return { ok: false }
    }
  }

  // Подтверждение email кодом → авто-вход. null при успехе, иначе ключ ошибки.
  const verifyEmail = async (email: string, code: string): Promise<string | null> => {
    try {
      const t = await svc.verifyEmail(email, code, org.orgTypeString)
      await applyTokens(t)
      return null
    } catch (e: any) {
      const detail = e?.response?.data?.detail
      if (e?.response?.status === 400 && detail === 'invalid_code') return 'invalid_code'
      return 'verify_error'
    }
  }

  // Повторная отправка кода. Возвращает dev_code (только в dev) либо ''.
  const resendVerification = async (email: string): Promise<string> => {
    try {
      const r = await svc.resendVerification(email, org.orgTypeString)
      return r.dev_code || ''
    } catch { return '' }
  }

  const forgotPassword = async (email: string): Promise<string> => {
    const r = await svc.forgotPassword(email, org.orgTypeString)
    return r.dev_code || ''
  }

  // Сброс пароля кодом → авто-вход. null при успехе, иначе ключ ошибки.
  const resetPassword = async (email: string, code: string, newPassword: string): Promise<string | null> => {
    try {
      const t = await svc.resetPassword(email, code, newPassword, org.orgTypeString)
      await applyTokens(t)
      return null
    } catch (e: any) {
      const detail = e?.response?.data?.detail
      if (e?.response?.status === 400 && detail === 'invalid_code') return 'invalid_code'
      return 'reset_error'
    }
  }

  // Смена пароля (авторизованный). null при успехе, иначе ключ ошибки.
  const changePassword = async (current: string, next: string): Promise<string | null> => {
    try {
      const t = await svc.changePassword(current, next)
      auth.setToken(t.access_token)
      if (t.refresh_token) auth.setRefreshToken(t.refresh_token)
      return null
    } catch (e: any) {
      const detail = e?.response?.data?.detail
      if (e?.response?.status === 400 && detail === 'wrong_current_password') return 'wrong_current_password'
      return 'change_password_error'
    }
  }

  // Удаление аккаунта (подтверждение паролем). null при успехе, иначе ключ ошибки.
  const deleteAccount = async (password: string): Promise<string | null> => {
    try {
      await svc.deleteAccount(password)
      auth.logout()
      return null
    } catch (e: any) {
      const detail = e?.response?.data?.detail
      if (e?.response?.status === 400 && detail === 'wrong_current_password') return 'wrong_current_password'
      return 'delete_account_error'
    }
  }

  const fetchMe = async () => {
    if (!auth.token) return
    try {
      const u = await svc.me()
      auth.setUser(u)
    } catch (e: any) {
      // Выходим только если токен реально невалиден (401 после неудачного
      // refresh или 403). При сетевой ошибке/5xx сессию сохраняем — иначе
      // открытие сайта офлайн разлогинивало бы без причины.
      const status = e?.response?.status
      if (status === 401 || status === 403) auth.logout()
    }
  }

  const logout = async () => {
    await svc.logoutServer()
    auth.logout()
    if (import.meta.client) {
      window.location.href = '/org'
    }
  }

  return { login, register, verifyEmail, resendVerification, forgotPassword, resetPassword, changePassword, deleteAccount, fetchMe, logout }
}
