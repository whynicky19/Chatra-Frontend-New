<template>
  <div class="pg anim-in">
    <div class="pg-head">
      <h1 class="pg-title">{{ t('settings.title') }}</h1>
      <p class="pg-sub">{{ lang === 'ru' ? 'Управляйте аккаунтом и настройками' : lang === 'kk' ? 'Аккаунтыңызды және параметрлерді басқарыңыз' : 'Manage your account and preferences' }}</p>
    </div>

    <div class="pg-body">
      <!-- Profile Details -->
      <div class="scard">
        <div class="scard-head">
          <div>
            <h2 class="scard-title">{{ t('settings.profile_details') }}</h2>
            <p class="scard-sub">{{ t('settings.profile_sub') }}</p>
          </div>
          <button class="btn btn-teal btn-lg save-btn-desktop" @click="saveProfile">{{ t('settings.save') }}</button>
        </div>
        <div class="profile-form">
          <label class="avatar-upload-area" title="Upload photo">
            <input type="file" accept="image/*" style="display:none" @change="onAvatarPick"/>
            <img v-if="auth.avatar" :src="auth.avatar" class="prof-av"/>
            <div v-else class="prof-av-init">{{ uInit }}</div>
            <div class="av-overlay">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
          </label>
          <div class="fields-grid">
            <div class="field-group">
              <label class="field-label">{{ t('settings.full_name') }}</label>
              <input v-model="fullnameInput" class="input field-input" placeholder="Иванов Иван Иванович" maxlength="80"/>
              <div v-if="fullnameInput && fullnameInput.trim().split(' ').filter(Boolean).length < 2" class="nick-hint err">Введите фамилию и имя</div>
            </div>
            <div class="field-group">
              <label class="field-label">{{ t('settings.email') }}</label>
              <input :value="auth.user?.email" class="input field-input" readonly style="opacity:.7;cursor:default"/>
            </div>
            <div class="field-group">
              <label class="field-label">{{ t('settings.role') }}</label>
              <div class="input field-input field-locked">
                {{ roleLabel }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:auto;opacity:.4"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">{{ t('settings.institution') }}</label>
              <input :value="institutionLabel" class="input field-input" readonly style="opacity:.7;cursor:default"/>
            </div>
          </div>
        </div>
        <button class="btn btn-teal btn-lg save-btn-mobile" @click="saveProfile">{{ t('settings.save') }}</button>
      </div>

      <!-- Preferences row (no appearance) -->
      <div class="scard">
        <div class="scard-head-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          <h3 class="scard-h3">{{ t('settings.preferences') }}</h3>
        </div>
        <div class="pref-list">
          <div class="pref-row">
            <div class="pref-info">
              <div class="pref-title">{{ lang==='ru'?'Тёмная тема':lang==='kk'?'Қараңғы тақырып':'Dark mode' }}</div>
              <div class="pref-sub">{{ lang==='ru'?'Тёмное оформление интерфейса':lang==='kk'?'Интерфейстің қараңғы безендірілуі':'Dark interface appearance' }}</div>
            </div>
            <button class="theme-toggle" @click="setTheme(!isDark)" :title="isDark ? 'Светлая тема' : 'Тёмная тема'">
              <div class="toggle-track" :class="{dark: isDark}">
                <div class="toggle-thumb">
                  <svg v-if="isDark" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                  <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                </div>
              </div>
            </button>
          </div>
          <div class="pref-row">
            <div class="pref-info">
              <div class="pref-title">{{ lang==='ru'?'Язык':lang==='kk'?'Тіл':'Language' }}</div>
              <div class="pref-sub">{{ lang==='ru'?'Язык интерфейса':lang==='kk'?'Интерфейс тілі':'Interface language' }}</div>
            </div>
            <div class="lang-seg">
              <button v-for="l in [{code:'ru',label:'RU'},{code:'en',label:'EN'},{code:'kk',label:'KZ'}]" :key="l.code"
                :class="['lang-seg-btn',{active:lang===l.code}]" @click="setLang(l.code as any)">{{ l.label }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- AI limit -->
      <NuxtLink to="/ai-limit" class="scard nav-card">
        <div class="nav-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M18 17l.7 1.8L20.5 19.5l-1.8.7L18 22l-.7-1.8L15.5 19.5l1.8-.7z"/></svg></div>
        <div style="flex:1">
          <div class="nav-title">{{ lang==='ru'?'AI лимит':lang==='kk'?'AI лимиті':'AI limit' }}</div>
          <div class="nav-sub">{{ lang==='ru'?'Дневной лимит запросов к ИИ':lang==='kk'?'ЖИ сұрауларының күндік лимиті':'Daily AI request limit' }}</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </NuxtLink>

      <!-- Аккаунт и безопасность -->
      <NuxtLink to="/security" class="scard nav-card">
        <div class="nav-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div style="flex:1">
          <div class="nav-title">{{ lang==='ru'?'Аккаунт и безопасность':lang==='kk'?'Аккаунт және қауіпсіздік':'Account & security' }}</div>
          <div class="nav-sub">{{ lang==='ru'?'Пароль и удаление аккаунта':lang==='kk'?'Құпия сөз және аккаунтты жою':'Password and account deletion' }}</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </NuxtLink>

      <!-- О приложении -->
      <NuxtLink to="/about" class="scard nav-card">
        <div class="nav-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>
        <div style="flex:1">
          <div class="nav-title">{{ lang==='ru'?'О приложении':lang==='kk'?'Қосымша туралы':'About' }}</div>
          <div class="nav-sub">{{ lang==='ru'?'Условия и политика конфиденциальности':lang==='kk'?'Шарттар және құпиялылық саясаты':'Terms and privacy policy' }}</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </NuxtLink>

      <!-- Logout -->
      <button class="scard logout-card" @click="doLogout">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        {{ t('nav.logout') }}
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useAuthSvc } from '~/services/auth'
import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'
import { useAuth } from '~/composables/useAuth'
definePageMeta({ layout: 'default' })
const auth = useAuthStore(); const authSvc = useAuthSvc(); const toast = useToast(); const { t, lang, setLang } = useI18n()
const { logout } = useAuth()
const doLogout = () => { logout() }

const fullnameInput = ref(''); const nickOk = ref<boolean|null>(null); const nickChecking = ref(false)
const isDark = ref(false); const followSystem = ref(false)

const uInit = computed(() => (auth.fullname || auth.nickname || auth.user?.email || '?')[0]?.toUpperCase())
const roleLabel = computed(() => {
  const role = auth.user?.role
  if (role === 'admin') return t('settings.admin')
  if (role === 'teacher') return lang.value === 'ru' ? 'Преподаватель' : 'Teacher'
  return t('settings.student')
})
const institutionLabel = computed(() => {
  const isSchool = auth.user?.org_type === 'school'
  return isSchool
    ? (lang.value === 'ru' ? 'Школа' : lang.value === 'kk' ? 'Мектеп' : 'School')
    : (lang.value === 'ru' ? 'Университет' : lang.value === 'kk' ? 'Университет' : 'University')
})

const saveProfile = async () => {
  const fn = fullnameInput.value.trim()
  if (fn) {
    auth.setFullname(fn)
    try { await authSvc.updateMe(fn) } catch {}
  }
  toast.ok(t('settings.nick_saved'))
}
const onAvatarPick = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return
  const r = new FileReader()
  r.onload = () => { auth.setAvatar(r.result as string); toast.ok(t('settings.avatar_updated')) }
  r.readAsDataURL(f)
}
const setTheme = (dark: boolean) => {
  isDark.value = dark
  if (dark) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark') }
  else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light') }
}
onMounted(() => {
  const theme = localStorage.getItem('theme')
  isDark.value = theme === 'dark'
  if (isDark.value) document.documentElement.classList.add('dark')
  fullnameInput.value = auth.fullname || auth.nickname || ''
})
</script>
<style scoped>
.pg{height:100%;overflow-y:auto;background:var(--bg);display:flex;flex-direction:column}
.pg-head{padding:28px 32px 0;flex-shrink:0}
.pg-title{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:26px;font-weight:800;color:var(--text1);margin-bottom:4px}
.pg-sub{font-size:14px;color:var(--text4)}
.pg-body{padding:20px 32px 40px;display:flex;flex-direction:column;gap:20px}
.scard{background:var(--surface);border-radius:20px;padding:24px;box-shadow:var(--sh-sm)}
.scard-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;gap:16px}
.scard-head-sm{display:flex;align-items:center;gap:10px;margin-bottom:18px}
.scard-title{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:20px;font-weight:800;color:var(--text1);margin-bottom:4px}
.scard-sub{font-size:13px;color:var(--text4)}
.scard-h3{font-size:16px;font-weight:700;color:var(--text1)}
.profile-form{display:flex;gap:28px;align-items:flex-start}
.avatar-upload-area{position:relative;display:block;cursor:pointer;width:90px;height:90px;flex-shrink:0}
.prof-av{width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid var(--surface);box-shadow:var(--sh-sm)}
.prof-av-init{width:90px;height:90px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--teal-d));color:#fff;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:800;box-shadow:0 6px 18px -3px rgba(var(--teal-rgb),.45)}
.av-overlay{position:absolute;inset:0;background:rgba(0,0,0,.4);border-radius:50%;opacity:0;display:flex;align-items:center;justify-content:center;transition:opacity .2s}
.avatar-upload-area:hover .av-overlay{opacity:1}
.fields-grid{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:16px}
.field-group{display:flex;flex-direction:column;gap:6px}
.field-label{font-size:11px;font-weight:700;color:var(--text4);letter-spacing:.08em;text-transform:uppercase}
.field-input{background:var(--bg2)!important;border:none!important;border-radius:14px!important;padding:12px 16px!important}
html.dark .field-input{background:var(--surface2)!important}
.field-input:focus{box-shadow:0 0 0 2px var(--teal)!important}
.field-locked{display:flex;align-items:center;color:var(--text2)}
.nick-hint{font-size:11px;font-weight:500}.nick-hint.ok{color:var(--green)}.nick-hint.err{color:var(--red)}
.two-col-row{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.nav-card{display:flex;align-items:center;gap:14px;padding:16px 24px;color:var(--text1);text-decoration:none;transition:background .15s}
.nav-card:hover{background:var(--hover,rgba(0,0,0,.03))}
.nav-icon{width:34px;height:34px;border-radius:10px;background:var(--teal-l);color:var(--teal);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.nav-title{font-size:15px;font-weight:600;color:var(--text1)}
.nav-sub{font-size:12.5px;color:var(--text4);margin-top:1px}
.pref-list{display:flex;flex-direction:column}
.pref-row{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--border)}
.pref-row:last-child{border-bottom:none;padding-bottom:0}
.pref-title{font-size:14px;font-weight:600;color:var(--text1);margin-bottom:2px}
.pref-sub{font-size:12px;color:var(--text4)}
/* Переключатель темы — тот же, что был на главной */
.theme-toggle{background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center}
.toggle-track{width:46px;height:26px;border-radius:100px;background:var(--surface3);border:1.5px solid var(--border2);position:relative;transition:all .25s;display:flex;align-items:center}
.toggle-track.dark{background:var(--teal-d,#1a3a44);border-color:var(--teal)}
.toggle-thumb{width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.18);position:absolute;left:2px;display:flex;align-items:center;justify-content:center;transition:transform .25s cubic-bezier(.34,1.56,.64,1);color:#888}
.toggle-track.dark .toggle-thumb{transform:translateX(20px);color:var(--teal)}
.theme-btns{display:flex;gap:12px;margin-bottom:16px}
.theme-choice{flex:1;display:flex;flex-direction:column;align-items:center;gap:10px;padding:18px 12px;border-radius:var(--r-lg);border:2px solid var(--border);background:var(--surface2);cursor:pointer;transition:all .18s;font-size:13px;font-weight:600;color:var(--text2)}
.theme-choice:hover{border-color:var(--border2);color:var(--text1)}
.theme-choice.sel{border-color:var(--teal);background:var(--teal-l);color:var(--teal)}
.theme-icon{width:44px;height:44px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center}
.light-icon{background:#f0f4f5;color:#0d2d33;border:1px solid var(--border)}
.dark-icon{background:#111b1e;color:#e8f4f6;border:1px solid rgba(var(--teal-rgb),.2)}
.follow-sys{display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid var(--border)}
.follow-info{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text3)}
/* Смена пароля */
/* Модалка удаления */
.save-btn-mobile { display: none; }
.lang-seg{display:flex;gap:2px;background:var(--bg2);border-radius:10px;padding:3px;flex-shrink:0}
.lang-seg-btn{padding:5px 12px;border-radius:8px;font-size:12px;font-weight:700;color:var(--text3);letter-spacing:.03em;transition:all .15s;border:none;background:none;cursor:pointer}
.lang-seg-btn.active{background:var(--surface);color:var(--teal);box-shadow:var(--sh-xs)}
.logout-card{display:flex;align-items:center;justify-content:center;gap:8px;color:var(--red);font-size:15px;font-weight:600;cursor:pointer;padding:16px 24px;border:none;width:100%;transition:background .15s,transform .12s}
.logout-card:hover{background:var(--red-l)}
.logout-card:active{transform:scale(.98)}
@media (max-width:768px){
  .pg { overflow-x: hidden; overflow-y: auto; }
  .pg-head { padding: calc(18px + env(safe-area-inset-top, 0px)) 16px 0; }
  .pg-body { padding: 14px 16px 90px; gap: 14px; }
  .scard { padding: 18px 16px; border-radius: 20px; }
  .scard-head { flex-direction: column; gap: 12px; margin-bottom: 16px; }
  .save-btn-desktop { display: none; }
  .save-btn-mobile { display: flex; width: 100%; min-height: 50px; margin-top: 16px; }
  .profile-form { flex-direction: column; align-items: center; gap: 16px; }
  .fields-grid { grid-template-columns: 1fr; gap: 12px; }
  .two-col-row { grid-template-columns: 1fr; gap: 14px; }
  .field-input { font-size: 16px; }
  .input { font-size: 16px !important; }
  .pref-row { padding: 16px 0; min-height: 60px; }
  .theme-btns { gap: 8px; }
  .theme-choice { padding: 14px 8px; font-size: 12px; min-height: 80px; }
  .theme-toggle { min-height: 44px; min-width: 56px; justify-content: flex-end; }
}
@media (max-width:480px){
  .pg-head { padding: calc(14px + env(safe-area-inset-top, 0px)) 16px 0; }
  .pg-body { padding: 12px 14px 90px; }
  .scard { padding: 16px 14px; }
}
</style>