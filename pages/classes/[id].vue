<template>
  <div class="cd-page">

    <!-- Loading -->
    <div v-if="loading" class="full-load">
      <div class="spin-ring"></div>
    </div>

    <template v-else>
      <!-- ══ Main layout — обложка сразу сверху, без отдельной полосы
           "Предметы › Название" над ней (та же навигация уже есть внутри
           самой обложки, см. .page-header-top) ══ -->
      <div class="cd-layout">
        <!-- Left content -->
        <div class="cd-main">
          <!-- Page header with cover image — collapses smoothly on scroll to free up room -->
          <div class="page-header" :class="{ 'header-collapsed': coverCollapsed }" :style="heroStyle">
            <div class="page-header-overlay" v-if="classMeta.cover_image"></div>
            <div class="page-header-top">
              <NuxtLink to="/" class="back-link" :class="{'back-link-dark': classMeta.cover_image}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                {{ t('nav.classes') }}
              </NuxtLink>
              <span class="header-sep" :class="{'sep-dark': classMeta.cover_image}">›</span>
              <span class="header-subject" :class="{'subject-dark': classMeta.cover_image}">{{ (classMeta.subject || '').toUpperCase() }}</span>
            </div>

            <!-- Single settings entry point — houses class code, regenerate code,
                 academic-year picker and rotation settings, so the cover never gets
                 crowded with buttons. -->
            <button v-if="isOwnerOrAdmin" class="class-settings-btn page-header-gear" @click="showClassInfo = true" :title="t('cohort.settings')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            </button>

            <!-- Notice when teacher is viewing a past (archived) cohort -->
            <div v-if="viewingArchiveCohort" class="cohort-view-notice">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              {{ t('cohort.viewing_archive') }}
            </div>

            <!-- Class name only — bottom of the cover on both mobile and desktop -->
            <div class="page-header-body">
              <div class="page-title-row">
                <h1 class="page-title" :class="{'title-dark': classMeta.cover_image}">{{ classTitle }}</h1>
                <span v-if="isArchivedForUser" class="header-archive-badge">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                  {{ t('cohort.archived_badge') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tabs — сегмент-контрол в стиле iOS (как в приложении): плавающая
               подложка активного таба скользит внутри общей "полочки", а не
               подчёркивание слева. -->
          <div class="tabs-wrap">
            <div class="tabs-bar" :style="{ '--tab-count': tabCount, '--tab-index': tabIndex }">
              <div class="tabs-indicator"></div>
              <button :class="['tab-btn', { active: tab === 'lectures' }]" @click="tab = 'lectures'">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                {{ t('class.lectures') }}
                <span v-if="lectures.length" class="tab-num">{{ lectures.length }}</span>
              </button>
              <button :class="['tab-btn', { active: tab === 'assignments' }]" @click="tab = 'assignments'; loadAssignments()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                {{ t('class.assignments') }}
                <span v-if="assignments.length" class="tab-num">{{ assignments.length }}</span>
              </button>
              <!-- Единый порядок с приложением: …Задания, ИИ. -->
              <button v-if="!isArchivedForUser" :class="['tab-btn tab-ai', { active: tab === 'ai' }]" @click="tab = 'ai'; loadAssignments()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                {{ t('class.ai_chat') }}
              </button>
            </div>
          </div>

          <!-- Teacher create actions — below the nav row, shown only on the tabs
               they apply to (never on AI chat). Единый нейтральный стиль для
               обеих плиток — как в приложении (равный вес действий, без
               выделения одной из них цветом). -->
          <div class="tab-action-bar" v-if="canManage && ['lectures','assignments'].includes(tab)">
            <button class="quick-action-btn" @click="showCreateAssignment = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              {{ t('class.assignment_btn') }}
            </button>
            <button class="quick-action-btn" @click="showCreate = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
              {{ t('class.lecture_btn') }}
            </button>
          </div>

          <!-- Read-only notice for archived students -->
          <div v-if="isArchivedForUser" class="archive-notice">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            {{ t('cohort.readonly_notice') }}
          </div>

          <!-- Рейтинг и дедлайн для студентов — только мобайл; раньше показывались
               только во вкладке "Задания", из-за чего на "Лекциях" рейтинг как
               будто пропадал — теперь виден на любой вкладке, кроме ИИ-чата
               (там нужна вся ширина под сообщения). -->
          <div v-if="!isTeacher && tab !== 'ai'" class="mobile-stats">
            <div class="ms-score">
              <div class="ms-score-top">
                <span class="ms-label">{{ t('class.your_rating') }}</span>
                <span class="ms-num">{{ avgScoreDisplay }}<span class="ms-denom">/100</span></span>
              </div>
              <div v-if="ratingData.graded_count > 0">
                <div class="ms-bar-row">
                  <span class="ms-bar-label">{{ t('class.performance') }}</span>
                  <span class="ms-bar-val">{{ performancePercent }}%</span>
                </div>
                <div class="ms-bar"><div class="ms-bar-fill" :style="{width: performancePercent+'%'}"></div></div>
              </div>
              <div v-else class="ms-empty">{{ lang === 'ru' ? 'Нет оценённых заданий' : lang === 'kk' ? 'Тапсырмалар жоқ' : 'No graded assignments' }}</div>
            </div>
            <div v-if="nextDeadline" class="ms-deadline">
              <span class="ms-label">{{ t('class.next_deadline') }}</span>
              <div class="ms-deadline-row">
                <div class="ms-date-box">
                  <div class="ms-month">{{ fmtMonth(nextDeadline.deadline) }}</div>
                  <div class="ms-day">{{ fmtDay(nextDeadline.deadline) }}</div>
                </div>
                <div class="ms-deadline-info">
                  <div class="ms-deadline-title">{{ nextDeadline.title }}</div>
                  <div class="ms-deadline-rem">{{ fmtRemaining(nextDeadline.deadline) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab content -->
          <div class="tab-content" :class="{ 'ai-mode': tab === 'ai' }">

            <!-- LECTURES -->
            <template v-if="tab === 'lectures'">
              <div v-if="!lectures.length" class="empty-state-card">
                <div class="es-icon-wrap"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg></div>
                <div class="es-h">{{ t('class.no_lectures') }}</div>
                <div class="es-p">{{ isTeacher ? t('class.no_lectures_teacher') : t('class.no_lectures_student') }}</div>
              </div>
              <div v-else class="items-list">
                <div v-for="p in lectures" :key="p.id" class="item-row" @click="router.push(`/classes/${classId}/lecture/${p.id}`)">
                  <div class="item-body">
                    <div class="item-title">{{ cleanTitle(p.title) }}</div>
                    <div class="item-desc">{{ getPreview(p) }}</div>
                    <div class="item-meta">
                      <span class="meta-date">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {{ fmtDate(p.created_at) }}
                      </span>
                    </div>
                  </div>
                  <div class="item-actions">
                    <button v-if="canManage" class="item-menu-btn" @click.stop="toggleItemMenu($event, 'lecture-'+p.id)" :title="lang==='ru'?'Ещё':'More'">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <!-- ASSIGNMENTS -->
            <template v-if="tab === 'assignments'">
              <div v-if="loadingAssignments" class="tab-load"><div class="spin-ring"></div></div>
              <template v-else>
                <div v-if="!assignments.length" class="empty-state-card">
                  <div class="es-icon-wrap"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1" ry="1"/><path d="M9 12h6M9 16h4"/></svg></div>
                  <div class="es-h">{{ t('class.no_assignments') }}</div>
                  <div class="es-p">{{ isTeacher ? t('class.no_assignments_teacher') : t('class.no_assignments_student') }}</div>
                </div>
                <div v-else class="items-list">
                  <div v-for="a in assignments" :key="a.id" class="item-row assignment-item" @click="goAssignment(a)">
                    <div class="item-body">
                      <div class="item-row-top">
                        <div class="item-title">{{ a.title }}</div>
                        <div v-if="isGraded(a)" :class="['status-badge', getStatusClass(a)]">{{ getStatusLabel(a) }}</div>
                      </div>
                      <div class="item-desc">{{ stripFilesFromText(a.description) }}</div>
                      <div class="item-meta">
                        <span class="meta-date">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {{ fmtDate(a.deadline) }}
                        </span>
                      </div>
                    </div>
                    <div class="item-actions">
                      <button v-if="canManage" class="item-menu-btn" @click.stop="toggleItemMenu($event, 'assignment-'+a.id)" :title="lang==='ru'?'Ещё':'More'">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                      </button>
                      <button v-if="!isTeacher && isLate(a)" class="btn-late" @click.stop="goAssignment(a)">{{ t('class.submit_late') }}</button>
                      <span v-else-if="!isTeacher && isInProgress(a)" class="btn-continue-link" @click.stop="goAssignment(a)">{{ t('class.continue') }}</span>
                      <span v-else-if="!isTeacher" class="item-preview-link" @click.stop="goAssignment(a)">{{ t('class.preview') }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </template>

            <template v-if="tab === 'ai'">
              <LazyClassAiChat :class-name="classTitle" :class-posts="classPosts" :is-teacher="isTeacher" :class-id="classId" :assignments="assignments" @scroll-state="v => coverCollapsed = v" />
            </template>

          </div>
        </div>

        <!-- Right sidebar — остаётся смонтированным даже на вкладке ИИ и просто
             плавно схлопывается вместе с обложкой (:class ниже, тот же
             coverCollapsed, что двигает .page-header) при скролле чата, вместо
             того чтобы резко исчезать по v-if при переключении вкладки. -->
        <div class="cd-sidebar" :class="{ 'cd-sidebar-collapsed': coverCollapsed }">
          <!-- Score card — виден студенту на любой вкладке (раньше только на
               «Заданиях», из-за чего на «Лекциях» рейтинг был не виден). -->
          <div class="sidebar-card score-card" v-if="!isTeacher">
            <div class="score-label">{{ t('class.your_rating') }}</div>
            <div class="score-num">
              <span class="score-big">{{ avgScoreDisplay }}</span>
              <span class="score-total">/ 100 <span class="score-pts">{{ t('class.pts') }}</span></span>
            </div>
            <div v-if="ratingData.graded_count === 0" class="score-no-grades">
              {{ lang === 'ru' ? 'Нет оценённых заданий' : lang === 'kk' ? 'Бағаланған тапсырмалар жоқ' : 'No graded assignments yet' }}
            </div>
            <template v-else>
              <div class="score-progress-row">
                <div class="sp-label">{{ t('class.progress') }}</div>
                <div class="sp-value">{{ progressPercent }}%</div>
              </div>
              <div class="progress-bar"><div class="pb-fill" :style="{width: progressPercent+'%'}"></div></div>
              <div class="score-progress-row" style="margin-top:10px">
                <div class="sp-label">{{ t('class.performance') }}</div>
                <div class="sp-value">{{ performancePercent }}%</div>
              </div>
              <div class="progress-bar"><div class="pb-fill perf-fill" :style="{width: performancePercent+'%'}"></div></div>
              <div class="score-count">{{ ratingData.graded_count }} {{ lang === 'ru' ? 'задан(ий) оценено' : lang === 'kk' ? 'тапсырма бағаланды' : 'graded' }}</div>
            </template>
          </div>

          <!-- Next deadline -->
          <div class="sidebar-card" v-if="nextDeadline">
            <div class="next-deadline-label">{{ t('class.next_deadline') }}</div>
            <div class="next-deadline-row">
              <div class="deadline-date-box">
                <div class="ddb-month">{{ fmtMonth(nextDeadline.deadline) }}</div>
                <div class="ddb-day">{{ fmtDay(nextDeadline.deadline) }}</div>
              </div>
              <div class="deadline-info">
                <div class="deadline-title">{{ nextDeadline.title }}</div>
                <div class="deadline-remaining">{{ fmtRemaining(nextDeadline.deadline) }}</div>
              </div>
            </div>
          </div>

          <!-- AI learning guide — не показываем, если и так уже в ИИ-чате
               (ссылка "перейти в ИИ" была бы бессмысленна). -->
          <div class="sidebar-card" v-if="!isArchivedForUser && tab !== 'ai'">
            <div class="ai-guide-head">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              {{ t('class.ai_guide') }}
            </div>
            <div class="ai-guide-body">
              <p>{{ aiGuideText }}</p>
              <button class="ai-guide-link" @click="tab='ai'">{{ lang==='ru'?'Помочь нагнать →':'Get help →' }}</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- "⋮" menu for lecture/assignment cards — one shared popover
         instead of separate edit/delete icons on every card. position:fixed
         directly here — a <Teleport to="body"> on this page triggered a
         Vue Suspense/flush infinite-update crash on client-side navigation
         into this page (see incident notes), so it's rendered inline instead. -->
    <div v-if="activeMenuItem?.item" class="item-menu" :style="{ top: itemMenuPos.top + 'px', right: itemMenuPos.right + 'px' }" @click.stop>
      <button class="item-menu-item" @click="onMenuEdit">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        <span>{{ lang==='ru'?'Изменить':lang==='kk'?'Өзгерту':'Edit' }}</span>
      </button>
      <button class="item-menu-item danger" @click="onMenuDelete">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
        <span>{{ lang==='ru'?'Удалить':lang==='kk'?'Жою':'Delete' }}</span>
      </button>
    </div>

    <!-- Modals -->
    <Transition name="modal">
      <LazyCreatePostModal v-if="showCreate" :class-id="classId" @close="showCreate = false" @created="onPostCreated" />
    </Transition>
    <Transition name="modal">
      <LazyCreateAssignmentModal v-if="showCreateAssignment" :class-id="classId" @close="showCreateAssignment = false" @created="onAssignmentCreated" />
    </Transition>
    <Transition name="modal">
    </Transition>

    <!-- Class info hub — code, regenerate code, academic-year picker,
         entry point to rotation settings. Single gear button on the cover
         opens this instead of crowding the cover with separate buttons. -->
    <Transition name="modal">
    <div v-if="showClassInfo" class="overlay" @click.self="showClassInfo=false">
      <div class="modal class-info-modal" style="max-width:420px;width:100%">
        <div class="modal-head">
          <span class="modal-title">{{ t('cohort.settings') }}</span>
          <button class="btn btn-icon btn-ghost" @click="showClassInfo=false">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="class-info-body">
          <div v-if="classCode" class="ci-code-card">
            <div class="ci-code-label">{{ lang==='ru' ? 'Код класса' : lang==='kk' ? 'Сынып коды' : 'Class code' }}</div>
            <div class="ci-code-row">
              <button class="ci-code-value" @click="copyCode" :title="lang==='ru'?'Нажмите чтобы скопировать код':'Click to copy code'">
                <strong>{{ classCode }}</strong>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:.65"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2"/><rect x="8" y="8" width="12" height="12" rx="2"/></svg>
              </button>
              <button class="ci-regen-btn" :disabled="regeneratingCode" @click="regenerateCode" :title="t('class.regenerate_code')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
              </button>
            </div>
          </div>

          <div v-if="isYearly && cohorts.length > 1" class="ci-row">
            <div class="ci-row-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div class="ci-row-body">
              <div class="ci-row-label">{{ t('cohort.academic_year') }}</div>
              <select class="ci-year-select" :value="selectedCohortId ?? ''" @change="onCohortChange($event)">
                <option v-for="c in cohorts" :key="c.id" :value="c.id">
                  {{ c.academic_year }}{{ c.status === 'active' ? ` (${t('cohort.active')})` : '' }}
                </option>
              </select>
            </div>
          </div>

          <button class="ci-row ci-row-link" @click="showClassInfo=false; openSettings()">
            <div class="ci-row-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            </div>
            <div class="ci-row-body">
              <div class="ci-row-label">{{ lang==='ru' ? 'Настройки учебного года' : lang==='kk' ? 'Оқу жылы параметрлері' : 'Academic year settings' }}</div>
              <div class="ci-row-sub">{{ t('cohort.rotation_title') }}</div>
            </div>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>
    </Transition>

    <!-- Class settings (rotation mode) — owner/admin -->
    <Transition name="modal">
    <div v-if="showSettings" class="overlay" @click.self="showSettings=false">
      <div class="modal" style="max-width:440px;width:100%">
        <div class="modal-head">
          <span class="modal-title">{{ t('cohort.rotation_title') }}</span>
          <button class="btn btn-icon btn-ghost" @click="showSettings=false">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="settings-body">
          <div class="rotation-row">
            <div class="rotation-info">
              <div class="rotation-title">{{ t('cohort.rotation_title') }}</div>
              <div class="rotation-desc">{{ t('cohort.rotation_desc') }}</div>
            </div>
            <button
              class="toggle-switch"
              :class="{ on: rotationYearly }"
              :disabled="savingRotation"
              @click="toggleRotation"
              role="switch"
              :aria-checked="rotationYearly"
            >
              <span class="toggle-knob"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- Edit Post Modal -->
    <Transition name="modal">
    <div v-if="editingPost" class="overlay" @click.self="editingPost=null">
      <div class="modal" style="max-width:520px;width:100%">
        <div class="modal-head">
          <span class="modal-title">{{ lang==='ru' ? 'Редактировать лекцию' : 'Edit Lecture' }}</span>
          <button class="btn btn-icon btn-ghost" @click="editingPost=null">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;padding:4px 0 8px">
          <div class="edit-field">
            <label class="field-label">{{ lang==='ru'?'ЗАГОЛОВОК':'TITLE' }}</label>
            <input v-model="editPostForm.title" class="field-input" :placeholder="lang==='ru'?'Заголовок...':'Title...'"/>
          </div>
          <div class="edit-field">
            <label class="field-label">{{ lang==='ru'?'СОДЕРЖИМОЕ':'CONTENT' }}</label>
            <textarea v-model="editPostForm.content" class="field-textarea" rows="8" :placeholder="lang==='ru'?'Текст, ссылки на файлы...':'Text, file links...'"></textarea>
          </div>
          <div v-if="editPostFiles.length" class="edit-field">
            <label class="field-label">{{ lang==='ru'?'ПРИКРЕПЛЁННЫЕ ФАЙЛЫ':'ATTACHED FILES' }}</label>
            <div class="edit-asg-files">
              <div v-for="(f, i) in editPostFiles" :key="f.url" class="edit-asg-file">
                <span class="eaf-name">{{ f.name }}</span>
                <button class="eaf-rm" :title="lang==='ru'?'Удалить файл':'Remove file'" @click="editPostFiles.splice(i,1)">×</button>
              </div>
            </div>
          </div>
          <div v-if="editPostNewFiles.length" class="edit-field">
            <label class="field-label">{{ lang==='ru'?'НОВЫЕ ФАЙЛЫ':'NEW FILES' }}</label>
            <div class="edit-asg-files">
              <div v-for="(f, i) in editPostNewFiles" :key="`${f.name}_${f.size}_${f.lastModified}`" class="edit-asg-file">
                <span class="eaf-name">{{ f.name }}</span>
                <button class="eaf-rm" :title="lang==='ru'?'Удалить файл':'Remove file'" @click="removeEditPostNewFile(i)">×</button>
              </div>
            </div>
          </div>
          <div class="edit-field">
            <label class="field-label">{{ lang==='ru'?'ДОБАВИТЬ / ЗАМЕНИТЬ ФАЙЛ':'ADD / REPLACE FILE' }}</label>
            <input type="file" style="display:none" ref="editPostFi" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.ppt,.pptx" @change="onEditPostPick" />
            <button class="btn btn-white" style="width:100%;justify-content:center" @click="editPostFi?.click()">
              {{ lang==='ru'?'Выбрать файл...':'Choose file...' }}
            </button>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-white" @click="editingPost=null">{{ t('general.cancel') }}</button>
          <button class="btn btn-teal" :disabled="editPostSaving" @click="saveEditPost">
            <div v-if="editPostSaving" class="spinner" style="width:13px;height:13px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
            <span v-else>{{ t('general.save') }}</span>
          </button>
        </div>
      </div>
    </div>
    </Transition>

    <!-- Edit Assignment Modal -->
    <Transition name="modal">
    <div v-if="editingAssignment" class="overlay" @click.self="editingAssignment=null">
      <div class="modal" style="max-width:520px;width:100%">
        <div class="modal-head">
          <span class="modal-title">{{ lang==='ru'?'Редактировать задание':'Edit Assignment' }}</span>
          <button class="btn btn-icon btn-ghost" @click="editingAssignment=null">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;padding:4px 0 8px;max-height:70vh;overflow-y:auto">
          <div class="edit-field">
            <label class="field-label">{{ lang==='ru'?'НАЗВАНИЕ':'TITLE' }}</label>
            <input v-model="editAsgForm.title" class="field-input" :placeholder="lang==='ru'?'Название задания...':'Assignment title...'"/>
          </div>
          <div class="edit-field">
            <label class="field-label">{{ lang==='ru'?'ОПИСАНИЕ':'DESCRIPTION' }}</label>
            <textarea v-model="editAsgForm.description" class="field-textarea" rows="3" :placeholder="lang==='ru'?'Описание...':'Description...'"></textarea>
          </div>
          <div class="edit-field">
            <label class="field-label">{{ lang==='ru'?'ФАЙЛЫ ЗАДАНИЯ':'ASSIGNMENT FILES' }}</label>
            <div v-if="editAsgFiles.length || editAsgNewFiles.length" class="edit-asg-files">
              <div v-for="(f, i) in editAsgFiles" :key="f.url" class="edit-asg-file">
                <span class="eaf-name">{{ f.name }}</span>
                <button class="eaf-rm" :title="lang==='ru'?'Удалить файл':'Remove file'" @click="editAsgFiles.splice(i,1)">×</button>
              </div>
              <div v-for="(f, i) in editAsgNewFiles" :key="`new_${f.name}_${f.size}_${f.lastModified}`" class="edit-asg-file">
                <span class="eaf-name">{{ f.name }}</span>
                <button class="eaf-rm" :title="lang==='ru'?'Удалить файл':'Remove file'" @click="editAsgNewFiles.splice(i,1)">×</button>
              </div>
            </div>
            <input type="file" style="display:none" ref="editAsgTaskFi" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.ppt,.pptx" @change="onEditAsgTaskPick" />
            <button class="btn btn-white" style="width:100%;justify-content:center;margin-top:6px" @click="editAsgTaskFi?.click()">
              {{ lang==='ru'?'Добавить файл...':'Add file...' }}
            </button>
          </div>
          <div class="edit-field edit-asg-ref-section">
            <label class="field-label">{{ lang==='ru'?'ЭТАЛОННОЕ РЕШЕНИЕ':'REFERENCE SOLUTION' }}</label>
            <div v-if="editAsgRefFiles.length || editAsgNewRefFiles.length" class="edit-asg-files">
              <div v-for="(f, i) in editAsgRefFiles" :key="f.url" class="edit-asg-file">
                <span class="eaf-name">{{ f.name }}</span>
                <button class="eaf-rm" :title="lang==='ru'?'Удалить файл':'Remove file'" @click="editAsgRefFiles.splice(i,1)">×</button>
              </div>
              <div v-for="(f, i) in editAsgNewRefFiles" :key="`new_${f.name}_${f.size}_${f.lastModified}`" class="edit-asg-file">
                <span class="eaf-name">{{ f.name }}</span>
                <button class="eaf-rm" :title="lang==='ru'?'Удалить файл':'Remove file'" @click="editAsgNewRefFiles.splice(i,1)">×</button>
              </div>
            </div>
            <input type="file" style="display:none" ref="editAsgRefFi" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.ppt,.pptx" @change="onEditAsgRefPick" />
            <button class="btn btn-white" style="width:100%;justify-content:center;margin-top:6px" @click="editAsgRefFi?.click()">
              {{ lang==='ru'?'Добавить эталон...':'Add reference file...' }}
            </button>
          </div>
          <div class="edit-field">
            <label class="field-label">{{ lang==='ru'?'ДЕДЛАЙН':'DEADLINE' }}</label>
            <input v-model="editAsgForm.deadline" type="datetime-local" class="field-input"/>
          </div>
          <!-- Criteria -->
          <div class="edit-field">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <label class="field-label">{{ lang==='ru'?'КРИТЕРИИ ОЦЕНИВАНИЯ':'GRADING CRITERIA' }}</label>
              <button class="btn-add-criterion" @click="addCriterion">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                {{ lang==='ru'?'Добавить':'Add' }}
              </button>
            </div>
            <div class="criteria-edit-list">
              <div v-for="(c, i) in editAsgForm.criteria" :key="i" class="criterion-edit-row">
                <div class="criterion-edit-top">
                  <input v-model="c.name" class="field-input criterion-name-inp" :placeholder="lang==='ru'?'Название критерия...':'Criterion name...'"/>
                  <span class="criterion-pts">{{ c.weight }}</span>
                  <button class="criterion-del-btn" @click="removeCriterion(i)" :disabled="editAsgForm.criteria.length <= 1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="criteria-total">
              {{ lang==='ru'?'Баллы распределяются поровну — всего':'Points split evenly — total' }} {{ editAsgForm.max_score }}
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-white" @click="editingAssignment=null">{{ t('general.cancel') }}</button>
          <button class="btn btn-teal" :disabled="editAsgSaving || !canSaveEditAssignment" @click="saveEditAssignment">
            <div v-if="editAsgSaving" class="spinner" style="width:13px;height:13px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
            <span v-else>{{ t('general.save') }}</span>
          </button>
        </div>
      </div>
    </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from '#app'
import { useToast } from '~/composables/useToast'
import { usePostsSvc } from '~/services/posts'
import { useAssignmentsSvc } from '~/services/assignments'
import { parseUtc } from '~/composables/useDeadline'
import { useRatingSvc } from '~/services/rating'
import { useClassesSvc, type CohortResponse, type RotationMode } from '~/services/classes'
import { useAuthStore } from '~/stores/auth.store'
import { useClassesStore } from '~/stores/classes.store'
import { useI18n } from '~/composables/useI18n'
import { fixFileUrl } from '~/composables/useFileUrl'
import { extractFilesFromText, stripFilesFromText, withNameFragment, fileNameFromUrl } from '~/composables/useAttachments'
import { cleanLectureTitle as cleanTitle, fileEntryToLink, getFullBody } from '~/composables/usePostBody'
import { useUploadSvc } from '~/services/uploads'
import type { Assignment, Submission } from '~/services/assignments'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const postsSvc = usePostsSvc()
const uploadSvc = useUploadSvc()
const assignmentsSvc = useAssignmentsSvc()
const ratingSvc = useRatingSvc()
const classesSvc = useClassesSvc()
const classesStore = useClassesStore()
const toast = useToast()
const auth = useAuthStore()
const { t, lang } = useI18n()

const classId = computed(() => Number(route.params.id))
const isTeacher = computed(() => auth.user?.role === 'teacher' || auth.user?.role === 'admin')

// Если карточка класса (с обложкой) уже в общем сторе — заходили с каталога —
// показываем её сразу, без полноэкранного спиннера и без повторной загрузки
// той же обложки: URL не меняется, значит браузер отдаёт её из кэша.
// Свежие данные (посты, задания и т.п.) всё равно подтягиваем ниже, в фоне.
const cachedClass = classesStore.byId(classId.value)
const loading = ref(!cachedClass)
const tab = ref<'lectures' | 'assignments' | 'ai'>('lectures')

// Cover collapses smoothly on scroll — only inside the AI chat tab (see the
// LazyClassAiChat @scroll-state listener below). Reset whenever the tab changes.
const coverCollapsed = ref(false)
watch(tab, () => { coverCollapsed.value = false })
const showCreate = ref(false)
const showCreateAssignment = ref(false)
const allPosts = ref<any[]>([])
const assignments = ref<Assignment[]>([])
const mySubmissions = ref<Submission[]>([])

const editingPost = ref<any>(null)
const editPostForm = ref({ title: '', content: '' })
const editPostSaving = ref(false)
// Уже прикреплённые файлы (можно удалить) — как в editAsgFiles
const editPostFiles = ref<{ name: string; url: string }[]>([])
// Новые файлы, выбранные для замены/добавления в этой сессии редактирования
const editPostNewFiles = ref<File[]>([])
const editPostFi = ref<HTMLInputElement | null>(null)

const editingAssignment = ref<any>(null)
const editAsgForm = ref<{ title: string; description: string; max_score: number; deadline: string; criteria: Array<{name:string;weight:number}> }>({ title: '', description: '', max_score: 100, deadline: '', criteria: [] })
// Файлы задания живут в description как URL — в форме показываем чипами, а не текстом
const editAsgFiles = ref<{ name: string; url: string }[]>([])
const editAsgNewFiles = ref<File[]>([])
const editAsgTaskFi = ref<HTMLInputElement | null>(null)
// Эталонное решение хранится отдельно, в reference_solution_url (строка или JSON-массив URL)
const editAsgRefFiles = ref<{ name: string; url: string }[]>([])
const editAsgNewRefFiles = ref<File[]>([])
const editAsgRefFi = ref<HTMLInputElement | null>(null)
const editAsgSaving = ref(false)
const loadingAssignments = ref(false)
const canSaveEditAssignment = computed(() =>
  editAsgForm.value.title.trim() &&
  editAsgForm.value.criteria.length > 0 &&
  editAsgForm.value.criteria.every(c => c.name.trim())
)

const ratingData = ref({ avg_score: 0, avg_percent: 0, graded_count: 0, total_score: 0, max_possible: 0 })
const loadingRating = ref(false)
const assignmentsLoaded = ref(false)

const currentClass = ref<any>(cachedClass)
const classMeta = computed(() => currentClass.value ?? {})
// true только для ученика архивного потока — класс доступен только для чтения.
const isArchivedForUser = computed(() => !!currentClass.value?.is_archived_for_user)
// Сегмент-контрол вкладок: сколько сейчас реально показано (у архивного
// студента вкладки "ИИ" нет) и позиция активной — двигает плавающую подложку.
const tabCount = computed(() => isArchivedForUser.value ? 2 : 3)
const tabIndex = computed(() => tab.value === 'lectures' ? 0 : tab.value === 'assignments' ? 1 : 2)

// ── Потоки (учебные годы) — управление преподавателем-владельцем / админом ──
const isOwnerOrAdmin = computed(() => auth.user?.role === 'admin' || currentClass.value?.created_by === auth.user?.id)
const isYearly = computed(() => currentClass.value?.rotation_mode === 'yearly')
const cohorts = ref<CohortResponse[]>([])
const selectedCohortId = ref<number | null>(null)
const activeCohort = computed(() => cohorts.value.find(c => c.status === 'active') || null)
// Преподаватель смотрит архивный поток → режим просмотра (нельзя добавлять/править).
const viewingArchiveCohort = computed(() =>
  isOwnerOrAdmin.value && selectedCohortId.value != null &&
  activeCohort.value != null && selectedCohortId.value !== activeCohort.value.id
)
// cohort_id для загрузки сдач прошлых лет (undefined = активный поток).
const teacherViewCohortId = computed<number | undefined>(() =>
  viewingArchiveCohort.value ? selectedCohortId.value ?? undefined : undefined)
const canManage = computed(() => isTeacher.value && !viewingArchiveCohort.value)

const showSettings = ref(false)
const showClassInfo = ref(false)
const rotationYearly = ref(false)
const savingRotation = ref(false)

const loadCohorts = async () => {
  if (!isOwnerOrAdmin.value || !isYearly.value) return
  try {
    cohorts.value = await classesSvc.listCohorts(classId.value)
    if (selectedCohortId.value == null) selectedCohortId.value = activeCohort.value?.id ?? null
  } catch {}
}
const onCohortChange = (e: Event) => {
  const v = (e.target as HTMLSelectElement).value
  selectedCohortId.value = v ? Number(v) : null
  // Перезагружаем сдачи при следующем открытии задания — cohort_id проброшен в модалку.
}
const openSettings = () => { rotationYearly.value = isYearly.value; showSettings.value = true }
const toggleRotation = async () => {
  if (savingRotation.value) return
  const next: RotationMode = rotationYearly.value ? 'manual' : 'yearly'
  savingRotation.value = true
  try {
    const updated = await classesSvc.setRotationMode(classId.value, next)
    currentClass.value = { ...currentClass.value, ...updated }
    classesStore.upsert(currentClass.value)
    rotationYearly.value = next === 'yearly'
    toast.ok(t('cohort.rotation_saved'))
    if (next === 'yearly') await loadCohorts()
    else { cohorts.value = []; selectedCohortId.value = null }
  } catch (e: any) { toast.err(e?.response?.data?.detail || t('general.error')) }
  finally { savingRotation.value = false }
}
const classTitle = computed(() => currentClass.value?.name || `Класс #${classId.value}`)

const heroStyle = computed(() => {
  const img = classMeta.value.cover_image
  if (img) return { backgroundImage: `url(${fixFileUrl(img)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  return {}
})
const classPosts = computed(() => allPosts.value.filter(p => p.title?.includes(`[${classId.value}]`)))
// Лекции — новые сверху, старые снизу (по запросу пользователя). classPosts
// (сырой, без сортировки) отдельно уходит в AI-чат, так что нумерация там
// не завязана на порядок этого списка и не расходится при его инверсии.
const lectures = computed(() => classPosts.value
  .filter(p => p.title?.startsWith('[LECTURE]'))
  .slice()
  .sort((a, b) => {
    // NULLS LAST при убывании — лекции без position (созданы раньше уже
    // пронумерованных) уходят вниз вместе со старыми, а не всплывают наверх.
    const pa = a.position ?? -Infinity, pb = b.position ?? -Infinity
    if (pa !== pb) return pb - pa
    return (b.id ?? 0) - (a.id ?? 0)
  }))

const avgScore = computed(() => ratingData.value.avg_score || null)
const avgScoreDisplay = computed(() => Math.round(ratingData.value.avg_score || 0))
const maxPossibleScore = computed(() => assignments.value.reduce((s, a) => s + (a.max_score || 0), 0) || 100)
const progressPercent = computed(() => {
  if (!assignments.value.length) return 0
  const done = mySubmissions.value.filter(s => s.status === 'submitted' || s.status === 'graded').length
  return Math.round((done / assignments.value.length) * 100)
})
const performancePercent = computed(() => Math.round(ratingData.value.avg_percent || 0))
const nextDeadline = computed(() => {
  const now = new Date()
  return assignments.value
    .filter(a => a.deadline && parseUtc(a.deadline) > now)
    .sort((a, b) => parseUtc(a.deadline!).getTime() - parseUtc(b.deadline!).getTime())[0] || null
})
const aiGuideText = computed(() => {
  const late = assignments.value.filter(a => a.deadline && parseUtc(a.deadline) < new Date() && !mySubmissionsMap.value[a.id])
  if (late.length && lang.value === 'ru') return `На основании просроченного статуса Лабы ${late[0]?.title}, вам может потребоваться повторение темы. Сгенерировать краткий обзор основных правил?`
  if (late.length) return `Based on the overdue status of ${late[0]?.title}, you may need to review the topic. Generate a brief overview?`
  return lang.value === 'ru' ? 'ИИ-ассистент поможет с учебными материалами и заданиями.' : 'AI assistant will help with study materials and assignments.'
})

const fmtMonth = (d: string) => { try { return parseUtc(d).toLocaleString(lang.value === 'ru' ? 'ru-RU' : 'en-US', {month:'short'}).toUpperCase() } catch { return '' } }
const fmtDay = (d: string) => { try { return parseUtc(d).getDate().toString() } catch { return '' } }
const fmtRemaining = (d: string) => {
  try {
    const diff = parseUtc(d).getTime() - Date.now()
    if (diff < 0) return lang.value === 'ru' ? 'Просрочено' : 'Overdue'
    const days = Math.floor(diff / 86400000)
    const hrs = Math.floor((diff % 86400000) / 3600000)
    if (lang.value === 'ru') return `Осталось: ${days} дн. ${hrs} ч.`
    return `Remaining: ${days} days, ${hrs} hours`
  } catch { return '' }
}

const mySubmissionsMap = computed(() => {
  const m: Record<number, Submission> = {}
  mySubmissions.value.forEach(s => { m[s.assignment_id] = s })
  return m
})
const isLate = (a: Assignment) => a.deadline && parseUtc(a.deadline) < new Date() && !mySubmissionsMap.value[a.id]
const isInProgress = (a: Assignment) => mySubmissionsMap.value[a.id]?.status === 'submitted'
const isGraded = (a: Assignment) => mySubmissionsMap.value[a.id]?.status === 'graded'
const getStatusIconClass = (a: Assignment) => {
  if (isLate(a)) return 'icon-late'
  if (isInProgress(a)) return 'icon-progress'
  return 'icon-default'
}
const getStatusClass = (a: Assignment) => {
  const sub = mySubmissionsMap.value[a.id]
  if (sub?.status === 'graded') return 'status-done'
  if (sub?.status === 'submitted') return 'status-progress'
  if (isLate(a)) return 'status-late'
  return 'status-new'
}
const getStatusLabel = (a: Assignment) => {
  const sub = mySubmissionsMap.value[a.id]
  if (sub?.status === 'graded') return t('assign.status.graded')
  if (sub?.status === 'submitted') return t('assign.status.submitted')
  if (isLate(a)) return t('assign.status.overdue')
  return t('assign.status.not_started')
}
const pendingCount = computed(() => assignments.value.filter(a => !mySubmissionsMap.value[a.id] && a.is_active).length)
const doneCount = computed(() => mySubmissions.value.filter(s => s.status === 'submitted' || s.status === 'graded').length)
const lateCount = computed(() => mySubmissions.value.filter(s => s.status === 'late').length + assignments.value.filter(a => !mySubmissionsMap.value[a.id] && a.deadline && parseUtc(a.deadline) < new Date()).length)

const fmtDate = (d: string) => { if (!d) return ''; try { return parseUtc(d).toLocaleDateString(lang.value === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return d } }
const ATTACHMENT_LINK = /📎\s*\[([^\]]+)\]\(([^)]+)\)/g
const getPreview = (p: any): string => { const body = getFullBody(p); const clean = body.replace(ATTACHMENT_LINK, '').replace(/(https?:\/\/[^\s]+)/g, '').replace(/\s+/g, ' ').trim(); return clean.length > 100 ? clean.slice(0, 100) + '…' : clean || (lang.value==='ru'?'Нет описания':'No description') }
const FILE_EXT = /\.(pdf|doc|docx|txt|ppt|pptx|xls|xlsx|png|jpg|jpeg|gif|webp|md)(\?[^\s]*)?/i
// Пробел в URL допустим (оригинальное имя файла в пути) — границу задают
// кавычки/спецсимволы JSON, а не whitespace, иначе файлы с пробелом в имени
// (напр. "Lection 1.pptx") не считались бы вложениями.
const countFiles = (p: any): number => { const body = p.body || ''; const m = body.match(new RegExp(`https?://[^\\n"'<>]+${FILE_EXT.source}`, 'gi')); return m?.length || 0 }
const pluralFile = (n: number) => lang.value === 'ru' ? (n === 1 ? 'файл' : n < 5 ? 'файла' : 'файлов') : 'file' + (n !== 1 ? 's' : '')

const classCode = computed(() => currentClass.value?.invite_code || '')
const copyCode = () => { navigator.clipboard?.writeText(classCode.value).then(() => toast.ok(t('class.code_copied') + ' ' + classCode.value)).catch(() => toast.ok(t('class.code') + ' ' + classCode.value)) }

const regeneratingCode = ref(false)
const regenerateCode = async () => {
  if (regeneratingCode.value) return
  if (!confirm(t('class.regenerate_confirm'))) return
  regeneratingCode.value = true
  try {
    const newCode = await classesSvc.regenerateCode(classId.value)
    if (currentClass.value) { currentClass.value.invite_code = newCode; classesStore.upsert(currentClass.value) }
    toast.ok(t('class.regenerate_ok') + ' ' + newCode)
  } catch (e: any) {
    toast.err(e?.response?.data?.detail || t('class.regenerate_failed'))
  } finally {
    regeneratingCode.value = false
  }
}

const onPostCreated = (p: any) => { allPosts.value.unshift(p) }

// ── Item card "⋮" menu (edit/delete) — shared by lectures/assignments ──
const openItemMenu = ref<string | null>(null)
const itemMenuPos = ref({ top: 0, right: 0 })
const closeItemMenu = () => { openItemMenu.value = null }
const toggleItemMenu = (e: MouseEvent, key: string) => {
  if (openItemMenu.value === key) { closeItemMenu(); return }
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  itemMenuPos.value = { top: r.bottom + 6, right: window.innerWidth - r.right }
  openItemMenu.value = key
}
const onItemMenuDocClick = () => { if (openItemMenu.value) closeItemMenu() }
const onItemMenuScroll = () => { if (openItemMenu.value) closeItemMenu() }
onMounted(() => {
  document.addEventListener('click', onItemMenuDocClick)
  document.addEventListener('scroll', onItemMenuScroll, true)
})
onUnmounted(() => {
  document.removeEventListener('click', onItemMenuDocClick)
  document.removeEventListener('scroll', onItemMenuScroll, true)
})
const deletePost = async (id: number) => {
  if (!confirm(lang.value==='ru'?'Удалить эту запись? Действие необратимо.':'Delete this record? Action is irreversible.')) return
  try { await postsSvc.remove(id); allPosts.value = allPosts.value.filter(p => p.id !== id); toast.ok(t('class.delete_post')) } catch (e: any) { toast.err(e?.response?.data?.detail || t('general.error')) }
}

const openEditPost = (p: any, type: string) => {
  editingPost.value = { ...p, type }
  const fullBody = getFullBody(p)
  editPostFiles.value = extractFilesFromText(fullBody)
  editPostNewFiles.value = []
  const rawTitle = p.title || ''
  const cleanedTitle = rawTitle.replace(/^\[LECTURE\]\[\d+\]\s*/, '').trim()
  editPostForm.value = { title: cleanedTitle, content: stripFilesFromText(fullBody) }
}

const onEditPostPick = (e: Event) => {
  editPostNewFiles.value = [...editPostNewFiles.value, ...Array.from((e.target as HTMLInputElement).files || [])]
  if (editPostFi.value) editPostFi.value.value = ''
}
const removeEditPostNewFile = (i: number) => { editPostNewFiles.value = editPostNewFiles.value.filter((_, idx) => idx !== i) }

const saveEditPost = async () => {
  if (!editingPost.value) return
  editPostSaving.value = true
  try {
    const p = editingPost.value
    // Загружаем вновь выбранные файлы, чтобы заменить/дополнить прикрепления
    const uploaded: string[] = []
    for (const f of editPostNewFiles.value) {
      const { file_url } = await uploadSvc.upload(f)
      if (!file_url) throw new Error('upload_failed')
      uploaded.push(`${file_url}#${encodeURIComponent(f.name)}`)
    }
    const files = [...editPostFiles.value.map(f => f.url), ...uploaded]
    const body: any = { content: editPostForm.value.content, ...(files.length ? { files } : {}) }
    const prefix = `[LECTURE][${classId.value}] `
    const newTitle = prefix + editPostForm.value.title
    await postsSvc.update(p.id, newTitle, JSON.stringify(body))
    const idx = allPosts.value.findIndex(x => x.id === p.id)
    if (idx !== -1) allPosts.value[idx] = { ...allPosts.value[idx], title: newTitle, body: JSON.stringify(body) }
    toast.ok(lang.value === 'ru' ? 'Сохранено' : 'Saved')
    editingPost.value = null
  } catch (e: any) { toast.err(e?.response?.data?.detail || t('general.error')) }
  finally { editPostSaving.value = false }
}

const openEditAssignment = (a: any) => {
  editingAssignment.value = a
  // datetime-local ожидает ЛОКАЛЬНОЕ время — нельзя брать toISOString() (UTC).
  // Строим строку из компонентов локального Date, полученного из parseUtc.
  const dl = a.deadline ? (() => {
    const dt = parseUtc(a.deadline)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
  })() : ''
  let criteria: Array<{name:string;weight:number}> = []
  try { criteria = JSON.parse(a.criteria || '[]') } catch {}
  if (!criteria.length) criteria = [{ name: '', weight: 10 }]
  editAsgFiles.value = extractFilesFromText(a.description)
  editAsgNewFiles.value = []
  let refUrls: string[] = []
  if (a.reference_solution_url) {
    try { const arr = JSON.parse(a.reference_solution_url); refUrls = Array.isArray(arr) ? arr : [a.reference_solution_url] }
    catch { refUrls = [a.reference_solution_url] }
  }
  editAsgRefFiles.value = refUrls.map(url => ({ url, name: fileNameFromUrl(url) }))
  editAsgNewRefFiles.value = []
  editAsgForm.value = { title: a.title || '', description: stripFilesFromText(a.description), max_score: a.max_score || 100, deadline: dl, criteria }
}

const onEditAsgTaskPick = (e: Event) => {
  editAsgNewFiles.value = [...editAsgNewFiles.value, ...Array.from((e.target as HTMLInputElement).files || [])]
  if (editAsgTaskFi.value) editAsgTaskFi.value.value = ''
}
const onEditAsgRefPick = (e: Event) => {
  editAsgNewRefFiles.value = [...editAsgNewRefFiles.value, ...Array.from((e.target as HTMLInputElement).files || [])]
  if (editAsgRefFi.value) editAsgRefFi.value.value = ''
}

// Баллы за критерии больше не задаются вручную — делим max_score поровну,
// остаток (при неровном делении) добавляем первым критериям по порядку.
const redistributeCriteriaWeights = () => {
  const list = editAsgForm.value.criteria
  const n = list.length
  if (!n) return
  const target = editAsgForm.value.max_score || 100
  const base = Math.floor(target / n)
  const rem = target - base * n
  list.forEach((c, i) => { c.weight = base + (i < rem ? 1 : 0) })
}
const addCriterion = () => { editAsgForm.value.criteria.push({ name: '', weight: 0 }); redistributeCriteriaWeights() }
const removeCriterion = (i: number) => { if (editAsgForm.value.criteria.length > 1) { editAsgForm.value.criteria.splice(i, 1); redistributeCriteriaWeights() } }

const saveEditAssignment = async () => {
  if (!editingAssignment.value || !canSaveEditAssignment.value) return
  editAsgSaving.value = true
  try {
    // Загружаем вновь выбранные файлы задания
    const uploadedTaskUrls: string[] = []
    for (const f of editAsgNewFiles.value) {
      const { file_url } = await uploadSvc.upload(f)
      if (!file_url) throw new Error('upload_failed')
      uploadedTaskUrls.push(withNameFragment(file_url, f.name))
    }
    // Пришиваем сохранённые файлы обратно в description (бэкенд не хранит file_urls у заданий)
    const fileLines = [...editAsgFiles.value.map(f => f.url), ...uploadedTaskUrls].join('\n')
    const descWithFiles = [stripFilesFromText(editAsgForm.value.description), fileLines].filter(Boolean).join('\n')

    // Загружаем вновь выбранные файлы эталонного решения
    const uploadedRefUrls: string[] = []
    for (const f of editAsgNewRefFiles.value) {
      const { file_url } = await uploadSvc.upload(f)
      if (!file_url) throw new Error('upload_failed')
      uploadedRefUrls.push(file_url)
    }
    const refUrls = [...editAsgRefFiles.value.map(f => f.url), ...uploadedRefUrls]
    // Пустая строка (а не undefined) явно очищает поле на бэкенде — там exclude_none, а не exclude_empty
    const referenceSolutionUrl = refUrls.length > 1 ? JSON.stringify(refUrls) : (refUrls[0] || '')

    const updated = await assignmentsSvc.update(editingAssignment.value.id, {
      title: editAsgForm.value.title,
      description: descWithFiles,
      deadline: editAsgForm.value.deadline ? new Date(editAsgForm.value.deadline).toISOString() : undefined,
      // Поле очищено в форме — явный сигнал бэкенду снять дедлайн (см. коммент у clear_deadline в assignments.ts)
      clear_deadline: !editAsgForm.value.deadline,
      criteria: editAsgForm.value.criteria,
      reference_solution_url: referenceSolutionUrl,
    })
    const idx = assignments.value.findIndex(x => x.id === editingAssignment.value.id)
    if (idx !== -1) assignments.value[idx] = { ...assignments.value[idx], ...updated }
    toast.ok(lang.value === 'ru' ? 'Задание обновлено' : 'Assignment updated')
    editingAssignment.value = null
  } catch (e: any) { toast.err(e?.response?.data?.detail || t('general.error')) }
  finally { editAsgSaving.value = false }
}
const loadAssignments = async () => {
  if (assignmentsLoaded.value || loadingAssignments.value) return
  loadingAssignments.value = true
  try {
    assignments.value = await assignmentsSvc.list(classId.value)
    if (!isTeacher.value) {
      mySubmissions.value = await assignmentsSvc.mySubmissions()
      loadRating()
    }
    assignmentsLoaded.value = true
  }
  catch { toast.err(t('general.error')) } finally { loadingAssignments.value = false }
}

const loadRating = async () => {
  if (isTeacher.value) return
  loadingRating.value = true
  try {
    ratingData.value = await ratingSvc.myRating(classId.value)
  } catch {} finally { loadingRating.value = false }
}

const deleteAssignment = async (a: Assignment) => {
  if (!confirm(`${lang.value==='ru'?'Удалить задание':'Delete assignment'} «${a.title}»?`)) return
  try { await assignmentsSvc.delete(a.id); assignments.value = assignments.value.filter(x => x.id !== a.id); toast.ok(t('class.delete_assignment')) } catch (e: any) { toast.err(e?.response?.data?.detail || t('general.error')) }
}
const goAssignment = (a: Assignment) => {
  const cohort = teacherViewCohortId.value
  router.push(`/classes/${classId.value}/assignments/${a.id}${cohort != null ? '?cohort=' + cohort : ''}`)
}
const onAssignmentCreated = (a: Assignment) => { assignments.value.unshift(a); showCreateAssignment.value = false }

// ── Resolve the item behind the open "⋮" menu, regardless of which list it's in ──
const activeMenuItem = computed(() => {
  if (!openItemMenu.value) return null
  const sep = openItemMenu.value.indexOf('-')
  const type = openItemMenu.value.slice(0, sep)
  const id = Number(openItemMenu.value.slice(sep + 1))
  if (type === 'lecture') return { type, item: lectures.value.find(p => p.id === id) }
  if (type === 'assignment') return { type, item: assignments.value.find(a => a.id === id) }
  return null
})
const onMenuEdit = () => {
  const m = activeMenuItem.value
  closeItemMenu()
  if (!m?.item) return
  if (m.type === 'assignment') openEditAssignment(m.item)
  else openEditPost(m.item, m.type)
}
const onMenuDelete = () => {
  const m = activeMenuItem.value
  closeItemMenu()
  if (!m?.item) return
  if (m.type === 'assignment') deleteAssignment(m.item)
  else deletePost(m.item.id)
}
onMounted(async () => {
  // Open a specific tab if passed via query param (e.g. from calendar deadlines)
  const qTab = route.query.tab as string
  if (qTab === 'assignments' || qTab === 'ai') {
    tab.value = qTab
  }

  // Задания грузим всегда, а не только при заходе на вкладку "Задания" —
  // от них зависит виджет "Ближайший дедлайн" в сайдбаре (v-if="nextDeadline"),
  // который должен быть виден независимо от того, на какой вкладке юзер
  // приземлился (по умолчанию — "Лекции"). loadAssignments идемпотентна
  // (guard на assignmentsLoaded/loadingAssignments), повторный вызов при
  // клике на вкладку — no-op.
  loadAssignments()

  // Если обложка/название уже показаны из кэша (см. cachedClass выше), не
  // включаем полноэкранный спиннер повторно — иначе он сам по себе пересоздаст
  // весь блок с обложкой и даст тот самый "мигающий" эффект при заходе в класс.
  if (!cachedClass) loading.value = true
  try {
    const [cls, posts] = await Promise.all([classesSvc.get(classId.value), postsSvc.list()])
    classesStore.upsert(cls)
    // upsert уже сохранил прежний URL обложки, если файл не поменялся (см.
    // sameFilePath в сторе) — берём результат оттуда, а не «сырой» cls,
    // чтобы currentClass не переключил heroStyle на заново подписанный URL.
    currentClass.value = classesStore.byId(classId.value) || cls
    allPosts.value = posts
    // Архивному ученику ИИ-чат недоступен — не открываем эту вкладку.
    if (isArchivedForUser.value && tab.value === 'ai') tab.value = 'lectures'
    // Преподавателю/админу yearly-класса — подгрузить список учебных лет.
    if (isOwnerOrAdmin.value && isYearly.value) loadCohorts()
  } catch { toast.err(t('general.error')) } finally { loading.value = false }
})
</script>

<style scoped>
.cd-page{height:100%;display:flex;flex-direction:column;background:var(--bg);overflow:hidden}
/* Loading */
.full-load{flex:1;display:flex;align-items:center;justify-content:center}
.spin-ring{width:30px;height:30px;border:3px solid var(--border2);border-top-color:var(--teal);border-radius:50%;animation:spin .7s linear infinite}
.tab-load{display:flex;justify-content:center;padding:60px}
@keyframes spin{to{transform:rotate(360deg)}}

/* Layout */
.cd-layout{display:flex;flex:1;overflow:hidden;gap:0}
.cd-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
/* Правый сайдбар (рейтинг/дедлайн) остаётся в DOM даже на вкладке ИИ и
   схлопывается вместе с обложкой (см. .cd-sidebar-collapsed) — та же логика
   и тайминг, что у .page-header/.header-collapsed ниже, чтобы обе колонки
   визуально уезжали синхронно, а не сайдбар резко, а обложка плавно. */
.cd-sidebar{width:300px;flex-shrink:0;border-left:1px solid var(--border);padding:20px 18px;overflow-y:auto;display:flex;flex-direction:column;gap:14px;background:var(--surface);opacity:1;transition:width .38s cubic-bezier(.4,0,.2,1),padding .38s cubic-bezier(.4,0,.2,1),opacity .25s ease,border-color .38s ease}
.cd-sidebar-collapsed{width:0!important;padding-left:0!important;padding-right:0!important;opacity:0!important;border-color:transparent!important;overflow:hidden}

/* Page header — collapses smoothly on scroll (min-height/opacity/padding all
   animated) to free up room for the interface underneath. Обложка теперь
   начинается сразу с верха страницы (отдельная полоса "Предметы › Название"
   над ней убрана) — высота увеличена ровно на столько, сколько раньше
   занимала та полоса, чтобы обложка визуально "выросла" в её место. */
.page-header{padding:20px 24px 16px;flex-shrink:0;position:relative;overflow:hidden;border-radius:0;min-height:272px;max-height:552px;display:flex;flex-direction:column;justify-content:flex-end;transition:min-height .38s cubic-bezier(.4,0,.2,1),max-height .38s cubic-bezier(.4,0,.2,1),padding .38s cubic-bezier(.4,0,.2,1),opacity .25s ease;will-change:min-height,max-height}
.page-header.header-collapsed{min-height:0!important;max-height:0!important;padding-top:0!important;padding-bottom:0!important;opacity:0!important;pointer-events:none;border-width:0}
.page-header-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.25) 0%,rgba(0,0,0,.55) 100%);z-index:0}
.page-header .page-header-body{position:relative;z-index:1}
.back-link-dark{color:rgba(255,255,255,.8)!important}.back-link-dark:hover{color:#fff!important}
.sep-dark{color:rgba(255,255,255,.5)!important}
.subject-dark{color:rgba(255,255,255,.7)!important}
.title-dark{color:#fff!important;text-shadow:0 2px 8px rgba(0,0,0,.4)}
.page-header .page-header-top{position:absolute;top:20px;left:24px;z-index:1;display:flex;align-items:center;gap:6px;margin-bottom:0}
.page-title-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.header-archive-badge{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:var(--text3);background:var(--surface2);border:1px solid var(--border);padding:4px 10px;border-radius:100px;letter-spacing:.03em}
.archive-notice{display:flex;align-items:center;gap:8px;margin:0 24px 4px;padding:10px 14px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);color:var(--text3);font-size:13px;font-weight:500}

/* Single gear button on the cover — top-right, opens the class-info modal
   (code, regenerate code, academic year, rotation settings) */
.page-header-gear{position:absolute;top:20px;right:24px;z-index:1}
.class-settings-btn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,.42);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.96);cursor:pointer;transition:all .2s}
.page-header:not([style*="url"]) .class-settings-btn{background:var(--surface2);border-color:var(--border);color:var(--text3)}
.class-settings-btn:hover{color:var(--teal);border-color:rgba(var(--teal-rgb),.5);transform:rotate(30deg)}
.cohort-view-notice{display:inline-flex;align-items:center;gap:7px;margin-bottom:10px;padding:7px 14px;background:rgba(0,0,0,.38);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.18);border-radius:100px;color:rgba(255,255,255,.94);font-size:12.5px;font-weight:600;position:relative;z-index:1}
.page-header:not([style*="url"]) .cohort-view-notice{background:var(--surface2);border-color:var(--border);color:var(--text3)}

/* Class info modal — modern minimalist settings hub: code card + list rows */
.class-info-body{padding:4px 0 6px;display:flex;flex-direction:column;gap:10px}
.ci-code-card{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-lg);padding:14px 16px}
.ci-code-label{font-size:11px;font-weight:700;color:var(--text4);letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px}
.ci-code-row{display:flex;align-items:center;gap:8px}
.ci-code-value{flex:1;display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:9px 14px;cursor:pointer;transition:all .15s;color:var(--teal)}
.ci-code-value:hover{background:var(--glass2);border-color:var(--border2)}
.ci-code-value strong{font-weight:800;letter-spacing:.14em;font-size:16px}
.ci-regen-btn{width:38px;height:38px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:var(--r-md);background:var(--surface);border:1px solid var(--border);color:var(--text3);cursor:pointer;transition:all .15s}
.ci-regen-btn:hover:not(:disabled){background:var(--glass2);border-color:var(--border2);color:var(--teal);transform:rotate(45deg)}
.ci-regen-btn:disabled{opacity:.5;cursor:default}
.ci-row{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:var(--r-lg);background:var(--surface2);border:1px solid var(--border);text-align:left;width:100%;transition:background .15s}
.ci-row-link{cursor:pointer}
.ci-row-link:hover{background:var(--surface3)}
.ci-row-icon{width:34px;height:34px;flex-shrink:0;border-radius:10px;background:var(--surface2);color:var(--text3);display:flex;align-items:center;justify-content:center}
.ci-row-body{flex:1;min-width:0}
.ci-row-label{font-size:13.5px;font-weight:600;color:var(--text1)}
.ci-row-sub{font-size:12px;color:var(--text4);margin-top:1px}
.ci-year-select{width:100%;background:transparent;border:none;color:var(--teal);font-size:13px;font-weight:700;cursor:pointer;outline:none;font-family:inherit;padding:0;margin-top:2px}
.ci-year-select option{color:var(--text1);background:var(--surface)}

/* Settings modal — rotation toggle */
.settings-body{padding:4px 0 6px}
.rotation-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 16px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-lg)}
.rotation-info{flex:1}
.rotation-title{font-size:13.5px;font-weight:600;color:var(--text1);margin-bottom:4px}
.rotation-desc{font-size:12px;color:var(--text4);line-height:1.55}
.toggle-switch{position:relative;width:46px;height:26px;border-radius:100px;background:var(--surface3);border:1px solid var(--border);cursor:pointer;flex-shrink:0;transition:background .2s,border-color .2s;padding:0}
.toggle-switch.on{background:var(--teal);border-color:var(--teal)}
.toggle-switch:disabled{opacity:.6;cursor:default}
.toggle-knob{position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s}
.toggle-switch.on .toggle-knob{transform:translateX(20px)}
.back-link{font-size:12px;color:var(--text4);text-decoration:none;transition:color .15s}.back-link:hover{color:var(--teal)}
.header-sep{font-size:10px;color:var(--text4)}
.header-subject{font-size:11px;font-weight:700;color:var(--text3);letter-spacing:.08em}
.page-header-body{margin-bottom:0}
/* Always-on light shadow — keeps the title readable even on very light/washed-out
   covers; .title-dark layers a stronger one on top for photo covers. */
