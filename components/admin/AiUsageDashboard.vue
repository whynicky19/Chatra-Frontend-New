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
      <!-- Главная карточка: итог периода + форма расхода + дневной бюджет -->
      <div class="hero-row">
        <section class="card hero">
          <div class="hero-top">
            <div>
              <div class="hero-lbl">
                <span class="hero-spark-dot"></span>
                Токены ИИ · {{ periodLabel }}
              </div>
              <div class="hero-val">{{ fmt(data.totals.total_tokens) }}</div>
              <div class="hero-note">
                <span v-if="trend !== null" :class="['trend-pill', trend >= 0 ? 'up' : 'down']">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path :d="trend >= 0 ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'"/>
                  </svg>
                  {{ Math.abs(trend) }}%
                </span>
                <span>{{ trend !== null ? 'вторая половина периода к первой' : 'за всё время ' + fmt(data.totals_all_time.total_tokens) }}</span>
              </div>
            </div>
            <div class="hero-alltime">
              <span class="hero-alltime-lbl">За всё время</span>
              <span class="hero-alltime-val">{{ fmtShort(data.totals_all_time.total_tokens) }}</span>
            </div>
          </div>

          <!-- Форма расхода за период: подробный разбор — в карточке ниже -->
          <svg class="hero-spark" viewBox="0 0 300 64" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--teal)" stop-opacity=".28"/>
                <stop offset="100%" stop-color="var(--teal)" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path :d="heroSpark.area" fill="url(#heroFill)"/>
            <path :d="heroSpark.line" fill="none" stroke="var(--teal)" stroke-width="2"
                  stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
          </svg>

          <div class="hero-stats">
            <div class="hero-stat">
              <span class="hero-stat-val">{{ fmt(data.totals.request_count) }}</span>
              <span class="hero-stat-lbl">{{ plural(data.totals.request_count, ['запрос', 'запроса', 'запросов']) }}</span>
            </div>
            <div class="hero-stat">
              <span class="hero-stat-val">{{ fmt(data.totals.avg_tokens) }}</span>
              <span class="hero-stat-lbl">в среднем на запрос</span>
            </div>
            <div class="hero-stat">
              <span class="hero-stat-val">{{ fmt(data.totals.user_count) }}</span>
              <span class="hero-stat-lbl">активных {{ plural(data.totals.user_count, ['пользователь', 'пользователя', 'пользователей']) }}</span>
            </div>
            <div class="hero-stat">
              <span class="hero-stat-val">{{ fmt(data.totals.class_count) }}</span>
              <span class="hero-stat-lbl">{{ plural(data.totals.class_count, ['предмет', 'предмета', 'предметов']) }} с расходом</span>
            </div>
          </div>
        </section>

        <!-- Дневной бюджет — кольцо в духе Activity: заполнение читается за долю секунды -->
        <section class="card budget">
          <div class="card-head">
            <span class="card-title">Бюджет на сегодня</span>
            <span class="card-note">UTC</span>
          </div>
          <div class="ring-wrap">
            <svg class="ring" viewBox="0 0 120 120">
              <circle class="ring-track" cx="60" cy="60" r="48" fill="none" stroke-width="12"/>
              <circle :class="['ring-fill', budgetState]" cx="60" cy="60" r="48" fill="none" stroke-width="12"
                      stroke-linecap="round" :stroke-dasharray="RING_C"
                      :stroke-dashoffset="RING_C - (Math.min(budgetPct, 100) / 100) * RING_C"
                      transform="rotate(-90 60 60)"/>
            </svg>
            <div class="ring-center">
              <span class="ring-pct">{{ data.limits.daily_token_budget > 0 ? pctText(budgetPct) : '—' }}</span>
              <span class="ring-sub">израсходовано</span>
            </div>
          </div>
          <div class="budget-facts">
            <div class="budget-fact">
              <span class="budget-fact-lbl">Сегодня</span>
              <span class="budget-fact-val">{{ fmt(data.limits.tokens_used_today) }}</span>
            </div>
            <div class="budget-fact">
              <span class="budget-fact-lbl">Лимит в сутки</span>
              <span class="budget-fact-val">{{ data.limits.daily_token_budget > 0 ? fmtShort(data.limits.daily_token_budget) : 'выкл.' }}</span>
            </div>
          </div>
          <div class="budget-msg">Лимит сообщений ИИ на пользователя: <strong>{{ data.limits.daily_message_limit || '∞' }}</strong> в сутки</div>
        </section>
      </div>

      <!-- Отдельная карточка на каждую функцию: на что именно ушли токены -->
      <div class="section-head">
        <h2 class="section-title">Куда уходят токены</h2>
        <span class="section-note">нажмите на карточку — журнал покажет эти запросы</span>
      </div>
      <div v-if="kinds.length" class="kind-grid">
        <button v-for="k in kinds" :key="k.group"
                :class="['card', 'kind-card', 'k-' + k.group, { active: isKindActive(k) }]"
                @click="filterKind(k)">
          <div class="kind-card-top">
            <span class="kind-icon">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <path v-for="(d, i) in kindIcon(k.group)" :key="i" :d="d"/>
              </svg>
            </span>
            <span class="kind-share">{{ k.pct.toFixed(1) }}%</span>
          </div>
          <div class="kind-title">{{ k.label }}</div>
          <div class="kind-total">{{ fmt(k.total_tokens) }}</div>
          <svg class="kind-spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
            <path :d="sparkFor(k.group).area" :fill="k.color" fill-opacity=".14"/>
            <path :d="sparkFor(k.group).line" fill="none" :stroke="k.color" stroke-width="2"
                  stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
          </svg>
          <div class="kind-foot">
            <span>{{ fmt(k.request_count) }} {{ plural(k.request_count, ['запрос', 'запроса', 'запросов']) }}</span>
            <span>~{{ fmt(avg(k.total_tokens, k.request_count)) }} /зап.</span>
          </div>
          <div class="kind-share-bar"><span :style="{ width: k.pct + '%', background: k.color }"></span></div>
        </button>
      </div>
      <div v-else class="card dash-empty">За этот период запросов к ИИ не было</div>

      <!-- Структура расхода и динамика -->
      <div class="two-col two-col-chart">
        <section class="card">
          <div class="card-head">
            <span class="card-title">Структура расхода</span>
          </div>
          <div v-if="kinds.length" class="donut-wrap">
            <svg class="donut" viewBox="0 0 160 160">
              <circle class="donut-track" cx="80" cy="80" r="62" fill="none" stroke-width="19"/>
              <circle v-for="s in donut" :key="s.group" class="donut-seg" cx="80" cy="80" r="62" fill="none"
                      stroke-width="19" :stroke="s.color" :stroke-dasharray="`${s.dash} ${DONUT_C}`"
                      :stroke-dashoffset="-s.offset" transform="rotate(-90 80 80)">
                <title>{{ s.label }}: {{ fmt(s.tokens) }}</title>
              </circle>
            </svg>
            <div class="donut-center">
              <span class="donut-val">{{ fmtShort(data.totals.total_tokens) }}</span>
              <span class="donut-lbl">всего</span>
            </div>
          </div>

          <div class="legend-list">
            <div v-for="k in kinds" :key="k.group" class="legend-row">
              <span class="detail-dot" :style="{ background: k.color }"></span>
              <span class="legend-name">{{ k.label }}</span>
              <span class="legend-pct">{{ k.pct.toFixed(1) }}%</span>
              <span class="legend-val">{{ fmt(k.total_tokens) }}</span>
            </div>
          </div>

          <div class="io-block">
            <div class="io-head">
              <span>Входящие · {{ ioPct.prompt.toFixed(0) }}%</span>
              <span>Исходящие · {{ ioPct.completion.toFixed(0) }}%</span>
            </div>
            <div class="io-track">
              <span class="io-seg io-in" :style="{ width: ioPct.prompt + '%' }"></span>
              <span class="io-seg io-out" :style="{ width: ioPct.completion + '%' }"></span>
            </div>
            <div class="io-head io-values">
              <span>{{ fmt(data.totals.prompt_tokens) }}</span>
              <span>{{ fmt(data.totals.completion_tokens) }}</span>
            </div>
          </div>
        </section>

        <section class="card chart-card">
          <div class="card-head">
            <span class="card-title">Расход по {{ weekly ? 'неделям' : 'дням' }}</span>
            <span class="card-note">пик {{ fmt(maxDay) }}</span>
          </div>
          <div class="chart-legend">
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
                <div v-if="!hoverDay.total_tokens" class="tip-name">Запросов не было</div>
              </div>
            </div>
          </div>
          <div class="chart-xaxis">
            <span v-for="t in xTicks" :key="t.i" :style="{ left: t.left + '%' }">{{ t.label }}</span>
          </div>
        </section>
      </div>

      <!-- Каждый вид запроса отдельной строкой: ничего не спрятано в свёртке -->
      <section v-if="data.by_endpoint.length" class="card detail-card">
        <div class="card-head">
          <span class="card-title">Детализация по видам запросов</span>
          <span class="card-note">нажмите на строку — журнал покажет эти запросы</span>
        </div>
        <div class="log-table">
          <table>
            <thead>
              <tr>
                <th>Вид расхода</th>
                <th class="col-right">Запросов</th>
                <th class="col-right">Людей</th>
                <th class="col-right">Вход</th>
                <th class="col-right">Выход</th>
                <th class="col-right">Средний</th>
                <th>Доля</th>
                <th>Последний</th>
                <th class="col-right">Всего</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in endpointRows" :key="e.endpoint"
                  :class="['detail-tr', { active: activeKindKey === e.endpoint }]"
                  @click="filterEndpoint(e)">
                <td>
                  <span class="log-kind">
                    <span class="kind-dot" :style="{ background: e.color }"></span>
                    {{ e.label }}
                  </span>
                </td>
                <td class="col-right log-num">{{ fmt(e.request_count) }}</td>
                <td class="col-right log-num">{{ fmt(e.user_count) }}</td>
                <td class="col-right log-num">{{ fmt(e.prompt_tokens) }}</td>
                <td class="col-right log-num">{{ fmt(e.completion_tokens) }}</td>
                <td class="col-right log-num">{{ fmt(e.avg_tokens) }}</td>
                <td>
                  <span class="share-cell">
                    <span class="share-mini"><span :style="{ width: Math.max(2, e.pct) + '%', background: e.color }"></span></span>
                    {{ e.pct.toFixed(1) }}%
                  </span>
                </td>
                <td class="log-date">{{ e.last_used ? fmtDateTime(e.last_used) : '—' }}</td>
                <td class="col-right"><span class="token-badge">{{ fmt(e.total_tokens) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Предметы и люди -->
      <div class="two-col">
        <section class="card">
          <div class="card-head">
            <span class="card-title">Предметы</span>
            <span class="card-note">
              {{ fmt(data.totals.class_count) }} {{ plural(data.totals.class_count, ['предмет', 'предмета', 'предметов']) }} с расходом
            </span>
          </div>
          <div v-if="data.by_class.length" class="rank-list">
            <button v-for="(c, i) in data.by_class" :key="c.class_id ?? 'general'"
                    :class="['rank-row', { active: activeClassKey === (c.class_id ?? 0) }]"
                    @click="filterClass(c)">
              <span class="rank-pos">{{ i + 1 }}</span>
              <span class="rank-body">
                <span class="rank-line">
                  <span class="rank-name" :class="{ muted: !c.class_id }">{{ c.class_name || (c.class_id ? `Предмет #${c.class_id}` : 'Вне предметов') }}</span>
                  <span class="rank-val">{{ fmt(c.total_tokens) }}</span>
                </span>
                <span class="rank-track">
                  <span class="rank-bar" :style="{ width: pctOf(c.total_tokens, maxClass) + '%' }">
                    <span v-for="s in segmentsOf(c.kinds, c.total_tokens)" :key="s.group" class="rank-seg"
                          :style="{ width: s.w + '%', background: s.color }"
                          :title="`${s.label}: ${fmt(s.tokens)}`"></span>
                  </span>
                </span>
                <span class="rank-meta">{{ fmt(c.request_count) }} зап. · {{ fmt(c.user_count) }} чел. · ~{{ fmt(c.avg_tokens) }} /зап.</span>
              </span>
            </button>
          </div>
          <div v-else class="dash-empty">Нет данных</div>
        </section>

        <section class="card">
          <div class="card-head">
            <span class="card-title">Пользователи</span>
            <span class="card-note">топ по расходу</span>
          </div>
          <div v-if="data.top_users.length" class="rank-list">
            <button v-for="(u, i) in data.top_users" :key="u.user_id"
                    :class="['rank-row', { active: activeUserKey === u.user_id }]"
                    @click="filterUser(u)">
              <span class="rank-avatar" :style="{ background: avatarColor(u.user_id) }">{{ initials(u.name || u.email || '#') }}</span>
              <span class="rank-body">
                <span class="rank-line">
                  <span class="rank-name">
                    {{ u.name || u.email || '#' + u.user_id }}
                    <span v-if="u.ai_unlimited" class="rank-chip">безлимит</span>
                  </span>
                  <span class="rank-val">{{ fmt(u.total_tokens) }}</span>
                </span>
                <span class="rank-track">
                  <span class="rank-bar" :style="{ width: pctOf(u.total_tokens, maxUser) + '%' }">
                    <span v-for="s in segmentsOf(u.kinds, u.total_tokens)" :key="s.group" class="rank-seg"
                          :style="{ width: s.w + '%', background: s.color }"
                          :title="`${s.label}: ${fmt(s.tokens)}`"></span>
                  </span>
                </span>
                <span class="rank-meta">{{ u.role || '—' }} · {{ fmt(u.request_count) }} зап. · ~{{ fmt(u.avg_tokens) }} /зап.</span>
              </span>
            </button>
          </div>
          <div v-else class="dash-empty">Нет данных</div>
        </section>
      </div>
    </template>

    <!-- Журнал: те самые строки, из которых сложились цифры выше -->
    <section class="card log-card">
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
    </section>
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
// Подписи оси и компактные числа: 1 240 000 в тик не помещается, а точность
// там и не нужна.
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
// Расход в доли процента от бюджета — это не «0%»: округление до нуля читается
// как «сегодня не тратили».
const pctText = (v: number) => (v > 0 && v < 1 ? '<1%' : v.toFixed(0) + '%')

// ── Цвета и иконки видов расхода ─────────────────────────────────────────────
// Цвет закреплён за функцией продукта, а не за местом в рейтинге: «обложки»
// оранжевые и в карточке, и в кольце, и на графике, и в журнале.
const GROUPS = ['chat', 'grade', 'cover', 'title', 'other']
const groupColor = (g: string) => `var(--s-${GROUPS.includes(g) ? g : 'other'})`
const KIND_ICONS: Record<string, string[]> = {
  chat: ['M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z'],
  grade: ['M9 11l3 3L22 4', 'M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11'],
  cover: ['M3 3h18v18H3z', 'M3 15l5-5 4 4 3-3 6 6'],
  title: ['M4 7V5h16v2', 'M9 20h6', 'M12 5v15'],
  other: ['M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z'],
}
const kindIcon = (g: string) => KIND_ICONS[g] || KIND_ICONS.other
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

// Строки детализации: каждый endpoint со своей долей и цветом функции.
const endpointRows = computed(() => {
  const total = data.value?.totals.total_tokens || 0
  return (data.value?.by_endpoint || []).map(e => ({
    ...e,
    color: groupColor(e.group),
    pct: total ? (e.total_tokens / total) * 100 : 0,
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

// ── Кольца ───────────────────────────────────────────────────────────────────
const RING_C = 2 * Math.PI * 48
const DONUT_C = 2 * Math.PI * 62
const donut = computed(() => {
  let offset = 0
  return kinds.value.map(k => {
    const len = (k.pct / 100) * DONUT_C
    const seg = {
      group: k.group, label: k.label, color: k.color, tokens: k.total_tokens,
      // Зазор между секторами — поверхностью, а не обводкой (обводка добавила
      // бы «чернил», которых нет в данных).
      dash: Math.max(1.5, len - 4),
      offset,
    }
    offset += len
    return seg
  })
})

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

// ── Спарклайны ───────────────────────────────────────────────────────────────
/** Путь линии и заливки по ряду значений в системе координат W×H. */
const sparkPath = (values: number[], w: number, h: number) => {
  const pts = values.length === 1 ? [values[0], values[0]] : values
  const max = Math.max(1, ...pts)
  const step = pts.length > 1 ? w / (pts.length - 1) : w
  const xy = pts.map((v, i) => [i * step, h - 2 - (v / max) * (h - 4)])
  const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  return { line, area: `${line} L${w},${h} L0,${h} Z` }
}
const heroSpark = computed(() => sparkPath(series.value.map(d => d.total_tokens), 300, 64))
const sparkFor = (group: string) => {
  const values = series.value.map(d => {
    let sum = 0
    for (const [endpoint, tokens] of Object.entries(d.kinds)) {
      if ((endpointGroup.value[endpoint] || 'other') === group) sum += tokens
    }
    return sum
  })
  return sparkPath(values, 100, 30)
}

// ── Аватары в рейтинге пользователей ─────────────────────────────────────────
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '—'
// Оттенок закреплён за id: аватар одного и того же человека не перекрашивается
// при смене периода. Это не данные, а идентичность — поэтому вне палитры видов.
const AVATAR_TINTS = ['#5E5CE6', '#0A84FF', '#30B0C7', '#32A852', '#FF9F0A', '#FF6482', '#BF5AF2', '#64748B']
const avatarColor = (id: number) => AVATAR_TINTS[Math.abs(id) % AVATAR_TINTS.length]

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

// Клик по карточке или строке открывает ровно те записи, из которых она
// сложилась; повторный клик снимает фильтр.
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
  // Журнал внизу длинной страницы: без прокрутки клик по карточке выглядит
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
   зрению 20.4 / 17.9. Цвет закреплён за функцией и не меняется от сортировки. */
.dash {
  --s-chat: #00B1C9;
  --s-grade: #AF52DE;
  --s-cover: #FF9500;
  --s-title: #FF2D55;
  --s-other: #8E8E93;
  --ease: cubic-bezier(.22, 1, .36, 1);
  display: flex;
  flex-direction: column;
  gap: 16px;
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
.seg-ind{position:absolute;top:3px;bottom:3px;left:3px;width:calc((100% - 6px) / var(--n));transform:translateX(calc(100% * var(--i)));background:var(--surface);border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,.12);transition:transform .34s var(--ease)}
html.dark .seg-ind{box-shadow:0 1px 4px rgba(0,0,0,.35)}
.seg-btn{position:relative;z-index:1;min-width:74px;padding:0 12px;font-size:12.5px;font-weight:600;color:var(--text4);background:none;border:none;border-radius:8px;cursor:pointer;transition:color .2s;font-family:inherit;letter-spacing:-.01em}
.seg-btn.active{color:var(--text1);font-weight:700}

/* ── Карточки ───────────────────────────────────────────────────────────── */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:18px 20px;box-shadow:var(--sh-xs)}
.card-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:14px}
.card-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--text4)}
.card-note{font-size:12px;color:var(--text4);font-variant-numeric:tabular-nums}
.dash-empty{text-align:center;padding:22px;color:var(--text4);font-size:13px}
.section-head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin:4px 2px -4px}
/* Заголовок секции — единственный крупный текст между карточками: тесное
   трекинг-значение на большом кегле, как в системных заголовках iOS. */
.section-title{font-size:17px;font-weight:800;letter-spacing:-.02em;color:var(--text1)}
.section-note{font-size:12px;color:var(--text4)}

/* ── Главная карточка ───────────────────────────────────────────────────── */
.hero-row{display:grid;grid-template-columns:minmax(0,1.85fr) minmax(250px,1fr);gap:16px}
.hero{position:relative;overflow:hidden;padding-bottom:0;display:flex;flex-direction:column}
/* Мягкая подсветка сверху — карточка «светится» брендом, но текст остаётся
   на сплошном слое, а не на полупрозрачном (иначе падает читаемость). */
.hero::before{content:'';position:absolute;top:-90px;right:-40px;width:340px;height:240px;background:radial-gradient(closest-side,rgba(var(--teal-rgb),.16),transparent);pointer-events:none}
.hero-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;position:relative}
.hero-lbl{display:flex;align-items:center;gap:7px;font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text4)}
.hero-spark-dot{width:7px;height:7px;border-radius:50%;background:var(--teal);box-shadow:0 0 0 3px rgba(var(--teal-rgb),.18)}
/* Крупные числа — пропорциональными цифрами: tabular-nums на таком кегле
   выглядит разреженным (табличные цифры остаются в таблицах и осях). */
