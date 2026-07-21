// Вложение: сайт шлёт markdown «[Фото](url) — имя», приложение — голую
// ссылку «/uploads/xxx.png». Общий парсер для превью в списке чатов —
// раньше в карточке для фото/файла показывался сырой путь на бэкенде.
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'bmp']
const pathOf = (url: string) => url.split('#')[0].split('?')[0]

export function parseAttachment(content: string): { url: string; name: string; isImage: boolean } | null {
  const raw = (content || '').trim()
  if (!raw) return null
  const md = raw.match(/\[[^\]]*\]\(([^()\s]+)\)/)
  let url: string | null = null
  let name = 'Файл'
  if (md) {
    url = md[1]
    name = raw.match(/—\s*(.+)$/)?.[1]?.trim() || pathOf(url).split('/').pop() || 'Файл'
  } else if (!/\s/.test(raw) && /^(https?:\/\/\S+?)?\/?uploads\/\S+$/i.test(raw)) {
    url = raw
    name = decodeURIComponent(raw.split('#')[1] || pathOf(raw).split('/').pop() || 'Файл')
  }
  if (!url) return null
  const ext = pathOf(url).split('.').pop()?.toLowerCase() || ''
  return { url, name, isImage: IMAGE_EXTS.includes(ext) }
}

/// Короткая метка для превью в списке чатов ("Фото"/"Файл" вместо сырой ссылки).
export function attachmentPreviewLabel(content: string): string | null {
  const att = parseAttachment(content)
  if (!att) return null
  return att.isImage ? 'Фото' : 'Файл'
}
