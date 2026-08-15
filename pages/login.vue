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

    <h2 class="auth-title">{{ t('login.welcome') }}</h2>
    <p class="auth-sub">{{ t('login.sub') }}</p>
    <form @submit.prevent="sub" class="auth-form">
      <div class="frow">
        <label class="flabel">Email</label>
        <input v-model="email" type="email" class="input" :class="{'input-err':errorMsg}" placeholder="you@example.com" required autocomplete="email" @input="errorMsg=''"/>
      </div>
      <div class="frow">
        <label class="flabel">{{ t('login.password') }}</label>
        <div style="position:relative">
          <input v-model="pw" :type="show?'text':'password'" class="input" :class="{'input-err':errorMsg}" placeholder="••••••••" required style="padding-right:42px" @input="errorMsg=''"/>
          <button type="button" @click="show=!show" class="pw-eye">
            <svg v-if="!show" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
      </div>
      <div v-if="errorMsg" class="login-error">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ errorMsg }}
      </div>
      <div class="forgot-row">
        <NuxtLink to="/forgot-password" class="forgot-link">{{ t('login.forgot') }}</NuxtLink>
      </div>
      <button type="submit" class="btn btn-teal w-full btn-lg auth-submit" :disabled="loading" style="margin-top:6px">
        <div v-if="loading" class="spinner" style="width:15px;height:15px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
        <span v-else>{{ t('login.submit') }}</span>
      </button>
    </form>
    <p class="auth-link-row">{{ t('login.no_account') }} <NuxtLink to="/register" class="auth-link">{{ t('login.register') }}</NuxtLink></p>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from '#app'
import { useAuth } from '~/composables/useAuth'
import { useI18n } from '~/composables/useI18n'
import { useOrgStore } from '~/stores/org.store'
definePageMeta({ layout: 'auth' })
const { login } = useAuth()
const { t, lang } = useI18n()
const org = useOrgStore()
const email = ref(''); const pw = ref(''); const show = ref(false); const loading = ref(false); const errorMsg = ref('')
const switchOrg = () => { org.clear(); if (import.meta.client) window.location.href = '/org' }
const sub = async () => {
  errorMsg.value = ''
  loading.value = true
  const r = await login(email.value, pw.value)
  loading.value = false
  if (r.ok) { await navigateTo('/'); return }
  // Не подтверждён email — ведём на ввод кода (там сразу вышлем свежий).
  if (r.reason === 'email_not_verified') {
    // send=1 — на этом пути код ещё не высылался, verify-экран вышлет свежий.
    await navigateTo(`/verify-email?email=${encodeURIComponent(email.value.trim())}&send=1`)
    return
  }
  errorMsg.value = r.reason === 'blocked' ? t('login.error_blocked')
    : r.reason === 'rate_limited' ? t('login.error_rate')
    : t('login.error')
}
</script>
<style scoped>
/* Карточка вокруг формы, чтобы не сливалась с фоном */
.auth-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;box-shadow:var(--sh-sm);padding:28px 26px;width:100%;max-width:400px;margin:0 auto}
.auth-title{font-size:24px;font-weight:700;letter-spacing:-.015em;line-height:1.2;margin-bottom:6px;color:var(--text1);text-align:center}
.auth-sub{font-size:14.5px;color:var(--text4);margin-bottom:26px;text-align:center;line-height:1.4}
.auth-form{display:flex;flex-direction:column}
.frow{margin-bottom:14px}
.flabel{font-size:12px;font-weight:600;color:var(--text3);letter-spacing:.04em;display:block;margin-bottom:6px}
.input{background:var(--bg)!important;border:1px solid var(--border)!important;border-radius:14px!important;padding:13px 18px!important;color:var(--text1)!important;transition:border-color .15s ease,box-shadow .15s ease}
.input:focus{border-color:var(--teal)!important;box-shadow:0 0 0 3px rgba(var(--teal-rgb),.16)!important}
.input::placeholder{color:var(--text4)!important}
.pw-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--text4);background:none;border:none;cursor:pointer;padding:4px;transition:color .15s}
.pw-eye:hover{color:var(--teal)}
.auth-link-row{text-align:center;font-size:13px;color:var(--text3);margin-top:20px}
.auth-link{color:var(--teal);font-weight:600;transition:color .15s}
.auth-link:hover{color:var(--teal-h)}
.login-error{display:flex;align-items:center;gap:7px;padding:10px 14px;background:var(--red-l);border-radius:var(--r-md);font-size:13px;font-weight:600;color:var(--red);margin-bottom:6px}
.forgot-row{display:flex;justify-content:flex-end;margin:-4px 0 2px}
.forgot-link{font-size:12.5px;font-weight:600;color:var(--teal);transition:color .15s}
.forgot-link:hover{color:var(--teal-h)}
.input-err{border-color:var(--red)!important;background:var(--red-l)!important}
.input-err:focus{border-color:var(--red)!important;box-shadow:0 0 0 3px rgba(220,38,38,0.12)!important}
/* Плоская заливка и отсутствие цветного ореола теперь заданы в самом .btn-teal
   (assets/css/main.css) — здесь остаются только метрики кнопки входа. */
.auth-submit{height:50px;border-radius:14px;font-size:15px;font-weight:600}
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
  .auth-card { padding: 22px 18px; border-radius: 20px; width: 100%; max-width: 400px; box-shadow: var(--sh-sm); }
  .auth-title { font-size: 23px; }
  .auth-sub { font-size: 14px; margin-bottom: 18px; }
  .frow { margin-bottom: 12px; }
  .input { font-size: 16px !important; padding: 12px 15px !important; }
  .btn-lg { min-height: 50px; font-size: 15px; }
  .auth-submit { height: 50px; }
  .pw-eye { min-width: 44px; min-height: 44px; right: 0; }
  .org-badge-row { margin-bottom: 14px; }
  .forgot-link,.auth-link{position:relative;display:inline-flex;align-items:center}
  .forgot-link::after,.auth-link::after{content:'';position:absolute;top:-13px;bottom:-13px;left:-6px;right:-6px}
  .org-pill::after{content:'';position:absolute;top:-7px;bottom:-7px;left:-4px;right:-4px}
}
@media (max-width:480px) {
  .auth-card { padding: 20px 16px; border-radius: 18px; }
  .auth-title { font-size: 21px; }
}
</style>
