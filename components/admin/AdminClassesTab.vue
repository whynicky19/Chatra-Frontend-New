<template>
  <div class="tab">
    <div class="bar">
      <div class="search-wrap">
        <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input v-model="q" class="search-inp" placeholder="Название предмета..."/>
        <button v-if="q" class="search-clear" @click="q = ''">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <select v-model="sort" class="sort-sel">
        <option value="tokens">Сначала с большим расходом ИИ</option>
        <option value="members">Сначала с большим числом участников</option>
        <option value="name">По названию</option>
        <option value="new">Сначала новые</option>
      </select>
    </div>

    <div v-if="loading" class="center-loading"><div class="spinner"></div></div>

    <template v-else>
      <div class="list-head">
        <span>{{ rows.length }} из {{ classes.length }}</span>
        <span class="list-head-hint">нажмите на карточку — откроется профиль предмета</span>
      </div>
      <div class="grid">
        <button v-for="cl in rows" :key="cl.id" class="card" @click="openedId = cl.id">
          <span class="cover" :style="coverStyle(cl)">
            <SubjectCover :src="cl.cover_thumbnail || cl.cover_image" :icon="cl.cover_icon"
                          :color="cl.cover_color" :size="52" class="cover-art"/>
            <span v-if="cl.member_count != null" class="cover-chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              {{ cl.member_count }}
            </span>
          </span>
          <span class="body">
            <span class="name">{{ cl.name }}</span>
            <span class="teacher">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span class="truncate">{{ cl.teacher || creatorName(cl.created_by) }}</span>
            </span>
            <span class="metrics">
              <span class="metric">
                <span class="metric-val">{{ fmtShort(tokensOf(cl.id)) }}</span>
                <span class="metric-lbl">токенов ИИ</span>
              </span>
              <span class="metric">
                <span class="metric-val">{{ fmt(requestsOf(cl.id)) }}</span>
                <span class="metric-lbl">{{ plural(requestsOf(cl.id), ['запрос', 'запроса', 'запросов']) }}</span>
              </span>
              <span class="metric">
                <span class="metric-val">{{ cl.created_at ? fmtShortDate(cl.created_at) : '—' }}</span>
                <span class="metric-lbl">создан</span>
              </span>
            </span>
            <span class="share"><span :style="{ width: sharePct(cl.id) + '%' }"></span></span>
          </span>
        </button>
        <div v-if="!rows.length" class="empty">{{ classes.length ? 'Ничего не найдено' : 'Предметов пока нет' }}</div>
      </div>
    </template>

    <ClassDetailModal :class-id="openedId" :card="openedCard" @close="openedId = null"/>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAdminFormat } from '~/composables/useAdminFormat'

// Список предметов и сводку по расходу грузит страница — они же кормят плитки
// над вкладками, и второй такой же запрос при открытии вкладки был бы лишним.
const props = defineProps<{
  classes: any[]
  summary: any[]
  users: any[]
  loading?: boolean
}>()

const { fmt, fmtShort, plural, utcDate } = useAdminFormat()

const classes = computed(() => props.classes || [])
const summary = computed(() => props.summary || [])
const loading = computed(() => !!props.loading)
const q = ref('')
const sort = ref<'tokens' | 'members' | 'name' | 'new'>('tokens')
const openedId = ref<number | null>(null)
const openedCard = computed(() => classes.value.find(c => c.id === openedId.value) ?? null)

const usage = computed(() => {
  const m: Record<number, { tokens: number; requests: number }> = {}
  for (const s of summary.value) {
    if (s.class_id) m[s.class_id] = { tokens: s.total_tokens || 0, requests: s.request_count || 0 }
  }
  return m
})
const tokensOf = (id: number) => usage.value[id]?.tokens || 0
const requestsOf = (id: number) => usage.value[id]?.requests || 0
const maxTokens = computed(() => Math.max(1, ...classes.value.map(c => tokensOf(c.id))))
const sharePct = (id: number) => (tokensOf(id) > 0 ? Math.max(2, (tokensOf(id) / maxTokens.value) * 100) : 0)

const fmtShortDate = (iso: string) =>
  utcDate(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })

const creatorName = (id: number) => {
  const u = (props.users || []).find((x: any) => x.id === id)
  return u ? (u.full_name || u.email) : (id ? '#' + id : '—')
}

