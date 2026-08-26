<template>
  <div class="dvs" :class="mode" ref="rootEl" @pointerup="onContentPointerUp">
    <div class="dvs-toolbar">
      <button class="dvs-btn dvs-back" @click="$emit('close')" :title="t('general.back')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="dvs-title truncate">{{ file?.name }}</div>
      <div class="dvs-controls">
        <template v-if="isPaged && pdfDoc">
          <button class="dvs-btn" @click="zoomOut" :title="t('lecture.zoom_out')">−</button>
          <span class="dvs-zoom-val">{{ Math.round(zoom * 100) }}%</span>
          <button class="dvs-btn" @click="zoomIn" :title="t('lecture.zoom_in')">+</button>
          <span class="dvs-page-counter">{{ page }} / {{ pageCount }}</span>
        </template>
        <button v-if="context" class="dvs-btn dvs-hl-btn" :class="{ active: showPanel }" @click="showPanel = !showPanel" :title="t('hl.section')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19h16"/><path d="M8.5 15.5l-3.5.9.9-3.5L15.6 3.2a1.9 1.9 0 012.7 2.7L8.5 15.5z"/></svg>
          <span v-if="fileHighlights.length" class="dvs-hl-count">{{ fileHighlights.length }}</span>
        </button>
        <button class="dvs-btn" @click="toggleFullscreen" :title="t('lecture.fullscreen')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>
        </button>
        <button class="dvs-btn" @click="download" :title="t('lecture.download')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
      </div>
    </div>

    <!-- Контейнер docx смонтирован ВСЕГДА (не внутри v-if/v-else-if цепочки),
         см. пояснение в useDocumentLoader/FilePreviewModal.vue — renderAsync
         пишет в DOM императивно ещё до того, как loading становится false. -->
    <div v-show="kind === 'docx' && !isLoading && !errorMsg" ref="docxContainer" class="dvs-docx"></div>

    <div class="dvs-body" v-if="kind !== 'docx' || isLoading || errorMsg">
      <div v-if="isLoading" class="dvs-state">
        <div class="spinner" style="width:26px;height:26px;border-width:3px"></div>
      </div>

      <div v-else-if="errorMsg" class="dvs-state dvs-error">
        <div class="dvs-error-text">{{ errorMsg }}</div>
        <button class="btn btn-teal btn-sm" @click="download">{{ t('lecture.download') }}</button>
      </div>

      <PdfPageViewer v-else-if="isPaged && pdfDoc" :doc="pdfDoc" :page="page" :zoom="zoom" @text-layer="onTextLayer" />

      <div v-else-if="kind === 'image'" class="dvs-image-wrap">
        <img :src="file?.url" class="dvs-image" :alt="file?.name" @error="onImgError" />
      </div>

      <div v-else-if="kind === 'sheet'" ref="sheetEl" class="dvs-sheet" v-html="sheetHtml"></div>

      <pre v-else-if="kind === 'text'" ref="textEl" class="dvs-text">{{ textContent }}</pre>

      <div v-else class="dvs-state dvs-error">
        <div class="dvs-error-text">{{ t('lecture.unsupported') }}</div>
        <button class="btn btn-teal btn-sm" @click="download">{{ t('lecture.download') }}</button>
      </div>
    </div>

    <PdfThumbnailStrip
      v-if="isPaged && pdfDoc && pageCount > 1"
      :doc="pdfDoc"
      :page-count="pageCount"
      :current-page="page"
      @select="p => page = p"
      class="dvs-strip"
    />

    <HighlightMenu
      v-if="menu.visible"
      :x="menu.x"
      :y="menu.y"
      :below="menu.below"
      :color="activeHighlight?.color || null"
      :note="activeHighlight?.comment || ''"
      :saved="!!activeId"
      :note-open="noteOpen"
      @pick-color="pickColor"
      @open-note="openNote"
      @close-note="closeMenu"
      @save-note="saveNote"
      @ask-ai="askAi"
      @copy="copySelection"
      @remove="removeActive"
    />

    <Transition name="dvs-panel">
      <div v-if="showPanel && context" class="dvs-hl-panel">
        <div class="dvs-hl-head">
          <span class="dvs-hl-title">{{ t('hl.section') }}</span>
          <button class="dvs-btn" @click="showPanel = false" :title="t('general.cancel')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="dvs-hl-body">
          <HighlightsPanel :items="fileHighlights" hide-header @go="onPanelGo" @note="onPanelNote" @remove="removeHighlight" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from '#app'
