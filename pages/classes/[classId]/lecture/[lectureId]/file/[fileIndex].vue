<template>
  <div class="fv-wrap">
    <div v-if="loading" class="fv-loading"><div class="spin-ring"></div></div>
    <DocumentViewerShell v-else-if="file" :file="file" :mode="isMobile ? 'fullpage' : 'panel'" @close="close" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from '#app'
import { useIsMobile } from '~/composables/useIsMobile'
import { useLectureData } from '~/composables/useLectureData'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const isMobile = useIsMobile()
const { files, loading, classId } = useLectureData()

const lectureId = computed(() => Number(route.params.lectureId))
const fileIndex = computed(() => Number(route.params.fileIndex))
const file = computed(() => files.value[fileIndex.value] || null)

const close = () => router.push(`/classes/${classId.value}/lecture/${lectureId.value}`)

// Файл не нашёлся после загрузки (битый индекс) — возвращаемся к лекции.
watch([loading, files], () => {
  if (!loading.value && files.value.length && !file.value) close()
})
</script>

<style scoped>
.fv-wrap { height: 100%; }
.fv-loading { height: 100%; display: flex; align-items: center; justify-content: center; }
</style>
