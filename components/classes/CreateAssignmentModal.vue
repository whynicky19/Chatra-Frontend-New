<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="sheet-grabber"></div>

      <div class="modal-head">
        <div class="modal-head-wash" aria-hidden="true"></div>
        <div class="modal-head-l">
          <div class="modal-ico">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
          <div class="modal-head-txt">
            <div class="modal-title">Новое задание</div>
            <div class="modal-sub">Заполните данные задания</div>
          </div>
        </div>
        <button class="modal-close" aria-label="Закрыть" @click="$emit('close')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="field">
          <label class="field-label">Название задания<span class="req">*</span></label>
          <input v-model="form.title" class="inp" placeholder="Например: Контрольная работа по теме..." />
        </div>

        <div class="field">
          <label class="field-label">Описание задания</label>
          <textarea v-model="form.description" class="inp inp-ta" rows="3" placeholder="Подробное описание, требования, инструкции..."></textarea>
        </div>

        <!-- Файлы задания -->
        <div class="field">
          <label class="field-label">Прикрепить файлы к заданию</label>
          <div class="file-drop" :class="{ dragging: drag, 'has-file': taskFiles.length }" @dragover.prevent="drag=true" @dragleave="drag=false" @drop.prevent="onDropFiles" @click="taskFileInput?.click()">
            <input type="file" style="display:none" ref="taskFileInput" multiple @change="onPickFiles" />
            <div class="drop-ico">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <span class="drop-text">Перетащите или <strong>выберите файлы</strong> задания</span>
          </div>
          <div v-if="taskFiles.length" class="attached-files">
            <div v-for="(f, i) in taskFiles" :key="`${f.name}_${f.size}_${f.lastModified}`" class="attached-file">
              <span class="ftb ftb-sm">{{ fileEmoji(f) }}</span>
              <span class="af-name">{{ f.name }}</span>
              <span class="af-size">{{ fileSz(f) }}</span>
              <button class="af-rm" @click="taskFiles.splice(i,1)">×</button>
            </div>
          </div>
          <div v-if="uploadingTask" class="upload-prog">
            <div class="upload-track"><div class="upload-bar" :style="{ transform: `scaleX(${uploadPct / 100})` }"></div></div>
            <span>Загрузка {{ uploadIdx }}/{{ taskFiles.length }}...</span>
          </div>
        </div>

        <!-- ─── ЭТАЛОННЫЕ РЕШЕНИЯ (несколько файлов) ────────────────────── -->
        <div class="field ref-section">
          <div class="ref-header">
            <div class="ref-header-l">
              <div class="ref-ico">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>
              <div>
                <div class="ref-title">Эталонные решения</div>
                <div class="ref-desc">ИИ сравнит работы учеников со всеми прикреплёнными файлами</div>
              </div>
            </div>
            <div class="ref-badge">ИИ</div>
          </div>

          <!-- Список прикреплённых эталонов -->
          <div v-if="refFiles.length" class="attached-files">
            <div v-for="(rf, i) in refFiles" :key="`${rf.name}_${rf.url || (rf.file ? rf.file.size + '_' + rf.file.lastModified : i)}`" class="attached-file">
              <span class="ftb ftb-sm">{{ fileEmoji(rf.file) }}</span>
              <div class="ref-file-info">
                <span class="af-name">{{ rf.name }}</span>
                <span class="ref-hint">{{ rf.url ? 'Загружен' : 'Будет загружен' }}</span>
              </div>
              <span class="af-size">{{ rf.file ? fileSz(rf.file) : '' }}</span>
              <button class="af-rm" @click="refFiles.splice(i,1)">×</button>
            </div>
          </div>

          <!-- Зона загрузки (всегда видна — можно добавлять ещё) -->
          <div class="file-drop" :class="{ dragging: dragRef, 'has-file': refFiles.length }"
               @dragover.prevent="dragRef=true" @dragleave="dragRef=false"
               @drop.prevent="onDropRef" @click="refFileInput?.click()">
            <input type="file" style="display:none" ref="refFileInput" multiple @change="onPickRef" />
            <div class="drop-ico">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <span class="drop-text">
              <template v-if="refFiles.length">Добавить ещё <strong>файл эталона</strong></template>
              <template v-else>Перетащите или <strong>выберите файлы</strong></template>
            </span>
            <span class="drop-hint">PDF, DOCX, DOC, PPTX, XLSX, TXT, MD… · Несколько файлов</span>
          </div>

          <!-- Прогресс загрузки -->
          <div v-if="uploadingRef" class="upload-prog">
            <div class="upload-track"><div class="upload-bar indeterminate"></div></div>
            <span>Загрузка эталонных решений...</span>
          </div>
        </div>
        <!-- ─────────────────────────────────────────────────────────────── -->

        <div class="field">
          <label class="field-label">Дедлайн</label>
          <input v-model="form.deadline" type="datetime-local" class="inp" />
        </div>

        <!-- Criteria -->
        <div class="field">
          <div class="criteria-head">
            <label class="field-label">Критерии оценивания</label>
            <button class="crit-add" @click="addCriterion">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M12 5v14M5 12h14"/></svg>
              Добавить
            </button>
          </div>
          <div class="criteria-hint">Баллы распределяются поровну между критериями — всего {{ form.max_score }}</div>

          <div class="criteria-list">
            <div v-for="(c, i) in form.criteria" :key="i" class="criterion-row">
              <div class="criterion-num">{{ i + 1 }}</div>
              <input v-model="c.name" class="crit-inp" placeholder="Название критерия" />
              <span class="criterion-pts">{{ c.weight }}</span>
              <button class="crit-del" aria-label="Удалить критерий" @click="removeCriterion(i)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div v-if="!form.criteria.length" class="no-criteria">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              <span>Добавьте критерии оценивания</span>
            </div>
          </div>
        </div>

      </div>

      <div class="modal-foot">
        <button class="btn btn-white" @click="$emit('close')">Отмена</button>
        <button class="btn btn-teal" :disabled="!canSubmit || saving" @click="submit">
          <div v-if="saving" class="spinner"></div>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Создать задание
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAssignmentsSvc } from '~/services/assignments'
import { useUploadSvc } from '~/services/uploads'
import { useToast } from '~/composables/useToast'
import { withNameFragment } from '~/composables/useAttachments'