import { useI18n } from '~/composables/useI18n'
import { useToast } from '~/composables/useToast'
import { downloadFile } from '~/composables/useFilePreview'
import { useDocumentLoader, kindOf } from '~/composables/useDocumentLoader'
import { useFullscreen } from '~/composables/useFullscreen'
import { loadPdfjs } from '~/composables/usePdfjs'
import { useHighlights, type Highlight, type HighlightColor, type HighlightContext } from '~/composables/useHighlights'
import { serializeRange, paintHighlights, clearMarks, MARK_CLASS, type SerializedRange } from '~/composables/useTextHighlighter'
import { queueAiMessage, buildQuotePrompt } from '~/composables/useAiHandoff'

const props = defineProps<{
  file: { url: string; name: string } | null
  mode: 'panel' | 'fullpage'
  /** Без контекста лекции выделения выключены — просмотрщик остаётся обычным. */
  context?: HighlightContext | null
}>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { t, lang } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const rootEl = ref<HTMLElement | null>(null)
const { toggleFullscreen } = useFullscreen(rootEl)

const { loading, errorMsg, docxContainer, sheetHtml, textContent, convertedPdfUrl, load } = useDocumentLoader()

const kind = computed(() => kindOf(props.file?.name))
const isPaged = computed(() => kind.value === 'pdf' || kind.value === 'office')

// shallowRef — PDFDocumentProxy использует нативные приватные (#) поля класса;
// глубокая Vue-реактивность (обычный ref) заворачивает объект в Proxy, и вызовы
// его методов изнутри (this.#privateField) начинают падать через этот Proxy.
const pdfDoc = shallowRef<any>(null)
const pdfLoading = ref(false)
const page = ref(1)
const pageCount = ref(0)
const zoom = ref(1)

const isLoading = computed(() => loading.value || pdfLoading.value)

/* ── Состояние выделений ───────────────────────────────────────────────── */

const highlights = useHighlights()
const sheetEl = ref<HTMLElement | null>(null)
const textEl = ref<HTMLElement | null>(null)
// Поверхность — то, внутри чего живёт текст: страница PDF (текстовый слой),
// контейнер docx, таблица или plain text. Смещения выделения считаются
// относительно неё.
const surfaceEl = ref<HTMLElement | null>(null)
const showPanel = ref(false)
const menu = ref({ visible: false, x: 0, y: 0, below: false })
const pending = ref<SerializedRange | null>(null)
const activeId = ref<number | null>(null)
const noteOpen = ref(false)
const lastColor = ref<HighlightColor>('yellow')

const closeMenu = () => {
  menu.value = { ...menu.value, visible: false }
  pending.value = null
  activeId.value = null
  noteOpen.value = false
}

// Стартовый масштаб — по ширине панели: страница A4 шире телефона и узкой
// второй колонки, и на 100% её края уходили бы за экран.
const fitPdfZoom = async (doc: any) => {
  const body = rootEl.value?.querySelector('.dvs-body') as HTMLElement | null
  if (!body) return
  const padding = window.innerWidth <= 768 ? 24 : 48
  const first = await doc.getPage(1)
  const width = first.getViewport({ scale: 1 }).width
  const available = body.clientWidth - padding
  if (width > 0 && available > 0) zoom.value = Math.min(1, +(available / width).toFixed(2))
}

// Токен загрузки PDF: повторный watch при быстрой смене файла запускал
// параллельные getDocument — поздний resolve устаревшего документа затирал
// pdfDoc свежего. Устаревший результат отбрасывается, а его документ
// уничтожается (иначе pdfjs держит worker-ресурсы за каждый файл).
let pdfLoadSeq = 0

const destroyPdfDoc = () => {
  if (pdfDoc.value) {
    try { pdfDoc.value.destroy() } catch {}
    pdfDoc.value = null
  }
}

