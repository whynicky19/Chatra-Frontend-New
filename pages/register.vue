<template>
  <div class="auth-card anim-scale">
    <!-- Org type badge -->
    <div class="org-badge-row">
      <div :class="['org-badge', org.isSchool ? 'school' : 'university']">
        <svg v-if="org.isSchool" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        {{ org.isSchool ? (lang==='ru'?'Школа':lang==='kk'?'Мектеп':'School') : (lang==='ru'?'Университет':lang==='kk'?'Университет':'University') }}
      </div>
      <button class="org-switch-btn" @click="switchOrg">{{ lang==='ru'?'Сменить':'Change' }}</button>
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
    <p class="auth-link-row">{{ t('register.has_account') }} <NuxtLink to="/login" style="color:var(--teal);font-weight:500">{{ t('register.login_link') }}</NuxtLink></p>
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
.auth-card{background:var(--surface);border:1px solid var(--border);border-radius:24px;box-shadow:var(--sh-md);padding:28px 26px;width:100%;max-width:400px;margin:0 auto}
.auth-title{font-size:28px;font-weight:800;letter-spacing:-.02em;line-height:1.15;margin-bottom:6px;color:var(--text1);text-align:center}
.auth-sub{font-size:15px;color:var(--text4);margin-bottom:26px;text-align:center;line-height:1.4}
.auth-form{display:flex;flex-direction:column;gap:0}
.nick-hint{font-size:12px;font-weight:500;margin-top:4px}
.nick-hint.ok{color:var(--green)}.nick-hint.err{color:var(--red)}
.str-row{display:flex;align-items:center;gap:10px;margin-top:6px}
.str-bar{flex:1;height:3px;background:var(--surface3);border-radius:3px;overflow:hidden;max-width:100px}
.str-fill{height:100%;border-radius:3px;transition:all .3s}
.str-lbl{font-size:11px;color:var(--text4)}
.auth-link-row{text-align:center;font-size:13px;color:var(--text3);margin-top:20px}
.input{background:var(--bg)!important;border:1px solid var(--border)!important;border-radius:16px!important;padding:13px 18px!important;color:var(--text1)!important}
.input:focus{border-color:var(--teal)!important;box-shadow:0 0 0 2px rgba(var(--teal-rgb),.25)!important}
.input::placeholder{color:var(--text4)!important}

/* Org badge */
.auth-submit{height:52px;border-radius:16px;font-size:15px;font-weight:700;margin-top:6px}
.org-badge-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.org-badge{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.05em;padding:4px 10px;border-radius:100px}
.org-badge.university{background:rgba(var(--teal-rgb),.1);color:var(--teal-d);border:1px solid rgba(var(--teal-rgb),.25)}
.org-badge.school{background:rgba(245,158,11,.1);color:#b45309;border:1px solid rgba(245,158,11,.25)}
.org-switch-btn{font-size:11px;font-weight:600;color:var(--text4);background:none;border:none;cursor:pointer;padding:4px 8px;border-radius:6px;transition:color .15s}
.org-switch-btn:hover{color:var(--teal)}

@media (max-width:768px) {
  .auth-card { padding: 22px 18px; border-radius: 20px; max-width: 100%; width: 100%; box-shadow: var(--sh-sm); }
  .auth-title { font-size: 23px; }
  .auth-sub { margin-bottom: 16px; font-size: 14px; }
  .input { font-size: 16px !important; padding: 12px 15px !important; }
  .btn-lg { min-height: 50px; font-size: 15px; }
  .auth-submit { height: 50px; }
  .frow { margin-bottom: 12px; }
  .org-badge-row { margin-bottom: 14px; }
}
@media (max-width:480px) {
  .auth-card { padding: 20px 16px; border-radius: 18px; }
  .auth-title { font-size: 21px; }
}
</style>