const emit = defineEmits(['close', 'created'])
const props = defineProps<{ classId: number }>()
const svc = useAssignmentsSvc()
const uploadSvc = useUploadSvc()
const toast = useToast()
const saving = ref(false)
const drag = ref(false)
const dragRef = ref(false)
const taskFileInput = ref<HTMLInputElement>()
const refFileInput = ref<HTMLInputElement>()
const taskFiles = ref<File[]>([])

// Multi-file reference solutions
interface RefFileDraft { name: string; file: File | null; url: string }
const refFiles = ref<RefFileDraft[]>([])

const uploadingTask = ref(false)
const uploadingRef = ref(false)
const uploadIdx = ref(0)
const uploadPct = ref(0)

const fileEmoji = (f: File | null) => {
  if (!f) return 'FILE'
  const e = f.name.split('.').pop()?.toLowerCase() || ''
  if (e === 'pdf') return 'PDF'
  if (['doc','docx'].includes(e)) return 'DOC'
  if (['txt','md'].includes(e)) return 'TXT'
  if (['xls','xlsx'].includes(e)) return 'XLS'
  if (['ppt','pptx'].includes(e)) return 'PPT'
  if (['png','jpg','jpeg','gif','webp'].includes(e)) return 'IMG'
  return 'FILE'
}
const fileSz = (f: File | null) => {
  if (!f) return ''
  return f.size < 1048576 ? (f.size/1024).toFixed(0)+' KB' : (f.size/1048576).toFixed(1)+' MB'
}

const onPickFiles = (e: Event) => {
  taskFiles.value = [...taskFiles.value, ...Array.from((e.target as HTMLInputElement).files || [])]
}
const onDropFiles = (e: DragEvent) => {
  drag.value = false
  taskFiles.value = [...taskFiles.value, ...Array.from(e.dataTransfer?.files || [])]
}
const onPickRef = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || [])
  for (const f of files) {
    refFiles.value.push({ name: f.name, file: f, url: '' })
  }
  // reset input so same file can be re-added if needed
  if (refFileInput.value) refFileInput.value.value = ''
}
const onDropRef = (e: DragEvent) => {
  dragRef.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  for (const f of files) {
    refFiles.value.push({ name: f.name, file: f, url: '' })
  }
}

const form = ref({
  title: '',
  description: '',
  max_score: 100,
  deadline: '',
  criteria: [{ name: '', weight: 100 }]
})

const canSubmit = computed(() =>
  form.value.title.trim() &&
  form.value.criteria.length > 0 &&
  form.value.criteria.every(c => c.name.trim())
)

