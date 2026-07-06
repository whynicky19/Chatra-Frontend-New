<template>
  <div class="pg anim-in">
    <div class="pg-body">
      <div class="content-area">
        <!-- Header -->
        <div class="ro-head">
          <button class="ro-back" @click="goBack">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6"/></svg>
            {{ t('nav.classes') }}
          </button>
          <h1 class="pg-title">{{ t('rollover.title') }}</h1>
          <p class="pg-sub">{{ t('rollover.subtitle') }}</p>

          <!-- Step indicator -->
          <div v-if="!loading && items.length" class="ro-steps">
            <div v-for="(s, i) in stepList" :key="i" class="ro-step" :class="{ active: stepIndex === i, done: stepIndex > i }">
              <div class="ro-step-dot">
                <svg v-if="stepIndex > i" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                <span v-else>{{ i + 1 }}</span>
              </div>
              <span class="ro-step-label">{{ s }}</span>
              <span v-if="i < stepList.length - 1" class="ro-step-line"></span>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="ro-load"><div class="spin-ring"></div></div>

        <!-- ═══ STAGE 1 — SELECT ═══ -->
        <template v-else-if="stage === 'select'">
          <div v-if="!items.length" class="empty-state">
            <div class="es-icon-wrap">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
            </div>
            <div class="es-title">{{ t('rollover.no_classes') }}</div>
          </div>

          <template v-else>
            <div class="ro-section-label">{{ t('rollover.select_classes') }}</div>
            <div class="ro-group">
              <button v-for="it in items" :key="it.class_id" class="ro-row" :class="{ checked: selected.has(it.class_id) }" @click="toggle(it.class_id)">
                <span class="ro-check" :class="{ on: selected.has(it.class_id) }">
                  <svg v-if="selected.has(it.class_id)" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <div class="ro-class-info">
                  <div class="ro-class-name">{{ it.class_name }}</div>
                  <div class="ro-class-meta">
                    <span class="ro-year-chip">{{ it.academic_year }}</span>
                    <span class="ro-meta-item">{{ it.student_count }} {{ t('cohort.students_short') }}</span>
                    <span class="ro-meta-dot">·</span>
                    <span class="ro-meta-item">{{ it.assignment_count }} {{ lang==='ru' ? 'заданий' : lang==='kk' ? 'тапсырма' : 'assignments' }}</span>
                  </div>
                </div>
              </button>
            </div>

            <div class="ro-fields">
              <div class="ro-field">
                <label class="field-label">{{ t('rollover.new_year') }}</label>
                <input v-model="newYear" class="field-input" placeholder="2026/2027" pattern="\d{4}/\d{4}"/>
              </div>
              <div class="ro-field">
                <label class="field-label">{{ t('rollover.start_date') }}</label>
                <input v-model="newStartDate" type="date" class="field-input"/>
              </div>
            </div>

            <div class="ro-actions">
              <button class="btn btn-teal" :disabled="!canContinue" @click="stage = 'confirm'">{{ t('rollover.continue') }} →</button>
            </div>
          </template>
        </template>

        <!-- ═══ STAGE 2 — CONFIRM ═══ -->
        <template v-else-if="stage === 'confirm'">
          <div class="ro-confirm-card">
            <div class="ro-confirm-title">{{ t('rollover.confirm_title') }}</div>
            <p class="ro-confirm-intro">{{ t('rollover.confirm_intro') }}</p>
            <ul class="ro-confirm-list">
              <li v-for="it in selectedItems" :key="it.class_id">
                <strong>{{ it.class_name }}</strong>
                <span class="ro-confirm-year">{{ it.academic_year }} → {{ newYear }}</span>
              </li>
            </ul>
            <div class="ro-confirm-summary">
              <span>{{ t('rollover.new_year') }}: <strong>{{ newYear }}</strong></span>
              <span>{{ t('rollover.start_date') }}: <strong>{{ newStartDate }}</strong></span>
            </div>
          </div>
          <div class="ro-actions">
            <button class="btn btn-white" :disabled="processing" @click="stage = 'select'">{{ t('general.back') }}</button>
            <button class="btn btn-danger" :disabled="processing" @click="runRollover">
              <div v-if="processing" class="spinner" style="width:13px;height:13px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
              <span v-else>{{ t('rollover.confirm_btn') }}</span>
            </button>
          </div>
        </template>

        <!-- ═══ STAGE 3 — RESULT / DEADLINE DRAFTS ═══ -->
        <template v-else-if="stage === 'result'">
          <div class="ro-result-head">
            <div class="ro-section-label">{{ t('rollover.done_title') }}</div>
            <p class="pg-sub">{{ t('rollover.done_intro') }}</p>
          </div>

          <div v-for="grp in resultGroups" :key="grp.classId" class="ro-result-card">
            <div class="ro-result-top">
              <div class="ro-result-name">{{ grp.className }}</div>
              <div class="ro-result-status" :class="grp.status">{{ statusLabel(grp.status) }}</div>
            </div>

            <template v-if="grp.cohortId">
              <div v-if="!grp.deadlines.length" class="ro-no-deadlines">{{ t('rollover.no_deadlines') }}</div>
              <template v-else>
                <div class="ro-dl-list">
                  <div v-for="d in grp.deadlines" :key="d.id" class="ro-dl-row">
                    <div class="ro-dl-title">{{ d.assignment_title || ('#' + d.assignment_id) }}</div>
                    <input
                      type="datetime-local"
                      class="field-input ro-dl-date"
                      :value="toLocalInput(d.due_date)"
                      @change="onDeadlineDate(grp, d, $event)"
                    />
                    <span v-if="d.is_published" class="ro-dl-badge published">{{ t('rollover.published') }}</span>
                    <button v-else class="btn btn-white btn-sm ro-dl-publish" @click="publishOne(grp, d)">{{ t('rollover.publish') }}</button>
                  </div>
                </div>
                <div class="ro-dl-actions" v-if="grp.deadlines.some(d => !d.is_published)">
                  <button class="btn btn-teal btn-sm" @click="publishAll(grp)">{{ t('rollover.publish_all') }}</button>
                </div>
                <div v-else class="ro-all-published">✓ {{ t('rollover.all_published') }}</div>
              </template>
            </template>
          </div>

          <div class="ro-actions">
            <button class="btn btn-teal" @click="goBack">{{ t('nav.classes') }} →</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from '#app'
