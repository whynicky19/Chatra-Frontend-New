<template>
  <div class="auth-card">
    <!-- Org type badge -->
    <div class="org-badge-row">
      <button :class="['org-pill', { school: org.isSchool }]" :title="lang==='ru'?'Сменить организацию':'Change organization'" @click="switchOrg">
        <span class="org-pill-icon">
          <svg v-if="org.isSchool" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
          <span v-else class="uni-glyph-sm"></span>
        </span>
        <span class="org-pill-label">{{ org.isSchool ? (lang==='ru'?'Школа':lang==='kk'?'Мектеп':'School') : (lang==='ru'?'Университет':lang==='kk'?'Университет':'University') }}</span>
        <svg class="org-pill-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
      </button>
    </div>

    <h2 class="auth-title">{{ t('register.title') }}</h2>
    <p class="auth-sub">{{ t('register.sub') }}</p>
    <form @submit.prevent="sub" class="auth-form">
      <div class="frow">
        <label class="flabel">{{ t('register.fullname') }} <span style="color:var(--red)">*</span></label>
        <input v-model="fullname" class="input" :placeholder="t('register.fullname_placeholder')" maxlength="80"/>
        <div v-if="fullname && fullname.trim().split(' ').filter(Boolean).length < 2" class="nick-hint err">{{ t('register.fullname_err') }}</div>
      </div>

      <div class="frow">
        <label class="flabel">Email</label>
        <input v-model="email" type="email" class="input" placeholder="you@example.com" @input="onEmailInput" @blur="emailTouched=true"/>
        <div v-if="emailTouched && email" :class="['nick-hint', emailOk?'ok':'err']">
          <span v-if="!emailOk">{{ t('register.email_invalid') }}</span>
          <span v-else>{{ t('register.email_ok') }}</span>
        </div>
        <div v-if="emailTouched && !email" class="nick-hint err">{{ t('register.email_required') }}</div>
      </div>

      <div class="frow">
        <label class="flabel">{{ t('login.password') }}</label>
        <input v-model="pw" type="password" class="input" :placeholder="t('register.pw_placeholder')" required minlength="8"/>
        <div v-if="pw" class="str-row">
          <div class="str-bar"><div :style="{width:score+'%',background:scoreColor}" class="str-fill"></div></div>
          <span class="str-lbl">{{scoreLabel}}</span>
        </div>
      </div>

      <button type="submit" class="btn btn-teal w-full btn-lg auth-submit" :disabled="loading||!canSubmit">
        <div v-if="loading" class="spinner" style="width:15px;height:15px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
        <span v-else>{{ t('register.submit') }}</span>
      </button>
    </form>
    <p class="auth-link-row">{{ t('register.has_account') }} <NuxtLink to="/login" class="reg-foot-link" style="color:var(--teal);font-weight:500">{{ t('register.login_link') }}</NuxtLink></p>
    <p class="auth-link-row" style="margin-top:4px"><NuxtLink to="/rules" class="reg-foot-link" style="color:var(--teal);font-size:13px">{{ t('common.rules') }}</NuxtLink> · <NuxtLink to="/privacy" class="reg-foot-link" style="color:var(--teal);font-size:13px">{{ t('common.privacy') }}</NuxtLink></p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { navigateTo } from '#app'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'
import { useOrgStore } from '~/stores/org.store'
definePageMeta({ layout: 'auth' })

const { register } = useAuth()
const toast = useToast()
const { t, lang } = useI18n()
const org = useOrgStore()

const switchOrg = () => { org.clear(); if (import.meta.client) window.location.href = '/org' }

const nick = ref(''); const fullname = ref(''); const email = ref(''); const pw = ref('')
const role = ref('student'); const loading = ref(false)
const emailTouched = ref(false)

// Любой корректный email — подтверждение всё равно идёт кодом на почту.
const emailOk = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
const onEmailInput = () => { emailTouched.value = true }
const fullnameOk = computed(() => fullname.value.trim().split(' ').filter(Boolean).length >= 2)
const canSubmit = computed(() => fullnameOk.value && emailOk.value && pw.value.length >= 8)

const pwScore = computed(() => {
  const p = pw.value; if (!p) return 0; let s = 0
  if (p.length>=6) s+=20; if (p.length>=10) s+=20
  if (/[A-Z]/.test(p)) s+=20; if (/[0-9]/.test(p)) s+=20; if (/[^A-Za-z0-9]/.test(p)) s+=20
  return s
})
const score = computed(() => pwScore.value)
const scoreColor = computed(() => score.value<=40?'var(--red)':score.value<=60?'var(--yellow)':'var(--green)')
const scoreLabel = computed(() => score.value<=40?t('register.pw_weak'):score.value<=60?t('register.pw_medium'):t('register.pw_strong'))

