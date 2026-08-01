// Цвет/лейбл по типу файла — та же палитра, что и fileTypeVisual() во
// Flutter-приложении (lib/screens/classes/widgets/file_card.dart), чтобы
// карточки файлов выглядели одинаково на сайте и в приложении.

export interface FileVisual { color: string; bg: string; label: string }

const TYPE_MAP: Record<string, { color: string; label: string }> = {
  pdf: { color: '#E5484D', label: 'PDF' },
  ppt: { color: '#F2A93B', label: 'PPT' },
  pptx: { color: '#F2A93B', label: 'PPT' },
  doc: { color: '#3B9FF2', label: 'DOC' },
  docx: { color: '#3B9FF2', label: 'DOC' },
  xls: { color: '#3BBF6E', label: 'XLS' },
  xlsx: { color: '#3BBF6E', label: 'XLS' },
  txt: { color: '#A681E8', label: 'TXT' },
  md: { color: '#A681E8', label: 'TXT' },
  jpg: { color: '#3BB6F2', label: 'IMG' },
  jpeg: { color: '#3BB6F2', label: 'IMG' },
  png: { color: '#3BB6F2', label: 'IMG' },
  gif: { color: '#3BB6F2', label: 'IMG' },
  webp: { color: '#3BB6F2', label: 'IMG' },
  mp4: { color: '#C46BE0', label: 'VID' },
  mov: { color: '#C46BE0', label: 'VID' },
  avi: { color: '#C46BE0', label: 'VID' },
}
const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp'])

export const extOf = (url: string): string =>
  (url.split('#')[0].split('?')[0].split('.').pop() || '').toLowerCase()

export const isImageUrl = (url: string): boolean => IMAGE_EXTS.has(extOf(url))

// "24" — hex-суффикс альфа-канала (~14%), тот же, что .withValues(alpha: 0.14) во Flutter.
export const fileVisual = (url: string): FileVisual => {
  const t = TYPE_MAP[extOf(url)]
  const color = t?.color || '#9A9A9A'
  return { color, bg: `${color}24`, label: t?.label || 'FILE' }
}
