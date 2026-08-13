<!--
  Обложка предмета: сгенерированный фон + предметная иконка поверх.

  Единственное место в вебе, которое знает, как выглядит обложка. Все списки,
  карточки, шапки и превью используют его, поэтому иконка везде одного размера,
  одной толщины линии и одного стиля — картинка от модели отвечает только за
  фон (см. services/cover_art.py на бэкенде).

  Иконка НЕ впечатана в картинку намеренно: генеративные модели нестабильно
  рисуют символы вроде Σ или спирали ДНК. Здесь это чистый SVG, который всегда
  выходит одинаковым, и его можно перекрасить или заменить без перегенерации
  всех обложек в хранилище.

  Предметы без cover_icon (обложка загружена пользователем по старой системе)
  показываются как есть, без оверлея — трогать чужую картинку нельзя.
-->
<template>
  <div class="subject-cover" :style="rootStyle">
    <img v-if="showImage" :src="fixFileUrl(src!)" class="sc-img" alt="" loading="lazy"
         decoding="async" @error="failed = true"/>
    <!-- Иконка ложится поверх готовой композиции: специальной пустой зоны под
         неё бэкенд больше не резервирует (см. ICON_ON_ARTWORK в cover_art.py).
         Поэтому она белая с мягкой тенью — композиция теперь насыщенная, и
         яркость под иконкой заранее неизвестна. Иконка в тон на таком фоне
         давала контраст 1.5-2.0 и просто пропадала. -->
    <svg v-if="icon" class="sc-icon" :style="{ width: `${size}px`, height: `${size}px` }"
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
  /** Размер иконки в px. Один на контекст, одинаковый для всех предметов. */
  size?: number
}>(), { size: 44 })

// Если картинка не загрузилась (сеть, битая ссылка) — остаётся цветная
// подложка с иконкой, а не пустой прямоугольник.
const failed = ref(false)
watch(() => props.src, () => { failed.value = false })

const coverArt = useCoverArt()
const showImage = computed(() => !!props.src && !failed.value)

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