.hero-val{font-size:clamp(34px,4.4vw,48px);font-weight:800;letter-spacing:-.035em;line-height:1.02;color:var(--text1);margin-top:6px}
.hero-note{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;font-size:12.5px;color:var(--text4)}
.trend-pill{display:inline-flex;align-items:center;gap:3px;padding:2px 8px 2px 6px;border-radius:100px;font-size:12px;font-weight:700;font-variant-numeric:tabular-nums}
.trend-pill.up{color:var(--teal);background:rgba(var(--teal-rgb),.12)}
.trend-pill.down{color:var(--text3);background:var(--surface2)}
.hero-alltime{display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex-shrink:0}
.hero-alltime-lbl{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text4)}
.hero-alltime-val{font-size:15px;font-weight:700;color:var(--text2)}
.hero-spark{display:block;width:calc(100% + 40px);margin:14px -20px 0;height:64px;flex:1;min-height:56px}
.hero-stats{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--border);margin:0 -20px;padding:0 4px}
.hero-stat{display:flex;flex-direction:column;gap:1px;padding:12px 16px;border-right:1px solid var(--border);min-width:0}
.hero-stat:last-child{border-right:none}
.hero-stat-val{font-size:17px;font-weight:700;letter-spacing:-.02em;color:var(--text1);font-variant-numeric:tabular-nums}
.hero-stat-lbl{font-size:11px;color:var(--text4);overflow:hidden;text-overflow:ellipsis}

