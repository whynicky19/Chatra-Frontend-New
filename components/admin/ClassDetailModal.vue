<template>
  <Transition name="modal">
    <div v-if="classId" class="overlay" @click.self="$emit('close')">
      <div class="modal cl-modal">
        <!-- Обложка предмета как шапка -->
        <header class="cl-cover" :style="coverFallback">
          <SubjectCover :src="detail?.cover_image || card?.cover_thumbnail" :icon="detail?.cover_icon || card?.cover_icon"
                        :color="detail?.cover_color || card?.cover_color" :size="70" class="cl-cover-art"/>
          <button class="btn btn-icon cl-close" @click="$emit('close')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <h2 class="cl-title">{{ detail?.name || card?.name }}</h2>
          <div class="cl-sub">
            <span v-if="detail?.creator">{{ detail.creator.full_name || detail.creator.email }}</span>
            <template v-if="detail?.created_at"><span class="dot">·</span><span>создан {{ fmtDateLong(detail.created_at) }}</span></template>
          </div>
        </header>

        <div class="cl-facts">
          <div class="fact">
            <span class="fact-lbl">Участников</span>
            <span class="fact-val">{{ detail ? detail.member_count : '—' }}</span>
          </div>
          <div class="fact">
            <span class="fact-lbl">Токенов ИИ</span>
            <span class="fact-val">{{ detail ? fmtShort(detail.ai.total_tokens) : '—' }}</span>
          </div>
          <div class="fact">
            <span class="fact-lbl">Заданий</span>
            <span class="fact-val">{{ detail ? detail.content.assignments : '—' }}</span>
          </div>
          <button v-if="detail?.invite_code" class="fact fact-btn" title="Скопировать код" @click="copyCode">
            <span class="fact-lbl">Код входа</span>
            <span class="fact-val fact-code">{{ detail.invite_code }}</span>
          </button>
        </div>

        <div class="cl-body">
          <div v-if="loading" class="center-loading"><div class="spinner"></div></div>

          <template v-else-if="detail">
            <p v-if="detail.description" class="cl-desc">{{ detail.description }}</p>

            <!-- Содержимое предмета -->
            <section class="sec">
              <h3 class="sec-title">Содержимое</h3>
              <div class="tiles">
                <div class="tile">
                  <span class="tile-val">{{ detail.content.lectures }}</span>
                  <span class="tile-lbl">{{ plural(detail.content.lectures, ['лекция', 'лекции', 'лекций']) }}</span>
                </div>
                <div class="tile">
                  <span class="tile-val">{{ detail.content.assignments_active }}<span class="tile-of">/{{ detail.content.assignments }}</span></span>
                  <span class="tile-lbl">активных заданий</span>
                </div>
                <div class="tile">
                  <span class="tile-val">{{ detail.content.submissions }}</span>
                  <span class="tile-lbl">сдач работ</span>
                </div>
                <div class="tile">
                  <span class="tile-val">{{ detail.content.avg_score ?? '—' }}</span>
                  <span class="tile-lbl">средний балл ({{ detail.content.graded }} пров.)</span>
                </div>
              </div>
            </section>

            <!-- Расход ИИ -->
            <section class="sec">
              <h3 class="sec-title">
                Расход ИИ
                <span class="sec-note">{{ fmt(detail.ai.total_tokens) }} токенов · {{ fmt(detail.ai.request_count) }} зап.</span>
              </h3>
              <template v-if="detail.ai.by_endpoint.length">
                <div class="split">
                  <span v-for="k in detail.ai.by_endpoint" :key="k.endpoint" class="split-seg"
                        :style="{ width: sharePct(k.total_tokens) + '%', background: groupColor(k.group) }"
                        :title="`${k.label}: ${fmt(k.total_tokens)}`"></span>
                </div>
                <div class="kinds">
                  <div v-for="k in detail.ai.by_endpoint" :key="k.endpoint" class="kind">
                    <span class="kind-dot" :style="{ background: groupColor(k.group) }"></span>
                    <span class="kind-name">{{ k.label }}</span>
                    <span class="kind-req">{{ fmt(k.request_count) }} зап.</span>
                    <span class="kind-val">{{ fmt(k.total_tokens) }}</span>
                  </div>
                </div>
                <div class="io-note">
                  Входящие {{ fmt(detail.ai.prompt_tokens) }} · исходящие {{ fmt(detail.ai.completion_tokens) }}
                  <template v-if="detail.ai.last_used"> · последний запрос {{ fmtRelative(detail.ai.last_used) }}</template>
                </div>
              </template>
              <p v-else class="empty-line">К ИИ по этому предмету ещё не обращались</p>
            </section>

            <!-- Потоки -->
            <section v-if="detail.cohorts.length" class="sec">
              <h3 class="sec-title">Потоки</h3>
              <div class="cohorts">
                <div v-for="c in detail.cohorts" :key="c.id" :class="['cohort', { active: c.status === 'active' }]">
                  <span class="cohort-year">{{ c.academic_year }}</span>
                  <span class="cohort-status">{{ c.status === 'active' ? 'активный' : 'архив' }}</span>
                  <span class="cohort-n">{{ c.student_count }} {{ plural(c.student_count, ['ученик', 'ученика', 'учеников']) }}</span>
                </div>
              </div>
            </section>

            <!-- Участники -->
            <section class="sec">
              <h3 class="sec-title">
                Участники
                <span class="count">{{ detail.members.length }}</span>
              </h3>
              <div v-if="detail.members.length > 6" class="member-search">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input v-model="memberQuery" placeholder="Найти участника..."/>
              </div>
              <div v-if="filteredMembers.length" class="members">
                <div v-for="m in filteredMembers" :key="m.id" class="member">
                  <span class="m-avatar" :style="{ background: avatarColor(m.id) }">{{ initials(m.full_name || m.email) }}</span>
                  <span class="m-id">
                    <span class="m-name">
                      {{ m.full_name || m.email.split('@')[0] }}
                      <span v-if="!m.is_active" class="tag tag-off">заблокирован</span>
                    </span>
                    <span class="m-meta">{{ roleLabel(m.role) }} · {{ fmtRelative(m.last_active) }}</span>
                  </span>
                  <span class="m-tokens">{{ fmt(m.total_tokens) }}</span>
                </div>
              </div>
              <p v-else class="empty-line">{{ detail.members.length ? 'Никого не найдено' : 'Участников пока нет' }}</p>
            </section>

            <!-- Возврат студентов из прошлых потоков -->
            <section class="sec">
              <h3 class="sec-title">
                Вернуть студента
                <span v-if="rejoinable.length" class="count">{{ rejoinable.length }}</span>
              </h3>
              <p class="sec-hint">Состоявшие в предмете в прошлые учебные годы</p>
              <div v-if="loadingRejoin" class="center-loading center-loading-sm"><div class="spinner"></div></div>
              <div v-else-if="rejoinable.length" class="members">
                <div v-for="u in rejoinable" :key="u.id" class="member">
                  <span class="m-avatar" :style="{ background: avatarColor(u.id) }">{{ initials(u.full_name || u.email) }}</span>
                  <span class="m-id">
                    <span class="m-name">{{ u.full_name || u.email.split('@')[0] }}</span>
                    <span class="m-meta">{{ u.email }}</span>
                  </span>
                  <button class="btn btn-teal btn-sm" :disabled="addingId === u.id" @click="returnStudent(u)">
                    <div v-if="addingId === u.id" class="spinner spinner-btn"></div>
                    <span v-else>Вернуть</span>
                  </button>
                </div>
              </div>
              <p v-else class="empty-line">Нет студентов из прошлых лет</p>
            </section>
          </template>

          <p v-else class="empty-line">Не удалось загрузить карточку предмета</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAdminSvc } from '~/services/admin'
