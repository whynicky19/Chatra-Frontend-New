<template>
  <div class="flc-list">
    <a v-for="f in files" :key="f.url" href="#" class="flc-row" @click.prevent="$emit('open', f.url, f.name)">
      <img v-if="isImageUrl(f.url)" :src="f.url" class="flc-thumb" alt="" />
      <div v-else class="flc-icon" :style="{ background: fileVisual(f.url).bg, color: fileVisual(f.url).color }">{{ fileVisual(f.url).label }}</div>
      <div class="flc-info">
        <div class="flc-name">{{ f.name }}</div>
        <div class="flc-type">{{ fileVisual(f.url).label }}</div>
      </div>
      <svg class="flc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </a>
  </div>
</template>

<script setup lang="ts">
import { isImageUrl, fileVisual } from '~/composables/useFileVisual'

defineProps<{ files: { url: string; name: string }[] }>()
defineEmits<{ (e: 'open', url: string, name: string): void }>()
</script>

<style scoped>
.flc-list { display: flex; flex-direction: column; gap: 8px; }
.flc-row { display: flex; align-items: center; gap: 13px; width: 100%; padding: 12px 14px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-lg); text-decoration: none; transition: background .12s, transform .12s; }
.flc-row:hover { background: var(--surface3); }
.flc-row:active { transform: scale(0.98); }
.flc-icon, .flc-thumb { width: 44px; height: 44px; border-radius: var(--r-md); flex-shrink: 0; }
.flc-icon { display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; letter-spacing: .02em; }
.flc-thumb { object-fit: cover; }
.flc-info { flex: 1; min-width: 0; }
.flc-name { font-size: 14px; font-weight: 600; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.flc-type { font-size: 12px; color: var(--text4); letter-spacing: .02em; margin-top: 1px; }
.flc-chevron { color: var(--text4); flex-shrink: 0; }
</style>
