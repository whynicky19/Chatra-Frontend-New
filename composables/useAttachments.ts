// Работа с прикреплёнными файлами: оригинальное имя хранится во фрагменте URL
// (uploads/uuid.pdf#Оригинальное%20имя.pdf) — единый формат с мобильным приложением.
// Легаси-формат сайта: "📎 [имя](url)" в описании.

// Пробел внутри скобок не исключаем — только ')'/'\n' — иначе ссылка с
// пробелом в оригинальном имени файла (легаси-данные, см. SIGNED_UPLOAD_URL_RE
// ниже) обрывает совпадение и хвост "имени" остаётся сырым текстом.
const MD_FILE_RE = /📎\s*\[([^\]\n]+)\]\((https?:\/\/[^)\n]+)\)/g
const FILE_EXT_RE = /\.(pdf|doc|docx|txt|md|ppt|pptx|xls|xlsx|png|jpg|jpeg|gif|webp)(\?[^\s#]*)?$/i
const URL_RE = /(https?:\/\/[^\s\n"'<>]+)/g
// Легаси-данные (до фикса пробела в services/uploads.ts): бэкенд кладёт
// оригинальное имя файла прямо в путь URL, из-за чего в тексте описания мог
// сохраниться пробел прямо посреди голой ссылки — обычный URL_RE такую ссылку
// обрывает на первом пробеле. Подписанные ссылки на файлы всегда несут
// "?exp=<ts>&sig=<hex>", это надёжная сигнатура, отличающая их от обычного
// текста, — по ней ловим ссылку целиком, пробелы внутри не исключаем.
const SIGNED_UPLOAD_URL_RE = /(https?:\/\/[^\s/]+\/[^\n]*?\?exp=\d+&sig=[0-9a-f]+(?:#[^\s\n"'<>]*)?)/g

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
  let rest = desc.replace(MD_FILE_RE, '')
  for (const m of [...rest.matchAll(SIGNED_UPLOAD_URL_RE)]) {
    const url = m[1].trim()
    const base = url.split('#')[0]
    if (!seen.has(base)) { files.push({ url, name: fileNameFromUrl(url) }); seen.add(base) }
  }
  rest = rest.replace(SIGNED_UPLOAD_URL_RE, '')
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
    .replace(SIGNED_UPLOAD_URL_RE, '')
    .replace(URL_RE, (m) => (isFileUrl(m.replace(/[.,;:!?]+$/, '')) ? '' : m))
    .replace(/\n{3,}/g, '\n\n')
    .trim()
