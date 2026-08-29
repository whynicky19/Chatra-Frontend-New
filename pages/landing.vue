<template>
  <div class="landing" @scroll.passive="onScroll">
    <!-- ===== NAV ===== -->
      <header :class="['lnav', { scrolled }]">
        <div class="lnav-inner">
          <div class="l-brand" @click="toTop">
            <span class="l-logo" role="img" aria-label="Chatra"></span>
            <span class="l-brand-name">Chatra</span>
          </div>

          <div class="lnav-r">
            <NuxtLink to="/org" class="btn btn-teal l-cta-sm">{{ d('cta.short') }}</NuxtLink>
          </div>
        </div>
      </header>

    <main class="l-main">
      <!-- ===== HERO ===== -->
      <section class="hero">
          <!-- Живые "облака" в hero. Дрейфуют по @keyframes orb-drift с разной
               фазой/duration, чтобы движение не выглядело "синхронным". На
               prefers-reduced-motion паузятся через общий media-query ниже. -->
          <div class="orb orb-a" aria-hidden="true"></div>
          <div class="orb orb-b" aria-hidden="true"></div>
          <div class="orb orb-c" aria-hidden="true"></div>

        <div class="hero-grid">
          <div class="hero-copy">
            <h1 class="hero-title reveal">
              {{ d('hero.title_1') }}<br/><span class="grad-text">{{ d('hero.title_2') }}</span>
            </h1>
            <p class="hero-sub reveal reveal-delay-1">{{ d('hero.sub') }}</p>
            <div class="hero-ctas reveal reveal-delay-2">
              <NuxtLink to="/org" class="btn btn-teal btn-lg hero-cta">{{ d('cta.main') }}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </NuxtLink>
            </div>
          </div>

          <!-- Живой макет чата — один в один с ClassAiChat:
               msg-row/msg-sender/msg-bubble + .ai-input-bar с круглой send-btn -->
          <div class="hero-visual">
            <div class="hero-collage" :style="!reducedMotion && heroShift ? { transform: `translateY(${-heroShift * 0.06}px)` } : undefined">
              <div class="hc-grid">
                <div class="hc-card reveal">
                  <span class="hc-glyph"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
                  <span class="hc-name">{{ d('hx.p1') }}</span>
                  <span class="hc-meta">{{ d('hx.m1') }}</span>
                </div>
                <div class="hc-card reveal reveal-delay-1">
                  <span class="hc-glyph"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></span>
                  <span class="hc-name">{{ d('hx.p2') }}</span>
                  <span class="hc-meta">{{ d('hx.m2') }}</span>
                </div>
                <div class="hc-card reveal reveal-delay-2">
                  <span class="hc-glyph"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
                  <span class="hc-name">{{ d('hx.p3') }}</span>
                  <span class="hc-meta">{{ d('hx.m3') }}</span>
                </div>
                <div class="hc-card on reveal reveal-delay-3">
                  <span class="hc-glyph"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M9 2c.4 3.2 1.8 4.6 5 5-3.2.4-4.6 1.8-5 5-.4-3.2-1.8-4.6-5-5 3.2-.4 4.6-1.8 5-5Z"/><path d="M17.5 12c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z"/></svg></span>
                  <span class="hc-name">{{ d('hx.p4') }}</span>
                  <span class="hc-meta">{{ d('hx.m4') }}</span>
                </div>
              </div>
              <div class="hc-chip hc-grade reveal reveal-delay-3">
                <span class="hcc-ico green"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></span>
                {{ d('dl.item3_t') }} · 87/100
              </div>
              <div class="hc-chip hc-due reveal reveal-delay-4">
                <span class="hcc-ico yellow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
                {{ d('dl.item1_t') }} · {{ d('dl.item1_due') }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== FEATURES (bento) ===== -->
      <section id="features" class="section">
        <div class="sec-head reveal">
          <div class="kicker">{{ d('features.kicker') }}</div>
          <h2 class="sec-title">{{ d('features.title') }}</h2>
          <p class="sec-sub">{{ d('features.sub') }}</p>
        </div>

        <div class="bento">
          <!-- 01 · Прогресс: баллы и успеваемость по предмету -->
          <div class="bcard reveal">
            <div class="bcopy">
              <h3 class="btitle">{{ d('f.prog.title') }}</h3>
              <p class="btext">{{ d('f.prog.text') }}</p>
            </div>
            <div class="bvisual">
              <div class="prog-demo" aria-hidden="true">
                <div class="pg-row">
                  <span class="pg-name">{{ d('f.subjects.s1') }}</span>
                  <span class="pg-bar"><span class="pg-fill" style="width:78%"></span></span>
                  <span class="pg-score">87/100</span>
                </div>
                <div class="pg-row">
                  <span class="pg-name">{{ d('f.subjects.s2') }}</span>
                  <span class="pg-bar"><span class="pg-fill" style="width:64%"></span></span>
                  <span class="pg-score">72/100</span>
                </div>
                <div class="pg-row">
                  <span class="pg-name">{{ d('f.subjects.s3') }}</span>
                  <span class="pg-bar"><span class="pg-fill" style="width:91%"></span></span>
                  <span class="pg-score">94/100</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 02 · Файлы: список материалов как в приложении -->
          <div class="bcard reveal reveal-delay-1 reveal-scale">
            <div class="bcopy">
              <h3 class="btitle">{{ d('f.files.title') }}</h3>
              <p class="btext">{{ d('f.files.text') }}</p>
            </div>
            <div class="bvisual">
              <div class="mli-demo" aria-hidden="true">
                <div class="mli-row">
                  <FileTypeIcon url="lecture_02.pdf" />
                  <div class="mli-info"><div class="mli-name">lecture_02.pdf</div><div class="mli-meta">PDF · 2.4 MB</div></div>
                  <svg class="mli-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
                <div class="mli-row">
                  <FileTypeIcon url="seminar_notes.docx" />
                  <div class="mli-info"><div class="mli-name">seminar_notes.docx</div><div class="mli-meta">DOCX · 480 KB</div></div>
                  <svg class="mli-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
                <div class="mli-row">
                  <FileTypeIcon url="slides_week2.pptx" />
                  <div class="mli-info"><div class="mli-name">slides_week2.pptx</div><div class="mli-meta">PPTX · 5.1 MB</div></div>
                  <svg class="mli-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== SUBJECT AI ===== -->
      <section id="subject-ai" class="section split band">
        <div class="split-copy reveal reveal-left">
          <div class="kicker">{{ d('sa.kicker') }}</div>
          <h2 class="sec-title left">{{ d('sa.title') }}</h2>
          <p class="sec-sub left">{{ d('sa.text') }}</p>
          <ul class="checklist">
            <li v-for="(c, i) in d('sa.points')" :key="i" :class="'reveal reveal-delay-' + (i + 1)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              {{ c }}
            </li>
          </ul>
        </div>

        <div class="split-visual sa-visual reveal reveal-right">
          <!-- Реплика страницы предмета с сайта: обложка класса, сегмент-контрол
               табов в стиле iOS (Лекции / Задания / ИИ-чат со скользящим
               индикатором), содержимое активного таба и живой диалог с ИИ
               предмета поверх окна. -->
          <div class="mock-window cls-win">
            <div class="cls-cover">
              <span class="cls-glyph" aria-hidden="true">Φ</span>
              <div class="cls-cover-t">
                <div class="cls-cover-name">{{ d('sa.class_name') }}</div>
                <div class="cls-cover-s">{{ d('sa.class_teacher') }}</div>
              </div>
              <svg class="cls-spark" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 2c.4 3.2 1.8 4.6 5 5-3.2.4-4.6 1.8-5 5-.4-3.2-1.8-4.6-5-5 3.2-.4 4.6-1.8 5-5Z"/><path d="M17.5 12c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z"/></svg>
            </div>
            <div class="tabs-bar">
              <div ref="tabsIndicatorEl" class="tabs-indicator"></div>
              <button :class="['tab-btn', { active: clsTab === 0 }]" @click="clsTab = 0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                {{ d('sa.tab_lectures') }} <span class="tab-num">12</span>
              </button>
              <button :class="['tab-btn', { active: clsTab === 1 }]" @click="clsTab = 1">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                {{ d('sa.tab_tasks') }} <span class="tab-num">3</span>
              </button>
              <button :class="['tab-btn', { active: clsTab === 2 }]" @click="clsTab = 2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                {{ d('sa.tab_ai') }}
              </button>
            </div>

            <div class="cls-pane" :class="'p' + clsTab">
              <!-- Лекции -->
              <div v-if="clsTab === 0" class="cls-list">
                <div v-for="(l, i) in lectures" :key="i" class="mli-row">
                  <FileTypeIcon url="lecture.pdf" />
                  <div class="mli-info"><div class="mli-name">{{ l }}</div><div class="mli-meta">PDF</div></div>
                  <svg class="mli-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
              <!-- Задания -->
              <div v-else-if="clsTab === 1" class="cls-list">
                <div v-for="(a, i) in clsAssignments" :key="i" class="cls-asgn">
                  <div class="cls-asgn-t">{{ a.t }}</div>
                  <div class="cls-asgn-m">{{ a.m }}</div>
                  <span :class="['status-pill', a.pill]">{{ a.s }}</span>
                </div>
              </div>
              <!-- ИИ-чат -->
              <template v-else>
                <div class="mw-chat">
                  <Transition name="fade" mode="out-in">
                    <div :key="activeSubject" class="cai-msgs">
                      <div class="msg-row user">
                        <div class="msg-bubble">{{ subjects[activeSubject].q }}</div>
                      </div>
                      <div class="msg-row assistant">
                        <div class="msg-sender">Chatra AI</div>
                        <div class="msg-bubble">{{ subjects[activeSubject].a }}</div>
                      </div>
                    </div>
                  </Transition>
                </div>
                <div class="mw-input">
                  <div class="ai-textarea sm">{{ d('demo.placeholder') }}</div>
                  <div class="send-btn sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Живой диалог с ИИ предмета: msg-row/msg-bubble + .ai-input-bar,
               сообщения появляются по очереди (см. scheduleLoop) -->
          <div class="chat-card sa-chat" aria-hidden="false">
            <div class="chat-head">
              <span class="chat-presence"></span>
              <div class="chat-title">{{ d('demo.subject') }}</div>
            </div>
            <div class="chat-body">
              <template v-for="(m, i) in visibleMsgs" :key="i">
                <div :class="['msg-row', m.own ? 'user' : 'assistant']">
                  <div v-if="!m.own" class="msg-sender">Chatra AI</div>
                  <div class="msg-bubble">{{ m.text }}</div>
                </div>
              </template>
              <div v-if="typing" class="msg-row assistant">
                <div class="msg-sender">Chatra AI</div>
                <div class="msg-bubble typing-bbl"><span></span><span></span><span></span></div>
              </div>
            </div>
            <div class="ai-input-bar">
              <div class="ai-textarea">{{ d('demo.placeholder') }}</div>
              <div class="send-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== COHORTS · УЧЕБНЫЕ ПОТОКИ =====
           Имитация экрана «Задания и дедлайны» в настройках класса
           (только что добавили такой в pages/classes/[id].vue). На одной
           макет-модалке видно два потока — активный и архивный — и три
           строки дедлайнов с разными состояниями: опубликовано, черновик
           с автоматическим сдвигом даты, и «без срока». -->
      <section id="cohorts" class="section split band">
        <div class="split-copy reveal reveal-left">
          <div class="kicker">{{ d('cohorts.kicker') }}</div>
          <h2 class="sec-title left">{{ d('cohorts.title') }}</h2>
          <p class="sec-sub left">{{ d('cohorts.text') }}</p>
          <ul class="checklist">
            <li v-for="(c, i) in d('cohorts.points')" :key="i" :class="'reveal reveal-delay-' + (i + 1)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              {{ c }}
            </li>
          </ul>
        </div>

        <div class="split-visual reveal reveal-right">
          <div class="mock-window cohorts-mock" aria-hidden="true">
            <div class="cm-head">
              <span class="cm-ico">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M11 14h2M11 17h4"/></svg>
              </span>
              <div class="cm-title">{{ d('cohorts.modal_title') }}</div>
              <span class="cm-x" aria-hidden="true">×</span>
            </div>

            <div class="cm-cohort-row">
              <span class="cm-cohort-ico">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </span>
              <div class="cm-cohort-meta">
                <div class="cm-cohort-label">{{ d('cohorts.cohort_active_label') }}</div>
              </div>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>

            <div class="cm-publish-bar">
              <div class="cm-publish-info">
                <span class="cm-publish-count">2</span>
                <span>{{ d('cohorts.drafts_count') }}</span>
              </div>
              <span class="cm-publish-btn">{{ d('cohorts.publish_all') }}</span>
            </div>

            <div class="cm-dl-list">
              <!-- Строка 1: опубликовано -->
              <div class="cm-dl-row">
                <div class="cm-dl-main">
                  <div class="cm-dl-title">{{ d('cohorts.a1_t') }}</div>
                  <div class="cm-dl-date">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {{ d('cohorts.a1_due') }}
                  </div>
                </div>
                <span class="cm-dl-badge published">{{ d('cohorts.published') }}</span>
              </div>

              <!-- Строка 2: черновик + сдвинутая дата -->
              <div class="cm-dl-row draft">
                <div class="cm-dl-main">
                  <div class="cm-dl-title">{{ d('cohorts.a2_t') }}</div>
                  <div class="cm-dl-date">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {{ d('cohorts.a2_due') }}
                  </div>
                  <div class="cm-dl-hint">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                    {{ d('cohorts.a2_hint') }}
                  </div>
                </div>
                <span class="cm-dl-badge draft">{{ d('cohorts.draft') }}</span>
              </div>

              <!-- Строка 3: без срока -->
              <div class="cm-dl-row no-dl">
                <div class="cm-dl-main">
                  <div class="cm-dl-title">{{ d('cohorts.a3_t') }}</div>
                </div>
                <span class="cm-dl-badge no-dl">{{ d('cohorts.a3_due') }}</span>
                <span class="cm-dl-badge published">{{ d('cohorts.published') }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== MATERIALS & HIGHLIGHTS =====
           Макет экрана лекции один в один: страница документа с подсветкой
           выделений, меню HighlightMenu (цвета #FFD84D/#7BDCA0/#7CC5F5/#FF9A9A,
           «Заметка», «Спросить AI»), панель «Мои выделения» и список файлов. -->
      <section id="highlights" class="section split split-lec rev">
        <div class="split-visual reveal reveal-left">
          <div class="mock-window lec-win">
            <div class="mw-bar">
              <span class="mw-dot"></span><span class="mw-dot"></span><span class="mw-dot"></span>
              <span class="mw-file">
                <FileTypeIcon url="lecture_02.pdf" size="compact" />
                lecture_02.pdf
              </span>
            </div>
            <div class="lec-body">
              <div class="lec-page">
                <div class="lec-h">{{ d('hl.doc_h') }}</div>
                <p class="lec-p">{{ d('hl.doc_p1') }}</p>
                <p class="lec-p">
                  <span class="hl-mark hl-yellow">{{ d('hl.doc_mark1') }}</span>
                  <!-- Статичное меню выделения — копия HighlightMenu -->
                  <span class="hm" aria-hidden="true">
                    <span class="hm-row">
                      <span class="hm-color"><span class="c-yellow"></span></span>
                      <span class="hm-color active"><span class="c-yellow"></span></span>
                      <span class="hm-color"><span class="c-blue"></span></span>
                      <span class="hm-color"><span class="c-red"></span></span>
                      <span class="hm-sep"></span>
                      <span class="hm-btn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                        {{ d('hl.menu_note') }}
                      </span>
                      <span class="hm-btn hm-ai">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z"/><path d="M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9L18 15z"/></svg>
                        {{ d('hl.menu_ask') }}
                      </span>
                    </span>
                  </span>
                  {{ d('hl.doc_p2') }}
                </p>
                <p class="lec-p"><span class="hl-mark hl-green">{{ d('hl.doc_mark2') }}</span> {{ d('hl.doc_p3') }}</p>
              </div>
              <div class="lec-side">
                <div class="hp-label">{{ d('hl.panel_title') }} <span class="hp-count">2</span></div>
                <div class="hp-list">
                  <div class="hp-row">
                    <span class="hp-bar" style="background:#FFD84D"></span>
                    <div class="hp-main">
                      <div class="hp-text">{{ d('hl.item1_text') }}</div>
                      <div class="hp-note">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                        {{ d('hl.item1_note') }}
                      </div>
                      <div class="hp-meta">{{ d('hl.item1_meta') }}</div>
                    </div>
                  </div>
                  <div class="hp-row">
                    <span class="hp-bar" style="background:#7CC5F5"></span>
                    <div class="hp-main">
                      <div class="hp-text">{{ d('hl.item2_text') }}</div>
                      <div class="hp-meta">{{ d('hl.item2_meta') }}</div>
                    </div>
                  </div>
                </div>
                <div class="hp-label" style="margin-top:16px">{{ d('hl.files_title') }}</div>
                <div class="hp-list files">
                  <div class="mli-row">
                    <FileTypeIcon url="lecture_02.pdf" />
                    <div class="mli-info"><div class="mli-name">lecture_02.pdf</div><div class="mli-meta">PDF</div></div>
                    <svg class="mli-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                  <div class="mli-row">
                    <FileTypeIcon url="seminar_notes.docx" />
                    <div class="mli-info"><div class="mli-name">seminar_notes.docx</div><div class="mli-meta">DOC</div></div>
                    <svg class="mli-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                  <div class="mli-row">
                    <FileTypeIcon url="slides_week2.pptx" />
                    <div class="mli-info"><div class="mli-name">slides_week2.pptx</div><div class="mli-meta">PPT</div></div>
                    <svg class="mli-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="split-copy reveal reveal-right">
          <div class="kicker">{{ d('hl.kicker') }}</div>
          <h2 class="sec-title left">{{ d('hl.title') }}</h2>
          <p class="sec-sub left">{{ d('hl.text') }}</p>
          <ul class="checklist">
            <li v-for="(c, i) in d('hl.points')" :key="i" :class="'reveal reveal-delay-' + (i + 1)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              {{ c }}
            </li>
          </ul>
        </div>
      </section>

      <!-- ===== CHATRA AI (общий ассистент) ===== -->
      <section id="chatra-ai" class="section split band-dark">
        <div class="split-copy reveal reveal-left">
          <div class="kicker">{{ d('ai.kicker') }}</div>
          <h2 class="sec-title left">{{ d('ai.title') }}</h2>
          <p class="sec-sub left">{{ d('ai.sub') }}</p>
          <ul class="checklist">
            <li v-for="(c, i) in d('ai.points')" :key="i" :class="'reveal reveal-delay-' + (i + 1)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              {{ c }}
            </li>
          </ul>
        </div>

        <div class="split-visual reveal reveal-right">
          <!-- Реплика pages/ai.vue: сайдбар диалогов (поиск, закрепления, недавние)
               + основной чат с формулами и продолжением разговора -->
          <div class="ai-win" aria-hidden="true">
            <aside class="ai-side">
              <div class="ai-search">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                {{ d('ai.search') }}
              </div>
              <div class="ai-new">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                {{ d('ai.new_chat') }}
              </div>
              <div class="ai-group-label">{{ d('ai.pin_label') }}</div>
              <div class="ai-conv pinned">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V16a1 1 0 001 1h12a1 1 0 001-1v-.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1a2 2 0 000-4H8a2 2 0 000 4h1z"/></svg>
                {{ d('ai.c1') }}
              </div>
              <div class="ai-group-label">{{ d('ai.recent') }}</div>
              <div class="ai-conv active">{{ d('ai.c2') }}</div>
              <div class="ai-conv">{{ d('ai.c3') }}</div>
              <div class="ai-conv">{{ d('ai.c4') }}</div>
            </aside>

            <div class="ai-main">
              <div class="ai-msgs">
                <div class="msg-row user"><div class="msg-bubble">{{ d('ai.q') }}</div></div>
                <div class="msg-row assistant">
                  <div class="msg-sender">Chatra AI</div>
                  <div class="msg-bubble">
                    {{ d('ai.a1') }}
                    <span class="math">x = <span class="mfrac"><span class="mn">−b ± √(b² − 4ac)</span><span class="md">2a</span></span></span><br/>
                    <span class="math plain">D = b² − 4ac = 25 − 24 = 1</span><br/>
                    {{ d('ai.a2') }} <span class="math roots">x₁ = 3,&nbsp;&nbsp;x₂ = 2</span>
                  </div>
                </div>
                <div class="msg-row user"><div class="msg-bubble">{{ d('ai.follow') }}</div></div>
              </div>
              <div class="mw-input ai-input-dark">
                <div class="ai-textarea sm">{{ d('ai.placeholder') }}</div>
                <div class="send-btn sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== AI GRADER ===== -->
      <section id="grader" class="section split band">
        <div class="split-copy reveal reveal-left">
          <div class="kicker">{{ d('gr.kicker') }}</div>
          <h2 class="sec-title left">{{ d('gr.title') }}</h2>
          <p class="sec-sub left">{{ d('gr.text') }}</p>
          <ul class="checklist">
            <li v-for="(c, i) in d('gr.points')" :key="i" :class="'reveal reveal-delay-' + (i + 1)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              {{ c }}
            </li>
          </ul>
        </div>

        <div ref="graderSection" class="split-visual reveal reveal-right">
          <!-- Реплика GradeResultCard из приложения, единая поверхность:
               hero с кольцом → разбор ИИ → сильные стороны / зоны роста,
               зоны разделены волосяными линиями как сгруппированный список iOS -->
          <div class="grc-card">
            <div class="gw-bar">
              <span></span><span></span><span></span>
              <span class="gw-file">{{ d('grx.file') }}</span>
            </div>

            <div class="grc-hero">
              <div class="grc-hero-wash" aria-hidden="true"></div>
              <div class="grc-hero-inner">
                <ScoreRing :score="87" :max-score="100"/>
                <div class="grc-verdict">{{ d('gr.verdict') }}</div>
                <div class="grc-by-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  {{ d('gr.by_badge') }}
                </div>
              </div>
            </div>

            <div class="grc-summary">
              <div class="grc-summary-head">
                <span class="grc-spark">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </span>
                {{ d('gr.sum_label') }}
              </div>
              <p class="grc-summary-text">{{ d('gr.summary') }}</p>
            </div>

            <div class="grc-criteria" aria-hidden="true">
              <div class="gc-head">{{ d('grx.crit_label') }}</div>
              <div v-for="(c, i) in grCrits" :key="i" class="gc-row">
                <span class="gc-name">{{ c.name }}</span>
                <span class="gc-bar"><span class="gc-fill" :style="{ width: (graderShown ? c.score * 10 : 0) + '%' }"></span></span>
                <span class="gc-score">{{ c.score }}/10</span>
              </div>
            </div>

            <div class="grc-analysis">
              <div class="grc-col">
                <div class="grc-bullet-title ok">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ d('gr.st_title') }}
                </div>
                <div class="grc-bullet-row"><span class="grc-dot ok"></span><span>{{ d('gr.strength') }}</span></div>
                <div class="grc-bullet-row"><span class="grc-dot ok"></span><span>{{ d('gr.strength2') }}</span></div>
              </div>
              <div class="grc-col">
                <div class="grc-bullet-title warn">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  {{ d('gr.im_title') }}
                </div>
                <div class="grc-bullet-row"><span class="grc-dot warn"></span><span>{{ d('gr.improve') }}</span></div>
                <div class="grc-bullet-row"><span class="grc-dot warn"></span><span>{{ d('gr.improve2') }}</span></div>
              </div>
            </div>

            <div class="grc-teacher">
              <span class="gt-check">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <div class="gt-main">
                <div class="gt-note">{{ d('grx.teacher_note') }}</div>
                <div class="gt-meta">{{ d('grx.teacher_time') }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== FOR STUDENTS & TEACHERS ===== -->
      <section id="roles" class="section roles-sec">
        <div class="sec-head reveal">
          <div class="kicker">{{ d('roles.kicker') }}</div>
          <h2 class="sec-title">{{ d('roles.title') }}</h2>
          <p class="sec-sub">{{ d('roles.sub') }}</p>
        </div>

        <div class="roles-stage">
          <div class="role-panel rp-stu reveal reveal-left">
            <div class="rp-head">
              <span class="rp-badge stu">{{ d('roles.st_badge') }}</span>
              <span class="rp-date">{{ d('roles.today') }}</span>
            </div>
            <div class="rp-row">
              <span class="rp-dot pending"></span>
              <div class="rp-main">
                <div class="rp-name">{{ d('dl.item1_t') }}</div>
                <div class="rp-meta">{{ d('dl.item1_due') }} · {{ d('dl.item1_score') }}</div>
              </div>
              <span class="status-pill pending">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ d('dl.st_pending') }}
              </span>
            </div>
            <div class="rp-row">
              <span class="rp-dot done"></span>
              <div class="rp-main">
                <div class="rp-name">{{ d('dl.item3_t') }}</div>
                <div class="rp-meta">{{ d('roles.passed') }}</div>
              </div>
              <span class="status-pill graded">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                87/100
              </span>
            </div>
          </div>

          <div class="role-panel rp-tea reveal reveal-right reveal-delay-2" aria-hidden="true">
            <div class="rp-head">
              <span class="rp-badge tea">{{ d('roles.te_badge') }}</span>
              <span class="rp-date">{{ d('roles.queue') }}</span>
            </div>
            <div class="rp-row">
              <div class="rp-main">
                <div class="rp-name">{{ d('roles.sub1') }}</div>
                <div class="rp-meta">AI: 87/100 · {{ d('roles.ai_suggested') }}</div>
              </div>
              <span class="rp-btn">{{ d('roles.approve') }}</span>
            </div>
            <div class="rp-row">
              <div class="rp-main">
                <div class="rp-name">{{ d('roles.sub2') }}</div>
                <div class="rp-meta">AI: 92/100 · {{ d('roles.ai_suggested') }}</div>
              </div>
              <span class="rp-btn">{{ d('roles.approve') }}</span>
            </div>
          </div>

          <div class="roles-bridge-pos">
            <div class="roles-bridge reveal reveal-delay-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 2c.4 3.2 1.8 4.6 5 5-3.2.4-4.6 1.8-5 5-.4-3.2-1.8-4.6-5-5 3.2-.4 4.6-1.8 5-5Z"/><path d="M17.5 12c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z"/></svg>
              {{ d('roles.bridge') }}
            </div>
          </div>
        </div>
      </section>

      <!-- ===== JOIN BY CODE ===== -->
      <section id="join" class="section jc-sec">
        <div class="sec-head reveal">
          <div class="kicker">{{ d('jc.kicker') }}</div>
          <h2 class="sec-title">{{ d('jc.title') }}</h2>
          <p class="sec-sub">{{ d('jc.sub') }}</p>
        </div>

        <!-- Реплика join-modal из приложения: шесть ячеек кода
             и живой предпросмотр найденного предмета -->
        <div class="jc-card reveal reveal-scale" aria-hidden="true">
          <div class="jc-label">{{ d('jc.label') }}</div>
          <div class="jc-digits">
            <span v-for="(n, i) in ['7','4','1','9','2','6']" :key="i" :class="['jd', { active: i === 5 }]">{{ n }}</span>
          </div>
          <div class="jc-found">
            <span class="jc-glyph">Φ</span>
            <div class="jf-main">
              <div class="jf-name">{{ d('sa.class_name') }}</div>
              <div class="jf-meta">{{ d('sa.class_teacher') }}</div>
            </div>
            <span class="jc-btn">{{ d('jc.join') }}</span>
          </div>
        </div>
      </section>

      <!-- ===== CALENDAR · DEADLINES · NOTIFICATIONS ===== -->
      <section id="deadlines" class="section band">
        <div class="sec-head reveal">
          <div class="kicker">{{ d('dl.kicker') }}</div>
          <h2 class="sec-title">{{ d('dl.title') }}</h2>
          <p class="sec-sub">{{ d('dl.sub') }}</p>
        </div>

        <div class="cal-grid-wrap">
          <div class="cal-col reveal reveal-left">
            <div class="cal-win" aria-hidden="true">
              <div class="cal-head">
                <div class="cal-month">{{ d('cal.month') }}</div>
                <span class="cal-nav">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
              </div>
              <div class="cal-week">
                <span v-for="(w, i) in d('cal.week')" :key="'w' + i">{{ w }}</span>
              </div>
              <div class="cal-days">
                <span v-for="(c, i) in calCells" :key="'c' + i" :class="['cal-cell', { blank: c === null, sel: c === calSel }]">
                  <span class="cal-num">{{ c }}</span>
                  <span v-if="c && calMarks[c]" :class="['cal-dot', calMarks[c]]"></span>
                </span>
              </div>
            </div>

            <div class="notif-card reveal reveal-delay-1" aria-hidden="true">
              <div class="nc-head">{{ d('f.notif.title') }}</div>
              <div class="nc-row">
                <span class="nc-ico teal">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </span>
                <span class="nc-text">{{ d('cal.n1') }}</span>
              </div>
              <div class="nc-row">
                <span class="nc-ico yellow">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </span>
                <span class="nc-text">{{ d('cal.n2') }}</span>
              </div>
              <div class="nc-row">
                <span class="nc-ico green">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <span class="nc-text">{{ d('cal.n3') }}</span>
              </div>
            </div>
          </div>

          <div class="cal-col-right reveal reveal-right">
            <div class="asgn-list">
              <div class="asgn-card accent-blue">
                <div class="asgn-accent"></div>
                <div class="asgn-ico-wrap ico-blue">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <div class="asgn-main">
                  <div class="asgn-title">{{ d('dl.item1_t') }}</div>
                  <div class="asgn-meta">
                    <span class="meta-due soon">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {{ d('dl.item1_due') }}
                    </span>
                    <span class="meta-sep" aria-hidden="true"></span>
                    <span class="meta-score">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                      {{ d('dl.item1_score') }}
                    </span>
                  </div>
                </div>
                <div class="asgn-status-wrap">
                  <div class="status-pill pending">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {{ d('dl.st_pending') }}
                  </div>
                  <svg class="asgn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </div>

              <div class="asgn-card accent-purple">
                <div class="asgn-accent"></div>
                <div class="asgn-ico-wrap ico-blue">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <div class="asgn-main">
                  <div class="asgn-title">{{ d('dl.item2_t') }}</div>
                  <div class="asgn-meta">
                    <span class="meta-score">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                      {{ d('dl.item2_score') }}
                    </span>
                  </div>
                </div>
                <div class="asgn-status-wrap">
                  <div class="status-pill grading">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    {{ d('dl.st_grading') }}
                  </div>
                  <svg class="asgn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </div>

              <div class="asgn-card accent-green">
                <div class="asgn-accent"></div>
                <div class="asgn-ico-wrap ico-green">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <div class="asgn-main">
                  <div class="asgn-title">{{ d('dl.item3_t') }}</div>
                  <div class="asgn-meta">
                    <span class="meta-score">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                      {{ d('dl.item3_score') }}
                    </span>
                  </div>
                </div>
                <div class="asgn-status-wrap">
                  <div class="status-pill graded">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    87/100
                  </div>
                  <svg class="asgn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </div>

              <div class="asgn-card accent-red">
                <div class="asgn-accent"></div>
                <div class="asgn-ico-wrap ico-red">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <div class="asgn-main">
                  <div class="asgn-title">{{ d('dl.item4_t') }}</div>
                  <div class="asgn-meta">
                    <span class="meta-due overdue">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {{ d('dl.item4_due') }}
                    </span>
                  </div>
                </div>
                <div class="asgn-status-wrap">
                  <div class="status-pill late">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {{ d('dl.st_late') }}
                  </div>
                  <svg class="asgn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </div>
            </div>

            <!-- Реплика AssignmentDetailPanel: сдача работы файлом
                 с комментарием и статусом до дедлайна -->
            <div class="subm-card reveal reveal-delay-1" aria-hidden="true">
              <div class="sc-head">{{ d('subm.head') }}</div>
              <div class="sc-sub">{{ d('dl.item3_t') }} · {{ d('dl.item3_score') }}</div>
              <div class="sc-file">
                <FileTypeIcon url="student_answer.docx" size="compact" />
                <span class="sc-fname">{{ d('subm.attach') }}</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="sc-comment">{{ d('subm.comment') }}</div>
              <div class="sc-send">{{ d('subm.send') }}</div>
              <div class="sc-done">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><polyline points="20 6 9 17 4 12"/></svg>
                {{ d('subm.done') }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== FINAL CTA ===== -->
      <section class="cta-final">
        <div class="orb cf-orb-a" aria-hidden="true"></div>
        <div class="orb cf-orb-b" aria-hidden="true"></div>
        <div class="cf-inner">
          <h2 class="cf-title reveal">
            {{ d('cta.title_1') }}<br/><span class="grad-text shimmer">{{ d('cta.title_2') }}</span>
          </h2>
          <p class="cf-sub reveal reveal-delay-1">{{ d('cta.sub') }}</p>
          <div class="cf-actions reveal reveal-delay-2">
            <NuxtLink to="/org" class="btn btn-teal btn-lg cf-btn">{{ d('cta.main') }}
              <svg class="cf-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </NuxtLink>
          </div>
        </div>
      </section>
    </main>

    <!-- ===== FOOTER ===== -->
    <footer class="lfooter">
      <div class="lf-inner">
        <div class="lf-brandcol">
          <div class="lf-brand"><span class="l-logo sm"></span>Chatra</div>
          <p class="lf-tag">{{ d('foot.tag') }}</p>
          <div class="lang-pill lf-lang" role="tablist">
            <button v-for="l in langs" :key="l.code" :class="['lang-p', { active: lang === l.code }]"
              role="tab" :aria-selected="lang === l.code" @click="setLang(l.code)">{{ l.label }}</button>
          </div>
        </div>

        <nav class="lf-cols">
          <div class="lf-col">
            <div class="lf-h">{{ d('foot.col_product') }}</div>
            <a href="#features">{{ d('nav.features') }}</a>
            <a href="#subject-ai">{{ d('nav.subject_ai') }}</a>
            <a href="#cohorts">{{ d('cohorts.nav_label') }}</a>
            <a href="#chatra-ai">Chatra AI</a>
            <a href="#grader">AI Grader</a>
            <a href="#deadlines">{{ d('nav.deadlines') }}</a>
          </div>
          <div class="lf-col">
            <div class="lf-h">{{ d('foot.col_docs') }}</div>
            <NuxtLink to="/privacy">{{ d('foot.privacy') }}</NuxtLink>
            <NuxtLink to="/terms">{{ d('foot.terms') }}</NuxtLink>
            <NuxtLink to="/rules">{{ d('foot.rules') }}</NuxtLink>
          </div>
          <div class="lf-col">
            <div class="lf-h">{{ d('foot.col_support') }}</div>
            <NuxtLink to="/login">{{ d('nav.login') }}</NuxtLink>
            <a href="https://t.me/whynickyy" target="_blank" rel="noopener">Telegram</a>
            <a href="https://t.me/whynickyy" target="_blank" rel="noopener">{{ d('foot.support') }}</a>
          </div>
        </nav>
      </div>
      <div class="lf-bar">
        <div class="lf-bar-inner">
          <span>© {{ year }} Chatra</span>
          <span>{{ d('foot.made') }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { useOrgStore, applyOrgTheme } from '~/stores/org.store'
import { createSpring, createReducedMotionSpring, type SpringHandle } from '~/composables/useSpring'
import { useReducedMotion } from '~/composables/useReducedMotion'

definePageMeta({ layout: false })
useHead({ title: 'Chatra - AI for Education' })

const { lang, setLang } = useI18n()
const org = useOrgStore()
// Лендинг доступен и без выбранной организации: тема по умолчанию — университетская.
if (import.meta.client && !org.isSelected) {
  org.init()
  applyOrgTheme(org.orgTypeString as any)
}

function makeDict(l: 'ru' | 'en' | 'kk') {
  return {
    nav: {
      features: { ru: 'Возможности', en: 'Features', kk: 'Мүмкіндіктер' }[l],
      subject_ai: { ru: 'ИИ предметов', en: 'Subject AI', kk: 'Пән ЖИ' }[l],
      highlights: { ru: 'Выделения', en: 'Highlights', kk: 'Белгілеулер' }[l],
      grader: { ru: 'AI Grader', en: 'AI Grader', kk: 'AI Grader' }[l],
      deadlines: { ru: 'Дедлайны', en: 'Deadlines', kk: 'Мерзімдер' }[l],
      login: { ru: 'Войти', en: 'Log in', kk: 'Кіру' }[l],
    },
    cta: {
      main: { ru: 'Начать', en: 'Get started', kk: 'Бастау' }[l],
      short: { ru: 'Начать', en: 'Get started', kk: 'Бастау' }[l],
      title_1: { ru: 'Ваша учёба.', en: 'Your studies.', kk: 'Оқуыңыз.' }[l],
      title_2: { ru: 'Теперь эффективнее.', en: 'Now more effective.', kk: 'Енді тиімдірек.' }[l],
      sub: {
        ru: 'Лекции, ИИ для каждого предмета и все дедлайны - в одном приложении.',
        en: 'Lectures, an AI for every subject and every deadline - in one app.',
        kk: 'Дәрістер, әр пәнге арналған ЖИ және барлық мерзімдер - бір қосымшада.',
      }[l],
    },
    hero: {
      title_1: { ru: 'Всё для учёбы.', en: 'Everything for studying.', kk: 'Барлығы оқу үшін.' }[l],
      title_2: { ru: 'В одном месте.', en: 'In one place.', kk: 'Бір жерде.' }[l],
      sub: {
        ru: 'Лекции, задания, дедлайны и помощь с учёбой - Chatra собирает всё необходимое в одном приложении.',
        en: 'Lectures, assignments, deadlines and study help - Chatra brings everything you need into one app.',
        kk: 'Дәрістер, тапсырмалар, мерзімдер және оқу көмекші - Chatra барлық қажеттіні бір қосымшада жинайды.',
      }[l],
    },
    demo: {
      subject: { ru: 'Физика · ИИ предмета', en: 'Physics · Subject AI', kk: 'Физика · Пән ЖИ' }[l],
      status: { ru: 'знает 12 лекций', en: 'knows 12 lectures', kk: '12 дәрісті біледі' }[l],
      placeholder: { ru: 'Спросите Chatra AI', en: 'Ask Chatra AI', kk: 'Chatra ЖИ-ден сұраңыз' }[l],
    },
    msgs: [
      { own: true, text: { ru: 'Объясни квантовый туннельный эффект простыми словами', en: 'Explain quantum tunneling in simple words', kk: 'Кванттық туннель эффектісін қарапайым тілмен түсіндір' }[l] },
      { text: { ru: 'Согласно лекции №8: представьте мяч, который отскакивает от стены. Квантовая частица иногда оказывается «по ту сторону» - с некоторой вероятностью она проходит через барьер…', en: "From lecture №8: imagine a ball bouncing off a wall. A quantum particle sometimes ends up 'on the other side' - with some probability it passes through the barrier…", kk: '№8 дәріс бойынша: доп қабырғадан секіреді елестетіңіз. Кванттық бөлшек кейде «екінші жағында» болады - белгілі бір ықтималдықпен кедергіден өтеді…' }[l] },
      { own: true, text: { ru: 'Составь план ответа к семинару', en: 'Make me a seminar answer outline', kk: 'Семинарға жауап жоспарын құр' }[l] },
      { text: { ru: 'Вот структура из трёх шагов: определение → физический смысл → эксперименты. Развернуть каждый пункт?', en: 'Here is a three-step structure: definition → physical meaning → experiments. Expand each point?', kk: 'Үш қадамдық құрылым: анықтама → физикалық мағына → тәжірибелер. Әр пунктті ашайын ба?' }[l] },
    ],
    features: {
      kicker: { ru: 'ВОЗМОЖНОСТИ', en: 'FEATURES', kk: 'МҮМКІНДІКТЕР' }[l],
      title: { ru: 'Всё, что нужно для учёбы - в одном месте', en: 'Everything you need to study - in one place', kk: 'Оқуға қажеттінің бәрі - бір жерде' }[l],
      sub: {
        ru: 'Chatra объединяет ИИ, материалы предметов и успеваемость в одном продуманном приложении.',
        en: 'Chatra brings AI, course materials and progress together in one thoughtfully designed app.',
        kk: 'Chatra ЖИ, пән материалдары мен үлгерімді бір ойластырылған қосымшада біріктіреді.',
      }[l],
    },
    f: {
      chat: {
        title: { ru: 'ИИ-ассистент', en: 'AI assistant', kk: 'ЖИ-көмекші' }[l],
        text: {
          ru: 'Задавайте вопросы - от разбора темы до подготовки к экзамену. Важные диалоги сохраняются и всегда под рукой.',
          en: 'Ask anything - from topic breakdowns to exam prep. Important conversations are saved and always at hand.',
          kk: 'Кез келген сұрақ қойыңыз - тақырыптан емтиханға дейін. Маңызды диалогтер сақталып, әрқашан қол астында.',
        }[l],
        q: { ru: 'Как взять интеграл по частям?', en: 'How does integration by parts work?', kk: 'Бөліктер бойынша интегралдау қалай?' }[l],
        a: { ru: 'Разберём формулу на примере…', en: 'Let’s walk through the formula with an example…', kk: 'Формуланы мысалмен талдайық…' }[l],
      },
      subjects: {
        title: { ru: 'Все предметы - в одном месте', en: 'Every subject in one place', kk: 'Барлық пән бір жерде' }[l],
        text: {
          ru: 'Материалы, задания и прогресс по каждому предмету - в одной аккуратной сетке с обложками.',
          en: 'Materials, assignments and progress for every subject - in one tidy grid with covers.',
          kk: 'Әр пәннің материалдары, тапсырмалары мен үлгерімі - мұқабалары бар бір ретте тізімінде.',
        }[l],
        s1: { ru: 'Физика', en: 'Physics', kk: 'Физика' }[l],
        s2: { ru: 'Математика', en: 'Math', kk: 'Математика' }[l],
        s3: { ru: 'Биология', en: 'Biology', kk: 'Биология' }[l],
      },
      prog: {
        title: { ru: 'Прогресс как на ладони', en: 'Progress at a glance', kk: 'Үлгерім алақанда' }[l],
        text: {
          ru: 'Баллы, проценты успеваемости и ближайший дедлайн видны прямо на карточке предмета.',
          en: 'Scores, performance and the next deadline are right on the subject card.',
          kk: 'Ұпай, үлгерім пайызы және келесі мерзім - тікелей пән карточкасында.',
        }[l],
      },
      files: {
        title: { ru: 'Лекции и файлы', en: 'Lectures & files', kk: 'Дәрістер мен файлдар' }[l],
        text: {
          ru: 'PDF, DOCX и презентации хранятся вместе с предметом. Читайте, выделяйте и спрашивайте ИИ прямо в документе.',
          en: 'PDFs, DOCX and slides live with each subject. Read, highlight and ask the AI right inside the document.',
          kk: 'PDF, DOCX және презентациялар пәнмен бірге сақталады. Оқыңыз, белгілеңіз және құжаттың ішінде ЖИ-ден сұраңыз.',
        }[l],
      },
      grader: {
        title: { ru: 'AI Grader', en: 'AI Grader', kk: 'AI Grader' }[l],
        text: {
          ru: 'Обратная связь сразу после сдачи: баллы, сильные стороны и то, что стоит улучшить.',
          en: 'Feedback the moment you submit: scores, strengths and what to improve.',
          kk: 'Тапсырғаннан кейін бірден кері байланыс: ұпайлар, күшті жақтары мен жақсарту керегі.',
        }[l],
        grading: { ru: 'Проверяется', en: 'Grading', kk: 'Тексерілуде' }[l],
      },
      tasks: {
        title: { ru: 'Задания и дедлайны', en: 'Assignments & deadlines', kk: 'Тапсырмалар мен мерзімдер' }[l],
        text: {
          ru: 'Все задания и сроки - в одном календаре. Сразу видно, что сдано, что на проверке и что требует внимания.',
          en: 'All assignments and due dates in one calendar. See at a glance what’s done, in review, or overdue.',
          kk: 'Барлық тапсырма мен мерзім бір күнтізбеде. Не тапсырылғаны, не тексерілуде, не кешіктірілгені бірден көрінеді.',
        }[l],
      },
      notif: {
        title: { ru: 'Уведомления в реальном времени', en: 'Real-time notifications', kk: 'Нақты уақыттағы хабарламалар' }[l],
        text: {
          ru: 'Новые материалы, оценки и ответы ИИ приходят мгновенно - ничего не нужно обновлять вручную.',
          en: 'New materials, grades and AI replies arrive instantly - no manual refresh needed.',
          kk: 'Жаңа материалдар, бағалар мен ЖИ жауаптары бірден келеді - қолмен жаңартудың қажеті жоқ.',
        }[l],
      },
    },
    sa: {
      kicker: { ru: 'ИИ ПРЕДМЕТА', en: 'SUBJECT AI', kk: 'ПӘН ЖИ' }[l],
      class_name: { ru: 'Физика', en: 'Physics', kk: 'Физика' }[l],
      class_teacher: { ru: 'Преподаватель: А. Иванов', en: 'Teacher: A. Ivanov', kk: 'Мұғалім: А. Иванов' }[l],
      tab_lectures: { ru: 'Лекции', en: 'Lectures', kk: 'Дәрістер' }[l],
      tab_tasks: { ru: 'Задания', en: 'Tasks', kk: 'Тапсырмалар' }[l],
      tab_ai: { ru: 'ИИ-чат', en: 'AI chat', kk: 'ЖИ-чат' }[l],
      title: { ru: 'ИИ, который прочитал все лекции вашего предмета', en: 'An AI that has read every lecture of your subject', kk: 'Пәніңіздің барлық дәрісін оқыған ЖИ' }[l],
      text: {
        ru: 'Выберите предмет - с ним будет работать собственный ассистент, отвечающий со ссылками на конкретные лекции и файлы.',
        en: 'Pick a subject and its dedicated assistant answers with references to specific lectures and files.',
        kk: 'Пәнді таңдаңыз - оның жеке көмекшісі нақты дәрістер мен файлдарға сілтеме жасап жауап береді.',
      }[l],
      points: [
        { ru: 'Знает контекст каждой лекции - темы, термины и формулы', en: 'Knows the context of every lecture - topics, terms and formulas', kk: 'Әр дәрістің контекстін біледі - тақырыптан формулаларға дейін' }[l],
        { ru: 'Каждый ответ - со ссылкой на источник: лекцию или файл', en: 'Every answer cites its source - a lecture or a file', kk: 'Әр жауап дереккөзді көрсетеді - дәріс немесе файл' }[l],
        { ru: 'Понимает графики и обозначения именно вашего курса', en: 'Understands your course’s graphs and notation', kk: 'Сіздің курсіңіздің графиктері мен белгіленімін түсінеді' }[l],
        { ru: 'Хранит историю ваших диалогов по каждому предмету', en: 'Keeps your per-subject conversation history', kk: 'Пән бойынша диалог тарихын сақтайды' }[l],
      ] as string[],
    },
    hl: {
      kicker: { ru: 'МАТЕРИАЛЫ И ВЫДЕЛЕНИЯ', en: 'MATERIALS & HIGHLIGHTS', kk: 'МАТЕРИАЛДАР МЕН БЕЛГІЛЕУЛЕР' }[l],
      title: { ru: 'Выделяйте главное - и сразу спрашивайте ИИ', en: 'Highlight what matters - ask the AI right away', kk: 'Бастысын белгілеңіз - ЖИ-ден бірден сұраңыз' }[l],
      text: {
        ru: 'Откройте лекцию, выделите фрагмент и задайте вопрос по нему. Каждый отрывок сохраняется в панель «Мои выделения» - вместе с заметкой и номером страницы.',
        en: 'Open a lecture, highlight a passage and ask about it. Every highlight is saved to “My highlights” - with its note and page number.',
        kk: 'Дәрісті ашыңыз, үзіндіні белгілеңіз және одан сұраңыз. Әр үзінді «Менің белгілеулерім» панелінде жазбасымен және бет нөмірімен сақталады.',
      }[l],
      points: [
        { ru: 'Четыре цвета выделения: жёлтый, зелёный, синий, красный', en: 'Four highlight colors: yellow, green, blue, red', kk: 'Төрт түс: сары, жасыл, көк, қызыл' }[l],
        { ru: '«Спросить AI» - прямо из меню выделения', en: '“Ask AI” - straight from the selection menu', kk: '«AI-дан сұрау» - белгілеу мәзірінен бірден' }[l],
        { ru: 'Заметки к каждому выделению и переход на страницу', en: 'Notes on every highlight, with jump-to-page', kk: 'Әр белгілеуге жазба және бетке өту' }[l],
        { ru: 'Все выделения предмета - в одной панели', en: 'All highlights of a subject in one panel', kk: 'Пәннің барлық белгілеулері бір панельде' }[l],
      ] as string[],
      doc_h: { ru: 'Лекция 2 · Динамика', en: 'Lecture 2 · Dynamics', kk: '2-дәріс · Динамика' }[l],
      doc_p1: {
        ru: 'Динамика изучает причины движения тел. Основу раздела составляют три закона Ньютона, сформулированные в «Математических началах натуральной философии».',
        en: 'Dynamics studies the causes of motion. The section rests on Newton’s three laws, formulated in the “Principia Mathematica”.',
        kk: 'Динамика денелердің қозғалыс себептерін зерттейді. Бөлім Ньютонның үш заңына негізделеді.',
      }[l],
      doc_mark1: {
        ru: 'Второй закон: ускорение тела прямо пропорционально равнодействующей сил и обратно пропорционально его массе (F = ma).',
        en: 'The second law: a body’s acceleration is directly proportional to the net force and inversely proportional to its mass (F = ma).',
        kk: 'Екінші заң: дененің үдеуі resultant күшке тура пропорционал және массаға кері пропорционал (F = ma).',
      }[l],
      doc_p2: {
        ru: ' Закон справедлив только в инерциальных системах отсчёта, движущихся равномерно и прямолинейно.',
        en: ' The law holds only in inertial reference frames moving uniformly and rectilinearly.',
        kk: ' Заң тек инерциялық санақ жүйелерінде орындалады.',
      }[l],
      doc_mark2: {
        ru: 'Третий закон: тела действуют друг на друга с силами, равными по модулю и противоположными по направлению.',
        en: 'The third law: bodies exert equal and opposite forces on each other.',
        kk: 'Үшінші заң: денелер бір-біріне модулі бойынша тең және қарама-қарсы бағытталған күштермен әрекет етеді.',
      }[l],
      doc_p3: {
        ru: ' Отсюда следует закон сохранения импульса замкнутой системы.',
        en: ' From this follows momentum conservation for a closed system.',
        kk: ' Осыдан тұйық жүйенің импульс сақталу заңы шығады.',
      }[l],
      menu_note: { ru: 'Заметка', en: 'Note', kk: 'Жазба' }[l],
      menu_ask: { ru: 'Спросить AI', en: 'Ask AI', kk: 'AI-дан сұрау' }[l],
      panel_title: { ru: 'Мои выделения', en: 'My highlights', kk: 'Менің белгілеулерім' }[l],
      files_title: { ru: 'Материалы', en: 'Materials', kk: 'Материалдар' }[l],
      item1_text: {
        ru: 'ускорение тела прямо пропорционально равнодействующей сил…',
        en: 'a body’s acceleration is directly proportional to the net force…',
        kk: 'дененің үдеуі resultant күшке тура пропорционал…',
      }[l],
      item1_note: {
        ru: 'Классическое определение - спросить на семинаре',
        en: 'Classic definition - ask at the seminar',
        kk: 'Классикалық анықтама - семинарда сұрайық',
      }[l],
      item1_meta: { ru: 'Лекция 2 · стр. 4', en: 'Lecture 2 · p. 4', kk: '2-дәріс · 4-бет' }[l],
      item2_text: {
        ru: 'Закон справедлив только в инерциальных системах отсчёта…',
        en: 'The law holds only in inertial reference frames…',
        kk: 'Заң тек инерциялық санақ жүйелерінде орындалады…',
      }[l],
      item2_meta: { ru: 'стр. 5', en: 'p. 5', kk: '5-бет' }[l],
    },
    gr: {
      kicker: { ru: 'AI GRADER', en: 'AI GRADER', kk: 'AI GRADER' }[l],
      title: { ru: 'Проверка работ за секунды, а не дни', en: 'Grading in seconds, not days', kk: 'Тексеру күндер емес, секундтар ішінде' }[l],
      text: {
        ru: 'Сдайте работу - AI Grader оценит её по критериям преподавателя и подробно объяснит, что получилось и что улучшить.',
        en: 'Submit your work - AI Grader scores it against the teacher’s criteria and explains what worked and what to improve.',
        kk: 'Жұмысты тапсырыңыз - AI Grader оны мұғалімнің критерийлері бойынша бағалап, не жақсы, не жақсарту керегін түсіндіреді.',
      }[l],
      points: [
        { ru: 'Балл и процент сразу после сдачи', en: 'Score and percentage right after submission', kk: 'Ұпай мен пайыз тапсырғаннан кейін' }[l],
        { ru: 'Сильные стороны и зоны роста отдельно', en: 'Strengths and growth areas called out separately', kk: 'Күшті жақтары мен даму аймақтары бөлек' }[l],
        { ru: 'Преподаватель всегда может перепроверить оценку', en: 'The teacher can always review and override the grade', kk: 'Мұғалім бағаны әрқашан қайта тексере алады' }[l],
      ] as string[],
      card_title: { ru: 'Эссе · проверено ИИ', en: 'Essay · graded by AI', kk: 'Эссе · ЖИ тексерді' }[l],
      verdict: { ru: 'Отлично', en: 'Excellent', kk: 'Тамаша' }[l],
      by_badge: { ru: 'Проверено ИИ', en: 'Graded by AI', kk: 'ЖИ тексерген' }[l],
      sum_label: { ru: 'Разбор ИИ', en: 'AI analysis', kk: 'ЖИ талдауы' }[l],
      st_title: { ru: 'Сильные стороны', en: 'Strengths', kk: 'Күшті жақтары' }[l],
      im_title: { ru: 'Зоны роста', en: 'Areas to improve', kk: 'Даму аймақтары' }[l],
      strength: { ru: 'Чёткая структура аргументации', en: 'Clear argument structure', kk: 'Дәлелдеме құрылымы айқын' }[l],
      strength2: { ru: 'Выводы подтверждаются примерами из лекций', en: 'Conclusions are backed by lecture examples', kk: 'Қорытындылар дәріс мысалдарымен негізделген' }[l],
      improve: { ru: 'Добавьте больше ссылок на лекции', en: 'Add more references to lectures', kk: 'Дәрістерге көбірек сілтеме қосыңыз' }[l],
      improve2: { ru: 'Второй абзац можно связать с темой недели 4', en: 'Paragraph two could tie into week 4’s topic', kk: 'Екінші абзацты 4-апта тақырыбымен байланыстыруға болады' }[l],
      summary: {
        ru: 'Хорошая работа: выводы подтверждаются примерами. Чтобы поднять балл, свяжите второй абзац с темой недели 4.',
        en: 'Solid work: conclusions are backed by examples. To raise the score, tie paragraph two to week 4’s topic.',
        kk: 'Жақсы жұмыс: қорытындылар мысалдармен негізделген. Ұпайды көтеру үшін екінші абзацты 4-апта тақырыбымен байланыстырыңыз.',
      }[l],
    },
    hx: {
      p1: { ru: 'Лекции', en: 'Lectures', kk: 'Дәрістер' }[l],
      p2: { ru: 'Задания', en: 'Assignments', kk: 'Тапсырмалар' }[l],
      p3: { ru: 'Дедлайны', en: 'Deadlines', kk: 'Мерзімдер' }[l],
      p4: { ru: 'Помощь с учёбой', en: 'Study help', kk: 'Оқуға көмек' }[l],
      m1: { ru: '12 материалов по физике', en: '12 materials in Physics', kk: 'Физика бойынша 12 материал' }[l],
      m2: { ru: '3 к сдаче на этой неделе', en: '3 due this week', kk: 'Осы аптада 3 тапсыру' }[l],
      m3: { ru: 'ближайший - в пятницу', en: 'next one on Friday', kk: 'жакыны - жұма' }[l],
      m4: { ru: 'формулы, темы, черновики', en: 'formulas, topics, drafts', kk: 'формулалар, тақырыптар, жобалар' }[l],
    },
    jc: {
      kicker: { ru: 'ПРИСОЕДИНЕНИЕ', en: 'GET STARTED', kk: 'ҚОСЫЛУ' }[l],
      title: { ru: 'Один код - и вы в предмете', en: 'One code and you are in', kk: 'Бір код - және сіз топта' }[l],
      sub: {
        ru: 'Преподаватель делится шестизначным кодом. Введите его - Chatra найдёт предмет и добавит вас к группе.',
        en: 'The teacher shares a six-digit code. Enter it - Chatra finds the subject and adds you to the class.',
        kk: 'Мұғалім алты таңбалы кодпен бөліседі. Енгізіңіз - Chatra пәнді тауып, топқа қосады.',
      }[l],
      label: { ru: 'Код предмета', en: 'Class code', kk: 'Пән коды' }[l],
      join: { ru: 'Вступить', en: 'Join', kk: 'Қосылу' }[l],
      found: { ru: 'Предмет найден', en: 'Class found', kk: 'Пән табылды' }[l],
    },
    subm: {
      head: { ru: 'Сдача работы', en: 'Submit your work', kk: 'Жұмысты тапсыру' }[l],
      attach: { ru: 'essay_final.docx прикреплён', en: 'essay_final.docx attached', kk: 'essay_final.docx тіркелді' }[l],
      comment: { ru: 'Комментарий к работе…', en: 'Add a comment…', kk: 'Жұмысқа түсініктеме…' }[l],
      send: { ru: 'Сдать работу', en: 'Submit work', kk: 'Жұмысты тапсыру' }[l],
      done: { ru: 'Сдано до дедлайна', en: 'Submitted before the deadline', kk: 'Мерзімге дейін тапсырылды' }[l],
    },
    grx: {
      file: { ru: 'essay_final.docx', en: 'essay_final.docx', kk: 'essay_final.docx' }[l],
      crit_label: { ru: 'Критерии', en: 'Criteria', kk: 'Критерийлер' }[l],
      crit1: { ru: 'Аргументация', en: 'Argumentation', kk: 'Дәлелдеме' }[l],
      crit2: { ru: 'Структура и логика', en: 'Structure & logic', kk: 'Құрылым мен логика' }[l],
      crit3: { ru: 'Работа с источниками', en: 'Use of sources', kk: 'Дереккөздермен жұмыс' }[l],
      teacher_note: { ru: 'Оценку подтвердил преподаватель', en: 'Grade confirmed by the teacher', kk: 'Бағаны мұғалім растады' }[l],
      teacher_time: { ru: 'проверено вручную', en: 'manually reviewed', kk: 'қолмен тексерілді' }[l],
    },
    ai: {
      kicker: { ru: 'CHATRA AI', en: 'CHATRA AI', kk: 'CHATRA AI' }[l],
      title: { ru: 'Ваш ИИ - за пределами предметов', en: 'Your AI, beyond every subject', kk: 'ЖИіңіз - пәндерден тыс' }[l],
      sub: {
        ru: 'Отдельный ассистент для всего остального: подготовка к экзаменам, разбор сложных тем, черновики и идеи. Все диалоги сохраняются и всегда под рукой.',
        en: 'A separate assistant for everything else: exam prep, hard topics, drafts and ideas. Every conversation is saved and always at hand.',
        kk: 'Қалғанының бәріне арналған жеке көмекші: емтиханға дайындық, күрделі тақырыптар, жобалар мен идеялар. Әр диалог сақталады.',
      }[l],
      points: [
        { ru: 'История всех диалогов - с поиском и закреплением', en: 'Full chat history - with search and pins', kk: 'Диалогтер тарихы - іздеу мен бекітумен' }[l],
        { ru: 'Понимает формулы и академические обозначения', en: 'Understands formulas and academic notation', kk: 'Формулалар мен академиялық белгілерді түсінеді' }[l],
        { ru: 'Продолжайте разговор с места, где остановились', en: 'Pick up any conversation where you left off', kk: 'Әңгімені қалдырған жерден жалғастырыңыз' }[l],
      ] as string[],
      search: { ru: 'Поиск', en: 'Search', kk: 'Іздеу' }[l],
      new_chat: { ru: 'Новый чат', en: 'New chat', kk: 'Жаңа чат' }[l],
      pin_label: { ru: 'Закреплённые', en: 'Pinned', kk: 'Бекітілген' }[l],
      recent: { ru: 'Недавние', en: 'Recent', kk: 'Жаңа' }[l],
      c1: { ru: 'Курсовая: план глав', en: 'Thesis: chapter outline', kk: 'Курсовая: тараулар жоспары' }[l],
      c2: { ru: 'Квадратные уравнения', en: 'Quadratic equations', kk: 'Квадрат теңдеулер' }[l],
      c3: { ru: 'Подготовка к IELTS', en: 'IELTS preparation', kk: 'IELTS дайындық' }[l],
      c4: { ru: 'Конспект по истории', en: 'History notes', kk: 'Тарих конспектісі' }[l],
      q: { ru: 'Реши уравнение x² − 5x + 6 = 0 и объясни шаги', en: 'Solve x² − 5x + 6 = 0 and explain the steps', kk: 'x² − 5x + 6 = 0 теңдеуін шешіп, қадамдарын түсіндір' }[l],
      a1: { ru: 'Решаем через дискриминант:', en: 'Using the discriminant:', kk: 'Дискриминант арқылы шешеміз:' }[l],
      a2: { ru: 'значит, корни уравнения:', en: 'so the roots are:', kk: 'демек, теңдеудің түбірлері:' }[l],
      follow: { ru: 'А если дискриминант отрицательный?', en: 'What if the discriminant is negative?', kk: 'Ал дискриминант теріс болса?' }[l],
      placeholder: { ru: 'Спросите о чём угодно…', en: 'Ask anything…', kk: 'Кез келген нәрсені сұраңыз…' }[l],
    },
    roles: {
      kicker: { ru: 'СТУДЕНТАМ И ПРЕПОДАВАТЕЛЯМ', en: 'FOR STUDENTS & TEACHERS', kk: 'СТУДЕНТЕРГЕ МЕН МҰҒАЛІМДЕРГЕ' }[l],
      title: { ru: 'Одна платформа для всей учебной группы', en: 'One platform for the whole class', kk: 'Толық топ үшін бір платформа' }[l],
      sub: {
        ru: 'Студенты учатся и сдают работы. Преподаватели создают задания с критериями и принимают решения об оценках. AI ускоряет рутину - финальное слово всегда за человеком.',
        en: 'Students study and submit work. Teachers create assignments with criteria and decide on grades. AI speeds up the routine - humans make the final call.',
        kk: 'Студенттер оқып, жұмыс тапсырады. Мұғалімдер критерийлері бар тапсырмалар жасап, бағаны шешеді. ЖИ рутинді жылдамдатады - соңғы сөз әрқашан адамда.',
      }[l],
      st_badge: { ru: 'Студент', en: 'Student', kk: 'Студент' }[l],
      te_badge: { ru: 'Преподаватель', en: 'Teacher', kk: 'Мұғалім' }[l],
      today: { ru: 'Сегодня', en: 'Today', kk: 'Бүгін' }[l],
      passed: { ru: 'Сдано · оценено ИИ', en: 'Submitted · graded by AI', kk: 'Тапсырылды · ЖИ бағалаған' }[l],
      queue: { ru: 'На проверке', en: 'Review queue', kk: 'Тексеруде' }[l],
      sub1: { ru: 'Эссе «Этика ИИ» · Марат А.', en: 'Essay “Ethics of AI” · Marat A.', kk: '«ЖИ этикасы» · Марат А.' }[l],
      sub2: { ru: 'Задачи по рядам · Дана К.', en: 'Series problem set · Dana K.', kk: 'Қатарлар есептері · Дана К.' }[l],
      ai_suggested: { ru: 'предложено ИИ', en: 'suggested by AI', kk: 'ЖИ ұсынған' }[l],
      approve: { ru: 'Принять', en: 'Approve', kk: 'Қабылдау' }[l],
      bridge: { ru: 'AI предлагает - преподаватель решает', en: 'AI suggests - the teacher decides', kk: 'ЖИ ұсынады - мұғалім шешеді' }[l],
    },
    // Секция «Потоки (Cohort)»: учебные годы, архив, отложенная публикация
    // дедлайнов. Используем тот же тон, что в .roles / .sa: сначала «зачем»,
    // потом макет экрана «Задания и дедлайны» в настройках класса.
    cohorts: {
      kicker: { ru: 'ПОТОКИ УЧЕБНЫХ ЛЕТ', en: 'COHORTS', kk: 'ОҚУ ЖЫЛДАРЫНЫҢ АҒЫНДАРЫ' }[l],
      title: {
        ru: 'Новый учебный год - одним нажатием, без потерь',
        en: 'New academic year in one click, with no lost work',
        kk: 'Жаңа оқу жылы - бір батырмамен, жұмысты жоғалтпай',
      }[l],
      text: {
        ru: 'Включите «Годовой поток» - старые ученики уйдут в архив, а новые присоединятся по тому же коду. Все материалы, задания и оценки сохранятся за каждым годом.',
        en: 'Enable “Yearly cohort” and last year’s students move to the archive while new students join via the same code. All materials, assignments and grades stay with their year.',
        kk: '«Жылдық ағынды» қосыңыз - өткен жылғы оқушылар мұрағатқа көшеді, жаңалары сол кодпен қосылады. Материалдар, тапсырмалар мен бағалар жыл сайын сақталады.',
      }[l],
      points: [
        { ru: 'Один предмет - несколько учебных годов в истории', en: 'One subject - several academic years in its history', kk: 'Бір пән - бірнеше оқу жылы тарихында' }[l],
        { ru: 'Задания нового года стартуют как черновики - проверьте и опубликуйте', en: 'Next year’s assignments start as drafts - review and publish', kk: 'Жаңа жыл тапсырмалары жоба ретінде басталады - тексеріп, жариялаңыз' }[l],
        { ru: 'Архив виден только преподавателю и его студентам', en: 'Archive is visible only to the teacher and their students', kk: 'Мұрағат тек мұғалім мен оның оқушыларына көрінеді' }[l],
        { ru: 'Ученики прошлых лет могут посмотреть свои оценки, но не сдавать', en: 'Past-year students can review their grades, not submit new work', kk: 'Өткен жылғы оқушылар бағаларын көре алады, бірақ тапсыра алмайды' }[l],
      ] as string[],
      // Демо-модалка «Задания и дедлайны»: имитация экрана настроек класса
      // (только что добавили такой в pages/classes/[id].vue). Здесь
      // показываем два потока — активный и архивный — и три строки дедлайнов
      // с разными состояниями: опубликовано, черновик со сдвигом, без срока.
      modal_title: { ru: 'Задания и дедлайны', en: 'Assignments & deadlines', kk: 'Тапсырмалар мен мерзімдер' }[l],
      cohort_active_label: { ru: '2026/2027 · активный', en: '2026/2027 · active', kk: '2026/2027 · белсенді' }[l],
      cohort_archived_label: { ru: '2024/2025 · архив', en: '2024/2025 · archive', kk: '2024/2025 · мұрағат' }[l],
      a1_t: { ru: 'Эссе «Этика ИИ»', en: '“Ethics of AI” essay', kk: '«ЖИ этикасы» эссе' }[l],
      a1_due: { ru: '22 окт 2026 · 23:59', en: 'Oct 22, 2026 · 23:59', kk: '22 қаз 2026 · 23:59' }[l],
      a2_t: { ru: 'Лабораторная №3', en: 'Lab report №3', kk: '№3 зертханалық' }[l],
      a2_due: { ru: '15 окт 2026 · 23:59', en: 'Oct 15, 2026 · 23:59', kk: '15 қаз 2026 · 23:59' }[l],
      a2_hint: { ru: 'Дата сдвинута автоматически — проверьте', en: 'Date shifted automatically — please review', kk: 'Күн автоматты жылжытылды — тексеріңіз' }[l],
      a3_t: { ru: 'Тренировка: интегралы', en: 'Practice: integrals', kk: 'Жаттығу: интегралдар' }[l],
      a3_due: { ru: 'Без срока', en: 'No deadline', kk: 'Мерзімсіз' }[l],
      draft: { ru: 'Черновик', en: 'Draft', kk: 'Жоба' }[l],
      published: { ru: 'Опубликовано', en: 'Published', kk: 'Жарияланды' }[l],
      drafts_count: { ru: '2 черновика', en: '2 drafts', kk: '2 жоба' }[l],
      publish_all: { ru: 'Опубликовать все', en: 'Publish all', kk: 'Барлығын жариялау' }[l],
      nav_label: { ru: 'Потоки', en: 'Cohorts', kk: 'Ағымдар' }[l],
    },
    cal: {
      month: { ru: 'Октябрь', en: 'October', kk: 'Қазан' }[l],
      week: { ru: ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'], en: ['MO','TU','WE','TH','FR','SA','SU'], kk: ['ДҰ','СЙ','СӘ','БЕ','ЖҮ','СБ','ЖЕ'] }[l] as string[],
      n1: { ru: 'Новое задание: эссе «Этика ИИ»', en: 'New assignment: “Ethics of AI” essay', kk: 'Жаңа тапсырма: «ЖИ этикасы» эссе' }[l],
      n2: { ru: '«Лабораторная №3» - дедлайн через 2 дня', en: '“Lab report №3” - due in 2 days', kk: '«№3 зертханалық жұмыс» - мерзім 2 күннен кейін' }[l],
      n3: { ru: 'Работа «Задачи по рядам» оценена на 87/100', en: '“Series problem set” was graded 87/100', kk: '«Қатарлар есептері» - 87/100 болып бағаланды' }[l],
    },
    dl: {
      kicker: { ru: 'ЗАДАНИЯ И ДЕДЛАЙНЫ', en: 'ASSIGNMENTS & DEADLINES', kk: 'ТАПСЫРМАЛАР МЕН МЕРЗІМДЕР' }[l],
      title: { ru: 'Дедлайны больше не застают врасплох', en: 'Deadlines never sneak up on you', kk: 'Мерзімдер кенеттен таңқалдырмайды' }[l],
      sub: {
        ru: 'У каждого задания - срок, баллы и статус. Сразу видно, что сдано, что на проверке и что просрочено.',
        en: 'Every assignment has a due date, points and a status. See at a glance what’s done, in review, or overdue.',
        kk: 'Әр тапсырмада мерзім, ұпай және статус. Не тапсырылғаны, не тексерілуде, не кешіктірілгені бірден көрінеді.',
      }[l],
      item1_t: { ru: 'Эссе «Этика ИИ»', en: 'Essay “Ethics of AI”', kk: '«ЖИ этикасы» эссе' }[l],
      item1_due: { ru: 'Через 2 дн.', en: 'In 2 days', kk: '2 күннен кейін' }[l],
      item1_score: { ru: '20 баллов', en: '20 points', kk: '20 ұпай' }[l],
      item2_t: { ru: 'Лабораторная работа №3', en: 'Lab report №3', kk: 'Зертханалық жұмыс №3' }[l],
      item2_score: { ru: '10 баллов', en: '10 points', kk: '10 ұпай' }[l],
      item3_t: { ru: 'Задачи по рядам', en: 'Series problem set', kk: 'Қатарлар есептері' }[l],
      item3_score: { ru: '20 баллов', en: '20 points', kk: '20 ұпай' }[l],
      item4_t: { ru: 'Проект: анализ данных', en: 'Project: data analysis', kk: 'Жоба: деректер талдауы' }[l],
      item4_due: { ru: 'Просрочено', en: 'Overdue', kk: 'Кешіктірілді' }[l],
      st_pending: { ru: 'В ожидании', en: 'Pending', kk: 'Күтілуде' }[l],
      st_grading: { ru: 'Проверяется', en: 'Grading', kk: 'Тексерілуде' }[l],
      st_late: { ru: 'Просрочено', en: 'Overdue', kk: 'Кешікті' }[l],
    },
    foot: {
      tag: {
        ru: 'Учебная платформа с ИИ для каждого предмета.',
        en: 'A learning platform with an AI for every subject.',
        kk: 'Әр пәнге арналған ЖИ бар оқу платформасы.',
      }[l],
      col_product: { ru: 'Продукт', en: 'Product', kk: 'Өнім' }[l],
      col_docs: { ru: 'Документы', en: 'Documents', kk: 'Құжаттар' }[l],
      col_support: { ru: 'Поддержка', en: 'Support', kk: 'Қолдау' }[l],
      made: {
        ru: 'Создано с вниманием к деталям',
        en: 'Crafted with attention to detail',
        kk: 'Егжей-тегжейге мұқият жасалды',
      }[l],
      privacy: { ru: 'Конфиденциальность', en: 'Privacy', kk: 'Құпиялық' }[l],
      terms: { ru: 'Условия использования', en: 'Terms of Use', kk: 'Пайдалану шарттары' }[l],
      rules: { ru: 'Правила', en: 'Rules', kk: 'Ережелер' }[l],
      support: { ru: 'Поддержка', en: 'Support', kk: 'Қолдау' }[l],
    },
  }
}
// Реактивный словарь: пересобирается при смене языка.
const dict = computed(() => makeDict(lang.value))
// В шаблоне ключи пишутся строкой с точкой ('nav.features') — идём по пути
// во вложенном объекте. Отсутствующий путь даёт '' вместо undefined,
// чтобы в разметке никогда не мелькало «undefined».
function d(path: string): any {
  const val = path.split('.').reduce<any>((o, k) => (o == null ? undefined : o[k]), dict.value)
  return val === undefined ? '' : val
}

const langs = [
  { code: 'ru' as const, label: 'RU' },
  { code: 'en' as const, label: 'EN' },
  { code: 'kk' as const, label: 'KZ' },
]

/* --- Реактивные accessibility-флаги (§14 Reduced motion) --- */
const { reducedMotion } = useReducedMotion()

/* --- Навигационная шапка: hairline-граница появляется только при скролле --- */
const scrolled = ref(false)
const heroShift = ref(0)
let scrollRaf = 0
let lastScrollTop = 0
let lastScrollT = 0

/* Velocity-aware параллакс (§3, §5): не просто `top * k`, а критически
   демпфированная "погоня" за таргетом с остаточной velocity от
   пользовательского скролла. Это даёт правильное ощущение инерции —
   при быстрой прокрутке коллаж чуть отстаёт и догоняет, при медленной
   просто следует за пальцем. */
let heroShiftVel = 0
let heroShiftRaf = 0
const tickHeroShift = (targetVal: number) => {
  cancelAnimationFrame(heroShiftRaf)
  const step = () => {
    const dt = 1 / 60
    // damping 1.0, response 0.4 → stiffness ≈ 6.25, coeff ≈ 5
    const k = 6.25
    const c = 5
    const accel = -k * (heroShift.value - targetVal) - c * heroShiftVel
    heroShiftVel += accel * dt
    heroShift.value = Math.max(0, heroShift.value + heroShiftVel * dt)
    if (Math.abs(heroShift.value - targetVal) < 0.05 && Math.abs(heroShiftVel) < 0.05) {
      heroShift.value = targetVal
      heroShiftVel = 0
      return
    }
    heroShiftRaf = requestAnimationFrame(step)
  }
  step()
}

const onScroll = (e: Event) => {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    const target = e.target as HTMLElement
    const now = performance.now()
    const top = target.scrollTop
    scrolled.value = top > 8
    if (!reducedMotion.value) {
      const dt = Math.max(1, now - lastScrollT)
      const instVel = (top - lastScrollTop) / (dt / 1000)
      // Передаём пользовательскую velocity в текущую spring'овую позицию —
      // на быстром прокручивании вниз коллаж "убегает" чуть вперёд.
      heroShiftVel = heroShiftVel * 0.5 + instVel * 0.06 * 0.5
      lastScrollTop = top
      lastScrollT = now
      tickHeroShift(Math.max(0, Math.min(top, 900)) * 0.06)
    } else {
      heroShift.value = Math.max(0, Math.min(top, 900)) * 0.06
    }
    scrollRaf = 0
  })
}
const toTop = () => {
  document.querySelector('.landing')?.scrollTo({ top: 0, behavior: 'smooth' })
}

/* --- Демо-чат в hero: сообщения появляются по очереди с индикатором набора,
       затем цикл повторяется. При prefers-reduced-motion показываем всё сразу. --- */
const visibleCount = ref(0)
const typing = ref(false)
let timers: ReturnType<typeof setTimeout>[] = []

const scheduleLoop = () => {
  const clearAll = () => { timers.forEach(clearTimeout); timers = [] }
  let cancelled = false
  const run = () => {
    if (cancelled || !dict.value.msgs.length) return
    visibleCount.value = 0
    typing.value = false
    dict.value.msgs.forEach((_, i) => {
      if (i % 2 === 1) {
        // перед ответом ИИ — индикатор набора
        timers.push(setTimeout(() => { typing.value = true }, i * 2600 - 1100))
        timers.push(setTimeout(() => { typing.value = false; visibleCount.value = i + 1 }, i * 2600))
      } else {
        timers.push(setTimeout(() => { visibleCount.value = i + 1 }, i * 2600))
      }
    })
    timers.push(setTimeout(run, dict.value.msgs.length * 2600 + 3200))
  }
  run()
  return () => { cancelled = true; clearAll() }
}

/* --- Reveal-логика: CSS-transition через класс .revealed (§1) ---
   Стили: .reveal { opacity: 0; transform: translateY(12px); } +
   .reveal.revealed { opacity: 1; transform: none; transition: .55s; }
   IntersectionObserver ставит .revealed на видимых элементах —
   это сохраняет быстрый скролл (CSS-transition дешевле JS-spring). */
let revealObserver: IntersectionObserver | null = null

/* --- Hover-микро-motion через JS spring (§4, §1) ---
   Применяем ко всем CTA / карточкам, которые пользователь может
   "потрогать". При pointerenter запускаем spring вверх (y -4, scale 1.005),
   при pointerleave — обратно. На touch-устройствах (hover: none) — не
   навешиваем, чтобы не было "застрявшего" состояния после тапа. */
let hoverSprings: SpringHandle[] = []
const setupHoverSpring = (
  selector: string,
  hover: { y: number; scale: number },
  press: { scale: number } = { scale: 0.97 },
) => {
  if (reducedMotion.value) return
  if (typeof window !== 'undefined' && window.matchMedia?.('(hover: none)').matches) return
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    let mode: 'idle' | 'hover' | 'press' = 'idle'
    const animateTo = (targetY: number, targetS: number) => {
      const h = createSpring({
        from: 0,
        to: 1,
        damping: 1.0,
        response: 0.28,
        onUpdate: (p) => {
          // читаем текущее значение через presentation-значения,
          // иначе при быстром enter/leave будет jump
          el.style.transform = `translateY(${(1 - p) * 0 + p * targetY}px) scale(${1 + (p * (targetS - 1))})`
        },
        onRest: () => {
          if (mode === 'idle') {
            el.style.transform = ''
          }
        },
      })
      hoverSprings.push(h)
    }
    el.addEventListener('pointerenter', () => {
      mode = 'hover'
      animateTo(hover.y, hover.scale)
    })
    el.addEventListener('pointerleave', () => {
      mode = 'idle'
      animateTo(0, 1)
    })
    el.addEventListener('pointerdown', () => {
      mode = 'press'
      animateTo(hover.y, press.scale)
    })
    el.addEventListener('pointerup', () => {
      mode = 'hover'
      animateTo(hover.y, hover.scale)
    })
  })
}

