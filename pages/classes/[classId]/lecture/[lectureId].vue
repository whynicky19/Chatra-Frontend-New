<template>
  <div class="lec-page">
    <div v-if="loading" class="lec-loading"><div class="spin-ring"></div></div>

    <template v-else-if="post">
      <div class="lec-left" :class="{ collapsed: isCollapsed }" v-show="!isMobile || !hasActiveFile">
        <!-- Кнопка вне .lec-left-inner: колонка схлопывается, а способ вернуть
             её обратно должен остаться на экране. -->
        <button
          v-if="canCollapse"
          class="lec-toggle"
          :title="isCollapsed ? t('panel.expand') : t('panel.collapse')"
          :aria-label="isCollapsed ? t('panel.expand') : t('panel.collapse')"
          @click="toggleCollapse"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="18" height="18" rx="2.5"/><line x1="9.5" y1="3" x2="9.5" y2="21"/></svg>
        </button>

        <div class="lec-left-inner">
          <button class="lec-back" @click="goBack">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6"/></svg>
            {{ t('general.back') }}
          </button>

          <div class="lec-left-scroll">
            <LectureInfoPanel
              ref="infoPanel"
              :title="cleanLectureTitle(post.title)"
              :date="fmtDate(post.created_at)"
              :description="description"
              :files="files"
              @open-file="openFile"
            />
            <MaterialListPanel :files="files" :active-index="activeIndex" @open="openFile" />

            <div class="lec-highlights">
              <HighlightsPanel
                :items="lectureHighlights"
                show-lecture
                @go="h => goHighlight(h)"
                @note="h => goHighlight(h, true)"
                @remove="h => highlights.remove(h.id)"
              />
            </div>
          </div>
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
import { ref, computed, watch, nextTick, onMounted } from 'vue'
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
import { useSidePanelCollapse } from '~/composables/useSidePanelCollapse'
import { useHighlights, type Highlight } from '~/composables/useHighlights'
import { paintHighlights } from '~/composables/useTextHighlighter'

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
onMounted(() => {
  load()
  // Пометки лекции — с сервера: сделанные в приложении должны быть здесь.
  highlights.load({ lectureId: lectureId.value })
})

const files = computed(() => post.value ? extractFilesFromText(getFullBody(post.value)) : [])
const description = computed(() => post.value ? renderBody(stripFilesFromText(getFullBody(post.value))) : '')

provideLectureData({ post, files, loading, classId })

const hasActiveFile = computed(() => route.params.fileIndex != null)
const activeIndex = computed(() => hasActiveFile.value ? Number(route.params.fileIndex) : null)

// Сворачивать колонку имеет смысл, только когда открыт файл — иначе описание
// лекции и список материалов просто исчезли бы с пустого экрана.
const { collapsed, toggle: toggleCollapse } = useSidePanelCollapse()
const canCollapse = computed(() => !isMobile.value && hasActiveFile.value)
const isCollapsed = computed(() => canCollapse.value && collapsed.value)

const highlights = useHighlights()
const lectureHighlights = computed(() => highlights.forLecture(classId.value, lectureId.value))

// Выделения в тексте самой лекции (их делают в приложении: там просмотрщика
// файлов нет) — показываем прямо в описании, чтобы пометка с телефона была
// видна и здесь.
const infoPanel = ref<{ descEl: HTMLElement | null } | null>(null)
const textHighlights = computed(() => lectureHighlights.value.filter(h => h.file_index < 0))

const paintDescription = () => {
  const root = infoPanel.value?.descEl
  if (root) paintHighlights(root, textHighlights.value)
}
watch([textHighlights, () => infoPanel.value?.descEl, description], () => nextTick(paintDescription))

// Файл выделения может быть не тем, что открыт сейчас, — открываем нужный и
// передаём id: просмотрщик сам долистает до места и подсветит его.
const goHighlight = (h: Highlight, withNote = false) => {
  if (h.file_index < 0) {
    // Пометка в тексте лекции: она уже на экране, просто подводим к ней глаз.
    const el = infoPanel.value?.descEl?.querySelector<HTMLElement>(`[data-hl-id="${h.id}"]`)
    if (!el) return
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    el.classList.add('hl-flash')
    setTimeout(() => el.classList.remove('hl-flash'), 1400)
    return
  }
  router.push({
    path: `/classes/${classId.value}/lecture/${lectureId.value}/file/${h.file_index}`,
    query: withNote ? { hl: h.id, note: '1' } : { hl: h.id },
  })
}

