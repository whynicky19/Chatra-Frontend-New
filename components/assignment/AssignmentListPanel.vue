<template>
  <div class="alp">
    <div v-if="!assignments.length" class="alp-empty">{{ t('class.no_assignments') }}</div>
    <div v-else class="alp-list">
      <AssignmentListItem
        v-for="a in assignments"
        :key="a.id"
        :assignment="a"
        :submission="submissionsMap[a.id] || null"
        :active="a.id === activeId"
        @click="$emit('open', a.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'
import type { Assignment, Submission } from '~/services/assignments'

const props = defineProps<{ assignments: Assignment[]; mySubmissions: Submission[]; activeId: number | null }>()
defineEmits<{ (e: 'open', id: number): void }>()

const { t } = useI18n()

const submissionsMap = computed(() => {
  const m: Record<number, Submission> = {}
  props.mySubmissions.forEach(s => { m[s.assignment_id] = s })
  return m
})
</script>

<style scoped>
.alp-list {
  display: flex; flex-direction: column;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 22px; overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,.035),0 12px 32px rgba(28,28,30,.055),inset 0 1px 0 rgba(255,255,255,.48);
}
.alp-empty { font-size: 13px; color: var(--text4); padding: 4px 0; }
@media (prefers-contrast: more) { .alp-list { border-width: 2px; } }
</style>
