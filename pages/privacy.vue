<template>
  <div class="pp-page">
    <div class="pp-container">
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
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      </div>
      <h1 class="pp-title">{{ c.title }}</h1>
      <p class="pp-updated">{{ c.updatedLabel }}: {{ UPDATED }}</p>
      <p class="pp-intro">{{ c.intro }}</p>

      <!-- Sections -->
      <section v-for="(s, i) in c.sections" :key="i" class="pp-card">
        <h2 class="pp-card-title">{{ s.t }}</h2>
        <p class="pp-card-body">{{ s.b }}</p>
      </section>

      <footer class="pp-footer">© {{ year }} Chatra</footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

// Публичная страница — без авторизации и без layout приложения.
definePageMeta({ layout: false })

const { lang, setLang } = useI18n()

const langs = [
  { code: 'ru' as const, label: 'RU' },
  { code: 'en' as const, label: 'EN' },
  { code: 'kk' as const, label: 'KZ' },
]

const UPDATED = '20.07.2026'
const year = new Date().getFullYear()

// Текст совпадает с экраном политики в приложении (поверхностно, но качественно).
const content = {
  ru: {
    title: 'Политика конфиденциальности',
    updatedLabel: 'Обновлено',
    intro: 'Мы собираем минимум данных — только то, что нужно для работы приложения. Мы не продаём ваши данные, не показываем рекламу и не следим за вами. Ниже — коротко о главном.',
    sections: [
      { t: 'Какие данные мы собираем', b: 'Данные вашего аккаунта (имя, email) и то, что вы создаёте в приложении: сообщения, задания, ответы и файлы, которые вы прикрепляете сами.' },
      { t: 'Как мы используем данные', b: 'Только для работы приложения: классы, задания, оценки, чаты, ИИ-помощник и уведомления. Никакой рекламы и слежки.' },
      { t: 'Передаём ли мы данные', b: 'Нет — мы не продаём ваши данные и не передаём их посторонним для рекламы. Информация остаётся внутри платформы и используется только для её работы.' },
      { t: 'Хранение и безопасность', b: 'Данные передаются по защищённому соединению (HTTPS) и хранятся, пока активен ваш аккаунт. Когда вы удаляете аккаунт — связанные данные удаляются.' },
      { t: 'Ваши права', b: 'Вы можете изменить данные профиля, заблокировать пользователя или пожаловаться на контент, а также удалить аккаунт со всеми данными в разделе «Настройки → Удалить аккаунт». Удаление необратимо.' },
      { t: 'Дети', b: 'Приложение предназначено для учёбы. Если вы младше возраста самостоятельного согласия в вашей стране, пользуйтесь им под присмотром родителей или учебного заведения.' },
      { t: 'Изменения и контакты', b: 'Если политика изменится, актуальная версия всегда будет в приложении и на этой странице. Остались вопросы — свяжитесь с нами.' },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updatedLabel: 'Updated',
    intro: 'We collect the minimum of data — only what the app needs to work. We don’t sell your data, show ads, or track you. Here are the essentials, briefly.',
    sections: [
      { t: 'What we collect', b: 'Your account data (name, email) and what you create in the app: messages, assignments, answers and files you attach yourself.' },
      { t: 'How we use data', b: 'Only to run the app: classes, assignments, grades, chats, the AI helper and notifications. No ads, no tracking.' },
      { t: 'Do we share data', b: 'No — we don’t sell your data and don’t share it with outsiders for advertising. Your information stays within the platform and is used only to run it.' },
      { t: 'Storage and security', b: 'Data is sent over a secure connection (HTTPS) and kept while your account is active. When you delete your account, the related data is deleted.' },
      { t: 'Your rights', b: 'You can edit your profile data, block a user or report content, and delete your account with all its data in Settings → Delete account. Deletion is irreversible.' },
      { t: 'Children', b: 'The app is intended for learning. If you are below the age of self-consent in your country, use it under the supervision of a parent or your educational institution.' },
      { t: 'Changes and contact', b: 'If the policy changes, the current version is always in the app and on this page. Any questions — contact us.' },
    ],
  },
  kk: {
    title: 'Құпиялылық саясаты',
    updatedLabel: 'Жаңартылды',
    intro: 'Біз деректердің ең азын жинаймыз — тек қосымша жұмыс істеуі үшін. Деректеріңізді сатпаймыз, жарнама көрсетпейміз және сізді бақыламаймыз. Төменде — ең бастысы қысқаша.',
    sections: [
      { t: 'Қандай деректерді жинаймыз', b: 'Аккаунтыңыздың деректері (аты, email) және қосымшада өзіңіз жасайтын нәрсе: хабарламалар, тапсырмалар, жауаптар және өзіңіз тіркейтін файлдар.' },
      { t: 'Деректерді қалай қолданамыз', b: 'Тек қосымша жұмысы үшін: сыныптар, тапсырмалар, бағалар, чаттар, ИИ-көмекші және хабарландырулар. Жарнама да, бақылау да жоқ.' },
      { t: 'Деректерді береміз бе', b: 'Жоқ — біз деректеріңізді сатпаймыз және оларды жарнама үшін бөгде тұлғаларға бермейміз. Ақпарат платформа ішінде қалады және тек оның жұмысы үшін қолданылады.' },
      { t: 'Сақтау және қауіпсіздік', b: 'Деректер қорғалған байланыс арқылы (HTTPS) беріледі және аккаунт белсенді болғанша сақталады. Аккаунтты жойғанда — байланысты деректер өшіріледі.' },
      { t: 'Сіздің құқықтарыңыз', b: 'Профиль деректерін өзгерте аласыз, пайдаланушыны бұғаттай немесе контентке шағымдана аласыз, сондай-ақ «Баптаулар → Аккаунтты жою» бөлімінде аккаунтты барлық деректерімен жоя аласыз. Жою қайтарылмайды.' },
      { t: 'Балалар', b: 'Қосымша оқуға арналған. Егер сіз еліңізде дербес келісім жасына толмаған болсаңыз, оны ата-ананың немесе оқу орнының қарауымен пайдаланыңыз.' },
      { t: 'Өзгерістер мен байланыс', b: 'Саясат өзгерсе, өзекті нұсқасы әрқашан қосымшада және осы бетте болады. Сұрақтарыңыз болса — бізбен байланысыңыз.' },
    ],
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
  background: color-mix(in srgb, var(--teal, #0d9488) 12%, transparent);
  color: var(--teal, #0d9488);
}
.pp-title { font-size: 30px; font-weight: 800; letter-spacing: -0.6px; margin: 0; }
.pp-updated { font-size: 13px; color: var(--text4, #8e8e93); font-weight: 600; margin: 8px 0 0; }
.pp-intro { font-size: 16px; line-height: 1.6; margin: 16px 0 24px; }

.pp-card {
  background: var(--surface, #fff);
  border: 1px solid var(--border, #e5e5ea);
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 14px;
}
.pp-card-title { font-size: 17px; font-weight: 800; letter-spacing: -0.2px; margin: 0 0 10px; }
.pp-card-body { font-size: 15px; line-height: 1.6; color: var(--text2, #3a3a3c); margin: 0; }

.pp-footer { text-align: center; color: var(--text4, #8e8e93); font-size: 13px; margin-top: 32px; }

@media (prefers-color-scheme: dark) {
  .pp-page { background: var(--bg, #000); color: var(--text1, #f2f2f7); }
  .pp-card { background: var(--surface, #1c1c1e); border-color: var(--border, #2c2c2e); }
  .pp-card-body { color: var(--text2, #c7c7cc); }
}
</style>
