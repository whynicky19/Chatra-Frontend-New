<template>
  <div class="overlay" @click.self="close">
    <div class="modal" style="max-width:520px;width:100%">
      <div class="modal-head">
        <span class="modal-title">{{ created ? 'Обложка предмета' : 'Создать класс' }}</span>
        <button class="btn btn-icon btn-ghost" @click="close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="ccm-body">
        <CoverAppearance
          v-model:color="coverColor"
          v-model:icon="coverIcon"
          :cover-url="created?.cover_thumbnail || created?.cover_image"
          :cover-source="created?.cover_source"
          :class-id="created?.id ?? null"
          :generating="generating"
          :error="coverError"
          @generate="generateCover"
        />

        <!-- Поля предмета скрываются после создания: на втором шаге модалка
             занимается только обложкой, и лишние поля отвлекали бы. -->
        <template v-if="!created">
          <div class="frow"><label class="flabel">Название класса *</label><input v-model="title" class="input" placeholder="Например: Математика 10А" autofocus/></div>
          <div class="frow"><label class="flabel">Описание</label><input v-model="description" class="input" placeholder="Краткое описание курса"/></div>
          <div class="frow"><label class="flabel">Период</label><input v-model="period" class="input" placeholder="Например: 2024-2025"/></div>
          <div class="frow"><label class="flabel">Учитель / Преподаватель</label><input v-model="teacher" class="input" placeholder="Ваше имя"/></div>
        </template>
      </div>

      <div class="modal-foot">
        <button v-if="!created" class="btn btn-white" @click="close">Отмена</button>
        <button v-if="!created" class="btn btn-teal" :disabled="!title.trim() || loading" @click="submit">
          <div v-if="loading" class="spinner" style="width:13px;height:13px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
          <span v-else>Создать класс</span>
        </button>
        <!-- Предмет уже сохранён, поэтому это просто «закрыть»: обложка есть в
             любом случае, даже если генерацию не запускали или она не удалась. -->
        <button v-else class="btn btn-teal" :disabled="generating" @click="close">Готово</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCoverArt } from '~/composables/useCoverArt'
import { useToast } from '~/composables/useToast'
import { useClassesSvc, type ClassResponse } from '~/services/classes'

const emit = defineEmits<{
  close: []
  /** Один раз, сразу после создания предмета: родитель вступает в класс и
   *  обновляет каталог. Модалку при этом НЕ закрывает — дальше идёт шаг
   *  обложки. */
  created: [p: any]
  /** После каждой генерации: обложка на сервере уже заменена, родителю
   *  остаётся обновить карточку в списке. */
  cover: [p: any]
}>()
const classesSvc = useClassesSvc()
const coverArt = useCoverArt()
const toast = useToast()

const title = ref(''); const period = ref(''); const teacher = ref(''); const description = ref('')
const loading = ref(false)

const coverColor = ref('teal'); const coverIcon = ref('book')
coverArt.load().then((o) => {
  coverColor.value = o.default_color
  coverIcon.value = o.default_icon
})

// Предмет, созданный на первом шаге. Пока он null — модалка на шаге ввода
// данных; как только появился, переключаемся на работу с обложкой.
const created = ref<ClassResponse | null>(null)
const generating = ref(false)
const coverError = ref<string | null>(null)

const submit = async () => {
  loading.value = true
  try {
    const p = await classesSvc.create(
      title.value,
      description.value,
      teacher.value || undefined,
      period.value || undefined,
      coverColor.value,
      coverIcon.value,
    )
    created.value = p
    // Родитель узнаёт о новом предмете сразу: он уже сохранён и с обложкой,
    // а дальнейшая генерация просто заменит картинку.
    emit('created', p)

    toast.ok('Класс создан')
    // Первую генерацию запускаем сами — для пользователя это продолжение
    // нажатия «Создать класс», а не отдельное непонятное действие.
    generateCover()
  } catch (e: any) {
    toast.err(e?.response?.data?.detail || 'Ошибка')
  } finally {
    loading.value = false
  }
}

const generateCover = async () => {
  if (!created.value || generating.value) return   // защита от двойного клика
  generating.value = true
  coverError.value = null
  try {
    const res = await classesSvc.generateCover(created.value.id, coverColor.value, coverIcon.value)
    created.value = { ...created.value, ...res } as ClassResponse
    emit('cover', created.value)
  } catch (e: any) {
    const detail = e?.response?.data?.detail
    coverError.value = detail === 'too_many_cover_generations'
      ? 'Слишком много генераций подряд — попробуйте позже.'
      : 'Не удалось сгенерировать обложку. Обложка по умолчанию уже сохранена.'
  } finally {
    generating.value = false
  }
}

const close = () => {
  if (generating.value) return   // не бросаем запрос генерации на полпути
  emit('close')
}
</script>

<style scoped>
.ccm-body { display: flex; flex-direction: column; gap: 16px; }
</style>
