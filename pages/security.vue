<template>
  <div class="pg anim-in">
    <div class="pg-head">
      <NuxtLink to="/settings" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        {{ t('settings.title') }}
      </NuxtLink>
      <h1 class="pg-title">{{ lang==='ru'?'Аккаунт и безопасность':lang==='kk'?'Аккаунт және қауіпсіздік':'Account & security' }}</h1>
      <p class="pg-sub">{{ lang==='ru'?'Пароль и удаление аккаунта':lang==='kk'?'Құпия сөз және аккаунтты жою':'Password and account deletion' }}</p>
    </div>

    <div class="pg-body">
      <!-- Change password -->
      <div class="scard">
        <div class="scard-head-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          <h3 class="scard-h3">{{ t('settings.change_pw') }}</h3>
        </div>
        <div class="fields-grid">
          <div class="field-group">
            <label class="field-label">{{ t('settings.current_pw') }}</label>
            <input v-model="curPw" type="password" class="input field-input" placeholder="••••••••" @input="pwErr=''"/>
          </div>
          <div class="field-group">
            <label class="field-label">{{ t('settings.new_pw') }}</label>
            <input v-model="newPw" type="password" class="input field-input" placeholder="••••••••" minlength="8" @input="pwErr=''"/>
            <div class="nick-hint err" v-if="newPw && newPw.length < 8">{{ t('auth.pw_min8') }}</div>
          </div>
        </div>
        <div v-if="pwErr" class="pw-err">{{ pwErr }}</div>
        <button class="btn btn-teal btn-lg pw-save-btn" :disabled="changingPw || !curPw || newPw.length < 8" @click="doChangePassword">
          <div v-if="changingPw" class="spinner" style="width:15px;height:15px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
          <span v-else>{{ t('settings.change_pw_btn') }}</span>
        </button>
      </div>

      <!-- Delete account -->
      <div class="scard deactivate-card">
        <div class="deactivate-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
        </div>
        <div class="deactivate-info">
          <div class="deactivate-title">{{ t('settings.delete_title') }}</div>
          <div class="deactivate-sub">{{ t('settings.deactivate_sub') }}</div>
        </div>
        <button class="deactivate-btn" @click="openDelete">{{ t('settings.delete_title') }}</button>
      </div>

      <!-- Delete confirmation modal -->
      <div v-if="showDelete" class="modal-overlay" @click.self="showDelete=false">
        <div class="modal-card anim-scale">
          <div class="modal-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
          <h3 class="modal-title">{{ t('settings.delete_title') }}</h3>
          <p class="modal-warning">{{ t('settings.delete_warning') }}</p>
          <input v-model="deletePw" type="password" class="input modal-input" :placeholder="t('settings.delete_confirm_pw')" @input="delErr=''"/>
          <div v-if="delErr" class="pw-err" style="text-align:center">{{ delErr }}</div>
          <div class="modal-actions">
            <button class="btn btn-ghost btn-lg" @click="showDelete=false">{{ t('common.cancel') }}</button>
            <button class="btn btn-lg modal-del-btn" :disabled="deleting || !deletePw" @click="doDeleteAccount">
              <div v-if="deleting" class="spinner" style="width:15px;height:15px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
              <span v-else>{{ t('settings.delete_confirm_btn') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'
import { useChatsStore } from '~/stores/chats.store'
import { useAuth } from '~/composables/useAuth'

definePageMeta({ layout: 'default' })

const toast = useToast()
const { t, lang } = useI18n()
const chatsStore = useChatsStore()
const { changePassword, deleteAccount } = useAuth()

// ── Смена пароля ──
const curPw = ref(''); const newPw = ref(''); const changingPw = ref(false); const pwErr = ref('')
const doChangePassword = async () => {
  if (!curPw.value || newPw.value.length < 8 || changingPw.value) return
  changingPw.value = true
  const err = await changePassword(curPw.value, newPw.value)
  changingPw.value = false
  if (!err) {
    curPw.value = ''; newPw.value = ''
    toast.ok(t('settings.pw_changed'))
  } else {
    pwErr.value = err === 'wrong_current_password' ? t('settings.wrong_current') : t('settings.change_pw_err')
  }
}

// ── Удаление аккаунта ──
const showDelete = ref(false); const deletePw = ref(''); const deleting = ref(false); const delErr = ref('')
const openDelete = () => { deletePw.value = ''; delErr.value = ''; showDelete.value = true }
const doDeleteAccount = async () => {
  if (!deletePw.value || deleting.value) return
  deleting.value = true
  const err = await deleteAccount(deletePw.value)
  deleting.value = false
  if (!err) {
    toast.ok(t('settings.account_deleted'))
    chatsStore.disconnectAll()
    if (import.meta.client) window.location.href = '/org'
  } else {
    delErr.value = err === 'wrong_current_password' ? t('settings.wrong_current') : t('settings.delete_err')
  }
}
</script>

<style scoped>
.pg{height:100%;display:flex;flex-direction:column;overflow-y:auto;background:var(--bg)}
.pg-head{padding:28px 32px 0;flex-shrink:0}
.back-link{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:var(--text4);text-decoration:none;margin-bottom:10px;transition:color .15s}
.back-link:hover{color:var(--teal)}
.pg-title{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:26px;font-weight:800;color:var(--text1);margin-bottom:4px}
.pg-sub{font-size:14px;color:var(--text4)}
.pg-body{padding:20px 32px 40px;display:flex;flex-direction:column;gap:20px}
.scard{background:var(--surface);border-radius:20px;padding:24px;box-shadow:var(--sh-sm)}
.scard-head-sm{display:flex;align-items:center;gap:10px;margin-bottom:18px}
.scard-h3{font-size:16px;font-weight:700;color:var(--text1)}
.fields-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.field-group{display:flex;flex-direction:column;gap:6px}
.field-label{font-size:11px;font-weight:700;color:var(--text4);letter-spacing:.08em;text-transform:uppercase}
.field-input{background:var(--bg2)!important;border:none!important;border-radius:14px!important;padding:12px 16px!important}
html.dark .field-input{background:var(--surface2)!important}
.field-input:focus{box-shadow:0 0 0 2px var(--teal)!important}
.nick-hint{font-size:11px;font-weight:500}.nick-hint.err{color:var(--red)}
.pw-save-btn{margin-top:18px;min-height:46px}
.pw-err{color:var(--red);font-size:13px;font-weight:600;margin-top:12px}
.deactivate-card{display:flex;align-items:center;gap:16px;padding:18px 24px}
.deactivate-icon{width:40px;height:40px;border-radius:12px;background:var(--red-l);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.deactivate-info{flex:1}
.deactivate-title{font-size:15px;font-weight:600;color:var(--text1)}
.deactivate-sub{font-size:13px;color:var(--text4);margin-top:2px}
.deactivate-btn{color:var(--red);font-size:14px;font-weight:600;background:none;border:none;cursor:pointer;flex-shrink:0}
.deactivate-btn:hover{opacity:.7}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px}
.modal-card{background:var(--surface);border-radius:22px;padding:28px 26px;width:100%;max-width:400px;box-shadow:var(--sh-md);text-align:center}
.modal-icon{width:52px;height:52px;border-radius:50%;background:var(--red-l);display:flex;align-items:center;justify-content:center;margin:0 auto 14px}
.modal-title{font-size:19px;font-weight:800;color:var(--text1);margin-bottom:8px}
.modal-warning{font-size:13.5px;color:var(--text3);line-height:1.45;margin-bottom:18px}
.modal-input{width:100%;background:var(--bg)!important;border:1px solid var(--border)!important;border-radius:14px!important;padding:12px 16px!important;color:var(--text1)!important;text-align:center}
.modal-input:focus{border-color:var(--red)!important;box-shadow:0 0 0 2px rgba(220,38,38,.18)!important}
.modal-actions{display:flex;gap:12px;margin-top:18px}
.modal-actions>.btn{flex:1;min-height:46px}
.modal-del-btn{background:var(--red);color:#fff}
.modal-del-btn:hover{opacity:.9}
.modal-del-btn:disabled{opacity:.5;cursor:default}

@media(max-width:768px){
  .pg-head{padding:20px 18px 0}
  .pg-body{padding:16px 18px 32px}
  .fields-grid{grid-template-columns:1fr}
  .deactivate-card{flex-wrap:wrap;gap:12px}
}
</style>
