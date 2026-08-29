<template>
  <div class="adp" :class="mode">

    <div class="am-head" :class="{ scrolled }">
      <div class="am-head-wash" aria-hidden="true"></div>
      <button class="adp-back" @click="$emit('close')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6"/></svg>
        {{ t('general.back') }}
      </button>
      <div class="am-head-l">
        <div class="am-ico"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
        <div class="am-head-txt">
          <div class="am-title">{{ assignment.title }}</div>
          <div class="am-badges">
            <span class="am-badge accent">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
              {{ assignment.max_score }} {{ t('am.points') }}
            </span>
            <span v-if="deadlineStr" :class="['am-badge', isOverdue ? 'overdue' : '']">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {{ deadlineStr }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs (teacher/admin only — "Задание"/"Работы"; student gets one unified page, no tabs) -->
    <div v-if="canSeeSubmissions" class="am-tabs-wrap">
      <div class="am-tabs">
        <button :class="['am-tab', { active: tab === 'info' }]" @click="tab = 'info'">{{ t('am.tab_task') }}</button>
        <button :class="['am-tab', { active: tab === 'submissions' }]" @click="tab = 'submissions'; loadSubs()">
          {{ t('am.tab_works') }} <span v-if="submissions.length" class="tab-count">{{ submissions.length }}</span>
        </button>
      </div>
    </div>

    <!-- ═══ INFO TAB (teacher/admin) ═══ -->
    <div v-if="canSeeSubmissions && tab === 'info'" class="am-body" @scroll.passive="onBodyScroll">
      <div v-if="descriptionText" class="section">
        <div class="section-label">{{ t('general.description') }}</div>
        <div class="desc-block">{{ descriptionText }}</div>
      </div>

      <div v-if="assignmentFiles.length" class="section">
        <div class="section-label">{{ t('am.task_files') }}<span class="section-count">{{ assignmentFiles.length }}</span></div>
        <FileListCard :files="assignmentFiles" @open="openPreview" />
      </div>

      <div v-if="referenceFiles.length" class="section">
        <div class="section-label">{{ t('am.reference_files') }}<span class="section-count">{{ referenceFiles.length }}</span></div>
        <div class="section-hint">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          {{ t('am.reference_files_hint') }}
        </div>
        <FileListCard :files="referenceFiles" @open="openPreview" />
      </div>

      <div v-if="parsedCriteria.length" class="section">
        <div class="section-label">{{ t('am.criteria') }}<span class="section-count">{{ parsedCriteria.length }}</span></div>
        <div class="criteria-list">
          <div v-for="(c, i) in parsedCriteria" :key="c.name" class="criterion">
            <div class="criterion-top">
              <span class="criterion-idx">{{ i + 1 }}</span>
              <!-- Иногда в «названии» критерия лежит целая инструкция для ИИ —
                   такой абзац жирным на всю карточку читать невозможно. -->
              <span class="criterion-name" :class="{ long: (c.name || '').length > 120 }">{{ c.name }}</span>
              <span class="criterion-pts">{{ c.weight }}<span class="criterion-of">/{{ assignment.max_score }}</span></span>
            </div>
            <div v-if="c.description" class="criterion-desc">{{ c.description }}</div>
            <div class="criterion-bar"><div class="criterion-bar-fill" :style="{ width: (c.weight / assignment.max_score * 100) + '%' }"></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ STUDENT: единая страница задания (описание+файлы слева, статус/оценка справа) ═══ -->
    <div v-if="!canSeeSubmissions" class="am-body" @scroll.passive="onBodyScroll">
      <div v-if="descriptionText" class="section">
        <div class="section-label">{{ t('general.description') }}</div>
        <div class="desc-block">{{ descriptionText }}</div>
      </div>

      <div v-if="assignmentFiles.length" class="section">
        <div class="section-label">{{ t('am.task_files') }}<span class="section-count">{{ assignmentFiles.length }}</span></div>
        <FileListCard :files="assignmentFiles" @open="openPreview" />
      </div>

      <!-- Read-only notice for archived students (no submission) -->
      <div v-if="!mySubmission && readonly" class="notice-panel">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        {{ t('am.readonly_archive') }}
      </div>

      <div v-else-if="!mySubmission" class="section">
        <div class="section-label">{{ t('am.my_work') }}</div>
        <div class="submit-form">
          <div v-if="isOverdue" class="overdue-warn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ t('am.overdue_warn') }}
          </div>

          <div class="field">
            <label class="field-label">{{ t('am.answer_text') }}</label>
            <textarea v-model="form.text" class="inp inp-ta" rows="6" :placeholder="t('am.answer_placeholder')"></textarea>
          </div>

          <div class="field">
            <label class="field-label">{{ t('am.attach_files') }}</label>
            <div class="file-drop" :class="{ 'has-file': submittedFiles.length }" @click="fileInputEl?.click()" @dragover.prevent @drop.prevent="onDrop">
              <input ref="fileInputEl" type="file" style="display:none" multiple :accept="ACCEPT_ATTR" @change="onFileSelect" />
              <template v-if="!submittedFiles.length">
                <div class="drop-ico">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <span class="drop-text">{{ t('am.drop_or') }} <strong>{{ t('am.click_choose') }}</strong></span>
                <span class="drop-hint">{{ t('am.file_types') }}</span>
              </template>
              <template v-else>
                <div class="drop-ico ok">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span class="drop-text"><strong>{{ submittedFiles.length }}</strong> {{ t('am.files_chosen') }}</span>
                <button class="btn btn-ghost btn-sm" @click.stop="clearFiles">{{ t('am.clear_all') }}</button>
              </template>
            </div>
            <div v-if="submittedFiles.length" class="attached-files-list">
              <div v-for="(f, i) in submittedFiles" :key="`${f.name}_${f.size}_${f.lastModified}`" class="attached-file-row">
                <span class="ftb ftb-sm">{{ getEmoji(f.name) }}</span>
                <span class="af-name">{{ f.name }}</span>
                <span class="af-size">{{ fileSz(f) }}</span>
                <button class="af-rm" @click="submittedFiles.splice(i,1)">×</button>
              </div>
            </div>
            <div v-if="uploading" class="upload-prog-sm">
              <div class="upload-track"><div class="upload-bar-sm" :style="{ transform: `scaleX(${uploadPctSub / 100})` }"></div></div>
              <span>{{ t('am.uploading') }} {{ uploadIdxSub }}/{{ submittedFiles.length }}...</span>
            </div>
          </div>

          <button class="btn btn-teal btn-full" :disabled="!canSubmit || submitting" @click="doSubmit">
            <div v-if="submitting" class="spinner"></div>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
            {{ submitting ? (uploading ? t('am.uploading_file') : t('am.sending')) : t('am.submit_work_btn') }}
          </button>
        </div>
      </div>

      <div v-else class="ad-grid">
        <div class="ad-col-main">
          <div v-if="mySubmission.text_content || mySubmission.file_url || parsedSubmittedUrls.length" class="section">
            <div class="section-label">{{ t('am.your_answer') }}</div>
            <div v-if="mySubmission.text_content" class="answer-text">{{ mySubmission.text_content }}</div>
            <div v-if="mySubmission.file_url || parsedSubmittedUrls.length" class="sub-file">
              <FileThumbGrid :files="parsedSubmittedUrls.length ? parsedSubmittedUrls : [mySubmission.file_url]" @open="openPreview" />
            </div>
          </div>
          <!-- Разбор по критериям — слева, рядом с ответом, а не под кольцом справа -->
          <GradeCriteriaCard
            v-if="mySubmission.grade"
            :grade="mySubmission.grade"
            :criteria="parsedCriteriaScores || []"
            :rubric="parsedCriteria"
          />
        </div>

        <div class="ad-col-side">
          <!-- "Сдано"/"Оценено" больше не дублируются текстом — как на странице
               задания в приложении, чип остаётся только для промежуточных
               статусов (проверяется/на ручной проверке/просрочено). -->
          <div class="sub-status-bar">
            <div v-if="!['submitted','graded'].includes(mySubmission.status)" :class="['sub-status-chip', mySubmission.status]">
              <svg v-if="mySubmission.status === 'grading'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <svg v-else-if="mySubmission.status === 'needs_review'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ statusLabel(mySubmission.status) }}
            </div>
            <span v-if="mySubmission.variant_number" class="variant-badge">{{ t('am.variant') }} {{mySubmission.variant_number }}</span>
            <span class="sub-date">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ fmtDate(mySubmission.submitted_at) }}
            </span>
          </div>

          <GradeResultCard
            v-if="mySubmission.grade"
            :grade="mySubmission.grade"
            :max-score="assignment.max_score"
            :criteria="parsedCriteriaScores || []"
          />

          <div v-else-if="mySubmission.status === 'grading'" class="grading-pending">
            <div class="grading-dots"><span></span><span></span><span></span></div>
            {{ checkStepText }}
          </div>

          <div v-else-if="mySubmission.status === 'needs_review'" class="needs-review-student">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            {{ t('am.needs_review_student_msg') }}
          </div>

          <div v-else class="awaiting-card">
            <div class="awaiting-ico">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div class="awaiting-title">{{ statusLabel(mySubmission.status) }}</div>
              <div class="awaiting-sub">{{ fmtDate(mySubmission.submitted_at) }}</div>
            </div>
          </div>

          <button v-if="mySubmission.status !== 'graded' && !readonly" class="btn btn-ghost retract-btn" :disabled="retracting" @click="retract">
            <div v-if="retracting" class="spinner"></div>
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
            {{ retracting ? t('am.canceling') : t('am.retract_resubmit') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ SUBMISSIONS TAB (teacher) ═══ -->
    <div v-if="tab === 'submissions' && canSeeSubmissions" class="am-body" @scroll.passive="onBodyScroll">
      <div v-if="loadingSubs" class="load-center"><div class="spinner" style="width:24px;height:24px;border-width:3px;border-color:var(--border2);border-top-color:var(--teal)"></div></div>

      <div v-else-if="activeSub" class="sub-detail">
        <button class="back-sub-btn" @click="activeSub = null">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {{ t('am.back_to_list') }}
        </button>

        <div class="sub-detail-header">
          <div class="sub-detail-id">
            <div class="sub-student-name">{{ getStudentName(activeSub.student_id) }}</div>
            <div class="sub-student-date">
              <span>{{ fmtDate(activeSub.submitted_at) }}</span>
              <span v-if="activeSub.variant_number" class="variant-badge">{{ t('am.variant') }} {{activeSub.variant_number }}</span>
            </div>
          </div>
          <span v-if="activeSub.grade" class="grade-pill lg">
            {{ activeSub.grade.score }}<span class="gp-of">/{{ assignment.max_score }}</span>
          </span>
        </div>

        <!-- Needs review: pending human decision, kept as its own single-column card (unchanged) -->
        <template v-if="activeSub.status === 'needs_review'">
          <div v-if="activeSub.text_content" class="section">
            <div class="section-label">{{ t('am.student_answer') }}</div>
            <div class="answer-text">{{ activeSub.text_content }}</div>
          </div>
          <div v-if="activeSub.file_url || parsedActiveUrls.length" class="section">
            <div class="section-label">{{ t('am.attached_files') }}</div>
            <FileThumbGrid :files="parsedActiveUrls.length ? parsedActiveUrls : [activeSub.file_url]" @open="openPreview" />
          </div>

          <div class="needs-review-banner">
            <div class="nrb-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              {{ t('am.status_needs_review_label') }}
            </div>

            <div class="nrb-stats" v-if="activeSub.grade || activeSub.ai_confidence != null">
              <div v-if="activeSub.grade" class="nrb-row">
                <span class="nrb-row-label">{{ t('am.suggested_score_label') }}</span>
                <span class="nrb-row-value">{{ activeSub.grade.score }} / {{ assignment.max_score }}</span>
              </div>
              <div v-if="activeSub.ai_confidence != null" class="nrb-row">
                <span class="nrb-row-label">{{ t('am.confidence_label') }}</span>
                <span class="nrb-row-value">{{ activeSub.ai_confidence }}%</span>
              </div>
            </div>

            <template v-if="parsedActiveReviewReasons">
              <div class="nrb-section-label">{{ t('am.review_reasons_label') }}</div>
              <div class="nrb-reasons">
                <div v-for="(r, i) in parsedActiveReviewReasons" :key="i" class="nrb-reason-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <span>{{ r }}</span>
                </div>
              </div>
            </template>

            <template v-if="activeSub.grade">
              <div class="nrb-section-label">{{ t('am.ai_analysis_label') }}</div>
              <div v-if="activeSub.grade.feedback" class="feedback-text">{{ activeSub.grade.feedback }}</div>
              <div v-if="parsedActiveScores" class="grade-criteria">
                <div v-for="cs in parsedActiveScores" :key="cs.name" class="cs-item">
                  <div class="cs-top"><span class="cs-name">{{ cs.name }}</span><span class="cs-pts">{{ cs.score }} / {{ cs.max }}</span></div>
                  <div v-if="cs.comment" class="cs-comment">{{ cs.comment }}</div>
                  <div class="cs-bar"><div class="cs-bar-fill" :style="{ width: (cs.score / cs.max * 100) + '%' }"></div></div>
                </div>
              </div>
            </template>

            <div class="grade-actions">
              <button class="btn btn-teal" :disabled="!activeSub.grade || confirmingSuggested" @click="confirmSuggested">
                <div v-if="confirmingSuggested" class="spinner"></div>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {{ t('am.confirm_suggested') }}
              </button>
              <button class="btn btn-white" @click="showManualGrade = !showManualGrade">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                {{ t('am.change_score') }}
              </button>
            </div>
          </div>
        </template>

        <!-- Normal states: two-column layout — student answer on the left, same grade card the
             student sees + grading actions on the right (parity with app) -->
        <div v-else class="ad-grid">
          <div class="ad-col-main">
            <div v-if="activeSub.text_content" class="section">
              <div class="section-label">{{ t('am.student_answer') }}</div>
              <div class="answer-text">{{ activeSub.text_content }}</div>
            </div>
            <div v-if="activeSub.file_url || parsedActiveUrls.length" class="section">
              <div class="section-label">{{ t('am.attached_files') }}</div>
              <FileThumbGrid :files="parsedActiveUrls.length ? parsedActiveUrls : [activeSub.file_url]" @open="openPreview" />
            </div>
            <!-- Разбор по критериям — слева, рядом с ответом, а не под кольцом справа -->
            <GradeCriteriaCard
              v-if="activeSub.grade"
              :grade="activeSub.grade"
              :criteria="parsedActiveScores || []"
              :rubric="parsedCriteria"
            />
          </div>

          <div class="ad-col-side">
            <GradeResultCard
              v-if="activeSub.grade"
              :grade="activeSub.grade"
              :max-score="assignment.max_score"
              :criteria="parsedActiveScores || []"
              :ai-confidence="activeSub.ai_confidence"
              :show-confidence="true"
            />
            <div v-else class="ungraded-card">
              <div class="ungraded-ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              </div>
              <div class="ungraded-title">{{ statusLabel(activeSub.status) }}</div>
              <div class="ungraded-sub">{{ t('am.check_ai') }} · {{ t('am.grade_manual') }}</div>
            </div>
          </div>
        </div>

        <!-- Действия — на всю ширину, как в приложении (нижняя панель, а не
             узкая колонка сбоку) -->
        <div class="grade-actions" v-if="activeSub.status !== 'needs_review'">
          <button class="btn btn-teal" :disabled="grading" @click="runAiGrade">
            <div v-if="grading" class="spinner"></div>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            {{ grading ? checkStepText : (activeSub.grade ? t('am.recheck_ai') : t('am.check_ai')) }}
          </button>
          <button class="btn btn-white" @click="showManualGrade = !showManualGrade">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            {{ activeSub.grade ? t('am.set_manual') : t('am.grade_manual') }}
          </button>
        </div>

        <div v-if="showManualGrade" ref="manualGradeFormEl" class="manual-grade-form">
          <div class="mgf-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            {{ t('am.manual_grade') }}
          </div>
          <div class="mgf-score-row">
            <input v-model.number="manualScore" type="number" :min="0" :max="assignment.max_score" class="mgf-input" />
            <div class="mgf-score-meta">
              <div class="mgf-label">{{ t('am.score') }} · 0 – {{ assignment.max_score }}</div>
              <input
                v-model.number="manualScore" type="range" class="mgf-range"
                :style="{ '--fill': manualPct + '%' }"
                :min="0" :max="assignment.max_score" :step="assignment.max_score > 20 ? 1 : 0.5"
              />
            </div>
            <div class="mgf-pct" :class="`tone-${scoreTone(manualScore || 0, assignment.max_score)}`">
              {{ manualScore > 0 ? Math.round(manualScore / assignment.max_score * 100) + '%' : '0%' }}
            </div>
          </div>
          <div class="mgf-field">
            <label class="mgf-label">{{ t('am.comment_optional') }}</label>
            <textarea v-model="manualFeedback" class="mgf-textarea" rows="3" :placeholder="t('am.feedback_placeholder')"></textarea>
          </div>
          <div class="mgf-actions">
            <button class="btn btn-ghost" @click="showManualGrade = false">{{ t('am.cancel') }}</button>
            <button class="btn btn-teal" :disabled="savingGrade || manualScore < 0 || manualScore > assignment.max_score" @click="saveManualGrade">
              <div v-if="savingGrade" class="spinner" style="width:12px;height:12px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
              <span v-else>{{ t('am.save_grade') }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-else>
        <div v-if="!submissions.length" class="empty-block">
          <div class="empty-ico">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          {{ t('am.no_submissions') }}
        </div>
        <div v-else class="subs-wrap">
          <!-- Сводка: числа + одна полоса прогресса проверки вместо трёх
               одинаковых чипов — сразу видно, сколько осталось. -->
          <div class="subs-stats">
            <div class="subs-stats-row">
              <div class="stat-chip"><span class="stat-n">{{ submissions.length }}</span><span class="stat-l">{{ t('am.total') }}</span></div>
              <div class="stat-chip ok"><span class="stat-n">{{ gradedCount }}</span><span class="stat-l">{{ t('am.checked') }}</span></div>
              <div class="stat-chip wait"><span class="stat-n">{{ pendingCount }}</span><span class="stat-l">{{ t('am.pending') }}</span></div>
            </div>
            <div class="subs-progress">
              <div class="subs-progress-track">
                <div class="subs-progress-fill" :style="{ width: gradedPct + '%' }"></div>
              </div>
              <span class="subs-progress-label">{{ t('am.submissions_progress') }} · {{ gradedPct }}%</span>
            </div>
          </div>

          <button
            v-if="pendingCount > 0"
            class="btn-bulk-grade"
            :disabled="bulkGrading"
            @click="runBulkAiGrade"
          >
            <svg v-if="!bulkGrading" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <div v-else class="spinner" style="width:12px;height:12px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
            {{ bulkGrading ? `${t('am.grading_progress')} ${bulkDone}/${bulkTotal}...` : `${t('am.grade_all_pending')} (${pendingCount})` }}
          </button>

          <div class="subs-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="searchQuery" class="subs-search-inp" type="text" :placeholder="t('am.search_student')" />
            <button v-if="searchQuery" class="subs-search-clear" @click="searchQuery = ''">×</button>
          </div>
          <div v-if="filteredSubmissions.length === 0 && searchQuery" class="empty-block" style="padding:28px">
            {{ t('am.student_not_found') }}
          </div>
          <div v-else class="subs-list">
            <div v-for="s in filteredSubmissions" :key="s.id" class="sub-row" @click="activeSub = s">
              <div class="sub-info">
                <div class="sub-student">{{ getStudentName(s.student_id) }}</div>
                <div class="sub-meta">
                  <span>{{ fmtDate(s.submitted_at) }}</span>
                  <span v-if="s.variant_number" class="variant-badge">{{ t('am.variant_short') }}{{ s.variant_number }}</span>
                  <span v-if="s.text_content" class="sub-tag">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </span>
                  <span v-if="s.file_urls || s.file_url" class="sub-tag"><span class="ftb ftb-sm">{{ getEmoji(s.file_url || '') }}</span> {{ parseFileUrls(s.file_urls).length > 1 ? parseFileUrls(s.file_urls).length + ' ' + t('am.files_word') : '' }}</span>
                </div>
              </div>
              <div class="sub-right">
                <span v-if="s.grade" class="grade-pill">
                  {{ s.grade.score }}<span class="gp-of">/{{ assignment.max_score }}</span>
                </span>
                <!-- Статус подписью показываем только там, где он что-то
                     добавляет: рядом с баллом «ОЦЕНЕНО» — уже избыточно. -->
                <span v-if="!s.grade || attentionStatus(s.status)" :class="['status-mini', s.status]">{{ statusLabel(s.status) }}</span>
              </div>
              <svg class="sub-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAssignmentsSvc } from '~/services/assignments'
import { useUploadSvc } from '~/services/uploads'
import { useUsersSvc } from '~/services/users'
import { useToast } from '~/composables/useToast'
import { parseUtc } from '~/composables/useDeadline'
import { useI18n } from '~/composables/useI18n'
import { useCohortErrors } from '~/composables/useCohortErrors'
import { useAuthStore } from '~/stores/auth.store'
import { useFilePreview } from '~/composables/useFilePreview'
import { scoreTone } from '~/composables/useScoreTone'
import { extractFilesFromText, stripFilesFromText, fileNameFromUrl, withNameFragment } from '~/composables/useAttachments'
import { validateFiles, ACCEPT_ATTR } from '~/composables/useFileUploadValidation'
import type { Assignment, Submission } from '~/services/assignments'

const props = defineProps<{ assignment: Assignment; mode: 'panel' | 'fullpage'; isTeacher?: boolean; readonly?: boolean; cohortId?: number }>()
const emit = defineEmits(['close', 'submitted'])

const { openPreview } = useFilePreview()
const auth = useAuthStore()
const canSeeSubmissions = computed(() => props.isTeacher || auth.isTeacher)

const svc = useAssignmentsSvc()
const uploadSvc = useUploadSvc()
const usersSvc = useUsersSvc()
const toast = useToast()
const { t, lang } = useI18n()
const cohortErrors = useCohortErrors()
// Локаль дат по языку интерфейса (раньше было жёстко 'ru-RU').
const dateLocale = computed(() => ({ ru: 'ru-RU', en: 'en-US', kk: 'kk-KZ' }[lang.value] || 'ru-RU'))

const studentMap = ref<Record<number, string>>({})

const tab = ref<'info'|'submit'|'submissions'>('info')
const searchQuery = ref('')
const mySubmission = ref<Submission|null>(null)
const submissions = ref<Submission[]>([])
const activeSub = ref<Submission|null>(null)
const loadingSubs = ref(false)
const grading = ref(false)

// Шапка «поднимается» тенью, как только контент уходит под неё — граница
// появляется только там, где плавающая панель реально перекрывает контент
// (scroll edge effect), вместо постоянной 1px-линии.
const scrolled = ref(false)
const onBodyScroll = (e: Event) => { scrolled.value = (e.target as HTMLElement).scrollTop > 4 }

// Проверка ИИ — единственный блокирующий HTTP-запрос без стадий на бэкенде,
// поэтому прогресс симулируем на клиенте (одинаковый текст на Web и Flutter).
const CHECK_STEPS = ['am.check_step_1', 'am.check_step_2', 'am.check_step_3', 'am.check_step_4', 'am.check_step_5']
const checkStepIdx = ref(0)
let checkStepTimer: ReturnType<typeof setInterval> | null = null
const startCheckSteps = () => {
  checkStepIdx.value = 0
  if (checkStepTimer) clearInterval(checkStepTimer)
  checkStepTimer = setInterval(() => {
    if (checkStepIdx.value < CHECK_STEPS.length - 1) checkStepIdx.value++
  }, 3500)
}
const stopCheckSteps = () => {
  if (checkStepTimer) { clearInterval(checkStepTimer); checkStepTimer = null }
}
const checkStepText = computed(() => t(CHECK_STEPS[checkStepIdx.value]))
onUnmounted(stopCheckSteps)
watch(() => mySubmission.value?.status, (s) => {
  if (s === 'grading') startCheckSteps()
  else stopCheckSteps()
}, { immediate: true })

const bulkGrading = ref(false)
const bulkDone = ref(0)
const bulkTotal = ref(0)
const submitting = ref(false)
const uploading = ref(false)
const retracting = ref(false)
const fileInputEl = ref<HTMLInputElement>()
const uploadedUrl = ref('')
const submittedFiles = ref<File[]>([])
const uploadIdxSub = ref(0)
const uploadPctSub = ref(0)
const form = ref({ text: '', file: null as File|null })

const filteredSubmissions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return submissions.value
  return submissions.value.filter(s => {
    const name = (studentMap.value[s.student_id] || '').toLowerCase()
    return name.includes(q)
  })
})

const gradedCount = computed(() => submissions.value.filter(s => s.status === 'graded').length)
const pendingCount = computed(() => submissions.value.filter(s => s.status === 'submitted' || s.status === 'late' || s.status === 'needs_review').length)
const gradedPct = computed(() => submissions.value.length ? Math.round(gradedCount.value / submissions.value.length * 100) : 0)

const parsedCriteria = computed(() => { try { return JSON.parse(props.assignment.criteria) } catch { return [] } })
const parsedCriteriaScores = computed(() => { if (!mySubmission.value?.grade?.criteria_scores) return null; try { return JSON.parse(mySubmission.value.grade.criteria_scores) } catch { return null } })
const parsedActiveScores = computed(() => { if (!activeSub.value?.grade?.criteria_scores) return null; try { return JSON.parse(activeSub.value.grade.criteria_scores) } catch { return null } })
const parsedActiveReviewReasons = computed(() => { if (!activeSub.value?.ai_review_reasons) return null; try { const arr = JSON.parse(activeSub.value.ai_review_reasons); return Array.isArray(arr) && arr.length ? arr : null } catch { return null } })

const parseFileUrls = (raw?: string | null): string[] => {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    // Легаси-данные: file_urls мог сохраниться одиночной URL-строкой (не
    // JSON-массивом) — раньше такой файл молча пропадал из списка сдачи.
    if (Array.isArray(arr)) return arr.filter((u) => typeof u === 'string')
    if (typeof arr === 'string') return arr ? [arr] : []
    return []
  } catch {
    return raw.trim().startsWith('http') ? [raw] : []
  }
}
const parsedSubmittedUrls = computed(() => parseFileUrls(mySubmission.value?.file_urls))
const parsedActiveUrls = computed(() => parseFileUrls(activeSub.value?.file_urls))