.page-title{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:26px;font-weight:900;color:var(--text1);letter-spacing:-.02em;text-shadow:0 1px 3px rgba(0,0,0,.1)}
.page-header-actions{display:flex;align-items:center;gap:10px;margin-bottom:16px}

/* Tabs — iOS-style segmented control: equal-width segments floating inside a
   rounded "well", with a sliding pill behind the active label (no more
   underline / left-aligned text tabs). */
.tabs-wrap{flex-shrink:0;background:var(--surface);border-bottom:1px solid var(--border);padding:10px 20px}
/* min-height, не height: на узких экранах подпись таба может занять чуть
   больше места (см. ≤480px), фиксированная высота обрезала бы её снизу —
   тот самый "надписи съехали вниз" баг. */
.tabs-bar{position:relative;display:flex;align-items:stretch;padding:3px;background:var(--surface2);border-radius:12px;min-height:38px}
.tabs-indicator{position:absolute;top:3px;bottom:3px;left:3px;width:calc((100% - 6px) / var(--tab-count));transform:translateX(calc(100% * var(--tab-index)));background:var(--surface);border-radius:9px;box-shadow:0 1px 4px rgba(0,0,0,.12);transition:transform .28s cubic-bezier(.4,0,.2,1)}
html.dark .tabs-indicator{box-shadow:0 1px 4px rgba(0,0,0,.35)}
/* Fluid font-size вместо трёх фиксированных ступеней на разных брейкпоинтах —
   плавно сжимается на узких экранах вместо скачков. */
