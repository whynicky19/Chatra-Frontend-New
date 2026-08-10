<template>
  <button type="button" class="mli-row" :class="{ active }" @click="$emit('click')">
    <img v-if="isImageUrl(file.url)" :src="file.url" class="mli-thumb" alt="" />
    <div v-else class="mli-icon" :style="{ background: fileVisual(file.url).bg, color: fileVisual(file.url).color }">{{ fileVisual(file.url).label }}</div>
    <div class="mli-info">
      <div class="mli-name">{{ file.name }}</div>
      <div class="mli-meta">{{ fileVisual(file.url).label }}</div>
    </div>
    <svg class="mli-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
  </button>
</template>

<script setup lang="ts">
import { isImageUrl, fileVisual } from '~/composables/useFileVisual'

defineProps<{ file: { url: string; name: string }; active?: boolean }>()
defineEmits<{ (e: 'click'): void }>()
</script>

<style scoped>
.mli-row {
  display: flex; align-items: center; gap: 12px; width: 100%; padding: 11px 14px;
  background: transparent; border: none; border-bottom: 1px solid var(--border);
  text-align: left; cursor: pointer; font-family: inherit;
  transition: background .1s ease-out;
}
.mli-row:last-child { border-bottom: none; }
.mli-row:hover { background: var(--surface3); }
.mli-row:active { background: var(--surface3); }
.mli-row.active { background: var(--teal-l); }
.mli-icon, .mli-thumb { width: 40px; height: 40px; border-radius: var(--r-md); flex-shrink: 0; }
.mli-icon { display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; letter-spacing: .02em; }
.mli-thumb { object-fit: cover; }
.mli-info { flex: 1; min-width: 0; }
.mli-name { font-size: 14px; font-weight: 600; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mli-meta { font-size: 12px; color: var(--text4); letter-spacing: .02em; margin-top: 1px; }
.mli-chevron { color: var(--text4); flex-shrink: 0; }
.mli-row.active .mli-chevron { color: var(--teal); }
</style>
