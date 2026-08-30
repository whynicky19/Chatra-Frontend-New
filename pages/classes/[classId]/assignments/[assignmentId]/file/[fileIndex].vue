<template>
  <div class="fv-wrap">
    <div v-if="!file" class="fv-loading"><div class="spin-ring"></div></div>
    <DocumentViewerShell
      v-else
      :file="file"
      mode="fullpage"
      @close="close"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from '#app'
import { fixFileUrlSafe } from '~/composables/useFileUrl'

const route = useRoute()
const router = useRouter()

// В заданиях файлы приходят из разных источников (описание, референс, сдача
// студента), и единого списка «files[fileIndex]» нет — поэтому URL и имя
// передаём через query. fixFileUrlSafe прогоняем здесь, чтобы просмотрщик
// получил уже нормализованный адрес.
const file = computed(() => {
  const url = String(route.query.url || '')
  const name = String(route.query.name || '')
  if (!url || !name) return null
  return { url: fixFileUrlSafe(url), name }
})

const classId = computed(() => route.params.classId)
const assignmentId = computed(() => route.params.assignmentId)
const cohortQuery = computed(() => {
  const c = route.query.cohort
  return c != null && c !== '' ? `?cohort=${c}` : ''
})
const close = () => router.push(`/classes/${classId.value}/assignments/${assignmentId.value}${cohortQuery.value}`)
</script>

<style scoped>
.fv-wrap { height: 100%; min-height: 0; display: flex; flex-direction: column; }
.fv-wrap > * { flex: 1; min-height: 0; }
.fv-loading { display: flex; align-items: center; justify-content: center; }
</style>