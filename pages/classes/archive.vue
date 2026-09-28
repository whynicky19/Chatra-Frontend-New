<template>
  <div class="pg anim-in">
    <div class="pg-body">
      <div class="content-area">
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

        <div v-if="loading" class="classes-grid">
          <div v-for="n in 3" :key="n" class="class-card skeleton-card">
            <div class="skel-cover"></div>
            <div class="skel-body"><div class="skel-line skel-title"></div><div class="skel-line skel-desc"></div></div>
          </div>
        </div>

        <div v-else-if="!archivedClasses.length" class="empty-state">
          <div class="es-icon-wrap">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="4" width="18" height="4" rx="1.5"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
          </div>
          <div class="es-title">{{ lang==='ru' ? 'Архив пуст' : lang==='kk' ? 'Мұрағат бос' : 'Archive is empty' }}</div>
          <div class="es-sub">{{ lang==='ru' ? 'Здесь появятся предметы прошлых учебных лет' : lang==='kk' ? 'Мұнда өткен оқу жылдарының пәндері көрінеді' : 'Subjects from past academic years will appear here' }}</div>
        </div>

        <div v-else class="classes-grid">
          <div v-for="cls in archivedClasses" :key="cls.id" class="class-card arch-card"
               role="link" tabindex="0" :aria-label="cls.name"
               @click="goClass(cls.id)" @keydown.enter.self="goClass(cls.id)" @keydown.space.self.prevent="goClass(cls.id)">
            <div class="card-cover" :style="(cls.cover_thumbnail || cls.cover_image || cls.cover_color) ? {} : {background: coverGrad(cls.id)}">
              <SubjectCover :src="cls.cover_thumbnail || cls.cover_image" :icon="cls.cover_icon" :cover-source="cls.cover_source"
                            :color="cls.cover_color" :size="58" class="card-cover-art"/>
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
                <button class="card-action-btn" @click.stop="goClass(cls.id)">
                  <span>{{ lang==='ru' ? 'Открыть' : lang==='kk' ? 'Ашу' : 'Open' }}</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
                </button>
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

// Членство — серверная истина (как на главной и в приложении): GET /classes/
// возвращает нужный набор per-user, поэтому не фильтруем по localStorage —
// иначе на новом браузере/устройстве архив был бы пуст.
const archivedClasses = computed(() => allClasses.value.filter(c => c.is_archived_for_user))

const covers = [
  'linear-gradient(135deg,#3a3a3c,#232326)',
  'linear-gradient(135deg,#92400e,#d97706)',
  'linear-gradient(135deg,#9f1239,#e11d48)',
  'linear-gradient(135deg,#065f46,#059669)',
  'linear-gradient(135deg,#3730a3,#4f46e5)',
  'linear-gradient(135deg,var(--teal-d),var(--teal))',
]
const coverGrad = (id: number) => covers[id % covers.length]

const goBack = () => router.push('/')
const goClass = (id: number) => router.push(`/classes/${id}`)
const doLeave = async (cls: ClassResponse) => {
  // UI меняем только после успеха: при ошибке (напр. 403 архивного потока)
  // членство остаётся на сервере — иначе класс «исчезал», а после reload
  // возвращался.
  try {
    await classesSvc.leave(cls.id)
  } catch (e: any) {
    toast.err(e?.response?.data?.detail || t('general.error'))
    return
  }
  allClasses.value = allClasses.value.filter(c => c.id !== cls.id)
  toast.ok(t('classes.left_ok'))
}

const load = async () => {
  loading.value = true
  try { allClasses.value = await classesSvc.list() } catch { toast.err(t('general.error')) } finally { loading.value = false }
}
watch(() => auth.user?.id, (id) => { if (id) load() })
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
.pg-title{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI Variable','Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:30px;font-weight:800;color:var(--text1);letter-spacing:-.02em;line-height:1.1}
.pg-sub{font-size:14px;color:var(--text4);margin-top:4px;line-height:1.4}

.classes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(288px,1fr));gap:22px}

