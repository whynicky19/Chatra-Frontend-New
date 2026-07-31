<template>
  <div class="cd-page">

    <!-- Loading -->
    <div v-if="loading" class="full-load">
      <div class="spin-ring"></div>
    </div>

    <template v-else>
      <!-- ══ Topbar — simplified ══ -->
      <div class="cd-topbar">
        <div class="cd-topbar-left">
          <div class="topbar-breadcrumb">
            <NuxtLink to="/" class="bc-link">{{ t('nav.classes') }}</NuxtLink>
            <span class="bc-sep">›</span>
            <span class="bc-cur">{{ classMeta.subject || classTitle }}</span>
          </div>
        </div>
      </div>

      <!-- ══ Main layout ══ -->
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

          <!-- Tabs -->
          <div class="tabs-wrap">
            <div class="tabs-bar">
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
               they apply to (never on AI chat). -->
          <div class="tab-action-bar" v-if="canManage && ['lectures','assignments'].includes(tab)">
            <button class="btn btn-white btn-sm" @click="showCreateAssignment = true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
              {{ t('class.assignment_btn') }}
            </button>
            <button class="btn btn-teal btn-sm" @click="showCreate = true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
              {{ t('class.add') }}
            </button>
          </div>

          <!-- Read-only notice for archived students -->
          <div v-if="isArchivedForUser" class="archive-notice">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            {{ t('cohort.readonly_notice') }}
          </div>

          <!-- Рейтинг и дедлайн для студентов — только мобайл, только во вкладке
               «Задания» (единое размещение с приложением, где рейтинг встроен в неё). -->
          <div v-if="!isTeacher && tab === 'assignments'" class="mobile-stats">
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
                <div v-for="p in lectures" :key="p.id" class="item-row" @click="viewPost(p, 'lecture')">
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
                  <div v-for="a in assignments" :key="a.id" class="item-row assignment-item" @click="openAssignment(a)">
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
                      <button v-if="!isTeacher && isLate(a)" class="btn-late" @click.stop="openAssignment(a)">{{ t('class.submit_late') }}</button>
                      <span v-else-if="!isTeacher && isInProgress(a)" class="btn-continue-link" @click.stop="openAssignment(a)">{{ t('class.continue') }}</span>
                      <span v-else-if="!isTeacher" class="item-preview-link" @click.stop="openAssignment(a)">{{ t('class.preview') }}</span>
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

        <!-- Right sidebar -->
        <div class="cd-sidebar" v-if="tab !== 'ai'">
          <!-- Score card — студентам, только во вкладке «Задания» (единое
               размещение с приложением: рейтинг живёт рядом с заданиями). -->
          <div class="sidebar-card score-card" v-if="!isTeacher && tab === 'assignments'">
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

          <!-- AI learning guide -->
          <div class="sidebar-card" v-if="!isArchivedForUser">
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
    <LazyCreatePostModal v-if="showCreate" :class-id="classId" @close="showCreate = false" @created="onPostCreated" />
    <LazyCreateAssignmentModal v-if="showCreateAssignment" :class-id="classId" @close="showCreateAssignment = false" @created="onAssignmentCreated" />
    <LazyAssignmentModal v-if="activeAssignment" :assignment="activeAssignment" :is-teacher="isTeacher" :readonly="isArchivedForUser" :cohort-id="teacherViewCohortId" @close="activeAssignment = null" @submitted="onSubmitted" />

    <!-- Class info hub — code, regenerate code, academic-year picker,
         entry point to rotation settings. Single gear button on the cover
         opens this instead of crowding the cover with separate buttons. -->
    <div v-if="showClassInfo" class="overlay" @click.self="showClassInfo=false">
      <div class="modal anim-scale class-info-modal" style="max-width:420px;width:100%">
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

    <!-- Class settings (rotation mode) — owner/admin -->
    <div v-if="showSettings" class="overlay" @click.self="showSettings=false">
      <div class="modal anim-scale" style="max-width:440px;width:100%">
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

    <!-- Edit Post Modal -->
    <div v-if="editingPost" class="overlay" @click.self="editingPost=null">
      <div class="modal anim-scale" style="max-width:520px;width:100%">
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

    <!-- Edit Assignment Modal -->
    <div v-if="editingAssignment" class="overlay" @click.self="editingAssignment=null">
      <div class="modal anim-scale" style="max-width:520px;width:100%">
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
          <div v-if="editAsgFiles.length" class="edit-field">
            <label class="field-label">{{ lang==='ru'?'ПРИКРЕПЛЁННЫЕ ФАЙЛЫ':'ATTACHED FILES' }}</label>
            <div class="edit-asg-files">
              <div v-for="(f, i) in editAsgFiles" :key="f.url" class="edit-asg-file">
                <span class="eaf-name">{{ f.name }}</span>
                <button class="eaf-rm" :title="lang==='ru'?'Удалить файл':'Remove file'" @click="editAsgFiles.splice(i,1)">×</button>
              </div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div class="edit-field">
              <label class="field-label">{{ lang==='ru'?'МАКС. БАЛЛ':'MAX SCORE' }}</label>
              <input v-model.number="editAsgForm.max_score" type="number" class="field-input" min="1" max="1000"/>
            </div>
            <div class="edit-field">
              <label class="field-label">{{ lang==='ru'?'ДЕДЛАЙН':'DEADLINE' }}</label>
              <input v-model="editAsgForm.deadline" type="datetime-local" class="field-input"/>
            </div>
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
                  <input v-model.number="c.weight" type="number" class="field-input criterion-weight-inp" min="1" :placeholder="lang==='ru'?'Вес':'Weight'"/>
                  <button class="criterion-del-btn" @click="removeCriterion(i)" :disabled="editAsgForm.criteria.length <= 1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <input v-model="c.description" class="field-input" :placeholder="lang==='ru'?'Описание критерия (необязательно)...':'Criterion description (optional)...'"/>
              </div>
            </div>
            <div class="criteria-total">
              {{ lang==='ru'?'Сумма весов:':'Total weight:' }}
              <strong :style="{color: editAsgWeightTotal === editAsgForm.max_score ? 'var(--teal)' : 'var(--red)'}">
                {{ editAsgWeightTotal }}
              </strong>
              / {{ editAsgForm.max_score }}
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

    <!-- Post viewer -->
    <div v-if="viewingPost" class="post-overlay" @click.self="viewingPost = null">
      <div class="post-sheet anim-scale">
        <div class="sheet-head">
          <div class="sheet-badge lecture">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            {{ t('class.lecture_badge') }}
          </div>
          <button class="btn btn-icon btn-ghost" @click="viewingPost = null">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <h2 class="sheet-title">{{ cleanTitle(viewingPost.title) }}</h2>
        <div class="sheet-date">{{ fmtDate(viewingPost.created_at) }}</div>
        <div class="sheet-body" v-html="renderBody(getFullBody(viewingPost))" @click="onBodyClick"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from '#app'
