<template>
  <AppDialog overlay-class="overlay" panel-class="modal" labelledby="create-class-title" describedby="create-class-subtitle" @close="close">
      <div class="sheet-grabber"></div>

      <div class="modal-head">
        <div class="modal-head-wash" aria-hidden="true"></div>
        <div class="modal-head-l">
          <div class="modal-ico">
            <svg v-if="created" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
          </div>
          <div class="modal-head-txt">
            <div id="create-class-title" class="modal-title">{{ created ? L.coverTitle : L.createTitle }}</div>
            <div id="create-class-subtitle" class="modal-sub">{{ created ? L.coverSub : L.createSub }}</div>
          </div>
        </div>
        <button class="modal-close" :aria-label="L.close" @click="close">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Поля предмета скрываются после создания: на втором шаге модалка
             занимается только обложкой, и лишние поля отвлекали бы. Пока шаг
             первый — они идут до обложки: раскрытый выбор иконок иначе
             утаскивает главное поле («Название») ниже видимой части шторки. -->
        <template v-if="!created">
          <div class="field"><label class="field-label" for="create-class-name">{{ L.name }}<span aria-hidden="true" class="req">*</span></label><AutoTextarea id="create-class-name" v-model="title" class="inp" :max-height="110" :placeholder="L.namePlaceholder" autofocus/></div>
          <div class="field"><label class="field-label" for="create-class-description">{{ L.description }}</label><AutoTextarea id="create-class-description" v-model="description" class="inp" :max-height="130" :placeholder="L.descriptionPlaceholder"/></div>
          <div class="field-row">
            <div class="field"><label class="field-label" for="create-class-period">{{ L.period }}</label><input id="create-class-period" v-model="period" class="inp" :placeholder="academicYearPlaceholder"/></div>
            <div class="field"><label class="field-label" for="create-class-teacher">{{ L.teacher }}</label><input id="create-class-teacher" v-model="teacher" class="inp" :placeholder="L.teacherPlaceholder" autocomplete="name"/></div>
          </div>
        </template>

        <!-- Обложка — своя карточка: внутри свои плитки на --surface2, и на
             утопленном фоне формы они иначе сливались бы с ним. -->
        <div class="cover-card">
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
        </div>
      </div>

      <div class="modal-foot">
        <button v-if="!created" class="btn btn-white" @click="close">{{ L.cancel }}</button>
        <button v-if="!created" class="btn btn-teal" :disabled="!title.trim() || loading" @click="submit">
          <div v-if="loading" class="spinner"></div>
          <span v-else>{{ L.create }}</span>
        </button>
        <!-- Предмет уже сохранён, поэтому это просто «закрыть»: обложка есть в
             любом случае, даже если генерацию не запускали или она не удалась. -->
        <button v-else class="btn btn-teal" :disabled="generating" @click="close">{{ L.done }}</button>
      </div>
  </AppDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCoverArt } from '~/composables/useCoverArt'
import { useI18n } from '~/composables/useI18n'
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
const { lang } = useI18n()

const COPY = {
  coverTitle: { ru: 'Обложка предмета', en: 'Subject cover', kk: 'Пән мұқабасы' },
  createTitle: { ru: 'Создать предмет', en: 'Create subject', kk: 'Пән құру' },
  coverSub: { ru: 'Подберите цвет, иконку и картинку', en: 'Choose a color, icon and image', kk: 'Түс, белгіше және сурет таңдаңыз' },
  createSub: { ru: 'Название, период и преподаватель', en: 'Name, period and teacher', kk: 'Атауы, кезеңі және оқытушысы' },
  close: { ru: 'Закрыть', en: 'Close', kk: 'Жабу' },
  name: { ru: 'Название предмета', en: 'Subject name', kk: 'Пән атауы' },
  namePlaceholder: { ru: 'Например: Математика 10А', en: 'For example: Mathematics 10A', kk: 'Мысалы: Математика 10А' },
  description: { ru: 'Описание', en: 'Description', kk: 'Сипаттама' },
  descriptionPlaceholder: { ru: 'Краткое описание курса', en: 'Short course description', kk: 'Курстың қысқаша сипаттамасы' },
  period: { ru: 'Период', en: 'Period', kk: 'Кезең' },
  teacher: { ru: 'Преподаватель', en: 'Teacher', kk: 'Оқытушы' },
  teacherPlaceholder: { ru: 'Ваше имя', en: 'Your name', kk: 'Атыңыз' },
  cancel: { ru: 'Отмена', en: 'Cancel', kk: 'Бас тарту' },
  create: { ru: 'Создать предмет', en: 'Create subject', kk: 'Пән құру' },
  done: { ru: 'Готово', en: 'Done', kk: 'Дайын' },
  created: { ru: 'Предмет создан', en: 'Subject created', kk: 'Пән құрылды' },
  error: { ru: 'Ошибка', en: 'Something went wrong', kk: 'Қате' },
  tooMany: { ru: 'Слишком много генераций подряд — попробуйте позже.', en: 'Too many cover generations — try again later.', kk: 'Мұқаба жасау әрекеті тым көп — кейінірек қайталап көріңіз.' },
  coverError: { ru: 'Не удалось сгенерировать обложку. Обложка по умолчанию уже сохранена.', en: 'The cover could not be generated. The default cover has been saved.', kk: 'Мұқабаны жасау мүмкін болмады. Әдепкі мұқаба сақталды.' },
} as const
const L = computed(() => Object.fromEntries(
  Object.entries(COPY).map(([key, values]) => [key, values[lang.value as keyof typeof values] || values.en]),
) as Record<keyof typeof COPY, string>)
const academicYearPlaceholder = computed(() => {
  const now = new Date()
  const start = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
  return `${start}–${start + 1}`
})

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

    toast.ok(L.value.created)
    // Первую генерацию запускаем сами — для пользователя это продолжение
    // нажатия «Создать предмет», а не отдельное непонятное действие.
    generateCover()
  } catch (e: any) {
    toast.err(e?.response?.data?.detail || L.value.error)
  } finally {
    loading.value = false
  }
}

