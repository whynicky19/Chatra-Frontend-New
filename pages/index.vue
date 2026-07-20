<template>
  <div class="pg anim-in">
    <div class="pg-body">
      <div class="content-area">
        <!-- Header -->
        <div class="pg-head">
          <div class="pg-head-left">
            <h1 class="pg-title">{{ t('classes.catalog') }}</h1>
          </div>
          <div class="pg-head-r">
            <button v-if="auth.isTeacher || auth.isAdmin" class="btn btn-outline-teal" @click="router.push('/rollover')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
              {{ t('rollover.nav') }}
            </button>
            <button v-if="auth.isTeacher" class="btn btn-outline-teal" @click="showCreate=true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
              {{ t('classes.create') }}
            </button>
            <button class="btn btn-teal" @click="showJoin=true">{{ t('classes.join_code') }}</button>
            <NuxtLink to="/calendar" class="btn btn-head-icon" title="Дедлайны">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span class="btn-head-label">Дедлайны</span>
            </NuxtLink>
            <NuxtLink to="/notifications" class="btn btn-head-icon" title="Уведомления">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
              <span class="btn-head-label">Уведомления</span>
            </NuxtLink>
            <!-- Lang switcher (mobile-visible) -->
            <div class="head-lang-switch">
              <button v-for="l in [{code:'ru',label:'RU'},{code:'en',label:'EN'},{code:'kk',label:'KZ'}]" :key="l.code"
                :class="['head-lang-btn', { active: lang === l.code }]" @click="setLang(l.code as any)">{{ l.label }}</button>
            </div>
          </div>
        </div>


        <div class="classes-grid">
          <div v-if="loading" style="grid-column:1/-1;display:flex;justify-content:center;padding:60px">
            <div class="spinner" style="width:28px;height:28px;border-width:3px"></div>
          </div>

          <div v-else-if="!visibleClasses.length" class="empty-state" style="grid-column:1/-1">
            <div class="es-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            </div>
            <div class="es-title">{{ auth.isTeacher ? t('classes.no_classes_teacher') : t('classes.no_classes') }}</div>
            <div class="es-sub">{{ auth.isTeacher ? t('classes.no_classes_sub_teacher') : t('classes.no_classes_sub_student') }}</div>
            <button class="btn btn-teal es-btn" @click="showJoin=true">{{ t('classes.join_code') }}</button>
          </div>

          <template v-else>
            <div v-for="cls in activeClasses" :key="cls.id" class="class-card" @click="goClass(cls.id)">
              <div class="card-cover" :style="cls.cover_image ? {backgroundImage:`url(${cls.cover_image})`,backgroundSize:'cover',backgroundPosition:'center'} : {background: coverGrad(cls.id)}">
                <div v-if="(auth.isTeacher || auth.isAdmin) && cls.invite_code" class="card-code-chip" @click.stop="copyClassCode(cls)">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  {{ cls.invite_code }}
                </div>
                <button v-if="auth.isTeacher || auth.isAdmin" class="card-edit-btn" @click.stop="openEditClass(cls)" title="Редактировать">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>
              <div class="card-body">
                <div class="card-title-row">
                  <h3 class="card-name">{{ cls.name }}</h3>
                  <div class="card-subject-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                  </div>
                </div>
                <p class="card-desc">{{ cls.description || (lang==='ru' ? 'Нажмите для просмотра' : lang==='kk' ? 'Көру үшін басыңыз' : 'Click to view') }}</p>
                <div class="card-teacher" v-if="cls.teacher">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {{ cls.teacher }}
                </div>
                <div class="card-meta">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {{ lectureCount(cls.id) }} {{ lang === 'ru' ? 'уроков' : lang === 'kk' ? 'сабақ' : 'lessons' }}
                </div>
                <div class="card-footer">
                  <div class="card-action-row">
                    <button v-if="!auth.isTeacher" class="card-action-btn" @click.stop="goClass(cls.id)">{{ getActionLabel(cls) }} →</button>
                    <button v-else class="card-action-btn" @click.stop="goClass(cls.id)">{{ lang === 'ru' ? 'Открыть курс' : lang === 'kk' ? 'Курсты ашу' : 'Open course' }} →</button>
                    <div class="card-controls">
                      <button v-if="!auth.isTeacher" class="ctrl-btn" @click.stop="confirmLeave(cls)" :title="t('classes.left')">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      </button>
                      <button v-if="auth.isTeacher" class="ctrl-del ctrl-btn" @click.stop="confirmDelete(cls)">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!auth.isTeacher && !auth.isAdmin" class="class-card add-card" @click="showJoin=true">
              <div class="add-card-inner">
                <div class="add-plus"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></div>
                <div class="add-title">{{ lang === 'ru' ? 'Добавить новый предмет в программу' : lang === 'kk' ? 'Бағдарламаға жаңа пән қосу' : 'Add new subject to program' }}</div>
                <div class="add-sub">{{ lang === 'ru' ? 'Персонализируйте своё обучение' : lang === 'kk' ? 'Оқуыңызды жекелендіріңіз' : 'Personalize your learning' }}</div>
              </div>
            </div>
          </template>
        </div>

        <!-- Archived classes — dedicated entry (WhatsApp-style), opens separate screen -->
        <button v-if="!loading && archivedClasses.length" class="archive-entry" @click="router.push('/classes/archive')">
          <div class="ae-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="4" width="18" height="4" rx="1.5"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
          </div>
          <span class="ae-label">{{ t('cohort.archived_section') }}</span>
          <span class="ae-count">{{ archivedClasses.length }}</span>
          <svg class="ae-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>


    <LazyCreateClassModal v-if="showCreate" @close="showCreate=false" @created="onCreated"/>


    <div v-if="editingClass" class="overlay" @click.self="editingClass=null">
      <div class="modal anim-scale edit-class-modal">
        <div class="modal-head">
          <span class="modal-title">{{ lang==='ru' ? 'Редактировать класс' : lang==='kk' ? 'Сыныпты өңдеу' : 'Edit Class' }}</span>
          <button class="btn btn-icon btn-ghost" @click="editingClass=null">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="edit-form">

          <div class="edit-cover-preview" :style="editForm.cover_image ? {backgroundImage:`url(${editForm.cover_image})`,backgroundSize:'cover',backgroundPosition:'center'} : {background: coverGrad(editingClass.id)}">
            <label class="edit-cover-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {{ lang==='ru' ? 'Загрузить обложку' : lang==='kk' ? 'Мұқаба жүктеу' : 'Upload Cover' }}
              <input type="file" accept="image/*" class="hidden-file" @change="onCoverFile"/>
            </label>
          </div>
          <div class="edit-field">
            <label class="field-label">{{ lang==='ru' ? 'НАЗВАНИЕ КЛАССА' : lang==='kk' ? 'СЫНЫП АТАУЫ' : 'CLASS NAME' }}</label>
            <input v-model="editForm.title" class="field-input" :placeholder="lang==='ru'?'Название класса...':lang==='kk'?'Сынып атауы...':'Class name...'"/>
          </div>
          <div class="edit-field">
            <label class="field-label">{{ lang==='ru' ? 'ОПИСАНИЕ' : lang==='kk' ? 'СИПАТТАМА' : 'DESCRIPTION' }}</label>
            <textarea v-model="editForm.description" class="field-textarea" rows="3" :placeholder="lang==='ru'?'Описание...':lang==='kk'?'Сипаттама...':'Description...'"></textarea>
          </div>
          <div class="edit-field">
            <label class="field-label">{{ lang==='ru' ? 'ИМЯ УЧИТЕЛЯ' : lang==='kk' ? 'МҰҒАЛІМ АТЫ' : 'TEACHER NAME' }}</label>
            <input v-model="editForm.teacher" class="field-input" :placeholder="lang==='ru'?'Имя учителя...':lang==='kk'?'Мұғалім аты...':'Teacher name...'"/>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-white" @click="editingClass=null">{{ t('general.cancel') }}</button>
          <button class="btn btn-teal" :disabled="editSaving" @click="saveEditClass">
            <div v-if="editSaving" class="spinner" style="width:13px;height:13px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
            <span v-else>{{ t('general.save') }}</span>
          </button>
        </div>
      </div>
    </div>


    <div v-if="showJoin" class="overlay" @click.self="showJoin=false">
      <div class="modal anim-scale join-modal">
        <div class="modal-head">
          <span class="modal-title">{{ t('classes.join_title') }}</span>
          <button class="btn btn-icon btn-ghost" @click="showJoin=false">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="join-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        </div>
        <p class="join-hint">{{ t('classes.join_hint') }}</p>
        <div class="frow">
          <div class="code-boxes">
            <input v-for="(_, i) in 6" :key="i" :ref="el => { if(el) codeRefs[i] = el as HTMLInputElement }" class="code-box" maxlength="1" :value="codeChars[i]" @input="onCodeInput($event, i)" @keydown="onCodeKey($event, i)" @paste="onCodePaste" inputmode="text" autocomplete="off" style="text-transform:uppercase"/>
          </div>
          <!-- Live "class found" preview (no join) -->
          <div v-if="lookingUp" class="lookup-status">
            <div class="spinner" style="width:13px;height:13px;border-width:2px;border-color:var(--border2);border-top-color:var(--teal)"></div>
            {{ lang==='ru' ? 'Проверяем код…' : lang==='kk' ? 'Кодты тексереміз…' : 'Checking code…' }}
          </div>
          <div v-else-if="foundClass" class="join-found">
            <div class="found-cover" :style="foundClass.cover_image ? {backgroundImage:`url(${foundClass.cover_image})`} : {background: coverGrad(foundClass.id)}">
              <div class="found-overlay"></div>
              <div class="found-name">{{ foundClass.name }}</div>
            </div>
            <div class="found-meta">{{ foundClass.teacher || (lang==='ru' ? 'Преподаватель' : lang==='kk' ? 'Мұғалім' : 'Teacher') }}</div>
          </div>
          <div v-if="joinError" class="join-err">{{joinError}}</div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-white" @click="showJoin=false">{{ t('general.cancel') }}</button>
          <button class="btn btn-teal" :disabled="joinCode.length<6||joining||notFoundForCode" @click="joinClass">
            <div v-if="joining" class="spinner" style="width:13px;height:13px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
            <span v-else>{{ t('classes.join') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete confirm modal -->
    <div v-if="deletingClass" class="overlay" @click.self="deletingClass=null">
      <div class="modal anim-scale" style="max-width:400px">
        <div class="modal-head">
          <span class="modal-title">{{ t('classes.delete_title') }}</span>
          <button class="btn btn-icon btn-ghost" @click="deletingClass=null">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="del-body">
          <div class="del-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></div>
          <p class="del-text">{{ t('classes.delete_confirm') }} <strong>«{{deletingClass.name}}»</strong>? {{ t('classes.delete_warn') }}</p>
        </div>
        <div class="modal-foot">
          <button class="btn btn-white" @click="deletingClass=null">{{ t('general.cancel') }}</button>
          <button class="btn btn-danger" :disabled="deleting" @click="doDelete">
            <div v-if="deleting" class="spinner" style="width:13px;height:13px;border-width:2px;border-color:rgba(220,38,38,.3);border-top-color:#dc2626"></div>
            <span v-else>{{ t('classes.delete') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Leave confirm modal -->
    <div v-if="leavingClass" class="overlay" @click.self="leavingClass=null">
      <div class="modal anim-scale" style="max-width:400px">
        <div class="modal-head">
          <span class="modal-title">{{ t('classes.leave_title') }}</span>
          <button class="btn btn-icon btn-ghost" @click="leavingClass=null">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="del-body">
          <div class="del-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div>
          <p class="del-text">{{ t('classes.leave_confirm') }} <strong>«{{leavingClass.name}}»</strong>? {{ t('classes.leave_warn') }}</p>
        </div>
        <div class="modal-foot">
          <button class="btn btn-white" @click="leavingClass=null">{{ t('general.cancel') }}</button>
          <button class="btn btn-danger" :disabled="leaving" @click="doLeave">
            <div v-if="leaving" class="spinner" style="width:13px;height:13px;border-width:2px;border-color:rgba(220,38,38,.3);border-top-color:#dc2626"></div>
            <span v-else>{{ t('classes.leave_btn') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from '#app'
import { useAuthStore } from '~/stores/auth.store'
import { usePostsSvc } from '~/services/posts'
import { useClassesSvc } from '~/services/classes'
import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'
import { useCohortErrors } from '~/composables/useCohortErrors'
definePageMeta({ layout: 'default' })
const auth = useAuthStore(); const postsSvc = usePostsSvc(); const classesSvc = useClassesSvc(); const toast = useToast(); const router = useRouter()
const { t, lang, setLang } = useI18n()
const cohortErrors = useCohortErrors()
const allClasses = ref<any[]>([]); const allPosts = ref<any[]>([]); const loading = ref(true); const showCreate = ref(false)
const showJoin = ref(false); const joining = ref(false); const joinError = ref('')
const deletingClass = ref<any>(null); const deleting = ref(false)
const leavingClass = ref<any>(null); const leaving = ref(false)
const editingClass = ref<any>(null)
const editForm = ref({ title: '', description: '', teacher: '', cover_image: '' })
const editSaving = ref(false)

const codeChars = ref<string[]>(['','','','','',''])
const codeRefs = ref<HTMLInputElement[]>([])
const joinCode = computed(() => codeChars.value.join(''))

const onCodeInput = (e: Event, i: number) => {
  const val = (e.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z0-9]/g,'')
  codeChars.value[i] = val.slice(-1)
  if (val && i < 5) codeRefs.value[i+1]?.focus()
  else if (!val && i > 0) { codeRefs.value[i-1]?.focus(); codeRefs.value[i-1]?.select() }
  joinError.value = ''
}
const onCodeKey = (e: KeyboardEvent, i: number) => {
  if (e.key === 'Backspace' && !codeChars.value[i] && i > 0) { codeChars.value[i-1] = ''; codeRefs.value[i-1]?.focus() }
  if (e.key === 'Enter' && joinCode.value.length === 6) joinClass()
}
const onCodePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6) || ''
  text.split('').forEach((c, i) => { if (i < 6) codeChars.value[i] = c })
  codeRefs.value[Math.min(text.length, 5)]?.focus()
}

const joinedKey = computed(() => `_joined_${auth.user?.id||0}`)
const joinedIds = ref<number[]>([])
const loadJoined = () => { try { joinedIds.value = JSON.parse(localStorage.getItem(joinedKey.value)||'[]') } catch { joinedIds.value=[] } }
const saveJoined = () => localStorage.setItem(joinedKey.value, JSON.stringify(joinedIds.value))

const covers = [
  'linear-gradient(135deg,#006475,#009aaf)',
  'linear-gradient(135deg,#0c4a6e,#0369a1)',
  'linear-gradient(135deg,#134e4a,#0d9488)',
  'linear-gradient(135deg,#312e81,#4338ca)',
  'linear-gradient(135deg,#1e3a5f,#2563eb)'
]
const coverGrad = (id: number) => covers[id % covers.length]

// Членство — серверная истина: GET /classes/ уже возвращает нужный набор для
// роли (студенту — его классы, включая архив; преподавателю/админу — все).
// Раньше список ещё фильтровался по localStorage joinedIds, из-за чего на новом
// браузере/устройстве классы не показывались (не синхронизировались). Теперь
// показываем ровно то, что вернул сервер — одинаково в приложении и на сайте.
const visibleClasses = computed(() => allClasses.value)
const activeClasses = computed(() => visibleClasses.value.filter(c => !c.is_archived_for_user))
const archivedClasses = computed(() => visibleClasses.value.filter(c => c.is_archived_for_user))
const lectureCount = (classId: number) => allPosts.value.filter(p => p.title?.startsWith(`[LECTURE][${classId}]`)).length

// Живой предпросмотр класса по коду (без вступления) — как в приложении.
const lookingUp = ref(false)
const foundClass = ref<any>(null)
const notFoundForCode = ref(false)
let lookupTimer: ReturnType<typeof setTimeout> | null = null
watch(joinCode, (code) => {
  if (lookupTimer) clearTimeout(lookupTimer)
  if (code.length < 6) { lookingUp.value = false; foundClass.value = null; notFoundForCode.value = false; return }
  lookingUp.value = true; foundClass.value = null; notFoundForCode.value = false
  lookupTimer = setTimeout(async () => {
    try {
      const cls = await classesSvc.lookupByCode(code)
      if (joinCode.value !== code) return
      foundClass.value = cls; lookingUp.value = false
    } catch {
      if (joinCode.value !== code) return
      lookingUp.value = false; notFoundForCode.value = true; joinError.value = t('classes.not_found')
    }
  }, 400)
})
watch(showJoin, (open) => {
  if (!open) {
    codeChars.value = ['','','','','','']
    foundClass.value = null; notFoundForCode.value = false; lookingUp.value = false; joinError.value = ''
    if (lookupTimer) clearTimeout(lookupTimer)
  }
})

const getActionLabel = (cls: any) => {
  const count = lectureCount(cls.id)
  if (count === 0) return lang.value === 'ru' ? 'Начать обучение' : lang.value === 'kk' ? 'Оқуды бастау' : 'Start learning'
  return lang.value === 'ru' ? 'Продолжить обучение' : lang.value === 'kk' ? 'Оқуды жалғастыру' : 'Continue learning'
}

const openEditClass = (cls: any) => {
  editingClass.value = cls
  editForm.value = {
    title: cls.name || '',
    description: cls.description || '',
    teacher: cls.teacher || '',
    cover_image: cls.cover_image || ''
  }
}

const onCoverFile = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { editForm.value.cover_image = ev.target?.result as string }
  reader.readAsDataURL(file)
}

const saveEditClass = async () => {
  if (!editingClass.value) return
  editSaving.value = true
  try {
    const updated = await classesSvc.update(editingClass.value.id, {
      name: editForm.value.title,
      description: editForm.value.description,
      teacher: editForm.value.teacher,
      cover_image: editForm.value.cover_image,
    })
    const idx = allClasses.value.findIndex(c => c.id === editingClass.value.id)
    if (idx !== -1) allClasses.value[idx] = { ...allClasses.value[idx], ...updated }
    toast.ok(lang.value==='ru' ? 'Класс обновлён' : lang.value==='kk' ? 'Сынып жаңартылды' : 'Class updated')
    editingClass.value = null
  } catch(e: any) { toast.err(e?.response?.data?.detail || t('general.error')) }
  finally { editSaving.value = false }
}

const joinClass = async () => {
  joining.value = true; joinError.value = ''
  try {
    const cls = await classesSvc.joinByCode(joinCode.value)
    if (!joinedIds.value.includes(cls.id)) { joinedIds.value.push(cls.id); saveJoined() }
    await load()
    showJoin.value = false; codeChars.value = ['','','','','','']
    toast.ok(`${t('classes.joined')} ${cls.name}`)
  } catch (e: any) {
    const detail = e?.response?.data?.detail
    if (detail === 'class_not_found') joinError.value = t('classes.not_found')
    // Ученик уже был в классе, его поток в архиве — вернуть доступ может
    // только преподаватель/админ.
    else if (detail === 'archived_rejoin_blocked') joinError.value = t('cohort.archived_rejoin_blocked')
    else if (cohortErrors.isNoActiveCohort(e)) joinError.value = t('cohort.no_active_cohort')
    else joinError.value = detail || t('general.error')
  } finally {
    joining.value = false
  }
}
const confirmLeave = (cls: any) => { leavingClass.value = cls }
const doLeave = async () => {
  if (!leavingClass.value) return
  const id = leavingClass.value.id
  leaving.value = true
  // FE-2: раньше ошибка выхода глоталась (catch{}), а класс всё равно убирался
  // из UI — при 403 (архивный поток) пользователь видел «вышел», хотя членство
  // осталось. Теперь UI меняем только после успеха, на ошибке — тост и откат.
  try {
    await classesSvc.leave(id)
  } catch (e: any) {
    toast.err(cohortErrors.cohortErrorMessage(e, t('classes.leave_failed')))
    leaving.value = false
    return
  }
  allClasses.value = allClasses.value.filter(c => c.id !== id)
  joinedIds.value = joinedIds.value.filter(i => i !== id); saveJoined()
  leaving.value = false; leavingClass.value = null
  toast.ok(t('classes.left_ok'))
}
const confirmDelete = (cls: any) => { deletingClass.value = cls }
const doDelete = async () => {
  if (!deletingClass.value) return
  deleting.value = true
  try { await classesSvc.delete(deletingClass.value.id); allClasses.value = allClasses.value.filter(c => c.id !== deletingClass.value.id); toast.ok(t('general.delete')); deletingClass.value = null }
  catch(e: any) { toast.err(e?.response?.data?.detail || t('general.error')) }
  finally { deleting.value = false }
}
const goClass = (id: number) => router.push(`/classes/${id}`)
const copyClassCode = (cls: any) => {
  const code = cls.invite_code
  if (!code) return
  navigator.clipboard?.writeText(code).then(() => toast.ok(`Код скопирован: ${code}`)).catch(() => toast.ok(`Код: ${code}`))
}
const onCreated = async (cls: any) => {
  showCreate.value = false
  await load()
  if (cls?.id) {
    try { await classesSvc.join(cls.id) } catch {}
    if (!joinedIds.value.includes(cls.id)) { joinedIds.value.push(cls.id); saveJoined() }
  }
}
const load = async () => {
  loading.value = true
  try {
    const [classes, posts] = await Promise.all([classesSvc.list(), postsSvc.list()])
    allClasses.value = classes
    allPosts.value = posts
  } catch { toast.err(t('general.error')) }
  finally { loading.value = false }
}

// Миграция: классы, вступление в которые раньше хранилось только в localStorage
// (старые сборки), проталкиваем на сервер, затем перезагружаем список, чтобы
// они появились как серверное членство и синхронизировались на всех устройствах.
const syncMemberships = async (ids: number[]) => {
  const serverIds = new Set(allClasses.value.map(c => c.id))
  const missing = ids.filter(id => !serverIds.has(id))
  if (!missing.length) return
  await Promise.all(missing.map(id => classesSvc.join(id).catch(() => {})))
  await load()
}

onMounted(async () => {
  loadJoined()
  await load()
  if (joinedIds.value.length) await syncMemberships(joinedIds.value)
})

// Re-load joined IDs whenever the logged-in user changes (fixes disappearing classes after re-login)
watch(() => auth.user?.id, async (newId) => {
  if (newId) {
    loadJoined()
    await load()
    if (joinedIds.value.length) await syncMemberships(joinedIds.value)
  }
})
</script>

<style scoped>
.pg{height:100%;display:flex;flex-direction:column;background:var(--bg);overflow:hidden}
.pg-body{flex:1;overflow-y:auto;width:100%}
.content-area{padding:32px 32px 80px;width:100%;box-sizing:border-box}

/* Header */
.pg-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;gap:20px}
.pg-head-left{flex:1;text-align:center}
.pg-title{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:28px;font-weight:900;color:var(--text1);margin-bottom:6px;letter-spacing:-.02em;text-align:center}
.pg-sub{font-size:14px;color:var(--text4);line-height:1.5;max-width:500px;text-align:center;margin:0 auto}
.pg-head-r{display:flex;gap:10px;align-items:center;flex-shrink:0}
.btn-outline-teal{display:flex;align-items:center;gap:6px;padding:9px 18px;border-radius:var(--r-md);border:1.5px solid var(--teal);background:transparent;color:var(--teal);font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}
.btn-outline-teal:hover{background:var(--teal-l)}

.head-lang-switch{display:none;align-items:center;gap:2px;background:var(--surface2);border:1px solid var(--border);border-radius:30px;padding:3px}
.head-lang-btn{padding:4px 11px;border-radius:24px;font-size:11px;font-weight:700;letter-spacing:.05em;cursor:pointer;transition:all .15s;background:none;border:none;color:var(--text4)}
.head-lang-btn:hover{color:var(--teal)}
.head-lang-btn.active{background:var(--teal);color:#fff;box-shadow:0 2px 6px rgba(var(--teal-rgb),0.3)}

/* Header nav buttons */
.btn-head-icon{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:var(--r-md);border:1.5px solid var(--border2);background:var(--surface);color:var(--text2);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;text-decoration:none;font-family:inherit;white-space:nowrap}
.btn-head-icon:hover{border-color:var(--teal);color:var(--teal);background:var(--teal-l)}

/* Grid */
.classes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;margin-bottom:32px;width:100%}
@media (min-width:769px){
  :global(html.sidebar-collapsed .classes-grid){grid-template-columns:repeat(3,1fr)}
}

/* Archive entry — WhatsApp-style row opening a separate screen */
.archive-entry{display:flex;align-items:center;gap:14px;width:100%;padding:14px 18px;margin-bottom:24px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);box-shadow:var(--sh-xs);cursor:pointer;font-family:inherit;transition:transform .2s cubic-bezier(.22,1,.36,1),box-shadow .2s}
.archive-entry:hover{transform:translateY(-1px);box-shadow:var(--sh-sm)}
.archive-entry:active{transform:scale(.99)}
.ae-icon{width:38px;height:38px;border-radius:11px;background:var(--surface2);display:flex;align-items:center;justify-content:center;color:var(--text3);flex-shrink:0}
.ae-label{font-size:15px;font-weight:600;color:var(--text1)}
.ae-count{margin-left:auto;font-size:13px;font-weight:600;color:var(--text4)}
.ae-chevron{color:var(--text4);flex-shrink:0}
.lookup-status{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;font-size:12px;color:var(--text4);font-weight:500}