const assignmentFiles = computed(() => extractFilesFromText(props.assignment.description))
const referenceFiles = computed(() => {
  const raw = props.assignment.reference_solution_url
  if (!raw) return []
  let urls: string[] = []
  try {
    const arr = JSON.parse(raw)
    urls = Array.isArray(arr) ? arr : [raw]
  } catch {
    urls = [raw]
  }
  return urls.map(url => ({ url, name: fileNameFromUrl(url) }))
})
const descriptionText = computed(() => stripFilesFromText(props.assignment.description))

const parsedDeadline = computed(() => props.assignment.deadline ? parseUtc(props.assignment.deadline) : null)
// Для студента, который уже сдал работу (даже с опозданием), заголовок задания
// не должен гореть красным — просрочка уже не требует действия. Красным
// остаётся только пока сдачи нет. У преподавателя своей сдачи не бывает —
// для него бейдж просто показывает, что дедлайн прошёл.
const isOverdue = computed(() => {
  if (!parsedDeadline.value || parsedDeadline.value >= new Date()) return false
  return canSeeSubmissions.value ? true : !mySubmission.value
})
const deadlineStr = computed(() => parsedDeadline.value?.toLocaleString(dateLocale.value, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) ?? '')
const canSubmit = computed(() =>
  (form.value.text.trim() || submittedFiles.value.length) &&
  !submitting.value
)

