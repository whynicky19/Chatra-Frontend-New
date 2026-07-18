import { useApi } from './api'

export const useAuthSvc = () => {
  const api = useApi()

  return {
    login: async (email: string, pw: string, orgType = 'university') => {
      const f = new URLSearchParams()
      f.append('username', email)
      f.append('password', pw)
      const { data } = await api.post(
        `/auth/login?org_type=${encodeURIComponent(orgType)}`,
        f,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )
      return data as { access_token: string; refresh_token: string }
    },

    // role больше не отправляется: бэкенд всегда регистрирует student,
    // роли teacher/admin выдаёт только администратор
    register: async (
      email: string,
      pw: string,
      _role: string,
      full_name?: string,
      orgType = 'university'
    ) => {
      const { data } = await api.post('/auth/register', {
        email,
        password: pw,
        full_name,
        org_type: orgType,
      })
      return data
    },

    me: async () => {
      const { data } = await api.get('/auth/me')
      return data
    },

    updateMe: async (full_name: string) => {
      const { data } = await api.patch('/auth/me', { full_name })
      return data
    },

    // Серверный отзыв токенов (best-effort).
    logoutServer: async () => {
      try { await api.post('/auth/logout') } catch {}
    },

    // Меняет пароль, возвращает новую пару токенов (старые сессии сервер отзывает).
    changePassword: async (current_password: string, new_password: string) => {
      const { data } = await api.post('/auth/change-password', { current_password, new_password })
      return data as { access_token: string; refresh_token: string }
    },

    // Удаляет собственный аккаунт (подтверждение паролем).
    deleteAccount: async (password: string) => {
      await api.delete('/auth/me', { data: { password } })
    },

    // Подтверждение email кодом → пара токенов (авто-вход).
    verifyEmail: async (email: string, code: string, orgType = 'university') => {
      const { data } = await api.post('/auth/verify-email', { email, org_type: orgType, code })
      return data as { access_token: string; refresh_token: string }
    },

    resendVerification: async (email: string, orgType = 'university') => {
      const { data } = await api.post('/auth/resend-verification', { email, org_type: orgType })
      return data as { sent: boolean; dev_code?: string }
    },

    forgotPassword: async (email: string, orgType = 'university') => {
      const { data } = await api.post('/auth/forgot-password', { email, org_type: orgType })
      return data as { sent: boolean; dev_code?: string }
    },

    // Сброс пароля кодом → пара токенов (авто-вход).
    resetPassword: async (email: string, code: string, new_password: string, orgType = 'university') => {
      const { data } = await api.post('/auth/reset-password', { email, org_type: orgType, code, new_password })
      return data as { access_token: string; refresh_token: string }
    },
  }
}
