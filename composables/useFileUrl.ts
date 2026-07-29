import { useRuntimeConfig } from '#app'

// Подписанные ссылки на /uploads бэкенд строит от APP_BASE_URL (по умолчанию
// "http://localhost:8000", см. services/file_urls.py) — если сайт открыт не
// с той же машины, что бэкенд (другой ноутбук, телефон, туннель), такой хост
// не резолвится и обложки/файлы не грузятся. Дом-адрес меняем на текущий
// apiBase — подпись (exp/sig в query) считается только от ПУТИ файла, поэтому
// смена хоста её не портит. Тот же приём уже используется в мобильном
// приложении (fixUrl в api_service.dart).
export const fixFileUrl = (url?: string | null): string => {
  if (!url) return ''
  const cfg = useRuntimeConfig()
  const apiBase = (cfg.public.apiBase as string) || ''
  const root = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase
  if (!root) return url
  return url
    .replace(/https?:\/\/localhost:\d+/, root)
    .replace(/https?:\/\/127\.0\.0\.1:\d+/, root)
}
