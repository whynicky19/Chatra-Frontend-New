<template>
  <aside :class="['sb', { collapsed: isCollapsed }]">
    <!-- Logo — click to toggle sidebar -->
    <div class="sb-logo" @click="toggleSidebar">
      <template v-if="!isCollapsed">
        <span class="logo-img-new" role="img" aria-label="Chatra"></span>
        <span class="logo-name">Chatra</span>
      </template>
      <template v-else>
        <span class="logo-img-collapsed" role="img" aria-label="Chatra"></span>
      </template>
    </div>

    <nav class="sb-nav">
      <NuxtLink to="/" class="sb-item" :class="{active:route.path==='/'||route.path.startsWith('/classes')}">
        <div class="item-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M9 2v6l2.5-1.6L14 8V2"/></svg>
        </div>
        <span class="item-label" v-if="!isCollapsed || isMobile">{{ t('nav.classes') }}</span>
      </NuxtLink>

      <NuxtLink v-if="auth.isAdmin" to="/admin" class="sb-item" :class="{active:route.path==='/admin'}">
        <div class="item-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <span class="item-label" v-if="!isCollapsed || isMobile">{{ t('nav.participants') }}</span>
      </NuxtLink>

      <NuxtLink to="/ai" class="sb-item" :class="{active:route.path==='/ai'}">
        <div class="item-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M9 2c.4 3.2 1.8 4.6 5 5-3.2.4-4.6 1.8-5 5-.4-3.2-1.8-4.6-5-5 3.2-.4 4.6-1.8 5-5Z"/><path d="M17.5 12c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z"/></svg>
        </div>
        <span class="item-label" v-if="!isCollapsed || isMobile">{{ t('nav.ai') }}</span>
      </NuxtLink>

      <NuxtLink to="/settings" class="sb-item" :class="{active:route.path==='/settings'}">
        <div class="item-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </div>
        <span class="item-label" v-if="!isCollapsed || isMobile">{{ t('nav.settings') }}</span>
      </NuxtLink>
    </nav>

    <!-- Nudge: нет ФИО -->
    <div v-if="!isCollapsed && !isMobile && !auth.fullname" class="fio-nudge" @click="$router.push('/settings')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>Укажите ваше ФИО в настройках</span>
    </div>

    <div class="sb-bottom">
      <a href="https://t.me/whynickyy" target="_blank" class="sb-item help-item" :title="t('support.help_center')">
        <div class="item-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <span class="item-label" v-if="!isCollapsed || isMobile">{{ t('support.help_center') }}</span>
      </a>
      <div class="sb-item logout-item" @click="doLogout" :title="t('nav.logout')">
        <div class="item-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </div>
        <span class="item-label" v-if="!isCollapsed || isMobile">{{ t('nav.logout') }}</span>
      </div>
    </div>
  </aside>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from '#app'
import { useAuthStore } from '~/stores/auth.store'
import { useAuth } from '~/composables/useAuth'
import { useI18n } from '~/composables/useI18n'
const auth = useAuthStore(); const { logout } = useAuth(); const route = useRoute()
const { t } = useI18n()
const doLogout = () => { logout() }

