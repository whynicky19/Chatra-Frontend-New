<template>
  <div class="lip">
    <h1 class="lip-title">{{ title }}</h1>
    <div class="lip-date">{{ date }}</div>

    <div v-if="description" ref="descEl" class="lip-desc" v-html="description" @click="onBodyClick"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { sameFilePath } from '~/composables/useFileUrl'

const props = defineProps<{
  title: string
  date: string
  description: string
  files: { url: string; name: string }[]
}>()
const emit = defineEmits<{ (e: 'open-file', index: number): void }>()

// Текст лекции — тоже поверхность для выделений: их делают в приложении, а
// здесь мы их показываем и умеем к ним прокручивать (см. страницу лекции).
const descEl = ref<HTMLElement | null>(null)
defineExpose({ descEl })

const onBodyClick = (e: MouseEvent) => {
  const target = (e.target as HTMLElement)?.closest('[data-preview-url]') as HTMLElement | null
  if (!target) return
  e.preventDefault()
  const url = target.dataset.previewUrl!
  const idx = props.files.findIndex(f => sameFilePath(f.url, url))
  if (idx !== -1) emit('open-file', idx)
}
</script>

<style scoped>
.lip-title { font-size: 26px; font-weight: 800; letter-spacing: -.02em; color: var(--text1); margin: 0 0 8px; }
.lip-date { font-size: 13px; color: var(--text4); margin-bottom: 20px; }
.lip-desc {
  font-size: 14px; line-height: 1.65; color: var(--text2); margin-bottom: 28px;
  padding: 14px; background: var(--surface2); border-radius: var(--r-lg); border: 1px solid var(--border);
}
.lip-desc :deep(.link-inline) { color: var(--teal); text-decoration: none; }
.lip-desc :deep(.link-inline:hover) { text-decoration: underline; }
.lip-desc :deep(.file-attachment) {
  display: inline-flex; align-items: center; gap: 8px; min-height: 38px; padding: 4px 11px 4px 5px;
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  box-shadow: var(--sh-xs); color: var(--text1); text-decoration: none; font-weight: 650; font-size: 13px;
  vertical-align: middle; transition: background .12s ease-out, border-color .15s ease-out, transform .1s ease-out, box-shadow .18s ease-out;
}
.lip-desc :deep(.file-attachment:hover) { background: var(--glass); border-color: var(--border2); box-shadow: var(--sh-sm); }
.lip-desc :deep(.file-attachment:active) { transform: scale(.97); }
.lip-desc :deep(.file-type-badge) {
  position: relative; display: inline-flex; align-items: flex-end; justify-content: center;
  width: 28px; height: 29px; padding-bottom: 4px; overflow: hidden;
  border-radius: 8px; background: linear-gradient(145deg,var(--surface2),var(--surface));
  border: 1px solid var(--border2); color: var(--text3);
  font-size: 6px; line-height: 1; font-weight: 800; letter-spacing: .035em;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.5),0 2px 5px rgba(15,23,42,.06);
}
.lip-desc :deep(.file-type-badge::before) {
  content: ''; position: absolute; left: 7px; right: 7px; top: 7px; height: 7px;
  border-top: 1px solid var(--text4); border-bottom: 1px solid var(--text4); opacity: .38;
}
@media (prefers-reduced-motion: reduce) {
  .lip-desc :deep(.file-attachment) { transition-duration: .12s; }
  .lip-desc :deep(.file-attachment:active) { transform: none; }
}
</style>
