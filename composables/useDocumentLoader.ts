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
  const containerAvail = container.clientWidth - parseFloat(cs.paddingLeft || '0') - parseFloat(cs.paddingRight || '0')
  if (!containerAvail) return
  // docx-preview оборачивает страницу в <section style="padding: 72pt 90pt"> --
  // это «поля страницы» Word (~1 дюйм сверху/снизу, ~1.25 по бокам), которые
  // сужают доступное место под контент. Без учёта этого отступа fitDocxDrawings
  // сравнивал бы ширину картинки с clientWidth модала, а картинка лежит внутри
  // section -- и всё равно уезжала за section-scroll, вылезая за пределы экрана.
  const section = container.querySelector<HTMLElement>('section')
  const sectCs = section ? getComputedStyle(section) : null
  const sectionAvail = section && sectCs
    ? section.clientWidth - parseFloat(sectCs.paddingLeft || '0') - parseFloat(sectCs.paddingRight || '0')
    : containerAvail
  container.querySelectorAll<HTMLDivElement>('div[style*="display: inline-block"]').forEach(wrap => {
    // Итеративное уменьшение: один проход может не довести до конца --
    // например, родительская section имеет padding 90pt, а картинка -- 720pt.
    // После scale = 576/720 картинка становится 576pt, но обёртка inline-block
    // могла чуть растянуться из-за вложенного img/clip-path, и второй проход
    // добьёт остаток. Обычно хватает 2-3 итераций.
    let safety = 4
    while (safety-- > 0) {
      const rect = wrap.getBoundingClientRect()
      if (rect.width <= sectionAvail) break
      const scale = sectionAvail / rect.width
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
    }
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
          // src добавляем в разрешённые атрибуты: docx-preview вставляет
          // встроенные картинки как <img src="blob:..."> через createObjectURL
          // (см. useFileUrl / previewPdf для тех же blob-URL), без него
          // картинки внутри .docx пропадают. blob: и data: разрешаем явно —
          // стандартный ALLOWED_URI_REGEXP в DOMPurify их режет, и тогда чистый
          // .docx с рисунком показывался без картинок (только текст).
          try {
            const { default: DOMPurify } = await import('dompurify')
            const sanitized = DOMPurify.sanitize(docxContainer.value.innerHTML, {
              ADD_ATTR: ['style', 'src'],
              ADD_URI_SAFE_ATTR: ['src'],
              ALLOWED_URI_REGEXP: /^(?:(?:https?|blob|data|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
            })
            docxContainer.value.innerHTML = sanitized
          } catch {}
          if (seq !== loadSeq) return
          // fitDocxDrawings прогоняем и на десктопе, не только на мобиле:
          // docx-preview рисует встроенные картинки с фиксированной шириной
          // в pt (Word-стиль), без этого шага широкая картинка уезжает за
          // пределы модала/экрана. Раньше здесь стоял `if (isMobile)`,
          // и на десктопе пользователь видел «картинка ушла вправо за экран».
          loading.value = false
          await nextTick()
          fitDocxDrawings(docxContainer.value)
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
