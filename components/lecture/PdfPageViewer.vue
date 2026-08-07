<template>
  <div class="ppv-wrap">
    <canvas ref="canvasEl" class="ppv-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps<{ doc: any; page: number; zoom: number }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
let renderTask: any = null

const render = async () => {
  if (!props.doc || !canvasEl.value) return
  const page = await props.doc.getPage(props.page)
  const dpr = window.devicePixelRatio || 1
  const viewport = page.getViewport({ scale: props.zoom * dpr })
  const canvas = canvasEl.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Отменяем предыдущий незавершённый рендер (быстрое листание/зум) — иначе
  // pdf.js кидает InvalidStateError, пытаясь рисовать в canvas параллельно.
  if (renderTask) { try { renderTask.cancel() } catch {} }

  canvas.width = viewport.width
  canvas.height = viewport.height
  canvas.style.width = `${viewport.width / dpr}px`
  canvas.style.height = `${viewport.height / dpr}px`

  renderTask = page.render({ canvasContext: ctx, viewport })
  try {
    await renderTask.promise
  } catch (e: any) {
    if (e?.name !== 'RenderingCancelledException') throw e
  }
}

watch(() => [props.doc, props.page, props.zoom], render, { immediate: true })
onBeforeUnmount(() => { if (renderTask) { try { renderTask.cancel() } catch {} } })
</script>

<style scoped>
.ppv-wrap { display: flex; justify-content: center; padding: 24px; min-height: 100%; box-sizing: border-box; }
.ppv-canvas { border-radius: var(--r-sm); box-shadow: var(--sh-md); background: #fff; }
</style>
