<template>
  <div class="asgv-wrap">
    <div v-if="loading" class="asgv-loading"><div class="spin-ring"></div></div>
    <AssignmentDetailPanel
      v-else-if="assignment"
      :assignment="assignment"
      :mode="isMobile ? 'fullpage' : 'panel'"
      :is-teacher="isTeacher"
      :readonly="readonly"
      :cohort-id="cohortId"
      @close="close"
      @submitted="onSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from '#app'
import { useIsMobile } from '~/composables/useIsMobile'
import { useAssignmentListData } from '~/composables/useAssignmentListData'
import { useAuthStore } from '~/stores/auth.store'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const isMobile = useIsMobile()
const auth = useAuthStore()
const { assignments, loading, classId, readonly, refreshMySubmissions } = useAssignmentListData()

const isTeacher = computed(() => auth.user?.role === 'teacher' || auth.user?.role === 'admin')
const assignmentId = computed(() => Number(route.params.assignmentId))
const assignment = computed(() => assignments.value.find(a => a.id === assignmentId.value) || null)
const cohortId = computed(() => {
  const raw = route.query.cohort
  const n = Number(raw)
  return raw != null && !isNaN(n) ? n : undefined
})

const close = () => router.push(`/classes/${classId.value}/assignments`)
const onSubmitted = () => refreshMySubmissions()

// Задание не нашлось после загрузки (битый id) — возвращаемся к списку.
watch([loading, assignments], () => {
  if (!loading.value && assignments.value.length && !assignment.value) close()
})
</script>

<style scoped>
.asgv-wrap { height: 100%; }
.asgv-loading { height: 100%; display: flex; align-items: center; justify-content: center; }
</style>
