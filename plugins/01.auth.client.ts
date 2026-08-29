import { setActivePinia } from 'pinia'
import { useAuthStore } from '~/stores/auth.store'
import { useOrgStore } from '~/stores/org.store'
import { useAuth } from '~/composables/useAuth'

export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return

  const pinia = nuxtApp.$pinia as any
  if (pinia) setActivePinia(pinia)

  const auth = useAuthStore()
  auth.loadFromStorage()

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

  // Подтягиваем профиль сразу после восстановления токена: без этого
  // role-gated страницы (calendar/notifications, которые редиректят
  // учителей/админов на /) видят auth.user === null до первого явного
  // вызова useAuth() и пропускают запрещённый контент.
  if (auth.token) {
    useAuth().fetchMe()
  }
})
