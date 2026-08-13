<template>
  <div class="dash">
    <!-- Период отчёта + обновление -->
    <div class="dash-bar">
      <div class="seg" :style="{ '--n': periods.length, '--i': periodIndex }">
        <div class="seg-ind"></div>
        <button v-for="p in periods" :key="p.days" :class="['seg-btn', { active: days === p.days }]"
                @click="setPeriod(p.days)">{{ p.label }}</button>
      </div>
      <div class="dash-bar-right">
        <span v-if="data" class="dash-stamp">Обновлено {{ fmtTime(data.generated_at) }}</span>
        <button class="btn btn-ghost btn-sm" :disabled="loading" @click="reload">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="loading ? 'spin' : ''"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          Обновить
        </button>
      </div>
    </div>

    <div v-if="!data && loading" class="center-loading center-loading-lg"><div class="spinner"></div></div>

    <template v-else-if="data">
      <!-- Итоги за период -->
      <div class="kpi-row">
        <div class="kpi kpi-hero">
          <div class="kpi-lbl">Токенов за период</div>
          <div class="kpi-hero-val">{{ fmt(data.totals.total_tokens) }}</div>
          <div class="kpi-note">
            <span v-if="trend !== null" :class="['kpi-trend', trend >= 0 ? 'up' : 'down']">
              {{ trend >= 0 ? '↑' : '↓' }} {{ Math.abs(trend) }}%
            </span>
            <span>{{ trend !== null ? 'вторая половина периода к первой · ' : '' }}за всё время {{ fmt(data.totals_all_time.total_tokens) }}</span>
          </div>
        </div>
        <div class="kpi">
          <div class="kpi-lbl">Запросов</div>
          <div class="kpi-val">{{ fmt(data.totals.request_count) }}</div>
          <div class="kpi-note">за всё время {{ fmt(data.totals_all_time.request_count) }}</div>
        </div>
        <div class="kpi">
          <div class="kpi-lbl">Средний запрос</div>
          <div class="kpi-val">{{ fmt(data.totals.avg_tokens) }}</div>
          <div class="kpi-note">токенов на запрос</div>
        </div>
        <div class="kpi">
          <div class="kpi-lbl">Активных</div>
          <div class="kpi-val">{{ fmt(data.totals.user_count) }}</div>
          <div class="kpi-note">
            {{ plural(data.totals.user_count, ['пользователь', 'пользователя', 'пользователей']) }} ·
            {{ fmt(data.totals.class_count) }} {{ plural(data.totals.class_count, ['предмет', 'предмета', 'предметов']) }}
          </div>
        </div>
      </div>

      <!-- Соотношение вход/выход и дневной бюджет организации -->
      <div class="meters">
        <div class="card meter-card">
          <div class="card-head"><span class="card-title">Входящие и исходящие токены</span></div>
          <div class="meter-track">
            <span class="meter-seg io-in" :style="{ width: ioPct.prompt + '%' }"></span>
            <span class="meter-seg io-out" :style="{ width: ioPct.completion + '%' }"></span>
          </div>
          <div class="meter-legend">
            <span class="lg-item"><span class="lg-dot io-in"></span>Входящие (промпт) <strong>{{ fmt(data.totals.prompt_tokens) }}</strong> · {{ ioPct.prompt.toFixed(0) }}%</span>
            <span class="lg-item"><span class="lg-dot io-out"></span>Исходящие (ответ) <strong>{{ fmt(data.totals.completion_tokens) }}</strong> · {{ ioPct.completion.toFixed(0) }}%</span>
          </div>
        </div>
        <div class="card meter-card">
          <div class="card-head">
            <span class="card-title">Дневной бюджет организации</span>
            <span class="card-note">сутки UTC</span>
          </div>
          <template v-if="data.limits.daily_token_budget > 0">
            <div class="meter-track">
              <!-- min-width: доля процента от бюджета всё равно должна быть
                   видна полоской, а не пустым треком. -->
              <span :class="['meter-seg', budgetState]"
                    :style="{ width: budgetPct + '%', minWidth: budgetPct > 0 ? '4px' : '0' }"></span>
            </div>
            <div class="meter-legend">
              <span class="lg-item">
                Сегодня израсходовано <strong>{{ fmt(data.limits.tokens_used_today) }}</strong>
                из {{ fmt(data.limits.daily_token_budget) }} · {{ pctText(budgetPct) }}
              </span>
            </div>
          </template>
          <div v-else class="meter-off">
            Бюджет отключён — израсходовано сегодня <strong>{{ fmt(data.limits.tokens_used_today) }}</strong> токенов.
          </div>
          <div class="meter-sub">Лимит сообщений ИИ на пользователя: {{ data.limits.daily_message_limit || '∞' }} в сутки</div>
        </div>
      </div>

      <!-- Главный вопрос: на что именно ушли токены -->
      <div class="card">
        <div class="card-head">
          <span class="card-title">Куда уходят токены</span>
          <span class="card-note">{{ fmt(data.totals.total_tokens) }} за {{ periodLabel }}</span>
        </div>
        <template v-if="kinds.length">
          <div class="split-bar">
            <span v-for="k in kinds" :key="k.group" class="split-seg"
                  :style="{ width: k.pct + '%', background: k.color }"
                  :title="`${k.label}: ${fmt(k.total_tokens)} токенов (${k.pct.toFixed(1)}%)`"></span>
          </div>
          <div class="kind-list">
            <div v-for="k in kinds" :key="k.group" class="kind-block">
              <button :class="['kind-row', { active: isKindActive(k) }]" @click="filterKind(k)">
                <span class="kind-dot" :style="{ background: k.color }"></span>
                <span class="kind-name">{{ k.label }}</span>
                <span class="kind-pct">{{ k.pct.toFixed(1) }}%</span>
                <span class="kind-meta">{{ fmt(k.request_count) }} зап.</span>
                <span class="kind-meta kind-meta-wide">~{{ fmt(avg(k.total_tokens, k.request_count)) }} /зап.</span>
                <span class="kind-meta kind-meta-wide">{{ fmt(k.prompt_tokens) }} вх. · {{ fmt(k.completion_tokens) }} исх.</span>
                <span class="kind-val">{{ fmt(k.total_tokens) }}</span>
              </button>
              <!-- Одна функция может писаться несколькими endpoint'ами —
                   раскрываем, чтобы «чат с картинкой» не прятался внутри чата. -->
              <div v-if="k.details.length > 1" class="kind-subs">
                <button v-for="e in k.details" :key="e.endpoint"
                        :class="['kind-sub', { active: activeKindKey === e.endpoint }]"
                        @click="filterEndpoint(e)">
                  <span class="kind-sub-name">{{ e.label }}</span>
                  <span class="kind-sub-meta">{{ fmt(e.request_count) }} зап.</span>
                  <span class="kind-sub-val">{{ fmt(e.total_tokens) }}</span>
                </button>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="dash-empty">За этот период запросов к ИИ не было</div>
      </div>

      <!-- Динамика -->
      <div class="card">
        <div class="card-head">
          <span class="card-title">Расход по {{ weekly ? 'неделям' : 'дням' }}</span>
          <span class="card-note">пик {{ fmt(maxDay) }} токенов</span>
        </div>
        <div v-if="kinds.length" class="chart-legend">
          <span v-for="k in kinds" :key="k.group" class="lg-item">
            <span class="lg-dot" :style="{ background: k.color }"></span>{{ k.label }}
          </span>
        </div>
        <div class="chart-wrap">
          <div class="chart-axis">
            <span>{{ fmtShort(maxDay) }}</span>
            <span>{{ fmtShort(maxDay / 2) }}</span>
            <span>0</span>
          </div>
          <div class="chart-plot" @mouseleave="hover = null">
            <span class="grid-line" style="top:0"></span>
            <span class="grid-line" style="top:50%"></span>
            <span class="grid-line" style="bottom:0"></span>
            <div class="chart-cols">
              <div v-for="(d, i) in series" :key="d.date" class="chart-col"
                   :class="{ dim: hover !== null && hover !== i }" @mouseenter="hover = i">
                <div class="chart-stack">
                  <span v-for="s in colSegments(d)" :key="s.group" class="chart-seg"
                        :style="{ height: s.h + '%', background: s.color }"></span>
                </div>
              </div>
            </div>
            <div v-if="hoverDay" class="chart-tip" :style="tipStyle">
              <div class="tip-date">{{ hoverDay.label }}</div>
              <div class="tip-total">{{ fmt(hoverDay.total_tokens) }} токенов · {{ fmt(hoverDay.request_count) }} зап.</div>
              <div v-for="s in colSegments(hoverDay)" :key="s.group" class="tip-row">
                <span class="lg-dot" :style="{ background: s.color }"></span>
                <span class="tip-name">{{ s.label }}</span>
                <span class="tip-val">{{ fmt(s.tokens) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="chart-xaxis">
          <span v-for="t in xTicks" :key="t.i" :style="{ left: t.left + '%' }">{{ t.label }}</span>
        </div>
      </div>

      <!-- Предметы и люди -->
      <div class="two-col">
        <div class="card">
          <div class="card-head">
            <span class="card-title">Предметы</span>
            <!-- Считаем по totals, а не по строкам: список обрезан топом, и
                 «5 с расходом» врало бы, когда предметов больше. -->
            <span class="card-note">
              {{ fmt(data.totals.class_count) }} {{ plural(data.totals.class_count, ['предмет', 'предмета', 'предметов']) }} с расходом
            </span>
          </div>
          <div v-if="data.by_class.length" class="rank-list">
            <button v-for="c in data.by_class" :key="c.class_id ?? 'general'"
                    :class="['rank-row', { active: activeClassKey === (c.class_id ?? 0) }]"
                    @click="filterClass(c)">
              <span class="rank-name" :class="{ muted: !c.class_id }">{{ c.class_name || (c.class_id ? `Предмет #${c.class_id}` : 'Вне предметов') }}</span>
              <span class="rank-track">
                <span class="rank-bar" :style="{ width: pctOf(c.total_tokens, maxClass) + '%' }">
                  <span v-for="s in segmentsOf(c.kinds, c.total_tokens)" :key="s.group" class="rank-seg"
                        :style="{ width: s.w + '%', background: s.color }"
                        :title="`${s.label}: ${fmt(s.tokens)}`"></span>
                </span>
              </span>
              <span class="rank-meta">{{ fmt(c.request_count) }} зап.</span>
              <span class="rank-val">{{ fmt(c.total_tokens) }}</span>
            </button>
          </div>
          <div v-else class="dash-empty">Нет данных</div>
        </div>

        <div class="card">
          <div class="card-head">
            <span class="card-title">Пользователи</span>
            <span class="card-note">топ по расходу</span>
          </div>
          <div v-if="data.top_users.length" class="rank-list">
            <button v-for="u in data.top_users" :key="u.user_id"
                    :class="['rank-row', { active: activeUserKey === u.user_id }]"
                    @click="filterUser(u)">
              <span class="rank-name">
                {{ u.name || u.email || '#' + u.user_id }}
                <span v-if="u.ai_unlimited" class="rank-chip">безлимит</span>
              </span>
              <span class="rank-track">
                <span class="rank-bar" :style="{ width: pctOf(u.total_tokens, maxUser) + '%' }">
                  <span v-for="s in segmentsOf(u.kinds, u.total_tokens)" :key="s.group" class="rank-seg"
                        :style="{ width: s.w + '%', background: s.color }"
                        :title="`${s.label}: ${fmt(s.tokens)}`"></span>
                </span>
              </span>
              <span class="rank-meta">{{ fmt(u.request_count) }} зап.</span>
              <span class="rank-val">{{ fmt(u.total_tokens) }}</span>
            </button>
          </div>
          <div v-else class="dash-empty">Нет данных</div>
        </div>
      </div>
    </template>

    <!-- Журнал: те самые строки, из которых сложились цифры выше -->
    <div class="card log-card">
      <div class="card-head">
        <span class="card-title">Журнал запросов</span>
        <span class="card-note">{{ fmt(logTotal) }} {{ plural(logTotal, ['запись', 'записи', 'записей']) }} за {{ periodLabel }}</span>
      </div>
      <div v-if="activeFilters.length" class="filter-row">
        <button v-for="f in activeFilters" :key="f.key" class="filter-chip" @click="f.clear()">
          {{ f.label }}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <button class="filter-clear" @click="clearFilters">Сбросить всё</button>
      </div>
      <div v-if="logLoading" class="center-loading center-loading-lg"><div class="spinner"></div></div>
      <div v-else class="log-table">
        <table>
          <thead>
            <tr>
              <th class="col-num">#</th>
              <th>Дата</th>
              <th>Вид расхода</th>
              <th>Предмет</th>
              <th>Пользователь</th>
              <th class="col-right">Вход</th>
              <th class="col-right">Выход</th>
              <th class="col-right">Всего</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in logs" :key="item.id">
              <td class="log-idx">{{ (logPage - 1) * PAGE_SIZE + idx + 1 }}</td>
              <td class="log-date">{{ fmtDateTime(item.created_at) }}</td>
              <td>
                <span class="log-kind">
                  <span class="kind-dot" :style="{ background: colorOf(item.endpoint) }"></span>
                  {{ item.label || item.endpoint }}
                </span>
              </td>
              <td><span :class="['log-class', { muted: !item.class_id }]">{{ item.class_name || (item.class_id ? `#${item.class_id}` : 'Вне предметов') }}</span></td>
              <td class="log-user">{{ item.user_name || item.user_email || (item.user_id ? '#' + item.user_id : 'Удалён') }}</td>
              <td class="col-right log-num">{{ fmt(item.prompt_tokens) }}</td>
              <td class="col-right log-num">{{ fmt(item.completion_tokens) }}</td>
              <td class="col-right"><span class="token-badge">{{ fmt(item.total_tokens) }}</span></td>
            </tr>
            <tr v-if="!logs.length">
              <td colspan="8" class="dash-empty">Записей нет</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="logPages > 1" class="pagination">
        <button class="btn btn-ghost btn-sm" :disabled="logPage <= 1" @click="loadLogs(logPage - 1)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          Назад
        </button>
        <span class="page-info">Стр. {{ logPage }} / {{ logPages }}</span>
        <button class="btn btn-ghost btn-sm" :disabled="logPage >= logPages" @click="loadLogs(logPage + 1)">
          Вперёд
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminSvc } from '~/services/admin'
import type { AiDashboard } from '~/services/admin'
import { useToast } from '~/composables/useToast'

const adminSvc = useAdminSvc()
const toast = useToast()

const periods = [
  { days: 7, label: '7 дней' },
  { days: 30, label: '30 дней' },
  { days: 90, label: '3 месяца' },
  { days: 365, label: 'Год' },
]
const days = ref(30)
const periodIndex = computed(() => periods.findIndex(p => p.days === days.value))
const periodLabel = computed(() => (periods.find(p => p.days === days.value)?.label || '').toLowerCase())
const data = ref<AiDashboard | null>(null)
const loading = ref(false)

const fmt = (n: number | null | undefined) => Math.round(n || 0).toLocaleString('ru-RU')
// Подписи оси: 1 240 000 в тик не помещается, а точность там и не нужна.
const fmtShort = (n: number) => {
  const v = Math.round(n || 0)
  if (v >= 1e6) return (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace('.', ',') + ' млн'
  if (v >= 1e4) return Math.round(v / 1e3) + ' тыс.'
  return v.toLocaleString('ru-RU')
}
// Бэкенд шлёт naive-UTC без таймзоны — без 'Z' браузер считал бы время
// локальным и показывал бы его со сдвигом на часовой пояс.
const utc = (iso: string) => new Date(/Z$|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : iso + 'Z')
const fmtTime = (iso: string) => utc(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
const fmtDateTime = (iso: string) => {
  if (!iso) return '—'
  const d = utc(iso)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })
    + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}
// Дни отчёта — календарные сутки UTC (как их считает бэкенд): форматируем в
// UTC, иначе на восточных таймзонах подпись съезжала бы на сутки назад.
const fmtDay = (date: string) =>
  new Date(date + 'T00:00:00Z').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const avg = (tokens: number, requests: number) => (requests ? tokens / requests : 0)
// «3 записей» вместо «3 записи» — самая заметная мелочь в русском интерфейсе.
const plural = (n: number, forms: [string, string, string]) => {
  const a = Math.abs(Math.round(n)) % 100
  if (a > 10 && a < 20) return forms[2]
  const b = a % 10
  return b === 1 ? forms[0] : b >= 2 && b <= 4 ? forms[1] : forms[2]
}
const pctOf = (v: number, max: number) => (max > 0 ? Math.max(1.5, (v / max) * 100) : 0)

// ── Цвета видов расхода ──────────────────────────────────────────────────────
// Цвет закреплён за функцией продукта, а не за местом в рейтинге: «обложки»
// оранжевые и в разбивке, и на графике, и в журнале.
const GROUPS = ['chat', 'grade', 'cover', 'title', 'other']
const groupColor = (g: string) => `var(--s-${GROUPS.includes(g) ? g : 'other'})`
const endpointGroup = computed(() => {
  const m: Record<string, string> = {}
  for (const e of data.value?.by_endpoint || []) m[e.endpoint] = e.group
  return m
})
const colorOf = (endpoint: string) => groupColor(endpointGroup.value[endpoint] || 'other')

// Виды расхода по убыванию — один и тот же порядок во всех блоках страницы.
const kinds = computed(() => {
  const total = data.value?.totals.total_tokens || 0
  return [...(data.value?.by_group || [])]
    .sort((a, b) => b.total_tokens - a.total_tokens)
    .map(g => ({
      ...g,
      color: groupColor(g.group),
      pct: total ? (g.total_tokens / total) * 100 : 0,
      details: (data.value?.by_endpoint || [])
        .filter(e => e.group === g.group)
        .sort((a, b) => b.total_tokens - a.total_tokens),
    }))
})

/** Разбивка произвольного набора endpoint→токены на сегменты в порядке kinds. */
const segmentsOf = (map: Record<string, number>, total: number) => {
  const sums: Record<string, number> = {}
  for (const [endpoint, tokens] of Object.entries(map || {})) {
    const g = endpointGroup.value[endpoint] || 'other'
    sums[g] = (sums[g] || 0) + tokens
  }
  const sum = total || Object.values(sums).reduce((a, b) => a + b, 0)
  return kinds.value
    .filter(k => sums[k.group])
    .map(k => ({
      group: k.group, label: k.label, color: k.color,
      tokens: sums[k.group], w: sum ? (sums[k.group] / sum) * 100 : 0,
    }))
}

const ioPct = computed(() => {
  const t = data.value?.totals
  const sum = (t?.prompt_tokens || 0) + (t?.completion_tokens || 0)
  if (!sum) return { prompt: 0, completion: 0 }
  return { prompt: ((t!.prompt_tokens || 0) / sum) * 100, completion: ((t!.completion_tokens || 0) / sum) * 100 }
})
const budgetPct = computed(() => {
  const l = data.value?.limits
  if (!l || l.daily_token_budget <= 0) return 0
  return Math.min(100, (l.tokens_used_today / l.daily_token_budget) * 100)
})
const budgetState = computed(() => (budgetPct.value >= 90 ? 'danger' : budgetPct.value >= 70 ? 'warn' : 'ok'))
// Расход в доли процента от бюджета — это не «0%»: округление до нуля читается
// как «сегодня не тратили».
const pctText = (v: number) => (v > 0 && v < 1 ? '<1%' : v.toFixed(0) + '%')

// Тренд внутри периода: вторая половина против первой. Отдельный запрос за
// прошлым периодом ради этого делать не нужно — данные уже пришли.
const trend = computed(() => {
  const d = data.value?.by_day || []
  if (d.length < 4) return null
  const half = Math.floor(d.length / 2)
  const first = d.slice(0, half).reduce((s, x) => s + x.total_tokens, 0)
  const second = d.slice(half).reduce((s, x) => s + x.total_tokens, 0)
  if (!first) return null
  return Math.round(((second - first) / first) * 100)
})

// ── График по дням ───────────────────────────────────────────────────────────
// Год по дням — 365 столбиков шириной в волосок; с 90 дней укрупняем до недель.
const weekly = computed(() => (data.value?.by_day.length || 0) > 92)
type Bucket = { date: string; label: string; total_tokens: number; request_count: number; kinds: Record<string, number> }
const series = computed<Bucket[]>(() => {
  const raw = data.value?.by_day || []
  if (!weekly.value) return raw.map(d => ({ ...d, label: fmtDay(d.date) }))
  const out: Bucket[] = []
  for (let i = 0; i < raw.length; i += 7) {
    const chunk = raw.slice(i, i + 7)
    const kindSums: Record<string, number> = {}
    let total = 0, requests = 0
    for (const d of chunk) {
      total += d.total_tokens
      requests += d.request_count
      for (const [k, v] of Object.entries(d.kinds)) kindSums[k] = (kindSums[k] || 0) + v
    }
    out.push({
      date: chunk[0].date,
      label: `${fmtDay(chunk[0].date)} — ${fmtDay(chunk[chunk.length - 1].date)}`,
      total_tokens: total, request_count: requests, kinds: kindSums,
    })
  }
  return out
})
const maxDay = computed(() => Math.max(1, ...series.value.map(d => d.total_tokens)))
const colSegments = (d: Bucket) =>
  segmentsOf(d.kinds, d.total_tokens).map(s => ({ ...s, h: (s.tokens / maxDay.value) * 100 }))
const xTicks = computed(() => {
  const n = series.value.length
  if (!n) return []
  const idx = n <= 3 ? [0, n - 1] : [0, Math.floor((n - 1) / 2), n - 1]
  return [...new Set(idx)].map(i => ({
    i,
    // Метки первого и последнего столбика прижимаем к краям, иначе они
    // вылезают за график.
    left: Math.min(96, Math.max(0, ((i + 0.5) / n) * 100)),
    label: fmtDay(series.value[i].date),
  }))
})
const hover = ref<number | null>(null)
const hoverDay = computed(() => (hover.value === null ? null : series.value[hover.value] || null))
const tipStyle = computed(() => {
  const n = series.value.length || 1
  const left = ((hover.value ?? 0) + 0.5) / n * 100
  // Подсказку у краёв разворачиваем внутрь графика, иначе её обрезает карточка.
  return left > 60
    ? { right: (100 - left) + '%', marginRight: '10px' }
    : { left: left + '%', marginLeft: '10px' }
})

// ── Журнал ───────────────────────────────────────────────────────────────────
const PAGE_SIZE = 50
const logs = ref<any[]>([])
const logTotal = ref(0)
const logPage = ref(1)
const logLoading = ref(false)
const logPages = computed(() => Math.max(1, Math.ceil(logTotal.value / PAGE_SIZE)))

const activeKindKey = ref<string | null>(null)      // endpoint или список через запятую
const activeKindLabel = ref('')
const activeClassKey = ref<number | null>(null)     // 0 — расход вне предметов
const activeClassLabel = ref('')
const activeUserKey = ref<number | null>(null)
const activeUserLabel = ref('')

const isKindActive = (k: { endpoints: string[] }) => activeKindKey.value === [...k.endpoints].sort().join(',')

const activeFilters = computed(() => {
  const out: { key: string; label: string; clear: () => void }[] = []
  if (activeKindKey.value) out.push({
    key: 'kind', label: `Вид: ${activeKindLabel.value}`,
    clear: () => { activeKindKey.value = null; loadLogs(1) },
  })
  if (activeClassKey.value !== null) out.push({
    key: 'class', label: `Предмет: ${activeClassLabel.value}`,
    clear: () => { activeClassKey.value = null; loadLogs(1) },
  })
  if (activeUserKey.value !== null) out.push({
    key: 'user', label: `Пользователь: ${activeUserLabel.value}`,
    clear: () => { activeUserKey.value = null; loadLogs(1) },
  })
  return out
})

const loadLogs = async (page = 1) => {
  logLoading.value = true
  logPage.value = page
  try {
    const params: any = { page, page_size: PAGE_SIZE, days: days.value }
    if (activeKindKey.value) params.endpoint = activeKindKey.value
    if (activeClassKey.value !== null) params.class_id = activeClassKey.value
    if (activeUserKey.value !== null) params.user_id = activeUserKey.value
    const res = await adminSvc.aiUsage(params)
    logs.value = res.items
    logTotal.value = res.total
  } catch { toast.err('Не удалось загрузить журнал запросов') }
  finally { logLoading.value = false }
}

// Клик по строке дашборда открывает ровно те записи, из которых она сложилась;
// повторный клик снимает фильтр.
const filterKind = (k: { endpoints: string[]; label: string }) => {
  const key = [...k.endpoints].sort().join(',')
  activeKindKey.value = activeKindKey.value === key ? null : key
  activeKindLabel.value = k.label
  loadLogs(1)
  scrollToLog()
}
const filterEndpoint = (e: { endpoint: string; label: string }) => {
  activeKindKey.value = activeKindKey.value === e.endpoint ? null : e.endpoint
  activeKindLabel.value = e.label
  loadLogs(1)
  scrollToLog()
}
const filterClass = (c: { class_id: number | null; class_name: string | null }) => {
  const key = c.class_id ?? 0
  activeClassKey.value = activeClassKey.value === key ? null : key
  activeClassLabel.value = c.class_name || (c.class_id ? `#${c.class_id}` : 'Вне предметов')
  loadLogs(1)
  scrollToLog()
}
const filterUser = (u: { user_id: number; name: string | null; email: string | null }) => {
  activeUserKey.value = activeUserKey.value === u.user_id ? null : u.user_id
  activeUserLabel.value = u.name || u.email || `#${u.user_id}`
  loadLogs(1)
  scrollToLog()
}
const clearFilters = () => {
  activeKindKey.value = null
  activeClassKey.value = null
  activeUserKey.value = null
  loadLogs(1)
}
const scrollToLog = () => {
  // Журнал внизу длинной страницы: без прокрутки клик по диаграмме выглядит
  // так, будто ничего не произошло.
  requestAnimationFrame(() => {
    document.querySelector('.log-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const maxClass = computed(() => Math.max(1, ...(data.value?.by_class || []).map(c => c.total_tokens)))
const maxUser = computed(() => Math.max(1, ...(data.value?.top_users || []).map(u => u.total_tokens)))

const load = async () => {
  loading.value = true
  try { data.value = await adminSvc.aiDashboard({ days: days.value }) }
  catch { toast.err('Не удалось загрузить статистику ИИ') }
  finally { loading.value = false }
}
const reload = () => { load(); loadLogs(logPage.value) }
const setPeriod = (d: number) => {
  if (days.value === d) return
  days.value = d
  hover.value = null
  load()
  loadLogs(1)
}

onMounted(() => { load(); loadLogs(1) })
</script>

<style scoped>
/* Палитра видов расхода — проверена валидатором на светлой (#FFFFFF) и тёмной
   (#1C1C1E) поверхностях: худшая пара по CVD ΔE 11.8 / 11.2, по обычному
   зрению 20.4 / 17.9. Цвет закреплён за функцией продукта и не меняется от
   сортировки. */
.dash {
  --s-chat: #00B1C9;
  --s-grade: #AF52DE;
  --s-cover: #FF9500;
  --s-title: #FF2D55;
  --s-other: #8E8E93;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
html.dark .dash {
  --s-chat: #1ba4b9;
  --s-grade: #9d41ca;
  --s-cover: #d17a05;
  --s-title: #d31e43;
  --s-other: #8E8E93;
}

/* ── Панель периода ─────────────────────────────────────────────────────── */
.dash-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.dash-bar-right{display:flex;align-items:center;gap:10px}
.dash-stamp{font-size:11.5px;color:var(--text4)}
.seg{position:relative;display:flex;padding:3px;background:var(--surface2);border-radius:11px;min-height:34px}
.seg-ind{position:absolute;top:3px;bottom:3px;left:3px;width:calc((100% - 6px) / var(--n));transform:translateX(calc(100% * var(--i)));background:var(--surface);border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,.12);transition:transform .28s cubic-bezier(.4,0,.2,1)}
html.dark .seg-ind{box-shadow:0 1px 4px rgba(0,0,0,.35)}
.seg-btn{position:relative;z-index:1;min-width:74px;padding:0 12px;font-size:12.5px;font-weight:600;color:var(--text4);background:none;border:none;border-radius:8px;cursor:pointer;transition:color .2s;font-family:inherit;letter-spacing:-.01em}
.seg-btn.active{color:var(--text1);font-weight:700}

/* ── Карточки ───────────────────────────────────────────────────────────── */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px 18px;box-shadow:var(--sh-xs)}
.card-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:12px}
.card-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--text4)}
.card-note{font-size:12px;color:var(--text4);font-variant-numeric:tabular-nums}
.dash-empty{text-align:center;padding:22px;color:var(--text4);font-size:13px}

/* ── Итоги ──────────────────────────────────────────────────────────────── */
.kpi-row{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:12px}
.kpi{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:14px 16px;box-shadow:var(--sh-xs);display:flex;flex-direction:column;gap:3px;min-width:0}
.kpi-lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text4)}
/* Крупные числа — пропорциональными цифрами: tabular-nums на таком кегле
   выглядит разреженным (табличные цифры остаются в таблицах и осях). */
