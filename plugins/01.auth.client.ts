import { setActivePinia } from 'pinia'
import { useAuthStore } from '~/stores/auth.store'
import { useOrgStore } from '~/stores/org.store'
import { useAuth } from '~/composables/useAuth'
import { refreshWebSession } from '~/services/api'
import { useRuntimeConfig } from '#app'

export default defineNuxtPlugin(async (nuxtApp) => {
  if (!import.meta.client) return

  const pinia = nuxtApp.$pinia as any
  if (pinia) setActivePinia(pinia)

  const auth = useAuthStore()
  const legacyRefreshToken = auth.takeLegacyRefreshToken()

  try {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  } catch {}

  const org = useOrgStore()
  org.init()

  // Восстанавливаем короткий access token через HttpOnly cookie. Старый
  // localStorage refresh token (если он есть) обменивается ровно один раз.
  try {
    const base = useRuntimeConfig().public.apiBase as string
    const token = await refreshWebSession(base, legacyRefreshToken)
    auth.setToken(token)
  } catch {
    auth.logout()
  }

  // Подтягиваем профиль сразу после восстановления токена: без этого
  // role-gated страницы (calendar/notifications, которые редиректят
  // учителей/админов на /) видят auth.user === null до первого явного
  // вызова useAuth() и пропускают запрещённый контент.
  if (auth.token) {
    await useAuth().fetchMe()
  }
})
