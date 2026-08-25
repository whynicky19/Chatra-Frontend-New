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
        <div class="orb orb-a" aria-hidden="true"></div>
        <div class="orb orb-b" aria-hidden="true"></div>

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
          <div class="hero-visual reveal reveal-right">
            <div class="chat-card">
              <div class="chat-head">
                <span class="chat-dot"></span>
                <div class="chat-head-t">
                  <div class="chat-title">{{ d('demo.subject') }}</div>
                  <div class="chat-status">{{ d('demo.status') }}</div>
                </div>
                <span class="chat-spark">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 2c.4 3.2 1.8 4.6 5 5-3.2.4-4.6 1.8-5 5-.4-3.2-1.8-4.6-5-5 3.2-.4 4.6-1.8 5-5Z"/><path d="M17.5 12c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z"/></svg>
                </span>
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
          <div class="bcard b-wide reveal">
            <div class="bicon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 2c.4 3.2 1.8 4.6 5 5-3.2.4-4.6 1.8-5 5-.4-3.2-1.8-4.6-5-5 3.2-.4 4.6-1.8 5-5Z"/><path d="M17.5 12c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z"/></svg>
            </div>
            <h3 class="btitle">{{ d('f.chat.title') }}</h3>
            <p class="btext">{{ d('f.chat.text') }}</p>
            <div class="mini-bubbles" aria-hidden="true">
              <span class="mb mb-own">{{ d('f.chat.q') }}</span>
              <span class="mb">{{ d('f.chat.a') }}</span>
            </div>
          </div>

          <div class="bcard reveal reveal-delay-1">
            <div class="bicon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            </div>
            <h3 class="btitle">{{ d('f.subjects.title') }}</h3>
            <p class="btext">{{ d('f.subjects.text') }}</p>
            <div class="subj-chips" aria-hidden="true">
              <span class="sc">Φ {{ d('f.subjects.s1') }}</span><span class="sc on">∑ {{ d('f.subjects.s2') }}</span><span class="sc">⌬ {{ d('f.subjects.s3') }}</span>
            </div>
          </div>

          <div class="bcard reveal">
            <div class="bicon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <h3 class="btitle">{{ d('f.files.title') }}</h3>
            <p class="btext">{{ d('f.files.text') }}</p>
            <!-- Мини-список файлов в точности как MaterialListItem: плитки
                 fileVisual (PDF #E5484D, DOC #3B9FF2, PPT #F2A93B на 14% фоне) -->
            <div class="mli-demo" aria-hidden="true">
              <div class="mli-row">
                <div class="mli-icon" style="color:#E5484D;background:#E5484D24">PDF</div>
                <div class="mli-info"><div class="mli-name">lecture_02.pdf</div><div class="mli-meta">PDF</div></div>
              </div>
              <div class="mli-row">
                <div class="mli-icon" style="color:#3B9FF2;background:#3B9FF224">DOC</div>
                <div class="mli-info"><div class="mli-name">seminar_notes.docx</div><div class="mli-meta">DOC</div></div>
              </div>
            </div>
          </div>

          <div class="bcard reveal reveal-delay-1">
            <div class="bicon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <h3 class="btitle">{{ d('f.grader.title') }}</h3>
            <p class="btext">{{ d('f.grader.text') }}</p>
            <div class="pill-demo" aria-hidden="true">
              <span class="status-pill graded"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>87/100</span>
              <span class="status-pill grading"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>{{ d('f.grader.grading') }}</span>
            </div>
          </div>

          <div class="bcard reveal">
            <div class="bicon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <h3 class="btitle">{{ d('f.tasks.title') }}</h3>
            <p class="btext">{{ d('f.tasks.text') }}</p>
          </div>
        </div>
      </section>

      <!-- ===== SUBJECT AI ===== -->
      <section id="subject-ai" class="section split">
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

        <div class="split-visual reveal reveal-right">
          <!-- Реплика страницы предмета с сайта: обложка класса, сегмент-контрол
               табов в стиле iOS (Лекции / Задания / ИИ-чат со скользящим
               индикатором) и содержимое активного таба. -->
          <div class="mock-window cls-win">
            <div class="cls-cover">
              <div class="cls-cover-pattern" aria-hidden="true"></div>
              <div class="cls-cover-t">{{ d('sa.class_name') }}</div>
              <div class="cls-cover-s">{{ d('sa.class_teacher') }}</div>
            </div>
            <div class="tabs-bar">
              <div class="tabs-indicator" :style="{ transform: `translateX(calc(100% * ${clsTab}))` }"></div>
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
                  <div class="mli-icon" style="color:#E5484D;background:#E5484D24">PDF</div>
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
              <span></span><span></span><span></span>
              <span class="mw-file">
                <span class="ftb" style="background:#E5484D">PDF</span>
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
                    <div class="mli-icon" style="color:#E5484D;background:#E5484D24">PDF</div>
                    <div class="mli-info"><div class="mli-name">lecture_02.pdf</div><div class="mli-meta">PDF</div></div>
                    <svg class="mli-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                  <div class="mli-row">
                    <div class="mli-icon" style="color:#3B9FF2;background:#3B9FF224">DOC</div>
                    <div class="mli-info"><div class="mli-name">seminar_notes.docx</div><div class="mli-meta">DOC</div></div>
                    <svg class="mli-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                  <div class="mli-row">
                    <div class="mli-icon" style="color:#F2A93B;background:#F2A93B24">PPT</div>
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

      <!-- ===== AI GRADER ===== -->
      <section id="grader" class="section split">
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
          <!-- Реплика GradeResultCard из приложения: hero с кольцом на
               подкрашенной подложке, бейдж «Проверено ИИ», разбор ИИ и
               две карточки сильных сторон / зон роста. -->
          <div class="grc">
            <div class="grc-hero">
              <div class="grc-hero-wash" aria-hidden="true"></div>
              <div class="grc-hero-inner">
                <template v-if="graderShown"><ScoreRing :score="87" :max-score="100"/></template>
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

            <div class="grc-analysis-grid">
              <div class="grc-bullet-card ok">
                <div class="grc-bullet-title">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ d('gr.st_title') }}
                </div>
                <div class="grc-bullet-row"><span class="grc-dot"></span><span>{{ d('gr.strength') }}</span></div>
                <div class="grc-bullet-row"><span class="grc-dot"></span><span>{{ d('gr.strength2') }}</span></div>
              </div>
              <div class="grc-bullet-card warn">
                <div class="grc-bullet-title">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  {{ d('gr.im_title') }}
                </div>
                <div class="grc-bullet-row"><span class="grc-dot"></span><span>{{ d('gr.improve') }}</span></div>
                <div class="grc-bullet-row"><span class="grc-dot"></span><span>{{ d('gr.improve2') }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== DEADLINES =====
           Карточки заданий один в один с AssignmentCard: акцентная кромка,
           иконка 44px, мета (дедлайн/баллы) и статус-пиллы. -->
      <section id="deadlines" class="section">
        <div class="sec-head reveal">
          <div class="kicker">{{ d('dl.kicker') }}</div>
          <h2 class="sec-title">{{ d('dl.title') }}</h2>
          <p class="sec-sub">{{ d('dl.sub') }}</p>
        </div>

        <div class="asgn-list">
          <div class="asgn-card reveal">
            <div class="asgn-accent accent-blue"></div>
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
                <span class="meta-score">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                  {{ d('dl.item1_score') }}
                </span>
              </div>
            </div>
            <div class="status-pill pending">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ d('dl.st_pending') }}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="asgn-arrow"><path d="M9 18l6-6-6-6"/></svg>
          </div>

          <div class="asgn-card reveal reveal-delay-1">
            <div class="asgn-accent accent-purple"></div>
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
            <div class="status-pill grading">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              {{ d('dl.st_grading') }}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="asgn-arrow"><path d="M9 18l6-6-6-6"/></svg>
          </div>

          <div class="asgn-card reveal reveal-delay-2">
            <div class="asgn-accent accent-green"></div>
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
            <div class="status-pill graded">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              87/100
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="asgn-arrow"><path d="M9 18l6-6-6-6"/></svg>
          </div>

          <div class="asgn-card reveal reveal-delay-3">
            <div class="asgn-accent accent-red"></div>
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
            <div class="status-pill late">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ d('dl.st_late') }}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="asgn-arrow"><path d="M9 18l6-6-6-6"/></svg>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { useOrgStore, applyOrgTheme } from '~/stores/org.store'

