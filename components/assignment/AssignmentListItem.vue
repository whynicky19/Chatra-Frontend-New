<template>
  <button type="button" class="ali-row" :class="{ active }" @click="$emit('click')">
    <div class="ali-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
    <div class="ali-info">
      <div class="ali-name">{{ assignment.title }}</div>
      <div class="ali-meta">
        <span v-if="deadlineText" :class="{ 'ali-overdue': overdue }">{{ deadlineText }}</span>
        <span v-if="gradeChip" class="ali-dot">·</span>
        <span v-if="gradeChip" class="ali-grade">{{ gradeChip }}</span>
      </div>
    </div>
    <svg class="ali-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseUtc } from '~/composables/useDeadline'
import { useI18n } from '~/composables/useI18n'
import type { Assignment, Submission } from '~/services/assignments'

const props = defineProps<{ assignment: Assignment; submission: Submission | null; active?: boolean }>()
defineEmits<{ (e: 'click'): void }>()

const { lang } = useI18n()

const overdue = computed(() => !!props.assignment.deadline && parseUtc(props.assignment.deadline) < new Date() && !props.submission)
const deadlineText = computed(() => {
  if (!props.assignment.deadline) return ''
  try { return parseUtc(props.assignment.deadline).toLocaleDateString(lang.value === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' }) } catch { return '' }
})
const gradeChip = computed(() => {
  if (props.submission?.status !== 'graded' || !props.submission.grade) return ''
  return `${props.submission.grade.score} / ${props.assignment.max_score}`
})
</script>

<style scoped>
.ali-row {
  display: flex; align-items: center; gap: 13px; width: 100%; padding: 12px 14px;
  position: relative; background: transparent; border: none; border-bottom: 1px solid var(--border);
  text-align: left; cursor: pointer; font-family: inherit;
  transition: background .12s ease-out, transform .1s ease-out;
}
.ali-row:last-child { border-bottom: none; }
.ali-row:hover { background: var(--glass); }
.ali-row:active { transform: scale(.98); }
.ali-row.active { background: var(--surface2); }
.ali-row.active::before {
  content: ''; position: absolute; left: 0; top: 10px; bottom: 10px; width: 3px;
  border-radius: 0 3px 3px 0; background: var(--teal);
}
.ali-icon {
  width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface2); color: var(--text3); border: 1px solid var(--border);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.42);
}
.ali-row.active .ali-icon { background: var(--surface); color: var(--text1); border-color: var(--border2); }
.ali-info { flex: 1; min-width: 0; }
.ali-name { font-size: 14px; font-weight: 600; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ali-meta { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text4); letter-spacing: .02em; margin-top: 1px; }
.ali-dot { opacity: .6; }
.ali-overdue { color: var(--red); }
.ali-grade { font-weight: 700; color: var(--teal); }
.ali-chevron { color: var(--text4); flex-shrink: 0; }
.ali-row.active .ali-chevron { color: var(--teal); }
@media (prefers-reduced-motion: reduce) {
  .ali-row { transition-duration: .12s; }
  .ali-row:active { transform: none; }
}
</style>