const generateCover = async () => {
  if (!created.value || generating.value) return   // защита от двойного клика
  const prevImage = created.value.cover_image
  const prevSource = created.value.cover_source
  generating.value = true
  coverError.value = null
  try {
    const res = await classesSvc.generateCover(created.value.id, coverColor.value, coverIcon.value)
    created.value = { ...created.value, ...res } as ClassResponse
    emit('cover', created.value)
  } catch (e: any) {
    const detail = e?.response?.data?.detail
    if (detail === 'too_many_cover_generations') {
      coverError.value = L.value.tooMany
      return
    }
    // 409 «генерация уже идёт» или обрыв связи: сервер всё равно дорисует и
    // сохранит — ждём результат, а не показываем ложную ошибку.
    const recoverable = detail === 'cover_generation_in_progress'
      || e?.response == null || (e?.response?.status ?? 0) >= 500
    if (!recoverable) {
      coverError.value = L.value.coverError
      return
    }
    const recovered = await classesSvc.awaitPendingCover(created.value.id, prevImage, prevSource)
    if (recovered) {
      created.value = { ...created.value, ...recovered } as ClassResponse
      emit('cover', created.value)
    } else {
      coverError.value = L.value.coverError
    }
  } finally {
    generating.value = false
  }
}

const close = () => {
  // Закрывать можно и во время генерации: POST уже отправлен, сервер
  // дорисует и сохранит обложку сам, карточка подхватит её при обновлении.
  emit('close')
}
</script>

<style scoped>
/* Та же ступень поверхностей, что и в остальных формах создания: белые
   «шасси» шапки и подвала, утопленное тело и белые карточки полей. */
:deep(.modal) {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-2xl);
  padding: 0; width: 100%; max-width: 720px; max-height: 94vh;
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
  display: flex; flex-direction: column; gap: 16px;
  background: var(--bg);
}
.modal-foot {
  padding: 14px 22px; flex-shrink: 0; margin: 0;
  border-top: 1px solid var(--border); background: var(--surface);
  display: flex; align-items: center; justify-content: flex-end; gap: 10px;
}

.cover-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-xl); padding: 15px; box-shadow: var(--sh-xs);
}

.field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
/* Период и преподаватель — короткие поля, в одну строку они не растягивают
   форму по вертикали. */
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field-label {
  padding-left: 3px; font-size: 11.5px; font-weight: 800;
  color: var(--text4); text-transform: uppercase; letter-spacing: .06em;
}
.req { color: var(--teal); margin-left: 3px; }
.inp {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md);
  padding: 12px 14px; color: var(--text1); font-size: 13.5px; width: 100%;
  box-shadow: var(--sh-xs); font-family: inherit;
  transition: border-color .18s ease-out, box-shadow .18s ease-out;
}
.inp::placeholder { color: var(--text4); }
.inp:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(var(--teal-rgb),.12); outline: none; }

.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width:768px) {
  :deep(.modal) { max-width: 100%; max-height: 96dvh; border: none; border-radius: 28px 28px 0 0; padding: 0; }
  .modal::before { display: none; }
  .sheet-grabber { display: block; width: 36px; height: 5px; border-radius: 3px; background: var(--surface3); margin: 8px auto 0; flex-shrink: 0; }
  .modal-head { padding: 12px 16px 14px; }
  .modal-ico { width: 38px; height: 38px; border-radius: 12px; }
  .modal-title { font-size: 16px; }
  .modal-body { padding: 14px 16px 20px; }
  .modal-foot { padding: 12px 16px calc(20px + env(safe-area-inset-bottom, 0px)); flex-direction: column-reverse; gap: 8px; }
  .modal-foot .btn { width: 100%; min-height: 46px; }
  .inp { font-size: 16px; }
  .field-row { grid-template-columns: 1fr; gap: 16px; }
}
@media (max-width:480px) {
  .modal-head { padding: 12px 13px; }
  .modal-body { padding: 12px 13px 18px; }
  .modal-foot { padding: 10px 13px calc(18px + env(safe-area-inset-bottom, 0px)); }
}
</style>
