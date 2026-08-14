<template>
  <div class="grc" :class="`tone-${tone}`">
    <!-- Главный экран результата: кольцо на подкрашенной подложке, вердикт
         словами и кем выставлена оценка. -->
    <div class="grc-hero">
      <div class="grc-hero-wash" aria-hidden="true"></div>
      <div class="grc-hero-inner">
        <ScoreRing :score="grade.score" :max-score="maxScore" />
        <div class="grc-verdict">{{ t(verdictKey) }}</div>
        <div class="grc-by-badge">
          <svg v-if="gradedByAi" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          {{ gradedByAi ? t('am.ai_check') : t('am.teacher') }}
          <template v-if="showConfidence && aiConfidence != null">
            <span class="grc-badge-sep"></span>{{ aiConfidence }}%
          </template>
        </div>
      </div>
    </div>

    <!-- Резюме ИИ — отдельная карточка с «искрой», а не абзац под кольцом:
         это интерпретация, а не часть самого балла. -->
    <div v-if="gradedByAi && grade.feedback" class="grc-summary">
      <div class="grc-summary-head">
        <span class="grc-spark">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </span>
        {{ t('am.ai_analysis_label') }}
      </div>
      <p class="grc-summary-text">{{ grade.feedback }}</p>
    </div>

    <!-- Сильные / слабые стороны — только для оценки ИИ -->
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
  showConfidence?: boolean
}>()

const { t } = useI18n()

const gradedByAi = computed(() => props.grade.graded_by === 'ai' || props.grade.graded_by === 'ai_suggested')
const tone = computed(() => scoreTone(props.grade.score, props.maxScore))
const verdictKey = computed(() => scoreToneKey(tone.value))

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
.grc { display: flex; flex-direction: column; gap: 14px; }

.tone-excellent { --tone: var(--green); --tone-rgb: 22,163,74; }
.tone-good      { --tone: var(--teal);  --tone-rgb: var(--teal-rgb); }
.tone-ok        { --tone: #E8973A;      --tone-rgb: 232,151,58; }
.tone-poor      { --tone: var(--red);   --tone-rgb: 220,38,38; }
html.dark .tone-excellent { --tone-rgb: 74,222,128; }
html.dark .tone-poor { --tone-rgb: 248,113,113; }
html.dark .tone-ok { --tone: #F0A94B; --tone-rgb: 240,169,75; }

/* Hero */
.grc-hero {
  position: relative; overflow: hidden;
  border-radius: var(--r-2xl);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--sh-xs);
}
/* Цветной «свет» сверху карточки — тот же приём, что у iOS Fitness: подложка
   окрашивается результатом, но текст остаётся на нейтральном. */
.grc-hero-wash {
  position: absolute; inset: -40% -20% auto -20%; height: 78%;
  background: radial-gradient(ellipse at 50% 0%, rgba(var(--tone-rgb), .22), rgba(var(--tone-rgb), 0) 70%);
  pointer-events: none;
}
.grc-hero-inner {
  position: relative;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 22px 18px 20px;
}
.grc-verdict {
  font-size: 19px; font-weight: 800; letter-spacing: -.02em; color: var(--text1);
  text-align: center; line-height: 1.2;
}
.grc-by-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 700; letter-spacing: -.005em;
  color: var(--text2); background: var(--surface2);
  border: 1px solid var(--border);
  padding: 5px 12px; border-radius: 100px;
}
.grc-by-badge svg { color: var(--tone); }
.grc-badge-sep { width: 3px; height: 3px; border-radius: 50%; background: var(--text4); margin: 0 2px; }

/* Резюме ИИ */
.grc-summary {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-xl); padding: 15px 16px;
  display: flex; flex-direction: column; gap: 9px;
  box-shadow: var(--sh-xs);
}
.grc-summary-head {
  display: flex; align-items: center; gap: 8px;
  font-size: 11.5px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase;
  color: var(--text4);
}
.grc-spark {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 7px; flex-shrink: 0;
  background: linear-gradient(140deg, var(--teal-h), var(--teal-d)); color: #fff;
  box-shadow: 0 2px 6px rgba(var(--teal-rgb), .3);
}
.grc-summary-text { font-size: 13.5px; line-height: 1.65; color: var(--text2); margin: 0; white-space: pre-wrap; }

/* Сильные / слабые стороны */
.grc-analysis-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
.grc-bullet-card {
  border-radius: var(--r-xl); padding: 14px 15px;
  display: flex; flex-direction: column; gap: 9px; border: 1px solid;
}
.grc-bullet-card.ok { background: rgba(52,199,89,.07); border-color: rgba(52,199,89,.22); }
.grc-bullet-card.warn { background: rgba(232,151,58,.07); border-color: rgba(232,151,58,.24); }
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
  .grc-hero-inner { padding: 18px 14px 16px; }
  .grc-verdict { font-size: 17px; }
}
</style>
