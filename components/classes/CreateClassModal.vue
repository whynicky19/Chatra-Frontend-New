<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal" style="max-width:480px;width:100%">
      <div class="modal-head">
        <span class="modal-title">Создать класс</span>
        <button class="btn btn-icon btn-ghost" @click="$emit('close')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Cover image upload -->
      <div class="frow">
        <label class="flabel">Обложка класса</label>
        <div class="cover-upload" @click="fileInput?.click()" :style="coverPreview ? `background-image:url(${coverPreview})` : ''">
          <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onImagePick"/>
          <div v-if="!coverPreview" class="cover-placeholder">
            <div class="cover-ph-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <span>Нажмите для загрузки фото</span>
            <span class="cover-ph-hint">JPG, PNG — будет обложкой карточки</span>
          </div>
          <button v-else class="cover-remove" @click.stop="coverPreview=null;coverBase64=null">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <div class="frow"><label class="flabel">Название класса *</label><input v-model="title" class="input" placeholder="Например: Математика 10А" autofocus/></div>
      <div class="frow"><label class="flabel">Описание</label><input v-model="description" class="input" placeholder="Краткое описание курса"/></div>
      <div class="frow"><label class="flabel">Период</label><input v-model="period" class="input" placeholder="Например: 2024-2025"/></div>
      <div class="frow"><label class="flabel">Учитель / Преподаватель</label><input v-model="teacher" class="input" placeholder="Ваше имя"/></div>

      <div class="modal-foot">
        <button class="btn btn-white" @click="$emit('close')">Отмена</button>
        <button class="btn btn-teal" :disabled="!title.trim()||loading" @click="submit">
          <div v-if="loading" class="spinner" style="width:13px;height:13px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
          <span v-else>Создать класс</span>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'
import { useClassesSvc } from '~/services/classes'
const emit = defineEmits<{close:[]; created:[p:any]}>()
const classesSvc = useClassesSvc(); const toast = useToast()
const title = ref(''); const period = ref(''); const teacher = ref(''); const description = ref(''); const loading = ref(false)
const coverPreview = ref<string|null>(null); const coverBase64 = ref<string|null>(null)
const fileInput = ref<HTMLInputElement|null>(null)

const onImagePick = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const result = ev.target?.result as string
    coverPreview.value = result; coverBase64.value = result
  }
  reader.readAsDataURL(f)
}

const submit = async () => {
  loading.value = true
  try {
    const p = await classesSvc.create(
      title.value,
      description.value,
      teacher.value || undefined,
      period.value || undefined,
      coverBase64.value || undefined,
    )
    toast.ok('Класс создан'); emit('created', p)
  } catch(e: any) { toast.err(e?.response?.data?.detail || 'Ошибка') }
  finally { loading.value = false }
}
</script>
<style scoped>
.cover-upload {
  width: 100%; height: 130px; border: 2px dashed var(--border2); border-radius: var(--r-lg);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  background-size: cover; background-position: center; background-repeat: no-repeat;
  position: relative; overflow: hidden; transition: all .2s;
}
.cover-upload:hover { border-color: var(--teal); background-color: rgba(var(--teal-rgb),.05); }
.cover-placeholder { display: flex; flex-direction: column; align-items: center; gap: 6px; color: var(--text4); pointer-events: none; }
.cover-ph-icon { width: 44px; height: 44px; border-radius: var(--r-md); background: var(--surface2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text3); }
.cover-placeholder span { font-size: 13px; font-weight: 500; color: var(--text3); }
.cover-ph-hint { font-size: 11px; color: var(--text4); }
.cover-remove { position: absolute; top: 8px; right: 8px; width: 26px; height: 26px; border-radius: 50%; background: rgba(0,0,0,.75); border: 1px solid rgba(255,255,255,.2); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; }
.cover-remove:hover { background: rgba(248,113,113,.8); }

@media (max-width:768px) {
  .cover-upload { height: 110px; }
}
</style>

