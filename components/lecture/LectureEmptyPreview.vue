<template>
  <div class="lep">
    <div class="lep-icon">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M9 2v6l2.5-1.6L14 8V2"/></svg>
    </div>
    <div class="lep-text">{{ t('lecture.select_file') }}</div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
const { t } = useI18n()
</script>

<style scoped>
.lep { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: var(--text4); }
.lep-icon { width: 72px; height: 72px; border-radius: var(--r-2xl); background: var(--surface2); display: flex; align-items: center; justify-content: center; }
.lep-text { font-size: 14px; font-weight: 600; }
</style>
