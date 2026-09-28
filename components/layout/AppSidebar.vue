<template>
  <aside :class="['sb', { collapsed: isCollapsed }]">
    <div class="sb-logo" @click="toggleSidebar">
      <template v-if="!isCollapsed">
        <span class="logo-img-new" role="img" aria-label="Chatra"></span>
        <span class="logo-name">Chatra</span>
        <span class="collapse-hint" :title="lang === 'ru' ? 'Свернуть панель' : 'Collapse sidebar'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
        </span>
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

    <div v-if="!isCollapsed && !isMobile && !auth.fullname" class="fio-nudge" @click="$router.push('/settings')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>Укажите ваше ФИО в настройках</span>
    </div>

    <div class="sb-bottom">
      <NuxtLink v-if="!isCollapsed && !isMobile" to="/settings" class="profile-card">
        <span class="profile-avatar">{{ profileInitials }}</span>
        <span class="profile-copy">
          <span class="profile-name">{{ displayName }}</span>
          <span class="profile-role">{{ roleLabel }}</span>
        </span>
        <svg class="profile-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
      </NuxtLink>
      <button type="button" class="sb-item theme-item" :title="isDark ? (lang === 'ru' ? 'Светлая тема' : 'Light theme') : (lang === 'ru' ? 'Тёмная тема' : 'Dark theme')" @click="toggleTheme">
        <div class="item-icon">
          <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
        </div>
        <span class="item-label" v-if="!isCollapsed || isMobile">{{ isDark ? (lang === 'ru' ? 'Светлая тема' : 'Light theme') : (lang === 'ru' ? 'Тёмная тема' : 'Dark theme') }}</span>
      </button>
      <a href="https://t.me/whynickyy" target="_blank" class="sb-item help-item" :title="t('support.help_center')">
        <div class="item-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <span class="item-label" v-if="!isCollapsed || isMobile">{{ t('support.help_center') }}</span>
      </a>
      <button type="button" class="sb-item logout-item" @click="doLogout" :title="t('nav.logout')">
        <div class="item-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </div>
        <span class="item-label" v-if="!isCollapsed || isMobile">{{ t('nav.logout') }}</span>
      </button>
    </div>
  </aside>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from '#app'
import { useAuthStore } from '~/stores/auth.store'
import { useAuth } from '~/composables/useAuth'
import { useI18n } from '~/composables/useI18n'
const auth = useAuthStore(); const { logout } = useAuth(); const route = useRoute()
const { t, lang } = useI18n()
const doLogout = () => { logout() }

const isCollapsed = ref(false)
const isMobile = ref(false)
const isDark = ref(false)
const displayName = computed(() => (auth.fullname || auth.nickname || auth.user?.email?.split('@')[0] || 'Профиль').trim())
const profileInitials = computed(() => displayName.value.split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'C')
const roleLabel = computed(() => {
  if (auth.user?.role === 'admin') return lang.value === 'ru' ? 'Администратор' : lang.value === 'kk' ? 'Әкімші' : 'Administrator'
  if (auth.user?.role === 'teacher') return lang.value === 'ru' ? 'Преподаватель' : lang.value === 'kk' ? 'Оқытушы' : 'Teacher'
  return lang.value === 'ru' ? 'Студент' : lang.value === 'kk' ? 'Студент' : 'Student'
})
const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
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
    isDark.value = document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark'
    document.documentElement.classList.toggle('dark', isDark.value)
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
.sb{width:204px;height:100%;display:flex;flex-direction:column;background:linear-gradient(180deg,rgba(255,255,255,.88),rgba(247,247,249,.78));-webkit-backdrop-filter:blur(24px) saturate(170%);backdrop-filter:blur(24px) saturate(170%);border-right:1px solid color-mix(in srgb,var(--border2) 58%,transparent);flex-shrink:0;overflow:hidden;transition:width .25s cubic-bezier(.22,1,.36,1);position:relative;box-shadow:inset -1px 0 0 rgba(255,255,255,.32)}
html.dark .sb{background:linear-gradient(180deg,rgba(28,28,30,.86),rgba(20,20,22,.78))}
.sb.collapsed{width:60px}
.sb-logo{display:flex;align-items:center;gap:8px;padding:13px 10px 8px;cursor:pointer;flex-shrink:0;overflow:hidden;min-height:52px;-webkit-tap-highlight-color:transparent}
.logo-img-new{width:34px;height:34px;flex-shrink:0;background:linear-gradient(180deg,var(--teal),var(--teal-d));-webkit-mask:url('/logo-icon.png') center / contain no-repeat;mask:url('/logo-icon.png') center / contain no-repeat}
/* Иконка-марка без надписи "CHATRA" (logo.png её содержит и при 30px
   превращалась в нечитаемое пятно текста) — logo-icon.png, тот же файл,
   что и в развёрнутом состоянии. Размер — близко к масштабу навигационных
   иконок (.item-icon, ~20px), а не во всю ширину свёрнутого сайдбара,
   которую не трогаем. */
