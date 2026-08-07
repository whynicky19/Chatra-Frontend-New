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
.alp-list { display: flex; flex-direction: column; gap: 8px; }
.alp-empty { font-size: 13px; color: var(--text4); padding: 4px 0; }
</style>
