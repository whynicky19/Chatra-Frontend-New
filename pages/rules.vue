<template>
  <div class="pp-page">
    <div class="pp-container">
      <button class="pp-back" @click="goBack">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        {{ lang==='ru' ? 'Назад' : lang==='kk' ? 'Артқа' : 'Back' }}
      </button>

      <!-- Top bar -->
      <header class="pp-top">
        <NuxtLink to="/" class="pp-brand">Chatra</NuxtLink>
        <div class="pp-langs">
          <button v-for="l in langs" :key="l.code" @click="setLang(l.code)"
                  :class="['pp-lang', { active: lang === l.code }]">{{ l.label }}</button>
        </div>
      </header>

      <!-- Hero -->
      <div class="pp-icon" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <h1 class="pp-title">{{ c.title }}</h1>
      <p class="pp-intro" style="white-space: pre-line">{{ c.body }}</p>

      <footer class="pp-footer">© {{ year }} Chatra</footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from '#app'
import { useI18n } from '~/composables/useI18n'

// Публичная страница — без авторизации и без layout приложения.
definePageMeta({ layout: false })

const { lang, setLang } = useI18n()
const router = useRouter()
// Открыть могли откуда угодно (регистрация, логин, настройки, внешняя
// ссылка) — возвращаемся в историю браузера, а если её нет (открыли
// страницу напрямую), уводим на главный экран, а не оставляем в тупике.
const goBack = () => {
  if (import.meta.client && window.history.length > 1) router.back()
  else router.push('/')
}

const langs = [
  { code: 'ru' as const, label: 'RU' },
  { code: 'en' as const, label: 'EN' },
  { code: 'kk' as const, label: 'KZ' },
]

const year = new Date().getFullYear()

// Текст совпадает с экраном правил сообщества в приложении.
const content = {
  ru: {
    title: 'Правила сообщества',
    body: 'Chatra — образовательная платформа с ИИ-ассистентом. Используя приложение, вы соглашаетесь применять его добросовестно и не допускать:\n\n•  загрузки незаконных, оскорбительных или защищённых чужими правами материалов;\n•  использования ответов ИИ для списывания, плагиата или выдачи чужой работы за свою;\n•  попыток обойти ограничения ИИ-ассистента или использовать его во вред другим пользователям;\n•  передачи доступа к своему аккаунту третьим лицам;\n•  действий, нарушающих закон или права правообладателей учебных материалов.\n\nОтветы ИИ-ассистента могут содержать неточности — всегда проверяйте важную информацию самостоятельно. Загруженные вами материалы используются только для работы платформы и не передаются третьим лицам. При нарушении этих правил доступ к аккаунту может быть ограничен.',
  },
  en: {
    title: 'Community Guidelines',
    body: 'Chatra is an educational platform with an AI assistant. By using the app you agree to use it in good faith and not to:\n\n•  upload illegal, abusive or third-party-protected material;\n•  use AI responses for cheating, plagiarism, or passing off someone else\'s work as your own;\n•  attempt to bypass the AI assistant\'s limits or use it to harm other users;\n•  share access to your account with third parties;\n•  do anything that breaks the law or infringes the rights of the owners of study materials.\n\nAI-generated responses may contain inaccuracies — always verify important information yourself. Materials you upload are used only to operate the platform and are not shared with third parties. Violating these rules may result in your account access being restricted.',
  },
  kk: {
    title: 'Қоғамдастық ережелері',
    body: 'Chatra — ЖИ-көмекшісі бар білім беру платформасы. Қосымшаны пайдалана отырып, сіз оны адал пайдалануға және мыналарға жол бермеуге келісесіз:\n\n•  заңсыз, қорлайтын немесе басқа біреудің құқығымен қорғалған материалдарды жүктеу;\n•  ЖИ жауаптарын көшіру, плагиат немесе басқа біреудің жұмысын өз атынан беру үшін пайдалану;\n•  ЖИ-көмекшінің шектеулерін айналып өтуге немесе оны басқа пайдаланушыларға зиян келтіру үшін пайдалануға тырысу;\n•  өз аккаунтыңызға қолжетімділікті үшінші тұлғаларға беру;\n•  заңды немесе оқу материалдарының құқық иелерінің құқығын бұзатын әрекеттер жасау.\n\nЖИ-көмекшінің жауаптарында дәлсіздіктер болуы мүмкін — маңызды ақпаратты әрқашан өзіңіз тексеріңіз. Сіз жүктеген материалдар тек платформаның жұмысы үшін пайдаланылады және үшінші тұлғаларға берілмейді. Осы ережелер бұзылған жағдайда аккаунтқа қолжетімділік шектелуі мүмкін.',
  },
}

const c = computed(() => content[lang.value] || content.ru)

useHead({ title: computed(() => c.value.title) })
</script>

<style scoped>
/* #__nuxt фиксирован по высоте с overflow:hidden — страница должна быть
   собственным скролл-контейнером, иначе контент обрезается и не скроллится. */
.pp-page {
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--bg, #f5f6f8);
  color: var(--text1, #1c1c1e);
  padding: 0 20px 64px;
}
.pp-container { max-width: 720px; margin: 0 auto; }

.pp-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 18px;
  padding: 6px 4px;
  background: none;
  border: none;
  color: var(--text4, #8e8e93);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: color .15s;
}
.pp-back:hover { color: var(--teal, #0d9488); }

.pp-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0 8px;
}
.pp-brand {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--teal, #0d9488);
  text-decoration: none;
}
.pp-langs { display: flex; gap: 6px; }
.pp-lang {
  border: none;
  background: transparent;
  color: var(--text4, #8e8e93);
  font-size: 13px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
}
.pp-lang.active { background: var(--teal, #0d9488); color: #fff; }

.pp-icon {
  width: 56px; height: 56px;
  margin: 24px 0 16px;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface2);
  color: var(--text3);
}
.pp-title { font-size: 30px; font-weight: 800; letter-spacing: -0.6px; margin: 0; }
.pp-intro { font-size: 16px; line-height: 1.6; margin: 16px 0 24px; }

.pp-footer { text-align: center; color: var(--text4, #8e8e93); font-size: 13px; margin-top: 32px; }

@media (prefers-color-scheme: dark) {
  .pp-page { background: var(--bg, #000); color: var(--text1, #f2f2f7); }
}

@media (max-width: 768px) {
  .pp-page { padding: 0 16px 48px; }
  .pp-title { font-size: 24px; }
  .pp-lang { padding: 10px 12px; min-height: 44px; }
  .pp-back { position: relative; }
  .pp-back::after { content: ''; position: absolute; top: -12px; bottom: -12px; left: -8px; right: -8px; }
}
</style>