import type { AdminClassDetail } from '~/services/admin'
import { useClassesSvc } from '~/services/classes'
import { useAdminFormat, groupColor } from '~/composables/useAdminFormat'
import { useToast } from '~/composables/useToast'

const props = defineProps<{
  classId: number | null
  /** Карточка из сетки — обложка и название видны сразу, пока грузится детализация. */
  card: any | null
}>()
defineEmits<{ close: [] }>()

const adminSvc = useAdminSvc()
const classesSvc = useClassesSvc()
const toast = useToast()
const { fmt, fmtShort, plural, initials, avatarColor, roleLabel, fmtRelative, fmtDateLong } = useAdminFormat()

const detail = ref<AdminClassDetail | null>(null)
const loading = ref(false)
const memberQuery = ref('')
const rejoinable = ref<any[]>([])
const loadingRejoin = ref(false)
const addingId = ref<number | null>(null)

// Тот же набор оттенков, что у карточек предметов в сетке — обложка без
// картинки не должна менять цвет при открытии.
const COVERS = [
  'linear-gradient(135deg,var(--teal-h),var(--teal-d))',
  'linear-gradient(135deg,#BF5AF2,#8E3FCB)',
  'linear-gradient(135deg,#FF9F0A,#D67D00)',
  'linear-gradient(135deg,#30D158,#1E9E44)',
  'linear-gradient(135deg,#FF375F,#D91C46)',
]
const coverFallback = computed(() => {
  const c = detail.value || props.card
  if (c?.cover_image || c?.cover_thumbnail || c?.cover_color) return ''
  return `background:${COVERS[(props.classId || 0) % COVERS.length]}`
})

