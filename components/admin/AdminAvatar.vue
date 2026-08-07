<template>
  <div class="ad-avatar" :class="size" :style="{ background: bg }">{{ initial }}</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ name: string; seed: number; size?: 'sm' | 'md' }>(), { size: 'sm' })

// Apple system-color family — same set used for the class covers/stat tiles
// elsewhere in the admin panel, so identity colors read as one system.
const COLORS = ['#0A84FF', '#BF5AF2', '#FF9F0A', '#30D158', '#FF375F', '#5E5CE6']
const bg = computed(() => COLORS[Math.abs(props.seed) % COLORS.length])
const initial = computed(() => (props.name || '?').trim().charAt(0).toUpperCase() || '?')
</script>

<style scoped>
.ad-avatar { display: flex; align-items: center; justify-content: center; border-radius: 50%; color: #fff; font-weight: 700; flex-shrink: 0; }
.ad-avatar.sm { width: 28px; height: 28px; font-size: 11px; }
.ad-avatar.md { width: 38px; height: 38px; font-size: 14px; }
</style>
