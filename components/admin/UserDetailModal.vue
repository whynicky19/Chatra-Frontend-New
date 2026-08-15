<template>
  <Transition name="modal">
    <div v-if="userId" class="overlay" @click.self="$emit('close')">
      <div class="modal user-modal">
        <!-- Шапка: кто это и в каком он состоянии -->
        <header class="u-head">
          <span class="u-avatar" :style="{ background: avatarColor(userId) }">{{ initials(name) }}</span>
          <div class="u-id">
            <h2 class="u-name">{{ name }}</h2>
            <a class="u-email" :href="`mailto:${row?.email}`">{{ row?.email }}</a>
          </div>
          <button class="btn btn-icon btn-ghost u-close" @click="$emit('close')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </header>

        <div class="u-chips">
          <span class="chip chip-role">{{ roleLabel(row?.role) }}</span>
          <!-- Активен — состояние по умолчанию: чип показывается только когда
               с аккаунтом что-то не так. -->
          <span v-if="row && !row.is_active" class="chip chip-off">
            <span class="chip-led"></span>Заблокирован
          </span>
          <span v-if="row?.ai_unlimited" class="chip chip-teal">Безлимит ИИ</span>
          <span v-if="row && !row.is_verified" class="chip chip-warn">Email не подтверждён</span>
        </div>

        <div class="u-body">
          <div v-if="loading" class="center-loading"><div class="spinner"></div></div>

          <template v-else-if="detail">
            <!-- ИИ -->
            <section class="u-sec">
              <h3 class="u-sec-title">Расход ИИ</h3>
              <div class="u-tiles">
                <div class="u-tile">
                  <span class="u-tile-val">{{ fmt(detail.ai.total_tokens) }}</span>
                  <span class="u-tile-lbl">токенов всего</span>
                </div>
                <div class="u-tile">
                  <span class="u-tile-val">{{ fmt(detail.ai.request_count) }}</span>
                  <span class="u-tile-lbl">{{ plural(detail.ai.request_count, ['запрос', 'запроса', 'запросов']) }}</span>
                </div>
                <div class="u-tile">
                  <span class="u-tile-val">{{ fmt(detail.ai.avg_tokens) }}</span>
                  <span class="u-tile-lbl">в среднем на запрос</span>
                </div>
              </div>

              <!-- Дневная квота — то, по чему бэкенд реально отказывает -->
              <div class="quota">
                <div class="quota-head">
                  <span>Сегодня использовано</span>
                  <strong>
                    {{ detail.ai.messages_today }}<template v-if="detail.ai.message_limit"> из {{ detail.ai.message_limit }}</template>
                    {{ plural(detail.ai.message_limit || detail.ai.messages_today, ['сообщение', 'сообщения', 'сообщений']) }}
                  </strong>
                </div>
                <div class="quota-track">
                  <span :class="['quota-fill', quotaState]" :style="{ width: quotaPct + '%' }"></span>
                </div>
                <div class="quota-note">
                  {{ row?.ai_unlimited ? 'Лимит снят администратором' : (detail.ai.message_limit ? 'Счётчик обнуляется в 00:00 UTC' : 'Лимит сообщений отключён') }}
                </div>
              </div>

              <div v-if="detail.ai.by_endpoint.length" class="kinds">
                <div v-for="k in detail.ai.by_endpoint" :key="k.endpoint" class="kind">
                  <span class="kind-dot" :style="{ background: groupColor(k.group) }"></span>
                  <span class="kind-name">{{ k.label }}</span>
                  <span class="kind-bar"><span :style="{ width: kindPct(k.total_tokens) + '%', background: groupColor(k.group) }"></span></span>
                  <span class="kind-req">{{ fmt(k.request_count) }} зап.</span>
                  <span class="kind-val">{{ fmt(k.total_tokens) }}</span>
                </div>
              </div>
              <p v-else class="u-empty">Запросов к ИИ ещё не было</p>
            </section>

            <!-- Предметы -->
            <section class="u-sec">
              <h3 class="u-sec-title">
                Предметы
                <span v-if="detail.classes.length" class="u-count">{{ detail.classes.length }}</span>
              </h3>
              <div v-if="detail.classes.length" class="cl-list">
                <div v-for="c in detail.classes" :key="c.id" class="cl-row">
                  <!-- SubjectCover заполняет контейнер целиком (иконку масштабирует
                       только size), поэтому ему нужна коробка фиксированного размера. -->
                  <span class="cl-cover">
                    <SubjectCover :src="c.cover_thumbnail" :icon="c.cover_icon" :color="c.cover_color" :size="17"/>
                  </span>
                  <span class="cl-name">{{ c.name }}</span>
                  <span v-if="c.role === 'creator'" class="chip chip-mini">создатель</span>
                  <span class="cl-tokens">{{ fmt(c.total_tokens) }}</span>
                </div>
              </div>
              <p v-else class="u-empty">Не состоит ни в одном предмете</p>
              <div v-if="detail.ai.general_tokens" class="cl-general">
                Вне предметов (общий ассистент): <strong>{{ fmt(detail.ai.general_tokens) }}</strong> токенов
                за {{ fmt(detail.ai.general_requests) }} {{ plural(detail.ai.general_requests, ['запрос', 'запроса', 'запросов']) }}
              </div>
            </section>

            <!-- Учебная активность -->
            <section class="u-sec">
              <h3 class="u-sec-title">Учебная активность</h3>
              <div class="facts">
                <div class="fact">
                  <span class="fact-lbl">Сдано работ</span>
                  <span class="fact-val">{{ fmt(detail.activity.submissions) }}</span>
                </div>
                <div class="fact">
                  <span class="fact-lbl">Проверено</span>
                  <span class="fact-val">{{ fmt(detail.activity.graded) }}</span>
                </div>
                <div class="fact">
                  <span class="fact-lbl">Средний балл</span>
                  <span class="fact-val">{{ detail.activity.avg_score ?? '—' }}</span>
                </div>
                <div class="fact">
                  <span class="fact-lbl">{{ detail.role === 'student' ? 'Публикаций' : 'Заданий' }}</span>
                  <span class="fact-val">{{ fmt(detail.role === 'student' ? detail.activity.posts : detail.activity.assignments_created) }}</span>
                </div>
              </div>
              <div class="meta-rows">
                <div class="meta-row">
                  <span>Последняя активность</span>
                  <strong>{{ fmtRelative(detail.last_active) }}</strong>
                </div>
                <div class="meta-row">
                  <span>Зарегистрирован</span>
                  <strong>{{ detail.created_at ? fmtDateLong(detail.created_at) : 'Неизвестно' }}</strong>
                </div>
                <div class="meta-row">
                  <span>ID аккаунта</span>
                  <strong>#{{ detail.id }}</strong>
                </div>
              </div>
            </section>

            <!-- Управление -->
            <section class="u-sec">
              <h3 class="u-sec-title">Управление</h3>
              <div class="ctl-row">
                <span class="ctl-lbl">Роль</span>
                <select class="ctl-sel" :value="row?.role" :disabled="isSelf || busy"
                        @change="$emit('role', userId, ($event.target as HTMLSelectElement).value)">
                  <option value="student">Ученик</option>
                  <option value="teacher">Учитель</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              <div class="ctl-row">
                <span class="ctl-lbl">
                  Безлимитный ИИ
                  <span class="ctl-hint">снимает дневной лимит сообщений</span>
                </span>
                <button type="button" role="switch" :aria-checked="!!row?.ai_unlimited"
                        :class="['ai-switch', { on: row?.ai_unlimited }]" :disabled="busy"
                        @click="$emit('unlimited', userId, !row?.ai_unlimited)">
                  <span class="ai-switch-thumb"></span>
                </button>
              </div>
              <div v-if="isSelf" class="ctl-self">Это ваш аккаунт — роль и блокировка недоступны</div>
              <div v-else class="ctl-actions">
                <button v-if="row?.is_active" class="btn btn-white btn-danger-text" :disabled="busy"
                        @click="$emit('block', userId)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                  Заблокировать пользователя
                </button>
                <button v-else class="btn btn-white" :disabled="busy" @click="$emit('unblock', userId)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  Разблокировать
                </button>
                <button class="btn btn-white btn-danger-text" :disabled="busy" @click="$emit('remove', userId)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                  Удалить аккаунт
                </button>
              </div>
            </section>
          </template>

          <p v-else class="u-empty">Не удалось загрузить карточку</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAdminSvc } from '~/services/admin'
