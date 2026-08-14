<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="sheet-grabber"></div>

      <div class="modal-head">
        <div class="modal-head-wash" aria-hidden="true"></div>
        <div class="modal-head-l">
          <div class="modal-ico">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
          </div>
          <div class="modal-head-txt">
            <div class="modal-title">Добавить лекцию</div>
            <div class="modal-sub">Учебный материал для класса</div>
          </div>
        </div>
        <button class="modal-close" aria-label="Закрыть" @click="$emit('close')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="field">
          <label class="field-label">Тема лекции<span class="req">*</span></label>
          <input v-model="title" class="inp" placeholder="Например: Введение в тему..." autofocus />
        </div>
        <div class="field">
          <label class="field-label">Содержание лекции</label>
          <textarea v-model="body" class="inp inp-ta" rows="4" placeholder="Текст лекции, ссылки на видео..."></textarea>
        </div>

        <!-- File upload -->
        <div class="field">
          <label class="field-label">Прикрепить файлы</label>
          <div class="file-drop" :class="{ dragging: drag, 'has-file': selFiles.length }" @dragover.prevent="drag=true" @dragleave="drag=false" @drop.prevent="onDrop" @click="fi?.click()">
            <input type="file" style="display:none" ref="fi" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.ppt,.pptx" @change="onPick" />
            <div class="drop-ico">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <span class="drop-text">Перетащите или <strong>нажмите для выбора</strong></span>
            <span class="drop-hint">PDF, DOCX, PPT, изображения и другие</span>
          </div>

          <div v-if="selFiles.length" class="files-list">
            <div v-for="(f, i) in selFiles" :key="`${f.name}_${f.size}_${f.lastModified}`" class="file-item">
              <span class="ftb ftb-sm">{{ fileIcon(f) }}</span>
              <span class="file-name">{{ f.name }}</span>
              <span class="file-size">{{ fileSize(f) }}</span>
              <button class="file-rm" @click.stop="removeFile(i)">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Upload progress -->
        <div v-if="uploading" class="upload-progress">
          <div class="upload-bar-wrap">
            <div class="upload-bar" :style="{ transform: `scaleX(${uploadPct / 100})` }"></div>
          </div>
          <span class="upload-text">Загрузка {{ uploadCurrent }}/{{ selFiles.length }}...</span>
        </div>
      </div>

      <div class="modal-foot">
        <button class="btn btn-white" @click="$emit('close')">Отмена</button>
        <button class="btn btn-teal" :disabled="!title.trim() || loading" @click="submit">
          <div v-if="loading" class="spinner"></div>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Опубликовать лекцию
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'
import { usePostsSvc } from '~/services/posts'
import { useUploadSvc } from '~/services/uploads'

const props = defineProps<{ classId: number }>()
const emit = defineEmits<{ close: []; created: [p: any] }>()

const postsSvc = usePostsSvc()
const uploadSvc = useUploadSvc()
const toast = useToast()

const title = ref('')
const body = ref('')
const loading = ref(false)
const selFiles = ref<File[]>([])
const drag = ref(false)
const fi = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadCurrent = ref(0)
const uploadPct = ref(0)

const fileIcon = (f: File) => {
  if (f.type.startsWith('image/')) return 'IMG'
  const ext = f.name.split('.').pop()?.toLowerCase() || ''
  return ({ pdf: 'PDF', doc: 'DOC', docx: 'DOC', xls: 'XLS', xlsx: 'XLS', ppt: 'PPT', pptx: 'PPT', zip: 'ZIP', txt: 'TXT' })[ext] || 'FILE'
}
const fileSize = (f: File) => f.size < 1024 * 1024 ? (f.size / 1024).toFixed(0) + ' KB' : (f.size / 1024 / 1024).toFixed(1) + ' MB'

const onPick = (e: Event) => {
  selFiles.value = [...selFiles.value, ...Array.from((e.target as HTMLInputElement).files || [])]
}
const onDrop = (e: DragEvent) => {
  drag.value = false
  selFiles.value = [...selFiles.value, ...Array.from(e.dataTransfer?.files || [])]
}
const removeFile = (i: number) => { selFiles.value = selFiles.value.filter((_, idx) => idx !== i) }

