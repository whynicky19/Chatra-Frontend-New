<template>
  <div class="asg-page">
    <div v-if="loading" class="asg-loading"><div class="spin-ring"></div></div>

    <template v-else>
      <div class="asg-left" :class="{ collapsed: isCollapsed }" v-show="!isMobile || !hasActiveAssignment">
        <!-- Кнопка живёт вне .asg-left-inner: сама колонка схлопывается, а
             способ вернуть её обратно должен остаться на экране. -->
        <button
          v-if="canCollapse"
          class="asg-toggle"
          :title="isCollapsed ? t('panel.expand') : t('panel.collapse')"
          :aria-label="isCollapsed ? t('panel.expand') : t('panel.collapse')"
          @click="toggleCollapse"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="18" height="18" rx="2.5"/><line x1="9.5" y1="3" x2="9.5" y2="21"/></svg>
        </button>

        <div class="asg-left-inner">
          <button class="asg-back" @click="goBack">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6"/></svg>
            {{ t('general.back') }}
          </button>
          <div class="asg-left-head">{{ t('class.assignments') }}</div>
          <div class="asg-left-scroll">
            <AssignmentListPanel :assignments="assignments" :my-submissions="mySubmissions" :active-id="activeId" @open="openAssignment" />
          </div>
        </div>
      </div>

      <div class="asg-right" v-if="!isMobile || hasActiveAssignment">
        <NuxtPage v-if="hasActiveAssignment" />
        <AssignmentEmptyPreview v-else />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from '#app'
import { useAssignmentsSvc } from '~/services/assignments'
import { useClassesSvc } from '~/services/classes'
import { useAuthStore } from '~/stores/auth.store'
import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'
import { useIsMobile } from '~/composables/useIsMobile'
import { provideAssignmentListData } from '~/composables/useAssignmentListData'
import { useSidePanelCollapse } from '~/composables/useSidePanelCollapse'
import type { Assignment, Submission } from '~/services/assignments'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const assignmentsSvc = useAssignmentsSvc()
const classesSvc = useClassesSvc()
const auth = useAuthStore()
const toast = useToast()
const { t } = useI18n()
const isMobile = useIsMobile()

const classId = computed(() => Number(route.params.classId))
const isTeacher = computed(() => auth.user?.role === 'teacher' || auth.user?.role === 'admin')

const loading = ref(true)
const assignments = ref<Assignment[]>([])
const mySubmissions = ref<Submission[]>([])
const readonly = ref(false)

const load = async () => {
  loading.value = true
  try {
    const [list, cls] = await Promise.all([
      assignmentsSvc.list(classId.value),
      classesSvc.get(classId.value),
    ])
    assignments.value = list
    readonly.value = !!cls?.is_archived_for_user
    if (isTeacher.value) mySubmissions.value = []
    else await refreshMySubmissions()
  } catch {
    toast.err(t('general.error'))
  } finally {
    loading.value = false
  }
}
onMounted(load)

let submissionsRefresh: Promise<void> | null = null
const refreshMySubmissions = (options: { silent?: boolean } = {}) => {
  if (isTeacher.value) return Promise.resolve()
  // Фокус, pageshow и polling иногда срабатывают почти одновременно. Один
  // общий promise предотвращает тройной запрос и гонку старого ответа с новым.
  if (submissionsRefresh) return submissionsRefresh
  submissionsRefresh = (async () => {
    try {
      mySubmissions.value = await assignmentsSvc.mySubmissions()
    } catch (error) {
      console.error('[assignments] Failed to refresh submissions', error)
      if (!options.silent) toast.err(t('general.error'))
    } finally {
      submissionsRefresh = null
    }
  })()
  return submissionsRefresh
}

const SUBMISSIONS_SYNC_MS = 15_000
let submissionsSyncTimer: ReturnType<typeof setInterval> | null = null
const syncWhenVisible = () => {
  if (!document.hidden) refreshMySubmissions({ silent: true })
}
const onPageShow = () => refreshMySubmissions({ silent: true })

onMounted(() => {
  // Safari/Firefox могут восстановить страницу целиком из back-forward cache:
  // setup/onMounted повторно не выполняются, но pageshow приходит всегда.
  window.addEventListener('pageshow', onPageShow)
  window.addEventListener('focus', syncWhenVisible)
  document.addEventListener('visibilitychange', syncWhenVisible)
  submissionsSyncTimer = setInterval(syncWhenVisible, SUBMISSIONS_SYNC_MS)
})

onUnmounted(() => {
  window.removeEventListener('pageshow', onPageShow)
  window.removeEventListener('focus', syncWhenVisible)
  document.removeEventListener('visibilitychange', syncWhenVisible)
  if (submissionsSyncTimer) clearInterval(submissionsSyncTimer)
})

provideAssignmentListData({ assignments, mySubmissions, loading, classId, readonly, refreshMySubmissions })

const hasActiveAssignment = computed(() => route.params.assignmentId != null)
const activeId = computed(() => hasActiveAssignment.value ? Number(route.params.assignmentId) : null)