const maxKind = computed(() => (detail.value?.ai.total_tokens || 0) || 1)
const sharePct = (v: number) => Math.max(1, (v / maxKind.value) * 100)

const filteredMembers = computed(() => {
  const needle = memberQuery.value.trim().toLowerCase()
  const list = detail.value?.members || []
  if (!needle) return list
  return list.filter(m => m.email.toLowerCase().includes(needle)
    || (m.full_name || '').toLowerCase().includes(needle))
})

const load = async (id: number | null) => {
  detail.value = null
  rejoinable.value = []
  memberQuery.value = ''
  if (!id) return
  loading.value = true
  try { detail.value = await adminSvc.classDetail(id) } catch {}
  finally { loading.value = false }
  // Кандидаты на возврат грузятся отдельно: список живёт в другом сервисе и
  // нужен реже, чем сама карточка.
  loadingRejoin.value = true
  try {
    const students = await classesSvc.rejoinableStudents(id)
    // Пока запрос летел, админ мог открыть другой предмет.
    if (props.classId === id) rejoinable.value = students
  } catch {}
  finally { if (props.classId === id) loadingRejoin.value = false }
}
watch(() => props.classId, load, { immediate: true })

const returnStudent = async (u: any) => {
  if (!props.classId) return
  addingId.value = u.id
  try {
    await classesSvc.addMember(props.classId, u.id)
    rejoinable.value = rejoinable.value.filter(x => x.id !== u.id)
    detail.value = await adminSvc.classDetail(props.classId)
    toast.ok('Студент возвращён в предмет')
  } catch (e: any) {
    toast.err(e?.response?.data?.detail || 'Не удалось вернуть студента')
  } finally { addingId.value = null }
}

const copyCode = async () => {
  const code = detail.value?.invite_code
  if (!code) return
  try { await navigator.clipboard.writeText(code); toast.ok('Код скопирован') }
  catch { toast.err('Не удалось скопировать') }
}
</script>

<style scoped>
.cl-modal{
  --s-chat:#00B1C9;--s-grade:#AF52DE;--s-cover:#FF9500;--s-title:#FF2D55;--s-other:#8E8E93;
  max-width:640px;width:100%;padding:0;overflow:hidden;display:flex;flex-direction:column;
  max-height:calc(100vh - 64px);border-radius:var(--r-2xl)
}
html.dark .cl-modal{--s-chat:#1ba4b9;--s-grade:#9d41ca;--s-cover:#d17a05;--s-title:#d31e43}

.cl-cover{position:relative;height:170px;flex-shrink:0;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;padding:18px 22px}
.cl-cover-art{position:absolute;inset:0;z-index:0}
.cl-close{position:absolute;z-index:2;top:12px;right:12px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.2);color:#fff;backdrop-filter:blur(4px)}
.cl-close:hover{background:rgba(0,0,0,.65)}
.cl-title{position:relative;z-index:1;font-size:22px;font-weight:800;letter-spacing:-.02em;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.5)}
.cl-sub{position:relative;z-index:1;display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:12px;font-weight:600;color:rgba(255,255,255,.9);text-shadow:0 1px 6px rgba(0,0,0,.5);margin-top:3px}
.cl-sub .dot{opacity:.7}

.cl-facts{display:grid;grid-template-columns:repeat(4,1fr);flex-shrink:0;border-bottom:1px solid var(--border)}
.fact{display:flex;flex-direction:column;gap:2px;padding:12px 14px;border-right:1px solid var(--border);background:none;border-top:none;border-bottom:none;border-left:none;text-align:left;font-family:inherit;min-width:0}
.fact:last-child{border-right:none}
.fact-btn{cursor:pointer;transition:background .15s}
.fact-btn:hover{background:var(--surface2)}
.fact-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fact-val{font-size:16px;font-weight:700;color:var(--text1);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fact-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.04em;color:var(--teal);font-size:15px}

