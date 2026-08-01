<template>
  <div class="score-ring">
    <svg viewBox="0 0 200 200" class="ring-svg">
      <defs>
        <linearGradient :id="gradId" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" class="ring-stop-start" />
          <stop offset="100%" class="ring-stop-end" />
        </linearGradient>
      </defs>
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
      <div class="ring-score">{{ score }}<span class="ring-max">/ {{ maxScore }}</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

const props = defineProps<{ score: number; maxScore: number }>()

const radius = 82
const strokeWidth = 16
const circumference = 2 * Math.PI * radius

const pct = computed(() => props.maxScore > 0 ? Math.min(1, Math.max(0, props.score / props.maxScore)) : 0)
const dashOffset = computed(() => circumference * (1 - pct.value))
const gradId = `ring-grad-${Math.random().toString(36).slice(2, 9)}`

const mounted = ref(false)
onMounted(() => { requestAnimationFrame(() => { mounted.value = true }) })
</script>

<style scoped>
.score-ring {
  position: relative;
  width: 100%;
  max-width: 220px;
  aspect-ratio: 1;
  margin: 0 auto;
  container-type: inline-size;
  filter: drop-shadow(0 16px 32px rgba(var(--teal-rgb), .28));
}
.ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); overflow: visible; }
.ring-track { fill: none; stroke: var(--border2); }
.ring-progress { fill: none; stroke-linecap: round; transition: stroke-dashoffset 1.3s cubic-bezier(.22,1,.36,1); }
.ring-stop-start { stop-color: var(--teal-h); }
.ring-stop-end { stop-color: var(--teal); }
.ring-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; gap: 4px; padding: 0 16%;
}
.ring-score {
  font-family: -apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;
  font-size: clamp(26px, 9cqw, 42px); font-weight: 800; color: var(--text1); line-height: 1; letter-spacing: -.02em;
}
.ring-max { font-size: 0.42em; font-weight: 600; color: var(--text4); margin-left: 3px; }
</style>