const getStudentName = (id: number) => studentMap.value[id] || `${t('am.student_hash')} #${id}`
// Цвет в списке работ оставлен только за статусами, которые требуют действия
// учителя, — остальное нейтральное, иначе колонка превращается в радугу.
const attentionStatus = (s: string) => s === 'needs_review' || s === 'late'
// Единая терминология с приложением и карточкой задания: submitted → СДАНО,
// graded → ОЦЕНЕНО, late → ПРОСРОЧЕНО, grading → ПРОВЕРЯЕТСЯ.
const statusLabel = (s: string) => ({
  submitted: t('assign.status.submitted'),
  grading: t('assign.status.grading'),
  graded: t('assign.status.graded'),
  late: t('assign.status.overdue'),
  needs_review: t('assign.status.needs_review'),
}[s] || s)
const fmtDate = (d: string) => parseUtc(d).toLocaleString(dateLocale.value, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const getFileName = (url: string) => fileNameFromUrl(url)
const getEmoji = (url: string) => {
  const e = url.split('.').pop()?.split('?')[0]?.toLowerCase() || ''
  if (e === 'pdf') return 'PDF'
  if (['doc','docx'].includes(e)) return 'DOC'
  if (['txt','md'].includes(e)) return 'TXT'
  if (['xls','xlsx'].includes(e)) return 'XLS'
  if (['ppt','pptx'].includes(e)) return 'PPT'
  if (['png','jpg','jpeg','gif','webp'].includes(e)) return 'IMG'
  return 'FILE'
}
const fileSz = (f: File) => f.size < 1048576 ? (f.size/1024).toFixed(0)+' KB' : (f.size/1048576).toFixed(1)+' MB'

const clearFiles = () => { submittedFiles.value = []; uploadedUrl.value = '' }
const onDrop = (e: DragEvent) => {
  addSubmittedFiles(Array.from(e.dataTransfer?.files || []))
}
const onFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  addSubmittedFiles(Array.from(input.files || []))
  input.value = ''
}
const addSubmittedFiles = (incoming: File[]) => {
  const { ok, rejected } = validateFiles(incoming, { alreadySelected: submittedFiles.value.length })
  for (const r of rejected) toast.err(`${r.name}: ${r.reason}`)
  if (ok.length) submittedFiles.value = [...submittedFiles.value, ...ok]
}