// Apple system colors — разные оттенки вместо одного брендового на всех
// карточках, как у папок в iOS.
const COVERS = [
  'linear-gradient(135deg,var(--teal-h),var(--teal-d))',
  'linear-gradient(135deg,#BF5AF2,#8E3FCB)',
  'linear-gradient(135deg,#FF9F0A,#D67D00)',
  'linear-gradient(135deg,#30D158,#1E9E44)',
  'linear-gradient(135deg,#FF375F,#D91C46)',
]
const coverStyle = (cl: any) =>
  (cl.cover_thumbnail || cl.cover_image || cl.cover_color) ? '' : `background:${COVERS[cl.id % COVERS.length]}`

const rows = computed(() => {
  const needle = q.value.trim().toLowerCase()
  const list = classes.value.filter(c => !needle || c.name.toLowerCase().includes(needle))
  return [...list].sort((a, b) => {
    if (sort.value === 'tokens') return tokensOf(b.id) - tokensOf(a.id) || a.name.localeCompare(b.name)
    if (sort.value === 'members') return (b.member_count || 0) - (a.member_count || 0)
    if (sort.value === 'new') return (b.created_at ? utcDate(b.created_at).getTime() : 0)
      - (a.created_at ? utcDate(a.created_at).getTime() : 0)
    return a.name.localeCompare(b.name)
  })
})

</script>

<style scoped>
.tab{display:flex;flex-direction:column;gap:12px}
.bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.search-wrap{position:relative;display:flex;align-items:center;gap:7px;flex:1;min-width:200px;background:var(--surface);border:1px solid var(--border2);border-radius:var(--r-md);padding:9px 11px}
.search-icon{color:var(--text4);flex-shrink:0}
.search-inp{flex:1;border:none;background:none;font-size:13px;color:var(--text1);min-width:0}
.search-inp::placeholder{color:var(--text4)}
.search-clear{display:flex;color:var(--text4);background:none;border:none;cursor:pointer}
.search-clear:hover{color:var(--text1)}
.sort-sel{border:1px solid var(--border2);border-radius:var(--r-md);padding:9px 11px;font-size:12.5px;background:var(--surface);color:var(--text2);cursor:pointer}
.list-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;font-size:11.5px;color:var(--text4);padding:0 4px}

.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}
.card{position:relative;display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);overflow:hidden;box-shadow:var(--sh-xs);cursor:pointer;text-align:left;font-family:inherit;padding:0;transition:transform .26s cubic-bezier(.22,1,.36,1),box-shadow .26s,border-color .2s}
.card:hover{transform:translateY(-3px);box-shadow:var(--sh-md);border-color:rgba(var(--teal-rgb),.25)}
.card:active{transform:translateY(-1px) scale(.995);transition-duration:.09s}
.cover{position:relative;display:block;height:118px;overflow:hidden;flex-shrink:0}
.cover-art{position:absolute;inset:0;z-index:0}
.cover-chip{position:absolute;z-index:1;top:10px;right:10px;display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:#fff;background:rgba(0,0,0,.4);backdrop-filter:blur(6px);padding:4px 9px;border-radius:100px}
.body{display:flex;flex-direction:column;padding:13px 15px 15px;min-width:0}
.name{font-size:14.5px;font-weight:700;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.teacher{display:flex;align-items:center;gap:5px;margin-top:3px;font-size:12px;color:var(--text4);min-width:0}
.teacher svg{flex-shrink:0}
.teacher .truncate{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px;padding-top:11px;border-top:1px solid var(--border)}
.metric{display:flex;flex-direction:column;gap:1px;min-width:0}
.metric-val{font-size:14px;font-weight:700;color:var(--text1);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.metric-lbl{font-size:10px;color:var(--text4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* Полоса внизу карточки — доля предмета в расходе относительно самого
   «дорогого»: видно лидера, не читая цифр. */
.share{position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--surface2)}
.share span{display:block;height:100%;border-radius:0 3px 3px 0;background:linear-gradient(90deg,var(--teal-h),var(--teal));transition:width .6s cubic-bezier(.22,1,.36,1)}
.empty{grid-column:1/-1;text-align:center;padding:28px;color:var(--text4);font-size:13px}
.center-loading{display:flex;justify-content:center;padding:32px}

@media (max-width:768px){
  /* Как и в списке пользователей: поиск на всю строку, сортировка под ним. */
  .search-wrap{flex:1 1 100%}
  .sort-sel{flex:1;min-width:0}
  .grid{grid-template-columns:1fr 1fr;gap:10px}
  .cover{height:96px}
  .body{padding:11px 12px 13px}
  .metrics{grid-template-columns:1fr 1fr;gap:6px}
  .metric:last-child{display:none}
  .list-head-hint{display:none}
}
@media (max-width:420px){
  .grid{grid-template-columns:1fr}
  .metric:last-child{display:flex}
  .metrics{grid-template-columns:repeat(3,1fr)}
}
</style>