.class-card{position:relative;isolation:isolate;display:flex;flex-direction:column;background:color-mix(in srgb,var(--surface) 94%,transparent);border-radius:24px;overflow:hidden;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.04),0 10px 28px rgba(28,28,30,.055);border:1px solid color-mix(in srgb,var(--border2) 70%,transparent);transform:translateZ(0)}
.class-card::before{content:'';position:absolute;inset:0;z-index:-1;border-radius:inherit;pointer-events:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.72)}
.class-card:hover{transform:translateY(-4px) scale(1.006);box-shadow:0 2px 4px rgba(0,0,0,.04),0 18px 44px rgba(28,28,30,.11);border-color:var(--border2)}
.class-card:active{transform:scale(.985);transition-duration:.1s}
.class-card:focus-visible{outline:3px solid rgba(var(--teal-rgb),.32);outline-offset:3px;border-radius:24px}
.arch-card{opacity:.84;filter:saturate(.76)}
.arch-card:hover,.arch-card:focus-within{opacity:1;filter:saturate(1)}
:global(html.dark) .class-card{background:color-mix(in srgb,var(--surface) 92%,transparent);box-shadow:0 1px 0 rgba(255,255,255,.03),0 16px 36px rgba(0,0,0,.28)}
:global(html.dark) .class-card::before{box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
.card-cover{position:relative;height:150px;margin:8px 8px 0;overflow:hidden;border-radius:17px;background:linear-gradient(135deg,#3a3a3c,#232326);box-shadow:inset 0 0 0 1px rgba(255,255,255,.1)}
.card-cover-art{position:absolute;inset:0}
.card-cover :deep(.sc-img){transition:transform .42s cubic-bezier(.22,1,.36,1)}
.class-card:hover .card-cover :deep(.sc-img){transform:scale(1.025)}
/* Лёгкая вуаль только снизу: сплошная плёнка гасила пастельную обложку
   в серое, а бейдж «архив» и так лежит на собственной тёмной плашке. */
.card-cover-dim{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,.04),transparent 48%,rgba(0,0,0,.18));box-shadow:inset 0 1px 0 rgba(255,255,255,.14)}
.card-archive-badge{position:absolute;top:10px;left:10px;z-index:2;display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;background:rgba(30,30,32,.58);color:#fff;padding:6px 10px;border-radius:100px;letter-spacing:.03em;-webkit-backdrop-filter:blur(14px) saturate(160%);backdrop-filter:blur(14px) saturate(160%);border:1px solid rgba(255,255,255,.2)}
.card-body{display:flex;flex:1;flex-direction:column;padding:17px 20px 17px}
.card-name{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI Variable','Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:18px;font-weight:750;color:var(--text1);line-height:1.22;margin-bottom:7px;letter-spacing:-.022em}
.card-desc{font-size:13px;color:var(--text3);line-height:1.48;margin-bottom:16px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card-footer{display:flex;align-items:center;justify-content:space-between;margin-top:auto;border-top:1px solid var(--border);padding-top:12px}
.card-action-btn{display:inline-flex;align-items:center;gap:4px;font-size:13px;font-weight:650;color:var(--teal);background:none;border:none;cursor:pointer;padding:6px 0;font-family:inherit;transition:opacity .15s,gap .2s cubic-bezier(.22,1,.36,1)}
.card-action-btn:hover{opacity:.82;gap:7px}
.ctrl-btn{width:32px;height:32px;border-radius:50%;background:var(--surface2);border:1px solid var(--border);color:var(--text4);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s,color .15s,border-color .15s,transform .1s}
.ctrl-btn:hover{background:var(--red-l);border-color:rgba(220,38,38,.25);color:var(--red)}
.ctrl-btn:active{transform:scale(.92)}

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
  .card-cover{margin:7px 7px 0;border-radius:16px}
  .ctrl-btn{width:40px;height:40px}
  .card-action-btn{position:relative}
  .card-action-btn::after{content:'';position:absolute;top:-14px;bottom:-14px;left:-4px;right:-4px}
  .back-row{position:relative;min-height:44px;display:inline-flex}
  .back-row::after{content:'';position:absolute;top:-9px;bottom:-9px;left:-4px;right:-4px}
}
@media (prefers-reduced-motion:reduce){
  .class-card:hover{transform:none}
  .class-card:hover .card-cover :deep(.sc-img){transform:none}
}
@media (prefers-reduced-transparency:reduce){
  .class-card{background:var(--surface)}
  .card-archive-badge{-webkit-backdrop-filter:none;backdrop-filter:none;background:rgba(30,30,32,.86)}
}
@media (prefers-contrast:more){
  .class-card{border-color:var(--text4)}
  .card-archive-badge{border-color:#fff}
}
</style>
