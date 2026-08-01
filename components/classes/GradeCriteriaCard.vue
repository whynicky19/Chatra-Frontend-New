<template>
  <div class="gcc">
    <!-- Критерии: детальный разбор -->
    <div v-if="criteria.length" class="gcc-section">
      <div class="gcc-heading">{{ t('am.by_criteria') }}</div>
      <div class="gcc-criteria-list">
        <div v-for="c in criteria" :key="c.name" class="gcc-criterion">
          <div class="gcc-criterion-top">
            <span class="gcc-criterion-name">{{ c.name }}</span>
            <span class="gcc-criterion-score">{{ c.score }} / {{ c.max }}</span>
          </div>
          <div v-if="rubricDesc(c.name)" class="gcc-criterion-desc">{{ rubricDesc(c.name) }}</div>
          <div class="gcc-criterion-bar"><div class="gcc-criterion-bar-fill" :style="{ width: barWidth(c.score, c.max) }"></div></div>
          <div v-if="c.comment" class="gcc-criterion-comment">{{ c.comment }}</div>
        </div>
      </div>
    </div>

    <!-- Комментарий преподавателя -->
    <div v-if="!gradedByAi && grade.feedback" class="gcc-teacher-comment">
      <div class="gcc-tc-head">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        {{ t('am.teacher_comment') }}
      </div>
      <p class="gcc-tc-text">{{ grade.feedback }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

interface CriterionScore { name: string; score: number; max: number; comment?: string }
interface RubricItem { name: string; description?: string }

const props = defineProps<{
  grade: { score: number; feedback?: string | null; graded_by: string }
  criteria: CriterionScore[]
  rubric?: RubricItem[]
}>()

const { t } = useI18n()

const gradedByAi = computed(() => props.grade.graded_by === 'ai' || props.grade.graded_by === 'ai_suggested')

const rubricDesc = (name: string) => props.rubric?.find(r => r.name === name)?.description || ''
const barWidth = (score: number, max: number) => `${max > 0 ? Math.min(100, Math.max(0, (score / max) * 100)) : 0}%`
</script>

<style scoped>
.gcc { display: flex; flex-direction: column; gap: 22px; }
.gcc-section { display: flex; flex-direction: column; gap: 10px; }
.gcc-heading { display: flex; align-items: center; gap: 7px; font-size: 15px; font-weight: 700; color: var(--text1); }

.gcc-criteria-list { display: flex; flex-direction: column; gap: 10px; }
.gcc-criterion { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 14px; }
.gcc-criterion-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 4px; }
.gcc-criterion-name { font-size: 13.5px; font-weight: 700; color: var(--text1); }
.gcc-criterion-score { font-size: 13px; font-weight: 800; white-space: nowrap; color: var(--teal); }
.gcc-criterion-desc { font-size: 12.5px; color: var(--text4); margin-bottom: 8px; line-height: 1.4; }
.gcc-criterion-bar { height: 6px; background: var(--border); border-radius: 4px; overflow: hidden; margin: 8px 0; }
.gcc-criterion-bar-fill { height: 100%; border-radius: 4px; background: var(--teal); transition: width .8s cubic-bezier(.22,1,.36,1); }
.gcc-criterion-comment { font-size: 13px; color: var(--text3); line-height: 1.55; }

.gcc-teacher-comment { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 16px; }
.gcc-tc-head { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: var(--text4); margin-bottom: 8px; }
.gcc-tc-text { font-size: 14px; line-height: 1.65; color: var(--text1); margin: 0; white-space: pre-wrap; }
</style>