import type { AdminUserRow, AdminUserDetail } from '~/services/admin'
import { useAdminFormat, groupColor } from '~/composables/useAdminFormat'

const props = defineProps<{
  userId: number | null
  /** Строка из списка — показывает шапку и чипы мгновенно, пока грузится карточка. */
  row: AdminUserRow | null
  isSelf?: boolean
  busy?: boolean
}>()
defineEmits<{
  close: []
  role: [id: number, role: string]
  unlimited: [id: number, value: boolean]
  block: [id: number]
  unblock: [id: number]
  remove: [id: number]
}>()

const adminSvc = useAdminSvc()
const { fmt, plural, initials, avatarColor, roleLabel, fmtRelative, fmtDateLong } = useAdminFormat()

const detail = ref<AdminUserDetail | null>(null)
const loading = ref(false)

const name = computed(() => props.row?.full_name || props.row?.email?.split('@')[0] || '')

const maxKind = computed(() => Math.max(1, ...(detail.value?.ai.by_endpoint || []).map(k => k.total_tokens)))
const kindPct = (v: number) => Math.max(2, (v / maxKind.value) * 100)

const quotaPct = computed(() => {
  const ai = detail.value?.ai
  if (!ai) return 0
  // Безлимит и выключенный лимит — полоса всегда пустая: делить не на что.
  if (props.row?.ai_unlimited || !ai.message_limit) return 0
  return Math.min(100, (ai.messages_today / ai.message_limit) * 100)
})
const quotaState = computed(() => (quotaPct.value >= 90 ? 'danger' : quotaPct.value >= 70 ? 'warn' : 'ok'))