const sub = async () => {
  if (!canSubmit.value) return
  loading.value = true
  const r = await register(email.value, pw.value, role.value, fullname.value.trim())
  loading.value = false
  if (r.ok) {
    localStorage.setItem('_pending_fullname', fullname.value.trim())
    // Бэкенд уже выслал код — ведём на его ввод, после подтверждения авто-вход.
    await navigateTo(`/verify-email?email=${encodeURIComponent(email.value.trim())}`)
  } else {
    toast.err(r.taken ? t('register.taken') : t('register.error'))
  }
}
</script>

<style scoped>
/* Карточка вокруг формы, чтобы не сливалась с фоном */
.auth-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;box-shadow:var(--sh-sm);padding:28px 26px;width:100%;max-width:400px;margin:0 auto}
.auth-title{font-size:24px;font-weight:700;letter-spacing:-.015em;line-height:1.2;margin-bottom:6px;color:var(--text1);text-align:center}
.auth-sub{font-size:14.5px;color:var(--text4);margin-bottom:24px;text-align:center;line-height:1.4}
.auth-form{display:flex;flex-direction:column;gap:0}
.nick-hint{font-size:12px;font-weight:500;margin-top:4px}
.nick-hint.ok{color:var(--green)}.nick-hint.err{color:var(--red)}
.str-row{display:flex;align-items:center;gap:10px;margin-top:6px}
.str-bar{flex:1;height:3px;background:var(--surface3);border-radius:3px;overflow:hidden;max-width:100px}
.str-fill{height:100%;border-radius:3px;transition:all .3s}
.str-lbl{font-size:11px;color:var(--text4)}
.auth-link-row{text-align:center;font-size:13px;color:var(--text3);margin-top:20px}
.input{background:var(--bg)!important;border:1px solid var(--border)!important;border-radius:14px!important;padding:13px 18px!important;color:var(--text1)!important;transition:border-color .15s ease,box-shadow .15s ease}
.input:focus{border-color:var(--teal)!important;box-shadow:0 0 0 3px rgba(var(--teal-rgb),.16)!important}
.input::placeholder{color:var(--text4)!important}

/* Кнопка регистрации: плоская заливка акцентом, без цветного ореола тени */
/* Плоская заливка и отсутствие цветного ореола теперь заданы в самом .btn-teal
   (assets/css/main.css) — здесь остаются только метрики кнопки. */
.auth-submit{height:50px;border-radius:14px;font-size:15px;font-weight:600;margin-top:6px}
.org-badge-row{display:flex;align-items:center;margin-bottom:18px}
.org-pill{position:relative;display:inline-flex;align-items:center;gap:7px;padding:5px 11px 5px 5px;border-radius:100px;background:var(--surface2);border:1px solid var(--border);cursor:pointer;font-family:inherit;-webkit-tap-highlight-color:transparent;transition:transform .12s ease-out,background .15s}
.org-pill:hover{background:var(--surface3,var(--surface2))}
.org-pill:active{transform:scale(.96)}
.org-pill-icon{width:20px;height:20px;border-radius:6px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#006475,#009AAF);color:#fff;flex-shrink:0}
.org-pill.school .org-pill-icon{background:linear-gradient(135deg,#B45309,#F59E0B)}
.uni-glyph-sm{width:11px;height:11px;display:block;background:#fff;-webkit-mask:url('/uni-logo.png') center/contain no-repeat;mask:url('/uni-logo.png') center/contain no-repeat}
.org-pill-label{font-size:12.5px;font-weight:590;color:var(--text2);letter-spacing:-.01em}
.org-pill-chevron{color:var(--text4);flex-shrink:0;margin-left:-2px}

@media (max-width:768px) {
  /* max-width как на десктопе (400px) — не 100%: на широких "мобильных"
     (~600–768) карточка иначе растягивалась почти во весь экран. */
  .auth-card { padding: 22px 18px; border-radius: 20px; max-width: 400px; width: 100%; box-shadow: var(--sh-sm); }
  .auth-title { font-size: 23px; }
  .auth-sub { margin-bottom: 16px; font-size: 14px; }
  .input { font-size: 16px !important; padding: 12px 15px !important; }
  .btn-lg { min-height: 50px; font-size: 15px; }
  .auth-submit { height: 50px; }
  .frow { margin-bottom: 12px; }
  .org-badge-row { margin-bottom: 14px; }
  .org-pill::after{content:'';position:absolute;top:-7px;bottom:-7px;left:-4px;right:-4px}
  .reg-foot-link{position:relative;display:inline-flex;align-items:center}
  .reg-foot-link::after{content:'';position:absolute;top:-12px;bottom:-12px;left:-4px;right:-4px}
}
@media (max-width:480px) {
  .auth-card { padding: 20px 16px; border-radius: 18px; }
  .auth-title { font-size: 21px; }
}
</style>