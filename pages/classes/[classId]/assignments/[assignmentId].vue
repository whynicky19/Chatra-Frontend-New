<template>
  <div class="asg-detail">
    <div v-if="loading" class="asg-loading"><div class="spin-ring"></div></div>
    <template v-else-if="assignment">
      <!-- Если выбран файл — рендерим child-роут, иначе саму панель задания.
           В обоих случаях на всю ширину правой колонки, без вложенных панелей. -->
      <NuxtPage v-if="hasActiveFile" />
      <AssignmentDetailPanel
        v-else
        :assignment="assignment"
        mode="fullpage"
        :is-teacher="isTeacher"
        :readonly="readonly"
        :cohort-id="cohortId"
        @close="close"
        @submitted="onSubmitted"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from '#app'
import { useAssignmentListData } from '~/composables/useAssignmentListData'
import { useAuthStore } from '~/stores/auth.store'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
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

const hasActiveFile = computed(() => route.params.fileIndex != null)

const close = () => router.push(`/classes/${classId.value}/assignments`)
const onSubmitted = () => refreshMySubmissions()

watch([loading, assignments], () => {
  if (!loading.value && assignments.value.length && !assignment.value) close()
})
</script>

<style scoped>
/* Занимаем всю правую колонку родителя (assignments.vue). Внутри два
   состояния: либо панель задания (mode=fullpage — без рамки/тени, она сама
   заполняет высоту), либо child-роут с viewer. */
.asg-detail { height: 100%; min-height: 0; display: flex; flex-direction: column; }
.asg-loading { flex: 1; display: flex; align-items: center; justify-content: center; }
.asg-detail > * { flex: 1; min-height: 0; }
</style>