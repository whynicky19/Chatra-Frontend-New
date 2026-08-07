<template>
  <div class="lip">
    <div class="lip-badge">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
      {{ t('class.lecture_badge') }}
    </div>
    <h1 class="lip-title">{{ title }}</h1>
    <div class="lip-date">{{ date }}</div>

    <div v-if="description" class="lip-desc" v-html="description" @click="onBodyClick"></div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
import { sameFilePath } from '~/composables/useFileUrl'

const props = defineProps<{
  title: string
  date: string
  description: string
  files: { url: string; name: string }[]
}>()
const emit = defineEmits<{ (e: 'open-file', index: number): void }>()

const { t } = useI18n()

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
.lip-badge {
  display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px;
  background: var(--teal-l); color: var(--teal); border-radius: var(--r-2xl);
  font-size: 12px; font-weight: 700; margin-bottom: 16px;
}
.lip-title { font-size: 26px; font-weight: 800; letter-spacing: -.02em; color: var(--text1); margin: 0 0 8px; }
.lip-date { font-size: 13px; color: var(--text4); margin-bottom: 20px; }
.lip-desc { font-size: 14px; line-height: 1.65; color: var(--text2); margin-bottom: 28px; }
.lip-desc :deep(.link-inline) { color: var(--teal); text-decoration: none; }
.lip-desc :deep(.link-inline:hover) { text-decoration: underline; }
.lip-desc :deep(.file-attachment) {
  display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px 3px 6px;
  background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-sm);
  color: var(--text1); text-decoration: none; font-weight: 600; font-size: 13px;
}
.lip-desc :deep(.file-type-badge) {
  font-size: 9px; font-weight: 800; color: var(--text4); letter-spacing: .02em;
}
</style>
