<template>
  <div class="org-shell">
    <div class="org-content">
      <!-- Lang switcher -->
      <div class="lang-row">
        <span class="lang-thumb" :style="{ transform: `translateX(${langIndex * 100}%)` }"></span>
        <button v-for="l in langs" :key="l.code"
          :class="['lang-btn', { active: lang === l.code }]"
          @click="setLang(l.code as any)">
          {{ l.label }}
        </button>
      </div>

      <!-- Логотип -->
      <span class="org-logo" role="img" aria-label="Chatra" :style="{ background: `linear-gradient(180deg, ${accent}, ${accentDark})` }"></span>

      <!-- Заголовок -->
      <div class="org-head">
        <h1 class="org-title">{{ tt('Добро пожаловать в Chatra', 'Chatra-ға қош келдіңіз', 'Welcome to Chatra') }}</h1>
        <p class="org-sub">{{ tt('Выберите тип организации — оформление настроится под него.',
          'Ұйым түрін таңдаңыз — безендіру соған бейімделеді.',
          'Choose your organization type — the theme will adapt to it.') }}</p>
      </div>

      <!-- Карточки -->
      <div class="org-options">
        <button class="org-option" :class="{ selected: picked === 'university' }"
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

        <button class="org-option" :class="{ selected: picked === 'school' }"
          :style="picked === 'school' ? selStyle(AMBER) : {}"
          @click="pick('school')">
          <span class="org-option-icon school-tile">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8">
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
      <div class="org-footer">
        <button class="continue-btn" :disabled="!picked"
          :style="picked ? { background: accent } : {}"
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

const langIndex = computed(() => Math.max(0, langs.findIndex(l => l.code === lang.value)))

const TEAL_D = '#00829C'
const AMBER_D = '#B45309'

const picked = ref<'university' | 'school' | null>(null)
const accent = computed(() => picked.value === 'school' ? AMBER : TEAL)
const accentDark = computed(() => picked.value === 'school' ? AMBER_D : TEAL_D)

const tt = (ru: string, kk: string, en: string) =>
  lang.value === 'ru' ? ru : lang.value === 'kk' ? kk : en

const selStyle = (c: string) => ({
  borderColor: c,
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
}

.org-content {
  display: flex; flex-direction: column; align-items: center;
  padding: 32px 24px;
  width: 100%; max-width: 400px;
  animation: content-fade .32s ease both;
}
@keyframes content-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Lang row: сегментированный переключатель со скользящим ползунком */
.lang-row {
  position: relative;
  display: flex; align-items: center;
  margin-bottom: 28px;
  background: var(--surface2);
  border-radius: 100px;
  padding: 3px;
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
  font-size: 12px; font-weight: 700; letter-spacing: .04em;
  color: var(--text3);
  transition: color .2s ease;
}
.lang-btn.active { color: var(--text1); }

/* Логотип: однотонная маска, тонируется под выбранный акцент */
.org-logo {
  display: block;
  width: 84px; aspect-ratio: 1200 / 734;
  margin-bottom: 22px;
  -webkit-mask: url('/logo.png') center / contain no-repeat;
  mask: url('/logo.png') center / contain no-repeat;
  transition: background .3s ease;
}

/* Заголовок */
.org-head { text-align: center; margin-bottom: 30px; }
.org-title {
  font-size: 24px; font-weight: 700;
  letter-spacing: -.015em; line-height: 1.2;
  color: var(--text1);
}
.org-sub {
  margin-top: 8px;
  font-size: 14px; color: var(--text4); line-height: 1.45;
  max-width: 300px; margin-left: auto; margin-right: auto;
}

/* Карточки */
.org-options { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.org-option {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  text-align: left;
  transition: transform .15s ease, border-color .2s ease, background .2s ease;
}
.org-option:hover { background: var(--surface2); }
.org-option:active { transform: scale(.985); }
.org-option.selected { border-width: 2px; padding: 13.5px 15.5px; }

.org-option-icon {
  width: 44px; height: 44px; border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.uni-tile    { background: #00B1C9; }
.school-tile { background: #F59E0B; }
.uni-glyph {
  width: 24px; height: 24px; display: block;
  background: #fff;
  -webkit-mask: url('/uni-logo.png') center / contain no-repeat;
  mask: url('/uni-logo.png') center / contain no-repeat;
}

.org-option-body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.org-option-title { font-size: 15.5px; font-weight: 600; letter-spacing: -.01em; color: var(--text1); }
.org-option-sub   { font-size: 12.5px; color: var(--text4); margin-top: 1px; }

/* Радио-отметка в стиле списков iOS */
.radio {
  width: 24px; height: 24px; border-radius: 50%;
  border: 1.6px solid var(--border2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all .2s ease;
}

/* Продолжить */
.org-footer { width: 100%; margin-top: 22px; display: flex; flex-direction: column; align-items: center; }
.continue-btn {
  width: 100%; height: 50px;
  border-radius: 14px;
  background: var(--surface2);
  color: var(--text4);
  font-size: 15px; font-weight: 600;
  transition: background .2s ease, color .2s ease;
}
.continue-btn:not(:disabled) { color: #fff; }
.continue-btn:not(:disabled):active { transform: scale(.98); }
.continue-btn:disabled { cursor: not-allowed; }
.org-note { margin-top: 12px; font-size: 12px; color: var(--text4); text-align: center; }

@media (prefers-reduced-motion: reduce) {
  .org-content { animation: none; }
  .org-logo, .org-option, .radio, .continue-btn, .lang-thumb { transition: none; }
}

@media (max-width: 768px) {
  .lang-btn { width: 48px; padding: 10px 0; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; }
}
@media (max-width: 480px) {
  .org-content { padding: 24px 18px; }
  .org-title { font-size: 21px; }
  .org-logo { width: 72px; margin-bottom: 18px; }
  .org-option { padding: 12px 14px; }
  .org-option.selected { padding: 11.5px 13.5px; }
  .org-option-icon { width: 40px; height: 40px; border-radius: 12px; }
  .uni-glyph { width: 20px; height: 20px; }
}
</style>
