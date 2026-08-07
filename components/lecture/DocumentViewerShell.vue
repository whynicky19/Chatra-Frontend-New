<template>
  <div class="dvs" :class="mode" ref="rootEl">
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

      <PdfPageViewer v-else-if="isPaged && pdfDoc" :doc="pdfDoc" :page="page" :zoom="zoom" />

      <img v-else-if="kind === 'image'" :src="file?.url" class="dvs-image" :alt="file?.name" @error="onImgError" />

      <div v-else-if="kind === 'sheet'" class="dvs-sheet" v-html="sheetHtml"></div>

      <pre v-else-if="kind === 'text'" class="dvs-text">{{ textContent }}</pre>

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
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { downloadFile } from '~/composables/useFilePreview'
import { useDocumentLoader, kindOf } from '~/composables/useDocumentLoader'
import { useFullscreen } from '~/composables/useFullscreen'
import { loadPdfjs } from '~/composables/usePdfjs'

const props = defineProps<{ file: { url: string; name: string } | null; mode: 'panel' | 'fullpage' }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { t } = useI18n()
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

const loadPdfDoc = async (url: string) => {
  pdfLoading.value = true
  try {
    const pdfjsLib = await loadPdfjs()
    const doc = await pdfjsLib.getDocument({ url }).promise
    pdfDoc.value = doc
    pageCount.value = doc.numPages
    page.value = 1
  } catch {
    errorMsg.value = 'Не удалось загрузить предпросмотр файла'
  } finally {
    pdfLoading.value = false
  }
}

watch(() => props.file?.url, async (url) => {
  pdfDoc.value = null
  pageCount.value = 0
  page.value = 1
  zoom.value = 1
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

const onKeydown = (e: KeyboardEvent) => {
  const active = document.activeElement
  if (active && ['INPUT', 'TEXTAREA'].includes(active.tagName)) return
  if ((active as HTMLElement)?.isContentEditable) return

  if (e.key === 'Escape') { if (document.fullscreenElement) document.exitFullscreen(); else emit('close'); return }
  if (isPaged.value) {
    if (e.key === 'ArrowLeft' || (e.key === ' ' && e.shiftKey)) { e.preventDefault(); prevPage(); return }
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextPage(); return }
  }
  if (e.key === '+' || e.key === '=') { zoomIn(); return }
  if (e.key === '-') { zoomOut(); return }
  if (e.key === '0') { zoomReset(); return }
  if (e.key === 'f' || e.key === 'F') { toggleFullscreen(); return }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.dvs { display: flex; flex-direction: column; height: 100%; background: var(--surface); overflow: hidden; }
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

.dvs-body { flex: 1; overflow: auto; background: var(--bg); display: flex; }
.dvs-state { margin: auto; display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 60px 20px; }
.dvs-error-text { font-size: 13px; color: var(--text4); text-align: center; max-width: 340px; }
.dvs-image { max-width: 100%; max-height: 100%; margin: auto; object-fit: contain; }
.dvs-docx { flex: 1; width: 100%; padding: 32px; background: #fff; overflow: auto; }
.dvs-sheet { width: 100%; padding: 20px; overflow: auto; }
.dvs-sheet :deep(table) { border-collapse: collapse; font-size: 13px; }
.dvs-sheet :deep(td), .dvs-sheet :deep(th) { border: 1px solid var(--border); padding: 4px 8px; white-space: nowrap; }
.dvs-text { width: 100%; padding: 24px; font-size: 13px; line-height: 1.6; color: var(--text1); white-space: pre-wrap; word-break: break-word; font-family: inherit; }

.dvs-strip { flex-shrink: 0; border-top: 1px solid var(--border); background: var(--surface); }

.dvs :deep(.immersive-fallback) { position: fixed; inset: 0; z-index: 2000; border-radius: 0; }

@media (max-width: 768px) {
  .dvs-docx :deep(section) { padding: 16px !important; }
  .dvs-docx :deep(table) { max-width: 100%; table-layout: fixed; word-break: break-word; }
  .dvs-docx { padding: 12px; }
}
</style>
