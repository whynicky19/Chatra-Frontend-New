<template>
  <div class="flc-list">
    <a v-for="f in files" :key="f.url" href="#" class="flc-row" @click.prevent="$emit('open', f.url, f.name)">
      <img v-if="isImageUrl(f.url)" :src="fixFileUrlSafe(f.url)" class="flc-thumb" alt="" />
      <FileTypeIcon v-else :url="f.url" />
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
import { fixFileUrlSafe } from '~/composables/useFileUrl'

defineProps<{ files: { url: string; name: string }[] }>()
defineEmits<{ (e: 'open', url: string, name: string): void }>()
</script>

<style scoped>
/* Сгруппированная таблица iOS: одна карточка, строки разделены волосяной
   линией — вместо плашки-фона, сливавшейся с утопленным телом страницы. */
.flc-list {
  display: flex; flex-direction: column;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 22px; overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,.03),0 12px 30px rgba(28,28,30,.05),inset 0 1px 0 rgba(255,255,255,.45);
}
.flc-row {
  display: flex; align-items: center; gap: 13px; width: 100%; padding: 13px 15px;
  border-bottom: 1px solid var(--border);
  text-decoration: none; transition: background .12s ease-out;
}
.flc-row:last-child { border-bottom: none; }
.flc-row:hover { background: color-mix(in srgb,var(--surface2) 62%,transparent); }
.flc-row:hover .flc-chevron { color: var(--teal); transform: translateX(2px); opacity: 1; }
.flc-row:active { background: var(--glass2); }
.flc-row:active :deep(.fti), .flc-row:active .flc-thumb { transform: scale(.96); }
/* object-fit:contain + тёмный фон-подложка: превью любой картинки (даже
   с альфа-каналом) видно целиком в обеих темах. Раньше object-fit:cover
   обрезал неквадратные фото по краям, а прозрачные PNG растворялись в
   фоне карточки -- выглядело как «фото не показываются». */
.flc-thumb { width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0; transition: transform .1s ease-out; background: var(--surface2); padding: 3px; object-fit: contain; box-shadow:inset 0 1px 0 rgba(255,255,255,.45); }
.flc-info { flex: 1; min-width: 0; }
.flc-name { font-size: 13.5px; font-weight: 680; letter-spacing: -.012em; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.flc-type { font-size: 11.5px; color: var(--text4); letter-spacing: .02em; margin-top: 1px; }
.flc-chevron { color: var(--text4); flex-shrink: 0; opacity: .55; transition: color .15s ease-out, transform .18s cubic-bezier(.22,1,.36,1), opacity .15s; }
@media (prefers-reduced-motion:reduce){.flc-row,.flc-chevron,.flc-thumb,.flc-row :deep(.fti){transition-duration:.12s}.flc-row:hover .flc-chevron{transform:none}.flc-row:active :deep(.fti),.flc-row:active .flc-thumb{transform:none}}
</style>