const loadSubs = async () => {
  if (loadingSubs.value) return
  searchQuery.value = ''
  loadingSubs.value = true
  try {
    const [subs, users] = await Promise.all([
      svc.getSubmissions(props.assignment.id, props.cohortId),
      usersSvc.all()
    ])
    submissions.value = subs
    const fnReg: Record<number, string> = JSON.parse(localStorage.getItem('_fullname_registry') || '{}')
    const nickReg: Record<number, string> = JSON.parse(localStorage.getItem('_nick_registry') || '{}')
    const map: Record<number, string> = {}
    for (const u of users) {
      map[u.id] = u.full_name || u.fullName || fnReg[u.id] || nickReg[u.id] || u.name || u.email || `${t('am.student_hash')} #${u.id}`
    }
    for (const sub of subs) {
      if (sub.student_name && sub.student_id) {
        map[sub.student_id] = sub.student_name
      }
    }
    studentMap.value = map
  }
  catch { toast.err(t('am.err_load_subs')) }
  finally { loadingSubs.value = false }
}

const runAiGrade = async () => {
  if (!activeSub.value || grading.value) return
  const subId = activeSub.value.id
  grading.value = true
  startCheckSteps()
  try {
    const result = await svc.aiGrade(subId)
    const patch = {
      status: result.status,
      grade: result.grade || undefined,
      ai_confidence: result.ai_confidence,
      ai_review_reasons: result.ai_review_reasons,
    }
    // Учитель мог уйти «Назад к списку» (activeSub = null) или открыть другую
    // сдачу, пока запрос летел — применяем patch к activeSub, только если это
    // всё ещё та же сдача, иначе спред null дал бы объект без id/submitted_at
    // и рендер экрана детали упал бы на fmtDate(undefined).
    if (activeSub.value?.id === subId) activeSub.value = { ...activeSub.value, ...patch }
    const idx = submissions.value.findIndex(s => s.id === subId)
    if (idx !== -1) submissions.value[idx] = { ...submissions.value[idx], ...patch }
    if (result.status === 'needs_review') {
      toast.ok(t('am.needs_review_toast'))
    } else if (result.grade) {
      toast.ok(`${t('am.ai_checked')}: ${result.grade.score} / ${props.assignment.max_score}`)
    }
  } catch (e: any) { toast.err(e?.response?.data?.detail || t('am.err_ai_grade')) }
  finally { grading.value = false; stopCheckSteps() }
}

const showManualGrade = ref(false)
const manualScore = ref(0)
const manualFeedback = ref('')
const savingGrade = ref(false)
const manualGradeFormEl = ref<HTMLElement>()
// Заливка дорожки ползунка (нативный ::-webkit-slider-runnable-track не умеет
// «progress», поэтому рисуем градиентом по текущей доле балла).
const manualPct = computed(() => {
  const max = props.assignment.max_score
  if (!max) return 0
  return Math.min(100, Math.max(0, ((manualScore.value || 0) / max) * 100))
})

// Форма разворачивается снизу и не всегда влезает в текущую высоту окна —
// без автоскролла учитель не сразу замечает, что нужно прокрутить вниз.
watch(showManualGrade, (shown) => {
  if (!shown) return
  nextTick(() => {
    manualGradeFormEl.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  })
})

// Pre-fill manual score when switching to a submission that already has a grade
watch(activeSub, (sub) => {
  // needs_review показывает отдельную карточку с кнопками "Подтвердить"/
  // "Изменить оценку" — форму ручной оценки саму по себе больше не открываем,
  // только предзаполняем на случай, если учитель нажмёт "Изменить".
  showManualGrade.value = false
  if (sub?.grade) {
    manualScore.value = sub.grade.score
    manualFeedback.value = sub.grade.feedback || ''
  } else {
    manualScore.value = 0
    manualFeedback.value = ''
  }
})

const saveManualGrade = async () => {
  if (!activeSub.value || savingGrade.value) return
  if (manualScore.value > props.assignment.max_score) return
  const subId = activeSub.value.id
  savingGrade.value = true
  try {
    const grade = await svc.saveGrade(subId, {
      score: manualScore.value,
      feedback: manualFeedback.value || undefined,
      graded_by: 'teacher'
    })
    // Финальную оценку теперь ставит человек — старая уверенность ИИ (если
    // сдача уже проходила через needs_review/recheck) больше не относится к
    // делу и вводит в заблуждение рядом с новым баллом (см. бэкенд-фикс в
    // save_grade — он тоже её чистит, здесь просто не ждём лишний рефетч).
    // activeSub могли обнулить/сменить, пока запрос летел — не подставляем
    // patch в чужую/несуществующую сдачу (см. комментарий в runAiGrade).
    if (activeSub.value?.id === subId) {
      activeSub.value = { ...activeSub.value, grade, status: 'graded', ai_confidence: null, ai_review_reasons: null }
    }
    const idx = submissions.value.findIndex(s => s.id === subId)
    if (idx !== -1) submissions.value[idx] = { ...submissions.value[idx], grade, status: 'graded', ai_confidence: null, ai_review_reasons: null }
    toast.ok(`${t('am.grade_saved')}: ${grade.score} / ${props.assignment.max_score}`)
    showManualGrade.value = false
    manualScore.value = 0
    manualFeedback.value = ''
  } catch (e: any) { toast.err(e?.response?.data?.detail || t('am.err_save_grade')) }
  finally { savingGrade.value = false }
}

// Подтверждение предложения ИИ «как есть» — тот же вызов, что и сохранение
// формы ручной оценки, но без её открытия: значения уже есть в activeSub.grade.
const confirmingSuggested = ref(false)
const confirmSuggested = async () => {
  if (!activeSub.value?.grade || confirmingSuggested.value) return
  const subId = activeSub.value.id
  confirmingSuggested.value = true
  try {
    const grade = await svc.saveGrade(subId, {
      score: activeSub.value.grade.score,
      feedback: activeSub.value.grade.feedback || undefined,
      criteria_scores: parsedActiveScores.value || undefined,
      graded_by: 'teacher'
    })
    // Финальную оценку теперь ставит человек — старая уверенность ИИ (если
    // сдача уже проходила через needs_review/recheck) больше не относится к
    // делу и вводит в заблуждение рядом с новым баллом (см. бэкенд-фикс в
    // save_grade — он тоже её чистит, здесь просто не ждём лишний рефетч).
    // activeSub могли обнулить/сменить, пока запрос летел (см. runAiGrade).
    if (activeSub.value?.id === subId) {
      activeSub.value = { ...activeSub.value, grade, status: 'graded', ai_confidence: null, ai_review_reasons: null }
    }
    const idx = submissions.value.findIndex(s => s.id === subId)
    if (idx !== -1) submissions.value[idx] = { ...submissions.value[idx], grade, status: 'graded', ai_confidence: null, ai_review_reasons: null }
    toast.ok(`${t('am.grade_saved')}: ${grade.score} / ${props.assignment.max_score}`)
  } catch (e: any) { toast.err(e?.response?.data?.detail || t('am.err_save_grade')) }
  finally { confirmingSuggested.value = false }
}