import { useAuthStore } from '~/stores/auth.store'
import { useCohortsSvc, type RolloverPreviewItem, type DeadlineResponse } from '~/services/cohorts'
import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'

definePageMeta({ layout: 'default' })

const router = useRouter()
const auth = useAuthStore()
const cohortsSvc = useCohortsSvc()
const toast = useToast()
const { t, lang } = useI18n()

type Stage = 'select' | 'confirm' | 'result'
const stage = ref<Stage>('select')
const stepList = computed(() => lang.value === 'ru'
  ? ['Классы', 'Подтверждение', 'Дедлайны']
  : lang.value === 'kk' ? ['Сыныптар', 'Растау', 'Мерзімдер']
  : ['Classes', 'Confirm', 'Deadlines'])
const stepIndex = computed(() => stage.value === 'select' ? 0 : stage.value === 'confirm' ? 1 : 2)
const loading = ref(true)
const processing = ref(false)

const items = ref<RolloverPreviewItem[]>([])
const selected = ref<Set<number>>(new Set())

// Учебный год по умолчанию — на основе текущей даты (напр. 2026/2027).
const defaultYear = () => {
  const now = new Date()
  const y = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1
  return `${y}/${y + 1}`
}
const newYear = ref(defaultYear())
const newStartDate = ref(`${defaultYear().slice(0, 4)}-09-01`)

interface ResultGroup {
  classId: number
  className: string
  status: string
  cohortId: number | null
  deadlines: DeadlineResponse[]
}
const resultGroups = ref<ResultGroup[]>([])

const selectedItems = computed(() => items.value.filter(i => selected.value.has(i.class_id)))
const canContinue = computed(() => selected.value.size > 0 && /^\d{4}\/\d{4}$/.test(newYear.value) && !!newStartDate.value)

