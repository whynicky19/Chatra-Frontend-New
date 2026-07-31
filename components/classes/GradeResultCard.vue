<template>
  <div class="grc">
    <!-- Круговая карточка результата — главный элемент -->
    <div class="grc-score-block">
      <ScoreRing :score="grade.score" :max-score="maxScore" />
      <div class="grc-by-badge">
        <svg v-if="gradedByAi" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        {{ gradedByAi ? t('am.ai_check') : t('am.teacher') }}
        <template v-if="showConfidence && aiConfidence != null">&nbsp;&nbsp;·&nbsp;&nbsp;{{ t('am.confidence_label') }} {{ aiConfidence }}%</template>
      </div>
      <p v-if="gradedByAi && grade.feedback" class="grc-intro">{{ grade.feedback }}</p>
    </div>

    <!-- Анализ ИИ: сильные / слабые стороны — только для оценки ИИ -->
    <div v-if="gradedByAi && (strengths.length || weaknesses.length)" class="grc-section">
      <div class="grc-heading">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        {{ t('am.ai_analysis_label') }}
      </div>
      <div class="grc-analysis-grid">
        <div v-if="strengths.length" class="grc-bullet-card ok">
          <div class="grc-bullet-title">{{ t('am.strengths') }}</div>
          <div v-for="(s, i) in strengths" :key="i" class="grc-bullet-row">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>{{ s }}</span>
          </div>
        </div>
        <div v-if="weaknesses.length" class="grc-bullet-card warn">
          <div class="grc-bullet-title">{{ t('am.areas_improve') }}</div>
          <div v-for="(w, i) in weaknesses" :key="i" class="grc-bullet-row">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>{{ w }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Критерии: детальный разбор -->
    <div v-if="criteria.length" class="grc-section">
      <div class="grc-heading">{{ t('am.by_criteria') }}</div>
      <div class="grc-criteria-list">
        <div v-for="c in criteria" :key="c.name" class="grc-criterion">
          <div class="grc-criterion-top">
            <span class="grc-criterion-name">{{ c.name }}</span>
            <span class="grc-criterion-score" :style="{ color: bandColor(c.score, c.max) }">{{ c.score }} / {{ c.max }}</span>
          </div>
          <div v-if="rubricDesc(c.name)" class="grc-criterion-desc">{{ rubricDesc(c.name) }}</div>
          <div class="grc-criterion-bar"><div class="grc-criterion-bar-fill" :style="{ width: barWidth(c.score, c.max), background: bandGradient(c.score, c.max) }"></div></div>
          <div v-if="c.comment" class="grc-criterion-comment">{{ c.comment }}</div>
        </div>
      </div>
    </div>

    <!-- Комментарий преподавателя -->
    <div v-if="!gradedByAi && grade.feedback" class="grc-teacher-comment">
      <div class="grc-tc-head">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        {{ t('am.teacher_comment') }}
      </div>
      <p class="grc-tc-text">{{ grade.feedback }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'
import ScoreRing from './ScoreRing.vue'

interface CriterionScore { name: string; score: number; max: number; comment?: string }
interface RubricItem { name: string; description?: string }

const props = defineProps<{
  grade: { score: number; feedback?: string | null; graded_by: string }
  maxScore: number
  criteria: CriterionScore[]
  rubric?: RubricItem[]
  aiConfidence?: number | null
  showConfidence?: boolean
}>()

const { t } = useI18n()

const gradedByAi = computed(() => props.grade.graded_by === 'ai' || props.grade.graded_by === 'ai_suggested')

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

const rubricDesc = (name: string) => props.rubric?.find(r => r.name === name)?.description || ''
const barWidth = (score: number, max: number) => `${max > 0 ? Math.min(100, Math.max(0, (score / max) * 100)) : 0}%`

const bandOf = (score: number, max: number) => {
  const ratio = max > 0 ? score / max : 0
  if (ratio >= 0.85) return ['#34D399', '#059669']
  if (ratio >= 0.70) return ['#60A5FA', '#2563EB']
  if (ratio >= 0.50) return ['#FBBF24', '#D97706']
  return ['#F87171', '#DC2626']
}
const bandColor = (score: number, max: number) => bandOf(score, max)[1]
const bandGradient = (score: number, max: number) => { const [a, b] = bandOf(score, max); return `linear-gradient(90deg, ${a}, ${b})` }
</script>

<style scoped>
.grc { display: flex; flex-direction: column; gap: 22px; }
.grc-score-block { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 8px 0 4px; }
.grc-by-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: var(--teal); background: rgba(var(--teal-rgb), .10); padding: 5px 14px; border-radius: 100px; }
.grc-intro { max-width: 440px; text-align: center; font-size: 14px; line-height: 1.6; color: var(--text3); margin: 0; }

.grc-section { display: flex; flex-direction: column; gap: 10px; }
.grc-heading { display: flex; align-items: center; gap: 7px; font-size: 15px; font-weight: 700; color: var(--text1); }

.grc-analysis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.grc-bullet-card { border-radius: var(--r-lg); padding: 14px; display: flex; flex-direction: column; gap: 8px; border: 1px solid; }
.grc-bullet-card.ok { background: rgba(74,222,128,.07); border-color: rgba(74,222,128,.2); }
.grc-bullet-card.warn { background: rgba(251,191,36,.08); border-color: rgba(251,191,36,.22); }
.grc-bullet-title { font-size: 11.5px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
.grc-bullet-card.ok .grc-bullet-title { color: var(--green); }
.grc-bullet-card.warn .grc-bullet-title { color: #d97706; }
.grc-bullet-row { display: flex; align-items: flex-start; gap: 8px; font-size: 13.5px; line-height: 1.5; color: var(--text2); }
.grc-bullet-card.ok .grc-bullet-row svg { color: var(--green); flex-shrink: 0; margin-top: 1px; }
.grc-bullet-card.warn .grc-bullet-row svg { color: #d97706; flex-shrink: 0; margin-top: 1px; }

.grc-criteria-list { display: flex; flex-direction: column; gap: 10px; }
.grc-criterion { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 14px; }
.grc-criterion-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 4px; }
.grc-criterion-name { font-size: 13.5px; font-weight: 700; color: var(--text1); }
.grc-criterion-score { font-size: 13px; font-weight: 800; white-space: nowrap; }
.grc-criterion-desc { font-size: 12.5px; color: var(--text4); margin-bottom: 8px; line-height: 1.4; }
.grc-criterion-bar { height: 6px; background: var(--border); border-radius: 4px; overflow: hidden; margin: 8px 0; }
.grc-criterion-bar-fill { height: 100%; border-radius: 4px; transition: width .8s cubic-bezier(.22,1,.36,1); }
.grc-criterion-comment { font-size: 13px; color: var(--text3); line-height: 1.55; }

.grc-teacher-comment { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 16px; }
.grc-tc-head { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: var(--text4); margin-bottom: 8px; }
.grc-tc-text { font-size: 14px; line-height: 1.65; color: var(--text1); margin: 0; white-space: pre-wrap; }

@media (max-width: 640px) {
  .grc-analysis-grid { grid-template-columns: 1fr; }
}
</style>
