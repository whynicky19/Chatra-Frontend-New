<template>
  <div class="pg anim-in">
    <div class="pg-body">
      <div class="content-area">
        <!-- Large-title header (iOS style) -->
        <button class="back-row" @click="goBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6"/></svg>
          {{ t('nav.classes') }}
        </button>
        <div class="pg-head">
          <div class="head-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="4" rx="1.5"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
          </div>
          <div>
            <h1 class="pg-title">{{ t('cohort.archived_section') }}</h1>
            <p class="pg-sub">{{ lang==='ru' ? 'Прошлые учебные годы — только просмотр' : lang==='kk' ? 'Өткен оқу жылдары — тек қарау' : 'Past academic years — view only' }}</p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="classes-grid">
          <div v-for="n in 3" :key="n" class="class-card skeleton-card">
            <div class="skel-cover"></div>
            <div class="skel-body"><div class="skel-line skel-title"></div><div class="skel-line skel-desc"></div></div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="!archivedClasses.length" class="empty-state">
          <div class="es-icon-wrap">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="4" width="18" height="4" rx="1.5"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
          </div>
          <div class="es-title">{{ lang==='ru' ? 'Архив пуст' : lang==='kk' ? 'Мұрағат бос' : 'Archive is empty' }}</div>
          <div class="es-sub">{{ lang==='ru' ? 'Здесь появятся классы прошлых учебных лет' : lang==='kk' ? 'Мұнда өткен оқу жылдарының сыныптары көрінеді' : 'Classes from past academic years will appear here' }}</div>
        </div>

        <!-- Grid -->
        <div v-else class="classes-grid">
          <div v-for="cls in archivedClasses" :key="cls.id" class="class-card arch-card" @click="goClass(cls.id)">
            <div class="card-cover" :style="cls.cover_image ? {} : {background: coverGrad(cls.id)}">
              <img v-if="cls.cover_image" :src="cls.cover_image" class="card-cover-img" loading="lazy" decoding="async"/>
              <div class="card-cover-dim"></div>
              <div class="card-archive-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="4" rx="1.5"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8"/></svg>
                {{ t('cohort.archived_badge') }}
              </div>
            </div>
            <div class="card-body">
              <h3 class="card-name">{{ cls.name }}</h3>
              <p class="card-desc">{{ cls.description || (lang==='ru' ? 'Только просмотр' : 'View only') }}</p>
              <div class="card-footer">
                <button class="card-action-btn" @click.stop="goClass(cls.id)">{{ lang==='ru' ? 'Открыть' : 'Open' }} →</button>
                <button class="ctrl-btn" @click.stop="doLeave(cls)" :title="t('classes.left')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from '#app'
import { useAuthStore } from '~/stores/auth.store'
import { useClassesSvc, type ClassResponse } from '~/services/classes'
import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'

definePageMeta({ layout: 'default' })

const router = useRouter()
const auth = useAuthStore()
const classesSvc = useClassesSvc()
const toast = useToast()
const { t, lang } = useI18n()

const allClasses = ref<ClassResponse[]>([])
const loading = ref(true)

const joinedKey = computed(() => `_joined_${auth.user?.id || 0}`)
const joinedIds = ref<number[]>([])
const loadJoined = () => { try { joinedIds.value = JSON.parse(localStorage.getItem(joinedKey.value) || '[]') } catch { joinedIds.value = [] } }
const saveJoined = () => localStorage.setItem(joinedKey.value, JSON.stringify(joinedIds.value))

const visible = computed(() => auth.isAdmin ? allClasses.value : allClasses.value.filter(c => joinedIds.value.includes(c.id)))
const archivedClasses = computed(() => visible.value.filter(c => c.is_archived_for_user))

const covers = [
  'linear-gradient(135deg,#006475,#009aaf)',
  'linear-gradient(135deg,#0c4a6e,#0369a1)',
  'linear-gradient(135deg,#134e4a,#0d9488)',
  'linear-gradient(135deg,#312e81,#4338ca)',
  'linear-gradient(135deg,#1e3a5f,#2563eb)',
]
const coverGrad = (id: number) => covers[id % covers.length]

const goBack = () => router.push('/')
const goClass = (id: number) => router.push(`/classes/${id}`)
const doLeave = async (cls: ClassResponse) => {
  try { await classesSvc.leave(cls.id) } catch {}
  joinedIds.value = joinedIds.value.filter(i => i !== cls.id); saveJoined()
  toast.ok(t('classes.left_ok'))
}