const loadPdfDoc = async (url: string) => {
  const seq = ++pdfLoadSeq
  pdfLoading.value = true
  try {
    const pdfjsLib = await loadPdfjs()
    const doc = await pdfjsLib.getDocument({ url }).promise
    if (seq !== pdfLoadSeq) {
      try { doc.destroy() } catch {}
      return
    }
    destroyPdfDoc()
    pdfDoc.value = doc
    pageCount.value = doc.numPages
    page.value = 1
    await nextTick()
    if (seq !== pdfLoadSeq) return
    await fitPdfZoom(doc)
  } catch {
    if (seq === pdfLoadSeq) errorMsg.value = 'Не удалось загрузить предпросмотр файла'
  } finally {
    if (seq === pdfLoadSeq) pdfLoading.value = false
  }
}

watch(() => props.file?.url, async (url) => {
  // Инвалидируем токен ДО уничтожения: параллельная загрузка увидит смену и не перезапишет.
  pdfLoadSeq++
  destroyPdfDoc()
  pageCount.value = 0
  page.value = 1
  zoom.value = 1
  closeMenu()
  surfaceEl.value = null
  if (!url) return
  if (kind.value === 'pdf') {
    await loadPdfDoc(url)
  } else {
    await load(props.file)
  }
}, { immediate: true })

// office (ppt/doc/rtf) идёт двухэтапно: useDocumentLoader сначала просит бэкенд
// сконвертировать файл в PDF, а уже полученный convertedPdfUrl мы догружаем в pdfjs.
watch(convertedPdfUrl, (url) => { if (url) loadPdfDoc(url) })

const zoomIn = () => { zoom.value = Math.min(3, +(zoom.value + 0.25).toFixed(2)) }
const zoomOut = () => { zoom.value = Math.max(0.5, +(zoom.value - 0.25).toFixed(2)) }
const zoomReset = () => { zoom.value = 1 }
const prevPage = () => { if (page.value > 1) page.value-- }
const nextPage = () => { if (page.value < pageCount.value) page.value++ }

const onImgError = () => { errorMsg.value = 'Не удалось загрузить предпросмотр файла' }
const download = () => { if (props.file) downloadFile(props.file.url, props.file.name) }

/* ── Выделения ─────────────────────────────────────────────────────────── */

const surfaceKey = computed(() => (isPaged.value ? page.value : 0))

const fileHighlights = computed<Highlight[]>(() => {
  const ctx = props.context
  if (!ctx) return []
  return highlights.items.value
    .filter(h => h.class_id === ctx.classId && h.lecture_id === ctx.lectureId && h.file_index === ctx.fileIndex)
    .sort((a, b) => a.page - b.page || a.start_offset - b.start_offset)
})

// Номер страницы — свойство пагинации КОНКРЕТНОГО клиента, а не документа:
// docx приложение открывает как PDF (бэкенд конвертирует его в LibreOffice) и
// пишет странице номер 1..N, а здесь тот же docx рисует docx-preview — одна
// сплошная поверхность без страниц (page = 0). Поэтому страница — только
// подсказка «где искать», а не условие: на непагинированной поверхности
// показываем все пометки файла, а на страничной — ещё и те, у которых страница
// неизвестна. Настоящий отбор делает поиск по тексту с якорем (restoreRange):
// не нашлось — пометка просто не рисуется.
const surfaceHighlights = computed(() =>
  isPaged.value
    ? fileHighlights.value.filter(h => h.page === surfaceKey.value || h.page === 0)
    : fileHighlights.value,
)

const onTextLayer = (el: HTMLElement | null) => { surfaceEl.value = props.context ? el : null }

// Не-страничные документы рисуются один раз — поверхность берём, как только
// контент оказался в DOM. Перерисовку зовём явно: элемент-контейнер тот же
// самый (меняется только его содержимое), и watch по ссылке молчал бы.
watch([isLoading, kind, () => props.file?.url], () => {
  if (!props.context || isPaged.value) return
  nextTick(() => {
    surfaceEl.value = kind.value === 'docx' ? docxContainer.value
      : kind.value === 'sheet' ? sheetEl.value
      : kind.value === 'text' ? textEl.value
      : null
    fitDocxPage()
    repaint()
  })
}, { immediate: true })

