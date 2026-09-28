<template>
  <div class="landing">
    <header :class="['site-nav', { scrolled }]">
      <div class="nav-inner">
        <button class="brand" type="button" aria-label="Наверх" @click="toTop"><span class="brand-mark"/>Chatra</button>
        <nav><a href="#about">О проекте</a><a href="#features">Возможности</a><a href="#roles">Для кого</a></nav>
        <div class="nav-actions"><NuxtLink class="sign-in" to="/login">Войти</NuxtLink><NuxtLink class="button button-small" to="/org">Начать</NuxtLink></div>
      </div>
    </header>

    <main>
      <section class="hero shell">
        <div class="hero-copy">
          <p class="eyebrow">ЕДИНОЕ ПРОСТРАНСТВО ДЛЯ УЧЁБЫ</p>
          <h1>Учёба становится<br><span>понятнее.</span></h1>
          <p class="hero-text">Chatra объединяет предметы, материалы, задания и обратную связь. Всё нужное — в одном спокойном интерфейсе.</p>
          <div class="hero-actions"><NuxtLink class="button button-large" to="/org">Попробовать Chatra <span>→</span></NuxtLink><a class="quiet-link" href="#about">Узнать о проекте <span>›</span></a></div>
          <p class="hero-meta">Для студентов и преподавателей · RU / KZ / EN</p>
        </div>
        <div class="hero-wordmark" aria-hidden="true"><span class="hero-mark"/><div>Учиться.<br>Создавать.<br>Развиваться.</div></div>
      </section>

      <section id="about" class="about shell reveal">
        <div class="about-copy">
          <p class="eyebrow">О ПРОЕКТЕ</p>
          <h2>Один предмет.<br>Один контекст.</h2>
          <p>Обычно учебные материалы разбросаны по чатам, дискам и разным сервисам. Chatra собирает весь процесс вокруг предмета: от первой лекции до итоговой оценки.</p>
          <div class="about-facts"><div><strong>01</strong><span>Материалы не теряются</span></div><div><strong>02</strong><span>Сроки всегда видны</span></div><div><strong>03</strong><span>Обратная связь рядом с работой</span></div></div>
        </div>

        <div class="real-card-wrap" aria-label="Карточка предмета из Chatra">
          <article class="class-card">
            <div class="card-cover">
              <SubjectCover src="/chatra-physics-cover.png" cover-source="ai_hero" class="landing-cover">
                <span class="cover-count">12 уроков</span>
              </SubjectCover>
            </div>
            <div class="card-body">
              <h3>Основы физики</h3>
              <p>Механика, движение и законы сохранения</p>
              <small>Д. Садыкова · 12 уроков</small>
              <div class="card-footer"><span>Открыть курс</span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="m9 18 6-6-6-6"/></svg></div>
            </div>
          </article>
        </div>
      </section>

      <section id="features" class="features-section reveal">
        <div class="shell">
          <header class="section-heading"><p class="eyebrow">ВОЗМОЖНОСТИ</p><h2>Всё необходимое.<br>Ничего лишнего.</h2><p>Chatra следует знакомой логике учебного процесса и не требует осваивать сложную систему.</p></header>
          <div class="feature-list">
            <article><span>01</span><div><h3>Предметы и материалы</h3><p>Лекции, документы и презентации хранятся внутри конкретного предмета, а не в бесконечной ленте сообщений.</p></div><i>PDF · DOCX · PPTX</i></article>
            <article><span>02</span><div><h3>Задания и сроки</h3><p>У каждой работы есть понятный статус, дедлайн и критерии. Студент знает следующий шаг, преподаватель видит общую картину.</p></div><i>Сдать · Проверить</i></article>
            <article><span>03</span><div><h3>Работа с лекциями</h3><p>Материалы открываются прямо в Chatra. Важные фрагменты можно выделить и сохранить рядом с документом.</p></div><i>Читать · Выделять</i></article>
            <article><span>04</span><div><h3>Помощь по предмету</h3><p>Ассистент отвечает в контексте материалов курса, чтобы объяснение оставалось связано с темой и источником.</p></div><i>Спросить · Разобраться</i></article>
          </div>
        </div>
      </section>

      <section class="product-section shell reveal">
        <div class="product-copy">
          <p class="eyebrow">ИНТЕРФЕЙС CHATRA</p>
          <h2>Внутри предмета всё на своём месте.</h2>
          <p>Сегментированные вкладки, строки материалов и статусы повторяют реальные компоненты приложения — без рекламных макетов и выдуманных экранов.</p>
          <ul><li>Лекции и файлы сгруппированы в одном списке</li><li>Задания показывают срок и состояние</li><li>Переключение не уводит со страницы предмета</li></ul>
        </div>

        <div class="course-panel" aria-label="Экран предмета из Chatra">
          <div class="course-cover">
            <SubjectCover src="/chatra-physics-cover.png" cover-source="ai_hero" class="course-cover-photo"/>
            <div class="course-cover-shade"/>
            <div class="course-cover-title"><strong>Основы физики</strong><small>Д. Садыкова</small></div>
            <button aria-label="Действия">•••</button>
          </div>
          <div class="tabs-bar">
            <span class="tabs-indicator" :style="{ transform: `translateX(${activeTab * 100}%)` }"/>
            <button v-for="(item,index) in tabs" :key="item" :class="{ active: activeTab===index }" @click="activeTab=index">{{ item }}<small v-if="index<2">{{ index===0 ? 12 : 3 }}</small></button>
          </div>
          <div class="course-content">
            <Transition name="fade" mode="out-in">
              <div v-if="activeTab===0" key="lectures" class="item-list">
                <button class="item-row"><FileTypeIcon url="lecture_02.pdf"/><span class="item-copy"><b>Лекция 2 · Динамика</b><small>PDF · 2,4 MB</small></span><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>
                <button class="item-row"><FileTypeIcon url="seminar_notes.docx"/><span class="item-copy"><b>Конспект семинара</b><small>DOCX · 480 KB</small></span><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>
                <button class="item-row"><FileTypeIcon url="newton_laws.pptx"/><span class="item-copy"><b>Слайды · Законы Ньютона</b><small>PPTX · 5,1 MB</small></span><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>
              </div>
              <div v-else-if="activeTab===1" key="assignments" class="item-list">
                <button class="assignment-row"><span class="assignment-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6"/></svg></span><span class="item-copy"><b>Лабораторная работа №2</b><small>Завтра, 18:00 · 20 баллов</small></span><em>В работе</em></button>
                <button class="assignment-row"><span class="assignment-icon complete"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span><span class="item-copy"><b>Тест по механике</b><small>15 баллов · 13/15</small></span><em class="complete">Готово</em></button>
              </div>
              <div v-else key="assistant" class="assistant-empty"><span><svg viewBox="0 0 24 24"><path d="M9 2c.4 3.2 1.8 4.6 5 5-3.2.4-4.6 1.8-5 5-.4-3.2-1.8-4.6-5-5 3.2-.4 4.6-1.8 5-5Z"/><path d="M17.5 12c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7 1 3-3Z"/></svg></span><h4>Вопросы по предмету</h4><p>Ответы основаны на материалах курса.</p><div>Спросить по предмету <b>↑</b></div></div>
            </Transition>
          </div>
        </div>
      </section>

      <section class="principles reveal">
        <div class="shell principles-grid">
          <header><p class="eyebrow">ПРИНЦИПЫ</p><h2>Спокойный продукт для реальной учёбы.</h2></header>
          <div class="principle-list"><article><span>Понятность</span><p>Каждый экран отвечает на один вопрос и показывает следующее действие.</p></article><article><span>Связность</span><p>Материалы, задания и результаты остаются внутри контекста предмета.</p></article><article><span>Ответственность</span><p>Технология помогает с рутиной, а учебные решения остаются за человеком.</p></article><article><span>Доступность</span><p>Системная типографика, три языка и адаптация под телефон и компьютер.</p></article></div>
        </div>
      </section>

      <section id="roles" class="roles shell reveal">
        <p class="eyebrow">ДЛЯ КОГО</p><h2>Один процесс.<br>Два понятных сценария.</h2>
        <div class="role-grid"><article><span>СТУДЕНТАМ</span><h3>Сосредоточиться на учёбе</h3><p>Открывайте материалы, следите за сроками, сдавайте работы и получайте обратную связь там же.</p><ul><li>Все предметы в одном каталоге</li><li>Дедлайны и статусы без поиска по чатам</li><li>Оценка рядом с выполненной работой</li></ul></article><article><span>ПРЕПОДАВАТЕЛЯМ</span><h3>Организовать предмет</h3><p>Публикуйте лекции и задания, задавайте критерии и управляйте учебными потоками.</p><ul><li>Материалы и задания в одной структуре</li><li>Критерии, сроки и наборы студентов</li><li>Проверка и итоговое решение</li></ul></article></div>
      </section>

      <section class="closing shell reveal"><span class="closing-mark"/><p>CHATRA</p><h2>Учебный процесс<br>может быть проще.</h2><NuxtLink class="button button-light" to="/org">Начать бесплатно <span>›</span></NuxtLink></section>
    </main>

    <footer><div class="shell footer-inner"><div><span class="brand"><span class="small-mark"/>Chatra</span><p>Цифровое пространство для учёбы.</p></div><nav><NuxtLink to="/privacy">Конфиденциальность</NuxtLink><NuxtLink to="/terms">Условия</NuxtLink><NuxtLink to="/rules">Правила</NuxtLink></nav><small>© {{ year }} Chatra</small></div></footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