/* ── Кольцо бюджета ─────────────────────────────────────────────────────── */
.budget{display:flex;flex-direction:column}
.ring-wrap{position:relative;align-self:center;width:150px;height:150px;margin:2px 0 6px}
.ring{width:100%;height:100%}
.ring-track{stroke:var(--surface2)}
.ring-fill{transition:stroke-dashoffset .7s var(--ease)}
.ring-fill.ok{stroke:var(--teal)}
.ring-fill.warn{stroke:#FF9500}
.ring-fill.danger{stroke:var(--red)}
.ring-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;pointer-events:none}
.ring-pct{font-size:26px;font-weight:800;letter-spacing:-.03em;color:var(--text1)}
.ring-sub{font-size:10.5px;color:var(--text4)}
.budget-facts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:auto}
.budget-fact{display:flex;flex-direction:column;gap:2px;padding:9px 11px;background:var(--surface2);border-radius:12px}
.budget-fact-lbl{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--text4)}
.budget-fact-val{font-size:14px;font-weight:700;color:var(--text1);font-variant-numeric:tabular-nums}
.budget-msg{margin-top:10px;font-size:11.5px;color:var(--text4)}
.budget-msg strong{color:var(--text2)}

/* ── Карточки видов расхода ─────────────────────────────────────────────── */
.kind-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
.kind-card{position:relative;overflow:hidden;display:flex;flex-direction:column;gap:0;padding:16px 16px 0;text-align:left;font-family:inherit;cursor:pointer;transition:transform .26s var(--ease),box-shadow .26s var(--ease),border-color .2s}
.kind-card:hover{transform:translateY(-3px);box-shadow:var(--sh-md);border-color:var(--border2)}
/* Отклик на нажатие, а не на отпускание — иначе касание кажется «мёртвым». */
.kind-card:active{transform:translateY(-1px) scale(.99);transition-duration:.09s}
.kind-card.active{border-color:var(--kc-line);box-shadow:0 0 0 1px var(--kc-line),var(--sh-sm)}
.kind-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
/* Плитка иконки в духе iOS Settings: цвет функции живёт на подложке, а не на
   тексте — светлый оттенок как текст был бы нечитаемым. */
