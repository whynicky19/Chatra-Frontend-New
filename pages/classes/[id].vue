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
        <div class="cd-topbar-right">
          <div class="topbar-user-av">
            <img v-if="auth.avatar" :src="auth.avatar" class="tav-img"/>
            <div v-else class="tav-init">{{ uInit }}</div>
          </div>
        </div>
      </div>

      <!-- ══ Main layout ══ -->
      <div class="cd-layout">
        <!-- Left content -->
        <div class="cd-main">
          <!-- Page header with cover image -->
          <div class="page-header" :style="heroStyle">
            <div class="page-header-overlay" v-if="classMeta.cover_image"></div>
            <div class="page-header-top">
              <NuxtLink to="/" class="back-link" :class="{'back-link-dark': classMeta.cover_image}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                {{ t('nav.classes') }}
              </NuxtLink>
              <span class="header-sep" :class="{'sep-dark': classMeta.cover_image}">›</span>
              <span class="header-subject" :class="{'subject-dark': classMeta.cover_image}">{{ (classMeta.subject || '').toUpperCase() }}</span>
            </div>
            <div class="page-header-body">
              <div class="page-title-row">
                <h1 class="page-title" :class="{'title-dark': classMeta.cover_image}">{{ classTitle }}</h1>
                <span v-if="isArchivedForUser" class="header-archive-badge">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                  {{ t('cohort.archived_badge') }}
                </span>
              </div>
              <p class="page-sub" :class="{'sub-dark': classMeta.cover_image}">{{ classMeta.description || classMeta.period || '' }}</p>
            </div>
            <!-- Code chip — only visible to those who can see the invite code (creator/admin) -->
            <div class="class-code-row" v-if="classCode">
              <div class="class-code-chip" @click="copyCode" :title="lang==='ru'?'Нажмите чтобы скопировать код':'Click to copy code'">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                {{ lang==='ru' ? 'Код класса:' : 'Class code:' }}
                <strong>{{ classCode }}</strong>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:.6"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2"/><rect x="8" y="8" width="12" height="12" rx="2"/></svg>
              </div>
            </div>

            <!-- Teacher/admin cohort controls: academic-year picker + class settings -->
            <div class="class-cohort-row" v-if="isOwnerOrAdmin">
              <div v-if="isYearly && cohorts.length > 1" class="year-picker">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span class="year-picker-label">{{ t('cohort.academic_year') }}</span>
                <select class="year-select" :value="selectedCohortId ?? ''" @change="onCohortChange($event)">
                  <option v-for="c in cohorts" :key="c.id" :value="c.id">
                    {{ c.academic_year }}{{ c.status === 'active' ? ` (${t('cohort.active')})` : '' }}
                  </option>
                </select>
              </div>
              <button class="class-settings-btn" @click="openSettings" :title="t('cohort.settings')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              </button>
            </div>

            <!-- Notice when teacher is viewing a past (archived) cohort -->
            <div v-if="viewingArchiveCohort" class="cohort-view-notice">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              {{ t('cohort.viewing_archive') }}
            </div>

            <!-- Teacher create actions — moved out of the tab bar so tabs never overflow -->
            <div class="header-actions" v-if="canManage">
              <button class="btn btn-white btn-sm" @click="showCreateAssignment = true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                {{ t('class.assignment_btn') }}
              </button>
              <button class="btn btn-teal btn-sm" @click="showCreate = true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                {{ t('class.add') }}
              </button>
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
              <button :class="['tab-btn', { active: tab === 'materials' }]" @click="tab = 'materials'">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                {{ t('class.materials') }}
                <span v-if="materials.length" class="tab-num">{{ materials.length }}</span>
              </button>
              <button :class="['tab-btn', { active: tab === 'assignments' }]" @click="tab = 'assignments'; loadAssignments()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                {{ t('class.assignments') }}
                <span v-if="assignments.length" class="tab-num">{{ assignments.length }}</span>
              </button>
              <button :class="['tab-btn', { active: tab === 'avatar' }]" @click="tab = 'avatar'; loadAvatarLectures()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0116 0v1"/></svg>
                {{ lang==='ru'?'Аватар':lang==='kk'?'Аватар':'Avatar' }}
                <span v-if="avatarLectures.length" class="tab-num">{{ avatarLectures.length }}</span>
              </button>
              <button v-if="!isArchivedForUser" :class="['tab-btn tab-ai', { active: tab === 'ai' }]" @click="tab = 'ai'; loadAssignments()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                {{ t('class.ai_chat') }}
              </button>
            </div>
          </div>

          <!-- Read-only notice for archived students -->
          <div v-if="isArchivedForUser" class="archive-notice">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            {{ t('cohort.readonly_notice') }}
          </div>

          <!-- Рейтинг и дедлайн для студентов — только мобайл -->
          <div v-if="!isTeacher && tab !== 'ai' && tab !== 'avatar'" class="mobile-stats">
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
              <div class="content-header">
                <h2 class="content-heading">{{ t('class.lectures') }}</h2>
              </div>
              <div v-if="!lectures.length" class="empty-state-card">
                <div class="es-icon-wrap"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg></div>
                <div class="es-h">{{ t('class.no_lectures') }}</div>
                <div class="es-p">{{ isTeacher ? t('class.no_lectures_teacher') : t('class.no_lectures_student') }}</div>
              </div>
              <div v-else class="items-list">
                <div v-for="p in lectures" :key="p.id" class="item-row" @click="viewPost(p, 'lecture')">
                  <div class="item-icon-col">
                    <div class="item-icon lec-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                    </div>
                  </div>
                  <div class="item-body">
                    <div class="item-title">{{ cleanTitle(p.title) }}</div>
                    <div class="item-desc">{{ getPreview(p) }}</div>
                    <div class="item-meta">
                      <span class="meta-date">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {{ fmtDate(p.created_at) }}
                      </span>
                      <span v-if="countFiles(p)" class="meta-files">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
                        {{ countFiles(p) }} {{ pluralFile(countFiles(p)) }}
                      </span>
                    </div>
                  </div>
                  <div class="item-actions">
                    <button v-if="canManage" class="item-edit" @click.stop="openEditPost(p, 'lecture')" title="Редактировать">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button v-if="canManage" class="item-del" @click.stop="deletePost(p.id)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                    <div class="item-open-btn">{{ lang==='ru'?'Открыть':'Open' }} →</div>
                  </div>
                </div>
              </div>
            </template>

            <!-- MATERIALS -->
            <template v-if="tab === 'materials'">
              <div class="content-header">
                <h2 class="content-heading">{{ t('class.materials') }}</h2>
              </div>
              <div v-if="!materials.length" class="empty-state-card">
                <div class="es-icon-wrap"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                <div class="es-h">{{ t('class.no_materials') }}</div>
                <div class="es-p">{{ isTeacher ? t('class.no_materials_teacher') : t('class.no_lectures_student') }}</div>
              </div>
              <div v-else class="items-list">
                <div v-for="p in materials" :key="p.id" class="item-row" @click="viewPost(p, 'material')">
                  <div class="item-icon-col">
                    <div class="item-icon mat-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    </div>
                  </div>
                  <div class="item-body">
                    <div class="item-title">{{ cleanTitle(p.title) }}</div>
                    <div class="item-desc">{{ getPreview(p) }}</div>
                    <div class="item-meta">
                      <span class="meta-date">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {{ fmtDate(p.created_at) }}
                      </span>
                      <span v-if="countFiles(p)" class="meta-files">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
                        {{ countFiles(p) }} {{ pluralFile(countFiles(p)) }}
                      </span>
                    </div>
                  </div>
                  <div class="item-actions">
                    <button v-if="canManage" class="item-edit" @click.stop="openEditPost(p, 'material')" title="Редактировать">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button v-if="canManage" class="item-del" @click.stop="deletePost(p.id)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                    <div class="item-open-btn">{{ lang==='ru'?'Открыть':'Open' }} →</div>
                  </div>
                </div>
              </div>
            </template>

            <!-- ASSIGNMENTS -->
            <template v-if="tab === 'assignments'">
              <div v-if="loadingAssignments" class="tab-load"><div class="spin-ring"></div></div>
              <template v-else>
                <div class="content-header">
                  <h2 class="content-heading">{{ lang==='ru'?'Лабораторные работы':'Lab Work' }}</h2>
                  <div class="sort-chip">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    {{ t('class.sort_deadline') }}
                  </div>
                </div>
                <div v-if="!assignments.length" class="empty-state-card">
                  <div class="es-icon-wrap"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1" ry="1"/><path d="M9 12h6M9 16h4"/></svg></div>
                  <div class="es-h">{{ t('class.no_assignments') }}</div>
                  <div class="es-p">{{ isTeacher ? t('class.no_assignments_teacher') : t('class.no_assignments_student') }}</div>
                </div>
                <div v-else class="items-list">
                  <div v-for="a in assignments" :key="a.id" class="item-row assignment-item" @click="openAssignment(a)">
                    <div class="item-icon-col">
                      <div :class="['item-icon', 'asgn-icon', getStatusIconClass(a)]">
                        <svg v-if="isLate(a)" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/><circle cx="12" cy="12" r="10"/></svg>
                        <svg v-else-if="isInProgress(a)" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="20 6 9 17 4 12"/></svg>
                        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </div>
                    </div>
                    <div class="item-body">
                      <div class="item-row-top">
                        <div class="item-title">{{ a.title }}</div>
                        <div :class="['status-badge', getStatusClass(a)]">{{ getStatusLabel(a) }}</div>
                      </div>
                      <div class="item-desc">{{ stripFilesFromText(a.description) }}</div>
                      <div class="item-meta">
                        <span class="meta-date">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {{ fmtDate(a.deadline) }}
                        </span>
                        <span class="meta-pts">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          {{ a.max_score }} {{ t('class.pts') }}
                        </span>
                      </div>
                    </div>
                    <div class="item-actions">
                      <button v-if="canManage" class="item-edit" @click.stop="openEditAssignment(a)" title="Редактировать">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button v-if="canManage" class="item-del" @click.stop="deleteAssignment(a)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                      </button>
                      <button v-if="!isTeacher && isLate(a)" class="btn-late" @click.stop="openAssignment(a)">{{ t('class.submit_late') }}</button>
                      <span v-else-if="!isTeacher && isInProgress(a)" class="btn-continue-link" @click.stop="openAssignment(a)">{{ t('class.continue') }}</span>
                      <span v-else-if="!isTeacher" class="item-preview-link" @click.stop="openAssignment(a)">{{ t('class.preview') }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </template>

            <!-- AVATAR -->
            <template v-if="tab === 'avatar'">
              <div class="content-header">
                <h2 class="content-heading">{{ lang==='ru'?'Лекции аватара':lang==='kk'?'Аватар лекциялары':'Avatar lectures' }}</h2>
                <div v-if="isTeacher" class="avatar-tab-actions">
                  <button v-if="!myAvatar" class="btn btn-white btn-sm" @click="showCreateAvatar = true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    {{ lang==='ru'?'Создать аватара':'Create avatar' }}
                  </button>
                  <button
                    v-else-if="myAvatar.status === 'approved'"
                    class="btn btn-teal btn-sm"
                    @click="showCreateLecture = true"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    {{ lang==='ru'?'Создать лекцию':'Create lecture' }}
                  </button>
                </div>
              </div>

              <!-- Статус аватара учителя -->
              <div v-if="isTeacher && myAvatar && myAvatar.status !== 'approved'" class="avatar-status-card" :class="myAvatar.status">
                <div class="asc-icon">
                  <svg v-if="myAvatar.status === 'pending'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </div>
                <div>
                  <div class="asc-title">
                    {{ myAvatar.status === 'pending'
                      ? (lang==='ru'?'Заявка на аватара ожидает одобрения':'Avatar request pending approval')
                      : (lang==='ru'?'Заявка на аватара отклонена':'Avatar request rejected') }}
                  </div>
                  <div v-if="myAvatar.status === 'rejected' && myAvatar.rejection_reason" class="asc-reason">{{ myAvatar.rejection_reason }}</div>
                </div>
              </div>

              <!-- Профиль одобренного аватара: даёт вкладке «лицо» вместо голой кнопки -->
              <div v-if="isTeacher && myAvatar && myAvatar.status === 'approved'" class="avatar-profile-card">
                <div class="apc-photo">
                  <img v-if="myAvatar.photo_url" :src="myAvatar.photo_url" alt=""/>
                  <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0116 0v1"/></svg>
                </div>
                <div class="apc-info">
                  <div class="apc-name">{{ myAvatar.display_name || (lang==='ru'?'Ваш аватар':'Your avatar') }}</div>
                  <div class="apc-status"><span class="apc-dot"></span>{{ lang==='ru'?'Активен — читает лекции на английском':'Active — lectures in English' }}</div>
                </div>
              </div>

              <div v-if="isTeacher && myAvatar && myAvatar.status === 'approved' && myAvatar.voice_clone_warning" class="avatar-status-card pending">
                <div class="asc-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div>
                  <div class="asc-title">{{ lang==='ru'?'Аватар говорит стандартным голосом':'Avatar uses a standard voice' }}</div>
                  <div class="asc-reason">{{ myAvatar.voice_clone_warning }}</div>
                </div>
              </div>

              <div v-if="loadingAvatarLectures" class="tab-load"><div class="spin-ring"></div></div>
              <div v-else-if="!avatarLectures.length" class="empty-state-card av-empty">
                <div class="av-empty-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0116 0v1"/><path d="M17 11l1.5 1.5L21 10"/></svg>
                </div>
                <div class="es-h">{{ lang==='ru'?'Пока нет лекций аватара':'No avatar lectures yet' }}</div>
                <div class="es-p">{{ isTeacher
                  ? (lang==='ru'?'Создайте своего AI-аватара и он начнёт читать лекции по вашим презентациям':'Create your AI avatar and it will start reading lectures from your presentations')
                  : (lang==='ru'?'Учитель пока не создал лекции аватара для этого класса':'The teacher has not created avatar lectures for this class yet') }}</div>
              </div>
              <div v-else class="av-lectures-grid">
                <div
                  v-for="lec in avatarLectures"
                  :key="lec.id"
                  class="av-lecture-card"
                  :class="{ 'av-card-disabled': lec.status !== 'ready' }"
                  @click="openLecturePlayer(lec)"
                >
                  <!-- Thumbnail / play area -->
                  <div class="av-card-thumb">
                    <div class="av-thumb-bg">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0116 0v1"/></svg>
                    </div>
                    <div v-if="lec.status === 'ready'" class="av-play-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                    <div v-else class="av-status-icon">
                      <svg v-if="lec.status==='processing'||lec.status==='generating'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <svg v-else-if="lec.status==='pending_approval'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    </div>
                  </div>
                  <!-- Info -->
                  <div class="av-card-info">
                    <div class="av-card-title">{{ lec.title }}</div>
                    <div class="av-card-meta">
                      <span class="av-meta-chip">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {{ lec.duration_minutes }} {{ lang==='ru'?'мин':'min' }}
                      </span>
                      <span class="av-meta-chip">{{ styleLabel(lec.style) }}</span>
                    </div>
                    <div v-if="lec.status !== 'ready'" :class="['av-card-status', lectureStatusClass(lec.status)]">
                      {{ lectureStatusLabel(lec.status) }}
                      <span v-if="lec.status === 'rejected' && lec.rejection_reason"> · {{ lec.rejection_reason }}</span>
                    </div>
                  </div>
                  <!-- Actions -->
                  <div class="av-card-actions">
                    <button v-if="canDeleteLecture(lec)" class="item-del" @click.stop="deleteAvatarLecture(lec)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                    <div v-if="lec.status === 'ready'" class="av-watch-btn">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      {{ lang==='ru'?'Смотреть':'Watch' }}
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <template v-if="tab === 'ai'">
              <LazyClassAiChat :class-name="classTitle" :class-posts="classPosts" :is-teacher="isTeacher" :class-id="classId" :assignments="assignments" />
            </template>

          </div>
        </div>

        <!-- Right sidebar -->
        <div class="cd-sidebar" v-if="tab !== 'ai' && tab !== 'avatar'">
          <!-- Score card — STUDENTS ONLY -->
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
            <button class="add-calendar-btn">{{ t('class.add_calendar') }}</button>
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

    <!-- Modals -->
    <LazyCreatePostModal v-if="showCreate" :class-id="classId" @close="showCreate = false" @created="onPostCreated" />
    <LazyCreateAssignmentModal v-if="showCreateAssignment" :class-id="classId" @close="showCreateAssignment = false" @created="onAssignmentCreated" />
    <LazyAssignmentModal v-if="activeAssignment" :assignment="activeAssignment" :is-teacher="isTeacher" :readonly="isArchivedForUser" :cohort-id="teacherViewCohortId" @close="activeAssignment = null" @submitted="onSubmitted" />

    <!-- Class settings (rotation mode) — owner/admin -->
    <div v-if="showSettings" class="overlay" @click.self="showSettings=false">
      <div class="modal anim-scale" style="max-width:460px;width:100%">
        <div class="modal-head">
          <span class="modal-title">{{ t('cohort.settings') }}</span>
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

    <!-- Avatar modals -->
    <LazyCreateAvatarModal v-if="showCreateAvatar" @close="showCreateAvatar = false" @created="onAvatarCreated" />
    <LazyCreateLectureModal v-if="showCreateLecture" :class-id="classId" @close="showCreateLecture = false" @created="onLectureCreated" />
    <LazyLecturePlayer
      v-if="activeLecture"
      :lecture="activeLecture"
      :avatar-photo-url="activeLectureAvatarPhoto"
      @close="activeLecture = null"
    />

    <!-- Edit Post Modal -->
    <div v-if="editingPost" class="overlay" @click.self="editingPost=null">
      <div class="modal anim-scale" style="max-width:520px;width:100%">
        <div class="modal-head">
          <span class="modal-title">{{ lang==='ru' ? (editingPost.type==='lecture'?'Редактировать лекцию':'Редактировать материал') : (editingPost.type==='lecture'?'Edit Lecture':'Edit Material') }}</span>
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
              <strong :style="{color: editAsgForm.criteria.reduce((s,c)=>s+Number(c.weight),0) === editAsgForm.max_score ? 'var(--teal)' : 'var(--yellow)'}">
                {{ editAsgForm.criteria.reduce((s,c)=>s+Number(c.weight),0) }}
              </strong>
              / {{ editAsgForm.max_score }}
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-white" @click="editingAssignment=null">{{ t('general.cancel') }}</button>
          <button class="btn btn-teal" :disabled="editAsgSaving" @click="saveEditAssignment">
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
          <div class="sheet-badge" :class="viewingPost.type">
            <svg v-if="viewingPost.type === 'lecture'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
            {{ viewingPost.type === 'lecture' ? t('class.lecture_badge') : t('class.material_badge') }}
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from '#app'
import { useToast } from '~/composables/useToast'
import { usePostsSvc } from '~/services/posts'
import { useAssignmentsSvc } from '~/services/assignments'
import { useRatingSvc } from '~/services/rating'
import { useClassesSvc, type CohortResponse, type RotationMode } from '~/services/classes'
import { useAvatarsSvc, type AvatarLecture, type AvatarLectureFull, type TeacherAvatar } from '~/services/avatars'
import { useAuthStore } from '~/stores/auth.store'
import { useI18n } from '~/composables/useI18n'
import { useFilePreview } from '~/composables/useFilePreview'
import { extractFilesFromText, stripFilesFromText } from '~/composables/useAttachments'
import type { Assignment, Submission } from '~/services/assignments'

definePageMeta({ layout: 'default' })

const route = useRoute()
const postsSvc = usePostsSvc()
const assignmentsSvc = useAssignmentsSvc()
const ratingSvc = useRatingSvc()
const classesSvc = useClassesSvc()
const avatarsSvc = useAvatarsSvc()
const toast = useToast()
const auth = useAuthStore()
const { t, lang } = useI18n()
const { openPreview } = useFilePreview()

const classId = computed(() => Number(route.params.id))
const isTeacher = computed(() => auth.user?.role === 'teacher' || auth.user?.role === 'admin')
const uInit = computed(() => (auth.nickname || auth.user?.email || '?')[0]?.toUpperCase())

const loading = ref(true)
const tab = ref<'lectures' | 'materials' | 'assignments' | 'avatar' | 'ai'>('lectures')
const showCreate = ref(false)
const showCreateAssignment = ref(false)
const viewingPost = ref<any>(null)
const activeAssignment = ref<Assignment | null>(null)
const allPosts = ref<any[]>([])
const assignments = ref<Assignment[]>([])
const mySubmissions = ref<Submission[]>([])

// Avatar tab state
const myAvatar = ref<TeacherAvatar | null>(null)
const avatarLectures = ref<AvatarLecture[]>([])
const loadingAvatarLectures = ref(false)
const showCreateAvatar = ref(false)
const showCreateLecture = ref(false)
const activeLecture = ref<AvatarLectureFull | null>(null)
const activeLectureAvatarPhoto = ref<string | null>(null)

// FE-3: метки берём из единого словаря (ru/en/kk), без инлайн-тернаров.
const KNOWN_LECTURE_STYLES = new Set(['school', 'university', 'professional'])
const styleLabel = (style: string) =>
  KNOWN_LECTURE_STYLES.has(style) ? t(`lecture.style.${style}`) : style

const KNOWN_LECTURE_STATUSES = new Set([
  'pending_approval', 'approved', 'generating', 'ready', 'rejected', 'failed',
])
const lectureStatusLabel = (status: string) =>
  KNOWN_LECTURE_STATUSES.has(status) ? t(`lecture.status.${status}`) : status

const lectureStatusClass = (status: string) => {
  if (status === 'ready') return 'status-done'
  if (status === 'rejected' || status === 'failed') return 'status-late'
  if (status === 'generating' || status === 'approved') return 'status-progress'
  return 'status-pending'
}

const loadMyAvatar = async () => {
  if (!isTeacher.value) return
  try {
    myAvatar.value = await avatarsSvc.getMine()
  } catch {
    myAvatar.value = null
  }
}

const loadAvatarLectures = async () => {
  loadingAvatarLectures.value = true
  try {
    await loadMyAvatar()
    avatarLectures.value = await avatarsSvc.classLectures(classId.value)
  } catch (e: any) {
    toast.err(e?.response?.data?.detail || t('lecture.load_failed'))
  } finally {
    loadingAvatarLectures.value = false
  }
}

const onAvatarCreated = (a: TeacherAvatar) => {
  myAvatar.value = a
  showCreateAvatar.value = false
}

const onLectureCreated = (l: AvatarLecture) => {
  avatarLectures.value = [l, ...avatarLectures.value]
  showCreateLecture.value = false
}

// Удалять может владелец лекции или админ (это же правило на бэке)
const canDeleteLecture = (lec: AvatarLecture) =>
  auth.user?.role === 'admin' || (isTeacher.value && lec.created_by === auth.user?.id)

const deleteAvatarLecture = async (lec: AvatarLecture) => {
  if (!confirm(lang.value==='ru'
    ? `Удалить лекцию «${lec.title}»? Действие необратимо.`
    : `Delete lecture "${lec.title}"? Action is irreversible.`)) return
  try {
    await avatarsSvc.deleteLecture(lec.id)
    avatarLectures.value = avatarLectures.value.filter(l => l.id !== lec.id)
    toast.ok(t('lecture.delete_ok'))
  } catch (e: any) {
    toast.err(e?.response?.data?.detail || t('lecture.delete_failed'))
  }
}

const openLecturePlayer = async (lec: AvatarLecture) => {
  if (lec.status !== 'ready') return
  try {
    const full = await avatarsSvc.getLectureFull(lec.id)
    activeLecture.value = full
    activeLectureAvatarPhoto.value = myAvatar.value?.photo_url || null
  } catch (e: any) {
    toast.err(e?.response?.data?.detail || t('lecture.open_failed'))
  }
}


const editingPost = ref<any>(null)
const editPostForm = ref({ title: '', content: '' })
const editPostSaving = ref(false)

const editingAssignment = ref<any>(null)
const editAsgForm = ref<{ title: string; description: string; max_score: number; deadline: string; criteria: Array<{name:string;weight:number;description:string}> }>({ title: '', description: '', max_score: 100, deadline: '', criteria: [] })
// Файлы задания живут в description как URL — в форме показываем чипами, а не текстом
const editAsgFiles = ref<{ name: string; url: string }[]>([])
const editAsgSaving = ref(false)
const loadingAssignments = ref(false)

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
  if (img) return { backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  return {}
})
const classPosts = computed(() => allPosts.value.filter(p => p.title?.includes(`[${classId.value}]`)))
const lectures = computed(() => classPosts.value.filter(p => p.title?.startsWith('[LECTURE]')))
const materials = computed(() => classPosts.value.filter(p => p.title?.startsWith('[HW]')))

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
    .filter(a => a.deadline && new Date(a.deadline) > now)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())[0] || null
})
const aiGuideText = computed(() => {
  const late = assignments.value.filter(a => a.deadline && new Date(a.deadline) < new Date() && !mySubmissionsMap.value[a.id])
  if (late.length && lang.value === 'ru') return `На основании просроченного статуса Лабы ${late[0]?.title}, вам может потребоваться повторение темы. Сгенерировать краткий обзор основных правил?`
  if (late.length) return `Based on the overdue status of ${late[0]?.title}, you may need to review the topic. Generate a brief overview?`
  return lang.value === 'ru' ? 'ИИ-ассистент поможет с учебными материалами и заданиями.' : 'AI assistant will help with study materials and assignments.'
})