/* --- Демо-диалог ИИ предмета (показывается в табе «ИИ-чат») --- */
const subjects = computed(() => [
  { name: { ru: 'Математика', en: 'Mathematics', kk: 'Математика' }[lang.value], color: '#3730a3',
    q: { ru: 'Откуда взялась формула в лекции 5?', en: 'Where does the lecture 5 formula come from?', kk: '5-дәрістегі формула қайдан шыққан?' }[lang.value],
    a: { ru: 'Мы выводим её из определения предела: см. шаги 2–4 в лекции 5, страница 12…', en: 'We derive it from the limit definition: see steps 2–4 in lecture 5, page 12…', kk: 'Оны шектің анықтамасынан шығарамыз: 5-дәріс, 12-бет, 2–4 қадамдарды қараңыз…' }[lang.value],
    src: { ru: 'Источник: lecture_05.pdf', en: 'Source: lecture_05.pdf', kk: 'Дереккөз: lecture_05.pdf' }[lang.value] },
  { name: { ru: 'Физика', en: 'Physics', kk: 'Физика' }[lang.value], color: '#065f46',
    q: { ru: 'Объясни второй закон Ньютона на примерах', en: 'Explain Newton’s second law with examples', kk: 'Ньютонның екінші заңын мысалдармен түсіндір' }[lang.value],
    a: { ru: 'F = ma связывает силу, массу и ускорение. В лекции 2 разобраны три примера: …', en: 'F = ma links force, mass and acceleration. Lecture 2 walks through three examples: …', kk: 'F = ma күш, масса және үдеуді байланыстырады. 2-дәрісте үш мысал талданады: …' }[lang.value],
    src: { ru: 'Источник: lecture_02.pdf', en: 'Source: lecture_02.pdf', kk: 'Дереккөз: lecture_02.pdf' }[lang.value] },
  { name: { ru: 'История', en: 'History', kk: 'Тарих' }[lang.value], color: '#9f1239',
    q: { ru: 'Каковы основные причины реформы?', en: 'What were the main causes of the reform?', kk: 'Реформаның негізгі себептері қандай?' }[lang.value],
    a: { ru: 'Лекция 4 выделяет три причины: экономическое давление, …', en: 'Lecture 4 identifies three causes: economic pressure, …', kk: '4-дәріс үш себепті атап көрсетеді: экономикалық қысым, …' }[lang.value],
    src: { ru: 'Источник: lecture_04.pdf', en: 'Source: lecture_04.pdf', kk: 'Дереккөз: lecture_04.pdf' }[lang.value] },
])

