<template>
  <div class="gcc">
    <!-- Критерии: детальный разбор -->
    <div v-if="criteria.length" class="gcc-section">
      <div class="gcc-heading">
        <span class="gcc-heading-txt">{{ t('am.by_criteria') }}</span>
        <span class="gcc-heading-sum">{{ earned }} / {{ possible }}</span>
      </div>
      <div class="gcc-criteria-list">
        <div v-for="(c, i) in criteria" :key="c.name" :class="['gcc-criterion', `tone-${toneOf(c)}`]">
          <div class="gcc-criterion-top">
            <span class="gcc-idx">{{ i + 1 }}</span>
            <!-- См. AssignmentDetailPanel: в «названии» критерия может лежать
                 целая инструкция — жирным абзацем она нечитаема. -->
            <span class="gcc-criterion-name" :class="{ long: (c.name || '').length > 120 }">{{ c.name }}</span>
            <span class="gcc-criterion-score">{{ c.score }}<span class="gcc-of">/{{ c.max }}</span></span>
          </div>
          <div v-if="rubricDesc(c.name)" class="gcc-criterion-desc">{{ rubricDesc(c.name) }}</div>
          <div class="gcc-criterion-bar"><div class="gcc-criterion-bar-fill" :style="{ width: barWidth(c.score, c.max) }"></div></div>
          <div v-if="c.comment" class="gcc-criterion-comment">
            <span class="gcc-quote"></span>{{ c.comment }}
          </div>
        </div>
      </div>
    </div>

    <!-- Комментарий преподавателя -->
    <div v-if="!gradedByAi && grade.feedback" class="gcc-teacher-comment">
      <div class="gcc-tc-head">
        <span class="gcc-tc-ava">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </span>
        {{ t('am.teacher_comment') }}
      </div>
      <p class="gcc-tc-text">{{ grade.feedback }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { scoreTone } from '~/composables/useScoreTone'

interface CriterionScore { name: string; score: number; max: number; comment?: string }
interface RubricItem { name: string; description?: string }

const props = defineProps<{
  grade: { score: number; feedback?: string | null; graded_by: string }
  criteria: CriterionScore[]
  rubric?: RubricItem[]
}>()

const { t } = useI18n()

const gradedByAi = computed(() => props.grade.graded_by === 'ai' || props.grade.graded_by === 'ai_suggested')

// Итог по критериям показываем в заголовке — иначе, чтобы понять «сколько
// всего набрано в этом разборе», приходилось складывать строки глазами.
const earned = computed(() => Math.round(props.criteria.reduce((s, c) => s + (c.score || 0), 0) * 10) / 10)
const possible = computed(() => Math.round(props.criteria.reduce((s, c) => s + (c.max || 0), 0) * 10) / 10)

const toneOf = (c: CriterionScore) => scoreTone(c.score, c.max)
const rubricDesc = (name: string) => props.rubric?.find(r => r.name === name)?.description || ''
const barWidth = (score: number, max: number) => `${max > 0 ? Math.min(100, Math.max(0, (score / max) * 100)) : 0}%`
</script>

<style scoped>
.gcc { display: flex; flex-direction: column; gap: 16px; }
.gcc-section { display: flex; flex-direction: column; gap: 10px; }
/* Тот же «eyebrow»-заголовок, что у остальных секций страницы задания, —
   иначе разбор по критериям выбивался из общей сетки заголовков. */
.gcc-heading {
  display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-left: 3px;
}
.gcc-heading-txt {
  font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em;
  color: var(--text4);
}
.gcc-heading-sum {
  font-size: 11.5px; font-weight: 800; color: var(--text3);
  background: var(--surface2); padding: 2px 9px; border-radius: 100px;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}

.gcc-criteria-list { display: flex; flex-direction: column; gap: 8px; }

/* Каждый критерий — карточка с левой цветной кромкой: тон сразу говорит,
   где потеряны баллы, ещё до чтения цифр. */
.gcc-criterion {
  position: relative; overflow: hidden;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 13px 15px 14px 17px;
  box-shadow: var(--sh-xs);
  transition: border-color .18s ease-out, box-shadow .18s ease-out, transform .18s cubic-bezier(.22,1,.36,1);
}
.gcc-criterion::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: var(--tone); opacity: .85;
}
@media (hover:hover) {
  .gcc-criterion:hover { border-color: var(--border2); box-shadow: var(--sh-sm); transform: translateY(-1px); }
}

.tone-excellent { --tone: var(--green); --tone-rgb: 22,163,74; }
.tone-good      { --tone: var(--teal);  --tone-rgb: var(--teal-rgb); }
.tone-ok        { --tone: #E8973A;      --tone-rgb: 232,151,58; }
.tone-poor      { --tone: var(--red);   --tone-rgb: 220,38,38; }
html.dark .tone-excellent { --tone-rgb: 74,222,128; }
html.dark .tone-poor { --tone-rgb: 248,113,113; }
html.dark .tone-ok { --tone: #F0A94B; --tone-rgb: 240,169,75; }

.gcc-criterion-top { display: flex; align-items: flex-start; gap: 9px; margin-bottom: 3px; }
.gcc-idx {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  margin-top: 1px;
  width: 19px; height: 19px; border-radius: 6px;
  background: var(--surface2); color: var(--text3);
  font-size: 10.5px; font-weight: 800; font-variant-numeric: tabular-nums;
}
.gcc-criterion-name { flex: 1; min-width: 0; font-size: 13.5px; font-weight: 700; letter-spacing: -.01em; color: var(--text1); word-break: break-word; }
.gcc-criterion-name.long { font-size: 13px; font-weight: 500; line-height: 1.55; letter-spacing: 0; color: var(--text2); }
.gcc-criterion-score {
  flex-shrink: 0; white-space: nowrap; font-variant-numeric: tabular-nums;
  font-size: 13px; font-weight: 800; color: var(--tone);
  background: rgba(var(--tone-rgb), .1); padding: 2px 9px; border-radius: 100px;
}
.gcc-of { font-weight: 600; opacity: .65; }
.gcc-criterion-desc { font-size: 12.5px; color: var(--text4); line-height: 1.45; margin: 4px 0 0 28px; }
.gcc-criterion-bar { height: 6px; background: var(--surface2); border-radius: 100px; overflow: hidden; margin: 10px 0 0 28px; }
.gcc-criterion-bar-fill {
  height: 100%; border-radius: 100px;
  background: linear-gradient(90deg, color-mix(in oklab, var(--tone) 65%, white), var(--tone));
  transition: width .9s cubic-bezier(.22,1,.36,1);
}
.gcc-criterion-comment {
  position: relative; margin: 10px 0 0 28px; padding-left: 11px;
  font-size: 13px; color: var(--text3); line-height: 1.55;
}
.gcc-quote { position: absolute; left: 0; top: 3px; bottom: 3px; width: 2px; border-radius: 2px; background: var(--border2); }

/* Комментарий преподавателя */
.gcc-teacher-comment {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-xl); padding: 15px 16px; box-shadow: var(--sh-xs);
}
.gcc-tc-head {
  display: flex; align-items: center; gap: 8px;
  font-size: 11.5px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase;
  color: var(--text4); margin-bottom: 9px;
}
.gcc-tc-ava {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: 22px; height: 22px; border-radius: 7px;
  background: var(--surface2); color: var(--text3);
}
.gcc-tc-text { font-size: 13.5px; line-height: 1.65; color: var(--text2); margin: 0; white-space: pre-wrap; }
</style>
