<template>
  <div class="ftg-grid">
    <a v-for="url in files" :key="url" href="#" class="ftg-tile" @click.prevent="$emit('open', url, fileNameFromUrl(url))">
      <div class="ftg-box">
        <img v-if="isImageUrl(url)" :src="url" class="ftg-img" alt="" />
        <div v-else class="ftg-icon" :style="{ background: fileVisual(url).bg, color: fileVisual(url).color }">{{ fileVisual(url).label }}</div>
      </div>
      <div class="ftg-name">{{ fileNameFromUrl(url) }}</div>
    </a>
  </div>
</template>

<script setup lang="ts">
import { isImageUrl, fileVisual } from '~/composables/useFileVisual'
import { fileNameFromUrl } from '~/composables/useAttachments'

defineProps<{ files: string[] }>()
defineEmits<{ (e: 'open', url: string, name: string): void }>()
</script>

<style scoped>
.ftg-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.ftg-tile { display: flex; flex-direction: column; gap: 6px; text-decoration: none; transition: transform .1s ease-out; }
.ftg-tile:active { transform: scale(.96); }
.ftg-box { position: relative; width: 100%; aspect-ratio: 1; border-radius: var(--r-lg); overflow: hidden; background: var(--surface2); border: 1px solid var(--border); }
.ftg-img { width: 100%; height: 100%; object-fit: cover; }
.ftg-icon { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; letter-spacing: .02em; }
.ftg-name { font-size: 11.5px; font-weight: 600; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

@media (max-width: 480px) {
  .ftg-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