.cl-body{overflow-y:auto;padding:0 22px 22px;flex:1;min-height:0}
.cl-desc{font-size:13px;line-height:1.5;color:var(--text3);margin-top:16px;white-space:pre-wrap}
.sec{padding-top:18px}
.sec+.sec{border-top:1px solid var(--border);margin-top:18px}
.sec-title{display:flex;align-items:baseline;gap:8px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--text4);margin-bottom:12px}
.sec-note{font-weight:600;text-transform:none;letter-spacing:0;font-size:11.5px;font-variant-numeric:tabular-nums;margin-left:auto}
.sec-hint{font-size:12px;color:var(--text4);margin:-6px 0 10px}
.count{background:var(--surface2);color:var(--text3);font-size:10px;font-weight:800;padding:1px 7px;border-radius:100px}
.empty-line{font-size:13px;color:var(--text4);padding:4px 0}

.tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.tile{display:flex;flex-direction:column;gap:2px;padding:11px 12px;background:var(--surface2);border-radius:13px;min-width:0}
.tile-val{font-size:18px;font-weight:800;letter-spacing:-.02em;color:var(--text1);font-variant-numeric:tabular-nums}
.tile-of{font-size:13px;font-weight:600;color:var(--text4)}
.tile-lbl{font-size:10.5px;color:var(--text4);overflow:hidden;text-overflow:ellipsis}

.split{display:flex;gap:2px;height:12px;margin-bottom:12px}
.split-seg{display:block;height:100%;border-radius:3px}
.split-seg:first-child{border-top-left-radius:6px;border-bottom-left-radius:6px}
.split-seg:last-child{border-top-right-radius:6px;border-bottom-right-radius:6px}
.kinds{display:flex;flex-direction:column;gap:3px}
.kind{display:grid;grid-template-columns:9px 1fr auto auto;align-items:center;gap:10px;padding:3px 0}
.kind-dot{width:9px;height:9px;border-radius:3px}
.kind-name{font-size:12.5px;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kind-req{font-size:11px;color:var(--text4);font-variant-numeric:tabular-nums}
.kind-val{font-size:12.5px;font-weight:700;color:var(--text1);font-variant-numeric:tabular-nums;min-width:54px;text-align:right}
.io-note{margin-top:10px;font-size:11.5px;color:var(--text4)}

.cohorts{display:flex;flex-wrap:wrap;gap:8px}
.cohort{display:flex;flex-direction:column;gap:1px;padding:9px 12px;background:var(--surface2);border:1px solid transparent;border-radius:12px;min-width:120px}
.cohort.active{background:rgba(var(--teal-rgb),.08);border-color:rgba(var(--teal-rgb),.25)}
.cohort-year{font-size:13px;font-weight:700;color:var(--text1)}
.cohort-status{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--text4)}
.cohort.active .cohort-status{color:var(--teal)}
.cohort-n{font-size:11.5px;color:var(--text3)}

.member-search{display:flex;align-items:center;gap:7px;background:var(--surface2);border-radius:10px;padding:7px 10px;margin-bottom:8px;color:var(--text4)}
.member-search input{flex:1;border:none;background:none;font-size:12.5px;color:var(--text1)}
.members{display:flex;flex-direction:column;max-height:300px;overflow-y:auto;background:var(--surface2);border-radius:13px;padding:0 12px}
.member{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)}
.member:last-child{border-bottom:none}
.m-avatar{width:30px;height:30px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800;flex-shrink:0}
.m-id{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}
.m-name{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.m-meta{font-size:11.5px;color:var(--text4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.m-tokens{font-size:12.5px;font-weight:700;color:var(--text2);font-variant-numeric:tabular-nums}
.tag{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.03em;padding:1px 6px;border-radius:100px;flex-shrink:0}
.tag-off{color:var(--red);background:var(--red-l)}

.center-loading{display:flex;justify-content:center;padding:36px}
.center-loading-sm{padding:16px}
.spinner-btn{width:12px;height:12px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff}

@media (max-width:768px){
  .cl-modal{max-width:none;max-height:92vh}
  .cl-cover{height:150px;padding:16px}
  .cl-title{font-size:19px}
  .cl-body{padding:0 16px 18px}
  .cl-facts{grid-template-columns:1fr 1fr}
  .fact:nth-child(2){border-right:none}
  .fact:nth-child(-n+2){border-bottom:1px solid var(--border)}
  .tiles{grid-template-columns:1fr 1fr}
}
</style>