const isCollapsed = ref(false)
const isMobile = ref(false)
let collapsedClassTimer: ReturnType<typeof setTimeout> | null = null
const SB_TRANSITION_MS = 250
const applyCollapsedClass = (collapsed: boolean) => {
  if (import.meta.client) document.documentElement.classList.toggle('sidebar-collapsed', collapsed)
}
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  if (import.meta.client) {
    localStorage.setItem('_sidebar_collapsed', isCollapsed.value ? '1' : '0')
    if (collapsedClassTimer) { clearTimeout(collapsedClassTimer); collapsedClassTimer = null }
    if (isCollapsed.value) {
      // Collapsing: widen the grid right away so cards grow together with the sidebar shrinking
      applyCollapsedClass(true)
    } else {
      // Expanding: keep the wide grid until the sidebar finishes animating, then switch once
      collapsedClassTimer = setTimeout(() => { applyCollapsedClass(false); collapsedClassTimer = null }, SB_TRANSITION_MS)
    }
  }
}
let resizeHandler: (() => void) | null = null
onMounted(() => {
  if (import.meta.client) {
    isCollapsed.value = localStorage.getItem('_sidebar_collapsed') === '1'
    applyCollapsedClass(isCollapsed.value)
    resizeHandler = () => { isMobile.value = window.innerWidth <= 768 }
    resizeHandler()
    window.addEventListener('resize', resizeHandler)
  }
})
onUnmounted(() => {
  if (import.meta.client && resizeHandler) window.removeEventListener('resize', resizeHandler)
  if (collapsedClassTimer) { clearTimeout(collapsedClassTimer); collapsedClassTimer = null }
})
</script>
<style scoped>
.sb{width:220px;height:100%;display:flex;flex-direction:column;background:linear-gradient(180deg,rgba(255,255,255,.9),rgba(255,255,255,.78));-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);border-right:1px solid var(--border);flex-shrink:0;overflow:hidden;transition:width .25s cubic-bezier(.4,0,.2,1);position:relative}
html.dark .sb{background:linear-gradient(180deg,rgba(28,28,30,.86),rgba(20,20,22,.78))}
.sb.collapsed{width:56px}
.sb-logo{display:flex;align-items:center;gap:8px;padding:14px 12px 8px;cursor:pointer;flex-shrink:0;overflow:hidden;min-height:52px}
.logo-img-new{width:34px;height:34px;flex-shrink:0;background:linear-gradient(180deg,var(--teal),var(--teal-d));-webkit-mask:url('/logo-icon.png') center / contain no-repeat;mask:url('/logo-icon.png') center / contain no-repeat}
/* Иконка-марка без надписи "CHATRA" (logo.png её содержит и при 30px
   превращалась в нечитаемое пятно текста) — logo-icon.png, тот же файл,
   что и в развёрнутом состоянии. Размер — близко к масштабу навигационных
   иконок (.item-icon, ~20px), а не во всю ширину свёрнутого сайдбара,
   которую не трогаем. */
.logo-img-collapsed{width:22px;height:22px;flex-shrink:0;margin:0 auto;background:linear-gradient(180deg,var(--teal),var(--teal-d));-webkit-mask:url('/logo-icon.png') center / contain no-repeat;mask:url('/logo-icon.png') center / contain no-repeat}
.logo-name{font-size:16px;font-weight:800;color:var(--text1);letter-spacing:.04em;flex:1;overflow:hidden;white-space:nowrap}
.sb-nav{flex:1;padding:4px 6px;display:flex;flex-direction:column;gap:2px;overflow-y:auto;overflow-x:hidden}
.sb-item{display:flex;align-items:center;gap:10px;padding:10px 10px;border-radius:var(--r-md);font-size:14px;font-weight:500;color:var(--text3);transition:all .15s;cursor:pointer;text-decoration:none;position:relative;white-space:nowrap}
.sb-item:hover{background:var(--surface2);color:var(--text1)}
.sb-item.active{background:var(--teal-l);color:var(--teal)}
.sb-item.active .item-icon svg{stroke:var(--teal)}
.collapsed .sb-item{justify-content:center;padding:10px 6px}
.collapsed .sb-logo{justify-content:center;padding:14px 6px 8px}
.item-icon{position:relative;flex-shrink:0;width:20px;height:20px;display:flex;align-items:center;justify-content:center;color:inherit}
.item-label{flex:1;overflow:hidden;text-overflow:ellipsis}
.sb-bottom{padding:8px 6px 14px;border-top:1px solid var(--border);flex-shrink:0;display:flex;flex-direction:column;gap:2px}
.help-item{color:var(--text4)}
.logout-item{color:var(--text4)}
.logout-item:hover{background:var(--red-l)!important;color:var(--red)!important}
.fio-nudge{display:flex;align-items:center;gap:8px;margin:0 6px 8px;padding:10px 12px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);border-radius:var(--r-md);font-size:12px;font-weight:600;color:#b45309;cursor:pointer;transition:background .15s;}
.fio-nudge:hover{background:rgba(245,158,11,.18);}
/* Тёмная тема: #b45309 на затемнённом янтарном фоне даёт контраст ~3.4:1
   (ниже WCAG AA 4.5:1 для обычного текста) — светлее оттенок, как уже
   сделано в AiLimitNotice для того же предупреждающего цвета. */