definePageMeta({ layout:false })
useHead({ title:'Chatra — всё для учёбы в одном месте', meta:[{ name:'description', content:'Chatra объединяет предметы, материалы, задания и обратную связь в одном пространстве.' }] })
const tabs=['Лекции','Задания','ИИ-чат']; const activeTab=ref(0); const scrolled=ref(false); const year=new Date().getFullYear()
const toTop=()=>window.scrollTo({top:0,behavior:'smooth'}); const onScroll=()=>{scrolled.value=window.scrollY>16}; let observer:IntersectionObserver|null=null
onMounted(()=>{document.documentElement.style.overflow='auto';document.body.style.overflow='auto';window.addEventListener('scroll',onScroll,{passive:true});observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.1});document.querySelectorAll('.reveal').forEach(el=>observer?.observe(el))})
onUnmounted(()=>{window.removeEventListener('scroll',onScroll);observer?.disconnect();document.documentElement.style.overflow='';document.body.style.overflow=''})
</script>

<style scoped>
.landing{--page:#f5f5f7;--ink:#1d1d1f;--muted:#6e6e73;--line:rgba(60,60,67,.11);--teal:#00b1c9;min-height:100vh;background:var(--page);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif;overflow-x:hidden}.shell{width:min(1160px,calc(100% - 48px));margin-inline:auto}.site-nav{position:fixed;z-index:30;inset:0 0 auto;height:76px;display:flex;align-items:center;transition:height .3s cubic-bezier(.22,1,.36,1),background .25s,border-color .25s}.site-nav.scrolled{height:60px;background:rgba(245,245,247,.78);border-bottom:1px solid rgba(29,29,31,.06);-webkit-backdrop-filter:blur(22px) saturate(180%);backdrop-filter:blur(22px) saturate(180%)}.nav-inner{width:min(1160px,calc(100% - 48px));margin:auto;display:flex;align-items:center;gap:32px}.brand{display:flex;align-items:center;gap:9px;color:var(--ink);font-size:17px;font-weight:750;letter-spacing:-.02em}.brand-mark,.small-mark,.hero-mark,.closing-mark{display:block;background:var(--teal);-webkit-mask:url('/logo-icon.png') center/contain no-repeat;mask:url('/logo-icon.png') center/contain no-repeat}.brand-mark{width:27px;height:29px}.small-mark{width:22px;height:23px}.nav-inner nav{display:flex;gap:30px;margin-left:auto}.nav-inner nav a,.sign-in{color:#515154;font-size:13px;font-weight:560}.nav-inner nav a:hover,.sign-in:hover{color:#000}.nav-actions{display:flex;align-items:center;gap:17px}.button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 24px;border-radius:999px;background:var(--teal);color:#fff;font-size:14px;font-weight:650;letter-spacing:-.01em;transition:transform .12s,background .18s,box-shadow .2s}.button:hover{background:#009aaf;box-shadow:0 8px 22px rgba(0,132,150,.16)}.button:active{transform:scale(.97)}.button-small{min-height:38px;padding:0 18px;font-size:13px}.button-large{min-height:52px;font-size:15px}.button-light{background:#fff;color:#111113}.button-light:hover{background:#f2f2f7}
.hero{min-height:860px;display:grid;grid-template-columns:1.2fr .8fr;align-items:center;gap:80px;padding-top:76px}.eyebrow{color:#007f91;font-size:11px;font-weight:760;letter-spacing:.14em}.hero h1{margin-top:19px;font-size:clamp(56px,7vw,88px);line-height:.96;letter-spacing:-.064em}.hero h1 span{color:#86868b}.hero-text{max-width:630px;margin-top:27px;color:var(--muted);font-size:20px;line-height:1.5;letter-spacing:-.018em}.hero-actions{display:flex;align-items:center;gap:24px;margin-top:34px}.quiet-link{color:#007f91;font-size:14px;font-weight:620}.quiet-link span{display:inline-block;transition:transform .2s}.quiet-link:hover span{transform:translateX(3px)}.hero-meta{margin-top:18px;color:#8e8e93;font-size:11px}.hero-wordmark{display:flex;flex-direction:column;align-items:flex-start;gap:30px;padding-left:40px;border-left:1px solid var(--line)}.hero-mark{width:82px;height:86px}.hero-wordmark div{color:#8e8e93;font-size:26px;font-weight:650;line-height:1.35;letter-spacing:-.035em}
.about{display:grid;grid-template-columns:1fr 430px;gap:110px;align-items:center;padding:125px 0}.about-copy h2,.section-heading h2,.product-copy h2,.principles h2,.roles>h2{margin-top:18px;font-size:clamp(40px,5vw,62px);line-height:1.03;letter-spacing:-.052em}.about-copy>p:nth-of-type(2){max-width:620px;margin-top:24px;color:var(--muted);font-size:18px;line-height:1.62}.about-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:42px}.about-facts div{padding-top:14px;border-top:1px solid var(--line)}.about-facts strong{display:block;color:#8e8e93;font-size:10px;letter-spacing:.1em}.about-facts span{display:block;margin-top:9px;font-size:12px;line-height:1.45}.real-card-wrap{padding:18px;border-radius:32px;background:rgba(255,255,255,.55);border:1px solid #fff}.class-card{overflow:hidden;border:1px solid rgba(60,60,67,.12);border-radius:24px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.04),0 18px 44px rgba(28,28,30,.1)}.card-cover{height:220px;margin:8px 8px 0;overflow:hidden;border-radius:17px;background:linear-gradient(145deg,#087386,#00b1c9)}.cover-art{height:100%;display:grid;place-items:center;position:relative;color:#fff}.cover-art>span{font:italic 84px Georgia;opacity:.85}.cover-art i{position:absolute;top:12px;left:12px;padding:6px 9px;border-radius:999px;background:rgba(28,28,30,.38);border:1px solid rgba(255,255,255,.18);font-size:9px;font-style:normal;font-weight:700}.card-body{padding:19px 20px}.card-body h3{font-size:18px;font-weight:750;letter-spacing:-.025em}.card-body p{margin-top:7px;color:#6e6e73;font-size:13px;line-height:1.45}.card-body>small{display:block;margin-top:10px;color:#8e8e93;font-size:11px}.card-footer{display:flex;align-items:center;justify-content:space-between;margin-top:15px;padding-top:13px;border-top:1px solid var(--line);color:#009aaf;font-size:13px;font-weight:650}
.features-section{padding:135px 0;background:#fff}.section-heading{text-align:center}.section-heading>p:last-child{max-width:630px;margin:22px auto 0;color:var(--muted);font-size:17px;line-height:1.6}.feature-list{margin-top:75px;border-top:1px solid var(--line)}.feature-list article{display:grid;grid-template-columns:70px 1fr auto;align-items:center;gap:30px;padding:31px 0;border-bottom:1px solid var(--line)}.feature-list article>span{color:#a1a1a6;font-size:11px;font-weight:700;letter-spacing:.08em}.feature-list h3{font-size:22px;letter-spacing:-.025em}.feature-list p{max-width:650px;margin-top:6px;color:var(--muted);font-size:14px;line-height:1.55}.feature-list i{color:#8e8e93;font-size:10px;font-style:normal;font-weight:650;letter-spacing:.04em}
.product-section{display:grid;grid-template-columns:.75fr 1.25fr;align-items:center;gap:80px;padding:140px 0}.product-copy>p:nth-of-type(2){margin-top:22px;color:var(--muted);font-size:16px;line-height:1.62}.product-copy ul{display:flex;flex-direction:column;gap:12px;margin-top:27px;list-style:none}.product-copy li{display:flex;gap:10px;font-size:13px;line-height:1.45}.product-copy li::before{content:'✓';width:20px;height:20px;display:grid;place-items:center;flex:none;border-radius:50%;background:#e6f9fb;color:#00899c;font-size:10px;font-weight:800}.course-panel{overflow:hidden;border:1px solid rgba(60,60,67,.1);border-radius:27px;background:#fff;box-shadow:0 18px 54px rgba(35,43,50,.11)}.course-cover{height:126px;display:flex;align-items:center;gap:15px;padding:27px;background:linear-gradient(145deg,#087386,#00b1c9);color:#fff}.course-glyph{width:59px;height:59px;display:grid;place-items:center;border-radius:18px;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.2);font:italic 37px Georgia}.course-cover>div:nth-child(2){display:flex;flex-direction:column;gap:4px}.course-cover strong{font-size:19px}.course-cover small{font-size:10px;opacity:.75}.course-cover>button{margin-left:auto;color:#fff;font-size:18px;letter-spacing:.08em}.tabs-bar{position:relative;display:flex;margin:16px 18px 0;padding:3px;border-radius:12px;background:#e5e5ea}.tabs-indicator{position:absolute;inset:3px auto 3px 3px;width:calc((100% - 6px)/3);border-radius:9px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.12);transition:transform .3s cubic-bezier(.22,1,.36,1)}.tabs-bar button{z-index:1;flex:1;min-height:38px;display:flex;align-items:center;justify-content:center;gap:6px;color:#77777c;font-size:12px;font-weight:620}.tabs-bar button.active{color:#1d1d1f;font-weight:700}.tabs-bar small{padding:1px 6px;border-radius:99px;background:#d1d1d6;font-size:9px}.tabs-bar button.active small{background:#e6f9fb;color:#00899c}.course-content{min-height:278px;padding:16px 18px 20px}.item-list{overflow:hidden;border:1px solid var(--line);border-radius:17px}.item-row,.assignment-row{width:100%;display:flex;align-items:center;gap:12px;min-height:72px;padding:10px 15px;text-align:left;background:#fff}.item-row+.item-row,.assignment-row+.assignment-row{border-top:1px solid rgba(60,60,67,.08)}.item-row:hover,.assignment-row:hover{background:rgba(60,60,67,.035)}.item-row>span,.assignment-row>span:nth-child(2){display:flex;flex:1;flex-direction:column;gap:4px}.item-row b,.assignment-row b{font-size:12px}.item-row small,.assignment-row small{color:#8e8e93;font-size:9px}.item-row>svg{width:16px;height:16px;color:#a1a1a6;fill:none;stroke:currentColor;stroke-width:2}.assignment-icon{width:40px;height:40px!important;display:grid!important;place-items:center!important;flex:none!important;border-radius:12px;background:#eeeef1;color:#6e6e73}.assignment-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8}.assignment-icon.complete{background:#eaf8ef;color:#228a48}.assignment-row em{padding:6px 9px;border-radius:99px;background:#fff3d7;color:#986800;font-size:9px;font-style:normal;font-weight:700}.assignment-row em.complete{background:#eaf8ef;color:#228a48}.assistant-empty{min-height:242px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.assistant-empty>span{width:43px;height:43px;display:grid;place-items:center;border-radius:14px;background:#e6f9fb;color:#00899c}.assistant-empty svg{width:22px;height:22px;fill:currentColor}.assistant-empty h4{margin-top:12px;font-size:14px}.assistant-empty p{margin-top:5px;color:#8e8e93;font-size:10px}.assistant-empty>div{width:min(330px,100%);display:flex;justify-content:space-between;align-items:center;margin-top:25px;padding:8px 8px 8px 13px;border:1px solid var(--line);border-radius:14px;color:#a1a1a6;font-size:10px}.assistant-empty>div b{width:29px;height:29px;display:grid;place-items:center;border-radius:50%;background:var(--teal);color:#fff;font-size:16px}
.principles{padding:130px 0;background:#1d1d1f;color:#fff}.principles .eyebrow{color:#61d2df}.principles-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:110px}.principle-list{border-top:1px solid #3a3a3c}.principle-list article{display:grid;grid-template-columns:150px 1fr;gap:25px;padding:25px 0;border-bottom:1px solid #3a3a3c}.principle-list span{font-size:14px;font-weight:700}.principle-list p{color:#a1a1a6;font-size:13px;line-height:1.55}
.roles{padding:140px 0;text-align:center}.role-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:62px;text-align:left}.role-grid article{padding:40px;border:1px solid var(--line);border-radius:28px;background:#fff}.role-grid article>span{color:#00899c;font-size:10px;font-weight:750;letter-spacing:.12em}.role-grid h3{margin-top:20px;font-size:27px;letter-spacing:-.035em}.role-grid p{margin-top:13px;color:var(--muted);font-size:14px;line-height:1.6}.role-grid ul{display:flex;flex-direction:column;gap:12px;margin-top:25px;padding-top:23px;border-top:1px solid var(--line);list-style:none}.role-grid li{font-size:12px}.role-grid li::before{content:'—';margin-right:9px;color:#a1a1a6}.closing{margin-bottom:120px;padding:88px 30px;border-radius:34px;background:#008fa3;color:#fff;text-align:center}.closing-mark{width:49px;height:52px;margin:auto;background:#fff}.closing>p{margin-top:16px;color:rgba(255,255,255,.64);font-size:10px;font-weight:750;letter-spacing:.16em}.closing h2{margin:17px 0 30px;font-size:clamp(42px,5vw,64px);line-height:1.02;letter-spacing:-.052em}footer{background:#fff;border-top:1px solid var(--line)}.footer-inner{min-height:170px;display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:48px}.footer-inner>div p{margin-top:8px;color:#8e8e93;font-size:10px}.footer-inner nav{display:flex;gap:24px;color:#6e6e73;font-size:10px}.footer-inner>small{color:#a1a1a6;font-size:9px}.reveal{opacity:0;transform:translateY(20px);transition:opacity .65s ease,transform .65s cubic-bezier(.22,1,.36,1)}.reveal.visible{opacity:1;transform:none}.fade-enter-active,.fade-leave-active{transition:opacity .16s ease,transform .18s ease}.fade-enter-from{opacity:0;transform:translateY(3px)}.fade-leave-to{opacity:0;transform:translateY(-3px)}
@media(max-width:980px){.hero{grid-template-columns:1fr;min-height:auto;padding-top:170px;padding-bottom:110px}.hero-wordmark{display:none}.about{grid-template-columns:1fr;gap:55px}.real-card-wrap{width:min(430px,100%);margin:auto}.product-section{grid-template-columns:1fr;gap:55px}.product-copy{max-width:680px}.principles-grid{grid-template-columns:1fr;gap:55px}}
@media(max-width:720px){.shell,.nav-inner{width:calc(100% - 32px)}.site-nav{height:64px}.site-nav.scrolled{height:56px}.nav-inner nav,.sign-in{display:none}.nav-actions{margin-left:auto}.hero{padding-top:135px;padding-bottom:85px}.hero h1{font-size:clamp(43px,13vw,62px)}.hero-text{font-size:17px}.hero-actions{flex-direction:column;align-items:flex-start;gap:18px}.about{padding:85px 0}.about-copy h2,.section-heading h2,.product-copy h2,.principles h2,.roles>h2{font-size:38px}.about-copy>p:nth-of-type(2){font-size:16px}.about-facts{grid-template-columns:1fr}.features-section{padding:90px 0}.feature-list{margin-top:48px}.feature-list article{grid-template-columns:38px 1fr;gap:15px;padding:25px 0}.feature-list article>i{grid-column:2}.feature-list h3{font-size:19px}.product-section{padding:90px 0}.course-cover{height:108px;padding:20px}.course-glyph{width:48px;height:48px;font-size:30px}.course-cover strong{font-size:16px}.course-cover button{display:none}.tabs-bar{margin-inline:11px}.tabs-bar button{font-size:10px}.tabs-bar small{display:none}.course-content{padding-inline:11px}.item-row,.assignment-row{padding-inline:11px}.principles{padding:90px 0}.principle-list article{grid-template-columns:1fr;gap:8px}.roles{padding:90px 0}.role-grid{grid-template-columns:1fr;margin-top:45px}.role-grid article{padding:30px 25px}.closing{width:calc(100% - 24px);margin-bottom:80px;padding:70px 20px;border-radius:27px}.footer-inner{display:flex;flex-direction:column;align-items:flex-start;gap:22px;padding:38px 0}.footer-inner nav{flex-wrap:wrap}}
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