definePageMeta({ layout: false })
useHead({ title: 'Chatra — AI for Education' })

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
      title: { ru: 'Начните учиться', en: 'Start learning', kk: 'Оқуды бастаңыз' }[l],
      title_1: { ru: 'Начните учиться', en: 'Start learning', kk: 'Оқуды бастаңыз' }[l],
      title_2: { ru: 'эффективнее уже сегодня', en: 'more effectively today', kk: 'тиімдірек бүгін' }[l],
      sub: {
        ru: 'Лекции, ИИ по каждому предмету и дедлайны — в одном приложении.',
        en: 'Lectures, an AI for every subject and deadlines — in one app.',
        kk: 'Дәрістер, әр пәнге арналған ЖИ және мерзімдер — бір қосымшада.',
      }[l],
    },
    hero: {
      title_1: { ru: 'Учитесь эффективнее с ИИ,', en: 'Learn more effectively with an AI', kk: 'Өз дәрістеріңізді білетін ЖИ-мен' }[l],
      title_2: { ru: 'который знает ваши лекции', en: 'that knows your lectures', kk: 'тиімді оқыңыз' }[l],
      sub: {
        ru: 'Chatra — учебная платформа с ИИ для каждого предмета: отвечает по вашим лекциям, проверяет работы и не даёт пропустить дедлайны.',
        en: 'Chatra is a learning platform with an AI for every subject: it answers from your lectures, grades your work and never lets a deadline slip.',
        kk: 'Chatra — әр пәнге арналған ЖИ бар оқу платформасы: дәрістеріңіз бойынша жауап береді, жұмыстарды тексереді және мерзімді жібермейді.',
      }[l],
    },
    demo: {
      subject: { ru: 'Физика · ИИ предмета', en: 'Physics · Subject AI', kk: 'Физика · Пән ЖИ' }[l],
      status: { ru: 'знает 12 лекций', en: 'knows 12 lectures', kk: '12 дәрісті біледі' }[l],
      placeholder: { ru: 'Спросите Chatra AI', en: 'Ask Chatra AI', kk: 'Chatra ЖИ-ден сұраңыз' }[l],
    },
    msgs: [
      { own: true, text: { ru: 'Объясни квантовый туннельный эффект простыми словами', en: 'Explain quantum tunneling in simple words', kk: 'Кванттық туннель эффектісін қарапайым тілмен түсіндір' }[l] },
      { text: { ru: 'Согласно лекции №8: представьте мяч, который отскакивает от стены. Квантовая частица иногда оказывается «по ту сторону» — с некоторой вероятностью она проходит через барьер…', en: "From lecture №8: imagine a ball bouncing off a wall. A quantum particle sometimes ends up 'on the other side' — with some probability it passes through the barrier…", kk: '№8 дәріс бойынша: доп қабырғадан секіреді елестетіңіз. Кванттық бөлшек кейде «екінші жағында» болады — белгілі бір ықтималдықпен кедергіден өтеді…' }[l] },
      { own: true, text: { ru: 'Составь план ответа к семинару', en: 'Make me a seminar answer outline', kk: 'Семинарға жауап жоспарын құр' }[l] },
      { text: { ru: 'Вот структура из трёх шагов: определение → физический смысл → эксперименты. Развернуть каждый пункт?', en: 'Here is a three-step structure: definition → physical meaning → experiments. Expand each point?', kk: 'Үш қадамдық құрылым: анықтама → физикалық мағына → тәжірибелер. Әр пунктті ашайын ба?' }[l] },
    ],
    features: {
      kicker: { ru: 'ВОЗМОЖНОСТИ', en: 'FEATURES', kk: 'МҮМКІНДІКТЕР' }[l],
      title: { ru: 'Всё для учёбы в одном месте', en: 'Everything for study in one place', kk: 'Оқуға қажеттінің бәрі бір жерде' }[l],
      sub: {
        ru: 'Chatra объединяет ИИ, материалы предметов и контроль успеваемости — как приложение, которым пользуются каждый день.',
        en: 'Chatra brings together AI, course materials and progress tracking — an app you will use every day.',
        kk: 'Chatra ЖИ, пән материалдары мен үлгерімді бір жерге жинайды — күн сайын қолданатын қосымша.',
      }[l],
    },
    f: {
      chat: {
        title: { ru: 'Умный ИИ-чат', en: 'Smart AI chat', kk: 'Ақылды ЖИ-чат' }[l],
        text: {
          ru: 'Задавайте любые вопросы — от объяснения темы до подготовки к экзамену. История сохраняется: важные диалоги можно закрепить и переименовать.',
          en: 'Ask anything — from topic explanations to exam prep. History is saved: pin and rename the conversations that matter.',
          kk: 'Кез келген сұрақ қойыңыз — тақырыптан емтиханға дейін. Тарих сақталады: маңызды диалогтарды бекітіп, атауын өзгертуге болады.',
        }[l],
        q: { ru: 'Как решать интегралы по частям?', en: 'How does integration by parts work?', kk: 'Бөліктер бойынша интегралдау қалай?' }[l],
        a: { ru: 'Разберём по формуле на примере…', en: 'Let’s break it down by formula…', kk: 'Формула бойынша мысалмен талдайық…' }[l],
      },
      subjects: {
        title: { ru: 'Отдельный ИИ для каждого предмета', en: 'A dedicated AI for every subject', kk: 'Әр пәнге арналған жеке ЖИ' }[l],
        text: {
          ru: 'У каждого предмета — свой ассистент, обученный на его лекциях. Ответы опираются на ваши материалы, а не на общие знания из интернета.',
          en: 'Every subject gets its own assistant trained on its lectures. Answers are grounded in your materials, not generic web knowledge.',
          kk: 'Әр пәннің өз көмекшісі бар, ол сол пәннің дәрістерінен оқытылған. Жауаптар сіздің материалдарыңызға негізделеді.',
        }[l],
        s1: { ru: 'Физика', en: 'Physics', kk: 'Физика' }[l],
        s2: { ru: 'Математика', en: 'Math', kk: 'Математика' }[l],
        s3: { ru: 'Биология', en: 'Biology', kk: 'Биология' }[l],
      },
      files: {
        title: { ru: 'Лекции и файлы', en: 'Lectures & files', kk: 'Дәрістер мен файлдар' }[l],
        text: {
          ru: 'PDF, DOCX и презентации хранятся вместе с предметом. Читайте, выделяйте и спрашивайте ИИ прямо по документу.',
          en: 'PDFs, DOCX and slides live with each subject. Read, highlight and ask the AI right inside the document.',
          kk: 'PDF, DOCX және презентациялар пәнмен бірге сақталады. Оқыңыз, белгілеңіз және құжат бойынша ЖИ-ден сұраңыз.',
        }[l],
      },
      grader: {
        title: { ru: 'AI Grader', en: 'AI Grader', kk: 'AI Grader' }[l],
        text: {
          ru: 'Мгновенная обратная связь по заданиям: баллы, сильные стороны и зоны роста — сразу после сдачи.',
          en: 'Instant feedback on assignments: scores, strengths and growth areas — right after submission.',
          kk: 'Тапсырмалар бойынша жедел кері байланыс: ұпайлар, күшті жақтары мен даму аймақтары — тапсырғаннан кейін.',
        }[l],
        grading: { ru: 'Проверяется', en: 'Grading', kk: 'Тексерілуде' }[l],
      },
      tasks: {
        title: { ru: 'Задания и дедлайны', en: 'Assignments & deadlines', kk: 'Тапсырмалар мен мерзімдер' }[l],
        text: {
          ru: 'Все задания предмета и сроки в одном календаре. Видно, что сдано, что на проверке и что горит.',
          en: 'All assignments and due dates in one calendar. See what is submitted, in review, or overdue.',
          kk: 'Барлық тапсырмалар мен мерзімдер бір күнтізбеде. Не тапсырылғаны, не тексерілуде, не кешіктірілгені көрінеді.',
        }[l],
      },
      notif: {
        title: { ru: 'Уведомления в реальном времени', en: 'Real-time notifications', kk: 'Нақты уақыттағы хабарламалар' }[l],
        text: {
          ru: 'Новые материалы, оценки и ответы ИИ приходят мгновенно — ничего не нужно обновлять вручную.',
          en: 'New materials, grades and AI replies arrive instantly — no manual refresh needed.',
          kk: 'Жаңа материалдар, бағалар мен ЖИ жауаптары бірден келеді — қолмен жаңартудың қажеті жоқ.',
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
        ru: 'Выберите предмет — и общайтесь с его собственным ассистентом. Он отвечает со ссылками на конкретные лекции и файлы.',
        en: 'Pick a subject and talk to its dedicated assistant. It answers with references to specific lectures and files.',
        kk: 'Пәнді таңдаңыз және оның жеке көмекшісімен сөйлесіңіз. Ол нақты дәрістерге сілтеме жасап жауап береді.',
      }[l],
      points: [
        { ru: 'Знает контекст каждой лекции — темы, термины и формулы', en: 'Knows the context of every lecture — topics, terms and formulas', kk: 'Әр дәрістің контекстін біледі — тақырыптан формулаларға дейін' }[l],
        { ru: 'Ответы с указанием источника — лекции и файлы', en: 'Answers cite their source — lectures and files', kk: 'Жауаптар дереккөзді көрсетеді — дәрістер мен файлдар' }[l],
        { ru: 'Понимает графики и обозначения именно вашего курса', en: 'Understands your course’s graphs and notation', kk: 'Сіздің курсіңіздің графиктері мен белгіленімін түсінеді' }[l],
        { ru: 'Помнит историю ваших диалогов по предмету', en: 'Remembers your per-subject conversation history', kk: 'Пән бойынша диалог тарихын есте сақтайды' }[l],
      ] as string[],
    },
    hl: {
      kicker: { ru: 'МАТЕРИАЛЫ И ВЫДЕЛЕНИЯ', en: 'MATERIALS & HIGHLIGHTS', kk: 'МАТЕРИАЛДАР МЕН БЕЛГІЛЕУЛЕР' }[l],
      title: { ru: 'Выделяйте главное — и спрашивайте ИИ прямо там', en: 'Highlight what matters — and ask the AI right there', kk: 'Бастысын белгілеңіз — ЖИ-ден сол жерде сұраңыз' }[l],
      text: {
        ru: 'Откройте лекцию, выделите любой фрагмент — и сразу задайте вопрос ИИ по выделенному. Каждый отрывок сохраняется в панель «Мои выделения» вместе с заметками и номером страницы.',
        en: 'Open a lecture, select any passage — and immediately ask the AI about it. Every highlight is saved to the “My highlights” panel with notes and page numbers.',
        kk: 'Дәрісті ашыңыз, кез келген бөлікті белгілеңіз — ЖИ-ден сол бойынша бірден сұраңыз. Әр үзінді «Менің белгілеулерім» панелінде жазбалармен және бет нөмірімен сақталады.',
      }[l],
      points: [
        { ru: 'Четыре цвета выделения: жёлтый, зелёный, синий, красный', en: 'Four highlight colors: yellow, green, blue, red', kk: 'Төрт түс: сары, жасыл, көк, қызыл' }[l],
        { ru: '«Спросить AI» прямо из меню выделения', en: '“Ask AI” straight from the selection menu', kk: 'Белгілеу мәзірінен бірден «AI-дан сұрау»' }[l],
        { ru: 'Заметки к каждому выделению и переход на страницу', en: 'Notes on every highlight and jump-to-page', kk: 'Әр белгілеуге жазба және бетке өту' }[l],
        { ru: 'Все выделения предмета — в одной панели', en: 'All highlights of a subject in one panel', kk: 'Пәннің барлық белгілеулері бір панельде' }[l],
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
        ru: 'Классическое определение — спросить на семинаре',
        en: 'Classic definition — ask at the seminar',
        kk: 'Классикалық анықтама — семинарда сұрайық',
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
        ru: 'Сдайте работу — AI Grader оценит её по критериям преподавателя и подробно разберёт, что получилось и что улучшить.',
        en: 'Submit your work — AI Grader scores it against the teacher’s criteria and explains what worked and what to improve.',
        kk: 'Жұмысты тапсырыңыз — AI Grader оны мұғалімнің критерийлері бойынша бағалап, не жақсы, не жақсарту керегін түсіндіреді.',
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
    dl: {
      kicker: { ru: 'ЗАДАНИЯ И ДЕДЛАЙНЫ', en: 'ASSIGNMENTS & DEADLINES', kk: 'ТАПСЫРМАЛАР МЕН МЕРЗІМДЕР' }[l],
      title: { ru: 'Дедлайны больше не застают врасплох', en: 'Deadlines never sneak up on you', kk: 'Мерзімдер кенеттен таңқалдырмайды' }[l],
      sub: {
        ru: 'Каждое задание — с дедлайном, баллами и статусом: видно, что сдано, что проверяется и что требует внимания.',
        en: 'Every assignment comes with a due date, points and a status: see what is done, what is being graded, and what needs attention.',
        kk: 'Әр тапсырмада мерзім, ұпай және статус: не тапсырылғаны, не тексерілуде, не назар аударуды қажет ететіні көрінеді.',
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
        ru: 'Сделано с заботой об учёбе',
        en: 'Built with care for learning',
        kk: 'Оқуға деген қамқорлықпен жасалды',
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

/* --- Навигационная шапка: hairline-граница появляется только при скролле --- */
const scrolled = ref(false)
let scrollRaf = 0
const onScroll = (e: Event) => {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrolled.value = (e.target as HTMLElement).scrollTop > 8
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
const reducedMotion = typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

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
const clsTab = ref(2)
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

/* --- Секция AI Grader: ScoreRing монтируем только когда карточка видна,
       чтобы счётчик «набегал» на глазах у пользователя --- */
const graderSection = ref<HTMLElement | null>(null)
const graderShown = ref(reducedMotion)
let graderObserver: IntersectionObserver | null = null

/* Локальный reveal-обзервер. Глобальный плагин (plugins/animations.client.ts)
   наблюдает .reveal по router.afterEach +80ms, но при клиентской навигации
   с page transition (out-in) DOM этой страницы монтируется позже — observe
   находил ноль элементов, и все секции оставались с opacity:0. Поэтому
   лендинг наблюдает свои .reveal самостоятельно в onMounted. */
let revealObserver: IntersectionObserver | null = null

const visibleMsgs = computed(() => dict.value.msgs.slice(0, visibleCount.value))
let stopChat: (() => void) | null = null

onMounted(() => {
  if (!reducedMotion) stopChat = scheduleLoop()

  const root = document.querySelector('.landing')
  if (root) {
    const els = root.querySelectorAll('.reveal')
    if (reducedMotion) {
      els.forEach(el => el.classList.add('revealed'))
    } else {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed')
            revealObserver?.unobserve(e.target)
          }
        })
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
      els.forEach(el => revealObserver!.observe(el))
    }
  }

  if (!graderShown.value && graderSection.value) {
    graderObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { graderShown.value = true; graderObserver?.disconnect() }
      })
    }, { threshold: 0.25 })
    graderObserver.observe(graderSection.value)
  }
})
onUnmounted(() => { stopChat?.(); graderObserver?.disconnect(); revealObserver?.disconnect() })

