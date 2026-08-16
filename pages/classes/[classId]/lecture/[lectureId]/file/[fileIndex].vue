<template>
  <div class="fv-wrap">
    <div v-if="loading" class="fv-loading"><div class="spin-ring"></div></div>
    <DocumentViewerShell
      v-else-if="file"
      :file="file"
      :mode="isMobile ? 'fullpage' : 'panel'"
      :context="context"
      @close="close"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from '#app'
import { useIsMobile } from '~/composables/useIsMobile'
import { useLectureData } from '~/composables/useLectureData'
import { cleanLectureTitle } from '~/composables/usePostBody'
import type { HighlightContext } from '~/composables/useHighlights'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const isMobile = useIsMobile()
const { post, files, loading, classId } = useLectureData()

const lectureId = computed(() => Number(route.params.lectureId))
const fileIndex = computed(() => Number(route.params.fileIndex))
const file = computed(() => files.value[fileIndex.value] || null)

// Контекст лекции включает в просмотрщике выделения и привязывает их к
// конкретному файлу конкретной лекции.
const context = computed<HighlightContext>(() => ({
  classId: classId.value,
  lectureId: lectureId.value,
  lectureTitle: cleanLectureTitle(post.value?.title || ''),
  fileIndex: fileIndex.value,
}))

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
