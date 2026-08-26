// Единая клиентская валидация загружаемых файлов — синхронизирована с
// ALLOWED_EXTENSIONS/MAX_FILE_SIZE бэкенда (routers/uploads.py). Раньше
// валидации не было вовсе: файл на 2 ГБ молча уходил в axios без прогресса
// и таймаута, а пользователь видел generic-ошибку после минутного «висения».

export const MAX_UPLOAD_MB = 50
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024

// Зеркало ALLOWED_EXTENSIONS из routers/uploads.py (zip/rar исключены там же).
export const ALLOWED_UPLOAD_EXTS = [
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx',
  'txt', 'md', 'csv', 'rtf', 'sm',
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'heif',
  'mp3', 'wav', 'm4a', 'webm', 'ogg', 'mp4',
]

export const ACCEPT_ATTR = ALLOWED_UPLOAD_EXTS.map((e) => `.${e}`).join(',')

export const extOf = (name: string): string =>
  name.split('.').pop()?.toLowerCase() || ''

export interface FileValidationResult {
  ok: File[]
  rejected: { name: string; reason: string }[]
}

export const validateFiles = (
  files: File[],
  opts: { maxCount?: number; alreadySelected?: number } = {},
): FileValidationResult => {
  const maxCount = opts.maxCount ?? 10
  const already = opts.alreadySelected ?? 0
  const ok: File[] = []
  const rejected: { name: string; reason: string }[] = []
  let total = already

  for (const f of files) {
    if (ok.length + already >= maxCount) {
      rejected.push({ name: f.name, reason: `не более ${maxCount} файлов` })
      continue
    }
    const ext = extOf(f.name)
    if (!ALLOWED_UPLOAD_EXTS.includes(ext)) {
      rejected.push({ name: f.name, reason: `тип .${ext || '?'} не поддерживается` })
      continue
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      rejected.push({ name: f.name, reason: `больше ${MAX_UPLOAD_MB} МБ` })
      continue
    }
    if (f.size === 0) {
      rejected.push({ name: f.name, reason: 'пустой файл' })
      continue
    }
    // Дедуп по имени+размеру+дате: повторный drag-n-drop того же файла
    // раньше создавал двойную загрузку и дубли в file_urls.
    if (ok.some((x) => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified)) {
      continue
    }
    ok.push(f)
    total++
  }
  return { ok, rejected }
}
