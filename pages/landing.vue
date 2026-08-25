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
            <div class="chat-card" :style="!reducedMotion && heroShift ? { transform: `translateY(${-heroShift * 0.06}px)` } : undefined">
              <div class="chat-head">
                <span class="chat-presence" aria-hidden="true"></span>
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
          <!-- 01 · Широкая карточка: копия слева, живой фрагмент чата справа -->
          <div class="bcard b-wide reveal">
            <div class="bcopy">
              <h3 class="btitle">{{ d('f.chat.title') }}</h3>
              <p class="btext">{{ d('f.chat.text') }}</p>
            </div>
            <div class="bvisual">
              <div class="mini-bubbles" aria-hidden="true">
                <span class="mb mb-own">{{ d('f.chat.q') }}</span>
                <span class="mb">{{ d('f.chat.a') }}</span>
              </div>
            </div>
          </div>

          <!-- 02 · Предметы: вертикальная стопка плиток -->
          <div class="bcard reveal reveal-delay-1 reveal-scale">
            <div class="bcopy">
              <h3 class="btitle">{{ d('f.subjects.title') }}</h3>
              <p class="btext">{{ d('f.subjects.text') }}</p>
            </div>
            <div class="bvisual">
              <div class="subj-tiles" aria-hidden="true">
                <div class="st"><span class="st-glyph">Φ</span><span class="st-name">{{ d('f.subjects.s1') }}</span></div>
                <div class="st on">
                  <span class="st-glyph">∑</span><span class="st-name">{{ d('f.subjects.s2') }}</span>
                  <svg class="st-spark" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M9 2c.4 3.2 1.8 4.6 5 5-3.2.4-4.6 1.8-5 5-.4-3.2-1.8-4.6-5-5 3.2-.4 4.6-1.8 5-5Z"/><path d="M17.5 12c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z"/></svg>
                </div>
                <div class="st"><span class="st-glyph">⌬</span><span class="st-name">{{ d('f.subjects.s3') }}</span></div>
              </div>
            </div>
          </div>

          <!-- 03 · Файлы: широкая горизонтальная композиция -->
          <div class="bcard b-files reveal">
            <div class="bcopy">
              <h3 class="btitle">{{ d('f.files.title') }}</h3>
              <p class="btext">{{ d('f.files.text') }}</p>
            </div>
            <div class="bvisual">
              <div class="mli-demo" aria-hidden="true">
                <div class="mli-row">
                  <div class="mli-icon" style="color:#E5484D;background:#E5484D22">PDF</div>
                  <div class="mli-info"><div class="mli-name">lecture_02.pdf</div><div class="mli-meta">PDF · 2.4 MB</div></div>
                  <svg class="mli-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
                <div class="mli-row">
                  <div class="mli-icon" style="color:#3B9FF2;background:#3B9FF222">DOC</div>
                  <div class="mli-info"><div class="mli-name">seminar_notes.docx</div><div class="mli-meta">DOCX · 480 KB</div></div>
                  <svg class="mli-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
                <div class="mli-row">
                  <div class="mli-icon" style="color:#F2A93B;background:#F2A93B22">PPT</div>
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

        <div class="split-visual reveal reveal-right">
          <!-- Реплика страницы предмета с сайта: обложка класса, сегмент-контрол
               табов в стиле iOS (Лекции / Задания / ИИ-чат со скользящим
               индикатором) и содержимое активного таба. -->
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
            <div class="asgn-group">
          <div class="asgn-row">
            <div class="asgn-ico">
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
            <div class="status-pill pending">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ d('dl.st_pending') }}
            </div>
            <svg class="asgn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </div>

          <div class="asgn-row">
            <div class="asgn-ico">
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
            <svg class="asgn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </div>

          <div class="asgn-row">
            <div class="asgn-ico">
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
            <svg class="asgn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </div>

          <div class="asgn-row">
            <div class="asgn-ico overdue">
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
            <svg class="asgn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
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
      title_1: { ru: 'Ваша учёба.', en: 'Your studies.', kk: 'Оқуыңыз.' }[l],
      title_2: { ru: 'Теперь эффективнее.', en: 'Now more effective.', kk: 'Енді тиімдірек.' }[l],
      sub: {
        ru: 'Лекции, ИИ для каждого предмета и все дедлайны — в одном приложении.',
        en: 'Lectures, an AI for every subject and every deadline — in one app.',
        kk: 'Дәрістер, әр пәнге арналған ЖИ және барлық мерзімдер — бір қосымшада.',
      }[l],
    },
    hero: {
      title_1: { ru: 'ИИ, который знает', en: 'An AI that knows', kk: 'Әр дәрісті білетін' }[l],
      title_2: { ru: 'каждую вашу лекцию', en: 'your every lecture', kk: 'жасанды интеллект' }[l],
      sub: {
        ru: 'Chatra отвечает на вопросы по вашим лекциям, проверяет работы и следит за дедлайнами. Всё — в одном месте.',
        en: 'Chatra answers from your lectures, grades your work and keeps track of deadlines. All in one place.',
        kk: 'Chatra дәрістеріңіз бойынша жауап береді, жұмыстарды тексереді және мерзімдерді қадағалайды. Барлығы бір жерде.',
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
      title: { ru: 'Всё, что нужно для учёбы — в одном месте', en: 'Everything you need to study — in one place', kk: 'Оқуға қажеттінің бәрі — бір жерде' }[l],
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
          ru: 'Задавайте вопросы — от разбора темы до подготовки к экзамену. Важные диалоги сохраняются и всегда под рукой.',
          en: 'Ask anything — from topic breakdowns to exam prep. Important conversations are saved and always at hand.',
          kk: 'Кез келген сұрақ қойыңыз — тақырыптан емтиханға дейін. Маңызды диалогтер сақталып, әрқашан қол астында.',
        }[l],
        q: { ru: 'Как взять интеграл по частям?', en: 'How does integration by parts work?', kk: 'Бөліктер бойынша интегралдау қалай?' }[l],
        a: { ru: 'Разберём формулу на примере…', en: 'Let’s walk through the formula with an example…', kk: 'Формуланы мысалмен талдайық…' }[l],
      },
      subjects: {
        title: { ru: 'Свой ИИ для каждого предмета', en: 'A dedicated AI for every subject', kk: 'Әр пәнге арналған жеке ЖИ' }[l],
        text: {
          ru: 'У каждого предмета — собственный ассистент, обученный на его лекциях. Ответы опираются на ваши материалы, а не на общий интернет.',
          en: 'Every subject gets its own assistant trained on its lectures. Answers are grounded in your materials, not the open web.',
          kk: 'Әр пәннің өз көмекшісі бар, ол сол пәннің дәрістерінен оқытылған. Жауаптар сіздің материалдарыңызға негізделеді.',
        }[l],
        s1: { ru: 'Физика', en: 'Physics', kk: 'Физика' }[l],
        s2: { ru: 'Математика', en: 'Math', kk: 'Математика' }[l],
        s3: { ru: 'Биология', en: 'Biology', kk: 'Биология' }[l],
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
          ru: 'Все задания и сроки — в одном календаре. Сразу видно, что сдано, что на проверке и что требует внимания.',
          en: 'All assignments and due dates in one calendar. See at a glance what’s done, in review, or overdue.',
          kk: 'Барлық тапсырма мен мерзім бір күнтізбеде. Не тапсырылғаны, не тексерілуде, не кешіктірілгені бірден көрінеді.',
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
        ru: 'Выберите предмет — с ним будет работать собственный ассистент, отвечающий со ссылками на конкретные лекции и файлы.',
        en: 'Pick a subject and its dedicated assistant answers with references to specific lectures and files.',
        kk: 'Пәнді таңдаңыз — оның жеке көмекшісі нақты дәрістер мен файлдарға сілтеме жасап жауап береді.',
      }[l],
      points: [
        { ru: 'Знает контекст каждой лекции — темы, термины и формулы', en: 'Knows the context of every lecture — topics, terms and formulas', kk: 'Әр дәрістің контекстін біледі — тақырыптан формулаларға дейін' }[l],
        { ru: 'Каждый ответ — со ссылкой на источник: лекцию или файл', en: 'Every answer cites its source — a lecture or a file', kk: 'Әр жауап дереккөзді көрсетеді — дәріс немесе файл' }[l],
        { ru: 'Понимает графики и обозначения именно вашего курса', en: 'Understands your course’s graphs and notation', kk: 'Сіздің курсіңіздің графиктері мен белгіленімін түсінеді' }[l],
        { ru: 'Хранит историю ваших диалогов по каждому предмету', en: 'Keeps your per-subject conversation history', kk: 'Пән бойынша диалог тарихын сақтайды' }[l],
      ] as string[],
    },
    hl: {
      kicker: { ru: 'МАТЕРИАЛЫ И ВЫДЕЛЕНИЯ', en: 'MATERIALS & HIGHLIGHTS', kk: 'МАТЕРИАЛДАР МЕН БЕЛГІЛЕУЛЕР' }[l],
      title: { ru: 'Выделяйте главное — и сразу спрашивайте ИИ', en: 'Highlight what matters — ask the AI right away', kk: 'Бастысын белгілеңіз — ЖИ-ден бірден сұраңыз' }[l],
      text: {
        ru: 'Откройте лекцию, выделите фрагмент и задайте вопрос по нему. Каждый отрывок сохраняется в панель «Мои выделения» — вместе с заметкой и номером страницы.',
        en: 'Open a lecture, highlight a passage and ask about it. Every highlight is saved to “My highlights” — with its note and page number.',
        kk: 'Дәрісті ашыңыз, үзіндіні белгілеңіз және одан сұраңыз. Әр үзінді «Менің белгілеулерім» панелінде жазбасымен және бет нөмірімен сақталады.',
      }[l],
      points: [
        { ru: 'Четыре цвета выделения: жёлтый, зелёный, синий, красный', en: 'Four highlight colors: yellow, green, blue, red', kk: 'Төрт түс: сары, жасыл, көк, қызыл' }[l],
        { ru: '«Спросить AI» — прямо из меню выделения', en: '“Ask AI” — straight from the selection menu', kk: '«AI-дан сұрау» — белгілеу мәзірінен бірден' }[l],
        { ru: 'Заметки к каждому выделению и переход на страницу', en: 'Notes on every highlight, with jump-to-page', kk: 'Әр белгілеуге жазба және бетке өту' }[l],
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
        ru: 'Сдайте работу — AI Grader оценит её по критериям преподавателя и подробно объяснит, что получилось и что улучшить.',
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
      title: { ru: 'Ваш ИИ — за пределами предметов', en: 'Your AI, beyond every subject', kk: 'ЖИіңіз — пәндерден тыс' }[l],
      sub: {
        ru: 'Отдельный ассистент для всего остального: подготовка к экзаменам, разбор сложных тем, черновики и идеи. Все диалоги сохраняются и всегда под рукой.',
        en: 'A separate assistant for everything else: exam prep, hard topics, drafts and ideas. Every conversation is saved and always at hand.',
        kk: 'Қалғанының бәріне арналған жеке көмекші: емтиханға дайындық, күрделі тақырыптар, жобалар мен идеялар. Әр диалог сақталады.',
      }[l],
      points: [
        { ru: 'История всех диалогов — с поиском и закреплением', en: 'Full chat history — with search and pins', kk: 'Диалогтер тарихы — іздеу мен бекітумен' }[l],
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
        ru: 'Студенты учатся и сдают работы. Преподаватели создают задания с критериями и принимают решения об оценках. AI ускоряет рутину — финальное слово всегда за человеком.',
        en: 'Students study and submit work. Teachers create assignments with criteria and decide on grades. AI speeds up the routine — humans make the final call.',
        kk: 'Студенттер оқып, жұмыс тапсырады. Мұғалімдер критерийлері бар тапсырмалар жасап, бағаны шешеді. ЖИ рутинді жылдамдатады — соңғы сөз әрқашан адамда.',
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
      bridge: { ru: 'AI предлагает — преподаватель решает', en: 'AI suggests — the teacher decides', kk: 'ЖИ ұсынады — мұғалім шешеді' }[l],
    },
    cal: {
      month: { ru: 'Октябрь', en: 'October', kk: 'Қазан' }[l],
      week: { ru: ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'], en: ['MO','TU','WE','TH','FR','SA','SU'], kk: ['ДҰ','СЙ','СӘ','БЕ','ЖҮ','СБ','ЖЕ'] }[l] as string[],
      n1: { ru: 'Новое задание: эссе «Этика ИИ»', en: 'New assignment: “Ethics of AI” essay', kk: 'Жаңа тапсырма: «ЖИ этикасы» эссе' }[l],
      n2: { ru: '«Лабораторная №3» — дедлайн через 2 дня', en: '“Lab report №3” — due in 2 days', kk: '«№3 зертханалық жұмыс» — мерзім 2 күннен кейін' }[l],
      n3: { ru: 'Работа «Задачи по рядам» оценена на 87/100', en: '“Series problem set” was graded 87/100', kk: '«Қатарлар есептері» — 87/100 болып бағаланды' }[l],
    },
    dl: {
      kicker: { ru: 'ЗАДАНИЯ И ДЕДЛАЙНЫ', en: 'ASSIGNMENTS & DEADLINES', kk: 'ТАПСЫРМАЛАР МЕН МЕРЗІМДЕР' }[l],
      title: { ru: 'Дедлайны больше не застают врасплох', en: 'Deadlines never sneak up on you', kk: 'Мерзімдер кенеттен таңқалдырмайды' }[l],
      sub: {
        ru: 'У каждого задания — срок, баллы и статус. Сразу видно, что сдано, что на проверке и что просрочено.',
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

/* --- Навигационная шапка: hairline-граница появляется только при скролле --- */
const scrolled = ref(false)
const heroShift = ref(0)
let scrollRaf = 0
const onScroll = (e: Event) => {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    const top = (e.target as HTMLElement).scrollTop
    scrolled.value = top > 8
    if (!reducedMotion) heroShift.value = Math.max(0, Math.min(top, 900))
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
.landing{height:100vh;height:100dvh;overflow-y:auto;overflow-x:hidden;background:var(--bg);scroll-behavior:smooth;-webkit-overflow-scrolling:touch}
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
.orb-a{width:620px;height:620px;top:-220px;left:-160px;background:rgba(var(--teal-rgb),.07);animation:orb-drift 16s ease-in-out infinite alternate}
.orb-b{width:480px;height:480px;bottom:-200px;right:-120px;background:rgba(var(--teal-rgb),.05);animation:orb-drift 19s ease-in-out infinite alternate-reverse}
@keyframes orb-drift{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(40px,26px,0) scale(1.06)}}
@media (prefers-reduced-motion: reduce){.orb{animation:none}}

.hero-title{font-size:clamp(38px,5vw,64px);font-weight:700;line-height:1.05;letter-spacing:-.035em;color:var(--text1);margin-bottom:24px}
.grad-text{background:linear-gradient(115deg,var(--text1) 15%,#6e6e73 85%);-webkit-background-clip:text;background-clip:text;color:transparent}
html.dark .grad-text{background-image:linear-gradient(115deg,#f5f5f7 15%,#86868b 90%)}
.hero-sub{font-size:18.5px;color:var(--text3);line-height:1.58;letter-spacing:-.012em;max-width:470px;margin-bottom:36px}
.hero-ctas{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.hero-cta{height:52px;border-radius:980px;padding:0 28px;font-size:16px;font-weight:500;letter-spacing:-.01em;box-shadow:0 4px 16px rgba(var(--teal-rgb),.22);transition:transform .25s cubic-bezier(.32,.72,0,1),box-shadow .25s cubic-bezier(.32,.72,0,1),background .2s}
.hero-cta:hover{box-shadow:0 8px 24px rgba(var(--teal-rgb),.28)}
.hero-cta:active{transform:scale(.97)}

.chat-card{will-change:transform;width:100%;max-width:450px;background:var(--surface);border:1px solid var(--border);border-radius:30px;box-shadow:0 2px 6px rgba(0,0,0,.03),0 44px 88px -22px rgba(0,0,0,.16);overflow:hidden}
html.dark .chat-card{box-shadow:0 2px 6px rgba(0,0,0,.3),0 44px 88px -22px rgba(0,0,0,.65)}
.chat-head{display:flex;align-items:center;gap:9px;padding:15px 20px;border-bottom:1px solid var(--border);background:var(--glass)}
.chat-presence{width:8px;height:8px;border-radius:50%;background:var(--green);flex-shrink:0;box-shadow:0 0 0 3px rgba(22,163,74,.14)}
html.dark .chat-presence{box-shadow:0 0 0 3px rgba(74,222,128,.14)}
.chat-title{font-size:13.5px;font-weight:650;color:var(--text1);letter-spacing:-.01em;line-height:1.25}
.chat-body{display:flex;flex-direction:column;gap:15px;padding:20px 18px;height:420px;justify-content:flex-end}
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
.kicker{font-size:13px;font-weight:600;letter-spacing:.02em;color:var(--teal);margin-bottom:14px}

/* --- Bento --- */
.bento{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.bcard{position:relative;display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:28px;padding:34px 32px;transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s cubic-bezier(.22,1,.36,1),border-color .25s}
@media (hover:hover){
  .bcard:hover{transform:translateY(-4px);box-shadow:0 24px 48px -16px rgba(0,0,0,.1);border-color:var(--border2)}
  html.dark .bcard:hover{box-shadow:0 24px 48px -16px rgba(0,0,0,.55)}
}
.bcard:active{transform:scale(.985)}
.b-wide{grid-column:span 2;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.08fr);gap:36px;align-items:center;padding:44px 40px}
.bcopy{min-width:0}
.btitle{font-size:21px;font-weight:700;color:var(--text1);letter-spacing:-.022em;margin-bottom:10px;line-height:1.25}
.btext{font-size:15px;color:var(--text3);line-height:1.6;letter-spacing:-.008em}
.bvisual{margin-top:26px;flex:1;display:flex;flex-direction:column;justify-content:flex-end}
.b-wide .bvisual{margin-top:0}

.mini-bubbles{display:flex;flex-direction:column;gap:10px;background:var(--bg);border:1px solid var(--border);border-radius:22px;padding:20px}
.mb{max-width:85%;width:fit-content;padding:12px 16px;border-radius:18px;border-bottom-left-radius:6px;font-size:13.5px;line-height:1.5;color:var(--text1);background:var(--surface);border:1px solid var(--border);box-shadow:var(--sh-xs)}
.mb-own{align-self:flex-end;background:linear-gradient(135deg,var(--teal),var(--teal-h));color:#fff;border:none;border-radius:18px;border-bottom-right-radius:6px;box-shadow:0 4px 14px rgba(var(--teal-rgb),.25)}

.subj-tiles{display:flex;flex-direction:column;gap:9px}
.st{display:flex;align-items:center;gap:12px;padding:10px 13px;border-radius:16px;background:var(--bg);border:1px solid var(--border)}
.st-glyph{width:32px;height:32px;border-radius:10px;background:var(--surface);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:var(--text2);flex-shrink:0}
.st-name{font-size:13.5px;font-weight:600;color:var(--text2);letter-spacing:-.01em}
.st-spark{margin-left:auto;color:var(--teal);flex-shrink:0}
.st.on{background:var(--surface);border-color:var(--border2);box-shadow:var(--sh-xs)}
.st.on .st-glyph{background:var(--text1);color:#fff;border-color:transparent}
.st.on .st-name{color:var(--text1)}

.mli-demo{display:flex;flex-direction:column;background:var(--bg);border:1px solid var(--border);border-radius:22px;overflow:hidden}
.mli-row{display:flex;align-items:center;gap:12px;width:100%;padding:12px 15px;border-bottom:1px solid var(--border);text-align:left}
.mli-row:last-child{border-bottom:none}
.mli-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;letter-spacing:.02em;flex-shrink:0}
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

/* --- Bento: полноширинная карточка файлов --- */
.b-files{grid-column:span 3;display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.5fr);gap:40px;align-items:center;padding:44px 40px}
.b-files .bvisual{margin-top:0}

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
.ai-input-dark{border-top-color:rgba(255,255,255,.07);background:#232326}
.ai-input-dark .ai-textarea{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.08);color:#98989f}

.math{display:inline-flex;align-items:center;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:13.5px;color:#f5f5f7;background:rgba(var(--teal-rgb),.1);border:1px solid rgba(var(--teal-rgb),.22);border-radius:8px;padding:5px 9px;margin:4px 2px;line-height:1;vertical-align:middle}
.math.plain,.math.roots{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);font-style:normal}
.mfrac{display:inline-flex;flex-direction:column;align-items:center;font-size:11px;line-height:1.15;margin-left:4px}
.mfrac .mn{padding:0 4px 2px;border-bottom:1px solid #98989f}
.mfrac .md{padding-top:2px}

/* --- AI Grader: бар файла, критерии, подтверждение преподавателя --- */
.grc-card{max-width:480px}
.gw-bar{display:flex;align-items:center;gap:6px;padding:12px 16px;border-bottom:1px solid var(--border);background:var(--glass)}
.gw-bar span{width:9px;height:9px;border-radius:50%;background:var(--surface3);flex-shrink:0}
.gw-file{margin-left:8px;width:auto;height:auto;background:none;border-radius:0;font-size:12px;font-weight:550;color:var(--text3)}
.grc-criteria{padding:16px 24px 18px;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:11px}
.gc-head{font-size:11.5px;font-weight:650;letter-spacing:.05em;text-transform:uppercase;color:var(--text4)}
.gc-row{display:flex;align-items:center;gap:12px}
.gc-name{width:38%;font-size:12.5px;font-weight:550;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gc-bar{flex:1;height:5px;border-radius:100px;background:var(--bg);border:1px solid var(--border);overflow:hidden}
.gc-fill{display:block;height:100%;border-radius:100px;background:linear-gradient(90deg,var(--teal-d),var(--teal));transition:width 1s cubic-bezier(.22,1,.36,1) .35s}
@media (prefers-reduced-motion: reduce){.gc-fill{transition:none}}
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
.tabs-indicator{position:absolute;top:3px;bottom:3px;left:3px;width:calc((100% - 6px) / 3);background:var(--surface);border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,.1);transition:transform .32s cubic-bezier(.32,.72,0,1)}
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
.mw-bar span{width:9px;height:9px;border-radius:50%;background:var(--surface3);flex-shrink:0}
.mw-file{display:flex;align-items:center;gap:7px;margin-left:10px;font-size:12px;font-weight:550;color:var(--text3)}
.ftb{display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:800;letter-spacing:.04em;padding:2px 6px;border-radius:4px;line-height:1.4;min-width:28px}
.mw-chat{flex:1;padding:16px;display:flex;align-items:center}

.cai-msgs{display:flex;flex-direction:column;gap:12px;width:100%}
.msg-row{display:flex;flex-direction:column;gap:6px;max-width:85%}
.msg-row.user{align-self:flex-end;align-items:flex-end}
.msg-row.assistant{align-self:flex-start}
.msg-sender{font-size:11.5px;font-weight:650;color:var(--text3)}
.msg-bubble{padding:11px 15px;border-radius:18px;font-size:12.5px;line-height:1.6;word-break:break-word;animation:msg-in .55s cubic-bezier(.16,1,.3,1) both}
.msg-row.assistant .msg-bubble{background:var(--bg);border:1px solid var(--border);color:var(--text1);border-bottom-left-radius:6px;transform-origin:0% 100%}
.msg-row.user .msg-bubble{background:linear-gradient(135deg,var(--teal),var(--teal-h));color:#fff;border-bottom-right-radius:6px;box-shadow:0 4px 14px rgba(var(--teal-rgb),.22);transform-origin:100% 100%}
@keyframes msg-in{from{opacity:0;transform:translateY(12px) scale(.92)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){.msg-bubble{animation:none}}
.mw-input{display:flex;align-items:center;gap:8px;padding:10px 12px;border-top:1px solid var(--border);background:var(--surface)}
.ai-textarea.sm{padding:9px 14px;font-size:12.5px}
.send-btn.sm{width:36px;height:36px}

.fade-enter-active,.fade-leave-active{transition:opacity .18s ease}
.fade-enter-from,.fade-leave-to{opacity:0}

.split-lec{grid-template-columns:1.15fr 1fr;gap:48px}
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

/* --- Deadlines: единая сгруппированная поверхность в стиле iOS --- */
.asgn-group{max-width:780px;margin:0 auto;background:var(--surface);border:1px solid var(--border);border-radius:28px;box-shadow:0 2px 6px rgba(0,0,0,.03),0 32px 64px -24px rgba(0,0,0,.12);overflow:hidden}
html.dark .asgn-group{box-shadow:0 2px 6px rgba(0,0,0,.3),0 32px 64px -24px rgba(0,0,0,.6)}
.asgn-row{position:relative;display:flex;align-items:center;gap:18px;padding:20px 26px;transition:background .15s ease,transform .1s ease-out}
@media (hover:hover){.asgn-row:hover{background:var(--glass)}}
.asgn-row:active{transform:scale(.99)}
.asgn-row:not(:last-child)::after{content:'';position:absolute;left:90px;right:26px;bottom:0;height:1px;background:var(--border)}
.asgn-ico{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:var(--bg);color:var(--text3);border:1px solid var(--border)}
.asgn-ico.overdue{background:var(--red-l);color:var(--red);border-color:rgba(248,113,113,.18)}
.asgn-main{flex:1;min-width:0}
.asgn-title{font-size:15.5px;font-weight:600;color:var(--text1);margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.012em}
.asgn-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.meta-sep{width:3px;height:3px;border-radius:50%;background:var(--surface3);flex-shrink:0}
.meta-due,.meta-score{display:flex;align-items:center;gap:5px;font-size:12.5px;color:var(--text4);font-weight:500}
.meta-due{color:var(--text3)}
.meta-due.overdue{color:var(--red);font-weight:600}
.meta-due.soon{color:var(--yellow);font-weight:600}
.meta-score{color:var(--text2);font-weight:550}
.asgn-arrow{color:var(--text4);flex-shrink:0}

/* --- Final CTA --- */
.cta-final{position:relative;width:100%;padding:180px 24px 190px;text-align:center;overflow:hidden;background:#1D1D1F}
.cf-orb-a{width:640px;height:640px;top:-200px;left:-160px;margin:0;background:rgba(var(--teal-rgb),.08)}
.cf-orb-b{width:560px;height:560px;bottom:-260px;right:-140px;background:rgba(var(--teal-rgb),.05)}
.cf-inner{position:relative;z-index:1;max-width:720px;margin:0 auto}
.cf-title{font-size:clamp(35px,5vw,60px);font-weight:700;line-height:1.06;letter-spacing:-.035em;color:#f5f5f7;margin-bottom:20px}
.cta-final .grad-text{background-image:linear-gradient(115deg,#f5f5f7 15%,#86868b 90%)}
.cf-sub{font-size:17.5px;color:#a1a1a6;line-height:1.6;letter-spacing:-.01em;margin-bottom:38px}
.cf-actions{display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap}
.cf-btn{height:54px;border-radius:980px;padding:0 32px;font-size:16px;font-weight:500;letter-spacing:-.01em;box-shadow:0 4px 16px rgba(var(--teal-rgb),.22);transition:transform .25s cubic-bezier(.32,.72,0,1),box-shadow .25s cubic-bezier(.32,.72,0,1),background .2s}
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
  .b-wide{grid-column:span 2}
  .b-files{grid-column:span 2;grid-template-columns:1fr;padding:30px 26px;gap:26px}
  .section{padding:104px 24px}
}
@media (max-width:768px){
  .lnav-inner{padding:12px 16px;gap:12px}
  .l-logo{width:34px}
  .section{padding:76px 16px;scroll-margin-top:64px}
  .sec-head{margin-bottom:48px}
  .hero{padding:calc(var(--topbar) + 40px) 16px 72px}
  .hero-title{font-size:clamp(30px,8.6vw,38px)}
  .hero-sub{font-size:16px;margin-bottom:28px}
  .chat-body{height:520px}
  .orb{filter:blur(70px)}
  .hero .orb-a{width:340px;height:340px;top:-130px;left:-130px}
  .hero .orb-b{width:280px;height:280px;bottom:-120px;right:-100px}
  .bento{grid-template-columns:1fr;gap:18px}
  .b-wide,.b-files{grid-column:span 1}
  .b-wide{grid-template-columns:1fr;padding:30px 26px;gap:26px}
  .b-files{padding:30px 26px;gap:26px}
  .bcard{padding:28px 24px}
  .ai-side{display:none}
  .ai-win{max-width:none}
  .roles-stage{grid-template-columns:1fr;gap:18px;padding-bottom:0}
  .rp-tea{margin:0}
  .roles-bridge-pos{display:none}
  .cal-grid-wrap{grid-template-columns:1fr;gap:36px}
  .grc-criteria{padding:14px 20px 16px}
  .gc-name{width:42%}
  .lec-body{grid-template-columns:1fr}
  .lec-page{border-right:none;border-bottom:1px solid var(--border)}
  .hm{transform:translate(-50%,-42px) scale(.82)}
  .asgn-row{gap:12px;padding:16px 18px}
  .asgn-row:not(:last-child)::after{left:74px;right:18px}
  .asgn-arrow{display:none}
  .grc-analysis{grid-template-columns:1fr}
  .grc-col + .grc-col{border-left:none;border-top:1px solid var(--border)}
  .grc-summary{padding:16px 20px}
  .grc-hero-inner{padding:24px 18px 22px}
  .cta-final{padding:100px 16px 110px}
  .cf-actions{flex-direction:column;gap:14px}
  .cf-btn{width:100%;max-width:360px}
  .lf-inner{grid-template-columns:1fr;gap:36px;padding:40px 20px 34px}
  .lf-cols{gap:24px}
  .lf-bar-inner{padding:14px 20px calc(16px + env(safe-area-inset-bottom,0px))}
}
@media (max-width:480px){
  .tab-btn{font-size:11px;padding:8px 4px;gap:4px}
  .tab-btn svg{width:12px;height:12px}
  .tab-num{display:none}
  .hm{left:50%;transform:translate(-50%,-44px) scale(.72)}
}
</style>