/* Class card */
.class-card{background:var(--surface);border-radius:var(--r-xl);overflow:hidden;cursor:pointer;transition:all .2s;box-shadow:var(--sh-xs);border:1px solid var(--border)}
.class-card:hover{transform:translateY(-4px);box-shadow:var(--sh-md);border-color:rgba(var(--teal-rgb),.2)}

.card-cover{position:relative;height:200px;overflow:hidden;background:linear-gradient(135deg,#006475,var(--teal-h));display:flex;align-items:flex-end;padding:0}
.card-code-chip{position:absolute;top:10px;left:10px;display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;background:rgba(80,80,80,.75);color:rgba(255,255,255,.92);padding:4px 10px;border-radius:6px;letter-spacing:.08em;backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.15);cursor:pointer;transition:all .15s;line-height:1}
.card-code-chip:hover{background:rgba(60,60,60,.9)}
.card-code-chip svg{flex-shrink:0;display:block}
.card-edit-btn{position:absolute;top:10px;right:10px;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.2);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;backdrop-filter:blur(4px)}
.card-edit-btn:hover{background:rgba(var(--teal-rgb),.7);border-color:rgba(var(--teal-rgb),.5)}

.card-body{padding:18px 18px 16px}
.card-title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:6px}
.card-name{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:17px;font-weight:800;color:var(--text1);line-height:1.25;flex:1}
.card-subject-icon{width:30px;height:30px;border-radius:var(--r-sm);background:var(--teal-l);border:1px solid rgba(var(--teal-rgb),.2);display:flex;align-items:center;justify-content:center;color:var(--teal);flex-shrink:0}
.card-desc{font-size:13px;color:var(--text4);line-height:1.5;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card-teacher{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text3);font-weight:500;margin-bottom:8px}
.card-teacher svg{flex-shrink:0;color:var(--teal)}
.card-meta{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text4);margin-bottom:14px}
.card-footer{border-top:1px solid var(--border);padding-top:14px}
.card-action-row{display:flex;align-items:center;justify-content:space-between}
.card-action-btn{font-size:13px;font-weight:600;color:var(--teal);background:none;border:none;cursor:pointer;padding:0;transition:opacity .15s;font-family:inherit}
.card-action-btn:hover{opacity:.75}
.card-controls{display:flex;gap:6px}
.ctrl-btn{width:28px;height:28px;border-radius:50%;background:var(--surface2);border:1px solid var(--border);color:var(--text4);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
.ctrl-btn:hover{background:var(--surface3);color:var(--text2)}
.ctrl-del:hover{background:var(--red-l);border-color:rgba(220,38,38,.3);color:var(--red)}

/* Add card */
.add-card{background:var(--surface);border:2px dashed var(--border);cursor:pointer;transition:all .2s;min-height:360px;display:flex}
.add-card:hover{border-color:rgba(var(--teal-rgb),.4);background:var(--teal-l)}
.add-card-inner{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;text-align:center;gap:12px;flex:1}
.add-plus{width:48px;height:48px;border-radius:50%;border:2px dashed rgba(var(--teal-rgb),.4);color:var(--text4);display:flex;align-items:center;justify-content:center;background:var(--surface2)}
.add-card:hover .add-plus{border-color:var(--teal);color:var(--teal)}
.add-title{font-size:15px;font-weight:700;color:var(--text2);line-height:1.3}
.add-sub{font-size:13px;color:var(--text4);max-width:160px;line-height:1.5}

/* Empty state */
.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 40px;gap:12px;text-align:center}
.es-icon-wrap{width:72px;height:72px;border-radius:20px;background:var(--teal-l);border:1px solid rgba(var(--teal-rgb),.2);display:flex;align-items:center;justify-content:center;color:var(--teal);margin-bottom:8px}
.es-title{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:20px;font-weight:700;color:var(--text2)}
.es-sub{font-size:14px;color:var(--text4);max-width:300px;line-height:1.6}
.es-btn{margin-top:8px}