// Лист Word шире панели просмотра (A4 при узкой второй колонке) — ужимаем его
// целиком, а не режем по краю: zoom меняет саму раскладку, поэтому документ
// остаётся по центру и полностью читаемым, а выделения остаются на своих
// местах (в отличие от transform, который оставил бы пустую полосу справа).
const fitDocxPage = () => {
  const box = docxContainer.value
  if (!box || kind.value !== 'docx') return
  box.style.zoom = ''
  const sheet = box.querySelector('section') as HTMLElement | null
  if (!sheet) return
  const cs = getComputedStyle(box)
  const available = box.clientWidth - parseFloat(cs.paddingLeft || '0') - parseFloat(cs.paddingRight || '0')
  const width = sheet.getBoundingClientRect().width
  if (width > available && available > 0) box.style.zoom = String(Math.max(0.4, available / width))
}

const repaint = () => {
  const root = surfaceEl.value
  if (!root) return
  paintHighlights(root, surfaceHighlights.value)
}
watch([surfaceEl, surfaceHighlights], () => nextTick(repaint))

/* ── Плавающее меню ────────────────────────────────────────────────────── */

const activeHighlight = computed(() => (activeId.value ? highlights.byId(activeId.value) : null))

const showMenuAt = (rect: DOMRect) => {
  const root = rootEl.value
  if (!root) return
  const box = root.getBoundingClientRect()
  const below = rect.top - box.top < 92
  const x = Math.min(Math.max(rect.left + rect.width / 2 - box.left, 150), Math.max(150, box.width - 150))
  const y = (below ? rect.bottom : rect.top) - box.top
  menu.value = { visible: true, x, y, below }
}

const selectedText = () => pending.value?.text || activeHighlight.value?.selected_text || ''

const evaluateSelection = () => {
  const root = surfaceEl.value
  const sel = window.getSelection()
  if (!root || !sel || sel.isCollapsed || !sel.rangeCount) return false
  const range = sel.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer)) return false
  const ser = serializeRange(root, range, sel.toString())
  if (!ser || !ser.text.trim()) return false
  pending.value = ser
  activeId.value = null
  noteOpen.value = false
  showMenuAt(range.getBoundingClientRect())
  return true
}

const openExisting = (markEl: HTMLElement) => {
  const id = Number(markEl.dataset.hlId)
  if (!id || !highlights.byId(id)) return false
  pending.value = null
  activeId.value = id
  noteOpen.value = false
  showMenuAt(markEl.getBoundingClientRect())
  return true
}

const onContentPointerUp = (e: PointerEvent) => {
  if (!props.context) return
  const target = e.target as HTMLElement | null
  if (target?.closest('.hm, .dvs-hl-panel, .dvs-toolbar')) return
  const markEl = target?.closest?.(`.${MARK_CLASS}`) as HTMLElement | null
  // Выделение доступно только после того, как браузер его зафиксирует.
  setTimeout(() => {
    if (evaluateSelection()) return
    if (markEl && openExisting(markEl)) return
    closeMenu()
  }, 0)
}

// Длинный тап на мобильном выделяет текст уже после pointerup — ловим сам факт
// изменения выделения, но только открываем меню (закрытие остаётся за тапом).
let selTimer: ReturnType<typeof setTimeout> | null = null
const onSelectionChange = () => {
  if (!props.context || noteOpen.value) return
  if (selTimer) clearTimeout(selTimer)
  selTimer = setTimeout(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.rangeCount) return
    evaluateSelection()
  }, 220)
}

const createFromPending = async (color: HighlightColor): Promise<Highlight | null> => {
  const ctx = props.context
  const sel = pending.value
  if (!ctx || !sel) return null
  pending.value = null
  window.getSelection()?.removeAllRanges()
  const created = await highlights.add({
    lecture_id: ctx.lectureId,
    class_id: ctx.classId,
    file_index: ctx.fileIndex,
    page: surfaceKey.value,
    selected_text: sel.text,
    prefix: sel.prefix,
    suffix: sel.suffix,
    start_offset: sel.start,
    end_offset: sel.end,
    color,
  })
  if (!created) {
    toast.err(t('hl.save_failed'))
    return null
  }
  activeId.value = created.id
  return created
}