.kind-icon{width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;color:var(--kc);background:var(--kc-soft)}
/* Оттенки подложки заданы явно, а не через color-mix: карточка не должна
   остаться без фона иконки на браузере постарше. */
.k-chat{--kc:var(--s-chat);--kc-soft:rgba(0,177,201,.14);--kc-line:rgba(0,177,201,.45)}
.k-grade{--kc:var(--s-grade);--kc-soft:rgba(175,82,222,.14);--kc-line:rgba(175,82,222,.45)}
.k-cover{--kc:var(--s-cover);--kc-soft:rgba(255,149,0,.16);--kc-line:rgba(255,149,0,.5)}
.k-title{--kc:var(--s-title);--kc-soft:rgba(255,45,85,.13);--kc-line:rgba(255,45,85,.45)}
.k-other{--kc:var(--s-other);--kc-soft:rgba(142,142,147,.16);--kc-line:rgba(142,142,147,.5)}
html.dark .k-chat{--kc-soft:rgba(27,164,185,.2);--kc-line:rgba(27,164,185,.5)}
html.dark .k-grade{--kc-soft:rgba(157,65,202,.22);--kc-line:rgba(157,65,202,.5)}
html.dark .k-cover{--kc-soft:rgba(209,122,5,.22);--kc-line:rgba(209,122,5,.5)}
html.dark .k-title{--kc-soft:rgba(211,30,67,.22);--kc-line:rgba(211,30,67,.5)}
html.dark .k-other{--kc-soft:rgba(142,142,147,.2);--kc-line:rgba(142,142,147,.5)}
.kind-share{font-size:12px;font-weight:800;color:var(--text3);font-variant-numeric:tabular-nums;background:var(--surface2);padding:3px 9px;border-radius:100px}
.kind-title{margin-top:12px;font-size:13px;font-weight:600;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kind-total{font-size:25px;font-weight:800;letter-spacing:-.03em;color:var(--text1);line-height:1.15}
.kind-spark{display:block;width:calc(100% + 32px);height:34px;margin:8px -16px 0}
.kind-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 0 12px;font-size:11.5px;color:var(--text4);font-variant-numeric:tabular-nums}
.kind-share-bar{position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--surface2)}
.kind-share-bar span{display:block;height:100%;border-radius:0 3px 3px 0;transition:width .6s var(--ease)}