const year = new Date().getFullYear()
</script>

<style scoped>
/* ====== КАРКАС ======
   #__nuxt в main.css зафиксирован как 100dvh/overflow:hidden — скроллит
   сама обёртка лендинга, как это делают .pg-body внутри приложения. */
.landing{height:100vh;height:100dvh;overflow-y:auto;overflow-x:hidden;background:var(--bg);scroll-behavior:smooth;-webkit-overflow-scrolling:touch}
@media (prefers-reduced-motion: reduce){.landing{scroll-behavior:auto}}

.l-main{width:100%}
.section{scroll-margin-top:72px}

/* ====== НАВИГАЦИЯ ====== */
.lnav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,.55);-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid transparent;transition:background .25s ease,border-color .25s ease}
html.dark .lnav{background:rgba(11,11,13,.55)}
.lnav.scrolled{background:rgba(255,255,255,.78);border-bottom-color:var(--border)}
html.dark .lnav.scrolled{background:rgba(11,11,13,.78)}
/* Плотная шапка вместо стеклянной для пользователей с этой ОС-настройкой */
@media (prefers-reduced-transparency: reduce){
  .lnav,.lnav.scrolled{background:var(--surface);backdrop-filter:none;-webkit-backdrop-filter:none}
}
.lnav-inner{max-width:1160px;margin:0 auto;padding:13px 24px;display:flex;align-items:center;gap:22px}

