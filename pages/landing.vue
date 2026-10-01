<template>
  <div class="landing">
    <header :class="['site-nav', { scrolled }]">
      <div class="nav-inner">
        <button class="brand" type="button" :aria-label="tx('toTop')" @click="toTop"><span class="brand-mark"/>Chatra</button>
        <nav><a href="#about">{{ tx('navAbout') }}</a><a href="#features">{{ tx('navFeatures') }}</a><a href="#roles">{{ tx('navRoles') }}</a></nav>
        <div class="nav-actions">
          <details ref="langMenu" class="language-picker">
            <summary :aria-label="tx('language')">{{ currentLanguageShort }}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></summary>
            <div class="language-menu">
              <button v-for="item in languages" :key="item.code" type="button" :class="{ active: lang === item.code }" @click="chooseLanguage(item.code)"><span>{{ item.short }}</span>{{ item.label }}<b v-if="lang === item.code">✓</b></button>
            </div>
          </details>
          <NuxtLink class="sign-in" to="/login">{{ tx('signIn') }}</NuxtLink><NuxtLink class="button button-small" to="/org">{{ tx('start') }}</NuxtLink>
        </div>
      </div>
    </header>

    <main>
      <section class="hero shell">
        <div class="hero-copy">
          <p class="eyebrow">{{ tx('heroEyebrow') }}</p>
          <h1>{{ tx('heroTitle1') }}<br><span>{{ tx('heroTitle2') }}</span></h1>
          <p class="hero-text">{{ tx('heroText') }}</p>
          <div class="hero-actions"><NuxtLink class="button button-large" to="/org">{{ tx('tryChatra') }} <span>→</span></NuxtLink><a class="quiet-link" href="#about">{{ tx('learnMore') }} <span>›</span></a></div>
          <p class="hero-meta">{{ tx('heroMeta') }}</p>
        </div>
        <div class="hero-wordmark" aria-hidden="true"><span class="hero-mark"/><div>{{ tx('word1') }}<br>{{ tx('word2') }}<br>{{ tx('word3') }}</div></div>
      </section>

      <section id="about" class="about shell reveal">
        <div class="about-copy">
          <p class="eyebrow">{{ tx('aboutEyebrow') }}</p>
          <h2>{{ tx('aboutTitle1') }}<br>{{ tx('aboutTitle2') }}</h2>
          <p>{{ tx('aboutText') }}</p>
          <div class="about-facts"><div><strong>01</strong><span>{{ tx('fact1') }}</span></div><div><strong>02</strong><span>{{ tx('fact2') }}</span></div><div><strong>03</strong><span>{{ tx('fact3') }}</span></div></div>
        </div>

        <div class="real-card-wrap" :aria-label="tx('subjectCardLabel')">
          <article class="class-card">
            <div class="card-cover">
              <SubjectCover src="/chatra-physics-cover.png" cover-source="ai_hero" class="landing-cover">
                <span class="cover-count">{{ tx('lessons12') }}</span>
              </SubjectCover>
            </div>
            <div class="card-body">
              <h3>{{ tx('physics') }}</h3>
              <p>{{ tx('physicsDescription') }}</p>
              <small>{{ tx('teacherLessons') }}</small>
              <div class="card-footer"><span>{{ tx('openCourse') }}</span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="m9 18 6-6-6-6"/></svg></div>
            </div>
          </article>
        </div>
      </section>

      <section id="features" class="features-section reveal">
        <div class="shell">
          <header class="section-heading"><p class="eyebrow">{{ tx('featuresEyebrow') }}</p><h2>{{ tx('featuresTitle1') }}<br>{{ tx('featuresTitle2') }}</h2><p>{{ tx('featuresText') }}</p></header>
          <div class="feature-list">
            <article><span>01</span><div><h3>{{ tx('feature1Title') }}</h3><p>{{ tx('feature1Text') }}</p></div><i>PDF · DOCX · PPTX</i></article>
            <article><span>02</span><div><h3>{{ tx('feature2Title') }}</h3><p>{{ tx('feature2Text') }}</p></div><i>{{ tx('feature2Tag') }}</i></article>
            <article><span>03</span><div><h3>{{ tx('feature3Title') }}</h3><p>{{ tx('feature3Text') }}</p></div><i>{{ tx('feature3Tag') }}</i></article>
            <article><span>04</span><div><h3>{{ tx('feature4Title') }}</h3><p>{{ tx('feature4Text') }}</p></div><i>{{ tx('feature4Tag') }}</i></article>
          </div>
        </div>
      </section>

      <section class="product-section shell reveal">
        <div class="product-copy">
          <p class="eyebrow">{{ tx('interfaceEyebrow') }}</p>
          <h2>{{ tx('interfaceTitle') }}</h2>
          <p>{{ tx('interfaceText') }}</p>
          <ul><li>{{ tx('interfacePoint1') }}</li><li>{{ tx('interfacePoint2') }}</li><li>{{ tx('interfacePoint3') }}</li></ul>
        </div>

        <div class="course-panel" :aria-label="tx('coursePanelLabel')">
          <div class="course-cover">
            <SubjectCover src="/chatra-physics-cover.png" cover-source="ai_hero" class="course-cover-photo"/>
            <div class="course-cover-shade"/>
            <div class="course-cover-title"><strong>{{ tx('physics') }}</strong><small>Д. Садыкова</small></div>
            <button :aria-label="tx('actions')">•••</button>
          </div>
          <div class="tabs-bar">
            <span class="tabs-indicator" :style="{ transform: `translateX(${activeTab * 100}%)` }"/>
            <button v-for="(item,index) in tabs" :key="item" :class="{ active: activeTab===index }" @click="activeTab=index">{{ item }}<small v-if="index<2">{{ index===0 ? 12 : 3 }}</small></button>
          </div>
          <div class="course-content">
            <Transition name="fade" mode="out-in">
              <div v-if="activeTab===0" key="lectures" class="item-list">
                <button class="item-row"><FileTypeIcon url="lecture_02.pdf"/><span class="item-copy"><b>{{ tx('lecture2') }}</b><small>PDF · 2.4 MB</small></span><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>
                <button class="item-row"><FileTypeIcon url="seminar_notes.docx"/><span class="item-copy"><b>{{ tx('seminarNotes') }}</b><small>DOCX · 480 KB</small></span><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>
                <button class="item-row"><FileTypeIcon url="newton_laws.pptx"/><span class="item-copy"><b>{{ tx('newtonSlides') }}</b><small>PPTX · 5.1 MB</small></span><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>
              </div>
              <div v-else-if="activeTab===1" key="assignments" class="item-list">
                <button class="assignment-row"><span class="assignment-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6"/></svg></span><span class="item-copy"><b>{{ tx('lab2') }}</b><small>{{ tx('labMeta') }}</small></span><em>{{ tx('inProgress') }}</em></button>
                <button class="assignment-row"><span class="assignment-icon complete"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span><span class="item-copy"><b>{{ tx('mechanicsTest') }}</b><small>{{ tx('testMeta') }}</small></span><em class="complete">{{ tx('done') }}</em></button>
              </div>
              <div v-else key="assistant" class="assistant-empty"><span><svg viewBox="0 0 24 24"><path d="M9 2c.4 3.2 1.8 4.6 5 5-3.2.4-4.6 1.8-5 5-.4-3.2-1.8-4.6-5-5 3.2-.4 4.6-1.8 5-5Z"/><path d="M17.5 12c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7 1 3-3Z"/></svg></span><h4>{{ tx('courseQuestions') }}</h4><p>{{ tx('assistantText') }}</p><div>{{ tx('askCourse') }} <b>↑</b></div></div>
            </Transition>
          </div>
        </div>
      </section>

      <section class="principles reveal">
        <div class="shell principles-grid">
          <header><p class="eyebrow">{{ tx('principlesEyebrow') }}</p><h2>{{ tx('principlesTitle') }}</h2></header>
          <div class="principle-list"><article><span>{{ tx('principle1Title') }}</span><p>{{ tx('principle1Text') }}</p></article><article><span>{{ tx('principle2Title') }}</span><p>{{ tx('principle2Text') }}</p></article><article><span>{{ tx('principle3Title') }}</span><p>{{ tx('principle3Text') }}</p></article><article><span>{{ tx('principle4Title') }}</span><p>{{ tx('principle4Text') }}</p></article></div>
        </div>
      </section>

      <section id="roles" class="roles shell reveal">
        <p class="eyebrow">{{ tx('rolesEyebrow') }}</p><h2>{{ tx('rolesTitle1') }}<br>{{ tx('rolesTitle2') }}</h2>
        <div class="role-grid"><article><span>{{ tx('students') }}</span><h3>{{ tx('studentTitle') }}</h3><p>{{ tx('studentText') }}</p><ul><li>{{ tx('studentPoint1') }}</li><li>{{ tx('studentPoint2') }}</li><li>{{ tx('studentPoint3') }}</li></ul></article><article><span>{{ tx('teachers') }}</span><h3>{{ tx('teacherTitle') }}</h3><p>{{ tx('teacherText') }}</p><ul><li>{{ tx('teacherPoint1') }}</li><li>{{ tx('teacherPoint2') }}</li><li>{{ tx('teacherPoint3') }}</li></ul></article></div>
      </section>

      <section class="closing shell reveal"><span class="closing-mark"/><p>CHATRA</p><h2>{{ tx('closing1') }}<br>{{ tx('closing2') }}</h2><NuxtLink class="button button-light" to="/org">{{ tx('startFree') }} <span>›</span></NuxtLink></section>
    </main>

    <footer><div class="shell footer-inner"><div><span class="brand"><span class="small-mark"/>Chatra</span><p>{{ tx('footerText') }}</p></div><nav><NuxtLink to="/privacy">{{ tx('privacy') }}</NuxtLink><NuxtLink to="/terms">{{ tx('terms') }}</NuxtLink><NuxtLink to="/rules">{{ tx('rules') }}</NuxtLink></nav><small>© {{ year }} Chatra</small></div></footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from '~/composables/useI18n'