// Баллы за критерии больше не задаются вручную — делим max_score поровну,
// остаток (при неровном делении) добавляем первым критериям по порядку.
const redistributeWeights = () => {
  const list = form.value.criteria
  const n = list.length
  if (!n) return
  const base = Math.floor(form.value.max_score / n)
  const rem = form.value.max_score - base * n
  list.forEach((c, i) => { c.weight = base + (i < rem ? 1 : 0) })
}

const addCriterion = () => { form.value.criteria.push({ name: '', weight: 0 }); redistributeWeights() }
const removeCriterion = (i: number) => { form.value.criteria.splice(i, 1); redistributeWeights() }

const submit = async () => {
  if (!canSubmit.value || saving.value) return
  saving.value = true
  try {
    let description = form.value.description.trim() || undefined

    // Загружаем файлы задания
    if (taskFiles.value.length) {
      uploadingTask.value = true
      const urls: string[] = []
      for (let i = 0; i < taskFiles.value.length; i++) {
        uploadIdx.value = i + 1
        uploadPct.value = Math.round(((i + 1) / taskFiles.value.length) * 100)
        const { file_url } = await uploadSvc.upload(taskFiles.value[i])
        // Оригинальное имя — во фрагменте URL (единый формат с приложением);
        // клиенты скрывают эти строки при отображении описания
        urls.push(withNameFragment(file_url, taskFiles.value[i].name))
      }
      uploadingTask.value = false
      if (urls.length) {
        description = (description ? description + '\n' : '') + urls.join('\n')
      }
    }

    // Загружаем эталонные решения (несколько файлов)
    const resolvedRefUrls: string[] = []
    if (refFiles.value.length) {
      uploadingRef.value = true
      for (const rf of refFiles.value) {
        if (rf.url) {
          resolvedRefUrls.push(rf.url)
        } else if (rf.file) {
          const { file_url } = await uploadSvc.upload(rf.file)
          resolvedRefUrls.push(file_url)
        }
      }
      uploadingRef.value = false
    }

    // Store multiple URLs as JSON array (backend supports both single string and JSON array)
    const resolvedRefUrl = resolvedRefUrls.length === 1
      ? resolvedRefUrls[0]
      : resolvedRefUrls.length > 1
        ? JSON.stringify(resolvedRefUrls)
        : undefined

    const body: any = {
      class_id: props.classId,
      title: form.value.title.trim(),
      description,
      criteria: form.value.criteria.map(c => ({ name: c.name, weight: c.weight })),
      reference_solution_url: resolvedRefUrl,
    }
    if (form.value.deadline) body.deadline = new Date(form.value.deadline).toISOString()

    const created = await svc.create(body)

    toast.ok('Задание создано')
    emit('created', created)
  } catch (e: any) {
    toast.err(e?.response?.data?.detail || 'Ошибка создания задания')
  } finally {
    saving.value = false
    uploadingTask.value = false
    uploadingRef.value = false
  }
}
</script>

<style scoped>
/* Та же ступень поверхностей, что и на странице задания: белые «шасси»
   шапки и подвала, утопленное тело формы и белые карточки полей внутри —
   как в сгруппированных формах iOS. */
.modal {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-2xl);
  padding: 0; width: 100%; max-width: 620px; max-height: 88vh;
  display: flex; flex-direction: column; box-shadow: var(--sh-lg); overflow: hidden;
}
.sheet-grabber { display: none; }

.modal-head {
  position: relative; flex-shrink: 0; margin: 0;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 20px 22px 18px; background: var(--surface);
}
.modal-head-wash {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(var(--teal-rgb), .07), rgba(var(--teal-rgb), 0) 80%);
}
.modal-head-l { position: relative; display: flex; align-items: center; gap: 13px; min-width: 0; }
.modal-head-txt { min-width: 0; }
.modal-ico {
  width: 42px; height: 42px; border-radius: 13px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(150deg, var(--teal-h), var(--teal-d)); color: #fff;
  box-shadow: 0 2px 5px rgba(var(--teal-rgb), .26), 0 8px 18px rgba(var(--teal-rgb), .24);
}
.modal-title { font-size: 17px; font-weight: 800; letter-spacing: -.022em; color: var(--text1); }
.modal-sub { font-size: 12.5px; color: var(--text4); margin-top: 2px; }
.modal-close {
  position: relative; flex-shrink: 0;
  width: 30px; height: 30px; border-radius: 50%; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface2); color: var(--text3);
  transition: background .15s ease-out, color .15s ease-out, transform .12s cubic-bezier(.32,.72,0,1);
}
.modal-close:hover { background: var(--surface3); color: var(--text1); }
.modal-close:active { transform: scale(.9); }

