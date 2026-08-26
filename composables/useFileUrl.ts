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

// Вариант для мест вне setup-контекста (обработчики событий, composables без
// инстанса): useRuntimeConfig() там недоступен — тогда подменяем на origin
// текущей страницы. Раньше fixFileUrl применялся только к обложкам, а
// превью/скачивание/картинки вложений ходили по сырому localhost:8000 и не
// грузились при открытии сайта с другой машины.
export const fixFileUrlSafe = (url?: string | null): string => {
  if (!url) return ''
  try {
    return fixFileUrl(url)
  } catch {
    try {
      return url
        .replace(/https?:\/\/localhost:\d+/, window.location.origin)
        .replace(/https?:\/\/127\.0\.0\.1:\d+/, window.location.origin)
    } catch {
      return url
    }
  }
}

// Подписанные ссылки несут exp/sig в query, который бэкенд пересчитывает при
// каждом запросе — путь файла при этом не меняется. Если сравнивать URL
// целиком, любое фоновое обновление списка классов выглядело бы как "новая"
// обложка и заставляло браузер перекачивать те же байты заново. Сравниваем
// только путь, чтобы такие обновления сохраняли уже загруженный URL.
export const sameFilePath = (a?: string | null, b?: string | null): boolean => {
  if (!a || !b) return false
  const path = (u: string) => u.split('?')[0]
  return path(a) === path(b)
}