/* --- Макет страницы предмета: табы как на сайте (Лекции/Задания/ИИ-чат) --- */
const clsTab = ref(0)
const activeSubject = ref(1)
const lectures = computed(() => [
  { ru: 'Лекция 1 · Кинематика', en: 'Lecture 1 · Kinematics', kk: '1-дәріс · Кинематика' }[lang.value],
  { ru: 'Лекция 2 · Динамика', en: 'Lecture 2 · Dynamics', kk: '2-дәріс · Динамика' }[lang.value],
  { ru: 'Лекция 3 · Законы сохранения', en: 'Lecture 3 · Conservation laws', kk: '3-дәріс · Сақтық заңдары' }[lang.value],
])
const clsAssignments = computed(() => [
  { t: { ru: 'Лабораторная работа №1', en: 'Lab report №1', kk: 'Зертханалық жұмыс №1' }[lang.value],
    m: { ru: '10 баллов · до пятницы', en: '10 points · due Friday', kk: '10 ұпай · жұмаға дейін' }[lang.value],
    s: { ru: 'Проверяется', en: 'Grading', kk: 'Тексерілуде' }[lang.value], pill: 'grading' },
  { t: { ru: 'Задачи по динамике', en: 'Dynamics problem set', kk: 'Динамика есептері' }[lang.value],
    m: { ru: '20 баллов', en: '20 points', kk: '20 ұпай' }[lang.value],
    s: { ru: 'В ожидании', en: 'Pending', kk: 'Күтілуде' }[lang.value], pill: 'pending' },
])

