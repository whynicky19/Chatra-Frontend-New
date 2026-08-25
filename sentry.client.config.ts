import * as Sentry from '@sentry/nuxt'

// Конфиг клиентского SDK (@sentry/nuxt подхватывает этот файл автоматически
// и оборачивает в Nuxt-контекст, поэтому useRuntimeConfig() здесь доступен).
// DSN задаётся через NUXT_PUBLIC_SENTRY_DSN; без него Sentry выключен.
const { sentryDsn } = useRuntimeConfig().public

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn as string,
    environment:
      process.env.NUXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
    release: process.env.NUXT_PUBLIC_SENTRY_RELEASE || undefined,
    // Интеграция Vue: реальный app подставит рантайм-плагин модуля
    // (attachErrorHandler там уже включён), ошибки vue:error попадают сами.
    integrations: [Sentry.vueIntegration()],
    // Никакой персональной информации: ни кук, ни заголовков авторизации.
    sendDefaultPii: false,
    // Производительность трассируем у 5% сессий.
    tracesSampleRate: 0.05,
    beforeSend(event) {
      const req = event.request
      if (req?.cookies) delete req.cookies
      if (req?.headers) {
        for (const key of Object.keys(req.headers)) {
          if (/authorization|cookie|token/i.test(key)) delete req.headers[key]
        }
      }
      return event
    },
    beforeBreadcrumb(breadcrumb) {
      // Крошки axios/fetch не должны нести тела запросов/ответов.
      if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
        if (breadcrumb.data) {
          delete breadcrumb.data.body
          delete breadcrumb.data.request_body_size
          delete breadcrumb.data.response_body_size
        }
      }
      return breadcrumb.type === 'console' ? null : breadcrumb
    },
    ignoreErrors: [
      // Штатный сценарий после деплоя SPA — перезагружаемся сами (см.
      // plugins/error-logger.client.ts), в Sentry это шум.
      /Loading (chunk|CSS chunk|dynamically imported module)/i,
      /Importing a module script failed/i,
      'ChunkLoadError',
      // Сетевые обрывы у клиента — не ошибка приложения.
      /Network Error/i,
      /ERR_NETWORK/i,
      /Failed to fetch/i,
      /ResizeObserver loop/i,
    ],
  })
}
