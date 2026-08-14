<template>
  <div class="score-ring" :class="`tone-${tone}`">
    <svg viewBox="0 0 200 200" class="ring-svg">
      <defs>
        <linearGradient :id="gradId" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" class="ring-stop-start" />
          <stop offset="100%" class="ring-stop-end" />
        </linearGradient>
      </defs>
      <!-- Мягкая заливка внутри кольца: даёт кольцу «дно», из-за которого
           цифра читается как объект на подложке, а не висит в пустоте. -->
      <circle class="ring-fill" cx="100" cy="100" :r="radius - strokeWidth / 2 - 2" />
      <circle class="ring-track" cx="100" cy="100" :r="radius" :stroke-width="strokeWidth" />
      <circle
        class="ring-progress"
        cx="100" cy="100" :r="radius"
        :stroke-width="strokeWidth"
        :stroke="`url(#${gradId})`"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="mounted ? dashOffset : circumference"
      />
    </svg>
    <div class="ring-center">
      <div class="ring-score">{{ displayScore }}<span class="ring-max">/{{ maxScore }}</span></div>
      <div class="ring-pct">{{ Math.round(pct * 100) }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { scoreTone, scoreRatio } from '~/composables/useScoreTone'

const props = defineProps<{ score: number; maxScore: number }>()

const radius = 82
const strokeWidth = 15
const circumference = 2 * Math.PI * radius

const pct = computed(() => scoreRatio(props.score, props.maxScore))
const tone = computed(() => scoreTone(props.score, props.maxScore))
const dashOffset = computed(() => circumference * (1 - pct.value))
const gradId = `ring-grad-${Math.random().toString(36).slice(2, 9)}`

const mounted = ref(false)

// Счётчик балла «набегает» вместе с заполнением дуги — цифра и дуга
// рассказывают одно и то же движение, а не спорят друг с другом. При
// prefers-reduced-motion сразу показываем финальное значение.
const displayScore = ref(props.score)
let raf = 0
onMounted(() => {
  requestAnimationFrame(() => { mounted.value = true })
  const reduce = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce || props.score <= 0) return
  const target = props.score
  const dur = 1100
  const t0 = performance.now()
  displayScore.value = 0
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / dur)
    // та же кривая, что и у дуги (.22,1,.36,1) — приблизительно ease-out quint
    const eased = 1 - Math.pow(1 - p, 5)
    displayScore.value = Math.round(target * eased * 10) / 10
    if (p < 1) raf = requestAnimationFrame(step)
    else displayScore.value = target
  }
  raf = requestAnimationFrame(step)
})
onUnmounted(() => cancelAnimationFrame(raf))
</script>

<style scoped>
.score-ring {
  position: relative;
  width: 100%;
  max-width: 208px;
  aspect-ratio: 1;
  margin: 0 auto;
  container-type: inline-size;
  filter: drop-shadow(0 14px 30px rgba(var(--tone-rgb), .3));
}
/* Тон результата: цвет наконец что-то означает — 9/10 и 3/10 больше не
   выглядят одинаково бирюзовыми. */
.tone-excellent { --tone: var(--green); --tone-rgb: 22,163,74; }
.tone-good      { --tone: var(--teal);  --tone-rgb: var(--teal-rgb); }
.tone-ok        { --tone: #E8973A;      --tone-rgb: 232,151,58; }
.tone-poor      { --tone: var(--red);   --tone-rgb: 220,38,38; }
html.dark .tone-excellent { --tone-rgb: 74,222,128; }
html.dark .tone-poor { --tone-rgb: 248,113,113; }
html.dark .tone-ok { --tone: #F0A94B; --tone-rgb: 240,169,75; }

.ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); overflow: visible; }
.ring-fill { fill: rgba(var(--tone-rgb), .06); }
.ring-track { fill: none; stroke: var(--border2); }
.ring-progress { fill: none; stroke-linecap: round; transition: stroke-dashoffset 1.3s cubic-bezier(.22,1,.36,1); }
/* Первое объявление — фолбэк для движков без color-mix(): просто сплошной тон. */
.ring-stop-start { stop-color: var(--tone); stop-color: color-mix(in oklab, var(--tone) 62%, white); }
.ring-stop-end { stop-color: var(--tone); }
html.dark .ring-stop-start { stop-color: color-mix(in oklab, var(--tone) 78%, white); }

.ring-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; gap: 2px; padding: 0 16%;
}
.ring-score {
  font-size: clamp(26px, 9.5cqw, 44px); font-weight: 800; color: var(--text1);
  line-height: 1; letter-spacing: -.03em; font-variant-numeric: tabular-nums;
}
.ring-max { font-size: 0.4em; font-weight: 600; color: var(--text4); margin-left: 2px; letter-spacing: -.01em; }
.ring-pct {
  margin-top: 4px; font-size: clamp(10px, 3.4cqw, 13px); font-weight: 700;
  letter-spacing: .02em; color: var(--tone); font-variant-numeric: tabular-nums;
}
</style>