import { useToast } from '~/composables/useToast'
import { usePostsSvc } from '~/services/posts'
import { useAssignmentsSvc } from '~/services/assignments'
import { parseUtc } from '~/composables/useDeadline'
import { useRatingSvc } from '~/services/rating'
import { useClassesSvc, type CohortResponse, type RotationMode } from '~/services/classes'
import { useAuthStore } from '~/stores/auth.store'
import { useI18n } from '~/composables/useI18n'
import { useFilePreview } from '~/composables/useFilePreview'
import { fixFileUrl } from '~/composables/useFileUrl'
import { extractFilesFromText, stripFilesFromText } from '~/composables/useAttachments'
import type { Assignment, Submission } from '~/services/assignments'

definePageMeta({ layout: 'default' })

const route = useRoute()
const postsSvc = usePostsSvc()
const assignmentsSvc = useAssignmentsSvc()
const ratingSvc = useRatingSvc()
const classesSvc = useClassesSvc()
const toast = useToast()
const auth = useAuthStore()
const { t, lang } = useI18n()
const { openPreview } = useFilePreview()

const classId = computed(() => Number(route.params.id))
const isTeacher = computed(() => auth.user?.role === 'teacher' || auth.user?.role === 'admin')

const loading = ref(true)
const tab = ref<'lectures' | 'assignments' | 'ai'>('lectures')