html.dark .fio-nudge{color:#fbbf24}

@media (max-width:768px){
  /* iOS-таб-бар: матовое стекло, иконки с подписями */
  .sb{
    position:fixed!important;
    bottom:calc(10px + env(safe-area-inset-bottom, 0px));left:10px;right:10px;top:auto!important;
    width:auto!important;
    height:66px;
    flex-direction:row;
    border-right:none;
    border:1px solid var(--border);
    border-radius:26px;
    z-index:200;
    overflow:visible;
    background:rgba(255,255,255,.78);
    -webkit-backdrop-filter:blur(24px) saturate(180%);
    backdrop-filter:blur(24px) saturate(180%);
    box-shadow:0 8px 32px rgba(0,60,70,.14),0 2px 8px rgba(0,0,0,.06);
    padding:0 6px;
  }
  html.dark .sb{
    background:rgba(28,28,30,.75);
    box-shadow:0 8px 32px rgba(0,0,0,.5),0 2px 8px rgba(0,0,0,.3);
    border-color:rgba(255,255,255,.1);
  }
  .sb.collapsed{width:auto!important}
  .sb-logo,.fio-nudge,.sb-bottom{display:none}
  .sb-nav{
    flex-direction:row;
    flex:1;
    padding:6px 2px;
    gap:2px;
    overflow:visible;
    align-items:stretch;
    justify-content:space-around;
  }
  .sb-item{
    flex-direction:column;
    padding:5px 4px 4px;
    gap:3px;
    border-radius:18px;
    justify-content:center;
    align-items:center;
    flex:1;
    min-width:0;
    white-space:nowrap;
    transition:color .18s;
  }
  .sb-item:hover{background:transparent;color:var(--text3)}
  .sb-item .item-label{
    display:block;flex:none;
    font-size:10px;font-weight:600;letter-spacing:.01em;
    max-width:100%;overflow:hidden;text-overflow:ellipsis;
  }
  .item-icon{
    width:auto;height:30px;min-width:52px;padding:0 12px;
    border-radius:100px;
    transition:background .2s,color .2s,box-shadow .2s;
  }
  .sb-item.active{background:transparent!important;color:var(--teal)!important;box-shadow:none;border-left:none}
  .sb-item.active .item-icon{background:var(--teal);color:#fff;box-shadow:0 3px 12px rgba(var(--teal-rgb),.35)}
  .sb-item.active .item-icon svg{stroke:#fff}
  .sb-item.active::before{display:none}
  .sb-item.active::after{display:none}
  .sb-item:active .item-icon{transform:scale(.92);transition:transform .1s}
  .collapsed .sb-item{justify-content:center}
}
@media (max-width:480px){
  .sb{bottom:calc(8px + env(safe-area-inset-bottom, 0px));left:8px;right:8px;height:62px}
  .item-icon{height:28px;min-width:46px;padding:0 10px}
}

/* Плотный fallback вместо стекла для пользователей с настройкой
   "уменьшить прозрачность" — идёт последним, чтобы перебить и десктопный,
   и мобильный (таб-бар) варианты .sb выше. */
@media (prefers-reduced-transparency: reduce){
  .sb{background:var(--surface)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
  html.dark .sb{background:var(--surface)!important}
}
</style>
