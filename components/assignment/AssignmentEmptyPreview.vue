<template>
  <div class="aep">
    <div class="aep-icon">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
    </div>
    <div class="aep-text">{{ t('assignment.select') }}</div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
const { t } = useI18n()
</script>

<style scoped>
.aep { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: var(--text4); }
.aep-icon { width: 72px; height: 72px; border-radius: var(--r-2xl); background: var(--surface2); display: flex; align-items: center; justify-content: center; }
.aep-text { font-size: 14px; font-weight: 600; }
</style>
