<template>
  <span
    class="fti"
    :class="`fti-${size}`"
    :style="{ '--fti-color': visual.color, '--fti-bg': visual.bg }"
    aria-hidden="true"
  >
    <svg class="fti-sheet" viewBox="0 0 32 38" fill="none">
      <path d="M6.5 2.5h12l7 7v25a1 1 0 0 1-1 1h-18a1 1 0 0 1-1-1v-31a1 1 0 0 1 1-1Z" fill="var(--surface)" stroke="currentColor" stroke-width="1.35"/>
      <path d="M18.5 2.8v6.4a1 1 0 0 0 1 1h5.8" fill="var(--fti-bg)" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/>
      <path d="M10 15.5h11.5M10 19.5h9M10 23.5h6.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" opacity=".42"/>
    </svg>
    <span class="fti-label">{{ visual.label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { fileVisual } from '~/composables/useFileVisual'

const props = withDefaults(defineProps<{ url: string; size?: 'compact' | 'small' | 'large' }>(), { size: 'small' })
const visual = computed(() => fileVisual(props.url))
</script>

<style scoped>
.fti {
  --fti-color:#8e8e93; --fti-bg:rgba(142,142,147,.14);
  position:relative; display:inline-flex; align-items:center; justify-content:center;
  flex-shrink:0; color:var(--fti-color);
  background:linear-gradient(145deg,color-mix(in srgb,var(--fti-color) 13%,var(--surface)),var(--surface));
  border:1px solid color-mix(in srgb,var(--fti-color) 22%,var(--border));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 3px 10px rgba(15,23,42,.07);
  overflow:hidden;
}
.fti-compact { width:29px; height:32px; border-radius:9px; }
.fti-small { width:42px; height:42px; border-radius:12px; }
.fti-large { width:82px; height:94px; border-radius:22px; }
.fti-sheet { width:29px; height:34px; filter:drop-shadow(0 2px 2px rgba(15,23,42,.08)); }
.fti-compact .fti-sheet { width:22px; height:26px; }
.fti-large .fti-sheet { width:57px; height:68px; }
.fti-label {
  position:absolute; left:50%; bottom:4px; transform:translateX(-50%);
  min-width:22px; padding:2px 4px; border-radius:5px;
  color:#fff; background:var(--fti-color);
  font:800 7px/1 -apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif;
  letter-spacing:.035em; text-align:center;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 1px 3px rgba(15,23,42,.16);
}
.fti-large .fti-label { bottom:9px; min-width:34px; padding:3px 7px; border-radius:7px; font-size:9px; }
.fti-compact .fti-label { bottom:2px; min-width:18px; padding:1px 3px; border-radius:4px; font-size:5.5px; }
html.dark .fti { box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 4px 12px rgba(0,0,0,.28); }
@media (prefers-contrast:more){.fti{border-width:2px}}
</style>