const runBulkAiGrade = async () => {
  if (bulkGrading.value) return
  const pending = submissions.value.filter(s => s.status === 'submitted' || s.status === 'late' || s.status === 'needs_review')
  if (!pending.length) return
  bulkGrading.value = true
  bulkDone.value = 0
  bulkTotal.value = pending.length
  let ok = 0
  for (const sub of pending) {
    try {
      const result = await svc.aiGrade(sub.id)
      const idx = submissions.value.findIndex(s => s.id === sub.id)
      const patch = {
        status: result.status,
        grade: result.grade || undefined,
        ai_confidence: result.ai_confidence,
        ai_review_reasons: result.ai_review_reasons,
      }
      if (idx !== -1) submissions.value[idx] = { ...submissions.value[idx], ...patch }
      ok++
    } catch {}
    bulkDone.value++
  }
  bulkGrading.value = false
  toast.ok(`${t('am.ai_checked')} ${ok} / ${pending.length}`)
}

const retract = async () => {
  if (!mySubmission.value || retracting.value) return
  retracting.value = true
  try {
    await svc.retractSubmission(mySubmission.value.id)
    mySubmission.value = null
    form.value = { text: '', file: null }
    uploadedUrl.value = ''
    // Полная очистка формы сдачи: раньше submittedFiles (уже выбранные, ещё
    // не загруженные файлы) оставались и уезжали в следующую сдачу.
    submittedFiles.value = []
    toast.ok(t('am.retracted'))
    emit('submitted', null)
  } catch (e: any) { toast.err(e?.response?.data?.detail || t('am.err_retract')) }
  finally { retracting.value = false }
}

const doSubmit = async () => {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  try {
    const fileUrls: string[] = []
    if (submittedFiles.value.length) {
      uploading.value = true
      for (let i = 0; i < submittedFiles.value.length; i++) {
        uploadIdxSub.value = i + 1
        uploadPctSub.value = Math.round(((i + 1) / submittedFiles.value.length) * 100)
        const res = await uploadSvc.upload(submittedFiles.value[i])
        // Сбой аплоада прерывает сдачу (throw → catch), а не уходит с неполными
        // файлами. Ответ без file_url тоже считаем сбоем (паритет с приложением).
        if (!res?.file_url) throw new Error('upload_failed')
        // Оригинальное имя файла сохраняем во фрагменте URL — иначе везде виден UUID
        fileUrls.push(withNameFragment(res.file_url, submittedFiles.value[i].name))
      }
      uploading.value = false
    }
    const sub = await svc.submit(props.assignment.id, {
      text_content: form.value.text.trim() || undefined,
      file_urls: fileUrls.length ? fileUrls : undefined,
      student_name: auth.fullname || undefined,
    })
    mySubmission.value = sub
    toast.ok(t('am.work_submitted'))
    emit('submitted', sub)
  } catch (e: any) {
    // Сбой аплоада — своя понятная строка; иначе единый маппинг кодов
    // (409 «уже сдано», 403 архивный поток, no_active_cohort), как в join-флоу.
    if (e?.message === 'upload_failed') toast.err(t('am.upload_failed'))
    else toast.err(cohortErrors.cohortErrorMessage(e, t('am.submit_failed')))
  }
  finally { submitting.value = false; uploading.value = false }
}

// Раньше загрузка была только в onMounted — на проде с реальной сетевой
// задержкой это давало гонку: при быстром переключении между заданиями
// pending-ответ по старому assignment.id мог перезаписать состояние после
// того, как пользователь уже открыл другое задание (и в итоге оценка
// привязывалась к неправильному заданию или не показывалась вообще).
// Перевёл на watch с immediate + проверкой targetId после await.
const loadMySubmission = async () => {
  if (canSeeSubmissions.value) return
  const targetId = props.assignment.id
  if (targetId == null) return
  try {
    const subs = await svc.mySubmissions()
    // Защита от гонки: если за время запроса пользователь уже переключился
    // на другое задание — не трогаем состояние, актуальный ответ положит
    // уже свежий watcher.
    if (props.assignment.id !== targetId) return
    // assignment_id в JSON может прийти и числом, и строкой (особенно на
    // bigint), поэтому сравниваем через String() — иначе find молча вернёт
    // undefined и у студента не отрендерится оценка.
    mySubmission.value = subs.find(s => String(s.assignment_id) === String(targetId)) ?? null
  } catch (e) {
    // Раньше catch {} молча проглатывал любой сбой загрузки — на проде это
    // значит, что пользователь видит «пустую» страницу без объяснений.
    console.error('[AssignmentDetailPanel] mySubmissions load failed', e)
    toast.err(t('general.error'))
  }
}
watch(() => props.assignment.id, loadMySubmission, { immediate: true })
</script>

<style scoped>
/* ── Ступень поверхностей ────────────────────────────────────────────────
   Шапка и таб-бар — «шасси» на --surface, тело страницы — утопленный фон
   --bg, а контент внутри лежит белыми карточками. Это та же иерархия, что в
   сгруппированных таблицах iOS: раньше всё было одного тона и страница
   читалась как один длинный лист без структуры. */
.adp { background: var(--bg); display: flex; flex-direction: column; height: 100%; overflow: hidden; }
.adp.panel { border-radius: 22px; border: 1px solid var(--border); box-shadow: 0 1px 2px rgba(15,23,42,.05),0 18px 48px rgba(15,23,42,.10); }
.adp.fullpage { border-radius: 0; }

.adp-back {
  display: inline-flex; align-items: center; gap: 5px; align-self: flex-start;
  padding: 4px 10px 4px 6px; margin: 0 0 12px -6px; background: none; border: none;
  border-radius: 100px;
  color: var(--text4); font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: color .15s ease-out, background .15s ease-out, transform .12s ease-out;
}
.adp-back:hover { color: var(--teal); background: rgba(var(--teal-rgb), .08); }
.adp-back:active { transform: scale(.96); }

/* ── Шапка ─────────────────────────────────────────────────────────────── */
.am-head {
  position: relative; z-index: 3;
  display: flex; flex-direction: column; padding: 22px 28px 19px;
  background: var(--surface);
  flex-shrink: 0;
  transition: box-shadow .25s ease-out;
}
.adp.panel .am-head { border-radius: var(--r-xl) var(--r-xl) 0 0; }
/* Scroll edge: тень появляется, только когда контент реально уехал под шапку. */
.am-head.scrolled { box-shadow: 0 1px 0 var(--border), 0 8px 20px rgba(17,24,28,.06); }
html.dark .am-head.scrolled { box-shadow: 0 1px 0 var(--border), 0 10px 24px rgba(0,0,0,.5); }
.am-head-wash {
  position: absolute; inset: 0 0 auto 0; height: 100%;
  background: radial-gradient(ellipse 75% 115% at 0% 0%, rgba(var(--teal-rgb), .12), rgba(var(--teal-rgb), 0) 72%);
  pointer-events: none;
}
.adp.panel .am-head-wash { border-radius: var(--r-xl) var(--r-xl) 0 0; }
.am-head > *:not(.am-head-wash) { position: relative; }
.am-head-l { display: flex; gap: 14px; align-items: flex-start; }
.am-head-txt { min-width: 0; }
.am-ico {
  width: 46px; height: 46px; flex-shrink: 0;
  background: linear-gradient(150deg, var(--teal-h), var(--teal-d)); color: #fff;
  border-radius: 15px; border: 1px solid rgba(255,255,255,.28);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 5px rgba(var(--teal-rgb), .28), 0 8px 20px rgba(var(--teal-rgb), .26);
}
.am-title {
  font-size: 22px; font-weight: 750; letter-spacing: -.028em; line-height: 1.15; font-optical-sizing: auto;
  color: var(--text1); margin-bottom: 9px; word-break: break-word;
}
.am-badges { display: flex; gap: 7px; flex-wrap: wrap; }
.am-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 650; letter-spacing: -.005em; white-space: nowrap;
  color: var(--text3); background: var(--surface2);
  padding: 4px 11px; border-radius: 100px;
}
.am-badge svg { opacity: .7; flex-shrink: 0; }
.am-badge.accent { color: var(--teal); background: rgba(var(--teal-rgb), .11); }
.am-badge.accent svg { opacity: 1; }
.am-badge.overdue { background: var(--red-l); color: var(--red); }
.am-badge.overdue svg { opacity: 1; }