/* --- Макет календаря: октябрь, у части дней — точки заданий --- */
const calMarks: Record<number, string> = { 10: 'upcoming', 13: 'soon', 16: 'done', 22: 'overdue' }
const calSel = 10
const calCells = [...Array(3).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1), null]

/* --- Критерии AI Grader (для баров разбора оценки) --- */
const grCrits = computed(() => [
  { name: d('grx.crit1'), score: 9 },
  { name: d('grx.crit2'), score: 8 },
  { name: d('grx.crit3'), score: 9 },
])

/* --- Секция AI Grader: ScoreRing монтируем только когда карточка видна,
       чтобы счётчик «набегал» на глазах у пользователя --- */
const graderSection = ref<HTMLElement | null>(null)
const graderShown = ref(reducedMotion.value)
let graderObserver: IntersectionObserver | null = null

/* --- Tabs-indicator в Subject AI: spring с velocity handoff (§3, §5) ---
   Читаем presentation-значение (текущий translateX) перед сменой таргета,
   чтобы при быстром переключении 0→2 индикатор не прыгал через 1,
   а плавно догонял. */
const tabsIndicatorEl = ref<HTMLElement | null>(null)
let tabsIndicatorSpring: SpringHandle | null = null

const ensureTabsIndicatorSpring = () => {
  if (tabsIndicatorSpring || reducedMotion.value) return
  if (!tabsIndicatorEl.value) return
  // Читаем текущее presentation-значение из inline-transform, не из логики.
  const m = new DOMMatrixReadOnly(getComputedStyle(tabsIndicatorEl.value).transform || 'none')
  const currentTx = m.m41
  tabsIndicatorSpring = createSpring({
    from: currentTx,
    to: currentTx,
    damping: 1.0,
    response: 0.32,
    onUpdate: (v) => {
      if (tabsIndicatorEl.value) tabsIndicatorEl.value.style.transform = `translateX(${v}px)`
    },
  })
}

