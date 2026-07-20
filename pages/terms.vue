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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <path d="M14 2v6h6"/>
          <path d="M8 13h8"/>
          <path d="M8 17h5"/>
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

// Текст совпадает с экраном условий использования в приложении.
const content = {
  ru: {
    title: 'Условия использования',
    updatedLabel: 'Обновлено',
    intro: 'Эти Условия использования регулируют отношения между вами и Chatra — образовательной платформой для общения преподавателей и студентов, работы с заданиями и использования функций искусственного интеллекта. Создавая аккаунт или продолжая пользоваться сервисом, вы подтверждаете, что ознакомились с этими Условиями и согласны их соблюдать. Если вы не согласны с ними, пожалуйста, не используйте сервис.',
    sections: [
      { t: 'Использование сервиса', b: 'Chatra предоставляется для образовательных целей: создания классов, обмена сообщениями, публикации и выполнения заданий, выставления оценок и работы с учебными материалами.\n\nВы обязуетесь использовать сервис в соответствии с законодательством вашей страны и этими Условиями. Запрещается вмешиваться в работу платформы, получать несанкционированный доступ к чужим аккаунтам или данным, а также применять автоматизированные средства для массового сбора информации.\n\nМы стремимся обеспечить бесперебойную работу сервиса, однако вправе изменять, временно приостанавливать или прекращать отдельные функции, в том числе для проведения технических работ.' },
      { t: 'Аккаунт пользователя', b: 'Для использования сервиса необходимо создать аккаунт и указать достоверные данные, включая действующий адрес электронной почты. Аккаунт предназначен для личного использования; передача доступа третьим лицам не допускается.\n\nВы отвечаете за сохранность пароля и за действия, совершённые под вашим аккаунтом. Если вам стало известно о несанкционированном доступе, незамедлительно измените пароль и сообщите нам.\n\nВы можете в любой момент удалить аккаунт в настройках. Удаление необратимо.' },
      { t: 'Правила поведения', b: 'Chatra — учебная среда, поэтому мы ожидаем уважительного общения. Запрещается размещать оскорбления, угрозы, травлю, разжигание ненависти и дискриминацию, материалы сексуального или насильственного характера, спам, мошеннические и вредоносные ссылки, а также любой контент, нарушающий закон или права других лиц.\n\nВы можете пожаловаться на любое сообщение или пользователя, а также заблокировать пользователя. Жалобы рассматриваются в течение 24 часов. К подобным нарушениям применяется политика нулевой терпимости: контент удаляется, а аккаунт нарушителя может быть заблокирован.' },
      { t: 'Использование искусственного интеллекта', b: 'В сервисе доступны функции на основе искусственного интеллекта: ИИ-помощник, генерация учебных материалов, автоматическая проверка заданий и создание AI-аватара. Эти функции запускаются только по вашей инициативе.\n\nОтветы ИИ формируются автоматически и могут содержать неточности. Они носят вспомогательный характер, не заменяют профессиональную оценку преподавателя и не являются юридической, медицинской или иной специализированной консультацией. ИИ-проверка запускается преподавателем, и выставленную оценку преподаватель может изменить.\n\nЗапрещается использовать функции ИИ для создания противоправного контента, обхода правил учебного заведения или введения других пользователей в заблуждение.' },
      { t: 'Пользовательский контент', b: 'Права на материалы, которые вы создаёте или загружаете в сервисе — сообщения, задания, ответы и файлы, — остаются за вами или их правообладателями.\n\nЗагружая контент, вы предоставляете нам ограниченное право хранить, обрабатывать и отображать его в объёме, необходимом для работы сервиса: показа участникам вашего класса, синхронизации между устройствами и выполнения запрошенных вами функций.\n\nВы подтверждаете, что обладаете необходимыми правами на размещаемые материалы. Мы вправе удалить контент, нарушающий эти Условия или законодательство.' },
      { t: 'Интеллектуальная собственность', b: 'Сервис, его интерфейс, дизайн, логотипы, программный код и иные элементы принадлежат правообладателю Chatra и защищены законодательством об интеллектуальной собственности.\n\nВам предоставляется ограниченная, отзывная, неисключительная и непередаваемая лицензия на использование сервиса в личных или учебных целях. Запрещается копировать, изменять, декомпилировать или распространять сервис и его части без нашего письменного разрешения.' },
      { t: 'Ограничение ответственности', b: 'Сервис предоставляется «как есть». Мы не гарантируем, что его работа будет полностью бесперебойной и безошибочной, а результаты работы ИИ — абсолютно точными.\n\nВ пределах, допускаемых применимым правом, мы не несём ответственности за косвенные убытки и упущенную выгоду, за содержание материалов, размещённых пользователями, а также за решения, принятые на основании ответов ИИ.\n\nЭти Условия не ограничивают права, которые не могут быть ограничены в соответствии с законодательством вашей страны.' },
      { t: 'Приостановка или удаление аккаунта', b: 'Мы вправе ограничить доступ к сервису, временно приостановить или удалить аккаунт, если пользователь нарушает эти Условия или правила поведения, создаёт угрозу безопасности платформы либо других пользователей или действует в нарушение закона.\n\nПри существенных нарушениях доступ может быть ограничен незамедлительно. По возможности мы сообщаем пользователю о причинах и предоставляем возможность обжаловать решение, связавшись с нами.' },
      { t: 'Изменения условий', b: 'Мы можем периодически обновлять Условия использования — например, при появлении новых функций или изменении требований законодательства. В случае существенных изменений мы уведомим пользователей через приложение или иным доступным способом.\n\nАктуальная редакция всегда доступна в приложении и на этой странице. Продолжая пользоваться Chatra после вступления изменений в силу, вы принимаете обновлённые Условия.' },
      { t: 'Заключительные положения', b: 'Эти Условия составляют полное соглашение между вами и Chatra в отношении использования сервиса и дополняются Политикой конфиденциальности и Правилами сообщества.\n\nЕсли отдельное положение будет признано недействительным, остальные положения сохраняют силу. Условия толкуются в соответствии с применимым законодательством по месту нахождения правообладателя.\n\nПо любым вопросам вы можете связаться с нами.' },
    ],
  },
  en: {
    title: 'Terms of Service',
    updatedLabel: 'Updated',
    intro: 'These Terms of Service govern the relationship between you and Chatra — an educational platform for communication between teachers and students, working with assignments and using AI-powered features. By creating an account or continuing to use the service, you confirm that you have read these Terms and agree to follow them. If you do not agree with them, please do not use the service.',
    sections: [
      { t: 'Use of the service', b: 'Chatra is provided for educational purposes: creating classes, exchanging messages, publishing and completing assignments, grading work and managing study materials.\n\nYou agree to use the service in accordance with the law of your country and with these Terms. You may not interfere with the operation of the platform, gain unauthorised access to other people’s accounts or data, or use automated tools to collect information in bulk.\n\nWe aim to keep the service running without interruption, but we may modify, temporarily suspend or discontinue individual features, including for maintenance.' },
      { t: 'Your account', b: 'To use the service you need to create an account and provide accurate information, including a valid email address. An account is for personal use; sharing access with other people is not permitted.\n\nYou are responsible for keeping your password safe and for activity carried out under your account. If you become aware of unauthorised access, change your password immediately and let us know.\n\nYou can delete your account at any time in the settings. Deletion is irreversible.' },
      { t: 'Rules of conduct', b: 'Chatra is a learning environment, so we expect respectful communication. You may not post insults, threats, harassment, hate speech or discrimination, sexual or violent material, spam, fraudulent or malicious links, or any content that breaks the law or violates the rights of others.\n\nYou can report any message or user and block a user. Reports are reviewed within 24 hours. We apply a zero-tolerance policy to such violations: the content is removed and the offending account may be blocked.' },
      { t: 'Use of artificial intelligence', b: 'The service offers AI-powered features: an AI assistant, generation of study materials, automated assignment review and AI-avatar creation. These features run only at your initiative.\n\nAI responses are generated automatically and may contain inaccuracies. They are supportive in nature, do not replace a teacher’s professional judgement, and are not legal, medical or other specialist advice. AI review is started by the teacher, and the teacher can change the grade it produces.\n\nYou may not use AI features to create unlawful content, to circumvent the rules of an educational institution, or to mislead other users.' },
      { t: 'User content', b: 'The rights to material you create or upload in the service — messages, assignments, answers and files — remain with you or their respective rights holders.\n\nBy uploading content, you grant us a limited right to store, process and display it to the extent needed to run the service: showing it to members of your class, syncing it across your devices and performing the functions you request.\n\nYou confirm that you hold the rights necessary to post the material. We may remove content that breaches these Terms or the law.' },
      { t: 'Intellectual property', b: 'The service itself — its interface, design, logos, software code and other elements — belongs to the Chatra rights holder and is protected by intellectual property law.\n\nYou are granted a limited, revocable, non-exclusive and non-transferable licence to use the service for personal or educational purposes. You may not copy, modify, decompile or distribute the service or any part of it without our written permission.' },
      { t: 'Limitation of liability', b: 'The service is provided "as is". We do not warrant that it will operate entirely without interruption or error, or that AI output will be completely accurate.\n\nTo the extent permitted by applicable law, we are not liable for indirect losses or lost profits, for content posted by users, or for decisions made on the basis of AI responses.\n\nThese Terms do not limit any rights that cannot be limited under the law of your country.' },
      { t: 'Suspension or deletion of an account', b: 'We may restrict access to the service, suspend or delete an account if a user breaches these Terms or the rules of conduct, creates a risk to the security of the platform or other users, or acts unlawfully.\n\nIn cases of serious violations, access may be restricted immediately. Where possible we inform the user of the reasons and give them the opportunity to appeal by contacting us.' },
      { t: 'Changes to these Terms', b: 'We may update these Terms of Service from time to time — for example, when new features are added or legal requirements change. If the changes are material, we will notify users through the app or by other available means.\n\nThe current version is always available in the app and on this page. By continuing to use Chatra after the changes take effect, you accept the updated Terms.' },
      { t: 'Final provisions', b: 'These Terms constitute the entire agreement between you and Chatra regarding use of the service, and are supplemented by the Privacy Policy and the Community Guidelines.\n\nIf any provision is found to be invalid, the remaining provisions stay in force. These Terms are interpreted in accordance with the applicable law of the rights holder’s place of establishment.\n\nFor any questions, you can contact us.' },
    ],
  },
  kk: {
    title: 'Пайдалану шарттары',
    updatedLabel: 'Жаңартылды',
    intro: 'Осы Пайдалану шарттары сіз бен Chatra арасындағы қатынастарды реттейді. Chatra — оқытушылар мен студенттердің қарым-қатынасына, тапсырмалармен жұмысқа және жасанды интеллект функцияларын пайдалануға арналған білім беру платформасы. Аккаунт жасай отырып немесе сервисті пайдалануды жалғастыра отырып, сіз осы Шарттармен таныстыңыз және оларды сақтауға келісесіз. Егер олармен келіспесеңіз, сервисті пайдаланбауыңызды сұраймыз.',
    sections: [
      { t: 'Сервисті пайдалану', b: 'Chatra білім беру мақсаттары үшін ұсынылады: сыныптар құру, хабарлама алмасу, тапсырмаларды жариялау және орындау, баға қою және оқу материалдарымен жұмыс істеу.\n\nСіз сервисті еліңіздің заңнамасына және осы Шарттарға сәйкес пайдалануға міндеттенесіз. Платформаның жұмысына араласуға, өзге аккаунттарға немесе деректерге рұқсатсыз қол жеткізуге, сондай-ақ ақпаратты жаппай жинау үшін автоматтандырылған құралдарды қолдануға тыйым салынады.\n\nБіз сервистің үзіліссіз жұмысын қамтамасыз етуге тырысамыз, дегенмен жекелеген функцияларды өзгертуге, уақытша тоқтатуға немесе тоқтатуға құқылымыз, оның ішінде техникалық жұмыстарды жүргізу үшін.' },
      { t: 'Пайдаланушы аккаунты', b: 'Сервисті пайдалану үшін аккаунт жасап, шынайы деректерді, оның ішінде жарамды электрондық пошта мекенжайын көрсету қажет. Аккаунт жеке пайдалануға арналған; қолжетімділікті үшінші тұлғаларға беруге жол берілмейді.\n\nСіз құпиясөздің сақталуына және аккаунтыңыз арқылы жасалған әрекеттерге жауап бересіз. Рұқсатсыз кіру туралы білсеңіз, құпиясөзді дереу өзгертіп, бізге хабарлаңыз.\n\nАккаунтты кез келген уақытта баптауларда жоя аласыз. Жою қайтарылмайды.' },
      { t: 'Мінез-құлық ережелері', b: 'Chatra — оқу ортасы, сондықтан біз сыйластықпен қарым-қатынас күтеміз. Қорлау, қоқан-лоққы, қудалау, өшпенділік пен кемсітушілікті насихаттау, сексуалдық немесе зорлық сипатындағы материалдар, спам, алаяқтық және зиянды сілтемелер, сондай-ақ заңды немесе басқалардың құқықтарын бұзатын кез келген мазмұнды орналастыруға тыйым салынады.\n\nКез келген хабарламаға немесе пайдаланушыға шағымдана аласыз, сондай-ақ пайдаланушыны бұғаттай аласыз. Шағымдар 24 сағат ішінде қаралады. Мұндай бұзушылықтарға мүлдем төзбеушілік саясаты қолданылады: мазмұн жойылады, ал бұзушының аккаунты бұғатталуы мүмкін.' },
      { t: 'Жасанды интеллектті пайдалану', b: 'Сервисте жасанды интеллектке негізделген функциялар бар: ИИ-көмекші, оқу материалдарын жасау, тапсырмаларды автоматты тексеру және AI-аватар жасау. Бұл функциялар тек сіздің бастамаңызбен іске қосылады.\n\nИИ жауаптары автоматты түрде қалыптасады және дәл болмауы мүмкін. Олар көмекші сипатта болады, оқытушының кәсіби бағасын алмастырмайды және заңдық, медициналық немесе өзге де мамандандырылған кеңес болып табылмайды. ИИ-тексеруді оқытушы іске қосады және қойылған бағаны оқытушы өзгерте алады.\n\nИИ функцияларын құқыққа қайшы мазмұн жасау, оқу орнының ережелерін айналып өту немесе басқа пайдаланушыларды жаңылыстыру үшін пайдалануға тыйым салынады.' },
      { t: 'Пайдаланушы контенті', b: 'Сервисте өзіңіз жасайтын немесе жүктейтін материалдарға — хабарламалар, тапсырмалар, жауаптар және файлдарға — құқықтар сізде немесе олардың құқық иелерінде қалады.\n\nКонтент жүктей отырып, сіз бізге оны сервистің жұмысы үшін қажет көлемде сақтауға, өңдеуге және көрсетуге шектеулі құқық бересіз: сыныбыңыздың қатысушыларына көрсету, құрылғылар арасында синхрондау және сұралған функцияларды орындау.\n\nСіз орналастыратын материалдарға қажетті құқықтарыңыз бар екенін растайсыз. Біз осы Шарттарды немесе заңнаманы бұзатын контентті жоюға құқылымыз.' },
      { t: 'Зияткерлік меншік', b: 'Сервистің өзі, оның интерфейсі, дизайны, логотиптері, бағдарламалық коды және өзге де элементтері Chatra құқық иесіне тиесілі және зияткерлік меншік туралы заңнамамен қорғалады.\n\nСізге сервисті жеке немесе оқу мақсатында пайдалануға шектеулі, кері қайтарылатын, айрықша емес және берілмейтін лицензия ұсынылады. Сервисті және оның бөліктерін біздің жазбаша рұқсатымызсыз көшіруге, өзгертуге, декомпиляциялауға немесе таратуға тыйым салынады.' },
      { t: 'Жауапкершілікті шектеу', b: 'Сервис «қалай бар, солай» ұсынылады. Біз оның жұмысы толықтай үзіліссіз әрі қатесіз болатынына, ал ИИ нәтижелерінің абсолютті дәл болатынына кепілдік бермейміз.\n\nҚолданыстағы құқық рұқсат ететін шекте біз жанама шығындар мен жіберіп алынған пайда үшін, пайдаланушылар орналастырған материалдардың мазмұны үшін, сондай-ақ ИИ жауаптары негізінде қабылданған шешімдер үшін жауап бермейміз.\n\nОсы Шарттар еліңіздің заңнамасына сәйкес шектелуге жатпайтын құқықтарды шектемейді.' },
      { t: 'Аккаунтты тоқтата тұру немесе жою', b: 'Пайдаланушы осы Шарттарды немесе мінез-құлық ережелерін бұзса, платформаның не басқа пайдаланушылардың қауіпсіздігіне қатер төндірсе немесе заңды бұза әрекет етсе, біз сервиске қолжетімділікті шектеуге, аккаунтты уақытша тоқтата тұруға немесе жоюға құқылымыз.\n\nЕлеулі бұзушылықтар кезінде қолжетімділік дереу шектелуі мүмкін. Мүмкіндігінше біз пайдаланушыға себептерін хабарлаймыз және бізбен байланысу арқылы шешімге шағымдану мүмкіндігін береміз.' },
      { t: 'Шарттардың өзгеруі', b: 'Біз осы Пайдалану шарттарын мезгіл-мезгіл жаңартып отыруымыз мүмкін — мысалы, жаңа функциялар пайда болғанда немесе заңнама талаптары өзгергенде. Елеулі өзгерістер болған жағдайда пайдаланушыларды қосымша арқылы немесе өзге қолжетімді тәсілмен хабардар етеміз.\n\nӨзекті нұсқа әрқашан қосымшада және осы бетте қолжетімді. Өзгерістер күшіне енгеннен кейін Chatra-ны пайдалануды жалғастыра отырып, сіз жаңартылған Шарттарды қабылдайсыз.' },
      { t: 'Қорытынды ережелер', b: 'Осы Шарттар сервисті пайдалануға қатысты сіз бен Chatra арасындағы толық келісімді құрайды және Құпиялылық саясаты мен Қоғамдастық ережелерімен толықтырылады.\n\nЕгер жекелеген ереже жарамсыз деп танылса, қалған ережелер күшінде қалады. Шарттар құқық иесінің орналасқан жері бойынша қолданыстағы заңнамаға сәйкес түсіндіріледі.\n\nКез келген сұрақтар бойынша бізбен байланыса аласыз.' },
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
/* pre-line — в тексте разделов есть абзацы и списки, разделённые \n. */
.pp-card-body { font-size: 15px; line-height: 1.6; color: var(--text2, #3a3a3c); margin: 0; white-space: pre-line; }

.pp-footer { text-align: center; color: var(--text4, #8e8e93); font-size: 13px; margin-top: 32px; }

@media (prefers-color-scheme: dark) {
  .pp-page { background: var(--bg, #000); color: var(--text1, #f2f2f7); }
  .pp-card { background: var(--surface, #1c1c1e); border-color: var(--border, #2c2c2e); }
  .pp-card-body { color: var(--text2, #c7c7cc); }
}
</style>
