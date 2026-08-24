import { useAuthStore } from '~/stores/auth.store'
import { useOrgStore } from '~/stores/org.store'

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  // Публичные правовые страницы доступны всем без входа и выбора организации
  // (нужны для App Store: ссылки на политику конфиденциальности и условия
  // использования — обе даются на экране регистрации до входа).
  if (to.path === '/privacy' || to.path === '/terms' || to.path === '/rules') return

  const auth = useAuthStore()
  const org  = useOrgStore()

  if (!org.isSelected) org.init()

  // Лендинг публичный, но авторизованного пользователя сразу отправляем в
  // приложение — повторная регистрация/витрина ему не нужна.
  if (to.path === '/landing' && auth.token) {
    return navigateTo('/', { replace: true })
  }

  // Неавторизованному посетителю вместо каталога показываем лендинг.
  if (!auth.token && to.path === '/') {
    return navigateTo('/landing', { replace: true })
  }

  const pub = ['/login', '/register', '/org', '/verify-email', '/forgot-password', '/landing']
  const isPublic = pub.includes(to.path)

  if (to.path === '/org') return

  if (!org.isSelected && !isPublic) {
    return navigateTo('/org', { replace: true })
  }

  if (to.path === '/login' || to.path === '/register') return

  if (!auth.token && !isPublic) {
    return navigateTo('/login', { replace: true })
  }

  if (auth.token && isPublic) {
    return navigateTo('/', { replace: true })
  }
})