const load = async () => {
  loading.value = true
  try { allClasses.value = await classesSvc.list() } catch { toast.err(t('general.error')) } finally { loading.value = false }
}
watch(() => auth.user?.id, (id) => { if (id) loadJoined() }, { immediate: true })
onMounted(() => load())
</script>

<style scoped>
.pg{height:100%;display:flex;flex-direction:column;background:var(--bg);overflow:hidden}
.pg-body{flex:1;overflow-y:auto;width:100%}
.content-area{padding:24px 32px 80px;width:100%;box-sizing:border-box;max-width:1100px;margin:0 auto}

.back-row{display:inline-flex;align-items:center;gap:2px;background:none;border:none;color:var(--teal);font-size:15px;font-weight:500;cursor:pointer;padding:4px 0;margin-bottom:16px;font-family:inherit;transition:opacity .15s}
.back-row:hover{opacity:.7}

.pg-head{display:flex;align-items:center;gap:16px;margin-bottom:28px}
.head-icon{width:52px;height:52px;border-radius:15px;background:var(--surface2);display:flex;align-items:center;justify-content:center;color:var(--text3);flex-shrink:0}
.pg-title{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:30px;font-weight:800;color:var(--text1);letter-spacing:-.02em;line-height:1.1}
.pg-sub{font-size:14px;color:var(--text4);margin-top:4px;line-height:1.4}

.classes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}

.class-card{background:var(--surface);border-radius:var(--r-xl);overflow:hidden;cursor:pointer;transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s;box-shadow:var(--sh-xs);border:1px solid var(--border)}
.class-card:hover{transform:translateY(-3px);box-shadow:var(--sh-md)}
.arch-card{opacity:.82;filter:grayscale(.28)}
.arch-card:hover{opacity:1;filter:grayscale(0)}
.card-cover{position:relative;height:150px;overflow:hidden;background:linear-gradient(135deg,#006475,var(--teal-h))}
.card-cover-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.card-cover-dim{position:absolute;inset:0;background:rgba(0,0,0,.3)}
.card-archive-badge{position:absolute;top:10px;left:10px;z-index:2;display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;background:rgba(0,0,0,.5);color:rgba(255,255,255,.95);padding:4px 10px;border-radius:100px;letter-spacing:.03em;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.18)}
.card-body{padding:16px 18px 14px}
.card-name{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:16px;font-weight:700;color:var(--text1);line-height:1.25;margin-bottom:5px}
.card-desc{font-size:13px;color:var(--text4);line-height:1.5;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card-footer{display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border);padding-top:12px}
.card-action-btn{font-size:13px;font-weight:600;color:var(--teal);background:none;border:none;cursor:pointer;padding:0;font-family:inherit;transition:opacity .15s}
.card-action-btn:hover{opacity:.7}
.ctrl-btn{width:32px;height:32px;border-radius:50%;background:var(--surface2);border:1px solid var(--border);color:var(--text4);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
.ctrl-btn:hover{background:var(--red-l);border-color:rgba(220,38,38,.25);color:var(--red)}

.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:70px 40px;gap:10px;text-align:center}
.es-icon-wrap{width:72px;height:72px;border-radius:20px;background:var(--surface2);display:flex;align-items:center;justify-content:center;color:var(--text4);margin-bottom:6px}
.es-title{font-size:19px;font-weight:700;color:var(--text2)}
.es-sub{font-size:14px;color:var(--text4);max-width:320px;line-height:1.6}

@keyframes skel-shine{0%{background-position:-200px 0}100%{background-position:calc(200px + 100%) 0}}
.skeleton-card{pointer-events:none}
.skel-cover{height:150px;background:linear-gradient(90deg,var(--surface2) 25%,var(--surface3) 50%,var(--surface2) 75%);background-size:400px 100%;animation:skel-shine 1.4s ease infinite}
.skel-body{padding:16px 18px;display:flex;flex-direction:column;gap:10px}
.skel-line{height:14px;border-radius:6px;background:linear-gradient(90deg,var(--surface2) 25%,var(--surface3) 50%,var(--surface2) 75%);background-size:400px 100%;animation:skel-shine 1.4s ease infinite}
.skel-title{width:70%}.skel-desc{width:90%;height:11px}

@media (max-width:768px){
  .content-area{padding:16px 12px 80px}
  .pg-title{font-size:24px}
  .classes-grid{grid-template-columns:1fr;gap:14px}
  .ctrl-btn{width:40px;height:40px}
}
</style>