/* ── Структура расхода ──────────────────────────────────────────────────── */
.donut-wrap{position:relative;width:190px;height:190px;margin:0 auto 6px}
.donut{width:100%;height:100%}
.donut-track{stroke:var(--surface2)}
.donut-seg{transition:stroke-dasharray .6s var(--ease)}
.donut-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;pointer-events:none}
.donut-val{font-size:23px;font-weight:800;letter-spacing:-.03em;color:var(--text1)}
.donut-lbl{font-size:11px;color:var(--text4)}
.legend-list{display:flex;flex-direction:column;gap:1px;margin-top:4px}
.legend-row{display:grid;grid-template-columns:10px 1fr auto auto;align-items:center;gap:10px;padding:7px 2px}
.detail-dot{width:10px;height:10px;border-radius:3px}
.legend-name{font-size:13px;font-weight:600;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.legend-pct{font-size:12px;color:var(--text4);font-variant-numeric:tabular-nums}
.legend-val{font-size:13px;font-weight:700;color:var(--text1);font-variant-numeric:tabular-nums}

/* Таблица детализации: строка кликабельна целиком — это тот же фильтр, что и
   карточка вида, только точнее (конкретный endpoint). */
.detail-card{padding-left:0;padding-right:0}
.detail-card .card-head{padding-left:20px;padding-right:20px}
.detail-tr{cursor:pointer}
.detail-tr.active td{background:rgba(var(--teal-rgb),.08)}
.share-cell{display:inline-flex;align-items:center;gap:8px;font-size:12px;color:var(--text3);font-variant-numeric:tabular-nums}
.share-mini{display:block;width:64px;height:6px;border-radius:3px;background:var(--surface2);overflow:hidden;flex-shrink:0}
.share-mini span{display:block;height:100%;border-radius:3px}
.io-block{margin-top:16px;padding-top:14px;border-top:1px solid var(--border)}
.io-head{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:11.5px;color:var(--text4);margin-bottom:7px}
.io-values{margin:7px 0 0;font-weight:700;color:var(--text2);font-variant-numeric:tabular-nums}
.io-track{display:flex;gap:2px;height:10px;border-radius:5px;overflow:hidden;background:var(--surface2)}
/* Вход/выход — один тон в двух шагах: это не разные сущности, а две части
   одного числа. */
.io-seg{display:block;height:100%;transition:width .6s var(--ease)}
.io-in{background:rgba(var(--teal-rgb),.42)}
.io-out{background:var(--teal)}

/* ── График по дням ─────────────────────────────────────────────────────── */
.chart-card{display:flex;flex-direction:column}
.chart-legend{display:flex;flex-wrap:wrap;gap:6px 16px;margin-bottom:14px}
.lg-item{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--text3)}
.lg-dot{width:8px;height:8px;border-radius:3px;flex-shrink:0}
/* Карточка тянется по соседней, но сам график не растёт бесконечно: выше
   ~340px столбики читаются уже не лучше, а хуже. */
