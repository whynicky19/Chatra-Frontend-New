<template>
  <div class="auth-card anim-scale">
    <h2 class="auth-title">{{ t('verify.title') }}</h2>
    <p class="auth-sub">{{ t('verify.sub') }}</p>
    <p v-if="email" class="sent-to">{{ t('verify.sent_to') }} <b>{{ email }}</b></p>

    <form @submit.prevent="doVerify" class="auth-form">
      <div class="frow">
        <label class="flabel">{{ t('verify.code_label') }}</label>
        <input v-model="code" inputmode="numeric" maxlength="6" class="input code-input"
               :class="{'input-err':errorMsg}" placeholder="••••••" @input="onCodeInput"/>
      </div>
      <div v-if="errorMsg" class="login-error">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ errorMsg }}
      </div>
      <button type="submit" class="btn btn-teal w-full btn-lg auth-submit" :disabled="loading || code.length < 4">
        <div v-if="loading" class="spinner" style="width:15px;height:15px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
        <span v-else>{{ t('verify.btn') }}</span>
      </button>
    </form>

    <div class="resend-row">
      <button v-if="cooldown <= 0" class="resend-link" @click="resend()">{{ t('verify.resend') }}</button>
      <span v-else class="resend-wait">{{ t('verify.resend_in').replace('{n}', String(cooldown)) }}</span>
    </div>
    <p class="auth-link-row"><NuxtLink to="/login" class="auth-link">{{ t('auth.back_login') }}</NuxtLink></p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { navigateTo, useRoute } from '#app'
import { useAuth } from '~/composables/useAuth'
import { useI18n } from '~/composables/useI18n'
import { useToast } from '~/composables/useToast'
definePageMeta({ layout: 'auth' })

const { verifyEmail, resendVerification } = useAuth()
const { t } = useI18n()
const toast = useToast()
const route = useRoute()

const email = ref((route.query.email as string) || '')
const code = ref('')
const loading = ref(false)
const errorMsg = ref('')
const cooldown = ref(0)
let timer: any = null

const onCodeInput = () => {
  code.value = code.value.replace(/\D/g, '').slice(0, 6)
  errorMsg.value = ''
}

const startCooldown = () => {
  cooldown.value = 60
  clearInterval(timer)
  timer = setInterval(() => { if (--cooldown.value <= 0) clearInterval(timer) }, 1000)
}

const resend = async (silent = false) => {
  if (cooldown.value > 0 || !email.value) return
  const devCode = await resendVerification(email.value)
  startCooldown()
  if (devCode) code.value = devCode          // dev-режим: подставляем код
  if (!silent) toast.ok(t('verify.sent'))
}

const doVerify = async () => {
  if (code.value.length < 4 || loading.value) return
  loading.value = true
  const err = await verifyEmail(email.value, code.value)
  loading.value = false
  if (!err) {
    toast.ok(t('verify.ok'))
    await navigateTo('/')
  } else {
    errorMsg.value = err === 'invalid_code' ? t('verify.invalid_code') : t('verify.error')
  }
}

onMounted(() => {
  // Авто-отправка кода только когда пришли из логина (?send=1) — там код ещё не
  // высылался. После регистрации бэкенд уже прислал код, повторная отправка
  // аннулировала бы его (юзер ввёл бы код из первого письма → «неверный код»).
  if (email.value && route.query.send) resend(true)
  else if (email.value) startCooldown()   // на всякий, чтобы «resend» не спамили сразу
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.auth-card{background:var(--surface);border:1px solid var(--border);border-radius:24px;box-shadow:var(--sh-md);padding:28px 26px;width:100%;max-width:400px;margin:0 auto}
.auth-title{font-size:28px;font-weight:800;letter-spacing:-.02em;line-height:1.15;margin-bottom:6px;color:var(--text1);text-align:center}
.auth-sub{font-size:15px;color:var(--text4);margin-bottom:8px;text-align:center;line-height:1.4}
.sent-to{font-size:13px;color:var(--teal);text-align:center;margin-bottom:22px;word-break:break-all}
.auth-form{display:flex;flex-direction:column}
.frow{margin-bottom:14px}
.flabel{font-size:12px;font-weight:600;color:var(--text3);letter-spacing:.04em;display:block;margin-bottom:6px}
.input{background:var(--bg)!important;border:1px solid var(--border)!important;border-radius:16px!important;padding:13px 18px!important;color:var(--text1)!important}
.input:focus{border-color:var(--teal)!important;box-shadow:0 0 0 2px rgba(var(--teal-rgb),.25)!important}
.input::placeholder{color:var(--text4)!important}
.code-input{text-align:center;font-size:24px;font-weight:800;letter-spacing:10px}
.login-error{display:flex;align-items:center;gap:7px;padding:10px 14px;background:var(--red-l);border-radius:var(--r-md);font-size:13px;font-weight:600;color:var(--red);margin-bottom:6px}
.input-err{border-color:var(--red)!important;background:var(--red-l)!important}
.auth-submit{height:52px;border-radius:16px;font-size:15px;font-weight:700;margin-top:6px}
.resend-row{text-align:center;margin-top:16px}
.resend-link{font-size:14px;font-weight:700;color:var(--teal);background:none;border:none;cursor:pointer}
.resend-link:hover{color:var(--teal-h)}
.resend-wait{font-size:14px;color:var(--text4)}
.auth-link-row{text-align:center;font-size:13px;color:var(--text3);margin-top:16px}
.auth-link{color:var(--teal);font-weight:600}
@media (max-width:768px){.auth-card{padding:22px 18px;border-radius:20px;box-shadow:var(--sh-sm)}.auth-title{font-size:23px}.input{font-size:16px!important}}
</style>