// Цвет не закрывает меню: цвет и заметка — части одного действия, и раньше
// после выбора цвета фрагмент приходилось выделять заново, чтобы дописать
// комментарий. Меню остаётся на месте, но уже на созданной пометке — закрыть
// его можно тапом мимо или Esc.
const pickColor = async (color: HighlightColor) => {
  lastColor.value = color
  if (activeId.value) {
    highlights.update(activeId.value, { color })
    return
  }
  await createFromPending(color)
}

const openNote = async () => {
  if (!activeId.value && !(await createFromPending(lastColor.value))) return
  noteOpen.value = true
}

const saveNote = (text: string) => {
  if (activeId.value) highlights.update(activeId.value, { comment: text })
  closeMenu()
}

const removeActive = () => {
  if (activeId.value) removeHighlight(highlights.byId(activeId.value)!)
  closeMenu()
}

const removeHighlight = (h: Highlight) => {
  if (!h) return
  highlights.remove(h.id)
  if (activeId.value === h.id) closeMenu()
}

const copySelection = () => {
  const text = selectedText().trim()
  if (!text) return
  navigator.clipboard?.writeText(text).then(() => toast.ok(t('hl.copied'))).catch(() => {})
  closeMenu()
}

// Отдельного ИИ-интерфейса в просмотрщике нет: фрагмент уходит в тот же чат
// класса, что и обычные вопросы на вкладке «ИИ».
const askAi = () => {
  const ctx = props.context
  const saved = activeHighlight.value
  const text = selectedText().trim()
  if (!ctx || !text) return
  const srcPage = saved ? saved.page : (isPaged.value ? page.value : 0)
  queueAiMessage({
    classId: ctx.classId,
    text: buildQuotePrompt({
      lang: lang.value,
      text,
      lectureTitle: ctx.lectureTitle,
      page: srcPage,
    }),
    // Сервер по этим полям сам определит лекцию и страницу — они и попадут в
    // контекст ответа (см. routers/ai.py:_fragment_context).
    annotationId: saved?.id ?? null,
    lectureId: ctx.lectureId,
    page: srcPage,
    quote: saved ? null : text,
  })
  closeMenu()
  window.getSelection()?.removeAllRanges()
  router.push(`/classes/${ctx.classId}?tab=ai`)
}

/* ── Переход к сохранённому выделению ──────────────────────────────────── */

const findMark = (id: string) => rootEl.value?.querySelector<HTMLElement>(`[data-hl-id="${id}"]`) || null

const waitUntil = async (cond: () => boolean, tries = 50): Promise<boolean> => {
  for (let i = 0; i < tries; i++) {
    if (cond()) return true
    await new Promise(r => setTimeout(r, 100))
  }
  return false
}

const jumpTo = async (h: Highlight, openNoteAfter = false) => {
  if (!props.context || h.file_index !== props.context.fileIndex) return
  if (isPaged.value) {
    // Переход может прийти вместе с открытием файла: пока документ грузится,
    // loadPdfDoc всё равно сбросит страницу на первую.
    if (!(await waitUntil(() => !!pdfDoc.value))) return
    if (h.page && page.value !== h.page) page.value = h.page
  }
  await nextTick()
  await waitUntil(() => !!findMark(h.id))
  const el = findMark(h.id)
  if (!el) return
  el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  el.classList.add('hl-flash')
  setTimeout(() => el.classList.remove('hl-flash'), 1400)
  if (openNoteAfter) {
    activeId.value = h.id
    pending.value = null
    noteOpen.value = true
    showMenuAt(el.getBoundingClientRect())
  }
}

const onPanelGo = (h: Highlight) => { showPanel.value = false; jumpTo(h) }
const onPanelNote = (h: Highlight) => { showPanel.value = false; jumpTo(h, true) }

// Переход из списка выделений лекции: ?hl=<id> (&note=1 — сразу открыть заметку).
watch(() => [route.query.hl, route.query.note, props.file?.url], async () => {
  const id = Number(route.query.hl)
  if (!id || !props.context) return
  // id выделения теперь серверный (число), а в query он строкой.
  const h = highlights.byId(id)
  if (!h || h.file_index !== props.context.fileIndex) return
  const wantNote = route.query.note === '1'
  router.replace({ query: {} })
  await jumpTo(h, wantNote)
}, { immediate: true })

