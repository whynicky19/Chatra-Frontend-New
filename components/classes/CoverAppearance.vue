<!--
  Выбор оформления обложки предмета: цвет + предметная иконка + превью.

  Загрузки своей фотографии здесь нет: обложку рисует бэкенд по паре
  «цвет + иконка» (POST /classes/{id}/cover/generate). Тот же компонент
  используется и при создании, и при редактировании предмета, поэтому
  выбор выглядит одинаково в обоих местах.

  Пока предмет ещё не создан (classId = null) кнопки генерации нет —
  показывается локальное превью, а генерация запускается сразу после
  создания родительским экраном.
-->
<template>
  <div class="cover-appearance">
    <label class="ca-label">{{ L.appearance }}</label>

    <!-- Превью — тот же компонент, что рисует обложку во всём остальном
         приложении, поэтому здесь видно ровно то, что получит пользователь:
         фон (сохранённый или ровная заливка цвета) + иконка поверх. -->
    <div class="ca-preview">
      <SubjectCover :src="coverUrl" :icon="icon" :color="color" :size="58">
        <div v-if="generating" class="ca-preview-veil">
          <div class="spinner ca-spinner"></div>
          <span>{{ L.generating }}</span>
        </div>
      </SubjectCover>
    </div>

    <p v-if="error" class="ca-error">{{ error }}</p>
    <p v-else-if="isFallback" class="ca-note">{{ L.fallbackNote }}</p>

    <!-- Цвет -->
    <div class="ca-group">
      <span class="ca-group-label">{{ L.color }}</span>
      <div class="ca-swatches">
        <button v-for="c in options.colors" :key="c.id" type="button" class="ca-swatch"
                :class="{ 'ca-swatch-on': c.id === color }"
                :style="{ background: c.base }"
                :aria-label="c.id" :aria-pressed="c.id === color"
                :disabled="generating"
                @click="$emit('update:color', c.id)">
          <svg v-if="c.id === color" width="12" height="12" viewBox="0 0 24 24" fill="none"
               stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Иконка. Символов больше сорока, поэтому по умолчанию видна только
         первая полоска: развёрнутый список занимал восемь рядов и выталкивал
         за экран название предмета и кнопку сохранения. -->
    <div class="ca-group">
      <span class="ca-group-label">{{ L.icon }}</span>

      <div v-if="!expanded" class="ca-icons">
        <button v-for="i in firstRow" :key="i.id" type="button" class="ca-icon"
                :class="{ 'ca-icon-on': i.id === icon }"
                :style="i.id === icon ? { borderColor: coverArt.colorHex(color), color: coverArt.colorHex(color) } : undefined"
                :title="coverArt.iconLabel(i.id, lang)" :aria-label="coverArt.iconLabel(i.id, lang)"
                :aria-pressed="i.id === icon"
                :disabled="generating"
                @click="$emit('update:icon', i.id)">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path :d="coverArt.iconPath(i.id)"/>
          </svg>
        </button>
      </div>

      <!-- Развёрнутый список — секциями: сорок с лишним подряд не листаются. -->
      <div v-else class="ca-sections">
        <div v-for="g in grouped" :key="g.id" class="ca-section">
          <span v-if="g.label" class="ca-section-label">{{ g.label }}</span>
          <div class="ca-icons">
            <button v-for="i in g.icons" :key="i.id" type="button" class="ca-icon"
                    :class="{ 'ca-icon-on': i.id === icon }"
                    :style="i.id === icon ? { borderColor: coverArt.colorHex(color), color: coverArt.colorHex(color) } : undefined"
                    :title="coverArt.iconLabel(i.id, lang)" :aria-label="coverArt.iconLabel(i.id, lang)"
                    :aria-pressed="i.id === icon"
                    :disabled="generating"
                    @click="$emit('update:icon', i.id)">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path :d="coverArt.iconPath(i.id)"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <button v-if="options.icons.length > firstRow.length" type="button" class="ca-more"
              :aria-expanded="expanded" @click="expanded = !expanded">
        <span>{{ expanded ? L.less : `${L.more} (${options.icons.length})` }}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
             :style="{ transform: expanded ? 'rotate(180deg)' : 'none' }">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
    </div>

    <!-- Генерация доступна только у уже созданного предмета. -->
    <button v-if="classId && options.ai_available" type="button" class="btn btn-white ca-generate"
            :disabled="generating" @click="$emit('generate')">
      <div v-if="generating" class="spinner ca-spinner-sm"></div>
      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
      </svg>
      <span>{{ generating ? L.generating : (coverUrl ? L.regenerate : L.generate) }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { FALLBACK_COVER_OPTIONS, useCoverArt } from '~/composables/useCoverArt'
import { useI18n } from '~/composables/useI18n'

const props = defineProps<{
  color: string
  icon: string
  /** Сохранённая обложка предмета; null, пока предмет не создан. */
  coverUrl?: string | null
  /** 'ai' | 'fallback' | 'upload' | null — см. classes.cover_source. */
  coverSource?: string | null
  /** null — предмет ещё не создан, кнопки генерации нет. */
  classId?: number | null
  generating?: boolean
  error?: string | null
}>()

defineEmits<{
  'update:color': [v: string]
  'update:icon': [v: string]
  generate: []
}>()

const coverArt = useCoverArt()
const { lang } = useI18n()

// Набор кэшируется на сессию (см. useCoverArt), поэтому при повторном
// открытии формы он уже есть. При самом первом открытии рисуем запасной
// набор, а не пустоту: цвета и иконки в нём те же, что на бэкенде, и пикер
// не мигает пустым кадром, пока летит запрос.
const options = ref(coverArt.options.value || FALLBACK_COVER_OPTIONS)

// Свёрнутый список показывает ровно одну полоску, поэтому нужно знать число
// колонок — оно задано в CSS и меняется на том же брейкпоинте, что и сетка.
const NARROW = '(max-width: 768px)'
const perRow = ref(6)
let mq: MediaQueryList | null = null
const syncPerRow = () => { perRow.value = mq?.matches ? 4 : 6 }

const expanded = ref(false)
const firstRow = computed(() => options.value.icons.slice(0, perRow.value))

/** Символы секциями; неизвестная/пустая группа — в конец одним блоком, чтобы
 *  старый ответ бэкенда без groups не потерял ни одного варианта. */
const grouped = computed(() => {
  const icons = options.value.icons
  const sections = (options.value.groups || [])
    .map((g) => ({
      id: g.id,
      label: coverArt.groupLabel(g.id, lang.value, g.label),
      icons: icons.filter((i) => i.group === g.id),
    }))
    .filter((g) => g.icons.length)
  const known = new Set(sections.flatMap((s) => s.icons.map((i) => i.id)))
  const rest = icons.filter((i) => !known.has(i.id))
  if (rest.length) sections.push({ id: '__rest', label: '', icons: rest })
  return sections
})

onMounted(async () => {
  mq = window.matchMedia(NARROW)
  syncPerRow()
  mq.addEventListener('change', syncPerRow)
  options.value = await coverArt.load()
  // Выбранный символ обязан быть виден. Если он не попал в первую полоску
  // (например, «Кулинария» из последней секции), открываем список сразу —
  // иначе пользователь не понимает, что вообще выбрано.
  if (!firstRow.value.some((i) => i.id === props.icon)) expanded.value = true
})
onBeforeUnmount(() => mq?.removeEventListener('change', syncPerRow))

// Подстановку заливки вместо не загрузившейся картинки берёт на себя
// SubjectCover — здесь остаётся только подсказка про фолбэк.
const isFallback = computed(() => props.coverSource === 'fallback' && !!props.coverUrl)

const COPY: Record<string, Record<string, string>> = {
  appearance:   { ru: 'ОФОРМЛЕНИЕ',  en: 'APPEARANCE',  kk: 'РӘСІМДЕУ' },
  color:        { ru: 'Цвет',        en: 'Color',       kk: 'Түс' },
  icon:         { ru: 'Иконка',      en: 'Icon',        kk: 'Белгіше' },
  more:         { ru: 'Все иконки',  en: 'All icons',   kk: 'Барлық белгішелер' },
  less:         { ru: 'Свернуть',    en: 'Collapse',    kk: 'Жию' },
  generate:     { ru: 'Сгенерировать обложку', en: 'Generate cover', kk: 'Мұқаба жасау' },
  regenerate:   { ru: 'Перегенерировать',      en: 'Regenerate',     kk: 'Қайта жасау' },
  generating:   { ru: 'Создаём обложку…',      en: 'Creating your cover…', kk: 'Мұқаба жасалуда…' },
  fallbackNote: {
    ru: 'Обложка создана без ИИ — можно попробовать сгенерировать ещё раз.',
    en: 'Cover was created without AI — you can try generating again.',
    kk: 'Мұқаба ЖИ-сіз жасалды — қайта жасап көруге болады.',
  },
}
const L = computed(() => Object.fromEntries(
  Object.entries(COPY).map(([k, v]) => [k, v[lang.value] || v.en]),
) as Record<keyof typeof COPY, string>)
</script>

<style scoped>
.cover-appearance { display: flex; flex-direction: column; gap: 12px; }
.ca-label { font-size: 11px; font-weight: 700; letter-spacing: .06em; color: var(--text4); }

.ca-preview { height: 140px; border-radius: var(--r-lg); overflow: hidden; }
.ca-preview-veil {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; background: rgba(0,0,0,.55); backdrop-filter: blur(3px);
  color: #fff; font-size: 13px; font-weight: 600;
}
.ca-spinner { width: 22px; height: 22px; border-width: 2.5px; border-color: rgba(255,255,255,.25); border-top-color: #fff; }
.ca-spinner-sm { width: 13px; height: 13px; border-width: 2px; border-color: rgba(var(--teal-rgb),.25); border-top-color: var(--teal); }

.ca-error { font-size: 12px; color: #f87171; margin: 0; }
.ca-note  { font-size: 12px; color: var(--text4); margin: 0; }

.ca-group { display: flex; flex-direction: column; gap: 8px; }
.ca-group-label { font-size: 12px; font-weight: 600; color: var(--text3); }

.ca-swatches { display: flex; flex-wrap: wrap; gap: 8px; }
.ca-swatch {
  width: 30px; height: 30px; border-radius: 50%; border: 2px solid transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: transform .15s, box-shadow .15s;
  padding: 0;
}
.ca-swatch:hover:not(:disabled) { transform: scale(1.08); }
.ca-swatch-on { box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px currentColor; }
.ca-swatch:disabled, .ca-icon:disabled { opacity: .55; cursor: default; }

.ca-icons { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
.ca-icon {
  aspect-ratio: 1; border-radius: var(--r-md); border: 1.5px solid var(--border);
  background: var(--surface2); color: var(--text3); cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all .15s; padding: 0;
}
.ca-icon:hover:not(:disabled) { border-color: var(--border2); color: var(--text2); }
.ca-icon-on { background: var(--surface); border-width: 2px; }

/* Развёрнутый список ограничен по высоте и скроллится внутри: иначе он
   выталкивает поля формы за пределы модалки. */
.ca-sections {
  display: flex; flex-direction: column; gap: 12px;
  max-height: 280px; overflow-y: auto; padding-right: 4px;
}
.ca-section { display: flex; flex-direction: column; gap: 6px; }
.ca-section-label {
  font-size: 10px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
  color: var(--text4);
}
.ca-more {
  align-self: flex-start; display: inline-flex; align-items: center; gap: 5px;
  background: none; border: none; padding: 2px 0; cursor: pointer;
  font-size: 12px; font-weight: 600; color: var(--teal);
}
.ca-more:hover { opacity: .8; }
.ca-more svg { transition: transform .15s; }

.ca-generate { align-self: flex-start; display: inline-flex; align-items: center; gap: 7px; }

@media (max-width: 768px) {
  .ca-preview { height: 120px; }
  .ca-icons { grid-template-columns: repeat(4, 1fr); }
}
</style>
