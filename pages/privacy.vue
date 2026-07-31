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

const UPDATED = '20.07.2026'
const year = new Date().getFullYear()

// Текст совпадает с экраном политики конфиденциальности в приложении.
const content = {
  ru: {
    title: 'Политика конфиденциальности',
    updatedLabel: 'Обновлено',
    intro: 'Эта Политика конфиденциальности объясняет, какие данные собирает приложение Chatra, как мы их используем и какие права есть у вас. Мы обрабатываем только те данные, которые необходимы для работы сервиса: мы не продаём персональные данные, не показываем рекламу и не отслеживаем вас за пределами приложения.',
    sections: [
      { t: 'Какие данные мы собираем', b: 'Данные аккаунта: имя, адрес электронной почты, роль (преподаватель или студент) и пароль, который хранится только в виде необратимого хеша.\n\nСодержимое, которое вы создаёте: сообщения, задания, ответы, оценки и файлы, которые вы загружаете самостоятельно. Доступ к медиатеке запрашивается только в тот момент, когда вы сами прикрепляете изображение или файл. Камеру и микрофон приложение не использует.\n\nТехнические данные: модель устройства и версия приложения, идентификатор для доставки push-уведомлений, а также журналы обращений к серверу и отчёты о сбоях.\n\nМы не собираем данные о вашем местоположении и не запрашиваем доступ к списку контактов.' },
      { t: 'Как мы используем данные', b: 'Мы используем данные, чтобы предоставлять функции приложения: создавать классы и задания, обмениваться сообщениями, выставлять оценки, обрабатывать запросы к ИИ-помощнику, доставлять уведомления и восстанавливать доступ к аккаунту.\n\nТехнические данные используются для обеспечения безопасности, предотвращения злоупотреблений и повышения стабильности сервиса.\n\nМы не используем ваши данные в рекламных целях и не передаём их рекламным сетям.' },
      { t: 'Передача третьим сторонам', b: 'Мы не продаём персональные данные и не передаём их третьим лицам в маркетинговых целях. Для работы отдельных функций мы привлекаем поставщиков услуг, каждому из которых передаётся только тот объём данных, который необходим для выполнения соответствующей функции.\n\n•  OpenAI — обработка ваших запросов к ИИ и генерация ответов, проверка заданий, если преподаватель запускает эту функцию, а также индексация учебных материалов класса, чтобы ИИ-помощник мог отвечать на их основе.\n\n•  Firebase (Google) — доставка push-уведомлений и получение отчётов о сбоях приложения.\n\n•  Поставщики облачного хранилища и электронной почты — хранение загруженных файлов и отправка служебных писем: кодов подтверждения и восстановления пароля.\n\nПоставщики услуг обрабатывают данные по нашему поручению и не вправе использовать их в собственных целях. Мы также можем раскрыть данные, если этого прямо требует закон.' },
      { t: 'Хранение и безопасность', b: 'Передача данных между приложением и нашими серверами выполняется по защищённым каналам связи с использованием шифрования (HTTPS/TLS). Пароли хранятся только в виде необратимых хеш-значений, а доступ к данным ограничен кругом лиц, которым он необходим для сопровождения сервиса.\n\nДанные аккаунта хранятся, пока аккаунт активен. После удаления аккаунта связанные с ним данные удаляются в разумный срок в соответствии с нашими внутренними процедурами.\n\nТехнические журналы (логи) могут храниться временно — для обеспечения безопасности, предотвращения злоупотреблений и исправления ошибок, — после чего удаляются.\n\nНи одна система не обеспечивает абсолютной защиты, однако мы принимаем разумные организационные и технические меры для защиты ваших данных.' },
      { t: 'Ваши права', b: 'Вы можете в любой момент просмотреть и изменить данные профиля, а также удалить аккаунт вместе со связанными данными в разделе «Настройки → Удалить аккаунт». Удаление аккаунта необратимо.\n\nВ зависимости от страны проживания вы также можете иметь право запросить копию своих данных, их исправление или ограничение обработки. Для этого напишите нам — мы ответим в разумный срок.' },
      { t: 'Несовершеннолетние пользователи', b: 'Chatra предназначена для образовательных целей и может использоваться в учебных заведениях. Если вы не достигли возраста, начиная с которого законодательство вашей страны допускает самостоятельное согласие на обработку данных, используйте приложение с согласия и под контролем родителя, законного представителя или учебного заведения.\n\nМы не собираем данные несовершеннолетних сверх того, что необходимо для учебного процесса. Если вам стало известно, что ребёнок предоставил данные без надлежащего согласия, свяжитесь с нами — мы удалим такие данные.' },
      { t: 'Изменения политики и контакты', b: 'Мы можем периодически обновлять эту Политику конфиденциальности. В случае существенных изменений мы уведомим пользователей через приложение или иным доступным способом. Актуальная редакция всегда доступна в приложении, а дата последнего обновления указана в начале документа.\n\nПродолжая пользоваться Chatra после вступления изменений в силу, вы принимаете обновлённую редакцию. По вопросам обработки данных напишите нам через раздел «Связаться с разработчиком».' },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updatedLabel: 'Updated',
    intro: 'This Privacy Policy explains what data the Chatra app collects, how we use it and what rights you have. We process only the data the service needs in order to work: we do not sell personal data, we do not show ads, and we do not track you outside the app.',
    sections: [
      { t: 'What we collect', b: 'Account data: your name, email address, role (teacher or student) and your password, which is stored only as an irreversible hash.\n\nContent you create: messages, assignments, answers, grades and files you upload yourself. Access to the photo library is requested only at the moment you attach an image or a file. The app does not use the camera or the microphone.\n\nTechnical data: device model and app version, the identifier used to deliver push notifications, plus server request logs and crash reports.\n\nWe do not collect location data and do not request access to your contacts.' },
      { t: 'How we use data', b: 'We use your data to provide the features of the app: creating classes and assignments, exchanging messages, grading work, processing your requests to the AI assistant, delivering notifications and restoring access to your account.\n\nTechnical data is used to keep the service secure, prevent abuse and improve stability.\n\nWe do not use your data for advertising and do not share it with ad networks.' },
      { t: 'Sharing with third parties', b: 'We do not sell personal data and do not share it with third parties for marketing. To provide certain features we rely on service providers, and each of them receives only the data required to perform that specific function.\n\n•  OpenAI — processing your AI requests and generating responses, reviewing assignments when a teacher starts that feature, and indexing class study materials so the AI assistant can answer based on them.\n\n•  Firebase (Google) — delivering push notifications and receiving app crash reports.\n\n•  Cloud storage and email providers — storing uploaded files and sending service emails such as verification and password-reset codes.\n\nService providers process data on our instructions and may not use it for their own purposes. We may also disclose data where the law expressly requires it.' },
      { t: 'Storage and security', b: 'Data travels between the app and our servers over secure, encrypted channels (HTTPS/TLS). Passwords are stored only as irreversible hashes, and access to data is limited to those who need it to operate the service.\n\nAccount data is retained while your account is active. After you delete your account, the related data is deleted within a reasonable period in line with our internal procedures.\n\nTechnical logs may be retained temporarily — to maintain security, prevent abuse and fix errors — and are deleted afterwards.\n\nNo system can guarantee absolute protection, but we apply reasonable organisational and technical measures to safeguard your data.' },
      { t: 'Your rights', b: 'At any time you can review and edit your profile data, and delete your account together with its data in Settings → Delete account. Account deletion is irreversible.\n\nDepending on where you live, you may also have the right to request a copy of your data, its correction, or a restriction on its processing. Contact us and we will respond within a reasonable time.' },
      { t: 'Minors', b: 'Chatra is intended for educational use and may be used within educational institutions. If you are below the age at which the law of your country allows you to consent to data processing on your own, use the app with the consent and under the supervision of a parent, legal guardian or your school.\n\nWe do not collect data about minors beyond what the learning process requires. If you become aware that a child has provided data without proper consent, contact us and we will delete it.' },
      { t: 'Policy changes and contact', b: 'We may update this Privacy Policy from time to time. If the changes are material, we will notify users through the app or by other available means. The current version is always available in the app, and the date of the latest update is shown at the top of this document.\n\nBy continuing to use Chatra after the changes take effect, you accept the updated version. For questions about data processing, write to us via "Contact the developer".' },
    ],
  },
  kk: {
    title: 'Құпиялылық саясаты',
    updatedLabel: 'Жаңартылды',
    intro: 'Осы Құпиялылық саясаты Chatra қосымшасы қандай деректерді жинайтынын, оларды қалай пайдаланатынымызды және сіздің қандай құқықтарыңыз бар екенін түсіндіреді. Біз тек сервистің жұмысы үшін қажет деректерді өңдейміз: дербес деректерді сатпаймыз, жарнама көрсетпейміз және сізді қосымшадан тыс бақыламаймыз.',
    sections: [
      { t: 'Қандай деректерді жинаймыз', b: 'Аккаунт деректері: атыңыз, электрондық пошта мекенжайы, рөліңіз (оқытушы немесе студент) және тек қайтымсыз хеш түрінде сақталатын құпиясөз.\n\nӨзіңіз жасайтын мазмұн: хабарламалар, тапсырмалар, жауаптар, бағалар және өзіңіз жүктейтін файлдар. Медиатекаға қолжетімділік тек сіз сурет не файл тіркеген сәтте сұралады. Қосымша камера мен микрофонды пайдаланбайды.\n\nТехникалық деректер: құрылғы моделі мен қосымша нұсқасы, push-хабарландыруларды жеткізуге арналған идентификатор, сондай-ақ серверге сұраныстар журналдары мен ақаулар туралы есептер.\n\nБіз орналасқан жеріңіз туралы деректерді жинамаймыз және контактілерге қолжетімділік сұрамаймыз.' },
      { t: 'Деректерді қалай пайдаланамыз', b: 'Деректерді қосымша функцияларын ұсыну үшін пайдаланамыз: сыныптар мен тапсырмалар құру, хабарлама алмасу, баға қою, ИИ-көмекшіге сұрауларды өңдеу, хабарландырулар жіберу және аккаунтқа қолжетімділікті қалпына келтіру.\n\nТехникалық деректер қауіпсіздікті қамтамасыз ету, теріс пайдаланудың алдын алу және сервис тұрақтылығын арттыру үшін қолданылады.\n\nБіз деректеріңізді жарнама мақсатында пайдаланбаймыз және жарнама желілеріне бермейміз.' },
      { t: 'Үшінші тараптарға беру', b: 'Біз дербес деректерді сатпаймыз және оларды маркетинг мақсатында үшінші тұлғаларға бермейміз. Жекелеген функциялардың жұмысы үшін қызмет жеткізушілерін тартамыз, олардың әрқайсысына тиісті функцияны орындауға қажет көлемдегі деректер ғана беріледі.\n\n•  OpenAI — ИИ-ге сұрауларыңызды өңдеу және жауаптар қалыптастыру, оқытушы бұл функцияны іске қосқанда тапсырмаларды тексеру, сондай-ақ ИИ-көмекші солардың негізінде жауап бере алуы үшін сынып оқу материалдарын индекстеу.\n\n•  Firebase (Google) — push-хабарландыруларды жеткізу және қосымша ақаулары туралы есептерді алу.\n\n•  Бұлттық сақтау және электрондық пошта жеткізушілері — жүктелген файлдарды сақтау және қызметтік хаттар жіберу: растау және құпиясөзді қалпына келтіру кодтары.\n\nҚызмет жеткізушілері деректерді біздің тапсырмамыз бойынша өңдейді және оларды өз мақсаттарында пайдалануға құқылы емес. Сондай-ақ заң тікелей талап еткен жағдайда деректерді ашуымыз мүмкін.' },
      { t: 'Сақтау және қауіпсіздік', b: 'Қосымша мен серверлеріміз арасындағы деректер шифрлауды қолданатын қорғалған байланыс арналары (HTTPS/TLS) арқылы беріледі. Құпиясөздер тек қайтымсыз хеш түрінде сақталады, ал деректерге қолжетімділік сервисті сүйемелдеуге қажет тұлғалармен шектелген.\n\nАккаунт деректері аккаунт белсенді болғанша сақталады. Аккаунт жойылғаннан кейін онымен байланысты деректер ішкі рәсімдерімізге сәйкес ақылға қонымды мерзімде жойылады.\n\nТехникалық журналдар (логтар) қауіпсіздікті қамтамасыз ету, теріс пайдаланудың алдын алу және қателерді түзету үшін уақытша сақталуы мүмкін, содан кейін жойылады.\n\nЕшбір жүйе абсолютті қорғауды қамтамасыз ете алмайды, дегенмен біз деректеріңізді қорғау үшін ақылға қонымды ұйымдастырушылық және техникалық шаралар қолданамыз.' },
      { t: 'Сіздің құқықтарыңыз', b: 'Кез келген уақытта профиль деректерін қарап, өзгерте аласыз, сондай-ақ «Баптаулар → Аккаунтты жою» бөлімінде аккаунтты байланысты деректерімен бірге жоя аласыз. Аккаунтты жою қайтарылмайды.\n\nТұрғылықты еліңізге байланысты деректеріңіздің көшірмесін сұрауға, оларды түзетуге немесе өңдеуді шектеуге құқығыңыз болуы мүмкін. Ол үшін бізге жазыңыз — ақылға қонымды мерзімде жауап береміз.' },
      { t: 'Кәмелетке толмаған пайдаланушылар', b: 'Chatra білім беру мақсатына арналған және оқу орындарында пайдаланылуы мүмкін. Егер сіз еліңіздің заңнамасы деректерді өңдеуге дербес келісім беруге рұқсат ететін жасқа толмаған болсаңыз, қосымшаны ата-ананың, заңды өкілдің немесе оқу орнының келісімімен және бақылауымен пайдаланыңыз.\n\nБіз кәмелетке толмағандардың деректерін оқу үдерісіне қажет көлемнен тыс жинамаймыз. Егер бала тиісті келісімсіз дерек берген болса, бізге хабарласыңыз — ондай деректерді жоямыз.' },
      { t: 'Саясат өзгерістері және байланыс', b: 'Біз осы Құпиялылық саясатын мезгіл-мезгіл жаңартып отыруымыз мүмкін. Елеулі өзгерістер болған жағдайда пайдаланушыларды қосымша арқылы немесе өзге қолжетімді тәсілмен хабардар етеміз. Өзекті нұсқа әрқашан қосымшада қолжетімді, соңғы жаңарту күні құжаттың басында көрсетілген.\n\nӨзгерістер күшіне енгеннен кейін Chatra-ны пайдалануды жалғастыра отырып, сіз жаңартылған нұсқаны қабылдайсыз. Деректерді өңдеуге қатысты сұрақтар бойынша «Әзірлеушімен байланысу» бөлімі арқылы жазыңыз.' },
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
/* pre-line — в тексте разделов есть абзацы и списки, разделённые \n. */
.pp-card-body { font-size: 15px; line-height: 1.6; color: var(--text2, #3a3a3c); margin: 0; white-space: pre-line; }

.pp-footer { text-align: center; color: var(--text4, #8e8e93); font-size: 13px; margin-top: 32px; }

@media (prefers-color-scheme: dark) {
  .pp-page { background: var(--bg, #000); color: var(--text1, #f2f2f7); }
  .pp-card { background: var(--surface, #1c1c1e); border-color: var(--border, #2c2c2e); }
  .pp-card-body { color: var(--text2, #c7c7cc); }
}

@media (max-width: 768px) {
  .pp-page { padding: 0 16px 48px; }
  .pp-title { font-size: 24px; }
  .pp-lang { padding: 10px 12px; min-height: 44px; }
  .pp-back { position: relative; }
  .pp-back::after { content: ''; position: absolute; top: -12px; bottom: -12px; left: -8px; right: -8px; }
}
</style>