.l-brand{display:flex;align-items:center;gap:9px;cursor:pointer;flex-shrink:0}
.l-logo{display:block;width:44px;aspect-ratio:1200/734;background:linear-gradient(180deg,var(--teal),var(--teal-d));-webkit-mask:url('/logo.png') center / contain no-repeat;mask:url('/logo.png') center / contain no-repeat;flex-shrink:0}
.l-logo.sm{width:30px}
.l-brand-name{font-size:17px;font-weight:800;color:var(--text1);letter-spacing:-.02em}

.lnav-r{display:flex;align-items:center;gap:10px;flex-shrink:0;margin-left:auto}
.lang-pill{position:relative;display:flex;align-items:center;background:var(--surface2);border:1px solid var(--border);border-radius:100px;padding:3px}
.lang-p{position:relative;z-index:1;padding:5px 10px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:.04em;color:var(--text4);transition:color .2s,transform .12s}
.lang-p:active{transform:scale(.92)}
.lang-p.active{background:var(--surface);color:var(--text1);box-shadow:var(--sh-xs)}

/* ====== HERO ====== */
.hero{position:relative;padding:calc(var(--topbar) + 64px) 24px 110px;overflow:hidden}
.hero-grid{position:relative;z-index:1;max-width:1160px;margin:0 auto;display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center}

.orb{position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none}
.orb-a{width:560px;height:560px;top:-180px;left:-140px;background:rgba(var(--teal-rgb),.15);animation:orb-drift 14s ease-in-out infinite alternate}
.orb-b{width:440px;height:440px;bottom:-160px;right:-100px;background:rgba(var(--teal-rgb),.10);animation:orb-drift 17s ease-in-out infinite alternate-reverse}
@keyframes orb-drift{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(40px,26px,0) scale(1.08)}}
@media (prefers-reduced-motion: reduce){.orb{animation:none}}

