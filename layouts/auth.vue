<template>
  <div class="auth-shell">
    <div class="auth-content">
      <span class="auth-logo-mark" role="img" aria-label="Chatra"></span>
      <div class="lang-switcher" role="tablist">
        <span class="lang-thumb" :style="{ transform: `translateX(${langIndex * 100}%)` }"></span>
        <button v-for="l in langs" :key="l.code" @click="setLang(l.code)"
          :class="['lang-btn', { active: lang === l.code }]" role="tab" :aria-selected="lang === l.code">
          {{ l.label }}
        </button>
      </div>
      <slot/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { lang, setLang } = useI18n()
const langs = [
  { code: 'ru' as const, label: 'RU' },
  { code: 'en' as const, label: 'EN' },
  { code: 'kk' as const, label: 'KZ' },
]
const langIndex = computed(() => Math.max(0, langs.findIndex(l => l.code === lang.value)))

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
.auth-content {
  position: relative; z-index: 10;
  display: flex; flex-direction: column; align-items: center;
  gap: 22px; padding: 24px 20px;
  width: 100%; max-width: 440px;
  overflow-y: auto; overflow-x: hidden;
  max-height: 100dvh;
  scrollbar-width: none;
  cursor: default;
  animation: content-fade .32s ease both;
}
.auth-content::-webkit-scrollbar { display: none; }
@keyframes content-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.auth-logo-mark {
  flex-shrink: 0;
  display: block;
  width: 118px; aspect-ratio: 1200 / 734;
  background: linear-gradient(180deg, var(--teal), var(--teal-d));
  -webkit-mask: url('/logo.png') center / contain no-repeat;
  mask: url('/logo.png') center / contain no-repeat;
}
.lang-switcher {
  position: relative;
  display: flex; align-items: center;
  background: var(--surface2); border-radius: 100px;
  padding: 3px; flex-shrink: 0;
}
.lang-thumb {
  position: absolute; top: 3px; bottom: 3px; left: 3px;
  width: calc((100% - 6px) / 3);
  background: var(--surface);
  border-radius: 100px;
  box-shadow: var(--sh-xs);
  transition: transform .25s cubic-bezier(.4,0,.2,1);
}
.lang-btn {
  position: relative; z-index: 1;
  width: 44px; padding: 6px 0; border-radius: 100px;
  font-size: 12px; font-weight: 700;
  letter-spacing: .04em; cursor: pointer;
  background: none; border: none; color: var(--text3);
  transition: color .2s ease;
}
.lang-btn.active { color: var(--text1); }
@media (max-width:768px) {
  .auth-shell { cursor: default; }
  .auth-content {
    padding: calc(14px + env(safe-area-inset-top)) 16px calc(16px + env(safe-area-inset-bottom));
    gap: 16px;
    /* max-width не снижаем до 100% — на телефонных ширинах это и так не
       превышало 440px, а на широких "мобильных" (~600–768, планшет/большой
       телефон в landscape) форма растягивалась почти во весь экран вместо
       аккуратной читаемой карточки. */
  }
  .auth-logo-mark { width: 92px; }
  .lang-btn { width: 48px; padding: 10px 0; font-size: 11px; min-height: 40px; display: inline-flex; align-items: center; justify-content: center; }
}
@media (max-width:480px) {
  .auth-content { padding: calc(10px + env(safe-area-inset-top)) 14px calc(14px + env(safe-area-inset-bottom)); gap: 14px; }
  .auth-logo-mark { width: 80px; }
}
/* Низкие экраны (клавиатура открыта / landscape) — прижимаем контент к верху, чтобы форма не обрезалась */
@media (max-height:640px) {
  .auth-shell { justify-content: flex-start; }
  .auth-logo-mark { width: 64px; }
  .auth-content { gap: 10px; }
}
</style>
