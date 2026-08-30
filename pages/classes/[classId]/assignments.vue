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
import { ref, computed, onMounted } from 'vue'
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
    mySubmissions.value = isTeacher.value ? [] : await assignmentsSvc.mySubmissions()
  } catch {
    toast.err(t('general.error'))
  } finally {
    loading.value = false
  }
}
onMounted(load)

const refreshMySubmissions = async () => {
  if (isTeacher.value) return
  try { mySubmissions.value = await assignmentsSvc.mySubmissions() } catch {}
}

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
</style>
