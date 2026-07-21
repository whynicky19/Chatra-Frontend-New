<template>
  <div class="pg anim-in">
    <div class="pg-head">
      <NuxtLink to="/settings" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        {{ t('settings.title') }}
      </NuxtLink>
      <h1 class="pg-title">{{ lang==='ru'?'AI лимит':lang==='kk'?'AI лимиті':'AI limit' }}</h1>
      <p class="pg-sub">{{ lang==='ru'?'Дневной лимит сообщений':lang==='kk'?'Күндік хабарлама лимиті':'Daily message limit' }}</p>
    </div>

    <div class="pg-body">
      <div class="scard">
        <div class="scard-head-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M18 17l.7 1.8L20.5 19.5l-1.8.7L18 22l-.7-1.8L15.5 19.5l1.8-.7z"/></svg>
          <h3 class="scard-h3">{{ lang==='ru'?'AI лимит':lang==='kk'?'AI лимиті':'AI limit' }}</h3>
          <span v-if="quota?.unlimited" class="ai-badge">{{ lang==='ru'?'Безлимит':lang==='kk'?'Шексіз':'Unlimited' }}</span>
        </div>

        <div v-if="loading" class="ai-empty">
          <div class="spinner" style="width:16px;height:16px;border-width:2px"></div>
        </div>

        <template v-else-if="quota && !quota.unlimited">
          <div class="ai-track"><div class="ai-fill" :class="{warn: low, over: quota.remaining === 0}" :style="{width: pct + '%'}"></div></div>
          <div class="ai-nums">
            <strong>{{ quota.used }} / {{ quota.limit }}</strong>
            <span>{{ lang==='ru'?'использовано':lang==='kk'?'пайдаланылды':'used' }}</span>
          </div>
          <div class="ai-left" :class="{warn: low, over: quota.remaining === 0}">
            {{ lang==='ru'?'Осталось сообщений':lang==='kk'?'Қалған хабарлама':'Messages left' }}: {{ quota.remaining }}
          </div>
          <div class="ai-reset">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            {{ resetLabel }}
          </div>
        </template>

        <p v-else-if="quota" class="ai-note">
          {{ lang==='ru'?'Для вашего аккаунта дневной лимит сообщений не действует.'
            :lang==='kk'?'Сіздің аккаунтыңызға күндік лимит қолданылмайды.'
            :'The daily message limit does not apply to your account.' }}
        </p>

        <p v-else class="ai-note">
          {{ lang==='ru'?'Не удалось загрузить лимит.':lang==='kk'?'Лимитті жүктеу мүмкін болмады.':'Failed to load the limit.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useApi } from '~/services/api'
import { useI18n } from '~/composables/useI18n'
import type { AiQuota } from '~/composables/useAi'

definePageMeta({ layout: 'default' })

const api = useApi()
const { t, lang } = useI18n()

const quota = ref<AiQuota | null>(null)
const loading = ref(true)
const nowTs = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

const pct = computed(() => {
  const q = quota.value
  if (!q || !q.limit) return 0
  return Math.min(100, Math.round((q.used / q.limit) * 100))
})
const low = computed(() => {
  const r = quota.value?.remaining
  return r != null && r > 0 && r <= 5
})
const resetLabel = computed(() => {
  const at = quota.value?.resets_at
  const fallback = lang.value === 'ru' ? 'Обнуляется раз в сутки'
    : lang.value === 'kk' ? 'Тәулігіне бір рет жаңарады' : 'Resets once a day'
  if (!at) return fallback
  const ms = new Date(at).getTime() - nowTs.value
  if (!Number.isFinite(ms) || ms <= 0) return fallback
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const hh = lang.value === 'en' ? 'h' : lang.value === 'kk' ? 'с' : 'ч'
  const mm = lang.value === 'en' ? 'm' : 'м'
  const left = h > 0 ? `${h}${hh} ${m}${mm}` : `${m}${mm}`
  return (lang.value === 'ru' ? 'Сброс через ' : lang.value === 'kk' ? 'Жаңару: ' : 'Resets in ') + left
})

onMounted(async () => {
  try { quota.value = (await api.get('/ai/limits')).data } catch {}
  loading.value = false
  // Обратный отсчёт до сброса пересчитываем раз в полминуты.
  timer = setInterval(() => { nowTs.value = Date.now() }, 30000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.pg{height:100%;display:flex;flex-direction:column;overflow-y:auto}
.pg-head{padding:28px 32px 0;flex-shrink:0}
.back-link{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:var(--text4);text-decoration:none;margin-bottom:10px;transition:color .15s}
.back-link:hover{color:var(--teal)}
.pg-title{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:26px;font-weight:800;color:var(--text1);margin-bottom:4px}
.pg-sub{font-size:14px;color:var(--text4)}
.pg-body{padding:20px 32px 40px;display:flex;flex-direction:column;gap:20px}
.scard{background:var(--surface);border-radius:20px;padding:24px;box-shadow:var(--sh-sm)}
.scard-head-sm{display:flex;align-items:center;gap:10px;margin-bottom:18px}
.scard-h3{font-size:16px;font-weight:700;color:var(--text1)}

.ai-track{height:10px;border-radius:5px;background:var(--surface2);overflow:hidden}
html.dark .ai-track{background:var(--bg2)}
.ai-fill{height:100%;border-radius:5px;background:linear-gradient(90deg,var(--teal),var(--teal-d));transition:width .7s cubic-bezier(.22,1,.36,1)}
.ai-fill.warn{background:linear-gradient(90deg,#f59e0b,#d97706)}
.ai-fill.over{background:linear-gradient(90deg,var(--red),#dc2626)}
.ai-nums{display:flex;align-items:baseline;gap:7px;margin-top:14px}
.ai-nums strong{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:24px;font-weight:800;color:var(--text1);letter-spacing:-.02em}
.ai-nums span{font-size:13px;color:var(--text4)}
.ai-left{margin-top:2px;font-size:13px;font-weight:600;color:var(--text2)}
.ai-left.warn{color:#b45309}
.ai-left.over{color:var(--red)}
.ai-reset{display:flex;align-items:center;gap:7px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border);font-size:13px;color:var(--text4)}
.ai-badge{margin-left:auto;padding:3px 9px;border-radius:100px;background:var(--teal-l);color:var(--teal);font-size:11px;font-weight:800}
.ai-note{font-size:12.5px;line-height:1.5;color:var(--text4)}
.ai-empty{display:flex;justify-content:center;padding:10px 0}

@media(max-width:768px){.pg-head{padding:20px 18px 0}.pg-body{padding:16px 18px 32px}}
</style>
