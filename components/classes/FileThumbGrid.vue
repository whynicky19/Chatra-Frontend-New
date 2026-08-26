<template>
  <div class="ftg-grid">
    <a v-for="url in files" :key="url" href="#" class="ftg-tile" @click.prevent="$emit('open', url, fileNameFromUrl(url))">
      <div class="ftg-box">
        <img v-if="isImageUrl(url)" :src="fixFileUrlSafe(url)" class="ftg-img" alt="" />
        <div v-else class="ftg-icon" :style="{ background: fileVisual(url).bg, color: fileVisual(url).color }">{{ fileVisual(url).label }}</div>
      </div>
      <div class="ftg-name">{{ fileNameFromUrl(url) }}</div>
    </a>
  </div>
</template>

<script setup lang="ts">
import { isImageUrl, fileVisual } from '~/composables/useFileVisual'
import { fileNameFromUrl } from '~/composables/useAttachments'
import { fixFileUrlSafe } from '~/composables/useFileUrl'

defineProps<{ files: string[] }>()
defineEmits<{ (e: 'open', url: string, name: string): void }>()
</script>

<style scoped>
/* auto-fill вместо жёстких 3 колонок: одна вложенная работа больше не
   раздувается в плитку на треть ширины панели. */
.ftg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 10px; }
.ftg-tile { display: flex; flex-direction: column; gap: 7px; text-decoration: none; transition: transform .18s cubic-bezier(.22,1,.36,1); }
.ftg-tile:active { transform: scale(.96); }
.ftg-box {
  position: relative; width: 100%; aspect-ratio: 1; overflow: hidden;
  border-radius: 14px; background: var(--surface); border: 1px solid var(--border);
  box-shadow: var(--sh-xs); transition: box-shadow .2s ease-out, border-color .18s ease-out;
}
@media (hover:hover) {
  .ftg-tile:hover { transform: translateY(-2px); }
  .ftg-tile:hover .ftg-box { box-shadow: var(--sh-sm); border-color: var(--border2); }
}
.ftg-img { width: 100%; height: 100%; object-fit: cover; }
.ftg-icon { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; letter-spacing: .02em; }
.ftg-name { font-size: 11.5px; font-weight: 650; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 2px; }

@media (max-width: 480px) {
  .ftg-grid { grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); }
}
</style>