watch(clsTab, (n) => {
  ensureTabsIndicatorSpring()
  if (reducedMotion.value) {
    if (tabsIndicatorEl.value) tabsIndicatorEl.value.style.transform = `translateX(calc(100% * ${n}))`
    return
  }
  // Прежде чем перенацелить — синхронизировать "from" с presentation,
  // чтобы при быстром повторном клике не было скачка.
  if (tabsIndicatorEl.value && tabsIndicatorSpring) {
    const m = new DOMMatrixReadOnly(getComputedStyle(tabsIndicatorEl.value).transform || 'none')
    tabsIndicatorSpring.jumpTo(m.m41)
  }
  nextTick(() => {
    if (!tabsIndicatorEl.value) return
    const parent = tabsIndicatorEl.value.parentElement
    if (!parent) return
    const targetPx = (parent.clientWidth - 6) / 3 * n
    tabsIndicatorSpring?.set(targetPx)
  })
})

/* --- Tabs-indicator в Subject AI: spring с velocity handoff (§3, §5) --- */

const visibleMsgs = computed(() => dict.value.msgs.slice(0, visibleCount.value))
let stopChat: (() => void) | null = null

/* --- Bento progress bars (pg-fill) и AI Grader criteria (gc-fill):
       при попадании в viewport заполняются spring'ом с разной скоростью. --- */
const fillSprings: SpringHandle[] = []
const miscSprings: SpringHandle[] = []

const animateBar = (el: HTMLElement, target: number, delay: number) => {
  const start = () => {
    if (reducedMotion.value) {
      el.style.width = `${target}%`
      return
    }
    el.style.width = '0%'
    const h = createSpring({
      from: 0,
      to: target,
      damping: 0.85,
      response: 0.6,
      onUpdate: (v) => { el.style.width = `${v}%` },
    })
    fillSprings.push(h)
  }
  if (delay > 0) setTimeout(start, delay)
  else start()
}

onMounted(() => {
  if (!reducedMotion.value) stopChat = scheduleLoop()

  const root = document.querySelector('.landing')
  if (root) {
    const els = root.querySelectorAll<HTMLElement>('.reveal')
    if (reducedMotion.value) {
      els.forEach((el) => el.classList.add('revealed'))
    } else {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed')
            revealObserver?.unobserve(e.target)
          }
        })
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
      els.forEach((el) => revealObserver!.observe(el))
    }
  }

  if (!graderShown.value && graderSection.value) {
    graderObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { graderShown.value = true; graderObserver?.disconnect() }
      })
    }, { threshold: 0.25 })
    graderObserver.observe(graderSection.value)
  }

  /* Bento progress bars: при первом попадании в viewport — spring-fill
     с stagger между строками. */
  const pgBars = Array.from(document.querySelectorAll<HTMLElement>('.pg-fill'))
  if (pgBars.length) {
    if (reducedMotion.value) {
      pgBars.forEach((el) => {
          const target = parseFloat(el.dataset.target ?? el.style.width ?? '0') || 0
        el.style.width = target ? `${target}%` : ''
      })
    } else {
      pgBars.forEach((el) => {
        const orig = el.style.width
        if (!orig) return
        el.dataset.target = orig
        el.style.width = '0%'
      })
      const pgObserver = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const target = parseFloat((e.target as HTMLElement).dataset.target ?? '0')
            const sibs = Array.from((e.target as HTMLElement).parentElement?.parentElement?.querySelectorAll('.pg-fill') ?? [])
            const idx = sibs.indexOf(e.target)
            animateBar(e.target as HTMLElement, target, idx * 110)
            pgObserver.unobserve(e.target)
          }
        })
      }, { threshold: 0.3 })
      pgBars.forEach((el) => pgObserver.observe(el))
    }
  }

  /* AI Grader criteria bars: spring-fill со stagger. Стратегия: даём
     каждому .gc-fill финальную ширину через inline-style (graderShown
     → true когда секция в viewport), а observer запускает лёгкий
     spring-pulse от 0 → final для драматичного «добегания». */
  const gcBars = Array.from(document.querySelectorAll<HTMLElement>('.gc-fill'))
  if (gcBars.length) {
    const gcObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          const sibs = Array.from(el.parentElement?.parentElement?.querySelectorAll('.gc-fill') ?? [])
          const idx = sibs.indexOf(el)
          // Текущая inline-ширина — финальная (graderShown=true поставил её)
          const finalPct = parseFloat(el.style.width) || 0
          if (finalPct === 0) {
            gcObserver.unobserve(el)
            return
          }
          if (reducedMotion.value) {
            gcObserver.unobserve(el)
            return
          }
          // Сбросить до 0 и пружинить обратно — даёт ощущение «заполняется на глазах»
          el.style.width = '0%'
          const start = () => {
            animateBar(el, finalPct, 0)
          }
          // Небольшая задержка, чтобы анимация «сообщила о начале»
          setTimeout(start, Math.min(idx * 130, 400))
          gcObserver.unobserve(el)
        }
      })
    }, { threshold: 0.4 })
    gcBars.forEach((el) => gcObserver.observe(el))
  }

  /* HighlightMenu (.hm): material-появление со spring scale (§12).
     При попадании в viewport — materialize, не просто fade. */
  const hms = Array.from(document.querySelectorAll<HTMLElement>('.hm'))
  if (hms.length) {
    const hmObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          el.style.opacity = '0'
          el.style.transformOrigin = '50% 100%'
          if (reducedMotion.value) {
            el.style.opacity = '1'
          } else {
            const h = createSpring({
              from: 0,
              to: 1,
              damping: 0.85,
              response: 0.4,
              onUpdate: (p) => {
                el.style.opacity = String(p)
                el.style.transform = `translate(-50%, calc(-44px - ${(1 - p) * 6}px)) scale(${0.85 + p * 0.15})`
              },
              onRest: () => {
                el.style.transform = ''
                el.style.willChange = ''
              },
            })
            miscSprings.push(h)
          }
          hmObserver.unobserve(el)
        }
      })
    }, { threshold: 0.5 })
    hms.forEach((el) => hmObserver.observe(el))
  }

  /* Join-code digits (.jd): появление по очереди, spring scale.
     "Набираются" как код из SMS, после последней цифры — .jc-found. */
  const jcCard = document.querySelector<HTMLElement>('.jc-card')
  if (jcCard) {
    const jcObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const digits = Array.from(jcCard.querySelectorAll<HTMLElement>('.jd'))
          digits.forEach((d, i) => {
            d.style.opacity = '0'
            d.style.transform = 'translateY(8px) scale(.92)'
            const start = () => {
              if (reducedMotion.value) {
                d.style.opacity = '1'
                d.style.transform = ''
                return
              }
              const h = createSpring({
                from: 0,
                to: 1,
                damping: 0.85,
                response: 0.3,
                onUpdate: (p) => {
                  d.style.opacity = String(p)
                  d.style.transform = `translateY(${(1 - p) * 8}px) scale(${0.92 + p * 0.08})`
                },
                onRest: () => {
                  d.style.transform = ''
                },
              })
              miscSprings.push(h)
            }
            setTimeout(start, i * 60)
          })
          const found = jcCard.querySelector<HTMLElement>('.jc-found')
          if (found) {
            found.style.opacity = '0'
            found.style.transform = 'translateY(10px)'
            const startFound = () => {
              if (reducedMotion.value) {
                found.style.opacity = '1'
                found.style.transform = ''
                return
              }
              const h = createSpring({
                from: 0,
                to: 1,
                damping: 1.0,
                response: 0.4,
                onUpdate: (p) => {
                  found.style.opacity = String(p)
                  found.style.transform = `translateY(${(1 - p) * 10}px)`
                },
                onRest: () => {
                  found.style.transform = ''
                },
              })
              miscSprings.push(h)
            }
            setTimeout(startFound, digits.length * 60 + 250)
          }
          jcObserver.unobserve(jcCard)
        }
      })
    }, { threshold: 0.3 })
    jcObserver.observe(jcCard)
  }

  /* Календарь: выбранный день (.cal-cell.sel) — micro-spring "snap" при
     попадании в viewport, чтобы привлечь взгляд без визуального шума. */
  const calSel = document.querySelector<HTMLElement>('.cal-cell.sel')
  if (calSel) {
    const calObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          if (reducedMotion.value) return
          // micro-bounce: scale 0.85 → 1.05 → 1
          const h = createSpring({
            from: 0,
            to: 1,
            damping: 0.55,
            response: 0.45,
            onUpdate: (p) => {
              const s = 0.85 + Math.sin(p * Math.PI) * 0.18 + (1 - p) * 0
              calSel.style.transform = `scale(${s})`
            },
            onRest: () => {
              calSel.style.transform = ''
            },
          })
          miscSprings.push(h)
          calObserver.unobserve(calSel)
        }
      })
    }, { threshold: 0.5 })
    calObserver.observe(calSel)
  }

  /* Hover-микро-motion на CTA (§1, §4) */
  setupHoverSpring('.bcard', { y: -4, scale: 1.005 })
  setupHoverSpring('.hero-cta', { y: -1, scale: 1.015 })
  setupHoverSpring('.cf-btn', { y: -2, scale: 1.02 })
  setupHoverSpring('.rp-btn', { y: -1, scale: 1.03 })
  setupHoverSpring('.jc-btn', { y: -1, scale: 1.03 })
  setupHoverSpring('.sc-send', { y: -1, scale: 1.015 })

  /* cf-arrow: при ховере на .cf-btn — синхронный spring translateX.
     Сделано через CSS (transition), потому что это однократное
     появление, а не gesture-driven loop. */

  /* asgn-arrow / mli-chevron: тоже лёгкий shift при hover строки */
  document.querySelectorAll<HTMLElement>('.asgn-row').forEach((row) => {
    const arrow = row.querySelector<HTMLElement>('.asgn-arrow')
    if (!arrow) return
    row.addEventListener('pointerenter', () => {
      arrow.style.transition = 'transform .25s cubic-bezier(.22,1,.36,1)'
      arrow.style.transform = 'translateX(3px)'
    })
    row.addEventListener('pointerleave', () => {
      arrow.style.transform = ''
    })
  })
})

onUnmounted(() => {
  stopChat?.()
  graderObserver?.disconnect()
  revealObserver?.disconnect()
  miscSprings.forEach((h) => h.stop())
  fillSprings.forEach((h) => h.stop())
  hoverSprings.forEach((h) => h.stop())
  tabsIndicatorSpring?.stop()
  cancelAnimationFrame(heroShiftRaf)
})

const year = new Date().getFullYear()
</script>

<style scoped>
*,*::before,*::after{box-sizing:border-box}
.landing{height:100vh;height:100dvh;overflow-y:auto;overflow-x:hidden;background:var(--bg);scroll-behavior:smooth;-webkit-overflow-scrolling:touch;-webkit-tap-highlight-color:transparent;text-size-adjust:100%;-webkit-text-size-adjust:100%}
@media (prefers-reduced-motion: reduce){.landing{scroll-behavior:auto}}

.l-main{width:100%}
.section{scroll-margin-top:88px}

/* ====== NAV ====== */
.lnav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,.55);-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid transparent;transition:background .25s ease,border-color .25s ease}
html.dark .lnav{background:rgba(11,11,13,.55)}
.lnav.scrolled{background:rgba(255,255,255,.78);border-bottom-color:var(--border)}
html.dark .lnav.scrolled{background:rgba(11,11,13,.78)}
@media (prefers-reduced-transparency: reduce){
  .lnav,.lnav.scrolled{background:var(--surface);backdrop-filter:none;-webkit-backdrop-filter:none}
}
.lnav-inner{max-width:1160px;margin:0 auto;padding:13px 24px;display:flex;align-items:center;gap:22px}

.l-brand{display:flex;align-items:center;gap:9px;cursor:pointer;flex-shrink:0}
.l-logo{display:block;width:40px;aspect-ratio:1200/734;background:linear-gradient(180deg,var(--teal),var(--teal-d));-webkit-mask:url('/logo.png') center / contain no-repeat;mask:url('/logo.png') center / contain no-repeat;flex-shrink:0}
.l-logo.sm{width:28px}
.l-brand-name{font-size:17px;font-weight:700;color:var(--text1);letter-spacing:-.02em}

.lnav-r{display:flex;align-items:center;gap:10px;flex-shrink:0;margin-left:auto}
.l-cta-sm{height:36px;padding:0 18px;border-radius:980px;font-size:13.5px;font-weight:600;letter-spacing:-.01em}
.l-cta-sm:active{transform:scale(.96)}
.lang-pill{position:relative;display:flex;align-items:center;background:var(--surface2);border:1px solid var(--border);border-radius:100px;padding:3px}
.lang-p{position:relative;z-index:1;padding:5px 10px;border-radius:100px;font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--text4);transition:color .2s,transform .12s}
.lang-p:active{transform:scale(.92)}
.lang-p.active{background:var(--surface);color:var(--text1);box-shadow:var(--sh-xs)}

/* ====== HERO ====== */
.hero{position:relative;padding:calc(var(--topbar) + 104px) 24px 130px;overflow:hidden}
.hero-grid{position:relative;z-index:1;max-width:1160px;margin:0 auto;display:grid;grid-template-columns:1.02fr .98fr;gap:64px;align-items:center}

.orb{position:absolute;border-radius:50%;filter:blur(110px);pointer-events:none}
.orb-a{width:620px;height:620px;top:-220px;left:-160px;background:rgba(120,120,128,.065);animation:orb-drift 16s ease-in-out infinite alternate}
.orb-b{width:480px;height:480px;bottom:-200px;right:-120px;background:rgba(174,174,178,.05);animation:orb-drift 19s ease-in-out infinite alternate-reverse}
/* Третий "фиолетовый" orb, дрейфует со своей фазой — добавляет объём и
   не даёт картинке "замереть" на одном из двух orbs. На mobile отключаем. */
.orb-c{width:380px;height:380px;top:35%;right:8%;background:rgba(120,120,200,.045);animation:orb-drift 22s ease-in-out infinite alternate}
html.dark .orb-c{background:rgba(160,140,220,.07)}
@media (max-width:768px){.orb-c{display:none}}
@keyframes orb-drift{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(40px,26px,0) scale(1.06)}}
@media (prefers-reduced-motion: reduce){.orb{animation:none}}

