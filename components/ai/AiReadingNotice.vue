<template>
  <div class="ai-reading-notice">
    <div class="arn-icon"><span class="arn-spinner"></span></div>
    <div class="arn-text">
      <div class="arn-title">{{ title }}</div>
      <div class="arn-sub">{{ sub }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

const props = defineProps<{ ready: number; total: number }>()
const { lang } = useI18n()

const title = computed(() =>
  lang.value === 'ru' ? 'Читаю материалы курса'
    : lang.value === 'kk' ? 'Курс материалдарын оқып жатырмын' : 'Reading course materials')

const sub = computed(() => {
  if (props.total <= 0) {
    return lang.value === 'ru' ? 'Собираю материалы класса — это недолго'
      : lang.value === 'kk' ? 'Сынып материалдарын жинап жатырмын — бұл ұзаққа созылмайды'
      : 'Gathering class materials — won’t take long'
  }
  return lang.value === 'ru' ? `Прочитано ${props.ready} из ${props.total} — чат откроется, как только закончу`
    : lang.value === 'kk' ? `${props.total} ішінен ${props.ready} оқылды — аяқтасымен чат ашылады`
    : `Read ${props.ready} of ${props.total} — chat unlocks once I’m done`
})
</script>

<style scoped>
.ai-reading-notice { display: flex; align-items: flex-start; gap: 11px; margin: 0 18px 10px; padding: 12px 14px; border: 1px solid var(--border); border-radius: 14px; background: var(--surface2); flex-shrink: 0 }
html.dark .ai-reading-notice { background: var(--surface3, var(--surface2)) }
.arn-icon { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(var(--teal-rgb),.14); flex-shrink: 0 }
html.dark .arn-icon { background: rgba(var(--teal-rgb),.22) }
.arn-spinner { width: 13px; height: 13px; border: 2px solid rgba(var(--teal-rgb),.28); border-top-color: var(--teal); border-radius: 50%; animation: arn-spin .7s linear infinite }
@keyframes arn-spin { to { transform: rotate(360deg) } }
.arn-text { flex: 1; min-width: 0 }
.arn-title { font-size: 13px; font-weight: 700; color: var(--text1); line-height: 1.35 }
.arn-sub { font-size: 12.5px; color: var(--text4); line-height: 1.45; margin-top: 1px }
</style>