.logo-img-collapsed{width:22px;height:22px;flex-shrink:0;margin:0 auto;background:linear-gradient(180deg,var(--teal),var(--teal-d));-webkit-mask:url('/logo-icon.png') center / contain no-repeat;mask:url('/logo-icon.png') center / contain no-repeat}
.logo-name{font-size:16px;font-weight:800;color:var(--text1);letter-spacing:.04em;flex:1;overflow:hidden;white-space:nowrap}
.collapse-hint{width:27px;height:27px;border-radius:9px;display:flex;align-items:center;justify-content:center;color:var(--text4);background:color-mix(in srgb,var(--surface2) 68%,transparent);border:1px solid transparent;transition:color .15s,background .15s,transform .1s}
.sb-logo:hover .collapse-hint{color:var(--text2);background:var(--surface2);border-color:var(--border)}
.sb-logo:active .collapse-hint{transform:scale(.9)}
.sb-nav{flex:1;padding:8px 7px;display:flex;flex-direction:column;gap:3px;overflow-y:auto;overflow-x:hidden}
.sb-item{width:100%;display:flex;align-items:center;gap:10px;padding:9px 10px;border:0;border-radius:12px;font-family:inherit;font-size:13.5px;font-weight:560;color:var(--text3);background:transparent;transition:background .15s,color .15s,transform .1s;cursor:pointer;text-decoration:none;position:relative;white-space:nowrap;text-align:left}
.sb-item:hover{background:color-mix(in srgb,var(--surface2) 82%,transparent);color:var(--text1)}
.sb-item:active{transform:scale(.975)}
.sb-item.active{background:rgba(var(--teal-rgb),.1);color:var(--teal);font-weight:650}
.sb-item.active .item-icon svg{stroke:var(--teal)}
.collapsed .sb-item{justify-content:center;padding:9px 6px}
.collapsed .sb-logo{justify-content:center;padding:14px 6px 8px}
.item-icon{position:relative;flex-shrink:0;width:20px;height:20px;display:flex;align-items:center;justify-content:center;color:inherit}
.item-label{flex:1;overflow:hidden;text-overflow:ellipsis}
.sb-bottom{padding:8px 7px 12px;border-top:1px solid color-mix(in srgb,var(--border2) 52%,transparent);flex-shrink:0;display:flex;flex-direction:column;gap:3px;background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--surface) 32%,transparent))}
.profile-card{display:flex;align-items:center;gap:10px;margin-bottom:5px;padding:9px;border-radius:15px;color:inherit;text-decoration:none;background:color-mix(in srgb,var(--surface) 82%,transparent);border:1px solid color-mix(in srgb,var(--border2) 58%,transparent);box-shadow:0 1px 2px rgba(0,0,0,.025),0 8px 20px rgba(28,28,30,.04);transition:background .15s,border-color .15s,transform .1s}
.profile-card:hover{background:var(--surface);border-color:var(--border2)}
.profile-card:active{transform:scale(.98)}
.profile-avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:linear-gradient(145deg,var(--teal),var(--teal-h));color:#fff;font-size:11px;font-weight:760;letter-spacing:.02em;box-shadow:0 4px 12px rgba(var(--teal-rgb),.2)}
.profile-copy{display:flex;flex:1;min-width:0;flex-direction:column;gap:2px}
.profile-name{font-size:12.5px;font-weight:680;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.01em}
.profile-role{font-size:10.5px;font-weight:520;color:var(--text4)}
.profile-chevron{color:var(--text4);flex-shrink:0}
.theme-item{color:var(--text4)}
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
@media (prefers-reduced-motion: reduce){
  .sb{transition:none}
  .sb-item,.profile-card,.collapse-hint{transition:color .12s,background .12s,border-color .12s}
  .sb-item:active,.profile-card:active,.sb-logo:active .collapse-hint{transform:none}
}
</style>