const onKeydown = (e: KeyboardEvent) => {
  const active = document.activeElement
  if (active && ['INPUT', 'TEXTAREA'].includes(active.tagName)) return
  if ((active as HTMLElement)?.isContentEditable) return

  if (e.key === 'Escape') {
    if (menu.value.visible) { closeMenu(); return }
    if (showPanel.value) { showPanel.value = false; return }
    if (document.fullscreenElement) document.exitFullscreen(); else emit('close')
    return
  }
  if (isPaged.value) {
    if (e.key === 'ArrowLeft' || (e.key === ' ' && e.shiftKey)) { e.preventDefault(); prevPage(); return }
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextPage(); return }
  }
  if (e.key === '+' || e.key === '=') { zoomIn(); return }
  if (e.key === '-') { zoomOut(); return }
  if (e.key === '0') { zoomReset(); return }
  if (e.key === 'f' || e.key === 'F') { toggleFullscreen(); return }
}

// Меню привязано к координатам внутри просмотрщика — при прокрутке оно
// оторвалось бы от текста, поэтому просто закрываем его.
const onScrollCapture = () => { if (menu.value.visible && !noteOpen.value) closeMenu() }

let resizeTimer: ReturnType<typeof setTimeout> | null = null
const onResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(fitDocxPage, 150)
}

onMounted(() => {
  // Серверная истина: пометки, сделанные в приложении, должны появиться здесь.
  if (props.context) highlights.load({ lectureId: props.context.lectureId })
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onResize)
  document.addEventListener('selectionchange', onSelectionChange)
  rootEl.value?.addEventListener('scroll', onScrollCapture, true)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('selectionchange', onSelectionChange)
  rootEl.value?.removeEventListener('scroll', onScrollCapture, true)
  if (resizeTimer) clearTimeout(resizeTimer)
  if (selTimer) clearTimeout(selTimer)
  // pdfjs-документы держат worker-ресурсы: без destroy() каждый открытый
  // PDF утекал до конца жизни страницы.
  pdfLoadSeq++
  destroyPdfDoc()
  if (surfaceEl.value) clearMarks(surfaceEl.value)
})
</script>

<style scoped>
.dvs { position: relative; display: flex; flex-direction: column; height: 100%; background: var(--surface); overflow: hidden; }
.dvs.panel { border-radius: var(--r-xl); border: 1px solid var(--border); box-shadow: var(--sh-md); }
.dvs.fullpage { border-radius: 0; }