/* ── Segmented control (Apple/iOS) ─────────────────────────────────────── */
.am-tabs-wrap { position: relative; z-index: 2; background: var(--surface); padding: 0 26px 14px; flex-shrink: 0; }
.am-tabs {
  display: flex; gap: 3px; padding: 3px;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 12px;
}
.am-tab {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 8px 16px;
  font-size: 13px; font-weight: 650; letter-spacing: -.01em; color: var(--text3);
  background: transparent; border: none; border-radius: 9px;
  cursor: pointer; font-family: inherit;
  transition: color .2s ease-out, background .2s ease-out, box-shadow .2s ease-out, transform .12s cubic-bezier(.32,.72,0,1);
}
.am-tab:hover { color: var(--text1); }
.am-tab:active { transform: scale(.97); }
.am-tab.active {
  color: var(--text1);
  background: var(--surface);
  box-shadow: 0 1px 2px rgba(17,24,28,.05), 0 3px 8px rgba(17,24,28,.08);
}
html.dark .am-tab.active { background: var(--surface3); box-shadow: 0 2px 6px rgba(0,0,0,.4); }
.tab-count {
  font-size: 11px; font-weight: 700; min-width: 18px; text-align: center;
  padding: 1px 7px; border-radius: 100px;
  background: var(--surface3); color: var(--text3);
  transition: background .2s ease-out, color .2s ease-out;
}
.am-tab.active .tab-count { background: var(--teal); color: #fff; }

/* ── Тело ──────────────────────────────────────────────────────────────── */
.am-body {
  flex: 1; overflow-y: auto; padding: 20px 26px 32px;
  display: flex; flex-direction: column; gap: 20px;
  background: linear-gradient(180deg, var(--bg), color-mix(in srgb, var(--bg) 88%, var(--surface) 12%));
}
.adp.panel .am-body { border-radius: 0 0 var(--r-xl) var(--r-xl); }

/* Двухколоночная раскладка: слева описание/ответ, справа статус/оценка. */
.ad-grid { display: grid; grid-template-columns: 1.55fr 1fr; gap: 24px; align-items: start; }
.ad-col-main { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.ad-col-side { display: flex; flex-direction: column; gap: 14px; min-width: 0; position: sticky; top: 12px; }

/* ── Секции: заголовок «врезкой» над карточкой (iOS grouped list) ──────── */
.section { display: flex; flex-direction: column; gap: 9px; }
.section-label {
  display: flex; align-items: center; gap: 7px; padding-left: 3px;
  font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em;
  color: var(--text4);
}
.section-count {
  font-size: 10.5px; font-weight: 700; letter-spacing: 0; text-transform: none;
  min-width: 18px; text-align: center; padding: 1px 6px; border-radius: 100px;
  background: var(--surface2); color: var(--text3);
}
.section-hint {
  display: flex; align-items: center; gap: 6px; padding-left: 3px;
  font-size: 12px; color: var(--text4); margin-top: -4px;
}
.section-hint svg { flex-shrink: 0; }

.desc-block, .answer-text {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 18px; box-shadow: 0 1px 2px rgba(15,23,42,.035),0 8px 20px rgba(15,23,42,.035);
}
.desc-block {
  font-size: 14px; color: var(--text2); line-height: 1.7;
  padding: 15px 17px; white-space: pre-wrap; word-break: break-word;
}
.answer-text {
  font-size: 13.5px; color: var(--text2); line-height: 1.7;
  padding: 14px 16px; white-space: pre-wrap; word-break: break-word;
  max-height: 320px; overflow-y: auto;
}

/* ── Критерии задания (рубрика) ────────────────────────────────────────── */
.criteria-list { display: flex; flex-direction: column; gap: 8px; }
.criterion {
  position: relative; overflow: hidden;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 16px; padding: 14px 16px 15px 18px;
  box-shadow: 0 1px 2px rgba(15,23,42,.035),0 6px 16px rgba(15,23,42,.025);
  transition: border-color .18s ease-out, box-shadow .18s ease-out, transform .18s cubic-bezier(.22,1,.36,1);
}
.criterion::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: var(--teal); opacity: .8;
}
@media (hover:hover) {
  .criterion:hover { border-color: var(--border2); box-shadow: var(--sh-sm); transform: translateY(-1px); }
}
/* flex-start, а не center: у длинных формулировок критерия номер и балл иначе
   уезжают в вертикальный центр абзаца и теряются. */
.criterion-top { display: flex; align-items: flex-start; gap: 9px; margin-bottom: 3px; }
.criterion-idx {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  margin-top: 1px;
  width: 19px; height: 19px; border-radius: 6px;
  background: var(--surface2); color: var(--text3);
  font-size: 10.5px; font-weight: 800; font-variant-numeric: tabular-nums;
}
.criterion-name { flex: 1; min-width: 0; font-size: 13.5px; font-weight: 700; letter-spacing: -.01em; color: var(--text1); word-break: break-word; }
.criterion-name.long { font-size: 13px; font-weight: 500; line-height: 1.55; letter-spacing: 0; color: var(--text2); }
.criterion-pts {
  flex-shrink: 0; white-space: nowrap; font-variant-numeric: tabular-nums;
  font-size: 13px; font-weight: 800; color: var(--teal);
  background: rgba(var(--teal-rgb), .1); padding: 2px 9px; border-radius: 100px;
}
.criterion-of { font-weight: 600; opacity: .6; }
.criterion-desc { font-size: 12.5px; color: var(--text4); line-height: 1.45; margin: 4px 0 0 28px; }
.criterion-bar { height: 6px; background: var(--surface2); border-radius: 100px; overflow: hidden; margin: 10px 0 0 28px; }
.criterion-bar-fill {
  height: 100%; border-radius: 100px;
  background: linear-gradient(90deg, var(--teal-h), var(--teal));
  transition: width .9s cubic-bezier(.22,1,.36,1);
}

/* ── Форма сдачи ───────────────────────────────────────────────────────── */
.submit-form {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 18px; box-shadow: 0 1px 2px rgba(15,23,42,.04),0 10px 24px rgba(15,23,42,.04);
  padding: 20px; display: flex; flex-direction: column; gap: 16px;
}
.field { display: flex; flex-direction: column; gap: 8px; }
.field-label { font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: var(--text4); }
.inp {
  background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-md);
  padding: 12px 14px; color: var(--text1); font-size: 13.5px; width: 100%;
  transition: border-color .18s ease-out, box-shadow .18s ease-out, background .18s ease-out; font-family: inherit;
}
.inp:focus { border-color: var(--teal); background: var(--surface); box-shadow: 0 0 0 3px rgba(var(--teal-rgb),.12); outline: none; }
.inp-ta { resize: vertical; min-height: 130px; line-height: 1.65; }
.btn-full { width: 100%; justify-content: center; padding: 12px 18px; font-size: 14px; }
.file-drop {
  border: 1.5px dashed var(--border2); border-radius: 16px; padding: 24px 16px;
  display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;
  background: var(--bg);
  transition: border-color .18s ease-out, background .18s ease-out, transform .12s cubic-bezier(.32,.72,0,1);
}
.file-drop:hover { border-color: var(--teal); background: rgba(var(--teal-rgb), .05); }
.file-drop:active { transform: scale(.99); }
.file-drop.has-file { border-style: solid; border-color: rgba(52,199,89,.4); background: rgba(52,199,89,.06); }
.drop-ico {
  width: 42px; height: 42px; border-radius: 13px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface2); color: var(--text3);
  transition: background .18s ease-out, color .18s ease-out;
}
.file-drop:hover .drop-ico { background: rgba(var(--teal-rgb), .12); color: var(--teal); }
.drop-ico.ok { background: rgba(52,199,89,.14); color: var(--green); }
.drop-text { font-size: 13.5px; color: var(--text3); text-align: center; }
.drop-text strong { color: var(--teal); font-weight: 700; }
.file-drop.has-file .drop-text strong { color: var(--text1); }
.drop-hint { font-size: 11.5px; color: var(--text4); text-align: center; }
.attached-files-list {
  display: flex; flex-direction: column; margin-top: 2px;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--r-md); overflow: hidden;
}
.attached-file-row { display: flex; align-items: center; gap: 9px; padding: 9px 11px; border-bottom: 1px solid var(--border); font-size: 12.5px; }
.attached-file-row:last-child { border-bottom: none; }
.attached-file-row .af-name { flex: 1; min-width: 0; font-weight: 550; color: var(--text1); word-break: break-word; overflow-wrap: anywhere; }
.attached-file-row .af-size { color: var(--text4); white-space: nowrap; font-variant-numeric: tabular-nums; }
.attached-file-row .af-rm {
  width: 22px; height: 22px; border-radius: 50%; background: var(--surface2); color: var(--text4);
  border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: 14px; line-height: 1; transition: background .15s, color .15s, transform .12s;
}
.attached-file-row .af-rm:hover { background: var(--red-l); color: var(--red); }
.attached-file-row .af-rm:active { transform: scale(.9); }
.upload-prog-sm { margin-top: 4px; display: flex; flex-direction: column; gap: 5px; }
.upload-track { width: 100%; height: 4px; background: var(--surface2); border-radius: 100px; overflow: hidden; }
.upload-bar-sm { width: 100%; height: 100%; background: linear-gradient(90deg,var(--teal-h),var(--teal)); border-radius: 100px; transform-origin: left; transition: transform .35s cubic-bezier(.22,1,.36,1); }
.upload-prog-sm span { font-size: 11.5px; color: var(--teal); font-weight: 600; }
.overdue-warn {
  display: flex; align-items: center; gap: 9px; padding: 11px 14px;
  background: var(--red-l); border: 1px solid rgba(220,38,38,.2); border-radius: var(--r-md);
  font-size: 13px; line-height: 1.45; color: var(--red);
}
.overdue-warn svg { flex-shrink: 0; }

