<template>
  <div class="org-shell">
    <!-- Мягкое цветное «дыхание» по углам: выбранный тип проступает сильнее -->
    <div class="glow glow-uni" :class="{ strong: picked === 'university' }"></div>
    <div class="glow glow-school" :class="{ strong: picked === 'school' }"></div>

    <div class="org-content">
      <!-- Lang switcher -->
      <div class="lang-row r0">
        <button v-for="l in langs" :key="l.code"
          :class="['lang-btn', { active: lang === l.code }]"
          @click="setLang(l.code as any)">
          {{ l.label }}
        </button>
      </div>

      <!-- Логотип: «примеряет» цвет выбранной организации -->
      <div class="org-brand r1">
        <span class="logo-glow" :style="{ background: accent, opacity: picked ? .34 : .18 }"></span>
        <span class="logo-mark" :style="{ backgroundColor: accent }"></span>
      </div>

      <!-- Заголовок -->
      <div class="org-head r2">
        <h1 class="org-title">{{ tt('Добро пожаловать', 'Қош келдіңіз', 'Welcome') }}</h1>
        <h1 class="org-title accent" :style="{ color: picked ? accent : 'var(--text1)' }">
          {{ tt('в Chatra', 'Chatra-ға', 'to Chatra') }}
        </h1>
        <p class="org-sub">{{ tt('Выберите тип организации — оформление настроится под него.',
          'Ұйым түрін таңдаңыз — безендіру соған бейімделеді.',
          'Choose your organization type — the theme will adapt to it.') }}</p>
      </div>

      <!-- Карточки -->
      <div class="org-options">
        <button class="org-option r3" :class="{ selected: picked === 'university' }"
          :style="picked === 'university' ? selStyle(TEAL) : {}"
          @click="pick('university')">
          <span class="org-option-icon uni-tile"><span class="uni-glyph"></span></span>
          <span class="org-option-body">
            <span class="org-option-title">{{ tt('Университет', 'Университет', 'University') }}</span>
            <span class="org-option-sub">{{ tt('Высшее образование', 'Жоғары білім', 'Higher education') }}</span>
          </span>
          <span class="radio" :class="{ on: picked === 'university' }" :style="picked === 'university' ? { background: TEAL, borderColor: TEAL } : {}">
            <svg v-if="picked === 'university'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </span>
        </button>

        <button class="org-option r4" :class="{ selected: picked === 'school' }"
          :style="picked === 'school' ? selStyle(AMBER) : {}"
          @click="pick('school')">
          <span class="org-option-icon school-tile">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
            </svg>
          </span>
          <span class="org-option-body">
            <span class="org-option-title">{{ tt('Школа', 'Мектеп', 'School') }}</span>
            <span class="org-option-sub">{{ tt('Среднее образование', 'Орта білім', 'Secondary education') }}</span>
          </span>
          <span class="radio" :class="{ on: picked === 'school' }" :style="picked === 'school' ? { background: AMBER, borderColor: AMBER } : {}">
            <svg v-if="picked === 'school'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </span>
        </button>
      </div>

      <!-- Продолжить -->
      <div class="org-footer r5">
        <button class="continue-btn" :disabled="!picked"
          :style="picked ? { background: accent, boxShadow: `0 7px 22px -4px ${accent}55` } : {}"
          @click="proceed">
          {{ tt('Продолжить', 'Жалғастыру', 'Continue') }}
        </button>
        <p class="org-note">{{ tt('Тип организации можно изменить на экране входа',
          'Ұйым түрін кіру бетінде өзгертуге болады',
          'You can change this on the sign-in screen') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOrgStore } from '~/stores/org.store'
import { useI18n } from '~/composables/useI18n'

definePageMeta({ layout: false })

const org = useOrgStore()
const { lang, setLang } = useI18n()

const TEAL = '#00B1C9'
const AMBER = '#F59E0B'

const langs = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'kk', label: 'KZ' },
]

const picked = ref<'university' | 'school' | null>(null)
const accent = computed(() => picked.value === 'school' ? AMBER : TEAL)

const tt = (ru: string, kk: string, en: string) =>
  lang.value === 'ru' ? ru : lang.value === 'kk' ? kk : en

const selStyle = (c: string) => ({
  borderColor: c,
  boxShadow: `0 7px 22px -4px ${c}44`,
})

const pick = (type: 'university' | 'school') => { picked.value = type }

const proceed = () => {
  if (!picked.value) return
  org.select(picked.value)
  if (import.meta.client) window.location.href = '/login'
}
</script>

