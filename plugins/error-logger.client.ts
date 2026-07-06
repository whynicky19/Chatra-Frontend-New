import { useToastStore } from '~/stores/toast.store'

// Диагностика редких «морганий» страницы: показываем реальную причину.
// Ошибки загрузки чанков (устаревшая сборка) — тихо перезагружаем один раз,
// это штатное поведение SPA после деплоя. Остальные ошибки — в консоль и тост,
// чтобы можно было увидеть текст без DevTools. Ничего не подавляем «молча».
export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return

  const isChunkError = (err: any): boolean => {
    const msg = String(err?.message || err || '')
    return /Loading (chunk|CSS chunk|dynamically imported module)/i.test(msg)
      || /Importing a module script failed/i.test(msg)
      || err?.name === 'ChunkLoadError'
  }

  const RELOAD_FLAG = '__chunk_reloaded_at'
  const reloadOnce = () => {
    try {
      const last = Number(sessionStorage.getItem(RELOAD_FLAG) || 0)
      // Не зацикливаемся: перезагрузка не чаще раза в 10 секунд.
      if (Date.now() - last < 10000) return
      sessionStorage.setItem(RELOAD_FLAG, String(Date.now()))
      window.location.reload()
    } catch { window.location.reload() }
  }

  const report = (err: any, info?: string) => {
    if (isChunkError(err)) { reloadOnce(); return }
    // eslint-disable-next-line no-console
    console.error('[app-error]', info || '', err)
    try { useToastStore().err(String(err?.message || err).slice(0, 200)) } catch {}
  }

  nuxtApp.vueApp.config.errorHandler = (err, _instance, info) => report(err, info)
  nuxtApp.hook('vue:error', (err, _instance, info) => report(err, info))
  window.addEventListener('unhandledrejection', (e) => report(e.reason))
  window.addEventListener('error', (e) => { if (e.error) report(e.error) })
})