.kpi-hero-val{font-size:34px;font-weight:800;letter-spacing:-.03em;line-height:1.05;color:var(--text1)}
.kpi-val{font-size:22px;font-weight:700;letter-spacing:-.02em;color:var(--text1)}
.kpi-note{font-size:11.5px;color:var(--text4);display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.kpi-trend{font-weight:700}
.kpi-trend.up{color:var(--teal)}
.kpi-trend.down{color:var(--text3)}

/* ── Метры (вход/выход, бюджет) ─────────────────────────────────────────── */
.meters{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.meter-card{display:flex;flex-direction:column}
.meter-track{display:flex;gap:2px;height:10px;border-radius:5px;background:var(--surface2);overflow:hidden}
.meter-seg{display:block;height:100%;transition:width .5s cubic-bezier(.22,1,.36,1)}
/* Вход/выход — один тон в двух шагах: это не разные сущности, а две части
   одного числа. */
.meter-seg.io-in{background:rgba(var(--teal-rgb),.45)}
.meter-seg.io-out{background:var(--teal)}
.meter-seg.ok{background:var(--teal)}
.meter-seg.warn{background:#FF9500}
.meter-seg.danger{background:var(--red)}
.meter-legend{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:10px}
.meter-off{font-size:12.5px;color:var(--text3);padding:4px 0}
.meter-off strong,.meter-legend strong{color:var(--text1);font-weight:700;font-variant-numeric:tabular-nums}
.meter-sub{margin-top:auto;padding-top:10px;font-size:11.5px;color:var(--text4)}
.lg-item{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--text3)}
.lg-dot{width:8px;height:8px;border-radius:3px;flex-shrink:0}
.lg-dot.io-in{background:rgba(var(--teal-rgb),.45)}
.lg-dot.io-out{background:var(--teal)}

/* ── Куда уходят токены ─────────────────────────────────────────────────── */
.split-bar{display:flex;gap:2px;height:14px;margin-bottom:14px}
.split-seg{display:block;height:100%;border-radius:3px;transition:width .5s cubic-bezier(.22,1,.36,1)}
.split-seg:first-child{border-top-left-radius:7px;border-bottom-left-radius:7px}
.split-seg:last-child{border-top-right-radius:7px;border-bottom-right-radius:7px}
.kind-list{display:flex;flex-direction:column;gap:2px}
.kind-row{display:grid;grid-template-columns:10px minmax(120px,1.4fr) 52px auto auto auto minmax(70px,auto);align-items:center;gap:12px;width:100%;padding:9px 10px;border:1px solid transparent;border-radius:10px;background:none;cursor:pointer;text-align:left;font-family:inherit;transition:background .15s,border-color .15s}
.kind-row:hover{background:var(--surface2)}
.kind-row.active{background:rgba(var(--teal-rgb),.08);border-color:rgba(var(--teal-rgb),.25)}
.kind-dot{width:10px;height:10px;border-radius:3px;flex-shrink:0}
.kind-name{font-size:13px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kind-pct{font-size:12.5px;font-weight:700;color:var(--text2);font-variant-numeric:tabular-nums;text-align:right}
.kind-meta{font-size:11.5px;color:var(--text4);font-variant-numeric:tabular-nums;white-space:nowrap;justify-self:end}
.kind-val{font-size:13px;font-weight:700;color:var(--text1);font-variant-numeric:tabular-nums;text-align:right}
.kind-subs{display:flex;flex-direction:column;margin:0 10px 6px 32px;padding-left:10px;border-left:1px solid var(--border)}
.kind-sub{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:12px;padding:5px 8px;border-radius:8px;background:none;border:1px solid transparent;cursor:pointer;text-align:left;font-family:inherit;transition:background .15s}
.kind-sub:hover{background:var(--surface2)}
.kind-sub.active{background:rgba(var(--teal-rgb),.08);border-color:rgba(var(--teal-rgb),.25)}
.kind-sub-name{font-size:12px;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kind-sub-meta{font-size:11px;color:var(--text4);font-variant-numeric:tabular-nums}
.kind-sub-val{font-size:12px;font-weight:600;color:var(--text2);font-variant-numeric:tabular-nums}

/* ── График по дням ─────────────────────────────────────────────────────── */
.chart-legend{display:flex;flex-wrap:wrap;gap:6px 16px;margin-bottom:12px}
.chart-wrap{display:flex;gap:10px}
.chart-axis{display:flex;flex-direction:column;justify-content:space-between;height:170px;font-size:10.5px;color:var(--text4);font-variant-numeric:tabular-nums;text-align:right;flex-shrink:0;min-width:38px}
.chart-plot{position:relative;flex:1;height:170px;min-width:0}
.grid-line{position:absolute;left:0;right:0;height:1px;background:var(--border)}
.chart-cols{position:absolute;inset:0;display:flex;align-items:flex-end;gap:2px}
.chart-col{flex:1;height:100%;display:flex;align-items:flex-end;min-width:0;cursor:default;transition:opacity .15s}
.chart-col.dim{opacity:.45}
.chart-stack{display:flex;flex-direction:column-reverse;justify-content:flex-start;gap:2px;width:100%;height:100%}
.chart-seg{display:block;width:100%;min-height:2px}
/* 4px скругление только на верхнем конце столбика — у основания он square. */
.chart-stack .chart-seg:last-child{border-top-left-radius:4px;border-top-right-radius:4px}
.chart-tip{position:absolute;top:6px;z-index:5;min-width:170px;padding:9px 11px;background:var(--surface);border:1px solid var(--border2);border-radius:12px;box-shadow:var(--sh-md);pointer-events:none}
.tip-date{font-size:11.5px;font-weight:700;color:var(--text1)}
.tip-total{font-size:11px;color:var(--text4);margin-bottom:6px;font-variant-numeric:tabular-nums}
.tip-row{display:grid;grid-template-columns:8px 1fr auto;align-items:center;gap:7px;padding:1.5px 0}
.tip-name{font-size:11.5px;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tip-val{font-size:11.5px;font-weight:600;color:var(--text1);font-variant-numeric:tabular-nums}
.chart-xaxis{position:relative;height:16px;margin-left:48px;margin-top:6px}
.chart-xaxis span{position:absolute;font-size:10.5px;color:var(--text4);white-space:nowrap;transform:translateX(-50%)}
.chart-xaxis span:first-child{transform:none}

/* ── Рейтинги предметов и людей ─────────────────────────────────────────── */
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.rank-list{display:flex;flex-direction:column;gap:2px;max-height:340px;overflow-y:auto}
.rank-row{display:grid;grid-template-columns:minmax(90px,1.1fr) minmax(60px,1fr) auto minmax(58px,auto);align-items:center;gap:10px;width:100%;padding:8px 9px;border:1px solid transparent;border-radius:10px;background:none;cursor:pointer;text-align:left;font-family:inherit;transition:background .15s,border-color .15s}
.rank-row:hover{background:var(--surface2)}
.rank-row.active{background:rgba(var(--teal-rgb),.08);border-color:rgba(var(--teal-rgb),.25)}
.rank-name{font-size:12.5px;font-weight:600;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:6px}
.rank-name.muted{color:var(--text4);font-style:italic}
.rank-chip{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.03em;color:var(--teal);background:rgba(var(--teal-rgb),.12);border-radius:100px;padding:1px 6px;flex-shrink:0}
.rank-track{height:8px;border-radius:4px;background:var(--surface2);overflow:hidden}
.rank-bar{display:flex;gap:2px;height:100%;border-radius:4px;overflow:hidden;transition:width .5s cubic-bezier(.22,1,.36,1)}
.rank-seg{display:block;height:100%}
.rank-meta{font-size:11px;color:var(--text4);font-variant-numeric:tabular-nums;white-space:nowrap}
.rank-val{font-size:12.5px;font-weight:700;color:var(--text1);font-variant-numeric:tabular-nums;text-align:right}

/* ── Журнал ─────────────────────────────────────────────────────────────── */
.log-card{padding-left:0;padding-right:0}
.log-card .card-head,.log-card .filter-row,.log-card .pagination{padding-left:18px;padding-right:18px}
.filter-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.filter-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:100px;font-size:12px;font-weight:600;color:var(--teal);background:rgba(var(--teal-rgb),.1);border:1px solid rgba(var(--teal-rgb),.28);cursor:pointer;font-family:inherit}
.filter-chip:hover{background:rgba(var(--teal-rgb),.16)}
.filter-clear{font-size:12px;color:var(--text4);background:none;border:none;cursor:pointer;font-family:inherit;text-decoration:underline;text-underline-offset:2px}
.log-table{overflow-x:auto;-webkit-overflow-scrolling:touch;border-top:1px solid var(--border)}
.log-table table{width:100%;border-collapse:collapse;min-width:660px}
.log-table th{padding:9px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--text4);background:var(--surface2);border-bottom:1px solid var(--border);white-space:nowrap}
.log-table td{padding:9px 14px;border-bottom:1px solid var(--border);font-size:13px}
.log-table tr:last-child td{border-bottom:none}
.log-table tbody tr:hover td{background:var(--surface2)}
.log-table .col-num{width:48px}
.log-table .col-right{text-align:right}
.log-idx{color:var(--text4);font-size:11px}
.log-date{font-size:12px;color:var(--text3);white-space:nowrap}
.log-kind{display:inline-flex;align-items:center;gap:7px;font-size:12px;color:var(--text2);white-space:nowrap}
.log-class{font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:20px;background:var(--surface2);color:var(--text2);border:1px solid var(--border);display:inline-block;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom}
.log-class.muted{color:var(--text4);font-style:italic}
.log-user{font-size:12px;color:var(--text3)}
.log-num{font-size:12px;color:var(--text3);font-variant-numeric:tabular-nums}
.token-badge{display:inline-block;font-size:12px;font-weight:700;padding:2px 8px;border-radius:var(--r-sm);background:var(--surface2);color:var(--text1);font-variant-numeric:tabular-nums}
.pagination{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:14px}
.page-info{font-size:12.5px;color:var(--text3);font-variant-numeric:tabular-nums}

.center-loading{display:flex;justify-content:center;padding:24px}
.center-loading-lg{padding:36px}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{animation:spin .7s linear infinite}

@media (max-width:1100px){
  .kpi-row{grid-template-columns:1fr 1fr}
  .two-col{grid-template-columns:1fr}
}
@media (max-width:768px){
  .dash{gap:12px}
  .card{padding:14px 12px}
  .log-card .card-head,.log-card .filter-row,.log-card .pagination{padding-left:12px;padding-right:12px}
  .kpi-row{grid-template-columns:1fr 1fr;gap:8px}
  .kpi{padding:12px}
  .kpi-hero-val{font-size:26px}
  .kpi-val{font-size:18px}
  .meters{grid-template-columns:1fr}
  .seg{width:100%}
  .seg-btn{flex:1;min-width:0;font-size:11.5px;padding:0 4px}
  .dash-bar{gap:8px}
  .dash-bar-right{width:100%;justify-content:space-between}
  /* На 390px в строку помещаются только доля и сумма — число запросов,
     среднее и вход/выход остаются в подстроках и журнале. */
  .kind-row{grid-template-columns:10px 1fr auto auto;gap:8px}
  .kind-meta{display:none}
  .kind-subs{margin-left:20px}
  .rank-row{grid-template-columns:minmax(80px,1fr) auto}
  .rank-row .rank-track,.rank-row .rank-meta{display:none}
  .chart-axis{min-width:32px;font-size:10px}
  .chart-tip{min-width:140px}
}
</style>