.modal-body {
  padding: 18px 22px 24px; overflow-y: auto; flex: 1;
  display: flex; flex-direction: column; gap: 18px;
  background: var(--bg);
}
.modal-foot {
  padding: 14px 22px; flex-shrink: 0; margin: 0;
  border-top: 1px solid var(--border); background: var(--surface);
  display: flex; justify-content: flex-end; gap: 10px;
}

.field { display: flex; flex-direction: column; gap: 8px; }
.field-label {
  padding-left: 3px; font-size: 11.5px; font-weight: 800;
  color: var(--text4); text-transform: uppercase; letter-spacing: .06em;
}
.req { color: var(--teal); margin-left: 3px; }

.inp {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md);
  padding: 12px 14px; color: var(--text1); font-size: 13.5px; width: 100%;
  box-shadow: var(--sh-xs);
  transition: border-color .18s ease-out, box-shadow .18s ease-out;
}
.inp::placeholder { color: var(--text4); }
.inp:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(var(--teal-rgb),.12); }
.inp-ta { resize: vertical; min-height: 88px; line-height: 1.65; }

/* Критерии */
.criteria-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.crit-add {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px; border: none; border-radius: 100px; cursor: pointer;
  font-size: 12.5px; font-weight: 650; font-family: inherit;
  color: var(--teal); background: rgba(var(--teal-rgb), .11);
  transition: background .15s ease-out, transform .12s cubic-bezier(.32,.72,0,1);
}
.crit-add:hover { background: rgba(var(--teal-rgb), .18); }
.crit-add:active { transform: scale(.95); }
.criteria-hint { font-size: 12px; color: var(--text4); padding-left: 3px; margin-top: -3px; }
.criteria-list { display: flex; flex-direction: column; gap: 8px; }
.criterion-row {
  display: grid; grid-template-columns: 22px 1fr auto 26px; gap: 10px; align-items: center;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg);
  padding: 9px 12px; box-shadow: var(--sh-xs);
  transition: border-color .18s ease-out;
}
.criterion-row:focus-within { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(var(--teal-rgb),.1); }
.criterion-num {
  display: flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 7px;
  background: var(--surface2); color: var(--text3);
  font-size: 11px; font-weight: 800; font-variant-numeric: tabular-nums;
}
.crit-inp {
  background: transparent; border: none; outline: none; width: 100%;
  font-size: 13.5px; font-weight: 550; color: var(--text1); font-family: inherit;
}
.crit-inp::placeholder { color: var(--text4); font-weight: 400; }
.criterion-pts {
  font-size: 12px; font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap;
  color: var(--teal); background: rgba(var(--teal-rgb), .1); padding: 2px 9px; border-radius: 100px;
}
.crit-del {
  width: 26px; height: 26px; border-radius: 50%; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  background: transparent; color: var(--text4);
  transition: background .15s, color .15s, transform .12s;
}
.crit-del:hover { background: var(--red-l); color: var(--red); }
.crit-del:active { transform: scale(.9); }
.no-criteria {
  display: flex; align-items: center; gap: 8px; justify-content: center; padding: 22px;
  color: var(--text4); font-size: 13px;
  background: var(--surface); border: 1px dashed var(--border2); border-radius: var(--r-lg);
}

/* Загрузка файлов */
.file-drop {
  border: 1.5px dashed var(--border2); border-radius: var(--r-lg); padding: 20px 16px;
  display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;
  background: var(--surface);
  transition: border-color .18s ease-out, background .18s ease-out, transform .12s cubic-bezier(.32,.72,0,1);
}
.file-drop:hover, .file-drop.dragging { border-color: var(--teal); background: rgba(var(--teal-rgb),.05); }
.file-drop:active { transform: scale(.99); }
.file-drop.has-file { border-style: solid; border-color: var(--border); }
.drop-ico {
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface2); color: var(--text3);
  transition: background .18s ease-out, color .18s ease-out;
}
.file-drop:hover .drop-ico, .file-drop.dragging .drop-ico { background: rgba(var(--teal-rgb),.12); color: var(--teal); }
.drop-text { font-size: 13.5px; color: var(--text3); text-align: center; }
.drop-text strong { color: var(--teal); font-weight: 700; }
.drop-hint { font-size: 11.5px; color: var(--text4); text-align: center; }

