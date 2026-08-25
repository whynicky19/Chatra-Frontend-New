<template>
  <LegalDoc :title="c.title" :body="c.body">
    <template #icon>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    </template>
  </LegalDoc>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

// Правила сообщества — единственный из трёх документов без разделов и без
// даты редакции: текст идёт одной карточкой через :body.
// ВАЖНО: у шаблона должен быть ровно один корень (без комментариев-соседей) —
// иначе <Transition mode="out-in"> вокруг NuxtPage ломается, и после возврата
// назад на лендинг тот рендерится пустым.

// Публичная страница — без авторизации и без layout приложения.
definePageMeta({ layout: false })

// Разметка, оформление, переключатель языка и кнопка «назад» — в LegalDoc,
// общем для privacy/terms/rules. Здесь остаётся только сам текст.
const { lang } = useI18n()


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

