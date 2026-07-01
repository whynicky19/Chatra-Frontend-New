import { ref } from 'vue'

export interface PreviewFile { url: string; name: string }

const previewFile = ref<PreviewFile | null>(null)

export const useFilePreview = () => {
  const openPreview = (url: string, name: string) => { previewFile.value = { url, name } }
  const closePreview = () => { previewFile.value = null }
  return { previewFile, openPreview, closePreview }
}

export const downloadFile = async (url: string, name: string) => {
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
    URL.revokeObjectURL(objectUrl)
  } catch {
    // Fallback: let the browser handle it directly (loses the friendly filename)
    window.open(url, '_blank')
  }
}