// Cover collapses smoothly on scroll — only inside the AI chat tab (see the
// LazyClassAiChat @scroll-state listener below). Reset whenever the tab changes.
const coverCollapsed = ref(false)
watch(tab, () => { coverCollapsed.value = false })
const showCreate = ref(false)
const showCreateAssignment = ref(false)
const viewingPost = ref<any>(null)
const activeAssignment = ref<Assignment | null>(null)
const allPosts = ref<any[]>([])
const assignments = ref<Assignment[]>([])
const mySubmissions = ref<Submission[]>([])

const editingPost = ref<any>(null)
const editPostForm = ref({ title: '', content: '' })
const editPostSaving = ref(false)

const editingAssignment = ref<any>(null)
const editAsgForm = ref<{ title: string; description: string; max_score: number; deadline: string; criteria: Array<{name:string;weight:number;description:string}> }>({ title: '', description: '', max_score: 100, deadline: '', criteria: [] })
// Файлы задания живут в description как URL — в форме показываем чипами, а не текстом
const editAsgFiles = ref<{ name: string; url: string }[]>([])
const editAsgSaving = ref(false)
const loadingAssignments = ref(false)
const editAsgWeightTotal = computed(() => editAsgForm.value.criteria.reduce((s, c) => s + Number(c.weight), 0))
const canSaveEditAssignment = computed(() =>
  editAsgForm.value.title.trim() &&
  editAsgForm.value.criteria.length > 0 &&
  editAsgForm.value.criteria.every(c => c.name.trim() && c.weight > 0) &&
  editAsgWeightTotal.value === editAsgForm.value.max_score
)

const ratingData = ref({ avg_score: 0, avg_percent: 0, graded_count: 0, total_score: 0, max_possible: 0 })
const loadingRating = ref(false)
const assignmentsLoaded = ref(false)

