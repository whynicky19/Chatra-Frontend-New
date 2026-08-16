<template>
  <div class="pg">
    <div class="pg-head">
      <div>
        <h1 class="pg-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Админ-панель
        </h1>
        <p class="pg-sub">Пользователи, предметы и активность ИИ</p>
      </div>
    </div>

    <div class="pg-body">
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon stat-icon-blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
          <div>
            <div class="stat-val">{{ users.length || '—' }}</div>
            <div class="stat-lbl">Пользователей</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-purple">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <div>
            <div class="stat-val">{{ classes.length || '—' }}</div>
            <div class="stat-lbl">Предметов</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-orange">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <div>
            <div class="stat-val">{{ fmt(grandTotalTokens) }}</div>
            <div class="stat-lbl">Токенов ИИ</div>
          </div>
        </div>
      </div>

      <!-- Tabs — тот же сегмент-контрол в стиле iOS, что и на странице класса:
           плавающая подложка скользит внутри общей "полочки" на всю ширину. -->
      <div class="tabs-bar" :style="{ '--tab-count': 3, '--tab-index': tabIndex }">
        <div class="tabs-indicator"></div>
        <button :class="['tab-btn', { active: tab === 'users' }]" @click="tab = 'users'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          Пользователи
        </button>
        <button :class="['tab-btn', { active: tab === 'classes' }]" @click="tab = 'classes'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          Предметы
        </button>
        <button :class="['tab-btn', { active: tab === 'ai-usage' }]" @click="tab = 'ai-usage'">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Запросы к ИИ
        </button>
      </div>

      <AdminUsersTab v-if="tab === 'users'" @loaded="users = $event"/>
      <AdminClassesTab v-else-if="tab === 'classes'" :classes="classes" :summary="aiSummary"
                       :users="users" :loading="loadingClasses"/>
      <AiUsageDashboard v-else-if="tab === 'ai-usage'"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useAuth } from '~/composables/useAuth'
import { useAdminSvc } from '~/services/admin'
import { useClassesSvc } from '~/services/classes'
import { useAdminFormat } from '~/composables/useAdminFormat'
import type { AdminUserRow } from '~/services/admin'

definePageMeta({ layout: 'default' })

const auth = useAuthStore()
const { fetchMe } = useAuth()
const adminSvc = useAdminSvc()
const classesSvc = useClassesSvc()
const { fmt } = useAdminFormat()

const tab = ref<'users' | 'classes' | 'ai-usage'>('users')
const tabIndex = computed(() => (tab.value === 'users' ? 0 : tab.value === 'classes' ? 1 : 2))

// Список пользователей приходит из вкладки (там он и нужен), страница держит
// его ради плитки сверху и имён создателей предметов.
const users = ref<AdminUserRow[]>([])

// Предметы и сводку расхода грузит страница: они кормят и плитки, и вкладку
// «Предметы», которая монтируется позже.
const classes = ref<any[]>([])
const aiSummary = ref<any[]>([])
const loadingClasses = ref(false)
const grandTotalTokens = computed(() =>
  aiSummary.value.reduce((sum: number, s: any) => sum + (s.total_tokens || 0), 0))

onMounted(async () => {
  // При жёсткой перезагрузке /admin auth.user ещё не подгружен (профиль
  // тянется асинхронно в layouts/default.vue, а onMounted страницы
  // срабатывает раньше onMounted родительского layout) — без ожидания
  // настоящий админ видел бы пустую панель без единого признака ошибки.
  if (auth.token && !auth.user) await fetchMe()
  if (!auth.isAdmin) return
  loadingClasses.value = true
  try { classes.value = await classesSvc.listAll() } catch {}
  finally { loadingClasses.value = false }
  try { aiSummary.value = await adminSvc.aiUsageSummary() } catch {}
})
</script>

<style scoped>
.pg{height:100%;overflow-y:auto;background:var(--bg)}
.pg-head{padding:24px 32px 0;display:flex;align-items:center}
.pg-title{font-size:20px;font-weight:700;letter-spacing:-.02em;display:flex;align-items:center;gap:8px}
.pg-sub{font-size:13px;color:var(--text4);margin-top:3px;margin-left:28px}
.pg-body{padding:20px 32px 32px}

.stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px;display:flex;align-items:center;gap:12px;box-shadow:var(--sh-xs)}
.stat-icon{width:38px;height:38px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}
/* Apple Settings-style icon tiles — one hue per category instead of every
   stat tinted the same brand blue, so blue reads as "the accent" not "the
   wallpaper". */
.stat-icon-blue{background:rgba(var(--teal-rgb),.12);color:var(--teal)}
.stat-icon-purple{background:rgba(191,90,242,.12);color:#BF5AF2}
.stat-icon-orange{background:rgba(255,159,10,.14);color:#FF9F0A}
.stat-val{font-size:22px;font-weight:700;letter-spacing:-.01em;font-variant-numeric:tabular-nums}
.stat-lbl{font-size:12px;color:var(--text3)}

/* Tabs — тот же сегмент-контрол, что на странице класса (pages/classes/[id].vue):
   равные сегменты внутри скруглённой "полочки" с плавающей подложкой активного
   таба, на всю ширину контента вместо трёх кнопок слева. */
.tabs-bar{position:relative;display:flex;align-items:stretch;padding:3px;background:var(--surface2);border-radius:12px;min-height:38px;margin-bottom:20px}
.tabs-indicator{position:absolute;top:3px;bottom:3px;left:3px;width:calc((100% - 6px) / var(--tab-count));transform:translateX(calc(100% * var(--tab-index)));background:var(--surface);border-radius:9px;box-shadow:0 1px 4px rgba(0,0,0,.12);transition:transform .28s cubic-bezier(.4,0,.2,1)}
html.dark .tabs-indicator{box-shadow:0 1px 4px rgba(0,0,0,.35)}
.tab-btn{position:relative;z-index:1;flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:0 10px;min-height:38px;font-size:clamp(11px,3.2vw,13px);font-weight:600;color:var(--text4);background:transparent;border:none;border-radius:9px;cursor:pointer;transition:color .2s;white-space:nowrap;font-family:inherit;letter-spacing:-.01em}
.tab-btn svg{flex-shrink:0}
.tab-btn:hover{color:var(--text2)}
.tab-btn.active{color:var(--text1);font-weight:700}

@media (max-width:768px){
  .pg-head{padding:calc(18px + env(safe-area-inset-top,0px)) 16px 0}
  .pg-body{padding:14px 16px 28px}
  .pg-title{font-size:17px}
  .pg-sub{margin-left:0}
  .stats-row{gap:8px;margin-bottom:16px}
  .stat-card{padding:12px 8px;flex-direction:column;align-items:flex-start;gap:6px}
  .stat-icon{width:30px;height:30px}
  .stat-val{font-size:16px}
  .stat-lbl{font-size:10px}
  .tabs-bar{flex-wrap:nowrap}
  .tab-btn{white-space:nowrap;min-width:0;padding:0 4px}
}
/* Иконки табов скрываем только на настоящих телефонных ширинах (как на
   странице класса) — на планшетных места хватает, без иконок таб выглядел бы
   полупустым. */
@media (max-width:599px){
  .tab-btn{gap:0}
  .tab-btn svg{display:none}
}
@media (max-width:480px){
  .stat-card{padding:10px 6px}
  .tab-btn{padding:0 2px}
}
</style>