const toggle = (id: number) => {
  const s = new Set(selected.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  selected.value = s
}

const goBack = () => router.push('/classes')

const load = async () => {
  loading.value = true
  try {
    items.value = await cohortsSvc.rolloverPreview()
    // По умолчанию выбираем все классы
    selected.value = new Set(items.value.map(i => i.class_id))
  } catch (e: any) {
    toast.err(e?.response?.data?.detail || t('general.error'))
  } finally {
    loading.value = false
  }
}

const statusLabel = (s: string) => ({
  rolled: t('rollover.status_rolled'),
  already_rolled: t('rollover.status_already'),
  no_active_cohort: t('rollover.status_no_cohort'),
  conflict: t('rollover.status_conflict'),
}[s] || s)

const runRollover = async () => {
  if (processing.value) return
  processing.value = true
  try {
    const results = await cohortsSvc.rollover({
      class_ids: [...selected.value],
      new_academic_year: newYear.value,
      new_start_date: newStartDate.value,
    })
    const nameOf = (id: number) => items.value.find(i => i.class_id === id)?.class_name || `#${id}`
    const groups: ResultGroup[] = []
    for (const r of results) {
      const g: ResultGroup = {
        classId: r.class_id,
        className: nameOf(r.class_id),
        status: r.status,
        cohortId: r.new_cohort_id ?? null,
        deadlines: [],
      }
      if (g.cohortId) {
        try { g.deadlines = await cohortsSvc.cohortDeadlines(g.cohortId) } catch {}
      }
      groups.push(g)
    }
    resultGroups.value = groups
    stage.value = 'result'
  } catch (e: any) {
    toast.err(e?.response?.data?.detail || t('general.error'))
  } finally {
    processing.value = false
  }
}

// datetime-local <-> ISO
const toLocalInput = (iso: string) => {
  try {
    const d = new Date(iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z')
    const off = d.getTimezoneOffset()
    return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16)
  } catch { return '' }
}

const onDeadlineDate = async (grp: ResultGroup, d: DeadlineResponse, e: Event) => {
  const val = (e.target as HTMLInputElement).value
  if (!val) return
  try {
    const updated = await cohortsSvc.updateDeadline(d.id, { due_date: new Date(val).toISOString() })
    Object.assign(d, updated)
    toast.ok(t('general.save'))
  } catch (err: any) { toast.err(err?.response?.data?.detail || t('general.error')) }
}

const publishOne = async (grp: ResultGroup, d: DeadlineResponse) => {
  try {
    const updated = await cohortsSvc.updateDeadline(d.id, { is_published: true })
    Object.assign(d, updated)
    toast.ok(t('rollover.published'))
  } catch (err: any) { toast.err(err?.response?.data?.detail || t('general.error')) }
}

const publishAll = async (grp: ResultGroup) => {
  if (!grp.cohortId) return
  try {
    await cohortsSvc.publishAllDeadlines(grp.cohortId)
    grp.deadlines = grp.deadlines.map(d => ({ ...d, is_published: true }))
    toast.ok(t('rollover.all_published'))
  } catch (err: any) { toast.err(err?.response?.data?.detail || t('general.error')) }
}

onMounted(() => {
  // Только преподаватель/админ
  if (!(auth.user?.role === 'teacher' || auth.user?.role === 'admin')) {
    router.replace('/classes')
    return
  }
  load()
})
</script>

<style scoped>
.pg{height:100%;display:flex;flex-direction:column;background:var(--bg);overflow:hidden}
.pg-body{flex:1;overflow-y:auto;width:100%}
.content-area{padding:32px 32px 80px;width:100%;box-sizing:border-box;max-width:820px}
.spin-ring{width:30px;height:30px;border:3px solid var(--border2);border-top-color:var(--teal);border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.ro-load{display:flex;justify-content:center;padding:60px}

.ro-head{margin-bottom:28px}
.ro-back{display:inline-flex;align-items:center;gap:6px;background:none;border:none;color:var(--text4);font-size:13px;font-weight:600;cursor:pointer;padding:0;margin-bottom:14px;font-family:inherit;transition:color .15s}
.ro-back:hover{color:var(--teal)}
.pg-title{font-size:26px;font-weight:900;color:var(--text1);letter-spacing:-.02em;margin-bottom:6px}
.pg-sub{font-size:14px;color:var(--text4);line-height:1.6;max-width:560px}

.ro-section-label{font-size:12px;font-weight:600;color:var(--text4);letter-spacing:.02em;margin:0 4px 10px;text-transform:uppercase}

/* Step indicator */
.ro-steps{display:flex;align-items:center;margin-top:22px}
.ro-step{display:flex;align-items:center;gap:8px;position:relative}
.ro-step-dot{width:24px;height:24px;border-radius:50%;background:var(--surface2);color:var(--text4);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;transition:all .25s;border:1px solid var(--border)}
.ro-step.active .ro-step-dot{background:var(--teal);color:#fff;border-color:var(--teal);box-shadow:0 0 0 4px rgba(var(--teal-rgb),.14)}
.ro-step.done .ro-step-dot{background:var(--teal);color:#fff;border-color:var(--teal)}
.ro-step-label{font-size:13px;font-weight:600;color:var(--text4);white-space:nowrap}
.ro-step.active .ro-step-label,.ro-step.done .ro-step-label{color:var(--text1)}
.ro-step-line{width:28px;height:1.5px;background:var(--border2);margin:0 6px;border-radius:2px}
.ro-step.done .ro-step-line{background:var(--teal)}

/* Class selection — iOS grouped inset list */
.ro-group{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--sh-xs);margin-bottom:24px}
.ro-row{display:flex;align-items:center;gap:14px;width:100%;padding:15px 18px;background:transparent;border:none;border-top:1px solid var(--border);cursor:pointer;font-family:inherit;text-align:left;transition:background .15s}
.ro-row:first-child{border-top:none}
.ro-row:hover{background:var(--bg)}
.ro-row:active{background:var(--surface2)}
.ro-check{width:22px;height:22px;border-radius:50%;border:1.5px solid var(--border2);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;transition:all .2s}
.ro-check.on{background:var(--teal);border-color:var(--teal)}
.ro-class-info{flex:1;min-width:0}
.ro-class-name{font-size:15px;font-weight:600;color:var(--text1);margin-bottom:4px}
.ro-class-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ro-year-chip{font-size:11px;font-weight:700;color:var(--teal);background:var(--teal-l);padding:2px 8px;border-radius:6px}
.ro-meta-item{font-size:12.5px;color:var(--text4)}
.ro-meta-dot{color:var(--text4);opacity:.6}

.ro-fields{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
.ro-field{display:flex;flex-direction:column;gap:8px}
.field-label{font-size:12px;font-weight:600;color:var(--text3);letter-spacing:.01em;margin-left:2px}
.field-input{padding:12px 14px;background:var(--surface);border:1px solid var(--border2);border-radius:var(--r-md);color:var(--text1);font-size:15px;font-family:inherit;outline:none;transition:border-color .15s,box-shadow .15s}
.field-input:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(var(--teal-rgb),.12)}

.ro-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:8px}

/* Confirm */
.ro-confirm-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:24px;margin-bottom:20px;box-shadow:var(--sh-xs)}
.ro-confirm-title{font-size:18px;font-weight:800;color:var(--text1);margin-bottom:8px;letter-spacing:-.01em}
.ro-confirm-intro{font-size:14px;color:var(--text3);line-height:1.6;margin-bottom:16px}
.ro-confirm-list{list-style:none;display:flex;flex-direction:column;gap:0;margin-bottom:18px;border:1px solid var(--border);border-radius:var(--r-md);overflow:hidden}
.ro-confirm-list li{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 15px;background:var(--bg);border-top:1px solid var(--border);font-size:14.5px;color:var(--text1)}
.ro-confirm-list li:first-child{border-top:none}
.ro-confirm-year{font-size:12px;font-weight:700;color:var(--text4)}
.ro-confirm-summary{display:flex;gap:20px;flex-wrap:wrap;font-size:13px;color:var(--text3);border-top:1px solid var(--border);padding-top:16px}

/* Result */
.ro-result-head{margin-bottom:18px}
.ro-result-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:18px 20px;margin-bottom:16px;box-shadow:var(--sh-xs)}
.ro-result-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.ro-result-name{font-size:16px;font-weight:800;color:var(--text1);letter-spacing:-.01em}
.ro-result-status{font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;letter-spacing:.04em}
.ro-result-status.rolled{color:var(--teal);background:var(--teal-l)}
.ro-result-status.already_rolled{color:var(--text4);background:var(--surface3)}
.ro-result-status.no_active_cohort,.ro-result-status.conflict{color:var(--red);background:var(--red-l)}
.ro-no-deadlines{font-size:13px;color:var(--text4);padding:8px 0}
.ro-dl-list{display:flex;flex-direction:column;gap:10px}
.ro-dl-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.ro-dl-title{flex:1;min-width:160px;font-size:13.5px;font-weight:600;color:var(--text2)}
.ro-dl-date{width:auto;padding:7px 10px;font-size:13px}
.ro-dl-badge{font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px}
.ro-dl-badge.published{color:var(--teal);background:var(--teal-l)}
.ro-dl-actions{margin-top:14px;display:flex;justify-content:flex-end}
.ro-all-published{margin-top:12px;font-size:12.5px;font-weight:600;color:var(--teal)}
.btn-sm{padding:6px 12px;font-size:12px}

.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:56px 40px;gap:12px;text-align:center}
.es-icon-wrap{width:68px;height:68px;border-radius:18px;background:var(--teal-l);border:1px solid rgba(var(--teal-rgb),.2);display:flex;align-items:center;justify-content:center;color:var(--teal)}
.es-title{font-size:15px;color:var(--text3);max-width:360px;line-height:1.6}

@media (max-width:768px){
  .content-area{padding:16px 12px 80px}
  .ro-fields{grid-template-columns:1fr}
  .ro-actions{flex-direction:column-reverse}
  .ro-actions .btn{width:100%}
  .ro-dl-date{width:100%}
}
</style>