/* ── Состояние «сдано» ─────────────────────────────────────────────────── */
.notice-panel {
  display: flex; align-items: center; gap: 10px; padding: 15px 17px;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-xl);
  box-shadow: var(--sh-xs);
  font-size: 13.5px; color: var(--text3); line-height: 1.5;
}
.notice-panel svg { flex-shrink: 0; color: var(--text4); }
.sub-status-bar { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.sub-status-chip {
  display: inline-flex; align-items: center; gap: 6px; padding: 5px 13px;
  border-radius: 100px; font-size: 11.5px; font-weight: 800; letter-spacing: .03em;
}
.sub-status-chip.submitted, .sub-status-chip.graded { background: rgba(52,199,89,.12); color: var(--green); }
.sub-status-chip.grading { background: rgba(232,151,58,.14); color: #B45309; }
html.dark .sub-status-chip.grading { color: #F0A94B; }
.sub-status-chip.late { background: var(--red-l); color: var(--red); }
.sub-status-chip.needs_review { background: rgba(232,151,58,.14); color: #B45309; }
html.dark .sub-status-chip.needs_review { color: #F0A94B; }
.sub-date { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text4); }
.sub-date svg { opacity: .8; }
.sub-file { margin-top: 2px; }
.retract-btn { margin-top: 2px; align-self: flex-start; color: var(--text4); font-size: 12.5px; }
.retract-btn:hover { color: var(--red); background: var(--red-l); }

/* Сдано, но ещё не проверено */
.awaiting-card {
  display: flex; align-items: center; gap: 12px; padding: 15px 16px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-xl); box-shadow: var(--sh-xs);
}
.awaiting-ico {
  width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(52,199,89,.13); color: var(--green);
}
.awaiting-title { font-size: 14px; font-weight: 750; letter-spacing: -.015em; color: var(--text1); }
.awaiting-sub { font-size: 12px; color: var(--text4); margin-top: 2px; }

.grading-pending {
  display: flex; align-items: center; gap: 11px; padding: 15px 16px;
  background: var(--surface); border: 1px solid rgba(232,151,58,.3);
  border-radius: var(--r-xl); box-shadow: var(--sh-xs);
  font-size: 13.5px; line-height: 1.45; color: var(--text2);
}
.grading-dots { display: flex; gap: 4px; flex-shrink: 0; }
.grading-dots span { width: 6px; height: 6px; border-radius: 50%; background: #E8973A; animation: bounce .9s ease infinite; }
.grading-dots span:nth-child(2) { animation-delay: .15s; }
.grading-dots span:nth-child(3) { animation-delay: .3s; }
@keyframes bounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)} }

.needs-review-student {
  display: flex; align-items: flex-start; gap: 10px; padding: 15px 16px;
  background: rgba(232,151,58,.09); border: 1px solid rgba(232,151,58,.3);
  border-radius: var(--r-xl); font-size: 13.5px; line-height: 1.55; color: var(--text2);
}
.needs-review-student svg { flex-shrink: 0; margin-top: 1px; color: #E8973A; }

/* ── Needs-review (учитель) ────────────────────────────────────────────── */
.needs-review-banner {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-xl);
  box-shadow: var(--sh-xs);
  padding: 17px 18px; display: flex; flex-direction: column; gap: 12px;
}
.nrb-title {
  display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
  font-size: 11.5px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase;
  color: #B45309; background: rgba(232,151,58,.14); padding: 5px 12px; border-radius: 100px;
}
html.dark .nrb-title { color: #F0A94B; }
.nrb-stats { display: flex; flex-direction: column; gap: 1px; background: var(--bg); border-radius: var(--r-md); overflow: hidden; }
.nrb-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 13px; padding: 10px 12px; background: var(--surface); }
.nrb-row-label { color: var(--text3); }
.nrb-row-value { font-weight: 750; color: var(--text1); font-variant-numeric: tabular-nums; white-space: nowrap; }
.nrb-reasons { display: flex; flex-direction: column; gap: 8px; }
.nrb-reason-row { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; line-height: 1.5; color: var(--text2); }
.nrb-reason-row svg { color: #E8973A; flex-shrink: 0; margin-top: 2px; }
.nrb-section-label { font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: var(--text4); margin-top: 4px; }
.feedback-text { font-size: 13.5px; color: var(--text2); line-height: 1.65; }
.grade-criteria { display: flex; flex-direction: column; gap: 8px; }
.cs-item { background: var(--bg); border-radius: var(--r-md); padding: 11px 13px; }
.cs-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 3px; }
.cs-name { font-size: 13px; font-weight: 650; color: var(--text1); flex: 1; min-width: 0; word-break: break-word; }
.cs-pts { font-size: 12.5px; font-weight: 750; color: var(--text2); flex-shrink: 0; white-space: nowrap; font-variant-numeric: tabular-nums; }
.cs-comment { font-size: 12.5px; color: var(--text4); margin-bottom: 8px; line-height: 1.5; }
.cs-bar { height: 4px; background: var(--surface2); border-radius: 100px; overflow: hidden; }
.cs-bar-fill { height: 100%; background: var(--text3); border-radius: 100px; }

/* ── Работы: сводка ────────────────────────────────────────────────────── */
.subs-wrap { display: flex; flex-direction: column; gap: 14px; }
.subs-stats {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-xl); box-shadow: var(--sh-xs); overflow: hidden;
}
.subs-stats-row { display: flex; }
.stat-chip {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; padding: 15px 8px 13px; position: relative; min-width: 0;
}
.stat-chip:not(:last-child)::after {
  content: ''; position: absolute; right: 0; top: 24%; bottom: 24%; width: 1px; background: var(--border);
}
/* Цифры сводки нейтральные: долю проверенного показывает полоса под ними,
   красить ещё и числа — дублировать одно и то же двумя способами. */
.stat-n { font-size: 26px; font-weight: 800; color: var(--text1); letter-spacing: -.03em; line-height: 1.05; font-variant-numeric: tabular-nums; }
.stat-l { font-size: 11.5px; color: var(--text4); font-weight: 600; }
.subs-progress { padding: 0 16px 15px; display: flex; flex-direction: column; gap: 7px; }
.subs-progress-track { height: 7px; background: var(--surface2); border-radius: 100px; overflow: hidden; }
.subs-progress-fill {
  height: 100%; border-radius: 100px;
  background: linear-gradient(90deg, var(--teal-h), var(--teal));
  transition: width .8s cubic-bezier(.22,1,.36,1);
}
.subs-progress-label { font-size: 11.5px; font-weight: 600; color: var(--text4); font-variant-numeric: tabular-nums; }

.btn-bulk-grade {
  display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
  padding: 13px 16px;
  background: linear-gradient(180deg,var(--teal-h),var(--teal-d)); color: #fff; border: none;
  border-radius: var(--r-lg); font-size: 13.5px; font-weight: 700; cursor: pointer; font-family: inherit;
  box-shadow: 0 1px 2px rgba(var(--teal-rgb),.25), 0 6px 18px rgba(var(--teal-rgb),.24);
  transition: box-shadow .22s cubic-bezier(.32,.72,0,1), transform .15s cubic-bezier(.32,.72,0,1), opacity .15s;
}
.btn-bulk-grade:hover { box-shadow: 0 2px 4px rgba(var(--teal-rgb),.28), 0 10px 26px rgba(var(--teal-rgb),.3); transform: translateY(-1px); }
.btn-bulk-grade:active { transform: scale(.98); }
.btn-bulk-grade:disabled { opacity: .6; cursor: not-allowed; transform: none; box-shadow: none; }

.subs-search {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md);
  transition: border-color .18s ease-out, box-shadow .18s ease-out;
}
.subs-search:focus-within { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(var(--teal-rgb),.12); }
.subs-search svg { color: var(--text4); flex-shrink: 0; }
.subs-search-inp { flex: 1; background: transparent; border: none; outline: none; font-size: 13.5px; color: var(--text1); font-family: inherit; min-width: 0; }
.subs-search-inp::placeholder { color: var(--text4); }
.subs-search-clear {
  background: none; border: none; color: var(--text4); font-size: 17px; cursor: pointer; line-height: 1;
  transition: color .15s; min-width: 30px; min-height: 30px; display: flex; align-items: center; justify-content: center;
}
.subs-search-clear:hover { color: var(--text1); }

/* ── Работы: список (сгруппированная таблица, а не россыпь карточек) ───── */
.subs-list {
  display: flex; flex-direction: column;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-xl); box-shadow: var(--sh-xs); overflow: hidden;
}
.sub-row {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  cursor: pointer; transition: background .12s ease-out;
}
.sub-row:last-child { border-bottom: none; }
.sub-row:hover { background: var(--glass); }
.sub-row:active { background: var(--glass2); }
.sub-info { flex: 1; min-width: 0; }
.sub-chevron { color: var(--text4); flex-shrink: 0; opacity: .55; transition: transform .18s cubic-bezier(.22,1,.36,1), opacity .15s; }
.sub-row:hover .sub-chevron { transform: translateX(2px); opacity: 1; }
.sub-student { font-size: 13.5px; font-weight: 700; letter-spacing: -.01em; color: var(--text1); margin-bottom: 3px; }
.sub-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text4); }
.sub-tag { display: inline-flex; align-items: center; gap: 4px; }
.sub-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }

/* Пилюля балла — один фирменный голубой на всю колонку. Раньше здесь был
   тон по результату (зелёный/оранжевый/красный), и список превращался в
   радугу; цвет результата остался там, где он один и по делу, — в кольце. */