// Сворачивать список имеет смысл, только когда справа уже что-то открыто —
// иначе экран остался бы пустым и выбирать было бы не из чего.
const { collapsed, toggle: toggleCollapse } = useSidePanelCollapse()
const canCollapse = computed(() => !isMobile.value && hasActiveAssignment.value)
const isCollapsed = computed(() => canCollapse.value && collapsed.value)

const openAssignment = (id: number) => router.push(`/classes/${classId.value}/assignments/${id}`)
const goBack = () => router.push(`/classes/${classId.value}?tab=assignments`)
</script>

<style scoped>
.asg-page { height: 100%; display: flex; overflow: hidden; }
.asg-loading { flex: 1; display: flex; align-items: center; justify-content: center; }

.asg-left {
  position: relative; width: 420px; flex-shrink: 0; overflow: hidden;
  border-right: 1px solid var(--border); background: var(--surface);
  transition: width .34s cubic-bezier(.22,1,.36,1);
}
/* Внутренняя обёртка держит свою ширину, пока колонка схлопывается, — иначе
   на каждом кадре анимации карточки переверстывались бы под новую ширину. */
.asg-left-inner {
  width: 420px; height: 100%; display: flex; flex-direction: column;
  transition: opacity .22s ease-out;
}
.asg-left.collapsed { width: 56px; }
.asg-left.collapsed .asg-left-inner { opacity: 0; pointer-events: none; }

/* Тумблер сворачивания — в пустом верхнем углу колонки, над строкой «Назад» */
.asg-toggle {
  position: absolute; top: 15px; right: 12px; z-index: 2;
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  background: none; border: none; border-radius: 9px; cursor: pointer;
  color: var(--text4);
  transition: color .15s ease-out, background .15s ease-out, transform .12s cubic-bezier(.32,.72,0,1);
}
.asg-toggle:hover { color: var(--teal); background: var(--surface2); }
.asg-toggle:active { transform: scale(.92); }

.asg-left-head { font-size: 26px; font-weight: 800; letter-spacing: -.02em; color: var(--text1); margin: 4px 28px 20px; }
.asg-left-scroll { flex: 1; overflow-y: auto; padding: 0 28px 32px; }
.asg-back {
  display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
  margin: 20px 28px 4px; padding: 0; background: none; border: none;
  color: var(--text4); font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: color .15s;
}
.asg-back:hover { color: var(--teal); }

.asg-right { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 0; }
.asg-right > * { flex: 1; min-height: 0; }

@media (max-width: 900px) {
  .asg-left, .asg-left-inner { width: 360px; }
}

@media (max-width: 768px) {
  /* flex-direction меняется на column — без flex:1 + min-height:0 эти панели
     просто растут под весь свой контент (min-height:auto по умолчанию не даёт
     сжаться под доступную высоту), а .asg-page{overflow:hidden} обрезает
     лишнее вместо прокрутки. min-height:0 снимает этот флекс-минимум. */
  .asg-page { flex-direction: column; }
  /* На мобиле колонка занимает весь экран и не сворачивается (см. canCollapse) */
  .asg-left, .asg-left-inner { width: 100%; }
  .asg-left { border-right: none; flex: 1; min-height: 0; }
  .asg-left-head { margin: 4px 16px 16px; }
  .asg-left-scroll { padding: 0 16px 32px; }
  .asg-back { margin: 14px 16px 4px; }
  .asg-right { flex: 1; min-width: 0; min-height: 0; padding: 0; width: 100%; }
}

/* Workspace split-view: a light material rail beside a recessed detail area. */
.asg-page{background:var(--bg)}
.asg-left{width:396px;border-right-color:var(--border);background:linear-gradient(180deg,color-mix(in srgb,var(--surface) 88%,transparent),color-mix(in srgb,var(--surface2) 36%,var(--bg)));box-shadow:10px 0 34px rgba(28,28,30,.035)}
.asg-left-inner{width:396px}
.asg-left-head{margin:8px 24px 18px;font-size:28px;font-weight:770;letter-spacing:-.035em}
.asg-left-scroll{padding:0 20px 32px}
.asg-back{margin:22px 24px 4px;padding:6px 9px 6px 5px;border-radius:999px}
.asg-back:hover{background:var(--teal-l)}
.asg-toggle{top:19px;right:18px;width:36px;height:36px;border-radius:11px;background:color-mix(in srgb,var(--surface) 76%,transparent);border:1px solid var(--border)}
.asg-left.collapsed{width:60px}
.asg-right{padding:14px;background:linear-gradient(180deg,var(--bg),color-mix(in srgb,var(--bg) 90%,var(--surface) 10%))}
.asg-right>:deep(.adp.panel){border-radius:26px}

@media (max-width:900px){.asg-left,.asg-left-inner{width:350px}}
@media (max-width:768px){
  .asg-left,.asg-left-inner{width:100%}
  .asg-left-head{margin:6px 16px 16px;font-size:26px}
  .asg-left-scroll{padding:0 12px 32px}
  .asg-back{margin:14px 16px 4px}
  .asg-right{padding:0}
}
@media (prefers-reduced-transparency:reduce){.asg-left{background:var(--surface)}}
</style>
