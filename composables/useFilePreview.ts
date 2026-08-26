import { ref } from 'vue'
import { fixFileUrlSafe } from '~/composables/useFileUrl'

export interface PreviewFile { url: string; name: string }

const previewFile = ref<PreviewFile | null>(null)

export const useFilePreview = () => {
  // URL нормализуем при открытии (fixFileUrlSafe): все последующие загрузки
  // внутри модалки предпросмотра (fetch/docx/xlsx/previewPdf/pdfjs) идут уже
  // по исправленному адресу, а не по сырому localhost из подписанной ссылки.
  const openPreview = (url: string, name: string) => { previewFile.value = { url: fixFileUrlSafe(url), name } }
  const closePreview = () => { previewFile.value = null }
  return { previewFile, openPreview, closePreview }
}

export const downloadFile = async (rawUrl: string, name: string) => {
  const url = fixFileUrlSafe(rawUrl)
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('download failed')
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    // Отложенный revoke: мгновенный отзыв objectURL сразу после click() в
    // части браузеров (Safari/iOS) обрывает ещё не начавшееся скачивание.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000)
  } catch {
    // Fallback: let the browser handle it directly (loses the friendly filename)
    window.open(url, '_blank')
  }
}
