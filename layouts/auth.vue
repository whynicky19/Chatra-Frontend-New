<template>
  <div class="auth-shell">
    <div class="auth-content">
      <div class="auth-brand">
        <span class="auth-logo-glow"></span>
        <span class="auth-logo-mark" role="img" aria-label="Chatra"></span>
      </div>
      <div class="lang-switcher">
        <button v-for="l in langs" :key="l.code" @click="setLang(l.code)" :class="['lang-btn', { active: lang === l.code }]">
          {{ l.label }}
        </button>
      </div>
      <slot/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { lang, setLang } = useI18n()
const langs = [
  { code: 'ru' as const, label: 'RU' },
  { code: 'en' as const, label: 'EN' },
  { code: 'kk' as const, label: 'KZ' },
]

onMounted(() => {
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
})
onUnmounted(() => {
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
})
</script>

<style scoped>
.auth-shell {
  position: fixed; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  overflow: hidden;
  height: 100vh; height: 100dvh;
  overscroll-behavior: none;
  cursor: default;
  background: var(--bg);
}
.auth-shell::before {
  content: '';
  position: absolute; inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 0% 0%, rgba(var(--teal-rgb), .09) 0%, transparent 55%),
              radial-gradient(circle at 100% 100%, rgba(var(--teal-rgb), .05) 0%, transparent 55%);
}
.auth-content {
  position: relative; z-index: 10;
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; padding: 24px 20px;
  width: 100%; max-width: 440px;
  overflow-y: auto; overflow-x: hidden;
  max-height: 100dvh;
  scrollbar-width: none;
  cursor: default;
  animation: content-enter 0.5s cubic-bezier(0.16,1,0.3,1) both;
}
.auth-content::-webkit-scrollbar { display: none; }
@keyframes content-enter {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.auth-brand {
  flex-shrink: 0;
  position: relative;
  width: 150px; height: 150px;
}
.auth-logo-glow {
  position: absolute; left: 50%; top: 50%;
  width: 70px; height: 70px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: var(--teal);
  opacity: .22;
  filter: blur(32px);
}
.auth-logo-mark {
  position: absolute; inset: 0;
  background: var(--teal);
  -webkit-mask: url('/logo.png') center / contain no-repeat;
  mask: url('/logo.png') center / contain no-repeat;
}
.lang-switcher {
  display: flex; align-items: center; gap: 4px;
  background: var(--surface); border: 1px solid var(--border); border-radius: 30px;
  padding: 4px; flex-shrink: 0;
  box-shadow: var(--sh-xs);
}
.lang-btn {
  padding: 5px 14px; border-radius: 24px; font-size: 12px; font-weight: 700;
  letter-spacing: .06em; cursor: pointer; transition: all .18s;
  background: none; border: none; color: var(--text3);
}
.lang-btn:hover { color: var(--teal); }
.lang-btn.active {
  background: var(--teal); color: #fff;
}
@media (max-width:768px) {
  .auth-shell { cursor: default; }
  .auth-content { padding: 14px 12px; gap: 14px; max-width: 100%; }
  .auth-brand { width: 110px; height: 110px; }
  .lang-btn { padding: 5px 12px; font-size: 11px; }
}
@media (max-width:480px) {
  .auth-content { padding: 10px; gap: 10px; }
  .auth-brand { width: 92px; height: 92px; }
}
</style>