.hero-title{font-size:clamp(36px,4.8vw,60px);font-weight:800;line-height:1.06;letter-spacing:-.033em;color:var(--text1);margin-bottom:22px}
.grad-text{background:linear-gradient(120deg,var(--teal),var(--teal-h) 55%,var(--teal-d));-webkit-background-clip:text;background-clip:text;color:transparent}
.hero-sub{font-size:17.5px;color:var(--text3);line-height:1.65;max-width:480px;margin-bottom:32px}
.hero-ctas{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.hero-cta{height:52px;border-radius:15px;padding:0 26px;font-size:15.5px;box-shadow:0 8px 24px rgba(var(--teal-rgb),.28)}
.hero-cta:hover{box-shadow:0 10px 30px rgba(var(--teal-rgb),.38)}

/* --- Макет чата (копия ClassAiChat) --- */
.hero-visual{position:relative;display:flex;justify-content:center}
.chat-card{width:100%;max-width:440px;background:var(--surface);border:1px solid var(--border);border-radius:24px;box-shadow:var(--sh-lg);overflow:hidden}
.chat-head{display:flex;align-items:center;gap:10px;padding:13px 16px;border-bottom:1px solid var(--border);background:var(--glass)}
.chat-dot{width:9px;height:9px;border-radius:50%;background:var(--green);flex-shrink:0;box-shadow:0 0 0 3px rgba(22,163,74,.15)}
html.dark .chat-dot{box-shadow:0 0 0 3px rgba(74,222,128,.15)}
.chat-head-t{min-width:0;flex:1}
.chat-title{font-size:13.5px;font-weight:700;color:var(--text1);letter-spacing:-.01em}
.chat-status{font-size:11px;color:var(--text4)}
.chat-spark{width:28px;height:28px;border-radius:9px;background:rgba(var(--teal-rgb),.08);border:1px solid rgba(var(--teal-rgb),.18);color:var(--teal);display:flex;align-items:center;justify-content:center;flex-shrink:0}
/* Сообщения — те же классы, что в макете ИИ-вкладки предмета ниже
   (.msg-row/.msg-sender/.msg-bubble): у ассистента подпись «Chatra AI» и
   пузырь на --surface с бордером, у пользователя — градиентный тил-пузырь.
   Один в один с ClassAiChat, никаких «своих» пузырей. */
.chat-body{display:flex;flex-direction:column;gap:14px;padding:16px;min-height:372px;justify-content:flex-end}
.chat-body .msg-row{max-width:88%}
.chat-body .msg-bubble{font-size:13px;padding:11px 15px}

/* Поле ввода — копия .ai-input-bar/.ai-textarea/.send-btn из ClassAiChat */
.ai-input-bar{display:flex;align-items:center;gap:10px;padding:12px 14px;border-top:1px solid var(--border);background:var(--surface)}
.ai-textarea{flex:1;min-width:0;background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:11px 15px;color:var(--text4);font-size:13.5px;line-height:1.5}
.send-btn{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--teal-h));color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 14px rgba(var(--teal-rgb),.4)}

.typing-bbl{display:inline-flex;align-items:center;gap:5px;width:auto}
.typing-bbl span{width:6px;height:6px;border-radius:50%;background:var(--text4);animation:bounce .8s ease infinite}
.typing-bbl span:nth-child(2){animation-delay:.14s}
.typing-bbl span:nth-child(3){animation-delay:.28s}
@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
@media (prefers-reduced-motion: reduce){.typing-bbl span{animation:none}}

/* ====== СЕКЦИИ ====== */
.section{max-width:1160px;margin:0 auto;padding:110px 24px}
.sec-head{text-align:center;max-width:660px;margin:0 auto 56px}
.sec-title{font-size:clamp(29px,3.4vw,42px);font-weight:800;line-height:1.12;letter-spacing:-.028em;color:var(--text1);margin-bottom:14px}
.sec-title.left{text-align:left}
.sec-sub{font-size:16px;color:var(--text3);line-height:1.65}
.sec-sub.left{text-align:left}
.kicker{font-size:12px;font-weight:800;letter-spacing:.09em;color:var(--teal);margin-bottom:12px}

/* --- Bento --- */
/* Apple-стиль: плоская белая плитка с волосной границей, воздух, иконка без
   плашки; тень появляется только при наведении. */
