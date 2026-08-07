<template>
  <button type="button" class="pt-item" :class="{ active }" @click="$emit('click')">
    <canvas ref="canvasEl" class="pt-canvas"></canvas>
    <span class="pt-num">{{ pageNum }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{ doc: any; pageNum: number; active?: boolean }>()
defineEmits<{ (e: 'click'): void }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)

onMounted(async () => {
  const page = await props.doc.getPage(props.pageNum)
  const viewport = page.getViewport({ scale: 1 })
  // Миниатюра — фиксированная ширина ~90px, масштаб подгоняем под неё.
  const scale = 90 / viewport.width
  const scaled = page.getViewport({ scale })
  const canvas = canvasEl.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return
  canvas.width = scaled.width
  canvas.height = scaled.height
  await page.render({ canvasContext: ctx, viewport: scaled }).promise
})
</script>

<style scoped>
.pt-item {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 4px; border-radius: var(--r-sm); border: 2px solid transparent;
  background: none; cursor: pointer; flex-shrink: 0;
}
.pt-item.active { border-color: var(--teal); }
.pt-canvas { border-radius: 3px; box-shadow: var(--sh-xs); background: #fff; display: block; }
.pt-num { font-size: 10px; color: var(--text4); font-weight: 600; }
.pt-item.active .pt-num { color: var(--teal); }
</style>