definePageMeta({ layout:false })
type LandingLang = 'ru' | 'en' | 'kk'
const { lang, setLang } = useI18n()
const languages: { code: LandingLang; short: string; label: string }[] = [
  { code: 'ru', short: 'RU', label: 'Русский' },
  { code: 'kk', short: 'KZ', label: 'Қазақша' },
  { code: 'en', short: 'EN', label: 'English' },
]
const copy = {
  toTop: ['Наверх', 'Back to top', 'Жоғарыға'], language: ['Выбрать язык', 'Choose language', 'Тілді таңдау'],
  navAbout: ['О проекте', 'About', 'Жоба туралы'], navFeatures: ['Возможности', 'Features', 'Мүмкіндіктер'], navRoles: ['Для кого', 'For whom', 'Кімге арналған'],
  signIn: ['Войти', 'Sign in', 'Кіру'], start: ['Начать', 'Get started', 'Бастау'],
  heroEyebrow: ['ЕДИНОЕ ПРОСТРАНСТВО ДЛЯ УЧЁБЫ', 'ONE PLACE FOR LEARNING', 'ОҚУҒА АРНАЛҒАН БІРТҰТАС КЕҢІСТІК'],
  heroTitle1: ['Учёба становится', 'Learning becomes', 'Оқу үдерісі'], heroTitle2: ['понятнее.', 'clearer.', 'түсініктірек.'],
  heroText: ['Chatra объединяет предметы, материалы, задания и обратную связь. Всё нужное — в одном спокойном интерфейсе.', 'Chatra brings subjects, materials, assignments and feedback together. Everything you need in one calm interface.', 'Chatra пәндерді, материалдарды, тапсырмалар мен кері байланысты біріктіреді. Қажеттінің бәрі — бір ыңғайлы интерфейсте.'],
  tryChatra: ['Попробовать Chatra', 'Try Chatra', 'Chatra-ны қолданып көру'], learnMore: ['Узнать о проекте', 'Learn about the project', 'Жоба туралы білу'], heroMeta: ['Для студентов и преподавателей · RU / KZ / EN', 'For students and teachers · RU / KZ / EN', 'Студенттер мен оқытушыларға · RU / KZ / EN'],
  word1: ['Учиться.', 'Learn.', 'Оқу.'], word2: ['Создавать.', 'Create.', 'Жасау.'], word3: ['Развиваться.', 'Grow.', 'Даму.'],
  aboutEyebrow: ['О ПРОЕКТЕ', 'ABOUT', 'ЖОБА ТУРАЛЫ'], aboutTitle1: ['Один предмет.', 'One subject.', 'Бір пән.'], aboutTitle2: ['Один контекст.', 'One context.', 'Бір контекст.'],
  aboutText: ['Обычно учебные материалы разбросаны по чатам, дискам и разным сервисам. Chatra собирает весь процесс вокруг предмета: от первой лекции до итоговой оценки.', 'Study materials are often scattered across chats, drives and different services. Chatra brings the whole process together around a subject, from the first lecture to the final grade.', 'Оқу материалдары көбіне чаттарда, дискілерде және түрлі сервистерде шашырап жатады. Chatra бүкіл үдерісті бір пәннің айналасына жинайды: алғашқы дәрістен қорытынды бағаға дейін.'],
  fact1: ['Материалы не теряются', 'Materials stay organized', 'Материалдар жоғалмайды'], fact2: ['Сроки всегда видны', 'Deadlines stay visible', 'Мерзімдер әрдайым көрінеді'], fact3: ['Обратная связь рядом с работой', 'Feedback stays with the work', 'Кері байланыс жұмыспен бірге'],
  subjectCardLabel: ['Карточка предмета из Chatra', 'A subject card from Chatra', 'Chatra пәнінің карточкасы'], lessons12: ['12 уроков', '12 lessons', '12 сабақ'], physics: ['Основы физики', 'Physics Fundamentals', 'Физика негіздері'],
  physicsDescription: ['Механика, движение и законы сохранения', 'Mechanics, motion and conservation laws', 'Механика, қозғалыс және сақталу заңдары'], teacherLessons: ['Д. Садыкова · 12 уроков', 'D. Sadykova · 12 lessons', 'Д. Садықова · 12 сабақ'], openCourse: ['Открыть курс', 'Open course', 'Курсты ашу'],
  featuresEyebrow: ['ВОЗМОЖНОСТИ', 'FEATURES', 'МҮМКІНДІКТЕР'], featuresTitle1: ['Всё необходимое.', 'Everything you need.', 'Қажеттінің бәрі.'], featuresTitle2: ['Ничего лишнего.', 'Nothing extra.', 'Артық ештеңе жоқ.'], featuresText: ['Chatra следует знакомой логике учебного процесса и не требует осваивать сложную систему.', 'Chatra follows a familiar learning flow, with no complex system to master.', 'Chatra таныс оқу логикасына сүйенеді және күрделі жүйені меңгеруді талап етпейді.'],
  feature1Title: ['Предметы и материалы', 'Subjects and materials', 'Пәндер мен материалдар'], feature1Text: ['Лекции, документы и презентации хранятся внутри конкретного предмета, а не в бесконечной ленте сообщений.', 'Lectures, documents and presentations stay inside their subject instead of an endless message feed.', 'Дәрістер, құжаттар мен презентациялар шексіз хабарламалар таспасында емес, өз пәнінің ішінде сақталады.'],
  feature2Title: ['Задания и сроки', 'Assignments and deadlines', 'Тапсырмалар мен мерзімдер'], feature2Text: ['У каждой работы есть понятный статус, дедлайн и критерии. Студент знает следующий шаг, преподаватель видит общую картину.', 'Every assignment has a clear status, deadline and criteria. Students know the next step, while teachers see the whole picture.', 'Әр жұмыстың түсінікті мәртебесі, мерзімі және критерийлері бар. Студент келесі қадамды біледі, ал оқытушы жалпы көріністі көреді.'], feature2Tag: ['Сдать · Проверить', 'Submit · Review', 'Тапсыру · Тексеру'],
  feature3Title: ['Работа с лекциями', 'Working with lectures', 'Дәрістермен жұмыс'], feature3Text: ['Материалы открываются прямо в Chatra. Важные фрагменты можно выделить и сохранить рядом с документом.', 'Materials open right in Chatra. Important passages can be highlighted and saved beside the document.', 'Материалдар Chatra ішінде ашылады. Маңызды үзінділерді белгілеп, құжаттың жанында сақтауға болады.'], feature3Tag: ['Читать · Выделять', 'Read · Highlight', 'Оқу · Белгілеу'],
  feature4Title: ['Помощь по предмету', 'Subject assistance', 'Пән бойынша көмек'], feature4Text: ['Ассистент отвечает в контексте материалов курса, чтобы объяснение оставалось связано с темой и источником.', 'The assistant answers in the context of course materials, keeping explanations connected to the topic and source.', 'Көмекші курс материалдарының контексінде жауап береді, сондықтан түсіндірме тақырып пен дереккөзге байланысты болады.'], feature4Tag: ['Спросить · Разобраться', 'Ask · Understand', 'Сұрау · Түсіну'],
  interfaceEyebrow: ['ИНТЕРФЕЙС CHATRA', 'THE CHATRA INTERFACE', 'CHATRA ИНТЕРФЕЙСІ'], interfaceTitle: ['Внутри предмета всё на своём месте.', 'Everything has its place inside a subject.', 'Пән ішінде бәрі өз орнында.'], interfaceText: ['Сегментированные вкладки, строки материалов и статусы повторяют реальные компоненты приложения — без рекламных макетов и выдуманных экранов.', 'Segmented tabs, material rows and statuses mirror the real app components—no marketing mockups or imaginary screens.', 'Бөлімді қойындылар, материал жолдары мен мәртебелер қолданбаның нақты компоненттерін көрсетеді — жарнамалық макеттерсіз және ойдан шығарылған экрандарсыз.'],
  interfacePoint1: ['Лекции и файлы сгруппированы в одном списке', 'Lectures and files share one organized list', 'Дәрістер мен файлдар бір тізімге топтастырылған'], interfacePoint2: ['Задания показывают срок и состояние', 'Assignments show both deadline and status', 'Тапсырмалар мерзімі мен күйін көрсетеді'], interfacePoint3: ['Переключение не уводит со страницы предмета', 'Switching views keeps you on the subject page', 'Ауыстыру пән бетінен шығармайды'],
  coursePanelLabel: ['Экран предмета из Chatra', 'A subject screen from Chatra', 'Chatra пәнінің экраны'], actions: ['Действия', 'Actions', 'Әрекеттер'],
  lecture2: ['Лекция 2 · Динамика', 'Lecture 2 · Dynamics', '2-дәріс · Динамика'], seminarNotes: ['Конспект семинара', 'Seminar notes', 'Семинар конспектісі'], newtonSlides: ['Слайды · Законы Ньютона', "Slides · Newton's laws", 'Слайдтар · Ньютон заңдары'],
  lab2: ['Лабораторная работа №2', 'Lab assignment No. 2', '№2 зертханалық жұмыс'], labMeta: ['Завтра, 18:00 · 20 баллов', 'Tomorrow, 18:00 · 20 points', 'Ертең, 18:00 · 20 ұпай'], inProgress: ['В работе', 'In progress', 'Орындалуда'], mechanicsTest: ['Тест по механике', 'Mechanics test', 'Механика тесті'], testMeta: ['15 баллов · 13/15', '15 points · 13/15', '15 ұпай · 13/15'], done: ['Готово', 'Done', 'Дайын'],
  courseQuestions: ['Вопросы по предмету', 'Questions about the subject', 'Пән бойынша сұрақтар'], assistantText: ['Ответы основаны на материалах курса.', 'Answers are based on course materials.', 'Жауаптар курс материалдарына негізделген.'], askCourse: ['Спросить по предмету', 'Ask about the subject', 'Пән бойынша сұрау'],
  principlesEyebrow: ['ПРИНЦИПЫ', 'PRINCIPLES', 'ҚАҒИДАЛАР'], principlesTitle: ['Спокойный продукт для реальной учёбы.', 'A calm product for real learning.', 'Нақты оқуға арналған жайлы өнім.'], principle1Title: ['Понятность', 'Clarity', 'Түсініктілік'], principle1Text: ['Каждый экран отвечает на один вопрос и показывает следующее действие.', 'Each screen answers one question and makes the next action clear.', 'Әр экран бір сұраққа жауап беріп, келесі әрекетті көрсетеді.'], principle2Title: ['Связность', 'Continuity', 'Байланыстылық'], principle2Text: ['Материалы, задания и результаты остаются внутри контекста предмета.', 'Materials, assignments and results remain within the subject context.', 'Материалдар, тапсырмалар мен нәтижелер пән контексінде қалады.'], principle3Title: ['Ответственность', 'Responsibility', 'Жауапкершілік'], principle3Text: ['Технология помогает с рутиной, а учебные решения остаются за человеком.', 'Technology helps with routine work, while academic decisions remain human.', 'Технология күнделікті жұмысты жеңілдетеді, ал оқу шешімдерін адам қабылдайды.'], principle4Title: ['Доступность', 'Accessibility', 'Қолжетімділік'], principle4Text: ['Системная типографика, три языка и адаптация под телефон и компьютер.', 'System typography, three languages, and layouts for phone and desktop.', 'Жүйелік типографика, үш тіл және телефон мен компьютерге бейімделу.'],
  rolesEyebrow: ['ДЛЯ КОГО', 'FOR WHOM', 'КІМГЕ АРНАЛҒАН'], rolesTitle1: ['Один процесс.', 'One process.', 'Бір үдеріс.'], rolesTitle2: ['Два понятных сценария.', 'Two clear paths.', 'Екі түсінікті сценарий.'], students: ['СТУДЕНТАМ', 'FOR STUDENTS', 'СТУДЕНТТЕРГЕ'], studentTitle: ['Сосредоточиться на учёбе', 'Focus on learning', 'Оқуға назар аудару'], studentText: ['Открывайте материалы, следите за сроками, сдавайте работы и получайте обратную связь там же.', 'Open materials, track deadlines, submit work and receive feedback in the same place.', 'Материалдарды ашып, мерзімдерді бақылап, жұмыстарды тапсырып, кері байланысты бір жерден алыңыз.'], studentPoint1: ['Все предметы в одном каталоге', 'All subjects in one catalog', 'Барлық пән бір каталогта'], studentPoint2: ['Дедлайны и статусы без поиска по чатам', 'Deadlines and statuses without searching chats', 'Мерзімдер мен мәртебелерді чаттан іздеудің қажеті жоқ'], studentPoint3: ['Оценка рядом с выполненной работой', 'The grade stays beside the submitted work', 'Баға орындалған жұмыстың жанында'],
  teachers: ['ПРЕПОДАВАТЕЛЯМ', 'FOR TEACHERS', 'ОҚЫТУШЫЛАРҒА'], teacherTitle: ['Организовать предмет', 'Organize a subject', 'Пәнді ұйымдастыру'], teacherText: ['Публикуйте лекции и задания, задавайте критерии и управляйте учебными потоками.', 'Publish lectures and assignments, set criteria and manage class cohorts.', 'Дәрістер мен тапсырмаларды жариялап, критерийлерді белгілеңіз және оқу топтарын басқарыңыз.'], teacherPoint1: ['Материалы и задания в одной структуре', 'Materials and assignments in one structure', 'Материалдар мен тапсырмалар бір құрылымда'], teacherPoint2: ['Критерии, сроки и наборы студентов', 'Criteria, deadlines and student groups', 'Критерийлер, мерзімдер және студент топтары'], teacherPoint3: ['Проверка и итоговое решение', 'Review and final decision', 'Тексеру және қорытынды шешім'],
  closing1: ['Учебный процесс', 'The learning process', 'Оқу үдерісі'], closing2: ['может быть проще.', 'can be simpler.', 'оңайырақ болуы мүмкін.'], startFree: ['Начать бесплатно', 'Start for free', 'Тегін бастау'], footerText: ['Цифровое пространство для учёбы.', 'A digital space for learning.', 'Оқуға арналған цифрлық кеңістік.'], privacy: ['Конфиденциальность', 'Privacy', 'Құпиялылық'], terms: ['Условия', 'Terms', 'Шарттар'], rules: ['Правила', 'Guidelines', 'Ережелер'],
} as const
const languageIndex = computed(() => lang.value === 'en' ? 1 : lang.value === 'kk' ? 2 : 0)
const currentLanguageShort = computed(() => languages.find(item => item.code === lang.value)?.short || 'RU')
const tx = (key: keyof typeof copy) => copy[key][languageIndex.value]
const tabs = computed(() => lang.value === 'en' ? ['Lectures','Assignments','AI chat'] : lang.value === 'kk' ? ['Дәрістер','Тапсырмалар','ЖИ-чат'] : ['Лекции','Задания','ИИ-чат'])
const langMenu = ref<HTMLDetailsElement | null>(null)
const chooseLanguage = (next: LandingLang) => { setLang(next); if (langMenu.value) langMenu.value.open = false }
useHead(computed(() => ({
  htmlAttrs: { lang: lang.value === 'kk' ? 'kk' : lang.value },
  title: lang.value === 'en' ? 'Chatra — everything for learning in one place' : lang.value === 'kk' ? 'Chatra — оқу үшін бәрі бір жерде' : 'Chatra — всё для учёбы в одном месте',
  meta: [{ name:'description', content: lang.value === 'en' ? 'Chatra brings subjects, materials, assignments and feedback together in one place.' : lang.value === 'kk' ? 'Chatra пәндерді, материалдарды, тапсырмалар мен кері байланысты бір кеңістікте біріктіреді.' : 'Chatra объединяет предметы, материалы, задания и обратную связь в одном пространстве.' }],
})))
const activeTab=ref(0); const scrolled=ref(false); const year=new Date().getFullYear()
const toTop=()=>window.scrollTo({top:0,behavior:'smooth'}); const onScroll=()=>{scrolled.value=window.scrollY>16}; let observer:IntersectionObserver|null=null
onMounted(()=>{document.documentElement.style.overflow='auto';document.body.style.overflow='auto';window.addEventListener('scroll',onScroll,{passive:true});observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.1});document.querySelectorAll('.reveal').forEach(el=>observer?.observe(el))})
onUnmounted(()=>{window.removeEventListener('scroll',onScroll);observer?.disconnect();document.documentElement.style.overflow='';document.body.style.overflow=''})
</script>

