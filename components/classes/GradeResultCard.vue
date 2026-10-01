<template>
  <div class="grc" :class="`tone-${tone}`">
    <div class="grc-surface">
      <div class="grc-hero-wash" aria-hidden="true"></div>
      <div class="grc-main">
        <div class="grc-score-pane">
          <ScoreRing :score="grade.score" :max-score="maxScore" />
        </div>

        <div class="grc-copy">
          <div class="grc-eyebrow">{{ t('am.score') }}</div>
          <div class="grc-verdict">{{ t(verdictKey) }}</div>
          <div class="grc-by-badge">
            <svg v-if="gradedByAi" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {{ gradedByAi ? t('am.ai_check') : t('am.teacher') }}
          </div>

          <div v-if="grade.feedback" class="grc-feedback">
            <div class="grc-feedback-head">
              <span class="grc-feedback-icon">
                <svg v-if="gradedByAi" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              {{ gradedByAi ? t('am.ai_analysis_label') : t('am.teacher_comment') }}
            </div>
            <p class="grc-feedback-text">{{ grade.feedback }}</p>
          </div>
        </div>
      </div>

      <section v-if="gradedByAi && showConfidence && aiConfidence != null" class="grc-verification" :aria-label="t('am.verification_title')">
        <div class="grc-verification-summary">
          <div class="grc-verification-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M12 3 5 6v5c0 4.6 2.8 8.5 7 10 4.2-1.5 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div class="grc-verification-copy">
            <div class="grc-verification-kicker">{{ t('am.verification_stage') }}</div>
            <h3>{{ t('am.verification_title') }}</h3>
            <p>{{ t('am.verification_description') }}</p>
          </div>
          <div class="grc-confidence" :aria-label="`${t('am.confidence_result')}: ${aiConfidence}%`">
            <strong>{{ aiConfidence }}<span>%</span></strong>
            <span>{{ t('am.confidence_result') }}</span>
          </div>
        </div>

        <div class="grc-confidence-track" aria-hidden="true">
          <span :style="{ width: `${Math.max(0, Math.min(aiConfidence, 100))}%` }"></span>
        </div>

        <div class="grc-verification-checks">
          <div v-for="item in verificationChecks" :key="item" class="grc-verification-check">
            <span aria-hidden="true"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m5 10 3 3 7-7"/></svg></span>
            {{ item }}
          </div>
        </div>

        <div v-if="reviewReasons.length" class="grc-review-note">
          <strong>{{ t('am.review_reasons_label') }}</strong>
          <span>{{ reviewReasons.join(' · ') }}</span>
        </div>
      </section>

      <div v-if="gradedByAi && (strengths.length || weaknesses.length)" class="grc-analysis-grid">
        <div v-if="strengths.length" class="grc-bullet-card ok">
          <div class="grc-bullet-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>
            {{ t('am.strengths') }}
          </div>
          <div v-for="(s, i) in strengths" :key="i" class="grc-bullet-row">
            <span class="grc-dot"></span><span>{{ s }}</span>
          </div>
        </div>
        <div v-if="weaknesses.length" class="grc-bullet-card warn">
          <div class="grc-bullet-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            {{ t('am.areas_improve') }}
          </div>
          <div v-for="(w, i) in weaknesses" :key="i" class="grc-bullet-row">
            <span class="grc-dot"></span><span>{{ w }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { scoreTone, scoreToneKey } from '~/composables/useScoreTone'
import ScoreRing from './ScoreRing.vue'

interface CriterionScore { name: string; score: number; max: number; comment?: string }

const props = defineProps<{
  grade: { score: number; feedback?: string | null; graded_by: string }
  maxScore: number
  criteria: CriterionScore[]
  aiConfidence?: number | null
  aiReviewReasons?: string | null
  showConfidence?: boolean
}>()

const { t } = useI18n()

const gradedByAi = computed(() => props.grade.graded_by === 'ai' || props.grade.graded_by === 'ai_suggested')
const tone = computed(() => scoreTone(props.grade.score, props.maxScore))
const verdictKey = computed(() => scoreToneKey(tone.value))
const verificationChecks = computed(() => [
  t('am.verification_check_criteria'),
  t('am.verification_check_score'),
  t('am.verification_check_feedback'),
])
const reviewReasons = computed(() => {
  if (!props.aiReviewReasons) return []
  try {
    const parsed = JSON.parse(props.aiReviewReasons)
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : []
  } catch {
    return [props.aiReviewReasons]
  }
})

// Сильные/слабые стороны не приходят с бэка отдельным полем — они получены
// перераспределением уже существующих per-критериальных комментариев ИИ
// (criteria_scores[].comment) по соотношению score/max. Логика идентична
// Flutter-приложению (assignment_detail_screen.dart, _splitStrengthsWeaknesses).
const strengths = computed(() => {
  const out: string[] = []
  for (const c of props.criteria) {
    const ratio = c.max > 0 ? c.score / c.max : 0
    if (ratio < 0.7) continue
    const text = (c.comment || '').trim() || c.name
    if (text) out.push(text)
  }
  return out
})
const weaknesses = computed(() => {
  const out: string[] = []
  for (const c of props.criteria) {
    const ratio = c.max > 0 ? c.score / c.max : 0
    if (ratio >= 0.7) continue
    const text = (c.comment || '').trim() || c.name
    if (text) out.push(text)
  }
  return out
})

</script>

<style scoped>
.grc { width: 100%; animation: grc-materialize .38s cubic-bezier(.22,1,.36,1) both; }
@keyframes grc-materialize {
  from { opacity: 0; transform: translateY(8px) scale(.992); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.tone-excellent { --tone: var(--green); --tone-rgb: 22,163,74; }
.tone-good      { --tone: var(--teal);  --tone-rgb: var(--teal-rgb); }
.tone-ok        { --tone: #E8973A;      --tone-rgb: 232,151,58; }
.tone-poor      { --tone: var(--red);   --tone-rgb: 220,38,38; }
html.dark .tone-excellent { --tone-rgb: 74,222,128; }
html.dark .tone-poor { --tone-rgb: 248,113,113; }
html.dark .tone-ok { --tone: #F0A94B; --tone-rgb: 240,169,75; }

.grc-surface {
  position: relative; overflow: hidden; isolation: isolate;
  border-radius: 26px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 18px 48px rgba(15,23,42,.07);
}
.grc-hero-wash {
  position: absolute; z-index: -1; inset: -55% 42% 18% -18%;
  background: radial-gradient(ellipse at 35% 35%, rgba(var(--tone-rgb), .18), rgba(var(--tone-rgb), 0) 70%);
  pointer-events: none; transform: translateZ(0);
}
.grc-main {
  display: grid; grid-template-columns: minmax(180px, 230px) minmax(0, 1fr);
  align-items: center; min-height: 250px;
}
.grc-score-pane {
  align-self: stretch; display: flex; align-items: center; justify-content: center;
  padding: 24px; border-right: 1px solid var(--border);
}
.grc-copy { padding: 28px 30px; min-width: 0; }
.grc-eyebrow {
  margin-bottom: 7px; font-size: 11px; font-weight: 800; letter-spacing: .08em;
  text-transform: uppercase; color: var(--text4);
}
.grc-verdict {
  font-size: clamp(24px, 3vw, 34px); font-weight: 780; letter-spacing: -.035em;
  color: var(--text1); line-height: 1.08; font-optical-sizing: auto;
}
.grc-by-badge {
  display: inline-flex; align-items: center; gap: 6px; margin-top: 11px;
  font-size: 12px; font-weight: 700; letter-spacing: -.005em;
  color: var(--text3); background: rgba(var(--tone-rgb), .08);
  padding: 5px 10px; border-radius: 100px;
}
.grc-by-badge svg { color: var(--tone); }
.grc-feedback {
  margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--border);
}
.grc-feedback-head {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 800; letter-spacing: .065em; text-transform: uppercase;
  color: var(--text4);
}
.grc-feedback-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 8px; flex-shrink: 0;
  background: var(--tone); color: #fff; box-shadow: 0 3px 10px rgba(var(--tone-rgb), .2);
}
.grc-feedback-text {
  font-size: 14px; line-height: 1.65; color: var(--text2); margin: 10px 0 0;
  white-space: pre-wrap; max-width: 68ch;
}

.grc-verification {
  padding: 20px 22px 22px; border-top: 1px solid var(--border);
  background: linear-gradient(135deg, rgba(var(--teal-rgb), .075), rgba(var(--teal-rgb), .025));
}
.grc-verification-summary { display: grid; grid-template-columns: 42px minmax(0, 1fr) auto; align-items: center; gap: 13px; }
.grc-verification-icon {
  width: 42px; height: 42px; display: grid; place-items: center; border-radius: 14px;
  color: var(--teal); background: rgba(var(--teal-rgb), .12); border: 1px solid rgba(var(--teal-rgb), .14);
}
.grc-verification-icon svg { width: 22px; height: 22px; }
.grc-verification-copy { min-width: 0; }
.grc-verification-kicker { color: var(--teal); font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.grc-verification-copy h3 { margin: 3px 0 0; color: var(--text1); font-size: 15px; font-weight: 760; letter-spacing: -.015em; }
.grc-verification-copy p { max-width: 64ch; margin: 4px 0 0; color: var(--text3); font-size: 12.5px; line-height: 1.45; }
.grc-confidence { display: flex; flex-direction: column; align-items: flex-end; min-width: 80px; }
.grc-confidence strong { color: var(--teal); font-size: 28px; line-height: 1; letter-spacing: -.045em; }
.grc-confidence strong span { font-size: 15px; letter-spacing: -.015em; }
.grc-confidence>span { margin-top: 4px; color: var(--text4); font-size: 9px; font-weight: 750; letter-spacing: .055em; text-transform: uppercase; }
.grc-confidence-track { height: 5px; margin: 15px 0 14px; overflow: hidden; border-radius: 99px; background: rgba(var(--teal-rgb), .12); }
.grc-confidence-track span { display: block; height: 100%; border-radius: inherit; background: var(--teal); transition: width .45s cubic-bezier(.22,1,.36,1); }
.grc-verification-checks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.grc-verification-check { display: flex; align-items: center; gap: 7px; color: var(--text2); font-size: 11.5px; line-height: 1.35; }
.grc-verification-check>span { width: 19px; height: 19px; display: grid; place-items: center; flex: 0 0 auto; border-radius: 50%; background: rgba(var(--teal-rgb), .12); color: var(--teal); }
.grc-verification-check svg { width: 13px; height: 13px; }
.grc-review-note { display: flex; gap: 8px; margin-top: 14px; padding: 10px 12px; border-radius: 12px; background: rgba(232,151,58,.1); color: var(--text2); font-size: 11.5px; line-height: 1.45; }
.grc-review-note strong { flex: 0 0 auto; color: #B45309; }

.grc-analysis-grid {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0;
  border-top: 1px solid var(--border); background: var(--surface);
}
.grc-bullet-card {
  padding: 18px 22px 20px; display: flex; flex-direction: column; gap: 9px;
}
.grc-bullet-card + .grc-bullet-card { border-left: 1px solid var(--border); }
.grc-bullet-card.ok { background: rgba(52,199,89,.035); }
.grc-bullet-card.warn { background: rgba(232,151,58,.035); }
.grc-bullet-title {
  display: flex; align-items: center; gap: 7px;
  font-size: 11.5px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase;
}
.grc-bullet-card.ok .grc-bullet-title { color: var(--green); }
.grc-bullet-card.warn .grc-bullet-title { color: #B45309; }
html.dark .grc-bullet-card.warn .grc-bullet-title { color: #F0A94B; }
.grc-bullet-row { display: flex; align-items: flex-start; gap: 9px; font-size: 13.5px; line-height: 1.55; color: var(--text2); }
.grc-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; margin-top: 7px; }
.grc-bullet-card.ok .grc-dot { background: var(--green); }
.grc-bullet-card.warn .grc-dot { background: #E8973A; }

@media (max-width: 768px) {
  .grc-surface { border-radius: 22px; }
  .grc-main { grid-template-columns: 1fr; }
  .grc-score-pane { padding: 20px 20px 14px; border-right: none; border-bottom: 1px solid var(--border); }
  .grc-copy { padding: 20px; }
  .grc-verdict { font-size: 26px; }
  .grc-feedback { margin-top: 18px; padding-top: 16px; }
  .grc-verification { padding: 18px; }
  .grc-verification-summary { grid-template-columns: 38px minmax(0, 1fr) auto; gap: 10px; }
  .grc-verification-icon { width: 38px; height: 38px; border-radius: 12px; }
  .grc-verification-copy p { display: none; }
  .grc-confidence strong { font-size: 24px; }
  .grc-verification-checks { grid-template-columns: 1fr; gap: 7px; }
  .grc-analysis-grid { grid-template-columns: 1fr; }
  .grc-bullet-card + .grc-bullet-card { border-left: none; border-top: 1px solid var(--border); }
}
@media (prefers-reduced-transparency: reduce) {
  .grc-hero-wash { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .grc { animation: none; }
}
</style>
