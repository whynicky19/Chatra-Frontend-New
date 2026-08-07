const FILE_EXT = /\.(pdf|doc|docx|txt|ppt|pptx|xls|xlsx|png|jpg|jpeg|gif|webp|md)(\?[^\s]*)?/i

const getFileIcon = (url: string) => { const e = url.split('.').pop()?.split('?')[0]?.toLowerCase() || ''; if (e === 'pdf') return 'PDF'; if (['doc', 'docx', 'txt', 'md'].includes(e)) return 'DOC'; if (['xls', 'xlsx'].includes(e)) return 'XLS'; if (['ppt', 'pptx'].includes(e)) return 'PPT'; if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(e)) return 'IMG'; return 'FILE' }
const getFileName = (url: string) => { try { return decodeURIComponent(new URL(url).pathname.split('/').pop() || url) } catch { return url.slice(-50) } }
const attrEscape = (s: string) => s.replace(/"/g, '&quot;')
// Полное HTML-экранирование — для сырых данных (имя файла из URL).
const htmlEscape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
// safeName ДОЛЖЕН быть уже экранирован вызывающим; url экранируем для атрибутов
// (иначе кавычка в URL вложения ломала бы href → XSS).
const fileAnchor = (url: string, safeName: string) => {
  const safeUrl = attrEscape(url)
  return `<a href="${safeUrl}" data-preview-url="${safeUrl}" data-preview-name="${safeName}" rel="noopener" class="file-attachment"><span class="file-type-badge">${getFileIcon(url)}</span><span>${safeName}</span></a>`
}

export const renderBody = (text: string): string => {
  if (!text) return ''
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  // Один проход: и 📎-вложения, и голые ссылки. String.replace не пересканирует
  // вставленную разметку, поэтому сгенерированные <a> не оборачиваются повторно
  // (иначе URL из href/data-preview-* распознавался как новая ссылка → битый HTML).
  // URL внутри скобок 📎-вложения может содержать пробелы (оригинальное имя
  // файла в пути, напр. "Lection 1.pptx") — границу задают сами скобки
  // markdown-ссылки, поэтому пробел из группы не исключаем, только ')'.
  const combined = /📎\s*\[([^\]]+)\]\((https?:\/\/[^)]+)\)|(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g
  return escaped.replace(combined, (_m, name, attUrl, bareUrl) => {
    // name из attachment-формата уже прошёл &<>-экранирование (в `escaped`) —
    // добавляем только кавычку. bareUrl-имя (getFileName) сырое → полный escape.
    if (attUrl) return fileAnchor(attUrl, attrEscape(name))
    if (FILE_EXT.test(bareUrl)) return fileAnchor(bareUrl, htmlEscape(getFileName(bareUrl)))
    return `<a href="${attrEscape(bareUrl)}" target="_blank" rel="noopener" class="link-inline">${bareUrl}</a>`
  }).replace(/\n/g, '<br>')
}