.hero-title{font-size:clamp(38px,5vw,64px);font-weight:700;line-height:1.05;letter-spacing:-.035em;color:var(--text1);margin-bottom:24px}
.grad-text{background:linear-gradient(115deg,var(--text1) 15%,#6e6e73 85%);-webkit-background-clip:text;background-clip:text;color:transparent}
html.dark .grad-text{background-image:linear-gradient(115deg,#f5f5f7 15%,#86868b 90%)}
.hero-sub{font-size:18.5px;color:var(--text3);line-height:1.58;letter-spacing:-.012em;max-width:470px;margin-bottom:36px}
.hero-ctas{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.hero-cta{height:52px;border-radius:980px;padding:0 28px;font-size:16px;font-weight:500;letter-spacing:-.01em;box-shadow:0 4px 16px rgba(var(--teal-rgb),.22);transition:box-shadow .25s cubic-bezier(.32,.72,0,1),background .2s}
.hero-cta:hover{box-shadow:0 8px 24px rgba(var(--teal-rgb),.28)}
.hero-cta:active{transform:scale(.97)}

/* --- Коллаж предметов в hero --- */
.hero-visual{position:relative;display:flex;justify-content:center}
.hero-collage{position:relative;width:100%;max-width:520px}
.hc-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.hc-card{background:var(--surface);border:1px solid var(--border);border-radius:22px;padding:18px;display:flex;flex-direction:column;box-shadow:0 2px 6px rgba(0,0,0,.03),0 24px 48px -16px rgba(0,0,0,.1)}
html.dark .hc-card{box-shadow:0 2px 6px rgba(0,0,0,.3),0 24px 48px -16px rgba(0,0,0,.5)}
.hc-glyph{width:40px;height:40px;border-radius:12px;background:var(--bg);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:600;color:var(--text1);position:relative}
.hc-spark{position:absolute;right:-6px;top:-6px;color:var(--teal)}
.hc-name{font-size:14.5px;font-weight:650;color:var(--text1);letter-spacing:-.01em;margin-top:12px}
.hc-meta{font-size:12px;color:var(--text4);font-weight:500;margin-top:3px}
.hc-card.on{border-color:var(--border2);box-shadow:0 2px 7px rgba(0,0,0,.04),0 26px 52px -18px rgba(0,0,0,.14)}
.hc-card.on .hc-glyph{background:var(--text1);border-color:var(--text1);color:var(--surface)}
.hc-chip{position:absolute;display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border-radius:100px;background:var(--surface);border:1px solid var(--border);box-shadow:var(--sh-md);font-size:12.5px;font-weight:600;color:var(--text1);white-space:nowrap;z-index:2}
.hcc-ico{width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.hcc-ico.green{background:rgba(74,222,128,.14);color:var(--green)}
.hcc-ico.yellow{background:rgba(251,191,36,.16);color:var(--yellow)}
.hc-grade{right:-22px;top:-16px}
.hc-due{left:-26px;bottom:-18px}

.chat-card{will-change:transform;width:100%;max-width:450px;background:var(--surface);border:1px solid var(--border);border-radius:30px;box-shadow:0 2px 6px rgba(0,0,0,.03),0 44px 88px -22px rgba(0,0,0,.16);overflow:hidden}
html.dark .chat-card{box-shadow:0 2px 6px rgba(0,0,0,.3),0 44px 88px -22px rgba(0,0,0,.65)}
.chat-head{display:flex;align-items:center;gap:9px;padding:15px 20px;border-bottom:1px solid var(--border);background:var(--glass)}
.chat-presence{width:8px;height:8px;border-radius:50%;background:var(--green);flex-shrink:0;box-shadow:0 0 0 3px rgba(22,163,74,.14)}
html.dark .chat-presence{box-shadow:0 0 0 3px rgba(74,222,128,.14)}
.chat-title{font-size:13.5px;font-weight:650;color:var(--text1);letter-spacing:-.01em;line-height:1.25}
.chat-body{display:flex;flex-direction:column;gap:15px;padding:20px 18px;min-height:300px;justify-content:flex-end}
.chat-body .msg-row{max-width:88%}
.chat-body .msg-bubble{font-size:13px;padding:12px 16px}

.ai-input-bar{display:flex;align-items:center;gap:10px;padding:13px 15px;border-top:1px solid var(--border);background:var(--surface)}
.ai-textarea{flex:1;min-width:0;background:var(--bg);border:1px solid var(--border);border-radius:980px;padding:11px 17px;color:var(--text4);font-size:13.5px;line-height:1.5}
.send-btn{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--teal-h));color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 3px 10px rgba(var(--teal-rgb),.25)}

.typing-bbl{display:inline-flex;align-items:center;gap:5.5px;width:auto;padding:14px 18px}
.typing-bbl span{width:6px;height:6px;border-radius:50%;background:var(--text4);animation:bounce 1s cubic-bezier(.45,0,.55,1) infinite}
.typing-bbl span:nth-child(2){animation-delay:.15s}
.typing-bbl span:nth-child(3){animation-delay:.3s}
@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
@media (prefers-reduced-motion: reduce){.typing-bbl span{animation:none}}

/* ====== SECTIONS ====== */
.section{max-width:1160px;margin:0 auto;padding:130px 24px}
.band{position:relative}
.band::before{content:'';position:absolute;top:0;bottom:0;left:calc(50% - 50vw);width:100vw;background:#fff;pointer-events:none}
html.dark .band::before{background:#151517}
.band>*{position:relative;z-index:1}
.sec-head{text-align:center;max-width:680px;margin:0 auto 72px}
.sec-title{font-size:clamp(31px,3.8vw,48px);font-weight:700;line-height:1.08;letter-spacing:-.03em;color:var(--text1);margin-bottom:16px}
.sec-title.left{text-align:left}
.sec-sub{font-size:17px;color:var(--text3);line-height:1.6;letter-spacing:-.01em}
.sec-sub.left{text-align:left}
.kicker{font-size:12px;font-weight:650;letter-spacing:.055em;text-transform:uppercase;color:var(--text3);margin-bottom:14px}

/* === Reveal (лёгкий fade+slide на CSS-transition, чтобы скролл был быстрым) === */
.reveal{opacity:0;transform:translateY(14px);will-change:opacity,transform}
.reveal.revealed{opacity:1;transform:none;transition:opacity .55s ease,transform .55s cubic-bezier(.22,1,.36,1);will-change:auto}
.reveal-left.revealed,.reveal-right.revealed{transform:none}
.reveal-left,.reveal-right{transform:translateY(0)}
.reveal-left.revealed,.reveal-right.revealed{transition:opacity .55s ease,transform .55s cubic-bezier(.22,1,.36,1)}
.reveal-delay-1{transition-delay:.06s}
.reveal-delay-2{transition-delay:.12s}
.reveal-delay-3{transition-delay:.18s}
.reveal-delay-4{transition-delay:.24s}
.reveal-scale{transform:scale(.96)}
.reveal-scale.revealed{transform:scale(1)}
@media (prefers-reduced-motion: reduce){
  .reveal{opacity:1;transform:none;transition:none}
  .reveal-left,.reveal-right,.reveal-scale{transform:none}
}

/* --- Bento --- */
.sa-visual{position:relative;padding-bottom:84px}
.sa-chat{position:absolute;left:-64px;bottom:-72px;width:min(350px,82%);z-index:2}
.sa-chat .chat-body{min-height:300px;height:auto}
.bento{display:grid;grid-template-columns:repeat(2,1fr);gap:22px}
.prog-demo{display:flex;flex-direction:column;background:var(--bg);border:1px solid var(--border);border-radius:22px;padding:6px 0}
.pg-row{display:flex;align-items:center;gap:12px;padding:11px 15px}
.pg-row + .pg-row{border-top:1px solid var(--border)}
.pg-name{width:34%;font-size:13px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.01em}
.pg-bar{flex:1;height:5px;border-radius:100px;background:var(--surface);border:1px solid var(--border);overflow:hidden}
.pg-fill{display:block;height:100%;border-radius:100px;background:linear-gradient(90deg,var(--teal-d),var(--teal))}
.pg-score{font-size:12px;font-weight:600;color:var(--text3);font-variant-numeric:tabular-nums;width:46px;text-align:right}
.bcard{position:relative;display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:26px;padding:34px 32px;box-shadow:0 1px 2px rgba(0,0,0,.02),0 16px 36px -28px rgba(0,0,0,.18);transition:box-shadow .35s cubic-bezier(.22,1,.36,1),border-color .25s;will-change:transform}
.bcard:hover{box-shadow:0 24px 48px -16px rgba(0,0,0,.1);border-color:var(--border2)}
html.dark .bcard:hover{box-shadow:0 24px 48px -16px rgba(0,0,0,.55)}
.bcard:active{transform:scale(.985)}
.bcopy{min-width:0}
.btitle{font-size:21px;font-weight:700;color:var(--text1);letter-spacing:-.022em;margin-bottom:10px;line-height:1.25}
.btext{font-size:15px;color:var(--text3);line-height:1.6;letter-spacing:-.008em}
.bvisual{margin-top:26px;flex:1;display:flex;flex-direction:column;justify-content:flex-end}

.subj-tiles{display:flex;flex-direction:column;gap:9px}
.st{display:flex;align-items:center;gap:12px;padding:10px 13px;border-radius:16px;background:var(--bg);border:1px solid var(--border)}
.st-glyph{width:32px;height:32px;border-radius:10px;background:var(--surface);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:var(--text2);flex-shrink:0}
.st-name{font-size:13.5px;font-weight:600;color:var(--text2);letter-spacing:-.01em}
.st-spark{margin-left:auto;color:var(--teal);flex-shrink:0}
.st.on{background:var(--surface);border-color:var(--border2);box-shadow:var(--sh-xs)}
.st.on .st-glyph{background:var(--text1);color:#fff;border-color:transparent}
.st.on .st-name{color:var(--text1)}

.mli-demo{display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);overflow:hidden;box-shadow:var(--sh-xs)}
.mli-row{display:flex;align-items:center;gap:12px;width:100%;padding:11px 14px;border-bottom:1px solid var(--border);text-align:left}
.mli-row:last-child{border-bottom:none}
.mli-info{flex:1;min-width:0}
.mli-name{font-size:13.5px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.01em}
.mli-meta{font-size:11.5px;color:var(--text4);letter-spacing:.02em;margin-top:1px}
.mli-chevron{color:var(--text4);flex-shrink:0}

.status-pill{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:100px;font-size:12px;font-weight:600;white-space:nowrap;flex-shrink:0}
.status-pill.graded{background:rgba(74,222,128,.1);color:var(--green);border:1px solid rgba(74,222,128,.2)}
.status-pill.grading{background:rgba(251,191,36,.12);color:var(--yellow);border:1px solid rgba(251,191,36,.25)}
.status-pill.submitted{background:rgba(74,222,128,.1);color:var(--green);border:1px solid rgba(74,222,128,.2)}
.status-pill.late{background:var(--red-l);color:var(--red);border:1px solid rgba(248,113,113,.2)}
.status-pill.pending{background:var(--surface2);color:var(--text3);border:1px solid var(--border)}

/* --- Тёмная секция (Chatra AI) --- */
.band-dark{position:relative}
.band-dark::before{content:'';position:absolute;top:0;bottom:0;left:calc(50% - 50vw);width:100vw;background:#1D1D1F;pointer-events:none}
.band-dark>*{position:relative;z-index:1}
.band-dark .sec-title{color:#f5f5f7}
.band-dark .sec-sub{color:#a1a1a6}
.band-dark .checklist li{color:#c7c7cc}
.band-dark .checklist svg{color:#f5f5f7}

.ai-win{display:flex;width:100%;max-width:620px;background:#232326;border:1px solid rgba(255,255,255,.09);border-radius:28px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,.3),0 44px 88px -24px rgba(0,0,0,.55)}
.ai-side{width:198px;flex-shrink:0;background:#1C1C1E;border-right:1px solid rgba(255,255,255,.07);padding:14px 12px;display:flex;flex-direction:column;gap:8px}
.ai-search{display:flex;align-items:center;gap:7px;height:32px;padding:0 11px;border-radius:980px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.07);color:#98989f;font-size:12px;font-weight:500}
.ai-new{display:flex;align-items:center;gap:7px;height:34px;padding:0 11px;border-radius:11px;color:#f5f5f7;font-size:12.5px;font-weight:600;background:rgba(var(--teal-rgb),.16);border:1px solid rgba(var(--teal-rgb),.3)}
.ai-group-label{font-size:10px;font-weight:650;letter-spacing:.08em;text-transform:uppercase;color:#6e6e73;margin:8px 4px 0}
.ai-conv{display:flex;align-items:center;gap:7px;height:32px;padding:0 10px;border-radius:9px;font-size:12.5px;font-weight:500;color:#c7c7cc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ai-conv svg{color:#98989f;flex-shrink:0}
.ai-conv.active{background:rgba(255,255,255,.08);color:#f5f5f7;font-weight:600}
.ai-main{flex:1;min-width:0;display:flex;flex-direction:column}
.ai-msgs{flex:1;display:flex;flex-direction:column;gap:13px;padding:20px 18px}
.ai-win .msg-sender{color:#98989f}
.ai-win .msg-row.assistant .msg-bubble{background:#2c2c2e;border-color:rgba(255,255,255,.08);color:#f5f5f7}
.ai-win .ai-input-dark{border-top-color:rgba(255,255,255,.07)!important;background:#232326!important}
.ai-win .ai-input-dark .ai-textarea{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.08);color:#98989f}
.ai-win .ai-textarea.sm{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.08);color:#98989f}

.math{display:inline-flex;align-items:center;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:13.5px;color:#f5f5f7;background:rgba(var(--teal-rgb),.1);border:1px solid rgba(var(--teal-rgb),.22);border-radius:8px;padding:5px 9px;margin:4px 2px;line-height:1;vertical-align:middle}
.math.plain,.math.roots{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);font-style:normal}
.mfrac{display:inline-flex;flex-direction:column;align-items:center;font-size:11px;line-height:1.15;margin-left:4px}
.mfrac .mn{padding:0 4px 2px;border-bottom:1px solid #98989f}
.mfrac .md{padding-top:2px}

/* --- AI Grader: бар файла, критерии, подтверждение преподавателя --- */
.grc-card{max-width:480px}
.gw-bar{display:flex;align-items:center;gap:6px;padding:12px 16px;border-bottom:1px solid var(--border);background:var(--glass)}
.gw-bar>span:not(.gw-file){width:9px;height:9px;border-radius:50%;background:var(--surface3);flex-shrink:0}
.gw-file{flex:1;min-width:0;margin-left:10px;text-align:left;font-size:12px;font-weight:550;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;align-self:center;line-height:1}
.grc-criteria{padding:16px 24px 18px;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:11px}
.gc-head{font-size:11.5px;font-weight:650;letter-spacing:.05em;text-transform:uppercase;color:var(--text4)}
.gc-row{display:flex;align-items:center;gap:12px}
.gc-name{width:38%;font-size:12.5px;font-weight:550;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gc-bar{flex:1;height:5px;border-radius:100px;background:var(--bg);border:1px solid var(--border);overflow:hidden}
.gc-fill{display:block;height:100%;border-radius:100px;background:linear-gradient(90deg,var(--teal-d),var(--teal))}
.gc-score{width:38px;text-align:right;font-size:12px;font-weight:600;color:var(--text3);font-variant-numeric:tabular-nums}
.grc-teacher{display:flex;align-items:center;gap:11px;padding:14px 24px;background:rgba(52,199,89,.05);border-top:1px solid var(--border)}
.gt-check{width:26px;height:26px;border-radius:50%;background:rgba(52,199,89,.14);color:var(--green);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.gt-note{font-size:12.5px;font-weight:600;color:var(--text1);letter-spacing:-.01em}
.gt-meta{font-size:11px;color:var(--text4);margin-top:1px}

/* --- Студенты и преподаватели --- */
.roles-stage{position:relative;max-width:880px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;padding-bottom:34px}
.role-panel{background:var(--surface);border:1px solid var(--border);border-radius:24px;box-shadow:0 2px 6px rgba(0,0,0,.03),0 24px 48px -16px rgba(0,0,0,.12);padding:20px;display:flex;flex-direction:column;gap:12px}
html.dark .role-panel{box-shadow:0 2px 6px rgba(0,0,0,.3),0 24px 48px -16px rgba(0,0,0,.55)}
.rp-stu{z-index:2}
.rp-tea{margin:-44px 0 0 -40px;z-index:1}
.rp-head{display:flex;align-items:center;gap:10px}
.rp-badge{font-size:11px;font-weight:700;letter-spacing:.04em;padding:4px 11px;border-radius:100px}
.rp-badge.stu{background:var(--text1);color:var(--surface)}
.rp-badge.tea{background:rgba(var(--teal-rgb),.1);color:var(--teal);border:1px solid rgba(var(--teal-rgb),.25)}
.rp-date{font-size:12px;color:var(--text4);font-weight:500;margin-left:auto}
.rp-row{display:flex;align-items:center;gap:11px;padding:12px 13px;background:var(--bg);border:1px solid var(--border);border-radius:15px}
.rp-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.rp-dot.pending{background:var(--yellow)}
.rp-dot.done{background:var(--green)}
.rp-main{flex:1;min-width:0}
.rp-name{font-size:13px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.01em}
.rp-meta{font-size:11.5px;color:var(--text4);margin-top:2px}
.rp-btn{font-size:12px;font-weight:600;color:#fff;background:var(--text1);border-radius:980px;padding:6px 14px;flex-shrink:0}
.roles-bridge-pos{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:3}
.roles-bridge{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:980px;background:var(--surface);border:1px solid var(--border);box-shadow:var(--sh-md);font-size:12.5px;font-weight:600;color:var(--text1);white-space:nowrap}
.roles-bridge svg{color:var(--teal)}

/* --- Вступление по коду --- */
.jc-card{max-width:470px;margin:0 auto;background:var(--surface);border:1px solid var(--border);border-radius:28px;padding:28px;display:flex;flex-direction:column;gap:18px;box-shadow:0 2px 6px rgba(0,0,0,.03),0 32px 64px -24px rgba(0,0,0,.12)}
html.dark .jc-card{box-shadow:0 2px 6px rgba(0,0,0,.3),0 32px 64px -24px rgba(0,0,0,.6)}
.jc-label{font-size:12.5px;font-weight:600;color:var(--text3);letter-spacing:.02em;text-align:center}
.jc-digits{display:flex;gap:10px;justify-content:center}
.jd{width:52px;height:62px;border-radius:14px;border:1px solid var(--border);background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:23px;font-weight:600;color:var(--text1);font-variant-numeric:tabular-nums}
.jd.active{border-color:var(--teal);box-shadow:0 0 0 3.5px rgba(var(--teal-rgb),.13)}
.jc-found{display:flex;align-items:center;gap:12px;padding:12px;border-radius:16px;background:var(--bg);border:1px solid var(--border)}
.jc-glyph{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,var(--teal),var(--teal-d));color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:650;flex-shrink:0}
.jf-main{flex:1;min-width:0}
.jf-name{font-size:13.5px;font-weight:650;color:var(--text1);letter-spacing:-.01em}
.jf-meta{font-size:11.5px;color:var(--text4);margin-top:1px}
.jc-btn{font-size:12.5px;font-weight:600;color:#fff;background:var(--teal);padding:8px 16px;border-radius:980px;flex-shrink:0}

/* --- Сдача работы --- */
.cal-col-right{display:flex;flex-direction:column;gap:22px}
.subm-card{background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:20px;box-shadow:0 2px 6px rgba(0,0,0,.03),0 24px 48px -16px rgba(0,0,0,.1)}
html.dark .subm-card{box-shadow:0 2px 6px rgba(0,0,0,.3),0 24px 48px -16px rgba(0,0,0,.5)}
.sc-head{font-size:15px;font-weight:700;color:var(--text1);letter-spacing:-.015em}
.sc-sub{font-size:12px;color:var(--text4);margin-top:3px}
.sc-file{display:flex;align-items:center;gap:10px;padding:11px 13px;margin-top:14px;background:var(--bg);border:1px solid var(--border);border-radius:14px}
.sc-fname{flex:1;min-width:0;font-size:13px;font-weight:550;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sc-comment{margin-top:12px;padding:11px 14px;border-radius:12px;background:var(--bg);border:1px solid var(--border);color:var(--text4);font-size:12.5px}
.sc-send{margin-top:14px;height:44px;border-radius:980px;background:linear-gradient(135deg,var(--teal),var(--teal-h));color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;letter-spacing:-.01em;box-shadow:0 3px 10px rgba(var(--teal-rgb),.25)}
.sc-done{display:flex;align-items:center;gap:7px;margin-top:12px;font-size:12px;font-weight:600;color:var(--green)}

/* --- Календарь · дедлайны · уведомления --- */
.cal-grid-wrap{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:56px;align-items:start}
.cal-col{display:flex;flex-direction:column;gap:22px;min-width:0}
.cal-col-right{min-width:0}
.cal-col-right .asgn-group{max-width:none}
.cal-win{background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:18px;box-shadow:0 2px 6px rgba(0,0,0,.03),0 24px 48px -16px rgba(0,0,0,.1)}
html.dark .cal-win{box-shadow:0 2px 6px rgba(0,0,0,.3),0 24px 48px -16px rgba(0,0,0,.5)}
.cal-head{display:flex;align-items:center;justify-content:space-between;padding:2px 6px 14px}
.cal-month{font-size:15px;font-weight:700;color:var(--text1);letter-spacing:-.01em}
.cal-nav{display:flex;gap:16px;color:var(--text4)}
.cal-week{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px}
.cal-week span{text-align:center;font-size:10.5px;font-weight:600;color:var(--text4);letter-spacing:.03em;padding:4px 0}
.cal-days{display:grid;grid-template-columns:repeat(7,1fr);row-gap:4px}
.cal-cell{height:40px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-radius:12px}
.cal-cell.blank{visibility:hidden}
.cal-num{font-size:12.5px;font-weight:550;color:var(--text2);line-height:1;font-variant-numeric:tabular-nums}
.cal-cell.sel{background:var(--text1)}
.cal-cell.sel .cal-num{color:var(--surface);font-weight:700}
.cal-dot{width:4.5px;height:4.5px;border-radius:50%}
.cal-dot.upcoming{background:var(--teal)}
.cal-dot.soon{background:var(--yellow)}
.cal-dot.done{background:var(--green)}
.cal-dot.overdue{background:var(--red)}
.notif-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:8px;box-shadow:var(--sh-xs)}
.nc-head{font-size:11px;font-weight:650;letter-spacing:.05em;text-transform:uppercase;color:var(--text4);padding:2px 4px 4px}
.nc-row{display:flex;align-items:center;gap:10px;padding:9px 10px;background:var(--bg);border:1px solid var(--border);border-radius:13px}
.nc-ico{width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.nc-ico.teal{background:rgba(var(--teal-rgb),.09);color:var(--teal)}
.nc-ico.yellow{background:rgba(251,191,36,.12);color:var(--yellow)}
.nc-ico.green{background:rgba(74,222,128,.1);color:var(--green)}
.nc-text{font-size:12.5px;font-weight:500;color:var(--text1);line-height:1.35;letter-spacing:-.005em}

/* --- Split sections --- */
.split{display:grid;grid-template-columns:1fr 1fr;gap:76px;align-items:center}
.split-copy{min-width:0}
.split-visual{min-width:0;display:flex;justify-content:center}
.checklist{list-style:none;display:flex;flex-direction:column;gap:14px;margin-top:30px}
.checklist li{display:flex;align-items:flex-start;gap:11px;font-size:15px;color:var(--text2);line-height:1.55;letter-spacing:-.008em}
.checklist svg{color:var(--text1);flex-shrink:0;margin-top:3px}

.mock-window{width:100%;max-width:540px;background:var(--surface);border:1px solid var(--border);border-radius:28px;box-shadow:0 2px 6px rgba(0,0,0,.03),0 40px 80px -24px rgba(0,0,0,.13);overflow:hidden}
html.dark .mock-window{box-shadow:0 2px 6px rgba(0,0,0,.3),0 40px 80px -24px rgba(0,0,0,.6)}

.cls-win{max-width:560px}
.cls-cover{display:flex;align-items:center;gap:13px;padding:20px 22px;background:var(--bg);border-bottom:1px solid var(--border)}
.cls-glyph{width:42px;height:42px;border-radius:12px;background:var(--surface);border:1px solid var(--border);box-shadow:var(--sh-xs);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:600;color:var(--text1);flex-shrink:0}
.cls-cover-t{min-width:0;flex:1}
.cls-cover-name{font-size:17px;font-weight:650;color:var(--text1);letter-spacing:-.02em;line-height:1.2}
.cls-cover-s{font-size:12px;font-weight:500;color:var(--text3);margin-top:2px;letter-spacing:-.005em}
.cls-spark{color:var(--teal);flex-shrink:0}

.tabs-bar{position:relative;display:flex;align-items:stretch;padding:3px;background:var(--bg);border-bottom:1px solid var(--border)}
.tabs-indicator{position:absolute;top:3px;bottom:3px;left:3px;width:calc((100% - 6px) / 3);background:var(--surface);border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,.1);will-change:transform}
html.dark .tabs-indicator{box-shadow:0 1px 4px rgba(0,0,0,.35)}
.tab-btn{position:relative;z-index:1;flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:9px 6px;font-size:12px;font-weight:550;color:var(--text3);background:transparent;border:none;border-radius:10px;cursor:pointer;transition:color .2s,transform .1s ease-out;white-space:nowrap;font-family:inherit;letter-spacing:-.01em}
.tab-btn:active{transform:scale(.96)}
.tab-btn svg{flex-shrink:0}
.tab-btn.active{color:var(--text1);font-weight:650}
.tab-num{font-size:10.5px;font-weight:700;background:var(--surface3);color:var(--text3);padding:1px 6px;border-radius:100px}
.tab-btn.active .tab-num{background:var(--teal-l);color:var(--teal)}

.cls-pane{display:flex;flex-direction:column;min-height:300px;background:var(--surface)}
.cls-list{display:flex;flex-direction:column}
.mli-row,.cls-asgn{position:relative}
.cls-list .mli-row{padding:14px 18px;border-bottom:none;background:transparent}
.cls-list .mli-row:not(:last-child)::after{content:'';position:absolute;left:70px;right:0;bottom:0;height:1px;background:var(--border)}
.cls-asgn{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:none}
.cls-asgn:not(:last-child)::after{content:'';position:absolute;left:18px;right:0;bottom:0;height:1px;background:var(--border)}
.cls-asgn-t{flex:1;min-width:0;font-size:13px;font-weight:650;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.01em}
.cls-asgn-m{font-size:11.5px;color:var(--text4);flex-shrink:0}

.mw-bar{display:flex;gap:6px;padding:12px 14px;border-bottom:1px solid var(--border);background:var(--glass);align-items:center}
.mw-dot{width:9px;height:9px;border-radius:50%;background:var(--surface3);flex-shrink:0}
.mw-file{display:flex;align-items:center;gap:7px;margin-left:10px;font-size:12px;font-weight:550;color:var(--text3)}
.mw-chat{flex:1;padding:16px;display:flex;align-items:center}

.cai-msgs{display:flex;flex-direction:column;gap:12px;width:100%}
.msg-row{display:flex;flex-direction:column;gap:6px;max-width:85%}
.msg-row.user{align-self:flex-end;align-items:flex-end}
.msg-row.assistant{align-self:flex-start}
.msg-sender{font-size:11.5px;font-weight:650;color:var(--text3)}
.msg-bubble{padding:11px 15px;border-radius:18px;font-size:12.5px;line-height:1.6;word-break:break-word;animation:msg-in .55s cubic-bezier(.16,1,.3,1) both}
.msg-row.assistant .msg-bubble{background:var(--bg);border:1px solid var(--border);color:var(--text1);border-bottom-left-radius:6px;transform-origin:0% 100%}
.msg-row.user .msg-bubble{background:linear-gradient(135deg,var(--teal),var(--teal-h));color:#fff;border-bottom-right-radius:6px;box-shadow:0 4px 14px rgba(var(--teal-rgb),.22);transform-origin:100% 100%}
@keyframes msg-in{from{opacity:0;transform:translateY(14px) scale(.94)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.msg-bubble{animation:none}}
.mw-input{display:flex;align-items:center;gap:8px;padding:10px 12px;border-top:1px solid var(--border);background:var(--surface)}
.ai-textarea.sm{padding:9px 14px;font-size:12.5px}
.send-btn.sm{width:36px;height:36px}

.fade-enter-active,.fade-leave-active{transition:opacity .18s ease}
.fade-enter-from,.fade-leave-to{opacity:0}

.split-lec{grid-template-columns:1.15fr 1fr;gap:48px}

/* --- Cohorts: макет экрана «Задания и дедлайны» в настройках класса ---
   Стили повторяют cm- (class-modal / cohorts-mock), чтобы выглядело как
   один и тот же компонент в приложении и на лендинге. Тёмная тема:
   те же правила (subtle background, border, no heavy shadows). */
.cohorts-mock{max-width:520px;padding:0}
.cm-head{display:flex;align-items:center;gap:10px;padding:16px 18px;border-bottom:1px solid var(--border);background:var(--glass)}
.cm-ico{width:30px;height:30px;border-radius:9px;background:var(--bg);border:1px solid var(--border);color:var(--text3);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cm-title{flex:1;font-size:15px;font-weight:650;color:var(--text1);letter-spacing:-.015em}
.cm-x{font-size:18px;color:var(--text4);line-height:1;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:8px}
.cm-cohort-row{display:flex;align-items:center;gap:10px;padding:11px 16px;margin:12px 14px 0;background:var(--bg);border:1px solid var(--border);border-radius:12px}
.cm-cohort-ico{width:28px;height:28px;border-radius:8px;background:var(--surface3);color:var(--text3);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cm-cohort-meta{flex:1;min-width:0}
.cm-cohort-label{font-size:12.5px;font-weight:650;color:var(--text1);letter-spacing:-.005em}
.cm-cohort-row svg:last-of-type{color:var(--text4)}
.cm-publish-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 14px 6px;padding:9px 12px;background:var(--bg);border:1px solid var(--border);border-radius:12px}
.cm-publish-info{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--text2);font-weight:600}
.cm-publish-count{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:100px;background:#FBBF24;color:#342900;font-size:11.5px;font-weight:800}
.cm-publish-btn{font-size:12px;font-weight:600;color:#fff;background:var(--teal);padding:6px 12px;border-radius:10px;letter-spacing:-.005em}
.cm-dl-list{display:flex;flex-direction:column;gap:7px;padding:6px 14px 16px}
.cm-dl-row{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg);border:1px solid var(--border);border-radius:12px}
.cm-dl-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.cm-dl-title{font-size:13px;font-weight:650;color:var(--text1);letter-spacing:-.01em;line-height:1.25}
.cm-dl-date{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;color:var(--text3);font-weight:500;width:fit-content}
.cm-dl-hint{display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:100px;background:rgba(251,191,36,.18);color:#B45309;font-size:10.5px;font-weight:600;width:fit-content}
html.dark .cm-dl-hint{color:#FCD34D;background:rgba(251,191,36,.22)}
.cm-dl-badge{font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:100px;white-space:nowrap;letter-spacing:-.005em;flex-shrink:0}
.cm-dl-badge.published{color:var(--green);background:rgba(74,222,128,.14)}
.cm-dl-badge.draft{color:var(--teal);background:rgba(var(--teal-rgb),.12)}
.cm-dl-badge.no-dl{color:var(--text3);background:var(--surface3);font-weight:600}
.cm-dl-row.draft .cm-dl-date{color:var(--text3)}
.cm-dl-row.no-dl .cm-dl-date{display:none}

.lec-win{max-width:660px}
.lec-body{display:grid;grid-template-columns:1.2fr 1fr;min-height:360px}
.lec-page{padding:20px 22px;border-right:1px solid var(--border);position:relative}
.lec-h{font-size:15px;font-weight:700;color:var(--text1);letter-spacing:-.015em;margin-bottom:12px}
.lec-p{font-size:12.5px;line-height:1.75;color:var(--text2);margin-bottom:12px}
.hl-mark{border-radius:3px;padding:1px 2px}
.hl-yellow{background:rgba(255,216,77,.42)}
html.dark .hl-yellow{background:rgba(255,216,77,.28)}
.hl-green{background:rgba(123,220,160,.4)}
html.dark .hl-green{background:rgba(123,220,160,.26)}

.hm{position:absolute;z-index:5;left:57%;transform:translate(-50%,-44px);display:inline-flex;padding:6px;background:var(--surface);border:1px solid var(--border);border-radius:15px;box-shadow:0 8px 24px rgba(0,0,0,.12),0 2px 8px rgba(0,0,0,.06);white-space:nowrap}
.hm-row{display:flex;align-items:center;gap:1px}
.hm-color{width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px}
.hm-color.active{background:var(--surface3)}
.hm-color span{width:15px;height:15px;border-radius:50%;display:block;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)}
.c-yellow{background:#FFD84D}.c-green{background:#7BDCA0}.c-blue{background:#7CC5F5}.c-red{background:#FF9A9A}
.hm-sep{width:1px;height:16px;background:var(--border);margin:0 4px;flex-shrink:0}
.hm-btn{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 8px;border-radius:8px;color:var(--text2);font-size:11.5px;font-weight:550}
.hm-btn.hm-ai{color:var(--teal)}

.lec-side{padding:18px 16px}
.hp-label{display:flex;align-items:center;gap:7px;font-size:11.5px;font-weight:650;color:var(--text4);text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px}
.hp-count{font-size:11px;font-weight:700;letter-spacing:0;background:var(--surface3);color:var(--text3);padding:1px 7px;border-radius:100px}
.hp-list{display:flex;flex-direction:column;background:var(--bg);border:1px solid var(--border);border-radius:16px;overflow:hidden}
.hp-row{position:relative;display:flex;align-items:stretch;gap:11px;padding:12px;border-bottom:none}
.hp-list .hp-row:not(:last-child)::after{content:'';position:absolute;left:28px;right:0;bottom:0;height:1px;background:var(--border)}
.hp-bar{width:3px;align-self:stretch;border-radius:0 3px 3px 0;flex-shrink:0}
.hp-main{flex:1;min-width:0}
.hp-text{font-size:12.5px;line-height:1.45;color:var(--text1);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.hp-note{display:flex;align-items:flex-start;gap:5px;margin-top:5px;font-size:11.5px;line-height:1.4;color:var(--text3)}
.hp-note svg{flex-shrink:0;margin-top:2px}
.hp-meta{font-size:11px;color:var(--text4);margin-top:4px}
.lec-side .mli-row{padding:10px 13px;border-bottom:none;background:transparent}
.lec-side .mli-row:not(:last-child)::after{content:'';position:absolute;left:65px;right:0;bottom:0;height:1px;background:var(--border)}

/* --- AI Grader --- */
.grc-card{width:100%;max-width:440px;background:var(--surface);border:1px solid var(--border);border-radius:28px;box-shadow:0 2px 6px rgba(0,0,0,.03),0 32px 64px -24px rgba(0,0,0,.12);overflow:hidden}
html.dark .grc-card{box-shadow:0 2px 6px rgba(0,0,0,.3),0 32px 64px -24px rgba(0,0,0,.6)}
.grc-hero{position:relative;overflow:hidden;border-bottom:1px solid var(--border)}
.grc-hero-wash{position:absolute;inset:-40% -20% auto -20%;height:85%;background:radial-gradient(ellipse at 50% 0%, rgba(29,29,31,.05), rgba(29,29,31,0) 70%);pointer-events:none}
html.dark .grc-hero-wash{background:radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.06), rgba(255,255,255,0) 70%)}
.grc-hero-inner{position:relative;display:flex;flex-direction:column;align-items:center;gap:13px;padding:30px 24px 26px}
.grc-verdict{font-size:22px;font-weight:650;letter-spacing:-.022em;color:var(--text1);text-align:center;line-height:1.15}
.grc-by-badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--text3);background:var(--bg);border:1px solid var(--border);padding:5px 12px;border-radius:100px}
.grc-by-badge svg{color:var(--teal)}
.grc-summary{padding:18px 24px;display:flex;flex-direction:column;gap:9px;border-bottom:1px solid var(--border)}
.grc-summary-head{display:flex;align-items:center;gap:8px;font-size:11.5px;font-weight:650;letter-spacing:.05em;text-transform:uppercase;color:var(--text4)}
.grc-spark{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:7px;flex-shrink:0;background:linear-gradient(140deg,var(--teal-h),var(--teal-d));color:#fff;box-shadow:0 2px 6px rgba(var(--teal-rgb),.25)}
.grc-summary-text{font-size:13.5px;line-height:1.6;color:var(--text2);margin:0}
.grc-analysis{display:grid;grid-template-columns:1fr 1fr}
.grc-col{display:flex;flex-direction:column;gap:10px;padding:18px 24px}
.grc-col + .grc-col{border-left:1px solid var(--border)}
.grc-bullet-title{display:flex;align-items:center;gap:7px;font-size:11.5px;font-weight:650;letter-spacing:.05em;text-transform:uppercase}
.grc-bullet-title.ok{color:var(--green)}
.grc-bullet-title.warn{color:#B45309}
html.dark .grc-bullet-title.warn{color:#F0A94B}
.grc-bullet-row{display:flex;align-items:flex-start;gap:9px;font-size:13px;line-height:1.55;color:var(--text2)}
.grc-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;margin-top:7px}
.grc-dot.ok{background:var(--green)}
.grc-dot.warn{background:#E8973A}

/* --- Deadlines: отдельные карточки заданий как в AssignmentCard.vue --- */
.asgn-list{display:flex;flex-direction:column;gap:10px;max-width:none}
.asgn-card{position:relative;display:flex;align-items:center;gap:16px;padding:18px 20px;background:var(--surface);border:1px solid var(--border);border-radius:22px;box-shadow:0 1px 2px rgba(0,0,0,.02),0 16px 36px -28px rgba(0,0,0,.12);overflow:hidden;transition:background .18s,border-color .18s,box-shadow .18s,transform .18s}
html.dark .asgn-card{box-shadow:0 1px 2px rgba(0,0,0,.3),0 16px 36px -24px rgba(0,0,0,.5)}
.asgn-card:hover{background:var(--surface2);border-color:var(--border2);box-shadow:0 4px 14px rgba(0,0,0,.04),0 24px 48px -28px rgba(0,0,0,.18)}
.asgn-card:active{transform:scale(.995)}
/* Accent-полоска 3px слева от карточки (как в AssignmentCard.vue) */
.asgn-accent{position:absolute;left:0;top:0;bottom:0;width:3px;flex-shrink:0;border-radius:0}
.asgn-card.accent-blue .asgn-accent{background:var(--text4)}
.asgn-card.accent-green .asgn-accent{background:var(--green)}
.asgn-card.accent-red .asgn-accent{background:var(--red)}
.asgn-card.accent-purple .asgn-accent{background:var(--purple)}
.asgn-ico-wrap{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:var(--surface3);color:var(--text3);border:1px solid var(--border)}
.ico-blue{background:var(--surface3);color:var(--text3);border:1px solid var(--border)}
.ico-green{background:rgba(74,222,128,.1);color:var(--green);border:1px solid rgba(74,222,128,.15)}
.ico-red{background:var(--red-l);color:var(--red);border:1px solid rgba(248,113,113,.15)}
.asgn-main{flex:1;min-width:0}
.asgn-title{font-size:14px;font-weight:700;color:var(--text1);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.012em}
.asgn-desc{font-size:12px;color:var(--text3);margin-bottom:7px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.asgn-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.meta-sep{width:3px;height:3px;border-radius:50%;background:var(--surface3);flex-shrink:0}
.meta-due,.meta-score,.meta-files{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--text4);font-weight:500}
.meta-due{color:var(--text3)}
.meta-due.overdue{color:var(--red)}
.meta-due.soon{color:var(--yellow)}
.meta-score{color:var(--text2);font-weight:600}
.asgn-status-wrap{display:flex;align-items:center;gap:10px;flex-shrink:0}
.asgn-arrow{color:var(--text4);flex-shrink:0;transition:transform .25s cubic-bezier(.22,1,.36,1)}

/* --- Final CTA --- */
.cta-final{position:relative;width:100%;padding:180px 24px 190px;text-align:center;overflow:hidden;background:#0c0c0d}
/* Медленный "дышащий" градиент на фоне финального CTA. Ключевые кадры
   панорамируют background-position на 200% width — создаёт ощущение
   "живой" витрины, не уходя в неон. На reduced-motion паузится. */
.cta-final::before{content:'';position:absolute;inset:0;background:linear-gradient(125deg,#0c0c0d 0%,#1a1a2e 30%,#16213e 55%,#1f1b3a 80%,#0c0c0d 100%);background-size:200% 100%;animation:cta-pan 18s ease-in-out infinite alternate;z-index:0;pointer-events:none}
@keyframes cta-pan{from{background-position:0% 50%}to{background-position:100% 50%}}
@media (prefers-reduced-motion: reduce){.cta-final::before{animation:none}}
.cf-orb-a{width:640px;height:640px;top:-200px;left:-160px;margin:0;background:rgba(120,120,200,.10)}
.cf-orb-b{width:560px;height:560px;bottom:-260px;right:-140px;background:rgba(99,99,102,.07)}
.cf-inner{position:relative;z-index:1;max-width:720px;margin:0 auto}
.cf-title{font-size:clamp(35px,5vw,60px);font-weight:700;line-height:1.06;letter-spacing:-.035em;color:#fafafa;margin-bottom:20px}
.cta-final .grad-text{background-image:linear-gradient(115deg,#fafafa 15%,#9b8cd9 60%,#5b8cd9 90%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.cf-sub{font-size:17.5px;color:#b8b8c4;line-height:1.6;letter-spacing:-.01em;margin-bottom:38px}
.cf-actions{display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap}
.cf-btn{height:54px;border-radius:980px;padding:0 32px;font-size:16px;font-weight:500;letter-spacing:-.01em;box-shadow:0 4px 16px rgba(var(--teal-rgb),.22);transition:box-shadow .25s cubic-bezier(.32,.72,0,1),background .2s}
.cf-btn:hover{box-shadow:0 8px 24px rgba(var(--teal-rgb),.28)}
.cf-btn:active{transform:scale(.97)}
.cf-arrow{transition:transform .22s cubic-bezier(.32,.72,0,1)}
.cf-btn:hover .cf-arrow{transform:translateX(4px)}

/* ====== FOOTER ====== */
.lfooter{border-top:1px solid var(--border);background:transparent}
.lf-inner{max-width:1160px;margin:0 auto;padding:56px 24px 48px;display:grid;grid-template-columns:1.25fr 2fr;gap:56px}
.lf-brandcol{display:flex;flex-direction:column;align-items:flex-start;gap:14px}
.lf-brand{display:flex;align-items:center;gap:9px;font-size:16px;font-weight:700;color:var(--text1);letter-spacing:-.02em}
.lf-tag{font-size:13px;line-height:1.55;color:var(--text4);max-width:250px}
.lf-lang{align-self:flex-start;background:transparent}
.lf-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.lf-col{display:flex;flex-direction:column;gap:11px}
.lf-h{font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--text4);margin-bottom:3px}
.lf-col a{font-size:13px;font-weight:500;color:var(--text3);transition:color .15s;width:fit-content;text-decoration:none}
@media (hover:hover){.lf-col a:hover{color:var(--text1)}}
.lf-bar{border-top:1px solid var(--border)}
.lf-bar-inner{max-width:1160px;margin:0 auto;padding:15px 24px calc(17px + env(safe-area-inset-bottom,0px));display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:11.5px;color:var(--text4)}

/* ====== RESPONSIVE ====== */
@media (max-width:1020px){
  .hero-grid{grid-template-columns:1fr;gap:56px}
  .hero{padding-top:calc(var(--topbar) + 56px)}
  .hero-copy{text-align:center}
  .grad-text{background-image:linear-gradient(115deg,var(--text1) 15%,#6e6e73 85%)}
  html.dark .grad-text{background-image:linear-gradient(115deg,#f5f5f7 15%,#86868b 90%)}
  .hero-sub{margin-left:auto;margin-right:auto}
  .hero-ctas{justify-content:center}
  .split{grid-template-columns:1fr;gap:44px}
  .split.rev .split-visual{order:-1}
  .bento{grid-template-columns:1fr 1fr}
  .section{padding:104px 24px}
  .sa-chat{left:auto;right:-16px;bottom:-40px}
}
@media (max-width:768px){
  /* --- каркас --- */
  .section{padding:80px 20px;scroll-margin-top:64px;box-sizing:border-box}
  .sec-head{margin-bottom:48px;width:100%;max-width:680px;margin-left:auto;margin-right:auto}
  .sec-sub{font-size:16px}

  /* --- навигация --- */
  .lnav-inner{padding:10px 18px;gap:12px;box-sizing:border-box}
  .l-logo{width:32px}
  .l-brand-name{font-size:16px}
  .l-cta-sm{height:38px;padding:0 18px}

  /* --- hero --- */
  .hero{padding:calc(var(--topbar) + 44px) 20px 72px;box-sizing:border-box}
  .hero-grid{grid-template-columns:1fr;gap:52px;justify-items:center;width:100%;max-width:100%}
  .hero-copy{text-align:center;width:100%;max-width:520px;margin:0 auto}
  .hero-sub{max-width:none;margin-left:auto;margin-right:auto}
  .grad-text{background-image:linear-gradient(115deg,var(--text1) 15%,#6e6e73 85%)}
  html.dark .grad-text{background-image:linear-gradient(115deg,#f5f5f7 15%,#86868b 90%)}
  .hero-title{font-size:clamp(30px,8.6vw,38px);width:100%}
.hero-ctas{justify-content:center}
.hero-cta{width:100%;max-width:400px;margin:0 auto}
  .orb{filter:blur(70px)}
  .hero .orb-a{width:340px;height:340px;top:-130px;left:-130px}
  .hero .orb-b{width:280px;height:280px;bottom:-120px;right:-100px}

  /* --- коллаж предметов: центрирован --- */
  .hero-visual{display:flex;justify-content:center;align-items:center;width:100%;max-width:100%;padding:0;margin:0 auto;box-sizing:border-box}
  .hero-collage{width:100%;max-width:420px;margin:0 auto}
  .hc-grid{gap:12px}
  .hc-card{padding:14px;border-radius:18px;min-width:0;box-sizing:border-box}
  .hc-glyph{width:36px;height:36px;border-radius:10px;font-size:15px}
  .hc-name{font-size:13.5px;margin-top:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .hc-meta{font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .hc-chip{font-size:11.5px;padding:8px 12px;gap:6px;max-width:calc(100% - 24px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;left:50%;right:auto;transform:translateX(-50%)}
  .hc-grade{position:absolute;top:-14px;left:50%;transform:translateX(-50%)}
  .hc-due{position:absolute;bottom:-14px;left:50%;transform:translateX(-50%)}

  /* --- карточки bento: центрированы --- */
  .bento{grid-template-columns:1fr;gap:18px;justify-items:center;width:100%;max-width:100%}
  .bcard{width:100%;max-width:440px;margin:0 auto;padding:26px 22px;border-radius:24px;box-sizing:border-box}
  .btitle{font-size:19px}
  .bvisual{align-items:center;width:100%}
  .prog-demo,.mli-demo{border-radius:20px;width:100%}

  /* --- ИИ предмета: мок + чат центрированы стопкой --- */
  .sa-visual{padding-bottom:0;flex-direction:column;align-items:center;justify-content:center;width:100%;max-width:100%;margin:0 auto;gap:16px;box-sizing:border-box}
  .sa-visual > .mock-window{margin:0 auto;max-width:460px;width:100%}
  .cls-win{margin:0 auto;max-width:460px;width:100%}
  .cls-win,.mock-window{border-radius:24px;box-sizing:border-box}
  .cls-cover{padding:16px 18px 14px;gap:11px}
  .cls-glyph{width:38px;height:38px;border-radius:11px;font-size:16px}
  .cls-cover-name{font-size:16px}
  .cls-pane{min-height:0}
  /* --- Cohorts модалка на мобилке: центрируем, сжимаем --- */
  .cohorts-mock{margin:0 auto;max-width:460px;width:100%}
  .cm-head{padding:14px 16px;gap:8px}
  .cm-ico{width:28px;height:28px;border-radius:8px}
  .cm-title{font-size:14.5px}
  .cm-x{width:22px;height:22px;font-size:16px}
  .cm-cohort-row{margin:10px 12px 0;padding:10px 12px;gap:8px;border-radius:11px}
  .cm-cohort-ico{width:26px;height:26px;border-radius:7px}
  .cm-cohort-label{font-size:12px}
  .cm-publish-bar{margin:10px 12px 6px;padding:8px 11px;border-radius:11px;gap:8px}
  .cm-publish-info{font-size:12px;gap:7px}
  .cm-publish-count{min-width:19px;height:19px;font-size:11px}
  .cm-publish-btn{font-size:11.5px;padding:5px 11px;border-radius:9px}
  .cm-dl-list{gap:6px;padding:6px 12px 14px}
  .cm-dl-row{padding:9px 11px;gap:9px;border-radius:11px}
  .cm-dl-title{font-size:12.5px;line-height:1.2}
  .cm-dl-date{font-size:11px}
  .cm-dl-hint{font-size:10px;padding:1px 6px}
  .cm-dl-badge{font-size:10px;padding:2px 8px}
  .sa-chat{position:static;width:100%;max-width:380px;margin:0 auto;border-radius:24px;left:auto;right:auto;bottom:auto}
  .sa-chat .chat-body{min-height:220px;padding:16px}
  .chat-card{border-radius:24px;width:100%;max-width:380px;margin:0 auto;box-sizing:border-box}
  .chat-head{padding:12px 16px}
  .chat-body{gap:12px;min-height:220px}

  /* --- материалы и выделения: мок-окно по центру --- */
  .split{grid-template-columns:1fr !important;gap:44px;justify-items:center;width:100%;max-width:100%}
  .split-copy{width:100%;max-width:520px;margin:0 auto;text-align:center;box-sizing:border-box}
  .split-copy .sec-title.left,.split-copy .sec-sub.left{text-align:center}
  .split-copy .checklist{text-align:left;align-items:flex-start;max-width:480px;margin:30px auto 0}
  .split.rev .split-visual{order:-1}
  .split-visual{display:flex;justify-content:center;align-items:center;width:100%;max-width:100%;margin:0 auto;box-sizing:border-box}
  .lec-win{margin:0 auto;max-width:480px;width:100%;box-sizing:border-box}
  .lec-body{grid-template-columns:1fr}
  .lec-page{border-right:none;border-bottom:1px solid var(--border);padding:18px}
  .lec-side{padding:16px 14px}
  .hm{transform:translate(-50%,-42px) scale(.82)}

  /* --- Chatra AI (тёмная) --- */
  .ai-side{display:none}
  .ai-win{border-radius:24px;max-width:460px;margin:0 auto;width:100%;box-sizing:border-box}
  .ai-msgs{padding:16px 18px;gap:12px}
  .ai-main{min-width:0}
  .mw-input{padding:10px 12px}

  /* --- AI Grader: карточка по центру --- */
  .grc-card{border-radius:24px;max-width:400px;margin:0 auto;width:100%;box-sizing:border-box}
  .gw-bar{padding:12px 16px}
  .gw-file{font-size:11.5px}
  .grc-summary{padding:18px 20px}
  .grc-hero-inner{padding:24px 18px 22px}
  .grc-criteria{padding:16px 20px 18px;gap:12px}
  .gc-name{width:42%;font-size:12px}
  .gc-score{width:34px}
  .grc-analysis{grid-template-columns:1fr}
  .grc-col + .grc-col{border-left:none;border-top:1px solid var(--border)}
  .grc-col{padding:18px 20px}
  .grc-teacher{padding:14px 20px}

  /* --- роли: панели по центру --- */
  .roles-stage{grid-template-columns:1fr;gap:18px;padding-bottom:0;max-width:420px;width:100%;margin:0 auto;justify-items:center}
  .role-panel{border-radius:22px;padding:18px;width:100%;box-sizing:border-box}
  .rp-tea{margin:0}
  .roles-bridge-pos{display:none}
  .rp-row{padding:12px 13px}

  /* --- код предмета --- */
  .jc-card{padding:24px;border-radius:24px;max-width:400px;margin:0 auto;gap:20px;width:100%;box-sizing:border-box}
  .jc-digits{gap:8px}
  .jd{width:min(48px,(100% - 40px)/6);height:58px;border-radius:12px;font-size:21px}
  .jc-found{flex-wrap:wrap;row-gap:10px}
  .jc-btn{margin-left:auto}

  /* --- календарь · дедлайны · сдача: колонки по центру --- */
  .cal-grid-wrap{grid-template-columns:1fr;gap:36px;width:100%;max-width:100%;justify-items:center}
  .cal-col{display:flex;flex-direction:column;gap:24px;min-width:0;width:100%;max-width:420px;margin:0 auto;align-items:center;box-sizing:border-box}
  .cal-col-right{display:flex;flex-direction:column;gap:20px;min-width:0;width:100%;max-width:420px;margin:0 auto;align-items:stretch;box-sizing:border-box}
  .cal-win{padding:16px;border-radius:22px;width:100%;max-width:420px;margin:0 auto;box-sizing:border-box}
  .cal-cell{height:38px;border-radius:10px}
  .asgn-list{gap:12px;width:100%;max-width:420px;margin:0 auto;align-items:center}
  .asgn-card{padding:16px;border-radius:20px;gap:14px;width:100%;max-width:420px;margin:0 auto;box-sizing:border-box}
  .asgn-ico-wrap{width:42px;height:42px;border-radius:12px;flex-shrink:0}
  .asgn-title{white-space:normal;overflow-wrap:break-word;font-size:14.5px;line-height:1.3}
  .asgn-meta{flex-wrap:wrap;row-gap:4px}
  .asgn-arrow{display:none}
  .status-pill{font-size:11.5px;padding:5px 11px}
  .notif-card{padding:14px;gap:9px;border-radius:18px;width:100%;max-width:420px;margin:0 auto;box-sizing:border-box}
  .nc-row{padding:10px 11px;gap:10px;border-radius:13px}
  .nc-ico{width:26px;height:26px}
  .subm-card{border-radius:22px;padding:18px;width:100%;max-width:420px;margin:0 auto;box-sizing:border-box}
  .sc-send{height:46px}

  /* --- финальный CTA --- */
  .cta-final{padding:96px 20px 104px;box-sizing:border-box}
  .cf-orb-a{width:380px;height:380px;top:-150px;left:-160px}
  .cf-orb-b{width:320px;height:320px;bottom:-180px;right:-120px}
  .cf-title{font-size:clamp(31px,9vw,40px)}
  .cf-sub{font-size:16px;margin-bottom:32px}
  .cf-inner{display:flex;flex-direction:column;align-items:center;width:100%;max-width:720px;margin:0 auto}
  .cf-actions{flex-direction:column;gap:14px;align-items:center;width:100%}
  .cf-btn{width:100%;max-width:380px;height:52px;margin:0 auto}

  /* --- футер --- */
  .lf-inner{grid-template-columns:1fr;gap:36px;padding:44px 20px 36px;justify-items:center;width:100%;max-width:1160px;margin:0 auto}
  .lf-brandcol{align-items:center;text-align:center;width:100%;max-width:420px;margin:0 auto}
  .lf-brandcol .lf-tag{margin:0 auto}
  .lf-cols{grid-template-columns:repeat(3,1fr);gap:20px;width:100%;max-width:520px;margin:0 auto}
  .lf-col a{font-size:13.5px;padding:2px 0}
  .lf-bar-inner{padding:14px 20px calc(16px + env(safe-area-inset-bottom,0px))}
  .lf-tag{max-width:none}
}
@media (max-width:640px){
  .lnav-inner{padding:9px 16px;gap:10px}
  .l-cta-sm{height:36px;padding:0 16px;font-size:13px}
  .hero{padding:calc(var(--topbar) + 36px) 18px 64px}
  .hero-grid{gap:44px}
  .hero-title{font-size:clamp(28px,8.4vw,34px)}
  .hero-sub{font-size:16px;margin-bottom:26px}
  .hero-cta{height:50px;font-size:15.5px}
  .hero-collage{max-width:380px}
  .hc-grid{gap:10px}
  .hc-card{padding:12px;border-radius:16px}
  .hc-glyph{width:34px;height:34px;border-radius:10px;font-size:15px}
  .hc-name{font-size:13px;margin-top:9px}
  .hc-meta{font-size:11px}
  .hc-chip{font-size:11px;padding:7px 11px}
  .section{padding:72px 18px}
  .sec-head{margin-bottom:42px}
  .bento{gap:16px}
  .bcard{padding:24px 20px;border-radius:22px;max-width:400px}
  .btitle{font-size:18.5px}
  .split{gap:40px}
  .sa-visual > .mock-window{max-width:420px}
  .cls-win{max-width:420px}
  .sa-chat{max-width:360px}
  .chat-card{max-width:360px}
  .lec-win{max-width:440px}
  .lec-page{padding:16px}
  .lec-side{padding:14px 12px}
  .hm{transform:translate(-50%,-42px) scale(.78)}
  .ai-win{max-width:420px}
  .grc-card{max-width:380px}
  .grc-hero-inner{padding:22px 16px 20px}
  .grc-verdict{font-size:21px}
  .role-panel{padding:16px;border-radius:20px}
  .rp-row{padding:11px 12px;gap:10px}
  .roles-stage{max-width:400px}
  .cohorts-mock{max-width:420px}
  .cm-head{padding:13px 14px}
  .cm-cohort-row{margin:10px 12px 0;padding:9px 12px}
  .cm-publish-bar{margin:8px 12px 5px;padding:8px 10px}
  .cm-dl-list{padding:5px 12px 12px;gap:6px}
  .jc-card{padding:22px 18px;gap:18px;max-width:380px}
  .jd{height:54px;font-size:20px;width:min(46px,(100% - 32px)/6)}
  .cal-cell{height:36px}
  .cal-col{max-width:400px}
  .cal-col-right{max-width:400px}
  .cal-win{max-width:400px}
  .asgn-card{padding:14px;border-radius:18px;gap:12px;max-width:400px}
  .asgn-ico-wrap{width:40px;height:40px;border-radius:12px}
  .notif-card{padding:13px;max-width:400px}
  .subm-card{max-width:400px}
  .cta-final{padding:88px 18px 96px}
  .cf-orb-a{width:340px;height:340px;top:-140px;left:-150px}
  .cf-orb-b{width:280px;height:280px;bottom:-160px;right:-130px}
  .cf-title{font-size:clamp(30px,9vw,36px)}
  .cf-btn{height:50px;font-size:15.5px}
  .lf-inner{grid-template-columns:1fr;gap:32px;padding:40px 18px 34px}
  .lf-cols{grid-template-columns:repeat(2,1fr);row-gap:24px;column-gap:20px;max-width:440px}
  .lf-cols > .lf-col:nth-child(2){grid-column:1}
  .lf-cols > .lf-col:nth-child(3){grid-column:2}
}
@media (max-width:480px){
  .section{padding:64px 16px}
  .sec-title{font-size:clamp(25px,7.2vw,31px)}
  .kicker{font-size:12px}
  .hero{padding:calc(var(--topbar) + 36px) 16px 56px}
  .hero-title{font-size:clamp(27px,8.4vw,32px)}
  .hero-sub{font-size:15.5px}
  .hero-collage{max-width:340px}
  .hc-grid{gap:10px}
  .hc-card{padding:12px;border-radius:16px;min-width:0}
  .hc-glyph{width:32px;height:32px;border-radius:9px;font-size:14px}
  .hc-name{font-size:12.5px;margin-top:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .hc-meta{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .hc-chip{font-size:10.5px;padding:7px 11px;gap:5px;max-width:calc(100% - 16px)}
  .hcc-ico{width:17px;height:17px}
  .hcc-ico svg{width:10px;height:10px}
  .hc-grade{top:-12px}
  .hc-due{bottom:-12px}
  .bento{gap:14px}
  .bcard{padding:22px 18px;border-radius:22px;max-width:360px}
  .btitle{font-size:18px}
  .btext{font-size:14px}
  .bvisual{margin-top:20px}
  .split{gap:36px}
  .tab-btn{font-size:11px;padding:8px 4px;gap:4px}
  .tab-btn svg{width:12px;height:12px}
  .tab-num{display:none}
  .hm{left:50%;transform:translate(-50%,-44px) scale(.72)}
  .math{font-size:12.5px}
  .gw-bar>span:not(.gw-file){display:none}
  .gw-file{margin-left:2px}
  .grc-hero-inner{padding:20px 16px 18px}
  .grc-verdict{font-size:20px}
  .grc-summary{padding:16px 18px}
  .grc-summary-text{font-size:13px}
  .grc-bullet-row{font-size:12.5px}
  .grc-teacher{padding:13px 18px}
  .gt-note{font-size:12px}
  .gc-row{gap:10px}
  .gc-name{width:48%;font-size:11.5px}
  .gc-score{width:30px;font-size:11.5px}
  .jd{height:54px;font-size:19px;border-radius:11px;width:min(44px,(100% - 24px)/6)}
  .jc-card{padding:20px 18px;gap:16px;max-width:340px}
  .jc-digits{gap:5px}
  .jc-label{font-size:12px}
  .jc-found{padding:11px;border-radius:14px}
  .jc-glyph{width:34px;height:34px;font-size:14px}
  .jc-btn{padding:7px 13px;font-size:12px}
  .cal-cell{height:34px}
  .cal-num{font-size:11.5px}
  .cal-week span{font-size:9.5px}
  .cal-win{padding:13px;border-radius:20px;max-width:360px}
  .cal-head{padding:2px 4px 12px}
  .asgn-list{gap:11px}
  .asgn-card{padding:14px;border-radius:18px;gap:12px;max-width:360px}
  .asgn-ico-wrap{width:38px;height:38px;border-radius:11px}
  .asgn-ico-wrap svg{width:16px;height:16px}
  .asgn-title{font-size:14.5px}
  .asgn-meta{gap:8px}
  .meta-due,.meta-score{font-size:11.5px}
  .status-pill{font-size:11px;padding:4px 10px}
  .notif-card{padding:12px;gap:8px;border-radius:16px;max-width:360px}
  .nc-row{padding:9px 10px;gap:9px;border-radius:12px}
  .nc-ico{width:24px;height:24px}
  .nc-text{font-size:12px}
  .subm-card{padding:16px;border-radius:20px;max-width:360px}
  .sc-head{font-size:14.5px}
  .sc-send{height:46px;font-size:13.5px}
  .sc-file{padding:10px 12px}
  .cohorts-mock{max-width:360px}
  .cm-cohort-row{margin:8px 10px 0;padding:9px 11px;gap:7px}
  .cm-publish-bar{margin:8px 10px 4px;padding:7px 10px}
  .cm-dl-list{padding:5px 10px 12px;gap:5px}
  .cm-dl-row{padding:8px 10px;gap:8px}
  .cm-dl-title{font-size:12px}
  .cta-final{padding:80px 16px 88px}
  .cf-orb-a{width:300px;height:300px;top:-130px;left:-150px}
  .cf-orb-b{width:240px;height:240px;bottom:-150px;right:-120px}
  .cf-title{font-size:clamp(28px,9vw,34px)}
  .cf-sub{font-size:15.5px;margin-bottom:28px}
  .cf-btn{max-width:none;height:50px;font-size:15.5px}
  .lf-inner{grid-template-columns:1fr;gap:30px;padding:38px 18px 32px}
  .lf-cols{grid-template-columns:repeat(2,1fr);row-gap:26px;column-gap:18px;max-width:400px}
  .lf-cols > .lf-col:nth-child(2){grid-column:1}
  .lf-cols > .lf-col:nth-child(3){grid-column:2}
  .lf-col a{font-size:13px}
  .lf-tag{font-size:12.5px}
  .lf-lang{padding:2px}
  .lang-p{padding:5px 8px;font-size:10.5px}
  .lf-bar-inner{font-size:11px;padding:13px 18px calc(15px + env(safe-area-inset-bottom,0px))}
}
@media (max-width:360px){
  .section{padding:56px 14px}
  .lnav-inner{padding:9px 14px;gap:8px}
  .l-brand-name{font-size:15px}
  .l-cta-sm{height:36px;padding:0 14px;font-size:13px}
  .hero{padding:calc(var(--topbar) + 32px) 14px 52px}
  .hero-title{font-size:clamp(26px,8.5vw,30px);line-height:1.08}
  .hero-sub{font-size:15px;margin-bottom:24px}
  .hero-cta{height:50px;font-size:15.5px;padding:0 20px}
  .hero-collage{max-width:300px}
  .hc-grid{gap:8px}
  .hc-card{padding:11px;border-radius:14px;min-width:0}
  .hc-glyph{width:28px;height:28px;border-radius:8px;font-size:13px}
  .hc-glyph svg{width:14px;height:14px}
  .hc-name{font-size:12px;margin-top:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .hc-meta{font-size:10.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .hc-chip{font-size:10px;padding:6px 10px;gap:4px;max-width:calc(100% - 8px)}
  .hcc-ico{width:15px;height:15px}
  .hcc-ico svg{width:9px;height:9px}
  .bento{gap:12px}
  .bcard{padding:20px 16px;border-radius:20px;max-width:300px}
  .btitle{font-size:17px}
  .btext{font-size:13.5px;line-height:1.5}
  .pg-name{font-size:12.5px;width:38%}
  .pg-score{width:42px;font-size:11.5px}
  .mli-row{padding:10px 12px;gap:10px}
  .mli-name{font-size:13px}
  .mli-meta{font-size:11px}
  .split{gap:32px}
  .split-copy{max-width:none}
  .tab-btn{font-size:10.5px;padding:7px 3px;gap:3px}
  .tab-btn svg{width:11px;height:11px}
  .cls-cover{padding:14px 14px 12px;gap:9px}
  .cls-glyph{width:34px;height:34px;border-radius:10px;font-size:15px}
  .cls-cover-name{font-size:15px}
  .cls-cover-s{font-size:11.5px}
  .mw-bar{padding:10px 14px}
  .mw-file{font-size:11.5px}
  .lec-page{padding:15px}
  .lec-side{padding:13px 11px}
  .lec-p{font-size:12px;margin-bottom:10px}
  .lec-h{font-size:14px;margin-bottom:10px}
  .hp-row{padding:10px}
  .hp-text{font-size:12px}
  .hp-note{font-size:11px}
  .hm{transform:translate(-50%,-40px) scale(.66)}
  .ai-msgs{padding:14px 14px;gap:10px}
  .ai-input-dark{padding:9px 11px}
  .ai-textarea.sm{padding:8px 12px;font-size:12px}
  .send-btn.sm{width:34px;height:34px}
  .grc-summary{padding:14px 16px}
  .grc-criteria{padding:13px 16px 15px;gap:9px}
  .grc-col{padding:15px 16px}
  .grc-teacher{padding:12px 16px;gap:9px}
  .gt-check{width:24px;height:24px}
  .roles-stage{max-width:300px}
  .role-panel{padding:15px;border-radius:18px}
  .rp-head{gap:8px}
  .rp-badge{font-size:10.5px;padding:3px 9px}
  .rp-row{padding:10px 11px;gap:9px;border-radius:13px}
  .rp-name{font-size:12.5px}
  .rp-meta{font-size:11px}
  .rp-btn{font-size:11.5px;padding:5px 12px}
  .jc-card{padding:18px 16px;border-radius:20px;gap:14px;max-width:300px}
  .jc-digits{gap:4px}
  .jd{height:50px;font-size:18px;border-radius:10px;width:min(42px,(100% - 20px)/6)}
  .jc-found{padding:9px;gap:10px}
  .jc-glyph{width:32px;height:32px;font-size:13.5px;border-radius:10px}
  .jf-name{font-size:13px}
  .jf-meta{font-size:11px}
  .jc-btn{padding:6px 12px;font-size:11.5px}
  .cal-grid-wrap{gap:26px}
  .cal-col{max-width:300px}
  .cal-col-right{max-width:300px}
  .cal-win{padding:12px;border-radius:18px;max-width:300px}
  .cal-cell{height:32px;border-radius:9px}
  .cal-num{font-size:11px}
  .cal-week span{font-size:9px;padding:3px 0}
  .cal-month{font-size:14px}
  .notif-card{padding:11px;border-radius:16px;gap:7px;max-width:300px}
  .nc-head{font-size:10.5px}
  .nc-row{padding:8px 9px;gap:7px;border-radius:11px}
  .nc-ico{width:22px;height:22px;border-radius:7px}
  .nc-text{font-size:11.5px}
  .asgn-card{padding:12px;border-radius:16px;gap:10px;max-width:300px}
  .asgn-ico-wrap{width:34px;height:34px;border-radius:10px}
  .asgn-title{font-size:14px}
  .asgn-meta{gap:7px}
  .meta-due,.meta-score{font-size:11px;gap:3px}
  .status-pill{font-size:10.5px;padding:4px 9px;gap:4px}
  .subm-card{padding:14px;border-radius:16px;max-width:300px}
  .sc-head{font-size:14px}
  .sc-sub{font-size:11.5px}
  .sc-file{padding:9px 10px;gap:8px}
  .sc-comment{padding:9px 12px;font-size:12px}
  .sc-send{height:44px;font-size:13px}
  .cta-final{padding:72px 14px 80px}
  .cf-title{font-size:clamp(26px,8.5vw,30px)}
  .cf-sub{font-size:15px;margin-bottom:24px}
  .cf-btn{height:48px;font-size:15px;border-radius:980px}
  .lf-inner{grid-template-columns:1fr;gap:26px;padding:34px 16px 30px}
  .lf-brand{font-size:15px}
  .lf-tag{font-size:12px}
  .lf-cols{row-gap:22px;column-gap:14px;max-width:360px}
  .lf-h{font-size:10.5px;margin-bottom:6px}
  .lf-col{gap:9px}
  .lf-col a{font-size:12.5px;padding:3px 0}
  .lf-bar-inner{font-size:10.5px;padding:12px 16px calc(14px + env(safe-area-inset-bottom,0px))}
}
</style>