<style scoped>
.org-shell {
  min-height: 100vh; min-height: 100dvh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Угловые свечения */
.glow {
  position: absolute; inset: 0;
  pointer-events: none;
  opacity: .07;
  transition: opacity .5s ease;
}
html.dark .glow { opacity: .1; }
.glow.strong { opacity: .16 !important; }
.glow-uni    { background: radial-gradient(circle at 0% 0%,   #00B1C9 0%, transparent 55%); }
.glow-school { background: radial-gradient(circle at 100% 100%, #F59E0B 0%, transparent 55%); }

.org-content {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  padding: 32px 24px;
  width: 100%; max-width: 440px;
}

/* Lang row */
.lang-row {
  display: flex; gap: 4px;
  margin-bottom: 30px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 100px;
  padding: 3px;
  box-shadow: var(--sh-xs);
}
.lang-btn {
  padding: 5px 14px; border-radius: 100px;
  font-size: 12px; font-weight: 700; letter-spacing: .05em;
  transition: all .18s;
  color: var(--text4);
}
.lang-btn:hover { color: var(--text2); }
.lang-btn.active { background: var(--teal); color: #fff; }

/* Логотип: PNG как маска, чтобы перекрашивать в цвет выбора */
.org-brand { position: relative; width: 104px; height: 104px; margin-bottom: 24px; }
.logo-glow {
  position: absolute; left: 50%; top: 50%;
  width: 64px; height: 64px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  filter: blur(30px);
  transition: background .45s ease, opacity .45s ease;
}
.logo-mark {
  position: absolute; inset: 0;
  -webkit-mask: url('/logo-icon.png') center / contain no-repeat;
  mask: url('/logo-icon.png') center / contain no-repeat;
  transition: background-color .45s ease;
}

/* Заголовок */
.org-head { text-align: center; margin-bottom: 32px; }
.org-title {
  font-size: 30px; font-weight: 800;
  letter-spacing: -.02em; line-height: 1.12;
  color: var(--text1);
}
.org-title.accent { transition: color .45s ease; }
.org-sub {
  margin-top: 10px;
  font-size: 14.5px; color: var(--text4); line-height: 1.45;
  max-width: 320px; margin-left: auto; margin-right: auto;
}

/* Карточки */
.org-options { display: flex; flex-direction: column; gap: 13px; width: 100%; }
.org-option {
  display: flex; align-items: center; gap: 14px;
  padding: 15px 16px;
  border-radius: 20px;
  border: 2px solid transparent;
  background: var(--surface);
  box-shadow: var(--sh-sm);
  text-align: left;
  transition: transform .16s ease, border-color .22s ease, box-shadow .22s ease, background .22s ease;
}
.org-option:hover { transform: translateY(-1px); }
.org-option:active { transform: scale(.978); }

.org-option-icon {
  width: 54px; height: 54px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.uni-tile    { background: linear-gradient(135deg, #006475, #009AAF); }
.school-tile { background: linear-gradient(135deg, #B45309, #F59E0B); }
.uni-glyph {
  width: 28px; height: 28px; display: block;
  background: #fff;
  -webkit-mask: url('/uni-logo.png') center / contain no-repeat;
  mask: url('/uni-logo.png') center / contain no-repeat;
}

.org-option-body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.org-option-title { font-size: 16.5px; font-weight: 700; letter-spacing: -.01em; color: var(--text1); }
.org-option-sub   { font-size: 13px; color: var(--text4); margin-top: 2px; }

/* Радио-отметка в стиле списков iOS */
.radio {
  width: 26px; height: 26px; border-radius: 50%;
  border: 1.6px solid var(--border2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all .22s ease;
}

/* Продолжить */
.org-footer { width: 100%; margin-top: 26px; display: flex; flex-direction: column; align-items: center; }
.continue-btn {
  width: 100%; height: 52px;
  border-radius: 16px;
  background: var(--surface2);
  color: var(--text4);
  font-size: 16px; font-weight: 700;
  transition: all .3s ease;
}
.continue-btn:not(:disabled) { color: #fff; }
.continue-btn:not(:disabled):hover { transform: translateY(-1px); filter: brightness(1.05); }
.continue-btn:not(:disabled):active { transform: scale(.98); }
.continue-btn:disabled { cursor: not-allowed; }
.org-note { margin-top: 12px; font-size: 12px; color: var(--text4); text-align: center; }

/* Ступенчатое появление */
.r0, .r1, .r2, .r3, .r4, .r5 { animation: rise .5s cubic-bezier(.16,1,.3,1) both; }
.r1 { animation-delay: .05s; }
.r2 { animation-delay: .12s; }
.r3 { animation-delay: .2s; }
.r4 { animation-delay: .27s; }
.r5 { animation-delay: .35s; }
@keyframes rise {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .r0, .r1, .r2, .r3, .r4, .r5 { animation: none; }
  .glow, .logo-mark, .logo-glow, .org-title.accent, .org-option, .radio, .continue-btn { transition: none; }
}

@media (max-width: 480px) {
  .org-content { padding: 24px 18px; }
  .org-title { font-size: 26px; }
  .org-brand { width: 88px; height: 88px; margin-bottom: 20px; }
  .org-option { padding: 13px 14px; }
  .org-option-icon { width: 48px; height: 48px; border-radius: 14px; }
  .uni-glyph { width: 24px; height: 24px; }
}
</style>