const currentClass = ref<any>(null)
const classMeta = computed(() => currentClass.value ?? {})
// true только для ученика архивного потока — класс доступен только для чтения.
const isArchivedForUser = computed(() => !!currentClass.value?.is_archived_for_user)

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
// Лекции — в порядке "1, 2, 3..." (posts.position с бэкенда, см. migrations/017),
// а не "новые сверху" (id.desc() из /posts без class_id) — иначе список лекций
// и нумерация в AI-чате расходятся с фактическим порядком курса.
const lectures = computed(() => classPosts.value
  .filter(p => p.title?.startsWith('[LECTURE]'))
  .slice()
  .sort((a, b) => {
    const pa = a.position ?? Infinity, pb = b.position ?? Infinity
    if (pa !== pb) return pa - pb
    return (a.id ?? 0) - (b.id ?? 0)
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

const cleanTitle = (t: string) => t.replace(/^\[LECTURE\]\[\d+\]\s*/, '').trim()
const fmtDate = (d: string) => { if (!d) return ''; try { return parseUtc(d).toLocaleDateString(lang.value === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return d } }
// Файл из тела-JSON приложения приходит как "<url>#<имя>" (или битые легаси-строки).
// Приводим к единому виду вложения сайта: 📎 [имя](url).
const fileEntryToLink = (entry: any): string => {
  if (typeof entry !== 'string' || !entry.trim()) return ''
  if (/^https?:\/\//i.test(entry)) {
    const hash = entry.indexOf('#')
    if (hash !== -1) {
      const url = entry.slice(0, hash)
      let name = entry.slice(hash + 1)
      try { name = decodeURIComponent(name) } catch {}
      return `📎 [${name}](${url})`
    }
    return entry // голый URL — renderBody сам оформит
  }
  // Не-URL (легаси/битые данные): показываем только имя, без сырого JSON
  return entry.split('\n').pop()?.trim() || ''
}
// Понимает оба формата тела поста: текст сайта (📎-ссылки) и JSON приложения
// {content, files:[...]}. Никогда не возвращает сырой JSON.
const getFullBody = (p: any): string => {
  const raw = p?.body || ''
  try {
    const b = JSON.parse(raw)
    if (b && typeof b === 'object') {
      let text = (typeof b.content === 'string' ? b.content : (b.description || '')) || ''
      const files = Array.isArray(b.files) ? b.files : []
      if (files.length) {
        const links = files.map(fileEntryToLink).filter(Boolean).join('\n')
        if (links) text = text ? `${text}\n\n${links}` : links
      }
      return text
    }
    return raw
  } catch { return raw }
}
const ATTACHMENT_LINK = /📎\s*\[([^\]]+)\]\(([^)]+)\)/g
const getPreview = (p: any): string => { const body = getFullBody(p); const clean = body.replace(ATTACHMENT_LINK, '').replace(/(https?:\/\/[^\s]+)/g, '').replace(/\s+/g, ' ').trim(); return clean.length > 100 ? clean.slice(0, 100) + '…' : clean || (lang.value==='ru'?'Нет описания':'No description') }
const FILE_EXT = /\.(pdf|doc|docx|txt|ppt|pptx|xls|xlsx|png|jpg|jpeg|gif|webp|md)(\?[^\s]*)?/i
// Пробел в URL допустим (оригинальное имя файла в пути) — границу задают
// кавычки/спецсимволы JSON, а не whitespace, иначе файлы с пробелом в имени
// (напр. "Lection 1.pptx") не считались бы вложениями.
const countFiles = (p: any): number => { const body = p.body || ''; const m = body.match(new RegExp(`https?://[^\\n"'<>]+${FILE_EXT.source}`, 'gi')); return m?.length || 0 }
const pluralFile = (n: number) => lang.value === 'ru' ? (n === 1 ? 'файл' : n < 5 ? 'файла' : 'файлов') : 'file' + (n !== 1 ? 's' : '')
const getFileIcon = (url: string) => { const e = url.split('.').pop()?.split('?')[0]?.toLowerCase() || ''; if (e === 'pdf') return 'PDF'; if (['doc','docx','txt','md'].includes(e)) return 'DOC'; if (['xls','xlsx'].includes(e)) return 'XLS'; if (['ppt','pptx'].includes(e)) return 'PPT'; if (['png','jpg','jpeg','gif','webp'].includes(e)) return 'IMG'; return 'FILE' }
const getFileName = (url: string) => { try { return decodeURIComponent(new URL(url).pathname.split('/').pop() || url) } catch { return url.slice(-50) } }
const attrEscape = (s: string) => s.replace(/"/g,'&quot;')
// Полное HTML-экранирование — для сырых данных (имя файла из URL).
const htmlEscape = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
// safeName ДОЛЖЕН быть уже экранирован вызывающим; url экранируем для атрибутов
// (иначе кавычка в URL вложения ломала бы href → XSS).
const fileAnchor = (url: string, safeName: string) => {
  const safeUrl = attrEscape(url)
  return `<a href="${safeUrl}" data-preview-url="${safeUrl}" data-preview-name="${safeName}" rel="noopener" class="file-attachment"><span class="file-type-badge">${getFileIcon(url)}</span><span>${safeName}</span></a>`
}
const renderBody = (text: string): string => {
  if (!text) return ''
  const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  // Один проход: и 📎-вложения, и голые ссылки. String.replace не пересканирует
  // вставленную разметку, поэтому сгенерированные <a> не оборачиваются повторно
  // (иначе URL из href/data-preview-* распознавался как новая ссылка → битый HTML).
  // URL внутри скобок 📎-вложения может содержать пробелы (оригинальное имя
  // файла в пути, напр. "Lection 1.pptx") — границу задают сами скобки
  // markdown-ссылки, поэтому пробел из группы не исключаем, только ')'.
  const combined = /📎\s*\[([^\]]+)\]\((https?:\/\/[^)]+)\)|(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g
  return escaped.replace(combined, (_m, name, attUrl, bareUrl) => {
    // name из attachment-формата уже прошёл &<>-экранирование (в `escaped`) —
    // добавляем только кавычку. bareUrl-имя (getFileName) сырое → полный escape.
    if (attUrl) return fileAnchor(attUrl, attrEscape(name))
    if (FILE_EXT.test(bareUrl)) return fileAnchor(bareUrl, htmlEscape(getFileName(bareUrl)))
    return `<a href="${attrEscape(bareUrl)}" target="_blank" rel="noopener" class="link-inline">${bareUrl}</a>`
  }).replace(/\n/g,'<br>')
}
const onBodyClick = (e: MouseEvent) => {
  const target = (e.target as HTMLElement)?.closest('[data-preview-url]') as HTMLElement | null
  if (!target) return
  e.preventDefault()
  openPreview(target.dataset.previewUrl!, target.dataset.previewName!)
}

const classCode = computed(() => currentClass.value?.invite_code || '')
const copyCode = () => { navigator.clipboard?.writeText(classCode.value).then(() => toast.ok(t('class.code_copied') + ' ' + classCode.value)).catch(() => toast.ok(t('class.code') + ' ' + classCode.value)) }

const regeneratingCode = ref(false)
const regenerateCode = async () => {
  if (regeneratingCode.value) return
  if (!confirm(t('class.regenerate_confirm'))) return
  regeneratingCode.value = true
  try {
    const newCode = await classesSvc.regenerateCode(classId.value)
    if (currentClass.value) currentClass.value.invite_code = newCode
    toast.ok(t('class.regenerate_ok') + ' ' + newCode)
  } catch (e: any) {
    toast.err(e?.response?.data?.detail || t('class.regenerate_failed'))
  } finally {
    regeneratingCode.value = false
  }
}

const viewPost = (p: any, type: string) => { viewingPost.value = { ...p, type } }
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
  let content = ''
  try { const b = JSON.parse(p.body); content = b.content || b.description || '' } catch { content = p.body || '' }
  const rawTitle = p.title || ''
  const cleanedTitle = rawTitle.replace(/^\[LECTURE\]\[\d+\]\s*/, '').trim()
  editPostForm.value = { title: cleanedTitle, content }
}

const saveEditPost = async () => {
  if (!editingPost.value) return
  editPostSaving.value = true
  try {
    const p = editingPost.value
    let body: any = {}
    try { body = JSON.parse(p.body) } catch {}
    body.content = editPostForm.value.content
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
  let criteria: Array<{name:string;weight:number;description:string}> = []
  try { criteria = JSON.parse(a.criteria || '[]') } catch {}
  if (!criteria.length) criteria = [{ name: '', weight: 10, description: '' }]
  editAsgFiles.value = extractFilesFromText(a.description)
  editAsgForm.value = { title: a.title || '', description: stripFilesFromText(a.description), max_score: a.max_score || 100, deadline: dl, criteria }
}

const addCriterion = () => { editAsgForm.value.criteria.push({ name: '', weight: 10, description: '' }) }
const removeCriterion = (i: number) => { if (editAsgForm.value.criteria.length > 1) editAsgForm.value.criteria.splice(i, 1) }

const saveEditAssignment = async () => {
  if (!editingAssignment.value || !canSaveEditAssignment.value) return
  editAsgSaving.value = true
  try {
    // Пришиваем сохранённые файлы обратно в description (бэкенд не хранит file_urls у заданий)
    const fileLines = editAsgFiles.value.map(f => f.url).join('\n')
    const descWithFiles = [stripFilesFromText(editAsgForm.value.description), fileLines].filter(Boolean).join('\n')
    const updated = await assignmentsSvc.update(editingAssignment.value.id, {
      title: editAsgForm.value.title,
      description: descWithFiles,
      max_score: editAsgForm.value.max_score,
      deadline: editAsgForm.value.deadline ? new Date(editAsgForm.value.deadline).toISOString() : undefined,
      criteria: editAsgForm.value.criteria,
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
const openAssignment = (a: Assignment) => { activeAssignment.value = a }
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
const onSubmitted = (sub: Submission | null) => {
  if (!sub) {
    // Отзыв сдачи: AssignmentModal эмитит null (см. retract()), сдачи для
    // этого задания больше нет — убираем её из списка по открытому заданию.
    if (activeAssignment.value) {
      const idx = mySubmissions.value.findIndex(s => s.assignment_id === activeAssignment.value!.id)
      if (idx !== -1) mySubmissions.value.splice(idx, 1)
    }
    loadRating()
    return
  }
  const idx = mySubmissions.value.findIndex(s => s.assignment_id === sub.assignment_id)
  if (idx !== -1) mySubmissions.value[idx] = sub; else mySubmissions.value.push(sub)
  loadRating()
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

  loading.value = true
  try {
    const [cls, posts] = await Promise.all([classesSvc.get(classId.value), postsSvc.list()])
    currentClass.value = cls
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

/* Topbar */
.cd-topbar{display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:52px;background:var(--surface);border-bottom:1px solid var(--border);flex-shrink:0}
.cd-topbar-left{display:flex;align-items:center;gap:10px;flex:1;min-width:0}
.topbar-logo{display:flex;align-items:center}.topbar-logo-img{width:80px;height:auto;object-fit:contain}.topbar-logo-icon{width:30px;height:30px;border-radius:7px;background:rgba(var(--teal-rgb),.08);border:1px solid rgba(var(--teal-rgb),.15);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.topbar-brand{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:800;color:var(--teal);letter-spacing:.1em;flex-shrink:0}
.topbar-search{display:flex;align-items:center;gap:7px;padding:6px 14px;background:var(--surface2);border:1px solid var(--border);border-radius:100px;font-size:12px;color:var(--text4);cursor:pointer;flex-shrink:0}
.topbar-breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text4);overflow:hidden}
.bc-link{color:var(--text4);transition:color .15s}.bc-link:hover{color:var(--teal)}
.bc-sep{color:var(--text4);font-size:10px}
.bc-cur{color:var(--teal);font-weight:600;letter-spacing:.04em;font-size:11px}
.cd-topbar-nav{display:flex;align-items:center;gap:0;flex-shrink:0}
.topbar-tab{padding:0 18px;height:52px;font-size:13px;font-weight:500;color:var(--text4);background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:all .15s;white-space:nowrap}
.topbar-tab:hover{color:var(--text1)}
.topbar-tab.active{color:var(--teal);border-bottom-color:var(--teal);font-weight:600}
.icon-btn2{width:32px;height:32px;border-radius:50%;background:var(--surface2);border:1px solid var(--border);color:var(--text3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
.icon-btn2:hover{border-color:var(--border2);color:var(--teal)}

/* Layout */
.cd-layout{display:flex;flex:1;overflow:hidden;gap:0}
.cd-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.cd-sidebar{width:300px;flex-shrink:0;border-left:1px solid var(--border);padding:20px 18px;overflow-y:auto;display:flex;flex-direction:column;gap:14px;background:var(--surface)}

/* Page header — collapses smoothly on scroll (min-height/opacity/padding all
   animated) to free up room for the interface underneath. */
.page-header{padding:20px 24px 16px;flex-shrink:0;position:relative;overflow:hidden;border-radius:0;min-height:220px;max-height:500px;display:flex;flex-direction:column;justify-content:flex-end;transition:min-height .38s cubic-bezier(.4,0,.2,1),max-height .38s cubic-bezier(.4,0,.2,1),padding .38s cubic-bezier(.4,0,.2,1),opacity .25s ease;will-change:min-height,max-height}
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

/* Tabs */
.tabs-wrap{flex-shrink:0;background:var(--surface);border-bottom:1px solid var(--border)}
.tabs-bar{display:flex;align-items:center;padding:0 24px;gap:0}
.tab-btn{display:flex;align-items:center;gap:8px;padding:14px 18px;font-size:13px;font-weight:500;color:var(--text4);background:transparent;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:all .15s;white-space:nowrap;font-family:inherit}
.tab-btn:hover{color:var(--text1)}
.tab-btn.active{color:var(--teal);border-bottom-color:var(--teal);font-weight:600}
.tab-ai.active{color:var(--teal)}
.tab-num{font-size:11px;font-weight:700;background:var(--surface2);color:var(--text3);padding:2px 8px;border-radius:100px}

/* Teacher create actions — below the tabs row (never inside the cover) */
.tab-action-bar{display:flex;align-items:center;gap:8px;padding:12px 24px;flex-shrink:0;border-bottom:1px solid var(--border);background:var(--surface)}

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
/* Criteria editing */
.btn-add-criterion{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--text2);background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-sm);padding:5px 12px;cursor:pointer;font-family:inherit;transition:all .15s}
.btn-add-criterion:hover{background:var(--surface3)}
.criteria-edit-list{display:flex;flex-direction:column;gap:10px}
.criterion-edit-row{display:flex;flex-direction:column;gap:8px;padding:12px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md)}
.criterion-edit-top{display:flex;gap:8px;align-items:center}
.criterion-name-inp{flex:1;min-width:0}
.criterion-weight-inp{width:80px;flex-shrink:0;text-align:center}
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
.score-card{background:linear-gradient(135deg,#2c2c2e,#1c1c1e);border:none;color:#fff}
.score-no-grades{font-size:12px;opacity:.7;margin-top:8px;font-style:italic}

.mobile-stats{display:none}
.ms-score{flex:1;min-width:140px;background:linear-gradient(135deg,#2c2c2e,#1c1c1e);border-radius:var(--r-xl);padding:14px 16px;color:#fff}
.ms-deadline{flex:1;min-width:140px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:14px 16px}
.ms-score-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.ms-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;opacity:.8}
.ms-num{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:24px;font-weight:900;line-height:1}
.ms-denom{font-size:13px;font-weight:500;opacity:.7;margin-left:2px}
.ms-empty{font-size:11px;opacity:.7;font-style:italic;margin-top:4px}
.ms-bar-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.ms-bar-label{font-size:11px;opacity:.8}
.ms-bar-val{font-size:11px;font-weight:700}
.ms-bar{height:4px;background:rgba(255,255,255,.25);border-radius:4px;overflow:hidden}
.ms-bar-fill{height:100%;background:#fff;border-radius:4px;transition:width .4s}
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
.score-big{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:52px;font-weight:900;line-height:1}
.score-total{font-size:16px;font-weight:600;opacity:.8}
.score-pts{font-size:11px}
.score-progress-row{display:flex;justify-content:space-between;margin-bottom:6px}
.sp-label{font-size:10px;font-weight:700;letter-spacing:.06em;opacity:.7}
.sp-value{font-size:11px;font-weight:700}
.progress-bar{height:5px;background:rgba(255,255,255,.2);border-radius:100px;overflow:hidden;margin-bottom:4px}
.pb-fill{height:100%;background:#fff;border-radius:100px;transition:width .5s ease}
.perf-fill{background:rgba(255,255,255,.8)}

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

/* Post viewer */
.post-overlay{position:fixed;inset:0;background:rgba(0,30,36,.6);display:flex;align-items:center;justify-content:center;z-index:1000;padding:24px;backdrop-filter:blur(4px)}
.post-sheet{background:var(--surface);border:1px solid var(--border2);border-radius:var(--r-2xl);padding:30px;width:100%;max-width:640px;max-height:88vh;overflow-y:auto;box-shadow:var(--sh-lg)}
.sheet-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.sheet-badge{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;padding:5px 14px;border-radius:100px}
.sheet-badge.lecture{background:var(--surface2);color:var(--text2);border:1px solid var(--border)}
.sheet-title{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:24px;font-weight:900;color:var(--text1);letter-spacing:-.025em;margin-bottom:6px}
.sheet-date{font-size:12px;color:var(--text4);margin-bottom:22px}
.sheet-body{font-size:14px;color:var(--text2);line-height:1.8;white-space:pre-wrap}
:deep(.file-attachment){display:inline-flex;align-items:center;gap:9px;padding:11px 16px;margin:6px 4px;max-width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-lg);color:var(--text2);font-size:13px;font-weight:600;text-decoration:none;transition:all .18s}
:deep(.file-attachment:hover){background:var(--surface3);transform:translateY(-1px)}
/* Полное имя файла всегда видно — переносится на новую строку вместо
   обрезки многоточием (раньше max-width:280px+ellipsis резал длинные имена). */
:deep(.file-attachment span){white-space:normal;word-break:break-word;overflow-wrap:anywhere}
:deep(.link-inline){color:var(--teal);text-decoration:underline;text-underline-offset:3px;word-break:break-all}
.anim-scale{animation:scaleIn .2s ease both}
@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}

@media (max-width:768px){
  .cd-page { overflow-x: hidden; max-width: 100vw; }
  .cd-topbar{
    padding:env(safe-area-inset-top, 0px) 12px 0;
    height:calc(52px + env(safe-area-inset-top, 0px));
  }
  .topbar-breadcrumb{max-width:160px;overflow:hidden}
  .cd-sidebar{display:none}
  .cd-layout{flex-direction:column;overflow-x:hidden}
  .mobile-stats{display:flex;gap:10px;padding:10px 12px 0;flex-wrap:wrap}
  .cd-main{overflow-x:hidden;max-width:100%}
  .tabs-wrap{
    overflow:hidden;
  }
  /* Без скролла: кнопки создания вынесены в шапку, вкладки помещаются целиком.
     Иконки скрыты на мобильном — остаётся только подпись, чтобы не обрезалось. */
  .tabs-bar{padding:0 4px;overflow-x:hidden;flex-wrap:nowrap}
  .tab-btn{flex:1;justify-content:center;padding:12px 4px;font-size:12px;white-space:nowrap;min-width:0;min-height:44px;gap:0}
  .tab-btn svg{display:none}
  .tab-num{display:none}
  /* Кнопки создания — под строкой вкладок, во всю ширину на мобильном */
  .tab-action-bar{padding:10px 12px;gap:8px}
  .tab-action-bar .btn{flex:1;justify-content:center;min-height:44px;font-size:12px}
  .tab-content{padding:10px 12px 80px;overflow-x:hidden}
  .page-header{padding:14px 12px 12px;min-height:170px}
  .page-header .page-header-top{top:14px;left:12px}
  .page-header-gear{top:14px;right:12px}
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
  .post-sheet{padding:12px 16px calc(28px + env(safe-area-inset-bottom, 0px));border-radius:28px 28px 0 0;max-height:92dvh}
  .post-sheet::before{content:'';display:block;width:36px;height:5px;border-radius:3px;background:var(--surface3);margin:0 auto 16px}
  .post-overlay{padding:0;align-items:flex-end}
  .sheet-title{font-size:20px}
  .field-input,.field-textarea{font-size:16px}
  .back-link,.bc-link{position:relative;display:inline-flex}
  .back-link::after,.bc-link::after{content:'';position:absolute;top:-14px;bottom:-14px;left:-6px;right:-6px}
}
@media (max-width:480px){
  .tab-btn{font-size:11px;padding:11px 3px;letter-spacing:-.01em}
  .tab-content{padding:8px 10px 80px}
  .item-row{padding:12px 10px;gap:10px}
  .page-title{font-size:18px}
}

/* Empty state icon */
.es-icon-wrap{width:64px;height:64px;border-radius:18px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--text3);margin-bottom:4px;opacity:.8}

/* File type badge in rendered content */
:deep(.file-type-badge){display:inline-flex;align-items:center;justify-content:center;background:var(--teal);color:#fff;font-size:9px;font-weight:800;letter-spacing:.06em;padding:2px 6px;border-radius:4px;flex-shrink:0;line-height:1.4}
</style>
