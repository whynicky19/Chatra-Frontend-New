// Работа с прикреплёнными файлами: оригинальное имя хранится во фрагменте URL
// (uploads/uuid.pdf#Оригинальное%20имя.pdf) — единый формат с мобильным приложением.
// Легаси-формат сайта: "📎 [имя](url)" в описании.

const MD_FILE_RE = /📎\s*\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g
const FILE_EXT_RE = /\.(pdf|doc|docx|txt|md|ppt|pptx|xls|xlsx|png|jpg|jpeg|gif|webp)(\?[^\s#]*)?$/i
const URL_RE = /(https?:\/\/[^\s\n"'<>]+)/g

/** Добавляет оригинальное имя файла во фрагмент URL */
export const withNameFragment = (url: string, name: string): string =>
  url.includes('#') ? url : `${url}#${encodeURIComponent(name)}`

/** Человекочитаемое имя файла: фрагмент URL, иначе последний сегмент пути */
export const fileNameFromUrl = (url: string): string => {
  try {
    const u = new URL(url)
    if (u.hash && u.hash.length > 1) return decodeURIComponent(u.hash.slice(1))
    return decodeURIComponent(u.pathname.split('/').pop() || url)
  } catch { return url.slice(-40) }
}

const isFileUrl = (url: string): boolean => FILE_EXT_RE.test(url.split('#')[0]) || FILE_EXT_RE.test(url)

/** Извлекает файлы из текста описания (оба формата), с именами */
export const extractFilesFromText = (text?: string | null): { name: string; url: string }[] => {
  const desc = text || ''
  const files: { name: string; url: string }[] = []
  const seen = new Set<string>()
  for (const m of [...desc.matchAll(MD_FILE_RE)]) {
    const url = withNameFragment(m[2], m[1])
    const base = url.split('#')[0]
    if (!seen.has(base)) { files.push({ url, name: m[1] }); seen.add(base) }
  }
  const rest = desc.replace(MD_FILE_RE, '')
  for (const m of [...rest.matchAll(URL_RE)]) {
    const url = m[1].replace(/[.,;:!?]+$/, '')
    const base = url.split('#')[0]
    if (isFileUrl(url) && !seen.has(base)) {
      files.push({ url, name: fileNameFromUrl(url) })
      seen.add(base)
    }
  }
  return files
}

/** Убирает ссылки на файлы из текста описания — пользователю пути не показываем */
export const stripFilesFromText = (text?: string | null): string =>
  (text || '')
    .replace(MD_FILE_RE, '')
    .replace(URL_RE, (m) => (isFileUrl(m.replace(/[.,;:!?]+$/, '')) ? '' : m))
    .replace(/\n{3,}/g, '\n\n')
    .trim()
