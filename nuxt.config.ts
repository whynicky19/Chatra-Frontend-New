export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  compatibilityDate: '2025-05-01',
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  components: [{ path: '~/components', pathPrefix: false }],
  runtimeConfig: {
    public: {
      // Тот же бэкенд, что у мобильного приложения — данные общие.
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://glacier-radiated-wipe.ngrok-free.dev',
      wsBase:  process.env.NUXT_PUBLIC_WS_BASE  || 'wss://glacier-radiated-wipe.ngrok-free.dev',
    },
  },
  app: {
    head: {
      title: 'Chatra',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/logo.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/logo.png' },
      ],
    },
    pageTransition: { name: 'page' },
  },
  typescript: { strict: false, typeCheck: false },
})