.bento{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.bcard{background:var(--surface);border:1px solid var(--border);border-radius:28px;padding:34px 32px;box-shadow:none;display:flex;flex-direction:column;gap:10px;transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s,border-color .25s}
@media (hover:hover){.bcard:hover{transform:translateY(-3px);box-shadow:var(--sh-md);border-color:var(--border2)}}
.b-wide{grid-column:span 2}
.bicon{color:var(--teal);margin-bottom:10px}
.btitle{font-size:17.5px;font-weight:700;color:var(--text1);letter-spacing:-.02em}
.btext{font-size:14px;color:var(--text3);line-height:1.65;flex:1}

.mini-bubbles{display:flex;flex-direction:column;gap:8px;margin-top:12px}
/* Те же пузыри, что в реальном чате: ассистент — --surface с бордером,
   пользователь — градиентный тил (геометрия .msg-bubble из ClassAiChat) */
.mb{max-width:80%;width:fit-content;padding:9px 13px;border-radius:14px;border-bottom-left-radius:4px;font-size:12px;line-height:1.5;color:var(--text1);background:var(--surface);border:1px solid var(--border)}
.mb-own{align-self:flex-end;background:linear-gradient(135deg,var(--teal),var(--teal-h));color:#fff;border:none;border-radius:14px;border-bottom-right-radius:4px;box-shadow:0 3px 12px rgba(var(--teal-rgb),.28)}

.subj-chips{display:flex;gap:7px;flex-wrap:wrap;margin-top:auto}
.sc{padding:5px 12px;border-radius:100px;background:var(--surface2);border:1px solid var(--border);font-size:12px;font-weight:600;color:var(--text3)}
.sc.on{background:var(--teal);border-color:var(--teal);color:#fff}

/* Строки файлов — копия MaterialListItem (.mli-*) */
.mli-demo{display:flex;flex-direction:column;margin-top:auto;border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden}
.mli-row{display:flex;align-items:center;gap:12px;width:100%;padding:10px 14px;border-bottom:1px solid var(--border);text-align:left}
.mli-row:last-child{border-bottom:none}
.mli-icon{width:38px;height:38px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;letter-spacing:.02em;flex-shrink:0}
.mli-info{flex:1;min-width:0}
.mli-name{font-size:13.5px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mli-meta{font-size:11.5px;color:var(--text4);letter-spacing:.02em;margin-top:1px}
.mli-chevron{color:var(--text4);flex-shrink:0}

/* Статус-пиллы — копия AssignmentCard (.status-pill) */
.pill-demo{display:flex;gap:8px;flex-wrap:wrap;margin-top:auto}
.status-pill{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:100px;font-size:12px;font-weight:700;white-space:nowrap}
.status-pill.graded{background:rgba(74,222,128,.1);color:var(--green);border:1px solid rgba(74,222,128,.2)}
.status-pill.grading{background:rgba(251,191,36,.12);color:var(--yellow);border:1px solid rgba(251,191,36,.25)}
.status-pill.submitted{background:rgba(74,222,128,.1);color:var(--green);border:1px solid rgba(74,222,128,.2)}
.status-pill.late{background:var(--red-l);color:var(--red);border:1px solid rgba(248,113,113,.2)}
.status-pill.pending{background:var(--surface2);color:var(--text3);border:1px solid var(--border)}

/* --- Split-секции --- */
.split{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
.split-copy{min-width:0}
.split-visual{min-width:0;display:flex;justify-content:center}
.checklist{list-style:none;display:flex;flex-direction:column;gap:12px;margin-top:26px}
.checklist li{display:flex;align-items:flex-start;gap:10px;font-size:14.5px;color:var(--text2);line-height:1.5}
.checklist svg{color:var(--teal);flex-shrink:0;margin-top:2px}

.mock-window{width:100%;max-width:540px;background:var(--surface);border:1px solid var(--border);border-radius:24px;box-shadow:var(--sh-lg);overflow:hidden}

/* --- Макет страницы предмета (реплика pages/classes/[id].vue) --- */
.cls-win{max-width:560px}
/* Обложка класса — тил-градиент как у SubjectCover */
.cls-cover{position:relative;padding:26px 24px 22px;background:linear-gradient(135deg,var(--teal-d),var(--teal));color:#fff;overflow:hidden}
.cls-cover-pattern{position:absolute;inset:0;background:radial-gradient(ellipse at 85% -20%,rgba(255,255,255,.25),transparent 60%);pointer-events:none}
.cls-cover-t{position:relative;font-size:19px;font-weight:800;letter-spacing:-.02em}
.cls-cover-s{position:relative;font-size:12px;color:rgba(255,255,255,.8);margin-top:3px}

/* Сегмент-контрол табов — копия .tabs-bar/.tab-btn с класс-страницы:
   «полочка» на --surface2 со скользящей подложкой активного таба */
.tabs-bar{position:relative;display:flex;align-items:stretch;padding:3px;background:var(--surface2);border-bottom:1px solid var(--border)}
.tabs-indicator{position:absolute;top:3px;bottom:3px;left:3px;width:calc((100% - 6px) / 3);background:var(--surface);border-radius:9px;box-shadow:0 1px 4px rgba(0,0,0,.12);transition:transform .32s cubic-bezier(.32,.72,0,1)}
html.dark .tabs-indicator{box-shadow:0 1px 4px rgba(0,0,0,.35)}
.tab-btn{position:relative;z-index:1;flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:9px 6px;font-size:12px;font-weight:600;color:var(--text4);background:transparent;border:none;border-radius:9px;cursor:pointer;transition:color .2s;white-space:nowrap;font-family:inherit;letter-spacing:-.01em}
.tab-btn svg{flex-shrink:0}
.tab-btn.active{color:var(--text1);font-weight:700}
.tab-num{font-size:10.5px;font-weight:700;background:var(--surface3);color:var(--text3);padding:1px 6px;border-radius:100px}
.tab-btn.active .tab-num{background:var(--teal-l);color:var(--teal)}

.cls-pane{display:flex;flex-direction:column;min-height:300px}
.cls-list{display:flex;flex-direction:column}
.cls-list .mli-row{padding:12px 16px}
.cls-asgn{display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid var(--border)}
.cls-asgn:last-child{border-bottom:none}
.cls-asgn-t{flex:1;min-width:0;font-size:13px;font-weight:700;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cls-asgn-m{font-size:11.5px;color:var(--text4);flex-shrink:0}

.mw-bar{display:flex;gap:6px;padding:12px 14px;border-bottom:1px solid var(--border);background:var(--glass);align-items:center}
.mw-bar span{width:9px;height:9px;border-radius:50%;background:var(--surface3);flex-shrink:0}
.mw-file{display:flex;align-items:center;gap:7px;margin-left:10px;font-size:12px;font-weight:600;color:var(--text3)}
.ftb{display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:800;letter-spacing:.04em;padding:2px 6px;border-radius:4px;line-height:1.4;min-width:28px}
.mw-chat{flex:1;padding:16px;display:flex;align-items:center}

/* Реплика сообщений ClassAiChat: у ассистента — «Chatra AI» и пузырь на
   --surface с бордером; у пользователя — градиентный пузырь с тенью. */
.cai-msgs{display:flex;flex-direction:column;gap:12px;width:100%}
.msg-row{display:flex;flex-direction:column;gap:6px;max-width:85%}
.msg-row.user{align-self:flex-end;align-items:flex-end}
.msg-row.assistant{align-self:flex-start}
.msg-sender{font-size:11.5px;font-weight:700;color:var(--text3)}
.msg-bubble{padding:11px 15px;border-radius:18px;font-size:12.5px;line-height:1.6;word-break:break-word;animation:msg-in .3s cubic-bezier(.16,1,.3,1)}
.msg-row.assistant .msg-bubble{background:var(--surface);border:1px solid var(--border);color:var(--text1);border-bottom-left-radius:6px}
.msg-row.user .msg-bubble{background:linear-gradient(135deg,var(--teal),var(--teal-h));color:#fff;border-bottom-right-radius:6px;box-shadow:0 4px 20px rgba(var(--teal-rgb),.3)}
.mw-input{display:flex;align-items:center;gap:8px;padding:10px 12px;border-top:1px solid var(--border);background:var(--surface)}
.ai-textarea.sm{padding:9px 13px;font-size:12.5px;border-radius:12px}
.send-btn.sm{width:36px;height:36px}

.fade-enter-active,.fade-leave-active{transition:opacity .18s ease}
.fade-enter-from,.fade-leave-to{opacity:0}

/* --- Макет экрана лекции (материалы + выделения) ---
   Секция асимметричная: визуальной колонке с окном лекции отдаём больше
   места, чтобы плавающее меню выделения помещалось целиком.
   Класс, а не #id: ID-селектор перебивал мобильный .split{1fr} из медиазапроса
   (специфичность в медиазапросе не растёт), и секция не складывалась на телефоне. */
.split-lec{grid-template-columns:1.15fr 1fr;gap:48px}
.lec-win{max-width:660px}
.lec-body{display:grid;grid-template-columns:1.2fr 1fr;min-height:360px}
.lec-page{padding:20px 22px;border-right:1px solid var(--border);position:relative}
.lec-h{font-size:15px;font-weight:800;color:var(--text1);letter-spacing:-.015em;margin-bottom:12px}
.lec-p{font-size:12.5px;line-height:1.75;color:var(--text2);margin-bottom:12px}
.hl-mark{border-radius:3px;padding:1px 2px}
.hl-yellow{background:rgba(255,216,77,.42)}
html.dark .hl-yellow{background:rgba(255,216,77,.28)}
.hl-green{background:rgba(123,220,160,.4)}
html.dark .hl-green{background:rgba(123,220,160,.26)}

/* Меню выделения — копия HighlightMenu (.hm-*), компактный размер,
   чтобы помещаться в колонку документа без обрезки */
.hm{position:absolute;z-index:5;left:57%;transform:translate(-50%,-44px);display:inline-flex;padding:5px;background:var(--surface);border:1px solid var(--border);border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.16),0 2px 8px rgba(0,0,0,.08);white-space:nowrap}
.hm-row{display:flex;align-items:center;gap:1px}
.hm-color{width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px}
.hm-color.active{background:var(--surface3)}
.hm-color span{width:15px;height:15px;border-radius:50%;display:block;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)}
.c-yellow{background:#FFD84D}.c-green{background:#7BDCA0}.c-blue{background:#7CC5F5}.c-red{background:#FF9A9A}
.hm-sep{width:1px;height:16px;background:var(--border);margin:0 4px;flex-shrink:0}
.hm-btn{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 8px;border-radius:8px;color:var(--text2);font-size:11.5px;font-weight:600}
.hm-btn.hm-ai{color:var(--teal)}

.lec-side{padding:16px;background:var(--glass)}
.hp-label{display:flex;align-items:center;gap:7px;font-size:11.5px;font-weight:700;color:var(--text4);text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px}
.hp-count{font-size:11px;font-weight:700;letter-spacing:0;background:var(--surface3);color:var(--text3);padding:1px 7px;border-radius:100px}
.hp-list{display:flex;flex-direction:column;background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden}
.hp-list.files{background:var(--surface)}
.hp-row{position:relative;display:flex;align-items:flex-start;gap:11px;padding:11px 12px 11px 0;border-bottom:1px solid var(--border)}
.hp-row:last-child{border-bottom:none}
.hp-bar{width:3px;align-self:stretch;border-radius:0 3px 3px 0;flex-shrink:0}
.hp-main{flex:1;min-width:0}
.hp-text{font-size:12.5px;line-height:1.45;color:var(--text1);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.hp-note{display:flex;align-items:flex-start;gap:5px;margin-top:5px;font-size:11.5px;line-height:1.4;color:var(--text3)}
.hp-note svg{flex-shrink:0;margin-top:2px}
.hp-meta{font-size:11px;color:var(--text4);margin-top:4px}
.lec-side .mli-row{padding:9px 12px}

/* --- AI Grader: реплика GradeResultCard (.grc-*, tone-good) --- */
.grc{width:100%;max-width:420px;display:flex;flex-direction:column;gap:14px}
.grc-hero{position:relative;overflow:hidden;border-radius:var(--r-2xl);background:var(--surface);border:1px solid var(--border);box-shadow:var(--sh-xs)}
.grc-hero-wash{position:absolute;inset:-40% -20% auto -20%;height:78%;background:radial-gradient(ellipse at 50% 0%, rgba(var(--teal-rgb),.22), rgba(var(--teal-rgb),0) 70%);pointer-events:none}
.grc-hero-inner{position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;padding:22px 18px 20px}
.grc-verdict{font-size:19px;font-weight:800;letter-spacing:-.02em;color:var(--text1);text-align:center;line-height:1.2}
.grc-by-badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--text2);background:var(--surface2);border:1px solid var(--border);padding:5px 12px;border-radius:100px}
.grc-by-badge svg{color:var(--teal)}
.grc-summary{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:15px 16px;display:flex;flex-direction:column;gap:9px;box-shadow:var(--sh-xs)}
.grc-summary-head{display:flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--text4)}
.grc-spark{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:7px;flex-shrink:0;background:linear-gradient(140deg,var(--teal-h),var(--teal-d));color:#fff;box-shadow:0 2px 6px rgba(var(--teal-rgb),.3)}
.grc-summary-text{font-size:13px;line-height:1.65;color:var(--text2);margin:0}
.grc-analysis-grid{display:grid;grid-template-columns:1fr;gap:10px}
.grc-bullet-card{border-radius:var(--r-xl);padding:14px 15px;display:flex;flex-direction:column;gap:9px;border:1px solid}
.grc-bullet-card.ok{background:rgba(52,199,89,.07);border-color:rgba(52,199,89,.22)}
.grc-bullet-card.warn{background:rgba(232,151,58,.07);border-color:rgba(232,151,58,.24)}
.grc-bullet-title{display:flex;align-items:center;gap:7px;font-size:11.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase}
.grc-bullet-card.ok .grc-bullet-title{color:var(--green)}
.grc-bullet-card.warn .grc-bullet-title{color:#B45309}
html.dark .grc-bullet-card.warn .grc-bullet-title{color:#F0A94B}
.grc-bullet-row{display:flex;align-items:flex-start;gap:9px;font-size:13px;line-height:1.55;color:var(--text2)}
.grc-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;margin-top:7px}
.grc-bullet-card.ok .grc-dot{background:var(--green)}
.grc-bullet-card.warn .grc-dot{background:#E8973A}

/* --- Задания: копии AssignmentCard (.asgn-*) с более премиальной отделкой --- */
.asgn-list{max-width:780px;margin:0 auto;display:flex;flex-direction:column;gap:16px}
.asgn-card{display:flex;align-items:center;gap:18px;padding:21px 24px;background:var(--surface);border:1px solid var(--border);border-radius:22px;position:relative;overflow:hidden;transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .22s,border-color .2s;cursor:default;box-shadow:var(--sh-xs)}
@media (hover:hover){.asgn-card:hover{transform:translateY(-2px);box-shadow:var(--sh-md);border-color:var(--border2)}}
.asgn-accent{position:absolute;left:0;top:0;bottom:0;width:3px}
.accent-blue{background:var(--text4)}
.accent-green{background:var(--green)}
.accent-red{background:var(--red)}
.accent-purple{background:var(--purple)}
.asgn-ico-wrap{width:48px;height:48px;border-radius:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ico-blue{background:var(--surface2);color:var(--text3);border:1px solid var(--border)}
.ico-green{background:rgba(74,222,128,.1);color:var(--green);border:1px solid rgba(74,222,128,.18)}
.ico-red{background:var(--red-l);color:var(--red);border:1px solid rgba(248,113,113,.18)}
.asgn-main{flex:1;min-width:0}
.asgn-title{font-size:15px;font-weight:700;color:var(--text1);margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.01em}
.asgn-meta{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.meta-due,.meta-score{display:flex;align-items:center;gap:5px;font-size:12.5px;color:var(--text4);font-weight:500}
.meta-due{color:var(--text3)}
.meta-due.overdue{color:var(--red);font-weight:600}
.meta-due.soon{color:var(--yellow);font-weight:600}
.meta-score{color:var(--text2);font-weight:600}
.asgn-arrow{color:var(--text4);flex-shrink:0;transition:transform .2s cubic-bezier(.32,.72,0,1),color .2s}
@media (hover:hover){.asgn-card:hover .asgn-arrow{transform:translateX(3px);color:var(--teal)}}

/* --- Final CTA: типографика вместо градиентной «ИИ-коробки» ---
   Секция full-bleed (без max-width), чтобы мягкий тил-фон уходил на всю
   ширину экрана; контент — в узкой центральной колонке. */
.cta-final{position:relative;width:100%;padding:150px 24px 160px;text-align:center;overflow:hidden}
.cf-orb-a{width:640px;height:640px;top:-160px;left:-140px;margin:0;background:rgba(var(--teal-rgb),.11)}
.cf-orb-b{width:560px;height:560px;bottom:-240px;right:-120px;background:rgba(var(--teal-rgb),.09)}
.cf-inner{position:relative;z-index:1;max-width:720px;margin:0 auto}
.cf-title{font-size:clamp(34px,5vw,58px);font-weight:800;line-height:1.07;letter-spacing:-.033em;color:var(--text1);margin-bottom:18px}
.grad-text{background:linear-gradient(120deg,var(--teal),var(--teal-h) 55%,var(--teal-d));-webkit-background-clip:text;background-clip:text;color:transparent;background-size:200% 200%;animation:shimmer-grad 6s ease-in-out infinite}
@keyframes shimmer-grad{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@media (prefers-reduced-motion: reduce){.grad-text{animation:none}}
.cf-sub{font-size:16.5px;color:var(--text3);line-height:1.65;margin-bottom:34px}
.cf-actions{display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap}
.cf-btn{height:54px;border-radius:16px;padding:0 30px;font-size:15.5px;box-shadow:0 8px 24px rgba(var(--teal-rgb),.28)}
.cf-btn:hover{box-shadow:0 10px 30px rgba(var(--teal-rgb),.38)}
.cf-arrow{transition:transform .22s cubic-bezier(.32,.72,0,1)}
.cf-btn:hover .cf-arrow{transform:translateX(4px)}

/* ====== FOOTER ======
   Бренд-колонка + три колонки ссылок + отдельная нижняя панель с копирайтом.
   Волосные разделители вместо заливок, приглушённый текст — футер не спорит
   с контентом за внимание. */
.lfooter{border-top:1px solid var(--border);background:var(--surface)}
.lf-inner{max-width:1160px;margin:0 auto;padding:52px 24px 44px;display:grid;grid-template-columns:1.25fr 2fr;gap:56px}
.lf-brandcol{display:flex;flex-direction:column;align-items:flex-start;gap:14px}
.lf-brand{display:flex;align-items:center;gap:9px;font-size:16px;font-weight:800;color:var(--text1);letter-spacing:-.02em}
.lf-tag{font-size:13px;line-height:1.55;color:var(--text4);max-width:250px}
.lf-lang{align-self:flex-start}
.lf-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.lf-col{display:flex;flex-direction:column;gap:11px}
.lf-h{font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--text4);margin-bottom:3px}
.lf-col a{font-size:13px;font-weight:500;color:var(--text3);transition:color .15s;width:fit-content}
@media (hover:hover){.lf-col a:hover{color:var(--teal)}}
.lf-bar{border-top:1px solid var(--border)}
.lf-bar-inner{max-width:1160px;margin:0 auto;padding:15px 24px calc(17px + env(safe-area-inset-bottom,0px));display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:11.5px;color:var(--text4)}

/* ====== АДАПТИВ ====== */
@media (max-width:1020px){
  .hero-grid{grid-template-columns:1fr;gap:48px}
  .hero{padding-top:calc(var(--topbar) + 40px)}
  .hero-copy{text-align:center}
  .hero-sub{margin-left:auto;margin-right:auto}
  .hero-ctas{justify-content:center}
  .split{grid-template-columns:1fr;gap:40px}
  .split.rev .split-visual{order:-1}
  .bento{grid-template-columns:1fr 1fr}
  .b-wide{grid-column:span 2}
}
@media (max-width:768px){
  .lnav-inner{padding:12px 16px;gap:12px}
  .section{padding:72px 16px;scroll-margin-top:64px}
  .hero{padding:calc(var(--topbar) + 32px) 16px 64px}
  .hero-title{font-size:clamp(30px,8.6vw,38px)}
  .hero-sub{font-size:16px;margin-bottom:26px}
  /* На узких экранах строки переносятся чаще — запас по высоте больше,
     чтобы карточка чата не меняла размер в течение цикла анимации */
  .chat-body{min-height:470px}
  /* Дешёвый blur: на мобиле пятна меньше и мягче — меньше площадь композитинга */
  .orb{filter:blur(70px)}
  .hero .orb-a{width:340px;height:340px;top:-130px;left:-130px}
  .hero .orb-b{width:280px;height:280px;bottom:-120px;right:-100px}
  .bento{grid-template-columns:1fr}
  .b-wide{grid-column:span 1}
  .steps{grid-template-columns:1fr}
  /* Экран лекции: панель уезжает под документ */
  .lec-body{grid-template-columns:1fr}
  .lec-page{border-right:none;border-bottom:1px solid var(--border)}
  .hm{transform:translate(-50%,-42px) scale(.82)}
  .asgn-card{gap:12px;padding:16px}
  .asgn-arrow{display:none}
  .cta-final{padding:88px 16px 96px}
  .cf-actions{flex-direction:column;gap:14px}
  .cf-btn{width:100%;max-width:360px}
  /* Футер: бренд-блок сверху, ссылки в две колонки */
  .lf-inner{grid-template-columns:1fr;gap:36px;padding:40px 20px 34px}
  .lf-cols{gap:24px}
  .lf-bar-inner{padding:14px 20px calc(16px + env(safe-area-inset-bottom,0px))}
  /* На тач-устройствах hover-lift не нужен — отклик через :active */
  .bcard:active,.asgn-card:active{transform:scale(.98)}
}

/* Очень узкие экраны: табы предмета и меню выделения */
@media (max-width:480px){
  .tab-btn{font-size:11px;padding:8px 4px;gap:4px}
  .tab-btn svg{width:12px;height:12px}
  .tab-num{display:none}
  /* Меню выделения центрируем и уменьшаем сильнее — иначе упирается в край */
  .hm{left:50%;transform:translate(-50%,-44px) scale(.72)}
}
</style>
