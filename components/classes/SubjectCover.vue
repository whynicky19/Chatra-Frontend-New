<!--
  Обложка предмета: готовая AI-сцена или локальный фолбэк + SVG-иконка.

  Единственное место в вебе, которое знает, как выглядит обложка. Все списки,
  карточки, шапки и превью используют его, поэтому иконка везде одного размера,
  одной толщины линии и одного стиля. Новая AI-сцена (`ai_hero`) уже содержит
  крупный 3D-объект, поэтому вторая иконка на ней скрывается.

  SVG остаётся только для старых AI-фонов (`ai`), чтобы существующие обложки не
  изменились до явной перегенерации. Новый фолбэк тоже строится по названию.

  Предметы без cover_icon (обложка загружена пользователем по старой системе)
  показываются как есть, без оверлея — трогать чужую картинку нельзя.
-->
<template>
  <div class="subject-cover" :style="rootStyle">
    <img v-if="showImage" :src="fixFileUrl(src!)" class="sc-img" alt="" loading="lazy"
         decoding="async" @error="failed = true"/>
    <!-- Новые AI- и fallback-обложки строятся по названию курса. Иконка
         остаётся только для старых фонов, где она была частью дизайна. -->
    <svg v-if="showIcon" class="sc-icon" :style="{ width: `${size}px`, height: `${size}px` }"
         viewBox="0 0 24 24" fill="none" stroke="#fff"
         :stroke-width="strokeWidth"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path :d="coverArt.iconPath(icon)"/>
    </svg>
    <slot/>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCoverArt } from '~/composables/useCoverArt'
import { fixFileUrl } from '~/composables/useFileUrl'

const props = withDefaults(defineProps<{
  /** cover_thumbnail в списках, cover_image там, где обложка крупная. */
  src?: string | null
  /** Слаг предметной иконки; null — легаси-обложка, оверлей не рисуем. */
  icon?: string | null
  /** Слаг цвета — из него строится подложка, пока картинка грузится. */
  color?: string | null
  /** Новые AI/fallback-обложки самодостаточны; SVG нужен только старым фонам. */
  coverSource?: string | null
  /** Размер иконки в px. Один на контекст, одинаковый для всех предметов. */
  size?: number
}>(), { size: 44 })

// Если картинка не загрузилась (сеть, битая ссылка) — остаётся цветная
// подложка с иконкой, а не пустой прямоугольник.
const failed = ref(false)
watch(() => props.src, () => { failed.value = false })

const coverArt = useCoverArt()
const showImage = computed(() => !!props.src && !failed.value)
const showIcon = computed(() => (
  !!props.icon && props.coverSource !== 'ai_hero' && props.coverSource !== 'fallback'
))

// Толщина линии масштабируется вместе с иконкой, поэтому визуальный вес
// штриха одинаков и на мелкой плашке, и на крупной шапке.
const strokeWidth = computed(() => Math.max(1.1, Math.min(1.8, 40 / props.size)))

const rootStyle = computed(() => ({
  // Подложка того же цвета, что и фон обложки: пока грузится картинка,
  // карточка не мигает серым.
  background: props.color ? coverArt.colorBase(props.color) : undefined,
}))
</script>

<style scoped>
.subject-cover {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sc-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.sc-icon {
  position: relative;
  flex: none;
  /* Тень — не украшение, а гарантия читаемости: иконка лежит на произвольной
     точке композиции, и под ней может оказаться как тёмная, так и светлая
     форма. Без тени на светлых участках (оранжевый, мятный) белый глиф
     сливается. */
  filter: drop-shadow(0 2px 10px rgba(0, 0, 0, .38));
}
</style>