.chart-wrap{display:flex;gap:10px;flex:1;min-height:200px;max-height:340px}
.chart-axis{display:flex;flex-direction:column;justify-content:space-between;font-size:10.5px;color:var(--text4);font-variant-numeric:tabular-nums;text-align:right;flex-shrink:0;min-width:40px}
.chart-plot{position:relative;flex:1;min-width:0}
.grid-line{position:absolute;left:0;right:0;height:1px;background:var(--border)}
.chart-cols{position:absolute;inset:0;display:flex;align-items:flex-end;gap:2px}
.chart-col{flex:1;height:100%;display:flex;align-items:flex-end;min-width:0;cursor:default;transition:opacity .15s}
.chart-col.dim{opacity:.4}
.chart-stack{display:flex;flex-direction:column-reverse;justify-content:flex-start;gap:2px;width:100%;height:100%}
.chart-seg{display:block;width:100%;min-height:2px;transition:height .5s var(--ease)}
/* 4px скругление только на верхнем конце столбика — у основания он square. */
.chart-stack .chart-seg:last-child{border-top-left-radius:4px;border-top-right-radius:4px}
.chart-tip{position:absolute;top:6px;z-index:5;min-width:180px;padding:10px 12px;background:var(--surface);border:1px solid var(--border2);border-radius:14px;box-shadow:var(--sh-md);pointer-events:none}
.tip-date{font-size:11.5px;font-weight:700;color:var(--text1)}
.tip-total{font-size:11px;color:var(--text4);margin-bottom:6px;font-variant-numeric:tabular-nums}
.tip-row{display:grid;grid-template-columns:8px 1fr auto;align-items:center;gap:7px;padding:1.5px 0}
.tip-name{font-size:11.5px;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tip-val{font-size:11.5px;font-weight:600;color:var(--text1);font-variant-numeric:tabular-nums}
.chart-xaxis{position:relative;height:16px;margin-left:50px;margin-top:8px}
.chart-xaxis span{position:absolute;font-size:10.5px;color:var(--text4);white-space:nowrap;transform:translateX(-50%)}
.chart-xaxis span:first-child{transform:none}

/* ── Рейтинги предметов и людей ─────────────────────────────────────────── */
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.two-col-chart{grid-template-columns:minmax(0,1fr) minmax(0,1.5fr)}
.rank-list{display:flex;flex-direction:column;gap:4px;max-height:400px;overflow-y:auto;margin:0 -6px;padding:0 6px}
.rank-row{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:11px;width:100%;padding:9px 10px;border:1px solid transparent;border-radius:14px;background:none;cursor:pointer;text-align:left;font-family:inherit;transition:background .18s,border-color .18s,transform .18s var(--ease)}
.rank-row:hover{background:var(--surface2)}
.rank-row:active{transform:scale(.99);transition-duration:.09s}
.rank-row.active{background:rgba(var(--teal-rgb),.08);border-color:rgba(var(--teal-rgb),.25)}
.rank-pos{width:22px;height:22px;border-radius:7px;background:var(--surface2);color:var(--text4);font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums}
.rank-row.active .rank-pos{background:rgba(var(--teal-rgb),.16);color:var(--teal)}
.rank-avatar{width:30px;height:30px;border-radius:10px;color:#fff;font-size:11px;font-weight:800;letter-spacing:.02em;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.rank-body{display:flex;flex-direction:column;gap:5px;min-width:0}
.rank-line{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.rank-name{font-size:13px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:6px}
.rank-name.muted{color:var(--text4);font-style:italic}
.rank-chip{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.03em;color:var(--teal);background:rgba(var(--teal-rgb),.12);border-radius:100px;padding:1px 6px;flex-shrink:0}
.rank-val{font-size:13px;font-weight:700;color:var(--text1);font-variant-numeric:tabular-nums;flex-shrink:0}
.rank-track{height:7px;border-radius:4px;background:var(--surface2);overflow:hidden}
.rank-bar{display:flex;gap:2px;height:100%;border-radius:4px;overflow:hidden;transition:width .6s var(--ease)}
.rank-seg{display:block;height:100%}
.rank-meta{font-size:11px;color:var(--text4);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ── Журнал ─────────────────────────────────────────────────────────────── */
.log-card{padding-left:0;padding-right:0}
.log-card .card-head,.log-card .filter-row,.log-card .pagination{padding-left:20px;padding-right:20px}
.filter-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.filter-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:100px;font-size:12px;font-weight:600;color:var(--teal);background:rgba(var(--teal-rgb),.1);border:1px solid rgba(var(--teal-rgb),.28);cursor:pointer;font-family:inherit}
.filter-chip:hover{background:rgba(var(--teal-rgb),.16)}
.filter-clear{font-size:12px;color:var(--text4);background:none;border:none;cursor:pointer;font-family:inherit;text-decoration:underline;text-underline-offset:2px}
.log-table{overflow-x:auto;-webkit-overflow-scrolling:touch;border-top:1px solid var(--border)}
.log-table table{width:100%;border-collapse:collapse;min-width:660px}
.log-table th{padding:9px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--text4);background:var(--surface2);border-bottom:1px solid var(--border);white-space:nowrap}
.log-table td{padding:9px 16px;border-bottom:1px solid var(--border);font-size:13px}
.log-table tr:last-child td{border-bottom:none}
.log-table tbody tr:hover td{background:var(--surface2)}
.log-table .col-num{width:48px}
.log-table .col-right{text-align:right}
.log-idx{color:var(--text4);font-size:11px}
.log-date{font-size:12px;color:var(--text3);white-space:nowrap}
.log-kind{display:inline-flex;align-items:center;gap:7px;font-size:12px;color:var(--text2);white-space:nowrap}
.kind-dot{width:9px;height:9px;border-radius:3px;flex-shrink:0}
.log-class{font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:20px;background:var(--surface2);color:var(--text2);border:1px solid var(--border);display:inline-block;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom}
.log-class.muted{color:var(--text4);font-style:italic}
.log-user{font-size:12px;color:var(--text3)}
.log-num{font-size:12px;color:var(--text3);font-variant-numeric:tabular-nums}
.token-badge{display:inline-block;font-size:12px;font-weight:700;padding:2px 8px;border-radius:var(--r-sm);background:var(--surface2);color:var(--text1);font-variant-numeric:tabular-nums}
.pagination{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:14px}
.page-info{font-size:12.5px;color:var(--text3);font-variant-numeric:tabular-nums}

.center-loading{display:flex;justify-content:center;padding:24px}
.center-loading-lg{padding:40px}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{animation:spin .7s linear infinite}

@media (max-width:1180px){
  .hero-row{grid-template-columns:1fr}
  .two-col,.two-col-chart{grid-template-columns:1fr}
  .ring-wrap{width:130px;height:130px}
}
@media (max-width:768px){
  .dash{gap:12px}
  .card{padding:15px 14px;border-radius:var(--r-lg)}
  .log-card .card-head,.log-card .filter-row,.log-card .pagination{padding-left:14px;padding-right:14px}
  .hero{padding-bottom:0}
  .hero-val{font-size:32px}
  .hero-spark{width:calc(100% + 28px);margin:12px -14px 0;height:56px}
  .hero-stats{grid-template-columns:1fr 1fr;margin:0 -14px;padding:0}
  .hero-stat{padding:10px 14px}
  .hero-stat:nth-child(2){border-right:none}
  .hero-stat:nth-child(-n+2){border-bottom:1px solid var(--border)}
  .seg{width:100%}
  .seg-btn{flex:1;min-width:0;font-size:11.5px;padding:0 4px}
  .dash-bar-right{width:100%;justify-content:space-between}
  /* Две карточки в ряд и на телефоне: в одну колонку четыре вида расхода
     растягивались на два экрана прокрутки. */
  .kind-grid{grid-template-columns:1fr 1fr;gap:10px}
  .kind-card{padding:13px 13px 0}
  .kind-icon{width:32px;height:32px;border-radius:10px}
  .kind-title{margin-top:10px;font-size:12px}
  .kind-total{font-size:19px}
  .kind-foot{font-size:11px}
  .kind-spark{width:calc(100% + 26px);margin-left:-13px;margin-right:-13px}
  .kind-foot{flex-direction:column;align-items:flex-start;gap:2px}
  .donut-wrap{width:160px;height:160px}
  .chart-axis{min-width:34px;font-size:10px;min-height:170px}
  .chart-plot{min-height:170px}
  .chart-xaxis{margin-left:44px}
  .chart-tip{min-width:150px}
  .rank-meta{font-size:10.5px}
}
@media (max-width:360px){
  .kind-grid{grid-template-columns:1fr}
}

/* Уважаем системную настройку: убираем подъёмы и перерисовки длинных полос,
   оставляя мгновенную обратную связь цветом. */
@media (prefers-reduced-motion:reduce){
  .kind-card,.rank-row,.chart-seg,.rank-bar,.io-seg,.ring-fill,.donut-seg,.seg-ind,.kind-share-bar span{transition:none}
  .kind-card:hover{transform:none}
  .kind-card:active,.rank-row:active{transform:none}
}
</style>
