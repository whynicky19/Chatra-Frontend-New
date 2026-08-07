<template>
  <div class="lec-page">
    <div v-if="loading" class="lec-loading"><div class="spin-ring"></div></div>

    <template v-else-if="post">
      <div class="lec-left" v-show="!isMobile || !hasActiveFile">
        <button class="lec-back" @click="goBack">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6"/></svg>
          {{ t('general.back') }}
        </button>

        <div class="lec-left-scroll">
          <LectureInfoPanel
            :title="cleanLectureTitle(post.title)"
            :date="fmtDate(post.created_at)"
            :description="description"
            :files="files"
            @open-file="openFile"
          />
          <MaterialListPanel :files="files" :active-index="activeIndex" @open="openFile" />
        </div>
      </div>

      <div class="lec-right" v-if="!isMobile || hasActiveFile">
        <NuxtPage v-if="hasActiveFile" />
        <LectureEmptyPreview v-else />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from '#app'
import { usePostsSvc } from '~/services/posts'
import { useClassesStore } from '~/stores/classes.store'
import { useI18n } from '~/composables/useI18n'
import { useIsMobile } from '~/composables/useIsMobile'
import { parseUtc } from '~/composables/useDeadline'
import { cleanLectureTitle, getFullBody } from '~/composables/usePostBody'
import { renderBody } from '~/composables/useRenderBody'
import { extractFilesFromText, stripFilesFromText } from '~/composables/useAttachments'
import { provideLectureData, type LecturePost } from '~/composables/useLectureData'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const postsSvc = usePostsSvc()
const classesStore = useClassesStore()
const { t, lang } = useI18n()
const isMobile = useIsMobile()

const classId = computed(() => Number(route.params.classId))
const lectureId = computed(() => Number(route.params.lectureId))

const loading = ref(true)
const post = ref<LecturePost | null>(null)

const load = async () => {
  loading.value = true
  try {
    const posts = await postsSvc.list({ classId: classId.value })
    post.value = posts.find((p: any) => p.id === lectureId.value) || null
    if (!post.value) {
      // Лекция не найдена (удалена/неверный id) — возвращаемся к списку.
      router.replace(`/classes/${classId.value}?tab=lectures`)
    }
  } finally {
    loading.value = false
  }
}
onMounted(load)

const files = computed(() => post.value ? extractFilesFromText(getFullBody(post.value)) : [])
const description = computed(() => post.value ? renderBody(stripFilesFromText(getFullBody(post.value))) : '')

provideLectureData({ post, files, loading, classId })

const hasActiveFile = computed(() => route.params.fileIndex != null)
const activeIndex = computed(() => hasActiveFile.value ? Number(route.params.fileIndex) : null)

const openFile = (index: number) => router.push(`/classes/${classId.value}/lecture/${lectureId.value}/file/${index}`)
const goBack = () => router.push(`/classes/${classId.value}?tab=lectures`)

const fmtDate = (d: string) => { if (!d) return ''; try { return parseUtc(d).toLocaleDateString(lang.value === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return d } }
</script>

<style scoped>
.lec-page { height: 100%; display: flex; overflow: hidden; }
.lec-loading { flex: 1; display: flex; align-items: center; justify-content: center; }

.lec-left { width: 420px; flex-shrink: 0; display: flex; flex-direction: column; border-right: 1px solid var(--border); background: var(--surface); }
.lec-left-scroll { flex: 1; overflow-y: auto; padding: 8px 28px 32px; }
.lec-back {
  display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
  margin: 20px 28px 4px; padding: 0; background: none; border: none;
  color: var(--text4); font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: color .15s;
}
.lec-back:hover { color: var(--teal); }

.lec-right { flex: 1; min-width: 0; padding: 20px 20px 20px 0; }
.lec-right > * { height: 100%; }

@media (max-width: 900px) {
  .lec-left { width: 360px; }
}

@media (max-width: 768px) {
  /* flex-direction меняется на column — без flex:1 + min-height:0 эти панели
     просто растут под весь свой контент (min-height:auto по умолчанию не даёт
     сжаться под доступную высоту), а .lec-page{overflow:hidden} обрезает
     лишнее вместо прокрутки. min-height:0 снимает этот флекс-минимум. */
  .lec-page { flex-direction: column; }
  .lec-left { width: 100%; border-right: none; flex: 1; min-height: 0; }
  .lec-left-scroll { padding: 0 16px 32px; }
  .lec-back { margin: 14px 16px 4px; }
  .lec-right { flex: 1; min-width: 0; min-height: 0; padding: 0; width: 100%; }
}
</style>