.grade-pill {
  font-size: 12.5px; font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap;
  padding: 2px 9px; border-radius: 100px;
  color: var(--teal); background: rgba(var(--teal-rgb), .12);
}
.grade-pill.lg { font-size: 15px; padding: 5px 13px; }
.gp-of { font-weight: 600; opacity: .6; }
.tone-excellent { --tone: var(--green); --tone-rgb: 22,163,74; }
.tone-good      { --tone: var(--teal);  --tone-rgb: var(--teal-rgb); }
.tone-ok        { --tone: #E8973A;      --tone-rgb: 232,151,58; }
.tone-poor      { --tone: var(--red);   --tone-rgb: 220,38,38; }
html.dark .tone-excellent { --tone-rgb: 74,222,128; }
html.dark .tone-poor { --tone-rgb: 248,113,113; }
html.dark .tone-ok { --tone: #F0A94B; --tone-rgb: 240,169,75; }

/* Нейтрально по умолчанию; цветом выделяются только те статусы, которые
   требуют реакции учителя. */
.status-mini {
  font-size: 10px; font-weight: 750; letter-spacing: .03em; white-space: nowrap;
  padding: 2px 8px; border-radius: 100px; background: var(--surface2); color: var(--text3);
}
.status-mini.needs_review { background: rgba(232,151,58,.14); color: #B45309; }
.status-mini.late { background: var(--red-l); color: var(--red); }
html.dark .status-mini.needs_review { color: #F0A94B; }

/* ── Работы: карточка одной сдачи ──────────────────────────────────────── */
.sub-detail { display: flex; flex-direction: column; gap: 18px; }
.back-sub-btn {
  display: inline-flex; align-items: center; gap: 7px; padding: 7px 13px;
  background: var(--surface); border: 1px solid var(--border); border-radius: 100px;
  font-size: 13px; font-weight: 600; color: var(--text3); cursor: pointer;
  transition: color .15s, border-color .15s, transform .12s cubic-bezier(.32,.72,0,1);
  align-self: flex-start; font-family: inherit; box-shadow: var(--sh-xs);
}
.back-sub-btn:hover { color: var(--text1); border-color: var(--border2); }
.back-sub-btn:active { transform: scale(.97); }
.sub-detail-header {
  display: flex; align-items: center; gap: 14px; padding: 14px 16px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-xl); box-shadow: var(--sh-xs);
}
.sub-detail-id { flex: 1; min-width: 0; }
.sub-student-name { font-size: 16px; font-weight: 750; letter-spacing: -.02em; color: var(--text1); word-break: break-word; }
.sub-student-date { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12px; color: var(--text4); margin-top: 3px; }

/* Сдача без оценки — вместо пустой колонки объясняем, что делать */
.ungraded-card {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 24px 18px; text-align: center;
  background: var(--surface); border: 1px dashed var(--border2);
  border-radius: var(--r-xl);
}
.ungraded-ico {
  width: 44px; height: 44px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface2); color: var(--text4);
}
.ungraded-title { font-size: 14px; font-weight: 750; letter-spacing: -.015em; color: var(--text2); }
.ungraded-sub { font-size: 12px; color: var(--text4); }

.grade-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.grade-actions .btn { flex: 1; min-width: 190px; justify-content: center; padding: 11px 18px; }

/* ── Ручная оценка ─────────────────────────────────────────────────────── */
.manual-grade-form {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-xl);
  box-shadow: var(--sh-sm);
  padding: 18px; display: flex; flex-direction: column; gap: 16px;
}
.mgf-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 750; letter-spacing: -.015em; color: var(--text1);
}
.mgf-title svg { color: var(--teal); }
.mgf-label { font-size: 11.5px; font-weight: 800; color: var(--text4); letter-spacing: .06em; text-transform: uppercase; display: block; margin-bottom: 7px; }
.mgf-score-row { display: flex; align-items: center; gap: 14px; }
.mgf-input {
  width: 84px; flex-shrink: 0; padding: 10px 8px;
  border: 1px solid var(--border); border-radius: var(--r-md);
  background: var(--bg); color: var(--text1);
  font-size: 22px; font-weight: 800; letter-spacing: -.02em; text-align: center;
  font-variant-numeric: tabular-nums; font-family: inherit;
  transition: border-color .18s, box-shadow .18s, background .18s;
}
.mgf-input:focus { border-color: var(--teal); background: var(--surface); box-shadow: 0 0 0 3px rgba(var(--teal-rgb),.12); outline: none; }
.mgf-score-meta { flex: 1; min-width: 0; }
/* Ползунок — крупная цель и мгновенная обратная связь: балл ставится
   движением, а не только набором цифр. Дорожку рисуем сами (нативная с
   accent-color даёт почти чёрный «остаток» в светлой теме). */
.mgf-range {
  -webkit-appearance: none; appearance: none;
  width: 100%; height: 22px; background: transparent; cursor: pointer;
}
.mgf-range::-webkit-slider-runnable-track {
  height: 6px; border-radius: 100px;
  background: linear-gradient(90deg, var(--teal) var(--fill, 0%), var(--surface2) var(--fill, 0%));
}
.mgf-range::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 20px; height: 20px; margin-top: -7px; border-radius: 50%;
  background: #fff; border: .5px solid rgba(0,0,0,.08);
  box-shadow: 0 1px 3px rgba(0,0,0,.22), 0 4px 10px rgba(0,0,0,.12);
  transition: transform .12s cubic-bezier(.32,.72,0,1);
}
.mgf-range:active::-webkit-slider-thumb { transform: scale(1.14); }
.mgf-range::-moz-range-track { height: 6px; border-radius: 100px; background: var(--surface2); }
.mgf-range::-moz-range-progress { height: 6px; border-radius: 100px; background: var(--teal); }
.mgf-range::-moz-range-thumb {
  width: 19px; height: 19px; border-radius: 50%; border: none; background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,.22), 0 4px 10px rgba(0,0,0,.12);
}
.mgf-pct {
  flex-shrink: 0; min-width: 56px; text-align: center;
  font-size: 14px; font-weight: 800; font-variant-numeric: tabular-nums;
  color: var(--tone); background: rgba(var(--tone-rgb), .12);
  padding: 6px 10px; border-radius: 100px;
}
.mgf-textarea {
  width: 100%; padding: 11px 13px; border: 1px solid var(--border); border-radius: var(--r-md);
  background: var(--bg); color: var(--text1); font-size: 13.5px; line-height: 1.6;
  font-family: inherit; resize: vertical; transition: border-color .18s, box-shadow .18s, background .18s; box-sizing: border-box;
}
.mgf-textarea:focus { border-color: var(--teal); background: var(--surface); box-shadow: 0 0 0 3px rgba(var(--teal-rgb),.12); outline: none; }
.mgf-actions { display: flex; justify-content: flex-end; gap: 8px; }

/* ── Служебное ─────────────────────────────────────────────────────────── */
.load-center { display: flex; justify-content: center; padding: 48px; }
.empty-block {
  display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 52px 24px;
  color: var(--text4); font-size: 13.5px; text-align: center;
}
.empty-ico {
  width: 56px; height: 56px; border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface); border: 1px solid var(--border); color: var(--text4);
  box-shadow: var(--sh-xs);
}
.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.variant-badge {
  display: inline-flex; align-items: center; padding: 2px 9px;
  background: var(--surface2); border-radius: 100px;
  font-size: 10.5px; font-weight: 750; color: var(--text3); white-space: nowrap;
}

@media (max-width:900px) {
  .ad-grid { grid-template-columns: 1fr; gap: 18px; }
  .ad-col-side { position: static; }
}
@media (max-width:768px) {
  .am-head { padding: 14px 16px 14px; }
  .am-ico { width: 38px; height: 38px; border-radius: 12px; }
  .am-title { font-size: 18px; margin-bottom: 7px; }
  .am-tabs-wrap { padding: 0 16px 12px; }
  .am-tab { padding: 10px 12px; font-size: 12.5px; white-space: nowrap; min-height: 44px; }
  .am-body { padding: 16px 16px 90px; gap: 16px; }
  .inp { font-size: 16px; }
  .inp-ta { font-size: 16px; min-height: 110px; }
  .submit-form { padding: 14px; }
  .sub-row { padding: 11px 12px; gap: 10px; }
  .sub-student { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sub-meta { flex-wrap: wrap; gap: 5px; }
  .grade-actions { flex-direction: column; gap: 8px; }
  .grade-actions .btn { width: 100%; min-width: 0; }
  .af-rm { width: 32px; height: 32px; font-size: 15px; }
  .subs-search-clear { min-width: 44px; min-height: 44px; }
  .back-sub-btn { min-height: 44px; }
  .stat-chip { padding: 12px 6px 10px; }
  .stat-n { font-size: 22px; }
  .btn-bulk-grade { font-size: 12.5px; padding: 12px; }
  .desc-block { font-size: 13.5px; padding: 13px 14px; }
  .mgf-score-row { gap: 10px; }
  .mgf-input { width: 72px; font-size: 19px; }
  .mgf-pct { min-width: 48px; font-size: 13px; }
}
@media (prefers-reduced-motion:reduce) {
  .am-head,.am-tab,.criterion,.file-drop,.attached-file-row .af-rm,.upload-bar-sm { transition-duration:.12s; }
  .am-tab:active,.criterion:hover,.file-drop:active { transform:none; }
  .grading-dots span { animation:none; }
}
@media (max-width:480px) {
  .am-head { padding: 12px 14px; }
  .am-head-l { gap: 11px; }
  .am-body { padding: 14px 14px 90px; }
  .am-tabs-wrap { padding: 0 14px 12px; }
  .sub-detail-header { padding: 12px 13px; gap: 11px; }
}
</style>
