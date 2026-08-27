<template>
  <div class="mlp">
    <div class="mlp-label">{{ t('class.attached_files_label') }}</div>
    <div v-if="!files.length" class="mlp-empty">{{ t('lecture.no_files') }}</div>
    <div v-else class="mlp-list">
      <MaterialListItem
        v-for="(f, i) in files"
        :key="f.url"
        :file="f"
        :active="i === activeIndex"
        @click="$emit('open', i)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

defineProps<{ files: { url: string; name: string }[]; activeIndex: number | null }>()
defineEmits<{ (e: 'open', index: number): void }>()

const { t } = useI18n()
</script>

<style scoped>
.mlp-label { font-size: 12px; font-weight: 700; color: var(--text4); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 12px; }
.mlp-list {
  display: flex; flex-direction: column;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-xl); overflow: hidden; box-shadow: var(--sh-xs);
}
.mlp-empty { font-size: 13px; color: var(--text4); padding: 4px 0; }
@media (prefers-contrast: more) { .mlp-list { border-width: 2px; } }
</style>