const load = async (id: number | null) => {
  detail.value = null
  if (!id) return
  loading.value = true
  try { detail.value = await adminSvc.userDetail(id) } catch {}
  finally { loading.value = false }
}
watch(() => props.userId, load, { immediate: true })
// Роль/блокировка/безлимит меняются снаружи — перечитываем карточку, чтобы
// цифры под чипами не разошлись с новым состоянием.
watch(() => [props.row?.role, props.row?.is_active, props.row?.ai_unlimited], () => {
  if (props.userId && detail.value) load(props.userId)
})
</script>

<style scoped>
.user-modal{
  --s-chat:#00B1C9;--s-grade:#AF52DE;--s-cover:#FF9500;--s-title:#FF2D55;--s-other:#8E8E93;
  max-width:520px;width:100%;padding:0;overflow:hidden;display:flex;flex-direction:column;
  max-height:calc(100vh - 64px);border-radius:var(--r-2xl)
}
html.dark .user-modal{--s-chat:#1ba4b9;--s-grade:#9d41ca;--s-cover:#d17a05;--s-title:#d31e43}

.u-head{display:flex;align-items:center;gap:14px;padding:20px 20px 12px;flex-shrink:0}
.u-avatar{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:17px;font-weight:800;letter-spacing:.02em;flex-shrink:0}
.u-id{min-width:0;flex:1}
.u-name{font-size:19px;font-weight:800;letter-spacing:-.02em;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.u-email{display:block;font-size:13px;color:var(--text4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.u-email:hover{color:var(--teal)}
.u-close{flex-shrink:0;align-self:flex-start}

.u-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 20px 14px;border-bottom:1px solid var(--border);flex-shrink:0}
.chip{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;padding:3px 10px;border-radius:100px;background:var(--surface2);color:var(--text3);border:1px solid var(--border)}
.chip-role{color:var(--text2)}
.chip-ok{color:#0f9d58;background:rgba(52,211,153,.12);border-color:rgba(52,211,153,.25)}
.chip-off{color:var(--red);background:var(--red-l);border-color:transparent}
.chip-teal{color:var(--teal);background:rgba(var(--teal-rgb),.12);border-color:rgba(var(--teal-rgb),.25)}
.chip-warn{color:#B26A00;background:rgba(255,149,0,.14);border-color:rgba(255,149,0,.3)}
html.dark .chip-ok{color:#4ade80}
html.dark .chip-warn{color:#FF9F0A}
.chip-led{width:6px;height:6px;border-radius:50%;background:currentColor}
.chip-mini{font-size:10px;padding:1px 7px}

.u-body{overflow-y:auto;padding:0 20px 20px;flex:1;min-height:0}
.u-sec{padding-top:18px}
.u-sec+.u-sec{border-top:1px solid var(--border);margin-top:18px}
.u-sec-title{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--text4);margin-bottom:12px}
.u-count{background:var(--surface2);color:var(--text3);font-size:10px;font-weight:800;padding:1px 7px;border-radius:100px}
.u-empty{font-size:13px;color:var(--text4);padding:6px 0}

.u-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.u-tile{display:flex;flex-direction:column;gap:2px;padding:11px 12px;background:var(--surface2);border-radius:13px;min-width:0}
.u-tile-val{font-size:18px;font-weight:800;letter-spacing:-.02em;color:var(--text1)}
.u-tile-lbl{font-size:10.5px;color:var(--text4);overflow:hidden;text-overflow:ellipsis}

.quota{margin-bottom:14px}
.quota-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;font-size:12px;color:var(--text4);margin-bottom:6px}
.quota-head strong{color:var(--text1);font-weight:700;font-variant-numeric:tabular-nums}
.quota-track{height:8px;border-radius:4px;background:var(--surface2);overflow:hidden}
.quota-fill{display:block;height:100%;border-radius:4px;transition:width .5s cubic-bezier(.22,1,.36,1)}
.quota-fill.ok{background:var(--teal)}
.quota-fill.warn{background:#FF9500}
.quota-fill.danger{background:var(--red)}
.quota-note{font-size:11px;color:var(--text4);margin-top:5px}

.kinds{display:flex;flex-direction:column;gap:3px}
.kind{display:grid;grid-template-columns:9px minmax(70px,1.2fr) 1fr auto auto;align-items:center;gap:9px;padding:3px 0}
.kind-dot{width:9px;height:9px;border-radius:3px}
.kind-name{font-size:12.5px;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kind-bar{height:6px;border-radius:3px;background:var(--surface2);overflow:hidden}
.kind-bar span{display:block;height:100%;border-radius:3px}
.kind-req{font-size:11px;color:var(--text4);font-variant-numeric:tabular-nums}
.kind-val{font-size:12.5px;font-weight:700;color:var(--text1);font-variant-numeric:tabular-nums;min-width:52px;text-align:right}

/* Список ограничен по высоте: у преподавателя с десятком предметов
   карточка иначе превращается в бесконечную ленту. */
.cl-list{display:flex;flex-direction:column;background:var(--surface2);border-radius:13px;padding:0 12px;max-height:246px;overflow-y:auto}
.cl-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)}
.cl-row:last-child{border-bottom:none}
.cl-cover{display:block;width:34px;height:34px;border-radius:9px;overflow:hidden;flex-shrink:0;position:relative}
.cl-name{flex:1;font-size:13px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cl-tokens{font-size:12.5px;font-weight:700;color:var(--text2);font-variant-numeric:tabular-nums}
.cl-general{margin-top:10px;font-size:12px;color:var(--text4)}
.cl-general strong{color:var(--text2)}

.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px}
.fact{display:flex;flex-direction:column;gap:2px;padding:10px;background:var(--surface2);border-radius:12px;min-width:0}
.fact-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--text4);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fact-val{font-size:16px;font-weight:700;color:var(--text1);font-variant-numeric:tabular-nums}
.meta-rows{display:flex;flex-direction:column}
.meta-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:7px 0;border-bottom:1px solid var(--border);font-size:12.5px;color:var(--text4)}
.meta-row:last-child{border-bottom:none}
.meta-row strong{color:var(--text1);font-weight:600;text-align:right}

.ctl-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--border)}
.ctl-lbl{display:flex;flex-direction:column;font-size:13px;font-weight:600;color:var(--text1)}
.ctl-hint{font-size:11px;font-weight:400;color:var(--text4)}
.ctl-sel{border:1px solid var(--border2);border-radius:9px;padding:5px 9px;font-size:12.5px;background:var(--surface);color:var(--text1);cursor:pointer}
.ctl-sel:disabled{opacity:.5;cursor:not-allowed}
.ai-switch{width:40px;height:24px;border-radius:100px;background:var(--surface3);border:1px solid var(--border);position:relative;flex-shrink:0;transition:background .2s,border-color .2s}
.ai-switch.on{background:var(--teal);border-color:var(--teal)}
.ai-switch:disabled{opacity:.5;cursor:not-allowed}
.ai-switch-thumb{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .22s cubic-bezier(.34,1.56,.64,1)}
.ai-switch.on .ai-switch-thumb{transform:translateX(16px)}
.ctl-actions{display:flex;flex-direction:column;gap:8px;margin-top:14px}
.ctl-actions .btn{width:100%;justify-content:center}
.btn-danger-text{color:var(--red)}
.ctl-self{margin-top:12px;font-size:12px;color:var(--text4)}

.center-loading{display:flex;justify-content:center;padding:40px}

@media (max-width:768px){
  .user-modal{max-width:none;max-height:92vh}
  .u-tiles{grid-template-columns:1fr 1fr}
  .facts{grid-template-columns:1fr 1fr}
  .kind{grid-template-columns:9px 1fr auto;gap:8px}
  .kind .kind-bar,.kind .kind-req{display:none}
}
</style>