/* Edit class modal */
.edit-class-modal{max-width:480px;width:100%}
.edit-form{padding:4px 0 8px;display:flex;flex-direction:column;gap:16px}
.edit-cover-preview{height:140px;border-radius:var(--r-lg);overflow:hidden;display:flex;align-items:flex-end;justify-content:flex-start;padding:12px;background:var(--surface2)}
.edit-cover-btn{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;background:rgba(0,0,0,.45);color:#fff;padding:7px 14px;border-radius:var(--r-md);cursor:pointer;border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(4px);transition:all .15s}
.edit-cover-btn:hover{background:rgba(var(--teal-rgb),.6)}
.hidden-file{display:none}
.edit-field{display:flex;flex-direction:column;gap:6px}
.field-label{font-size:11px;font-weight:700;color:var(--text4);letter-spacing:.07em}
.field-input{padding:10px 14px;border-radius:var(--r-md);border:1.5px solid var(--border);background:var(--surface2);color:var(--text1);font-size:14px;font-family:inherit;transition:border-color .15s}
.field-input:focus{border-color:var(--teal);background:rgba(var(--teal-rgb),.04)}
.field-textarea{padding:10px 14px;border-radius:var(--r-md);border:1.5px solid var(--border);background:var(--surface2);color:var(--text1);font-size:14px;font-family:inherit;resize:vertical;transition:border-color .15s}
.field-textarea:focus{border-color:var(--teal);background:rgba(var(--teal-rgb),.04)}

/* Join modal */
.join-modal{max-width:400px;width:100%}
.join-icon-wrap{width:50px;height:50px;border-radius:14px;background:var(--teal-l);border:1px solid rgba(var(--teal-rgb),.2);display:flex;align-items:center;justify-content:center;color:var(--teal);margin:0 auto 12px}
.join-hint{font-size:13px;color:var(--text3);text-align:center;margin-bottom:20px;line-height:1.6}
.code-boxes{display:flex;gap:8px;justify-content:center;margin-bottom:12px}
.code-box{width:44px;height:52px;border:2px solid var(--border);border-radius:var(--r-md);background:var(--surface2);color:var(--text1);font-size:22px;font-weight:800;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,monospace;letter-spacing:.05em;transition:all .15s;outline:none}
.code-box:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(var(--teal-rgb),.15);background:rgba(var(--teal-rgb),.05)}
.join-err{font-size:12px;color:var(--red);text-align:center;font-weight:500;margin-top:4px}
.join-found{margin-top:12px;border-radius:var(--r-lg);overflow:hidden;border:1px solid rgba(var(--teal-rgb),.25)}
.found-cover{position:relative;height:60px;background-size:cover;background-position:center;display:flex;align-items:flex-end;padding:10px 14px}
.found-overlay{position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.6),transparent)}
.found-name{position:relative;z-index:1;font-size:14px;font-weight:700;color:#fff}
.found-meta{padding:8px 14px;font-size:12px;color:var(--text4);background:var(--surface2)}

/* Delete modal */
.del-body{display:flex;align-items:flex-start;gap:14px;padding:4px 0 18px}
.del-icon{width:44px;height:44px;border-radius:var(--r-md);background:var(--red-l);border:1px solid rgba(220,38,38,.2);display:flex;align-items:center;justify-content:center;color:var(--red);flex-shrink:0}
.del-text{font-size:14px;color:var(--text2);line-height:1.7}

@media (max-width:768px){
  .pg { overflow-x: hidden; }
  .content-area{padding:calc(18px + env(safe-area-inset-top, 0px)) 16px 90px}
  .pg-head{flex-direction:column;align-items:stretch;gap:14px;margin-bottom:18px}
  .pg-head-left{width:100%}
  .pg-head-r{width:100%;gap:8px}
  .pg-title{text-align:left}
  .pg-sub{text-align:left;margin:0;font-size:14px}
  /* Язык переехал в настройки — на мобиле шапку не перегружаем */
  .head-lang-switch{display:none}
  .pg-head-r .btn-teal{flex:1;min-height:48px;border-radius:14px;font-size:15px;font-weight:700}
  .btn-outline-teal{min-height:48px;border-radius:14px;flex:1;justify-content:center}
  .btn-head-icon .btn-head-label{display:none}
  .btn-head-icon{width:48px;height:48px;padding:0;justify-content:center;border-radius:14px;flex-shrink:0}
  .classes-grid{grid-template-columns:1fr;gap:14px}
  .card-cover{height:160px}
  .card-body{padding:16px}
  .add-card{min-height:120px}
  .add-card-inner{padding:24px 16px}
  .ctrl-btn{width:36px;height:36px}
  .code-box{width:44px;height:52px;font-size:20px}
  .code-boxes{gap:6px}
}
@media (max-width:480px){
  .content-area{padding:calc(14px + env(safe-area-inset-top, 0px)) 16px 90px}
  .code-box{width:40px;height:48px;font-size:18px}
  .code-boxes{gap:5px}
}
</style>