const submit = async () => {
  loading.value = true
  uploading.value = selFiles.value.length > 0
  uploadCurrent.value = 0
  uploadPct.value = 0
  try {
    // Тело поста в едином с приложением формате JSON: {content, files:["<url>#<имя>"]}
    const files: string[] = []
    for (let i = 0; i < selFiles.value.length; i++) {
      uploadCurrent.value = i + 1
      uploadPct.value = Math.round(((i + 1) / selFiles.value.length) * 100)
      const { file_url } = await uploadSvc.upload(selFiles.value[i])
      // Ответ без file_url — сбой аплоада: прерываем публикацию, иначе в тело
      // поста уйдёт битая ссылка "undefined#имя" (паритет с AssignmentModal).
      if (!file_url) throw new Error('upload_failed')
      files.push(`${file_url}#${encodeURIComponent(selFiles.value[i].name)}`)
    }
    const finalBody = JSON.stringify({
      content: body.value,
      ...(files.length ? { files } : {}),
    })

    const p = await postsSvc.create(
      `[LECTURE][${props.classId}] ${title.value}`,
      finalBody
    )
    toast.ok('Лекция опубликована')
    emit('created', p)
  } catch (e: any) {
    toast.err(e?.response?.data?.detail || 'Ошибка')
  } finally {
    loading.value = false
    uploading.value = false
  }
}
</script>

<style scoped>
/* Та же ступень поверхностей, что и на странице задания: белые «шасси»
   шапки и подвала, утопленное тело формы и белые карточки полей внутри —
   как в сгруппированных формах iOS. */
.modal {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-2xl);
  padding: 0; width: 100%; max-width: 560px; max-height: 88vh;
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
/* Закрытие — круглый серый глиф, как в шторках iOS */
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
  display: flex; flex-direction: column; gap: 16px;
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
.inp-ta { resize: vertical; min-height: 96px; line-height: 1.65; }

.file-drop {
  border: 1.5px dashed var(--border2); border-radius: var(--r-lg); padding: 22px 16px;
  display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;
  background: var(--surface);
  transition: border-color .18s ease-out, background .18s ease-out, transform .12s cubic-bezier(.32,.72,0,1);
}
.file-drop:hover, .file-drop.dragging { border-color: var(--teal); background: rgba(var(--teal-rgb),.05); }
.file-drop:active { transform: scale(.99); }
.file-drop.has-file { border-style: solid; border-color: var(--border); }
.drop-ico {
  width: 42px; height: 42px; border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface2); color: var(--text3);
  transition: background .18s ease-out, color .18s ease-out;
}
.file-drop:hover .drop-ico, .file-drop.dragging .drop-ico { background: rgba(var(--teal-rgb),.12); color: var(--teal); }
.drop-text { font-size: 13.5px; color: var(--text3); text-align: center; }
.drop-text strong { color: var(--teal); font-weight: 700; }
.drop-hint { font-size: 11.5px; color: var(--text4); text-align: center; }

.files-list {
  display: flex; flex-direction: column;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-md); overflow: hidden; box-shadow: var(--sh-xs);
}
.file-item { display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-bottom: 1px solid var(--border); }
.file-item:last-child { border-bottom: none; }
.file-name { font-size: 13px; font-weight: 550; color: var(--text1); flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.file-size { font-size: 11.5px; color: var(--text4); white-space: nowrap; font-variant-numeric: tabular-nums; }
.file-rm {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  background: var(--surface2); color: var(--text4); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s, color .15s, transform .12s;
}
.file-rm:hover { background: var(--red-l); color: var(--red); }
.file-rm:active { transform: scale(.9); }

.upload-progress { display: flex; flex-direction: column; gap: 6px; }
.upload-bar-wrap { height: 4px; background: var(--surface2); border-radius: 100px; overflow: hidden; }
.upload-bar { width: 100%; height: 100%; background: linear-gradient(90deg,var(--teal-h),var(--teal)); border-radius: 100px; transform-origin: left; transition: transform .35s cubic-bezier(.22,1,.36,1); }
.upload-text { font-size: 11.5px; font-weight: 600; color: var(--teal); }

.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width:768px) {
  .modal { max-width: 100%; max-height: 96dvh; border: none; border-radius: 28px 28px 0 0; padding: 0; }
  /* Свою «ручку» рисуем внутри шапки — глобальная .modal::before легла бы
     на самый край шторки, поверх градиента. */
  .modal::before { display: none; }
  .sheet-grabber { display: block; width: 36px; height: 5px; border-radius: 3px; background: var(--surface3); margin: 8px auto 0; flex-shrink: 0; }
  .modal-head { padding: 12px 16px 14px; }
  .modal-ico { width: 38px; height: 38px; border-radius: 12px; }
  .modal-title { font-size: 16px; }
  .modal-body { padding: 14px 16px 20px; }
  .modal-foot { padding: 12px 16px calc(20px + env(safe-area-inset-bottom, 0px)); flex-direction: column-reverse; gap: 8px; }
  .modal-foot .btn { width: 100%; min-height: 46px; }
  .inp { font-size: 16px; }
  .inp-ta { font-size: 16px; }
  .file-drop { padding: 16px 14px; }
  .file-rm { width: 30px; height: 30px; }
}
@media (max-width:480px) {
  .modal-body { padding: 12px 13px 18px; }
  .modal-head { padding: 12px 13px; }
  .modal-foot { padding: 10px 13px calc(18px + env(safe-area-inset-bottom, 0px)); }
}
</style>