<style scoped>
.landing{--page:#f5f5f7;--ink:#1d1d1f;--muted:#6e6e73;--line:rgba(60,60,67,.11);--teal:#00b1c9;min-height:100vh;background:var(--page);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif;overflow-x:hidden}.shell{width:min(1160px,calc(100% - 48px));margin-inline:auto}.site-nav{position:fixed;z-index:30;inset:0 0 auto;height:76px;display:flex;align-items:center;transition:height .3s cubic-bezier(.22,1,.36,1),background .25s,border-color .25s}.site-nav.scrolled{height:60px;background:rgba(245,245,247,.78);border-bottom:1px solid rgba(29,29,31,.06);-webkit-backdrop-filter:blur(22px) saturate(180%);backdrop-filter:blur(22px) saturate(180%)}.nav-inner{width:min(1160px,calc(100% - 48px));margin:auto;display:flex;align-items:center;gap:32px}.brand{display:flex;align-items:center;gap:9px;color:var(--ink);font-size:17px;font-weight:750;letter-spacing:-.02em}.brand-mark,.small-mark,.hero-mark,.closing-mark{display:block;background:var(--teal);-webkit-mask:url('/logo-icon.png') center/contain no-repeat;mask:url('/logo-icon.png') center/contain no-repeat}.brand-mark{width:27px;height:29px}.small-mark{width:22px;height:23px}.nav-inner nav{display:flex;gap:30px;margin-left:auto}.nav-inner nav a,.sign-in{color:#515154;font-size:13px;font-weight:560}.nav-inner nav a:hover,.sign-in:hover{color:#000}.nav-actions{display:flex;align-items:center;gap:17px}.language-picker{position:relative}.language-picker summary{display:flex;align-items:center;gap:4px;min-height:34px;padding:0 10px;border:1px solid rgba(60,60,67,.13);border-radius:999px;background:rgba(255,255,255,.55);color:#515154;font-size:11px;font-weight:720;letter-spacing:.04em;cursor:pointer;list-style:none;transition:background .16s,transform .1s}.language-picker summary::-webkit-details-marker{display:none}.language-picker summary:hover{background:#fff}.language-picker summary:active{transform:scale(.96)}.language-picker summary svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.6;transition:transform .2s}.language-picker[open] summary svg{transform:rotate(180deg)}.language-menu{position:absolute;top:calc(100% + 9px);right:0;width:180px;padding:6px;border:1px solid rgba(60,60,67,.12);border-radius:15px;background:rgba(255,255,255,.92);box-shadow:0 16px 42px rgba(29,29,31,.16);-webkit-backdrop-filter:blur(22px) saturate(180%);backdrop-filter:blur(22px) saturate(180%);transform-origin:top right;animation:language-menu-in .18s cubic-bezier(.22,1,.36,1)}@keyframes language-menu-in{from{opacity:0;transform:scale(.96) translateY(-3px)}to{opacity:1;transform:none}}.language-menu button{width:100%;min-height:39px;display:grid;grid-template-columns:29px 1fr auto;align-items:center;padding:0 10px;border-radius:10px;color:#3a3a3c;text-align:left;font-size:12px}.language-menu button:hover,.language-menu button.active{background:#f2f2f7}.language-menu button span{color:#8e8e93;font-size:9px;font-weight:760;letter-spacing:.06em}.language-menu button b{color:#00899c}.button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 24px;border-radius:999px;background:var(--teal);color:#fff;font-size:14px;font-weight:650;letter-spacing:-.01em;transition:transform .12s,background .18s,box-shadow .2s}.button:hover{background:#009aaf;box-shadow:0 8px 22px rgba(0,132,150,.16)}.button:active{transform:scale(.97)}.button-small{min-height:38px;padding:0 18px;font-size:13px}.button-large{min-height:52px;font-size:15px}.button-light{background:#fff;color:#111113}.button-light:hover{background:#f2f2f7}
.hero{min-height:860px;display:grid;grid-template-columns:1.2fr .8fr;align-items:center;gap:80px;padding-top:76px}.eyebrow{color:#007f91;font-size:11px;font-weight:760;letter-spacing:.14em}.hero h1{margin-top:19px;font-size:clamp(56px,7vw,88px);line-height:.96;letter-spacing:-.064em}.hero h1 span{color:#86868b}.hero-text{max-width:630px;margin-top:27px;color:var(--muted);font-size:20px;line-height:1.5;letter-spacing:-.018em}.hero-actions{display:flex;align-items:center;gap:24px;margin-top:34px}.quiet-link{color:#007f91;font-size:14px;font-weight:620}.quiet-link span{display:inline-block;transition:transform .2s}.quiet-link:hover span{transform:translateX(3px)}.hero-meta{margin-top:18px;color:#8e8e93;font-size:11px}.hero-wordmark{display:flex;flex-direction:column;align-items:flex-start;gap:30px;padding-left:40px;border-left:1px solid var(--line)}.hero-mark{width:82px;height:86px}.hero-wordmark div{color:#8e8e93;font-size:26px;font-weight:650;line-height:1.35;letter-spacing:-.035em}
.about{display:grid;grid-template-columns:1fr 430px;gap:110px;align-items:center;padding:125px 0}.about-copy h2,.section-heading h2,.product-copy h2,.principles h2,.roles>h2{margin-top:18px;font-size:clamp(40px,5vw,62px);line-height:1.03;letter-spacing:-.052em}.about-copy>p:nth-of-type(2){max-width:620px;margin-top:24px;color:var(--muted);font-size:18px;line-height:1.62}.about-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:42px}.about-facts div{padding-top:14px;border-top:1px solid var(--line)}.about-facts strong{display:block;color:#8e8e93;font-size:10px;letter-spacing:.1em}.about-facts span{display:block;margin-top:9px;font-size:12px;line-height:1.45}.real-card-wrap{padding:18px;border-radius:32px;background:rgba(255,255,255,.55);border:1px solid #fff}.class-card{overflow:hidden;border:1px solid rgba(60,60,67,.12);border-radius:24px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.04),0 18px 44px rgba(28,28,30,.1)}.card-cover{height:220px;margin:8px 8px 0;overflow:hidden;border-radius:17px;background:linear-gradient(145deg,#087386,#00b1c9)}.cover-art{height:100%;display:grid;place-items:center;position:relative;color:#fff}.cover-art>span{font:italic 84px Georgia;opacity:.85}.cover-art i{position:absolute;top:12px;left:12px;padding:6px 9px;border-radius:999px;background:rgba(28,28,30,.38);border:1px solid rgba(255,255,255,.18);font-size:9px;font-style:normal;font-weight:700}.card-body{padding:19px 20px}.card-body h3{font-size:18px;font-weight:750;letter-spacing:-.025em}.card-body p{margin-top:7px;color:#6e6e73;font-size:13px;line-height:1.45}.card-body>small{display:block;margin-top:10px;color:#8e8e93;font-size:11px}.card-footer{display:flex;align-items:center;justify-content:space-between;margin-top:15px;padding-top:13px;border-top:1px solid var(--line);color:#009aaf;font-size:13px;font-weight:650}
.features-section{padding:135px 0;background:#fff}.section-heading{text-align:center}.section-heading>p:last-child{max-width:630px;margin:22px auto 0;color:var(--muted);font-size:17px;line-height:1.6}.feature-list{margin-top:75px;border-top:1px solid var(--line)}.feature-list article{display:grid;grid-template-columns:70px 1fr auto;align-items:center;gap:30px;padding:31px 0;border-bottom:1px solid var(--line)}.feature-list article>span{color:#a1a1a6;font-size:11px;font-weight:700;letter-spacing:.08em}.feature-list h3{font-size:22px;letter-spacing:-.025em}.feature-list p{max-width:650px;margin-top:6px;color:var(--muted);font-size:14px;line-height:1.55}.feature-list i{color:#8e8e93;font-size:10px;font-style:normal;font-weight:650;letter-spacing:.04em}
.product-section{display:grid;grid-template-columns:.75fr 1.25fr;align-items:center;gap:80px;padding:140px 0}.product-copy>p:nth-of-type(2){margin-top:22px;color:var(--muted);font-size:16px;line-height:1.62}.product-copy ul{display:flex;flex-direction:column;gap:12px;margin-top:27px;list-style:none}.product-copy li{display:flex;gap:10px;font-size:13px;line-height:1.45}.product-copy li::before{content:'✓';width:20px;height:20px;display:grid;place-items:center;flex:none;border-radius:50%;background:#e6f9fb;color:#00899c;font-size:10px;font-weight:800}.course-panel{overflow:hidden;border:1px solid rgba(60,60,67,.1);border-radius:27px;background:#fff;box-shadow:0 18px 54px rgba(35,43,50,.11)}.course-cover{height:126px;display:flex;align-items:center;gap:15px;padding:27px;background:linear-gradient(145deg,#087386,#00b1c9);color:#fff}.course-glyph{width:59px;height:59px;display:grid;place-items:center;border-radius:18px;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.2);font:italic 37px Georgia}.course-cover>div:nth-child(2){display:flex;flex-direction:column;gap:4px}.course-cover strong{font-size:19px}.course-cover small{font-size:10px;opacity:.75}.course-cover>button{margin-left:auto;color:#fff;font-size:18px;letter-spacing:.08em}.tabs-bar{position:relative;display:flex;margin:16px 18px 0;padding:3px;border-radius:12px;background:#e5e5ea}.tabs-indicator{position:absolute;inset:3px auto 3px 3px;width:calc((100% - 6px)/3);border-radius:9px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.12);transition:transform .3s cubic-bezier(.22,1,.36,1)}.tabs-bar button{z-index:1;flex:1;min-height:38px;display:flex;align-items:center;justify-content:center;gap:6px;color:#77777c;font-size:12px;font-weight:620}.tabs-bar button.active{color:#1d1d1f;font-weight:700}.tabs-bar small{padding:1px 6px;border-radius:99px;background:#d1d1d6;font-size:9px}.tabs-bar button.active small{background:#e6f9fb;color:#00899c}.course-content{min-height:278px;padding:16px 18px 20px}.item-list{overflow:hidden;border:1px solid var(--line);border-radius:17px}.item-row,.assignment-row{width:100%;display:flex;align-items:center;gap:12px;min-height:72px;padding:10px 15px;text-align:left;background:#fff}.item-row+.item-row,.assignment-row+.assignment-row{border-top:1px solid rgba(60,60,67,.08)}.item-row:hover,.assignment-row:hover{background:rgba(60,60,67,.035)}.item-row>span,.assignment-row>span:nth-child(2){display:flex;flex:1;flex-direction:column;gap:4px}.item-row b,.assignment-row b{font-size:12px}.item-row small,.assignment-row small{color:#8e8e93;font-size:9px}.item-row>svg{width:16px;height:16px;color:#a1a1a6;fill:none;stroke:currentColor;stroke-width:2}.assignment-icon{width:40px;height:40px!important;display:grid!important;place-items:center!important;flex:none!important;border-radius:12px;background:#eeeef1;color:#6e6e73}.assignment-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8}.assignment-icon.complete{background:#eaf8ef;color:#228a48}.assignment-row em{padding:6px 9px;border-radius:99px;background:#fff3d7;color:#986800;font-size:9px;font-style:normal;font-weight:700}.assignment-row em.complete{background:#eaf8ef;color:#228a48}.assistant-empty{min-height:242px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.assistant-empty>span{width:43px;height:43px;display:grid;place-items:center;border-radius:14px;background:#e6f9fb;color:#00899c}.assistant-empty svg{width:22px;height:22px;fill:currentColor}.assistant-empty h4{margin-top:12px;font-size:14px}.assistant-empty p{margin-top:5px;color:#8e8e93;font-size:10px}.assistant-empty>div{width:min(330px,100%);display:flex;justify-content:space-between;align-items:center;margin-top:25px;padding:8px 8px 8px 13px;border:1px solid var(--line);border-radius:14px;color:#a1a1a6;font-size:10px}.assistant-empty>div b{width:29px;height:29px;display:grid;place-items:center;border-radius:50%;background:var(--teal);color:#fff;font-size:16px}
.principles{padding:130px 0;background:#1d1d1f;color:#fff}.principles .eyebrow{color:#61d2df}.principles-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:110px}.principle-list{border-top:1px solid #3a3a3c}.principle-list article{display:grid;grid-template-columns:150px 1fr;gap:25px;padding:25px 0;border-bottom:1px solid #3a3a3c}.principle-list span{font-size:14px;font-weight:700}.principle-list p{color:#a1a1a6;font-size:13px;line-height:1.55}
.roles{padding:140px 0;text-align:center}.role-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:62px;text-align:left}.role-grid article{padding:40px;border:1px solid var(--line);border-radius:28px;background:#fff}.role-grid article>span{color:#00899c;font-size:10px;font-weight:750;letter-spacing:.12em}.role-grid h3{margin-top:20px;font-size:27px;letter-spacing:-.035em}.role-grid p{margin-top:13px;color:var(--muted);font-size:14px;line-height:1.6}.role-grid ul{display:flex;flex-direction:column;gap:12px;margin-top:25px;padding-top:23px;border-top:1px solid var(--line);list-style:none}.role-grid li{font-size:12px}.role-grid li::before{content:'—';margin-right:9px;color:#a1a1a6}.closing{margin-bottom:120px;padding:88px 30px;border-radius:34px;background:linear-gradient(rgba(20,20,20,.48),rgba(20,20,20,.48)),url('/chatra-study-cta.png') center/cover no-repeat;color:#fff;text-align:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 24px 70px rgba(29,29,31,.14)}.closing-mark{width:49px;height:52px;margin:auto;background:#fff}.closing>p{margin-top:16px;color:rgba(255,255,255,.72);font-size:10px;font-weight:750;letter-spacing:.16em}.closing h2{margin:17px 0 30px;font-size:clamp(42px,5vw,64px);line-height:1.02;letter-spacing:-.052em;text-shadow:0 2px 22px rgba(0,0,0,.34)}footer{background:#fff;border-top:1px solid var(--line)}.footer-inner{min-height:170px;display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:48px}.footer-inner>div p{margin-top:8px;color:#8e8e93;font-size:10px}.footer-inner nav{display:flex;gap:24px;color:#6e6e73;font-size:10px}.footer-inner>small{color:#a1a1a6;font-size:9px}.reveal{opacity:0;transform:translateY(20px);transition:opacity .65s ease,transform .65s cubic-bezier(.22,1,.36,1)}.reveal.visible{opacity:1;transform:none}.fade-enter-active,.fade-leave-active{transition:opacity .16s ease,transform .18s ease}.fade-enter-from{opacity:0;transform:translateY(3px)}.fade-leave-to{opacity:0;transform:translateY(-3px)}
@media(max-width:980px){.hero{grid-template-columns:1fr;min-height:auto;padding-top:170px;padding-bottom:110px}.hero-wordmark{display:none}.about{grid-template-columns:1fr;gap:55px}.real-card-wrap{width:min(430px,100%);margin:auto}.product-section{grid-template-columns:1fr;gap:55px}.product-copy{max-width:680px}.principles-grid{grid-template-columns:1fr;gap:55px}}
@media(max-width:720px){.shell,.nav-inner{width:calc(100% - 32px)}.site-nav{height:64px}.site-nav.scrolled{height:56px}.nav-inner nav,.sign-in{display:none}.nav-actions{margin-left:auto;gap:9px}.language-picker summary{min-height:36px}.hero{padding-top:135px;padding-bottom:85px}.hero h1{font-size:clamp(43px,13vw,62px)}.hero-text{font-size:17px}.hero-actions{flex-direction:column;align-items:flex-start;gap:18px}.about{padding:85px 0}.about-copy h2,.section-heading h2,.product-copy h2,.principles h2,.roles>h2{font-size:38px}.about-copy>p:nth-of-type(2){font-size:16px}.about-facts{grid-template-columns:1fr}.features-section{padding:90px 0}.feature-list{margin-top:48px}.feature-list article{grid-template-columns:38px 1fr;gap:15px;padding:25px 0}.feature-list article>i{grid-column:2}.feature-list h3{font-size:19px}.product-section{padding:90px 0}.course-cover{height:108px;padding:20px}.course-glyph{width:48px;height:48px;font-size:30px}.course-cover strong{font-size:16px}.course-cover button{display:none}.tabs-bar{margin-inline:11px}.tabs-bar button{font-size:10px}.tabs-bar small{display:none}.course-content{padding-inline:11px}.item-row,.assignment-row{padding-inline:11px}.principles{padding:90px 0}.principle-list article{grid-template-columns:1fr;gap:8px}.roles{padding:90px 0}.role-grid{grid-template-columns:1fr;margin-top:45px}.role-grid article{padding:30px 25px}.closing{width:calc(100% - 24px);margin-bottom:80px;padding:70px 20px;border-radius:27px}.footer-inner{display:flex;flex-direction:column;align-items:flex-start;gap:22px;padding:38px 0}.footer-inner nav{flex-wrap:wrap}}
@media(max-width:420px){.hero h1{font-size:40px}.about-copy h2,.section-heading h2,.product-copy h2,.principles h2,.roles>h2{font-size:34px}.real-card-wrap{padding:9px;border-radius:26px}.card-cover{height:185px}.course-cover>div:nth-child(2){min-width:0}.item-row b,.assignment-row b{font-size:11px}.assignment-row em{display:none}}
@media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none}.reveal,.site-nav,.tabs-indicator,.fade-enter-active,.fade-leave-active{transition:none}.button:active{transform:none}}
@media(prefers-reduced-transparency:reduce){.site-nav.scrolled{background:#f5f5f7;backdrop-filter:none}}
.card-cover{position:relative}
.landing-cover{position:absolute;inset:0}
.cover-count{position:absolute;left:12px;bottom:12px;padding:6px 10px;border-radius:999px;background:rgba(28,28,30,.42);border:1px solid rgba(255,255,255,.2);color:#fff;font-size:9px;font-weight:700;letter-spacing:.02em;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.course-cover{position:relative;overflow:hidden;align-items:flex-end}
.course-cover-photo{position:absolute!important;inset:0;z-index:0}
.course-cover-shade{position:absolute!important;z-index:1;inset:0;background:linear-gradient(180deg,rgba(12,22,24,.02) 28%,rgba(12,22,24,.64) 100%);pointer-events:none}
.course-cover-title{position:relative;z-index:2;display:flex;flex-direction:column;gap:4px;text-shadow:0 1px 8px rgba(0,0,0,.35)}
.course-cover>button{position:relative;z-index:2}
.product-copy h2{font-size:clamp(38px,4.2vw,54px)}
.item-copy{display:flex;flex:1;min-width:0;flex-direction:column;gap:4px}
.item-row>:deep(.fti){display:inline-flex!important;flex:0 0 auto!important;width:42px!important;height:42px!important}
</style>