/* Секция эталонного решения — нейтральная карточка с одним акцентом на
   бейдже «ИИ»: раньше зелёная заливка спорила с остальной формой. */
.ref-section {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--r-xl); padding: 15px; gap: 12px;
}
.ref-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.ref-header-l { display: flex; align-items: flex-start; gap: 11px; }
.ref-ico {
  width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; margin-top: 1px;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface); border: 1px solid var(--border); color: var(--text3);
}
.ref-title { font-size: 13.5px; font-weight: 750; letter-spacing: -.01em; color: var(--text1); }
.ref-desc { font-size: 12px; color: var(--text4); margin-top: 2px; line-height: 1.5; }
.ref-badge {
  flex-shrink: 0; font-size: 10.5px; font-weight: 800; letter-spacing: .05em;
  background: rgba(var(--teal-rgb), .12); color: var(--teal);
  border-radius: 100px; padding: 3px 9px;
}
.ref-file-info { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.ref-hint { font-size: 10.5px; color: var(--text4); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.attached-files {
  display: flex; flex-direction: column;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-md); overflow: hidden; box-shadow: var(--sh-xs);
}
.attached-file { display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-bottom: 1px solid var(--border); }
.attached-file:last-child { border-bottom: none; }
.af-name { font-size: 13px; font-weight: 550; color: var(--text1); flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.af-size { font-size: 11.5px; color: var(--text4); white-space: nowrap; font-variant-numeric: tabular-nums; }
.af-rm {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  background: var(--surface2); color: var(--text4); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 14px; line-height: 1;
  transition: background .15s, color .15s, transform .12s;
}
.af-rm:hover { background: var(--red-l); color: var(--red); }
.af-rm:active { transform: scale(.9); }

.upload-prog { display: flex; flex-direction: column; gap: 6px; }
.upload-track { width: 100%; height: 4px; background: var(--surface3); border-radius: 100px; overflow: hidden; }
.upload-bar { width: 100%; height: 100%; background: linear-gradient(90deg,var(--teal-h),var(--teal)); border-radius: 100px; transform-origin: left; transition: transform .35s cubic-bezier(.22,1,.36,1); }
/* Число эталонов заранее известно, но их аплоад идёт без пошагового прогресса —
   поэтому здесь бегущая полоса, а не ложные проценты. */
.upload-bar.indeterminate { width: 40%; animation: slide 1.1s ease-in-out infinite; }
@keyframes slide { 0% { transform: translateX(-100%) } 100% { transform: translateX(250%) } }
.upload-prog span { font-size: 11.5px; font-weight: 600; color: var(--teal); }

.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width:768px) {
  .modal { max-width: 100%; max-height: 96dvh; border: none; border-radius: 28px 28px 0 0; padding: 0; }
  .modal::before { display: none; }
  .sheet-grabber { display: block; width: 36px; height: 5px; border-radius: 3px; background: var(--surface3); margin: 8px auto 0; flex-shrink: 0; }
  .modal-head { padding: 12px 16px 14px; }
  .modal-ico { width: 38px; height: 38px; border-radius: 12px; }
  .modal-title { font-size: 16px; }
  .modal-body { padding: 14px 16px 20px; }
  .modal-foot { padding: 12px 16px calc(20px + env(safe-area-inset-bottom, 0px)); flex-direction: column-reverse; gap: 8px; }
  .modal-foot .btn { width: 100%; min-height: 46px; }
  .inp { font-size: 16px; }
  .inp-ta { font-size: 16px; min-height: 80px; }
  .crit-inp { font-size: 16px; }
  .criterion-row { grid-template-columns: 22px 1fr auto 30px; gap: 8px; padding: 8px 10px; }
  .file-drop { padding: 16px 14px; }
  .ref-section { padding: 12px; }
  .af-rm { width: 30px; height: 30px; font-size: 15px; }
  .crit-del { width: 30px; height: 30px; }
}
@media (max-width:480px) {
  .modal-head { padding: 12px 13px; }
  .modal-body { padding: 12px 13px 18px; }
  .modal-foot { padding: 10px 13px calc(18px + env(safe-area-inset-bottom, 0px)); }
  .criterion-row { grid-template-columns: 20px 1fr auto 28px; gap: 6px; }
}
</style>