.tab-btn{position:relative;z-index:1;flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:0 10px;font-size:clamp(11px,3.2vw,13px);font-weight:600;color:var(--text4);background:transparent;border:none;border-radius:9px;cursor:pointer;transition:color .2s;white-space:nowrap;font-family:inherit;letter-spacing:-.01em}
.tab-btn svg{flex-shrink:0}
.tab-btn:hover{color:var(--text2)}
.tab-btn.active{color:var(--text1);font-weight:700}
.tab-ai.active{color:var(--text1)}
.tab-num{font-size:10px;font-weight:700;background:var(--surface3);color:var(--text3);padding:1px 6px;border-radius:100px}
.tab-btn.active .tab-num{background:var(--teal-l);color:var(--teal)}

/* Teacher create actions — below the tabs row (never inside the cover).
   Мягкая тень вместо жёсткой линии-разделителя (в духе Apple: edge effect,
   а не hairline) — граница появляется только когда есть что отделять. */
.tab-action-bar{display:flex;align-items:center;gap:10px;padding:10px 24px 14px;flex-shrink:0;background:var(--surface);box-shadow:0 8px 12px -10px rgba(0,0,0,.16)}
html.dark .tab-action-bar{box-shadow:0 8px 12px -10px rgba(0,0,0,.4)}