const fmtMonth = (d: string) => { try { return new Date(d).toLocaleString(lang.value === 'ru' ? 'ru-RU' : 'en-US', {month:'short'}).toUpperCase() } catch { return '' } }
const fmtDay = (d: string) => { try { return new Date(d).getDate().toString() } catch { return '' } }
const fmtRemaining = (d: string) => {
  try {
    const diff = new Date(d).getTime() - Date.now()
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
const isLate = (a: Assignment) => a.deadline && new Date(a.deadline) < new Date() && !mySubmissionsMap.value[a.id]
const isInProgress = (a: Assignment) => mySubmissionsMap.value[a.id]?.status === 'submitted'
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
  if (sub?.status === 'submitted') return t('assign.status.in_progress')
  if (isLate(a)) return t('assign.status.overdue')
  return t('assign.status.not_started')
}
const pendingCount = computed(() => assignments.value.filter(a => !mySubmissionsMap.value[a.id] && a.is_active).length)
const doneCount = computed(() => mySubmissions.value.filter(s => s.status === 'submitted' || s.status === 'graded').length)
const lateCount = computed(() => mySubmissions.value.filter(s => s.status === 'late').length + assignments.value.filter(a => !mySubmissionsMap.value[a.id] && a.deadline && new Date(a.deadline) < new Date()).length)

const cleanTitle = (t: string) => t.replace(/^\[(LECTURE|HW)\]\[\d+\]\s*/, '').trim()
const fmtDate = (d: string) => { if (!d) return ''; try { return new Date(d).toLocaleDateString(lang.value === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return d } }
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
const countFiles = (p: any): number => { const body = p.body || ''; const m = body.match(new RegExp(`https?://[^\\s\\n"'<>]+${FILE_EXT.source}`, 'gi')); return m?.length || 0 }
const pluralFile = (n: number) => lang.value === 'ru' ? (n === 1 ? 'файл' : n < 5 ? 'файла' : 'файлов') : 'file' + (n !== 1 ? 's' : '')
const getFileIcon = (url: string) => { const e = url.split('.').pop()?.split('?')[0]?.toLowerCase() || ''; if (e === 'pdf') return 'PDF'; if (['doc','docx','txt','md'].includes(e)) return 'DOC'; if (['xls','xlsx'].includes(e)) return 'XLS'; if (['ppt','pptx'].includes(e)) return 'PPT'; if (['png','jpg','jpeg','gif','webp'].includes(e)) return 'IMG'; return 'FILE' }
const getFileName = (url: string) => { try { return decodeURIComponent(new URL(url).pathname.split('/').pop() || url) } catch { return url.slice(-50) } }
const attrEscape = (s: string) => s.replace(/"/g,'&quot;')
const renderBody = (text: string): string => {
  if (!text) return ''
  const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const attachmentRegex = /📎\s*\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
  const withAttachments = escaped.replace(attachmentRegex, (_m, name, url) => {
    const icon = getFileIcon(url)
    return `<a href="${url}" data-preview-url="${attrEscape(url)}" data-preview-name="${attrEscape(name)}" rel="noopener" class="file-attachment"><span class="file-type-badge">${icon}</span><span>${name}</span></a>`
  })
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g
  return withAttachments.replace(urlRegex, (url) => {
    if (FILE_EXT.test(url)) { const icon = getFileIcon(url); const name = getFileName(url); return `<a href="${url}" data-preview-url="${attrEscape(url)}" data-preview-name="${attrEscape(name)}" rel="noopener" class="file-attachment"><span class="file-type-badge">${icon}</span><span>${name}</span></a>` }
    return `<a href="${url}" target="_blank" rel="noopener" class="link-inline">${url}</a>`
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

const viewPost = (p: any, type: string) => { viewingPost.value = { ...p, type } }
const onPostCreated = (p: any) => { allPosts.value.unshift(p) }
const deletePost = async (id: number) => {
  if (!confirm(lang.value==='ru'?'Удалить эту запись? Действие необратимо.':'Delete this record? Action is irreversible.')) return
  try { await postsSvc.remove(id); allPosts.value = allPosts.value.filter(p => p.id !== id); toast.ok(t('class.delete_post')) } catch (e: any) { toast.err(e?.response?.data?.detail || t('general.error')) }
}

const openEditPost = (p: any, type: string) => {
  editingPost.value = { ...p, type }
  let content = ''
  try { const b = JSON.parse(p.body); content = b.content || b.description || '' } catch { content = p.body || '' }
  const rawTitle = p.title || ''
  const cleanedTitle = rawTitle.replace(/^\[(LECTURE|HW)\]\[\d+\]\s*/, '').trim()
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
    const prefix = p.type === 'lecture' ? `[LECTURE][${classId.value}] ` : `[HW][${classId.value}] `
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
  const dl = a.deadline ? new Date(a.deadline).toISOString().slice(0, 16) : ''
  let criteria: Array<{name:string;weight:number;description:string}> = []
  try { criteria = JSON.parse(a.criteria || '[]') } catch {}
  if (!criteria.length) criteria = [{ name: '', weight: 10, description: '' }]
  editAsgFiles.value = extractFilesFromText(a.description)
  editAsgForm.value = { title: a.title || '', description: stripFilesFromText(a.description), max_score: a.max_score || 100, deadline: dl, criteria }
}

const addCriterion = () => { editAsgForm.value.criteria.push({ name: '', weight: 10, description: '' }) }
const removeCriterion = (i: number) => { if (editAsgForm.value.criteria.length > 1) editAsgForm.value.criteria.splice(i, 1) }

const saveEditAssignment = async () => {
  if (!editingAssignment.value) return
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
const onSubmitted = (sub: Submission) => {
  const idx = mySubmissions.value.findIndex(s => s.assignment_id === sub.assignment_id)
  if (idx !== -1) mySubmissions.value[idx] = sub; else mySubmissions.value.push(sub)
  loadRating()
}

onMounted(async () => {
  // Open a specific tab if passed via query param (e.g. from calendar deadlines)
  const qTab = route.query.tab as string
  if (qTab === 'assignments' || qTab === 'materials' || qTab === 'ai' || qTab === 'avatar') {
    tab.value = qTab
    if (qTab === 'assignments') loadAssignments()
    if (qTab === 'avatar') loadAvatarLectures()
  }

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
  if (!isTeacher.value) loadRating()
  if (isTeacher.value) loadMyAvatar()
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
.cd-topbar-right{display:flex;align-items:center;gap:8px;flex-shrink:0;margin-left:16px}
.icon-btn2{width:32px;height:32px;border-radius:50%;background:var(--surface2);border:1px solid var(--border);color:var(--text3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
.icon-btn2:hover{border-color:var(--border2);color:var(--teal)}
.tav-img{width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid rgba(var(--teal-rgb),.25)}
.tav-init{width:32px;height:32px;border-radius:50%;background:var(--teal);color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center}

/* Layout */
.cd-layout{display:flex;flex:1;overflow:hidden;gap:0}
.cd-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.cd-sidebar{width:300px;flex-shrink:0;border-left:1px solid var(--border);padding:20px 18px;overflow-y:auto;display:flex;flex-direction:column;gap:14px;background:var(--surface)}

/* Page header */
.page-header{padding:20px 24px 16px;flex-shrink:0;position:relative;overflow:hidden;border-radius:0}
.page-header-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.25) 0%,rgba(0,0,0,.55) 100%);z-index:0}
.page-header .page-header-top,.page-header .page-header-body,.page-header .class-code-row{position:relative;z-index:1}
.back-link-dark{color:rgba(255,255,255,.8)!important}.back-link-dark:hover{color:#fff!important}
.sep-dark{color:rgba(255,255,255,.5)!important}
.subject-dark{color:rgba(255,255,255,.7)!important}
.title-dark{color:#fff!important;text-shadow:0 2px 8px rgba(0,0,0,.4)}
.sub-dark{color:rgba(255,255,255,.7)!important}
.page-header-top{display:flex;align-items:center;gap:6px;margin-bottom:10px}
.page-title-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.header-archive-badge{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:var(--text3);background:var(--surface2);border:1px solid var(--border);padding:4px 10px;border-radius:100px;letter-spacing:.03em}
.archive-notice{display:flex;align-items:center;gap:8px;margin:0 24px 4px;padding:10px 14px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);color:var(--text3);font-size:13px;font-weight:500}

/* Cohort controls in class header */
.class-cohort-row{display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap}
.year-picker{display:flex;align-items:center;gap:7px;background:rgba(0,0,0,.42);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.2);border-radius:100px;padding:6px 8px 6px 13px;color:rgba(255,255,255,.96)}
.page-header:not([style*="url"]) .year-picker{background:var(--surface2);border-color:var(--border);color:var(--text2)}
.year-picker-label{font-size:12px;font-weight:600;opacity:.8}
.year-select{background:transparent;border:none;color:inherit;font-size:13px;font-weight:700;cursor:pointer;outline:none;font-family:inherit;padding-right:2px}
.year-select option{color:var(--text1);background:var(--surface)}
.class-settings-btn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,.42);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.96);cursor:pointer;transition:all .2s}
.page-header:not([style*="url"]) .class-settings-btn{background:var(--surface2);border-color:var(--border);color:var(--text3)}
.class-settings-btn:hover{color:var(--teal);border-color:rgba(var(--teal-rgb),.5);transform:rotate(30deg)}
.cohort-view-notice{display:inline-flex;align-items:center;gap:7px;margin-top:10px;padding:7px 14px;background:rgba(0,0,0,.38);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.18);border-radius:100px;color:rgba(255,255,255,.94);font-size:12.5px;font-weight:600}
.page-header:not([style*="url"]) .cohort-view-notice{background:var(--surface2);border-color:var(--border);color:var(--text3)}

/* Settings modal — rotation toggle */
.settings-body{padding:6px 0 10px}
.rotation-row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
.rotation-info{flex:1}
.rotation-title{font-size:14px;font-weight:700;color:var(--text1);margin-bottom:6px}
.rotation-desc{font-size:12.5px;color:var(--text4);line-height:1.6}
.toggle-switch{position:relative;width:46px;height:26px;border-radius:100px;background:var(--surface3);border:1px solid var(--border);cursor:pointer;flex-shrink:0;transition:background .2s,border-color .2s;padding:0}
.toggle-switch.on{background:var(--teal);border-color:var(--teal)}
.toggle-switch:disabled{opacity:.6;cursor:default}
.toggle-knob{position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s}
.toggle-switch.on .toggle-knob{transform:translateX(20px)}
.back-link{font-size:12px;color:var(--text4);text-decoration:none;transition:color .15s}.back-link:hover{color:var(--teal)}
.header-sep{font-size:10px;color:var(--text4)}
.header-subject{font-size:11px;font-weight:700;color:var(--teal);letter-spacing:.08em}
.page-header-body{margin-bottom:14px}
.page-title{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:26px;font-weight:900;color:var(--text1);margin-bottom:6px;letter-spacing:-.02em}
.page-sub{font-size:13px;color:var(--text4);line-height:1.5;max-width:500px}
.page-header-actions{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.class-code-row{margin-bottom:12px}
.class-code-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:var(--teal-l);border:1px solid rgba(var(--teal-rgb),.25);border-radius:var(--r-md);font-size:13px;color:var(--teal);cursor:pointer;transition:all .15s;font-weight:500}
.class-code-chip strong{font-weight:800;letter-spacing:.12em;font-size:14px}
.class-code-chip:hover{background:var(--teal-m);border-color:rgba(var(--teal-rgb),.4)}

/* Tabs */
.tabs-wrap{flex-shrink:0;background:var(--surface);border-bottom:1px solid var(--border)}
.tabs-bar{display:flex;align-items:center;padding:0 24px;gap:0}
.tab-btn{display:flex;align-items:center;gap:8px;padding:14px 18px;font-size:13px;font-weight:500;color:var(--text4);background:transparent;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:all .15s;white-space:nowrap;font-family:inherit}
.tab-btn:hover{color:var(--text1)}
.tab-btn.active{color:var(--teal);border-bottom-color:var(--teal);font-weight:600}
.tab-ai.active{color:var(--teal)}
.tab-num{font-size:11px;font-weight:700;background:var(--teal-l);color:var(--teal);padding:2px 8px;border-radius:100px}

/* Teacher create actions — pinned to the header, out of the tab bar */
.header-actions{position:absolute;top:16px;right:20px;z-index:2;display:flex;gap:8px}

/* Tab content */
.tab-content{flex:1;overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column;gap:14px}
.tab-content.ai-mode{padding:0;overflow:hidden}

/* Content header */
.content-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
.content-heading{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:18px;font-weight:800;color:var(--text1)}
.sort-chip{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--text4);letter-spacing:.05em;cursor:pointer}
.sort-chip:hover{color:var(--teal)}

/* Items list */
.items-list{display:flex;flex-direction:column;gap:12px}
.item-row{display:flex;align-items:center;gap:16px;padding:20px 22px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);cursor:pointer;transition:all .18s}
.item-row:hover{border-color:rgba(var(--teal-rgb),.3);box-shadow:var(--sh-sm);transform:translateY(-1px)}
.item-icon-col{flex-shrink:0}
.item-icon{width:46px;height:46px;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center}
.lec-icon{background:rgba(var(--teal-rgb),.1);color:var(--teal);border:1px solid rgba(var(--teal-rgb),.2)}
.mat-icon{background:rgba(251,191,36,.08);color:var(--yellow);border:1px solid rgba(251,191,36,.16)}
.asgn-icon{background:rgba(var(--teal-rgb),.08);color:var(--teal);border:1px solid rgba(var(--teal-rgb),.15)}
.icon-late{background:rgba(220,38,38,.08)!important;color:var(--red)!important;border-color:rgba(220,38,38,.18)!important}
.icon-progress{background:rgba(var(--teal-rgb),.1)!important;color:var(--teal)!important;border-color:rgba(var(--teal-rgb),.2)!important}
.icon-default{background:var(--surface3)!important;color:var(--text4)!important;border-color:var(--border)!important}
.item-body{flex:1;min-width:0}
.item-row-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;gap:10px}
.item-title{font-size:15px;font-weight:700;color:var(--text1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.item-desc{font-size:13px;color:var(--text3);margin-bottom:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.4}
.item-meta{display:flex;align-items:center;gap:14px}
.meta-date,.meta-pts,.meta-files{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--text4)}
.meta-date{font-weight:500}
.meta-pts{color:var(--teal);font-weight:600}

/* Status badges — match screenshot exactly */
.status-badge{flex-shrink:0;font-size:11px;font-weight:700;padding:4px 12px;border-radius:100px;letter-spacing:.05em;white-space:nowrap}
.status-progress{background:rgba(var(--teal-rgb),.1);color:var(--teal);border:1px solid rgba(var(--teal-rgb),.2)}
.status-late{background:rgba(220,38,38,.1);color:var(--red);border:1px solid rgba(220,38,38,.2)}
.status-new{background:var(--surface2);color:var(--text4);border:1px solid var(--border)}
.status-done{background:rgba(22,163,74,.1);color:var(--green);border:1px solid rgba(22,163,74,.2)}
.status-pending{background:rgba(245,158,11,.1);color:#f59e0b;border:1px solid rgba(245,158,11,.2)}

/* Avatar tab */
.avatar-tab-actions{display:flex;gap:8px}
.avatar-profile-card{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:var(--r-lg);background:linear-gradient(120deg,var(--teal-l),transparent 70%);border:1px solid var(--border);margin-bottom:8px}
.apc-photo{width:52px;height:52px;border-radius:50%;overflow:hidden;flex-shrink:0;background:var(--teal-l);color:var(--teal);display:flex;align-items:center;justify-content:center;border:2px solid var(--teal)}
.apc-photo img{width:100%;height:100%;object-fit:cover}
.apc-name{font-size:14px;font-weight:800;color:var(--text1)}
.apc-status{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text3);margin-top:3px}
.apc-dot{width:7px;height:7px;border-radius:50%;background:var(--green,#16a34a);flex-shrink:0}
.avatar-status-card{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-radius:var(--r-lg);margin-bottom:4px}
.avatar-status-card.pending{background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.2);color:#f59e0b}
.avatar-status-card.rejected{background:var(--red-l);border:1px solid rgba(220,38,38,.2);color:var(--red)}
.asc-icon{flex-shrink:0;margin-top:1px}
.asc-title{font-size:13px;font-weight:700}
.asc-reason{font-size:12px;margin-top:3px;opacity:.85}
.item-row.item-disabled{cursor:default;opacity:.75}
.item-row.item-disabled:hover{background:transparent}

/* Item actions */
.item-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}
.item-del{width:32px;height:32px;border-radius:var(--r-sm);background:transparent;border:1px solid transparent;color:var(--text4);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;opacity:0}
.item-row:hover .item-del{opacity:1}
.item-del:hover{background:var(--red-l);border-color:rgba(220,38,38,.2);color:var(--red)}
.item-edit{width:32px;height:32px;border-radius:var(--r-sm);background:transparent;border:1px solid transparent;color:var(--text4);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;opacity:0}
.item-row:hover .item-edit{opacity:1}
.item-edit:hover{background:var(--teal-l);border-color:rgba(var(--teal-rgb),.2);color:var(--teal)}
/* Edit form fields */
.edit-field{display:flex;flex-direction:column;gap:6px}
.field-label{font-size:11px;font-weight:700;color:var(--text4);letter-spacing:.07em}
.field-input{padding:10px 14px;border-radius:var(--r-md);border:1.5px solid var(--border);background:var(--surface2);color:var(--text1);font-size:14px;font-family:inherit;transition:border-color .15s;outline:none}
.field-input:focus{border-color:var(--teal);background:rgba(var(--teal-rgb),.04)}
.field-textarea{padding:10px 14px;border-radius:var(--r-md);border:1.5px solid var(--border);background:var(--surface2);color:var(--text1);font-size:14px;font-family:inherit;resize:vertical;transition:border-color .15s;outline:none}
.field-textarea:focus{border-color:var(--teal);background:rgba(var(--teal-rgb),.04)}
.edit-asg-files{display:flex;flex-direction:column;gap:4px}
.edit-asg-file{display:flex;align-items:center;gap:8px;padding:7px 10px;background:rgba(var(--teal-rgb),.07);border:1px solid rgba(var(--teal-rgb),.18);border-radius:var(--r-md)}
.eaf-name{flex:1;font-size:12px;font-weight:600;color:var(--teal);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.eaf-rm{width:20px;height:20px;border-radius:50%;background:var(--surface3);color:var(--text4);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;transition:all .15s}
.eaf-rm:hover{background:var(--red-l);color:var(--red)}
/* Criteria editing */
.btn-add-criterion{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--teal);background:var(--teal-l);border:1px solid rgba(var(--teal-rgb),.2);border-radius:var(--r-sm);padding:5px 12px;cursor:pointer;font-family:inherit;transition:all .15s}
.btn-add-criterion:hover{background:var(--teal-m)}
.criteria-edit-list{display:flex;flex-direction:column;gap:10px}
.criterion-edit-row{display:flex;flex-direction:column;gap:8px;padding:12px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md)}
.criterion-edit-top{display:flex;gap:8px;align-items:center}
.criterion-name-inp{flex:1}
.criterion-weight-inp{width:80px;flex-shrink:0;text-align:center}
.criterion-del-btn{width:30px;height:38px;flex-shrink:0;border-radius:var(--r-sm);background:transparent;border:1px solid transparent;color:var(--text4);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
.criterion-del-btn:hover:not(:disabled){background:var(--red-l);border-color:rgba(220,38,38,.2);color:var(--red)}
.criterion-del-btn:disabled{opacity:.3;cursor:not-allowed}
.criteria-total{font-size:12px;color:var(--text4);text-align:right;padding-top:4px}
.item-open-btn{font-size:12px;font-weight:600;color:var(--teal);white-space:nowrap;cursor:pointer}
.item-preview-link{font-size:13px;font-weight:500;color:var(--text4);white-space:nowrap;cursor:pointer}
.item-preview-link:hover{color:var(--teal)}
.btn-continue-link{font-size:13px;font-weight:600;color:var(--teal);white-space:nowrap;cursor:pointer}
.btn-continue-link:hover{opacity:.8}
.btn-late{padding:7px 16px;border-radius:var(--r-md);background:var(--red);color:#fff;border:none;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;letter-spacing:.04em;transition:opacity .15s}
.btn-late:hover{opacity:.85}

/* Empty state */
.empty-state-card{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 40px;background:var(--surface);border:2px dashed var(--border2);border-radius:var(--r-2xl);gap:8px;text-align:center}
.es-h{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:18px;font-weight:700;color:var(--text3)}
.es-p{font-size:13px;color:var(--text4);max-width:260px;line-height:1.5}

/* Sidebar cards */
.sidebar-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);padding:18px}
.score-card{background:linear-gradient(135deg,var(--teal-d),var(--teal));border:none;color:#fff}
.score-no-grades{font-size:12px;opacity:.7;margin-top:8px;font-style:italic}

.mobile-stats{display:none}
.ms-score{flex:1;min-width:140px;background:linear-gradient(135deg,var(--teal-d),var(--teal));border-radius:var(--r-xl);padding:14px 16px;color:#fff}
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
.ms-date-box{background:var(--teal-l);border:1px solid rgba(var(--teal-rgb),.2);border-radius:var(--r-md);padding:6px 10px;text-align:center;flex-shrink:0}
.ms-month{font-size:10px;font-weight:700;color:var(--teal);text-transform:uppercase;letter-spacing:.05em}
.ms-day{font-size:20px;font-weight:900;color:var(--teal);font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;line-height:1.1}
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
.next-deadline-label{font-size:10px;font-weight:700;color:var(--teal);letter-spacing:.1em;margin-bottom:12px}
.next-deadline-row{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px}
.deadline-date-box{width:48px;height:52px;border-radius:var(--r-md);background:var(--teal-l);border:1px solid rgba(var(--teal-rgb),.2);display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0}
.ddb-month{font-size:10px;font-weight:700;color:var(--teal);letter-spacing:.06em}
.ddb-day{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:22px;font-weight:900;color:var(--text1);line-height:1}
.deadline-title{font-size:13px;font-weight:700;color:var(--text1);margin-bottom:3px}
.deadline-remaining{font-size:11px;color:var(--text4)}
.add-calendar-btn{font-size:11px;font-weight:700;color:var(--teal);letter-spacing:.06em;background:none;border:none;cursor:pointer;padding:0;transition:opacity .15s}
.add-calendar-btn:hover{opacity:.7}

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
.sheet-badge.lecture{background:var(--teal-l);color:var(--teal);border:1px solid rgba(var(--teal-rgb),.2)}
.sheet-badge.material{background:rgba(251,191,36,.08);color:var(--yellow);border:1px solid rgba(251,191,36,.18)}
.sheet-title{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:24px;font-weight:900;color:var(--text1);letter-spacing:-.025em;margin-bottom:6px}
.sheet-date{font-size:12px;color:var(--text4);margin-bottom:22px}
.sheet-body{font-size:14px;color:var(--text2);line-height:1.8;white-space:pre-wrap}
:deep(.file-attachment){display:inline-flex;align-items:center;gap:9px;padding:11px 16px;margin:6px 4px;background:var(--teal-l);border:1px solid rgba(var(--teal-rgb),.2);border-radius:var(--r-lg);color:var(--teal);font-size:13px;font-weight:600;text-decoration:none;transition:all .18s}
:deep(.file-attachment:hover){background:var(--teal-m);transform:translateY(-1px)}
:deep(.file-attachment span){overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:280px}
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
  /* Кнопки создания в шапке — отдельная строка на мобильном */
  .header-actions{position:static;top:auto;right:auto;margin-top:12px;gap:8px}
  .header-actions .btn{flex:1;justify-content:center;min-height:44px;font-size:12px}
  .tab-content{padding:10px 12px 80px;overflow-x:hidden}
  .page-header{padding:14px 12px 12px}
  .page-title{font-size:20px}
  .page-sub{font-size:12px}
  .class-code-chip{font-size:12px}
  .item-row{padding:14px 14px;gap:12px}
  .item-icon{width:38px;height:38px}
  .item-title{font-size:14px}
  .item-desc{font-size:12px}
  .item-actions{gap:4px}
  .item-del,.item-edit{opacity:1;width:44px;height:44px}
  .post-sheet{padding:12px 16px calc(28px + env(safe-area-inset-bottom, 0px));border-radius:28px 28px 0 0;max-height:92dvh}
  .post-sheet::before{content:'';display:block;width:36px;height:5px;border-radius:3px;background:var(--surface3);margin:0 auto 16px}
  .post-overlay{padding:0;align-items:flex-end}
  .sheet-title{font-size:20px}
  .field-input,.field-textarea{font-size:16px}
}
@media (max-width:480px){
  .tab-btn{font-size:11px;padding:11px 3px;letter-spacing:-.01em}
  .tab-content{padding:8px 10px 80px}
  .item-row{padding:12px 10px;gap:10px}
  .page-title{font-size:18px}
}

/* ── Avatar lectures redesign ── */
.av-lectures-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.av-lecture-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);overflow:hidden;cursor:pointer;transition:all .2s;display:flex;flex-direction:column}
.av-lecture-card:hover:not(.av-card-disabled){border-color:rgba(var(--teal-rgb),.3);box-shadow:var(--sh-sm);transform:translateY(-2px)}
.av-card-disabled{cursor:default;opacity:.7}
.av-card-disabled:hover{transform:none!important;box-shadow:none!important}
.av-card-thumb{height:120px;background:linear-gradient(135deg,#005f6e,var(--teal));position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.av-thumb-bg{opacity:.35;position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
.av-thumb-bg svg{width:60px;height:60px;stroke:rgba(255,255,255,0.4)}
.av-play-btn{width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.92);color:var(--teal);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.25);transition:transform .15s;z-index:1}
.av-lecture-card:hover .av-play-btn{transform:scale(1.08)}
.av-status-icon{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.15);color:#fff;display:flex;align-items:center;justify-content:center;z-index:1}
.av-card-info{padding:16px;flex:1;display:flex;flex-direction:column;gap:8px}
.av-card-title{font-size:15px;font-weight:700;color:var(--text1);line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.av-card-meta{display:flex;flex-wrap:wrap;gap:6px}
.av-meta-chip{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:var(--text4);background:var(--surface2);border:1px solid var(--border);border-radius:100px;padding:3px 9px}
.av-card-status{font-size:11px;font-weight:700;padding:4px 10px;border-radius:100px;display:inline-flex;align-self:flex-start}
.av-card-status.status-progress{background:rgba(var(--teal-rgb),.1);color:var(--teal);border:1px solid rgba(var(--teal-rgb),.2);animation:avpulse 1.8s ease-in-out infinite}
@keyframes avpulse{0%,100%{opacity:1}50%{opacity:.55}}
@media (prefers-reduced-motion: reduce){.av-card-status.status-progress{animation:none}}
.av-card-status.status-pending{background:rgba(245,158,11,.1);color:#f59e0b;border:1px solid rgba(245,158,11,.2)}
.av-card-status.status-late{background:var(--red-l);color:var(--red);border:1px solid rgba(220,38,38,.2)}
.av-card-actions{padding:0 16px 14px;display:flex;justify-content:space-between;align-items:center}
/* .item-del по умолчанию opacity:0 (ховер-паттерн списков .item-row) —
   в карточке лекции аватара кнопка видна всегда */
.av-lecture-card .item-del{opacity:1}
.av-watch-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--teal);color:#fff;border-radius:var(--r-md);font-size:13px;font-weight:700;transition:opacity .15s;cursor:pointer}
.av-watch-btn:hover{opacity:.85}
.av-empty{border:2px dashed var(--border2)}
.av-empty-icon{width:72px;height:72px;border-radius:20px;background:var(--teal-l);border:1px solid rgba(var(--teal-rgb),.2);display:flex;align-items:center;justify-content:center;color:var(--teal);margin-bottom:4px}

/* Empty state icon */
.es-icon-wrap{width:64px;height:64px;border-radius:18px;background:var(--teal-l);border:1px solid rgba(var(--teal-rgb),.18);display:flex;align-items:center;justify-content:center;color:var(--teal);margin-bottom:4px;opacity:.8}

/* File type badge in rendered content */
:deep(.file-type-badge){display:inline-flex;align-items:center;justify-content:center;background:var(--teal);color:#fff;font-size:9px;font-weight:800;letter-spacing:.06em;padding:2px 6px;border-radius:4px;flex-shrink:0;line-height:1.4}

@media (max-width:768px){
  .av-lectures-grid{grid-template-columns:1fr}
  .av-card-thumb{height:100px}
}
</style>
