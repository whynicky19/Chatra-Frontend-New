<template>
  <div class="auth-card anim-scale">
    <h2 class="auth-title">{{ codeSent ? t('reset.title') : t('forgot.title') }}</h2>
    <p class="auth-sub">{{ codeSent ? t('reset.sub') : t('forgot.sub') }}</p>

    <!-- Шаг 1: email -->
    <form v-if="!codeSent" @submit.prevent="sendCode" class="auth-form">
      <div class="frow">
        <label class="flabel">Email</label>
        <input v-model="email" type="email" class="input" :class="{'input-err':errorMsg}"
               placeholder="you@example.com" required autocomplete="email" @input="errorMsg=''"/>
      </div>
      <div v-if="errorMsg" class="login-error">{{ errorMsg }}</div>
      <button type="submit" class="btn btn-teal w-full btn-lg auth-submit" :disabled="loading || !emailOk">
        <div v-if="loading" class="spinner" style="width:15px;height:15px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
        <span v-else>{{ t('forgot.send') }}</span>
      </button>
    </form>

    <!-- Шаг 2: код + новый пароль -->
    <form v-else @submit.prevent="doReset" class="auth-form">
      <div class="frow">
        <label class="flabel">{{ t('verify.code_label') }}</label>
        <input v-model="code" inputmode="numeric" maxlength="6" class="input code-input"
               placeholder="••••••" @input="onCodeInput"/>
      </div>
      <div class="frow">
        <label class="flabel">{{ t('reset.newpw') }}</label>
        <input v-model="newPw" type="password" class="input" placeholder="••••••••" minlength="8" @input="errorMsg=''"/>
        <div class="hint">{{ t('auth.pw_min8') }}</div>
      </div>
      <div v-if="errorMsg" class="login-error">{{ errorMsg }}</div>
      <button type="submit" class="btn btn-teal w-full btn-lg auth-submit" :disabled="loading || code.length < 4 || newPw.length < 8">
        <div v-if="loading" class="spinner" style="width:15px;height:15px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
        <span v-else>{{ t('reset.btn') }}</span>
      </button>
      <div class="resend-row"><button type="button" class="resend-link" @click="sendCode">{{ t('verify.resend') }}</button></div>
    </form>

    <p class="auth-link-row"><NuxtLink to="/login" class="auth-link">{{ t('auth.back_login') }}</NuxtLink></p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { navigateTo } from '#app'
import { useAuth } from '~/composables/useAuth'
import { useI18n } from '~/composables/useI18n'
import { useToast } from '~/composables/useToast'
definePageMeta({ layout: 'auth' })

const { forgotPassword, resetPassword } = useAuth()
const { t } = useI18n()
const toast = useToast()

const email = ref('')
const code = ref('')
const newPw = ref('')
const codeSent = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const emailOk = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
const onCodeInput = () => { code.value = code.value.replace(/\D/g, '').slice(0, 6); errorMsg.value = '' }

const sendCode = async () => {
  if (!emailOk.value || loading.value) return
  loading.value = true
  try {
    const devCode = await forgotPassword(email.value.trim())
    codeSent.value = true
    if (devCode) code.value = devCode          // dev-режим
    toast.ok(t('verify.sent'))
  } catch {
    errorMsg.value = t('reset.error')
  }
  loading.value = false
}

const doReset = async () => {
  if (code.value.length < 4 || newPw.value.length < 8 || loading.value) return
  loading.value = true
  const err = await resetPassword(email.value.trim(), code.value, newPw.value)
  loading.value = false
  if (!err) {
    toast.ok(t('reset.success'))
    await navigateTo('/')                       // авто-вход
  } else {
    errorMsg.value = err === 'invalid_code' ? t('verify.invalid_code') : t('reset.error')
  }
}
</script>

<style scoped>
.auth-card{background:var(--surface);border:1px solid var(--border);border-radius:24px;box-shadow:var(--sh-md);padding:28px 26px;width:100%;max-width:400px;margin:0 auto}
.auth-title{font-size:28px;font-weight:800;letter-spacing:-.02em;line-height:1.15;margin-bottom:6px;color:var(--text1);text-align:center}
.auth-sub{font-size:15px;color:var(--text4);margin-bottom:24px;text-align:center;line-height:1.4}
.auth-form{display:flex;flex-direction:column}
.frow{margin-bottom:14px}
.flabel{font-size:12px;font-weight:600;color:var(--text3);letter-spacing:.04em;display:block;margin-bottom:6px}
.input{background:var(--bg)!important;border:1px solid var(--border)!important;border-radius:16px!important;padding:13px 18px!important;color:var(--text1)!important}
.input:focus{border-color:var(--teal)!important;box-shadow:0 0 0 2px rgba(var(--teal-rgb),.25)!important}
.input::placeholder{color:var(--text4)!important}
.code-input{text-align:center;font-size:22px;font-weight:800;letter-spacing:8px}
.hint{font-size:12px;color:var(--text4);margin-top:4px}
.login-error{display:flex;align-items:center;gap:7px;padding:10px 14px;background:var(--red-l);border-radius:var(--r-md);font-size:13px;font-weight:600;color:var(--red);margin-bottom:6px}
.input-err{border-color:var(--red)!important;background:var(--red-l)!important}
.auth-submit{height:52px;border-radius:16px;font-size:15px;font-weight:700;margin-top:6px}
.resend-row{text-align:center;margin-top:14px}
.resend-link{font-size:14px;font-weight:700;color:var(--teal);background:none;border:none;cursor:pointer}
.resend-link:hover{color:var(--teal-h)}
.auth-link-row{text-align:center;font-size:13px;color:var(--text3);margin-top:16px}
.auth-link{color:var(--teal);font-weight:600}
@media (max-width:768px){.auth-card{padding:22px 18px;border-radius:20px;box-shadow:var(--sh-sm)}.auth-title{font-size:23px}.input{font-size:16px!important}}
</style>