/* Обе плитки — одного веса и стиля, как в приложении: ни одно из двух
   действий не важнее другого, поэтому нет выделения цветом. */
.quick-action-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:11px 14px;background:var(--surface2);border:none;border-radius:var(--r-lg);color:var(--text1);font-size:13px;font-weight:600;letter-spacing:-.01em;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;cursor:pointer;transition:background .18s ease,transform .12s cubic-bezier(.32,.72,0,1)}
.quick-action-btn svg{flex-shrink:0}
.quick-action-btn:hover{background:var(--surface3)}
.quick-action-btn:active{transform:scale(.97)}

/* Tab content */
.tab-content{flex:1;overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column;gap:14px}
.tab-content.ai-mode{padding:0;overflow:hidden}

/* Items list — compact, modern cards */
.items-list{display:flex;flex-direction:column;gap:9px}
.item-row{display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);cursor:pointer;transition:transform .2s cubic-bezier(.22,1,.36,1),box-shadow .2s ease,border-color .2s ease}
.item-row:hover{border-color:var(--border2);box-shadow:var(--sh-sm);transform:translateY(-2px)}
.item-row:active{transform:translateY(0) scale(.995)}
.item-icon-col{flex-shrink:0}
.item-icon{width:42px;height:42px;border-radius:13px;display:flex;align-items:center;justify-content:center;transition:transform .2s ease}
.item-row:hover .item-icon{transform:scale(1.06)}
.lec-icon{background:linear-gradient(150deg,var(--surface3),var(--surface2));color:var(--text2);border:1px solid var(--border)}
.asgn-icon{background:linear-gradient(150deg,rgba(79,70,229,.14),rgba(79,70,229,.04));color:#4f46e5;border:1px solid rgba(79,70,229,.15)}
.icon-late{background:linear-gradient(150deg,rgba(220,38,38,.14),rgba(220,38,38,.04))!important;color:var(--red)!important;border-color:rgba(220,38,38,.18)!important}
.icon-progress{background:linear-gradient(150deg,rgba(251,191,36,.16),rgba(251,191,36,.05))!important;color:var(--yellow)!important;border-color:rgba(251,191,36,.25)!important}
.icon-default{background:var(--surface3)!important;color:var(--text4)!important;border-color:var(--border)!important}
.item-body{flex:1;min-width:0}
.item-row-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;gap:10px}
.item-title{font-size:14.5px;font-weight:700;color:var(--text1);letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.item-desc{font-size:12.5px;color:var(--text4);margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.4}
.item-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.meta-date,.meta-files{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:var(--text4);background:var(--surface2);padding:3px 9px;border-radius:100px}

/* Status badges */
.status-badge{flex-shrink:0;font-size:10.5px;font-weight:700;padding:3px 10px;border-radius:100px;letter-spacing:.04em;white-space:nowrap}
.status-progress{background:rgba(251,191,36,.12);color:var(--yellow);border:1px solid rgba(251,191,36,.25)}
.status-late{background:rgba(220,38,38,.1);color:var(--red);border:1px solid rgba(220,38,38,.2)}
.status-new{background:var(--surface2);color:var(--text4);border:1px solid var(--border)}
.status-done{background:rgba(22,163,74,.1);color:var(--green);border:1px solid rgba(22,163,74,.2)}
.status-pending{background:rgba(245,158,11,.1);color:#f59e0b;border:1px solid rgba(245,158,11,.2)}

.item-row.item-disabled{cursor:default;opacity:.75}
.item-row.item-disabled:hover{background:transparent}

/* Item actions */
.item-actions{display:flex;align-items:center;gap:6px;flex-shrink:0}
.item-del{width:30px;height:30px;border-radius:10px;background:transparent;border:1px solid transparent;color:var(--text4);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;opacity:0}
.item-row:hover .item-del{opacity:1}
.item-del:hover{background:var(--red-l);border-color:rgba(220,38,38,.2);color:var(--red)}

/* "⋮" menu button — replaces separate edit/delete icons on lecture/
   assignment cards; opens a small teleported menu (see .item-menu below). */
.item-menu-btn{width:32px;height:32px;border-radius:10px;background:transparent;border:1px solid transparent;color:var(--text4);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;flex-shrink:0}
.item-menu-btn:hover,.item-menu-btn.active{background:var(--surface2);color:var(--text1)}
.item-menu{position:fixed;z-index:1000;min-width:170px;padding:6px;background:var(--surface);border:1px solid var(--border);border-radius:16px;box-shadow:0 12px 32px rgba(0,0,0,.16),var(--sh-md);display:flex;flex-direction:column;transform-origin:top right;animation:itemMenuIn .16s cubic-bezier(.16,1,.3,1) both}
@keyframes itemMenuIn{from{opacity:0;transform:translateY(-6px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
.item-menu-item{display:flex;align-items:center;gap:10px;padding:10px 11px;border-radius:10px;background:none;border:none;font-size:13.5px;font-weight:600;color:var(--text2);text-align:left;cursor:pointer;transition:background .12s;font-family:inherit;width:100%}
.item-menu-item:hover{background:var(--surface2)}
.item-menu-item.danger{color:var(--red)}
.item-menu-item.danger:hover{background:var(--red-l)}
/* Edit form fields */
.edit-field{display:flex;flex-direction:column;gap:6px}
.field-label{font-size:11px;font-weight:700;color:var(--text4);letter-spacing:.07em}
.field-input{padding:10px 14px;border-radius:var(--r-md);border:1.5px solid var(--border);background:var(--surface2);color:var(--text1);font-size:14px;font-family:inherit;transition:border-color .15s;outline:none}
.field-input:focus{border-color:var(--teal);background:rgba(var(--teal-rgb),.04)}
.field-textarea{padding:10px 14px;border-radius:var(--r-md);border:1.5px solid var(--border);background:var(--surface2);color:var(--text1);font-size:14px;font-family:inherit;resize:vertical;transition:border-color .15s;outline:none}
.field-textarea:focus{border-color:var(--teal);background:rgba(var(--teal-rgb),.04)}
.edit-asg-files{display:flex;flex-direction:column;gap:4px}
.edit-asg-file{display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md)}
.eaf-name{flex:1;font-size:12px;font-weight:600;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.eaf-rm{width:20px;height:20px;border-radius:50%;background:var(--surface3);color:var(--text4);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;transition:all .15s}
.eaf-rm:hover{background:var(--red-l);color:var(--red)}
.edit-asg-ref-section{background:rgba(52,211,153,.05);border:1px solid rgba(52,211,153,.18);border-radius:var(--r-lg);padding:12px}
/* Criteria editing */
.btn-add-criterion{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--text2);background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-sm);padding:5px 12px;cursor:pointer;font-family:inherit;transition:all .15s}
.btn-add-criterion:hover{background:var(--surface3)}
.criteria-edit-list{display:flex;flex-direction:column;gap:10px}
.criterion-edit-row{display:flex;flex-direction:column;gap:8px;padding:12px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md)}
.criterion-edit-top{display:flex;gap:8px;align-items:center}
.criterion-name-inp{flex:1;min-width:0}
.criterion-pts{width:32px;flex-shrink:0;text-align:center;font-size:13px;font-weight:700;color:var(--teal)}
.criterion-del-btn{width:30px;height:38px;flex-shrink:0;border-radius:var(--r-sm);background:transparent;border:1px solid transparent;color:var(--text4);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
.criterion-del-btn:hover:not(:disabled){background:var(--red-l);border-color:rgba(220,38,38,.2);color:var(--red)}
.criterion-del-btn:disabled{opacity:.3;cursor:not-allowed}
.criteria-total{font-size:12px;color:var(--text4);text-align:right;padding-top:4px}
.item-preview-link{font-size:13px;font-weight:500;color:var(--text4);white-space:nowrap;cursor:pointer}
.item-preview-link:hover{color:var(--teal)}
.btn-continue-link{font-size:13px;font-weight:600;color:var(--teal);white-space:nowrap;cursor:pointer}
.btn-continue-link:hover{opacity:.8}
.btn-late{padding:7px 16px;border-radius:var(--r-md);background:var(--red);color:#fff;border:none;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;letter-spacing:.04em;transition:opacity .15s}
.btn-late:hover{opacity:.85}

/* Empty state */
.empty-state-card{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:56px 40px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-2xl);gap:6px;text-align:center}
.es-h{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:16.5px;font-weight:700;color:var(--text2)}
.es-p{font-size:13px;color:var(--text4);max-width:260px;line-height:1.5}

/* Sidebar cards */
.sidebar-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:18px}
/* Рейтинг — тёмная карточка с акцентом бренд-цвета (не сплошная заливка):
   тонкая цветная рамка/подсветка по краю + сам номер и прогресс-бары в
   акцентном цвете, а не просто белым по серому. */
.score-card{background:linear-gradient(135deg,#2c2c2e,#1c1c1e);border:1px solid rgba(var(--teal-rgb),.35);box-shadow:0 8px 22px rgba(var(--teal-rgb),.16);color:#fff}
.score-no-grades{font-size:12px;opacity:.7;margin-top:8px;font-style:italic}

.mobile-stats{display:none}
.ms-score{flex:1;min-width:140px;background:linear-gradient(135deg,#2c2c2e,#1c1c1e);border:1px solid rgba(var(--teal-rgb),.35);box-shadow:0 8px 22px rgba(var(--teal-rgb),.16);border-radius:var(--r-xl);padding:14px 16px;color:#fff}
.ms-deadline{flex:1;min-width:140px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:14px 16px}
.ms-score-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.ms-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;opacity:.8}
.ms-num{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:24px;font-weight:900;line-height:1}
.ms-denom{font-size:13px;font-weight:500;opacity:.7;margin-left:2px}
.ms-empty{font-size:11px;opacity:.7;font-style:italic;margin-top:4px}
.ms-bar-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.ms-bar-label{font-size:11px;opacity:.8}
.ms-bar-val{font-size:11px;font-weight:700}
.ms-bar{height:4px;background:rgba(255,255,255,.2);border-radius:4px;overflow:hidden}
.ms-bar-fill{height:100%;background:linear-gradient(90deg,var(--teal-h),var(--teal));border-radius:4px;transition:width .4s}
.ms-deadline .ms-label{color:var(--text4)}
.ms-deadline-row{display:flex;align-items:center;gap:10px;margin-top:8px}
.ms-date-box{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);padding:6px 10px;text-align:center;flex-shrink:0}
.ms-month{font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.05em}
.ms-day{font-size:20px;font-weight:900;color:var(--text1);font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;line-height:1.1}
.ms-deadline-title{font-size:13px;font-weight:600;color:var(--text1);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px}
.ms-deadline-rem{font-size:11px;color:var(--text4)}
.score-count{font-size:11px;opacity:.65;margin-top:8px}
.score-label{font-size:10px;font-weight:700;letter-spacing:.1em;opacity:.7;margin-bottom:8px}
.score-num{display:flex;align-items:baseline;gap:6px;margin-bottom:16px}
.score-big{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:52px;font-weight:900;line-height:1;color:var(--teal)}
.score-total{font-size:16px;font-weight:600;opacity:.8}
.score-pts{font-size:11px}
.score-progress-row{display:flex;justify-content:space-between;margin-bottom:6px}
.sp-label{font-size:10px;font-weight:700;letter-spacing:.06em;opacity:.7}
.sp-value{font-size:11px;font-weight:700}
.progress-bar{height:5px;background:rgba(255,255,255,.2);border-radius:100px;overflow:hidden;margin-bottom:4px}
.pb-fill{height:100%;background:linear-gradient(90deg,var(--teal-h),var(--teal));border-radius:100px;transition:width .5s ease}
.perf-fill{background:rgba(var(--teal-rgb),.55)}

/* Next deadline */
.next-deadline-label{font-size:10px;font-weight:700;color:var(--text4);letter-spacing:.1em;margin-bottom:12px}
.next-deadline-row{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px}
.deadline-date-box{width:48px;height:52px;border-radius:var(--r-md);background:var(--surface2);border:1px solid var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0}
.ddb-month{font-size:10px;font-weight:700;color:var(--text3);letter-spacing:.06em}
.ddb-day{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:22px;font-weight:900;color:var(--text1);line-height:1}
.deadline-title{font-size:13px;font-weight:700;color:var(--text1);margin-bottom:3px}
.deadline-remaining{font-size:11px;color:var(--text4)}

/* AI guide */
.ai-guide-head{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:var(--text3);margin-bottom:10px}
.ai-guide-body p{font-size:12px;color:var(--text4);line-height:1.6;margin-bottom:10px}
.ai-guide-link{font-size:12px;font-weight:700;color:var(--teal);background:none;border:none;cursor:pointer;padding:0;transition:opacity .15s}
.ai-guide-link:hover{opacity:.7}

@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}

@media (max-width:768px){
  .cd-page { overflow-x: hidden; max-width: 100vw; }
  .cd-sidebar{display:none}
  .cd-layout{flex-direction:column;overflow-x:hidden}
  .mobile-stats{display:flex;gap:10px;padding:10px 12px 0;flex-wrap:wrap}
  .cd-main{overflow-x:hidden;max-width:100%}
  .tabs-wrap{
    padding:8px 12px;
    overflow:hidden;
  }
  /* Без скролла: кнопки создания вынесены в шапку, вкладки помещаются целиком. */
  .tabs-bar{overflow-x:hidden;flex-wrap:nowrap}
  .tab-btn{white-space:nowrap;min-width:0}
  /* Кнопки создания — под строкой вкладок, во всю ширину на мобильном */
  .tab-action-bar{padding:8px 12px 12px;gap:8px}
  .quick-action-btn{min-height:44px;font-size:12px}
  .tab-content{padding:10px 12px 80px;overflow-x:hidden}
  /* Раньше отдельная полоса "Предметы › Название" над обложкой (высотой
     52px + safe-area) отделяла её от статус-бара/чёлки — теперь эту
     safe-area обложка отступает сама через padding-top, а высоту забирает
     себе (170+52), чтобы визуально "вырасти" в освободившееся место. */
  /* Fluid по ширине вьюпорта вместо одного фиксированного значения на все
     ширины 320–768: без обложки-фото 222px были почти пустым серым блоком
     на узких телефонах (см. apple-design: избегать фиксированных высот). */
  .page-header{padding:calc(14px + env(safe-area-inset-top, 0px)) 12px 12px;min-height:clamp(170px,34vw,230px)}
  .page-header .page-header-top{top:calc(14px + env(safe-area-inset-top, 0px));left:12px}
  .page-header-gear{top:calc(14px + env(safe-area-inset-top, 0px));right:12px}
  .page-title{font-size:20px}
  .item-row{padding:13px 14px;gap:12px}
  .item-icon{width:38px;height:38px}
  .item-title{font-size:14px}
  .item-desc{font-size:12px}
  .item-actions{gap:4px}
  .item-del{opacity:1;width:44px;height:44px}
  .item-menu-btn{width:44px;height:44px}
  /* Карточка сама кликабельна — на мобильном текст "Предпросмотр задания"
     лишний, как раньше была лишней кнопка "Открыть". */
  .item-preview-link{display:none}
  /* Заголовок ближайшего дедлайна обрезался эллипсисом в узкой колонке —
     переносим на 2 строки вместо жёсткого обрезания. */
  .ms-deadline-title{white-space:normal;overflow:hidden;text-overflow:ellipsis;max-width:none;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
  .field-input,.field-textarea{font-size:16px}
  .back-link{position:relative;display:inline-flex}
  .back-link::after{content:'';position:absolute;top:-14px;bottom:-14px;left:-6px;right:-6px}
}
/* Иконки/счётчики табов скрываем только на настоящих телефонных ширинах —
   на планшетных (~600–768) места достаточно, и без них таб выглядел
   полупустым (см. apple-design: избегать неестественно широких пустых зон). */
@media (max-width:599px){
  .tab-btn{gap:0}
  .tab-btn svg{display:none}
  .tab-num{display:none}
}
@media (max-width:480px){
  .tab-btn{padding:0 3px}
  .tab-content{padding:8px 10px 80px}
  .item-row{padding:12px 10px;gap:10px}
  .page-title{font-size:18px}
}

/* Empty state icon */
.es-icon-wrap{width:64px;height:64px;border-radius:18px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--text3);margin-bottom:4px;opacity:.8}
</style>