.dvs-toolbar {
  display: flex; align-items: center; gap: 10px; padding: 12px 16px; flex-shrink: 0;
  border-bottom: 1px solid var(--border); background: var(--surface);
  backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%);
}
.dvs-title { flex: 1; min-width: 0; font-size: 13px; font-weight: 700; color: var(--text1); }
.dvs-controls { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.dvs-btn {
  display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;
  border-radius: var(--r-sm); border: none; background: transparent; color: var(--text2);
  cursor: pointer; font-size: 16px; font-weight: 600; transition: background .15s;
}
.dvs-btn:hover { background: var(--surface2); color: var(--text1); }
.dvs-zoom-val { font-size: 12px; color: var(--text4); min-width: 36px; text-align: center; font-variant-numeric: tabular-nums; }
.dvs-page-counter { font-size: 12px; color: var(--text4); margin-left: 8px; padding-left: 10px; border-left: 1px solid var(--border); font-variant-numeric: tabular-nums; }

.dvs-hl-btn { position: relative; }
.dvs-hl-btn.active { background: var(--teal-l); color: var(--teal); }
.dvs-hl-count {
  position: absolute; top: -1px; right: -2px; min-width: 14px; height: 14px; padding: 0 3px;
  border-radius: 7px; background: var(--teal); color: #fff; font-size: 9px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--surface);
}

.dvs-body { flex: 1; overflow: auto; background: var(--bg); display: flex; }
.dvs-state { margin: auto; display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 60px 20px; }
.dvs-error-text { font-size: 13px; color: var(--text4); text-align: center; max-width: 340px; }

/* Каждый тип контента центрируется своим способом, но по одному принципу:
   пока документ уже окна — он стоит посередине, когда шире — контейнер
   растёт вместе с ним и ничего не срезается по краям. */
.dvs-image-wrap { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; padding: 24px; }
.dvs-image { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: var(--r-sm); box-shadow: var(--sh-md); }

.dvs-docx { flex: 1; width: 100%; padding: 32px; background: #fff; overflow: auto; }
.dvs-docx > :deep(*) { margin-left: auto; margin-right: auto; }

.dvs-sheet { width: 100%; padding: 20px; overflow: auto; }
.dvs-sheet :deep(table) { border-collapse: collapse; font-size: 13px; margin: 0 auto; }
.dvs-sheet :deep(td), .dvs-sheet :deep(th) { border: 1px solid var(--border); padding: 4px 8px; white-space: nowrap; }

.dvs-text {
  width: 100%; max-width: 860px; margin: 0 auto; padding: 24px;
  font-size: 13px; line-height: 1.6; color: var(--text1);
  white-space: pre-wrap; word-break: break-word; font-family: inherit;
}

.dvs-strip { flex-shrink: 0; border-top: 1px solid var(--border); background: var(--surface); }

.dvs :deep(.immersive-fallback) { position: fixed; inset: 0; z-index: 2000; border-radius: 0; }

/* Пометки живут внутри контента, созданного императивно (pdf.js, docx-preview),
   поэтому правила глубокие. Тона совпадают с кружками в меню и кромками в
   списке «Мои выделения». */
.dvs :deep(.hl-mark) {
  background-color: transparent; color: inherit; padding: 0; border-radius: 3px;
  cursor: pointer; transition: filter .15s ease-out;
}
.dvs :deep(.hl-mark.hl-yellow) { background-color: rgba(255, 216, 77, .45); }
.dvs :deep(.hl-mark.hl-green) { background-color: rgba(123, 220, 160, .45); }
.dvs :deep(.hl-mark.hl-blue) { background-color: rgba(124, 197, 245, .45); }
.dvs :deep(.hl-mark.hl-red) { background-color: rgba(255, 154, 154, .45); }
.dvs :deep(.hl-mark[data-hl-note]) { box-shadow: inset 0 -2px 0 rgba(0,0,0,.22); }
.dvs :deep(.hl-mark:hover) { filter: saturate(1.35) brightness(.97); }
.dvs :deep(.hl-mark.hl-flash) { animation: hl-flash 1.4s ease-out; }
@keyframes hl-flash {
  0%, 100% { box-shadow: 0 0 0 0 rgba(var(--teal-rgb), 0); }
  25% { box-shadow: 0 0 0 4px rgba(var(--teal-rgb), .35); }
}

.dvs-hl-panel {
  position: absolute; top: 55px; right: 12px; bottom: 12px; width: 320px; z-index: 30;
  display: flex; flex-direction: column;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-xl);
  box-shadow: 0 18px 44px rgba(0,0,0,.18); overflow: hidden;
}
.dvs-hl-head {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 12px 10px 12px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.dvs-hl-title { font-size: 13px; font-weight: 700; color: var(--text1); }
.dvs-hl-body { flex: 1; overflow-y: auto; padding: 12px; }

.dvs-panel-enter-active, .dvs-panel-leave-active { transition: opacity .2s ease-out, transform .2s cubic-bezier(.22,1,.36,1); }
.dvs-panel-enter-from, .dvs-panel-leave-to { opacity: 0; transform: translateX(12px); }

@media (max-width: 768px) {
  .dvs-docx :deep(section) { padding: 16px !important; }
  .dvs-docx :deep(table) { max-width: 100%; table-layout: fixed; word-break: break-word; }
  .dvs-docx { padding: 12px; }
  .dvs-image-wrap { padding: 12px; }
  .dvs-text { padding: 16px; }
  .dvs-hl-panel { top: 52px; left: 8px; right: 8px; bottom: 8px; width: auto; }
  .dvs-panel-enter-from, .dvs-panel-leave-to { transform: translateY(12px); }
}
@media (prefers-reduced-motion: reduce) {
  .dvs :deep(.hl-mark.hl-flash) { animation: none; }
  .dvs-panel-enter-active, .dvs-panel-leave-active { transition: none; }
}
</style>
