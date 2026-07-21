<template>
  <div class="ai-limit-notice">
    <div class="aln-icon">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
    </div>
    <div class="aln-text">
      <div class="aln-title">{{ title }}</div>
      <div class="aln-sub">{{ sub }}</div>
    </div>
    <NuxtLink to="/ai-limit" class="aln-link">{{ lang==='ru'?'Подробнее':lang==='kk'?'Толығырақ':'Details' }}</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '~/composables/useI18n'
import type { AiQuota } from '~/composables/useAi'

const props = defineProps<{ quota: AiQuota | null }>()
const { lang } = useI18n()

// Обратный отсчёт до сброса пересчитываем раз в полминуты.
const nowTs = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => { timer = setInterval(() => { nowTs.value = Date.now() }, 30000) })
onUnmounted(() => { if (timer) clearInterval(timer) })

const title = computed(() =>
  lang.value === 'ru' ? 'Дневной лимит исчерпан'
    : lang.value === 'kk' ? 'Күндік лимит бітті' : 'Daily limit reached')

const sub = computed(() => {
  const limit = props.quota?.limit ?? 0
  const used = lang.value === 'ru' ? `Вы использовали все ${limit} сообщений на сегодня.`
    : lang.value === 'kk' ? `Бүгінге барлық ${limit} хабарламаны пайдаландыңыз.`
    : `You have used all ${limit} messages for today.`

  const at = props.quota?.resets_at
  const ms = at ? new Date(at).getTime() - nowTs.value : NaN
  if (!Number.isFinite(ms) || ms <= 0) {
    return `${used} ${lang.value==='ru' ? 'Обнуляется раз в сутки.'
      : lang.value==='kk' ? 'Тәулігіне бір рет жаңарады.' : 'Resets once a day.'}`
  }
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const hh = lang.value === 'en' ? 'h' : lang.value === 'kk' ? 'с' : 'ч'
  const mm = lang.value === 'en' ? 'm' : 'м'
  const left = h > 0 ? `${h}${hh} ${m}${mm}` : `${m}${mm}`
  const prefix = lang.value === 'ru' ? 'Сброс через' : lang.value === 'kk' ? 'Жаңару:' : 'Resets in'
  return `${used} ${prefix} ${left}.`
})
</script>

<style scoped>
.ai-limit-notice { display: flex; align-items: flex-start; gap: 11px; margin: 0 18px 10px; padding: 12px 14px; border: 1px solid var(--border); border-radius: 14px; background: var(--surface2); flex-shrink: 0 }
html.dark .ai-limit-notice { background: var(--surface3, var(--surface2)) }
.aln-icon { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(245,158,11,.14); color: #b45309; flex-shrink: 0 }
html.dark .aln-icon { background: rgba(245,158,11,.2); color: #fbbf24 }
.aln-text { flex: 1; min-width: 0 }
.aln-title { font-size: 13px; font-weight: 700; color: var(--text1); line-height: 1.35 }
.aln-sub { font-size: 12.5px; color: var(--text4); line-height: 1.45; margin-top: 1px }
.aln-link { align-self: center; font-size: 12.5px; font-weight: 600; color: var(--teal); text-decoration: none; white-space: nowrap }
.aln-link:hover { text-decoration: underline }
</style>
