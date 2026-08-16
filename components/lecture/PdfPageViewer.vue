<template>
  <div class="ppv-wrap">
    <div class="ppv-page" :style="{ width: `${size.w}px`, height: `${size.h}px` }">
      <canvas ref="canvasEl" class="ppv-canvas"></canvas>
      <div ref="textEl" class="textLayer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { loadPdfjs } from '~/composables/usePdfjs'

const props = defineProps<{ doc: any; page: number; zoom: number }>()
// Текстовый слой отдаём наверх: по нему DocumentViewerShell рисует выделения
// (сам слой pdf.js пересобирает при каждом рендере страницы и зуме).
const emit = defineEmits<{ (e: 'text-layer', el: HTMLElement | null): void }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
const textEl = ref<HTMLElement | null>(null)
const size = ref({ w: 0, h: 0 })

let renderTask: any = null
let textLayer: any = null
let renderSeq = 0

const render = async () => {
  if (!props.doc || !canvasEl.value) return
  const seq = ++renderSeq

  const page = await props.doc.getPage(props.page)
  if (seq !== renderSeq) return

  const dpr = window.devicePixelRatio || 1
  // Разрешение канваса — под плотность экрана, геометрия страницы (и текстового
  // слоя поверх неё) — в CSS-пикселях: иначе слой не совпал бы с картинкой.
  const viewport = page.getViewport({ scale: props.zoom })
  const canvas = canvasEl.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Отменяем предыдущий незавершённый рендер (быстрое листание/зум) — иначе
  // pdf.js кидает InvalidStateError, пытаясь рисовать в canvas параллельно.
  if (renderTask) { try { renderTask.cancel() } catch {} }
  if (textLayer) { try { textLayer.cancel() } catch {} textLayer = null }

  const renderViewport = page.getViewport({ scale: props.zoom * dpr })
  size.value = { w: viewport.width, h: viewport.height }
  canvas.width = renderViewport.width
  canvas.height = renderViewport.height
  canvas.style.width = `${viewport.width}px`
  canvas.style.height = `${viewport.height}px`

  renderTask = page.render({ canvasContext: ctx, viewport: renderViewport })
  try {
    await renderTask.promise
  } catch (e: any) {
    if (e?.name !== 'RenderingCancelledException') throw e
    return
  }
  if (seq !== renderSeq) return

  await renderTextLayer(page, viewport, seq)
}

const renderTextLayer = async (page: any, viewport: any, seq: number) => {
  const container = textEl.value
  if (!container) return
  emit('text-layer', null)
  container.innerHTML = ''
  container.style.setProperty('--total-scale-factor', String(props.zoom))
  try {
    const pdfjsLib = await loadPdfjs()
    if (seq !== renderSeq) return
    const textContent = await page.getTextContent()
    if (seq !== renderSeq) return
    textLayer = new (pdfjsLib as any).TextLayer({ textContentSource: textContent, container, viewport })
    await textLayer.render()
    if (seq !== renderSeq) return
    emit('text-layer', container)
  } catch {
    // Без текстового слоя страница остаётся читаемой — просто нельзя выделять.
    emit('text-layer', null)
  }
}

watch(() => [props.doc, props.page, props.zoom], render)
// Первый рендер — именно из onMounted: до монтирования canvas ещё не создан,
// и immediate-watch уходил вхолостую (страница оставалась пустой до первой
// смены страницы или зума).
onMounted(render)
onBeforeUnmount(() => {
  renderSeq++
  if (renderTask) { try { renderTask.cancel() } catch {} }
  if (textLayer) { try { textLayer.cancel() } catch {} }
})
</script>

<style scoped>
/* width:max-content + min-width:100% — страница стоит по центру, пока помещается
   в окно, а на увеличенном зуме контейнер растёт вместе с ней. Одного
   justify-content:center мало: переросшая страница обрезалась бы слева
   (до её начала нельзя было бы доскроллить). */
.ppv-wrap {
  display: flex; justify-content: center; align-items: flex-start;
  width: max-content; min-width: 100%; min-height: 100%;
  padding: 24px; box-sizing: border-box;
}
.ppv-page { position: relative; flex-shrink: 0; }
.ppv-canvas { display: block; border-radius: var(--r-sm); box-shadow: var(--sh-md); background: #fff; }

/* Текстовый слой pdf.js: прозрачные строки поверх картинки страницы — они и
   дают выделение текста. Разметку создаёт сама библиотека, поэтому правила
   идут через :deep(). */
.textLayer {
  position: absolute; inset: 0; overflow: clip; opacity: 1; line-height: 1;
  text-align: initial; text-size-adjust: none; forced-color-adjust: none;
  transform-origin: 0 0; caret-color: CanvasText; z-index: 1;
  --min-font-size: 1;
  --text-scale-factor: calc(var(--total-scale-factor) * var(--min-font-size));
  --min-font-size-inv: calc(1 / var(--min-font-size));
}
.textLayer :deep(span), .textLayer :deep(br) {
  color: transparent; position: absolute; white-space: pre; cursor: text;
  transform-origin: 0% 0%; user-select: text;
}
.textLayer > :deep(:not(.markedContent)),
.textLayer :deep(.markedContent span:not(.markedContent)) {
  z-index: 1;
  --font-height: 0; --scale-x: 1; --rotate: 0deg;
  font-size: calc(var(--text-scale-factor) * var(--font-height));
  transform: rotate(var(--rotate)) scaleX(var(--scale-x)) scale(var(--min-font-size-inv));
}
.textLayer :deep(.markedContent) { display: contents; }
.textLayer :deep(span[role="img"]) { user-select: none; cursor: default; }

@media (max-width: 768px) {
  .ppv-wrap { padding: 12px; }
}
</style>