const openFile = (index: number) => router.push(`/classes/${classId.value}/lecture/${lectureId.value}/file/${index}`)
const goBack = () => router.push(`/classes/${classId.value}?tab=lectures`)

const fmtDate = (d: string) => { if (!d) return ''; try { return parseUtc(d).toLocaleDateString(lang.value === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return d } }
</script>

<style scoped>
.lec-page { height: 100%; display: flex; overflow: hidden; }
.lec-loading { flex: 1; display: flex; align-items: center; justify-content: center; }

.lec-left {
  position: relative; width: 420px; flex-shrink: 0; overflow: hidden;
  border-right: 1px solid var(--border); background: var(--surface);
  transition: width .34s cubic-bezier(.22,1,.36,1);
}
/* Внутренняя обёртка держит свою ширину, пока колонка схлопывается, — иначе
   на каждом кадре анимации содержимое переверстывалось бы под новую ширину. */
.lec-left-inner {
  width: 420px; height: 100%; display: flex; flex-direction: column;
  transition: opacity .22s ease-out;
}
.lec-left.collapsed { width: 56px; }
.lec-left.collapsed .lec-left-inner { opacity: 0; pointer-events: none; }

.lec-toggle {
  position: absolute; top: 15px; right: 12px; z-index: 2;
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  background: none; border: none; border-radius: 9px; cursor: pointer;
  color: var(--text4);
  transition: color .15s ease-out, background .15s ease-out, transform .12s cubic-bezier(.32,.72,0,1);
}
.lec-toggle:hover { color: var(--teal); background: var(--surface2); }
.lec-toggle:active { transform: scale(.92); }

.lec-left-scroll { flex: 1; overflow-y: auto; padding: 8px 28px 32px; }
.lec-highlights { margin-top: 26px; }

/* Пометки в тексте лекции: те же тона, что и в просмотрщике файлов. Разметку
   вставляет paintHighlights императивно, поэтому правила глубокие. */
.lec-left :deep(.hl-mark) { background-color: transparent; color: inherit; border-radius: 3px; }
.lec-left :deep(.hl-mark.hl-yellow) { background-color: rgba(255, 216, 77, .45); }
.lec-left :deep(.hl-mark.hl-green) { background-color: rgba(123, 220, 160, .45); }
.lec-left :deep(.hl-mark.hl-blue) { background-color: rgba(124, 197, 245, .45); }
.lec-left :deep(.hl-mark.hl-red) { background-color: rgba(255, 154, 154, .45); }
.lec-left :deep(.hl-mark[data-hl-note]) { box-shadow: inset 0 -2px 0 rgba(0,0,0,.22); }
.lec-left :deep(.hl-mark.hl-flash) { animation: lec-hl-flash 1.4s ease-out; }
@keyframes lec-hl-flash {
  0%, 100% { box-shadow: 0 0 0 0 rgba(var(--teal-rgb), 0); }
  25% { box-shadow: 0 0 0 4px rgba(var(--teal-rgb), .35); }
}
.lec-back {
  display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
  margin: 20px 28px 4px; padding: 0; background: none; border: none;
  color: var(--text4); font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: color .15s;
}
.lec-back:hover { color: var(--teal); }

.lec-right { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 0; }
.lec-right > * { flex: 1; min-height: 0; }

@media (max-width: 900px) {
  .lec-left, .lec-left-inner { width: 360px; }
}

@media (max-width: 768px) {
  /* flex-direction меняется на column — без flex:1 + min-height:0 эти панели
     просто растут под весь свой контент (min-height:auto по умолчанию не даёт
     сжаться под доступную высоту), а .lec-page{overflow:hidden} обрезает
     лишнее вместо прокрутки. min-height:0 снимает этот флекс-минимум. */
  .lec-page { flex-direction: column; }
  /* На мобиле колонка занимает весь экран и не сворачивается (см. canCollapse) */
  .lec-left, .lec-left-inner { width: 100%; }
  .lec-left { border-right: none; flex: 1; min-height: 0; }
  .lec-left-scroll { padding: 0 16px 32px; }
  .lec-back { margin: 14px 16px 4px; }
  .lec-right { flex: 1; min-width: 0; min-height: 0; width: 100%; }
}
</style>
