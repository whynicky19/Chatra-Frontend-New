import { ref, nextTick, type Ref } from 'vue'
import { useUploadSvc } from '~/services/uploads'

export interface DocFile { url: string; name: string }
export type DocKind = 'image' | 'pdf' | 'docx' | 'office' | 'sheet' | 'text' | 'unsupported'

export const extOf = (name: string) => name.split('.').pop()?.toLowerCase().split('?')[0] || ''

export const kindOf = (name: string | undefined | null): DocKind => {
  const ext = extOf(name || '')
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (ext === 'docx') return 'docx'
  // .doc/.rtf — старые бинарные форматы без разумной клиентской библиотеки,
  // .ppt/.pptx — презентации: все конвертируются в PDF на бэкенде (LibreOffice).
  if (['ppt', 'pptx', 'doc', 'rtf'].includes(ext)) return 'office'
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'sheet'
  if (['txt', 'md'].includes(ext)) return 'text'
  return 'unsupported'
}

// docx-preview рисует вставленные картинки как <div style="width:...pt;height:...pt">
// с <img> внутри, а обрезку (Word crop) — через clip-path (в %) + transform:scale()
// на самом img (числа завязаны именно на исходный px-размер img). Поэтому просто
// задавить img через max-width/height:auto нельзя — сломает пропорции/обрезку.
// Вместо этого при переполнении экрана пропорционально уменьшаем width/height
// у div-обёртки И у img внутри на один и тот же коэффициент — clip-path (в %)
// и transform:scale() остаются валидны, картинка просто становится меньше целиком.
export const fitDocxDrawings = (container: HTMLElement) => {
  const cs = getComputedStyle(container)
  const available = container.clientWidth - parseFloat(cs.paddingLeft || '0') - parseFloat(cs.paddingRight || '0')
  if (!available) return
  container.querySelectorAll<HTMLDivElement>('div[style*="display: inline-block"]').forEach(wrap => {
    const rect = wrap.getBoundingClientRect()
    if (rect.width <= available) return
    const scale = available / rect.width
    const scaleProp = (el: HTMLElement, prop: 'width' | 'height' | 'left' | 'top') => {
      const raw = parseFloat(el.style[prop])
      if (!isNaN(raw)) el.style[prop] = `${raw * scale}pt`
    }
    scaleProp(wrap, 'width')
    scaleProp(wrap, 'height')
    wrap.querySelectorAll<HTMLImageElement>('img').forEach(img => {
      scaleProp(img, 'width')
      scaleProp(img, 'height')
      scaleProp(img, 'left')
      scaleProp(img, 'top')
    })
  })
}

export function useDocumentLoader() {
  const uploadSvc = useUploadSvc()

  const loading = ref(false)
  const errorMsg = ref('')
  const docxContainer = ref<HTMLElement | null>(null)
  const sheetHtml = ref('')
  const textContent = ref('')
  const convertedPdfUrl = ref('')
  // Токен загрузки: быстрое переключение между двумя файлами раньше давало
  // гонку — медленный ответ первого затирал sheetHtml/textContent/docxContainer
  // второго. Устаревший ответ просто отбрасывается.
  let loadSeq = 0

  const load = async (file: DocFile | null | undefined) => {
    const seq = ++loadSeq
    errorMsg.value = ''
    sheetHtml.value = ''
    textContent.value = ''
    convertedPdfUrl.value = ''
    if (!file) return
    const k = kindOf(file.name)
    if (k === 'image' || k === 'pdf' || k === 'unsupported') return

    if (k === 'office') {
      loading.value = true
      try {
        const { pdf_url } = await uploadSvc.previewPdf(file.url)
        if (seq !== loadSeq) return
        convertedPdfUrl.value = pdf_url
      } catch {
        if (seq !== loadSeq) return
        errorMsg.value = 'Не удалось подготовить предпросмотр документа'
      } finally {
        if (seq === loadSeq) loading.value = false
      }
      return
    }

    loading.value = true
    try {
      // no-store: без него повторный предпросмотр ТОГО ЖЕ файла в рамках одной
      // загрузки страницы (тот же подписанный URL, сервер отдаёт ETag от R2)
      // иногда ловит условный 304 Not Modified с пустым телом — fetch() не
      // подставляет закэшированный body сам, поэтому парсинг падал на "пустом" файле.
      const res = await fetch(file.url, { cache: 'no-store' })
      if (seq !== loadSeq) return
      if (!res.ok) throw new Error('fetch failed')

      if (k === 'docx') {
        const blob = await res.blob()
        await nextTick()
        if (seq !== loadSeq) return
        if (docxContainer.value) {
          docxContainer.value.innerHTML = ''
          const { renderAsync } = await import('docx-preview')
          const isMobile = window.innerWidth <= 768
          await renderAsync(blob, docxContainer.value, undefined, { className: 'docx-view', inWrapper: false, ignoreWidth: isMobile, ignoreHeight: isMobile })
          // docx-preview рендерит содержимое документа императивно и без
          // санитизации (в отличие от xlsx-ветки ниже) — прогоняем результат
          // через DOMPurify, чтобы вредоносный .docx не внедрил скрипт.
          try {
            const { default: DOMPurify } = await import('dompurify')
            const sanitized = DOMPurify.sanitize(docxContainer.value.innerHTML, { ADD_ATTR: ['style'] })
            docxContainer.value.innerHTML = sanitized
          } catch {}
          if (seq !== loadSeq) return
          if (isMobile) {
            loading.value = false
            await nextTick()
            fitDocxDrawings(docxContainer.value)
          }
        }
      } else if (k === 'sheet') {
        const buf = await res.arrayBuffer()
        if (seq !== loadSeq) return
        const XLSX = await import('xlsx')
        const wb = XLSX.read(buf, { type: 'array' })
        const sheetName = wb.SheetNames[0]
        const sheet = wb.Sheets[sheetName]
        const { default: DOMPurify } = await import('dompurify')
        const html = DOMPurify.sanitize(XLSX.utils.sheet_to_html(sheet, { editable: false }))
        if (seq !== loadSeq) return
        sheetHtml.value = html
      } else if (k === 'text') {
        const text = await res.text()
        if (seq !== loadSeq) return
        textContent.value = text
      }
    } catch {
      if (seq !== loadSeq) return
      errorMsg.value = 'Не удалось загрузить предпросмотр файла'
    } finally {
      if (seq === loadSeq) loading.value = false
    }
  }

  return { loading, errorMsg, docxContainer, sheetHtml, textContent, convertedPdfUrl, load }
}
