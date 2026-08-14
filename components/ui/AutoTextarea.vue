<template>
  <textarea
    ref="el"
    :value="modelValue"
    :rows="rows"
    :disabled="disabled"
    @input="onInput"
    @keydown.enter="onEnter"
  ></textarea>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'

/**
 * Однострочное поле, которое растёт вниз вместо горизонтальной прокрутки.
 *
 * В обычном <input> длинный текст уезжает вправо, и начало строки перестаёт
 * быть видно — приходится скроллить каретку назад, чтобы перечитать
 * написанное. Здесь текст переносится, а высота подстраивается под контент
 * до maxHeight, дальше включается вертикальный скролл.
 */
const props = withDefaults(defineProps<{
  modelValue: string
  /** Минимальное число строк (стартовая высота) */
  rows?: number
  /** Предел роста в px; дальше — вертикальная прокрутка */
  maxHeight?: number
  disabled?: boolean
  /** Enter отправляет (Shift+Enter — перенос строки). Для полей формы — false. */
  submitOnEnter?: boolean
}>(), {
  rows: 1,
  maxHeight: 140,
  disabled: false,
  submitOnEnter: false,
})

const emit = defineEmits<{ 'update:modelValue': [v: string]; submit: [] }>()

const el = ref<HTMLTextAreaElement>()

const resize = () => {
  const node = el.value
  if (!node) return
  // height:auto перед замером — иначе scrollHeight не уменьшается при удалении
  // текста и поле «залипает» на максимальной высоте.
  node.style.height = 'auto'
  node.style.height = Math.min(node.scrollHeight, props.maxHeight) + 'px'
}

const onInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
  resize()
}

const onEnter = (e: KeyboardEvent) => {
  if (e.isComposing) return
  if (!props.submitOnEnter) {
    // Поля формы (название, критерий) — по смыслу однострочные значения,
    // просто с переносом по ширине: Enter не должен вставлять в них \n.
    e.preventDefault()
    return
  }
  if (e.shiftKey) return   // Shift+Enter — перенос строки
  e.preventDefault()
  emit('submit')
}

// Значение может прийти извне (очистка после отправки, префилл формы) —
// пересчитываем высоту и на такие изменения, а не только на ввод.
watch(() => props.modelValue, () => nextTick(resize))
onMounted(resize)

defineExpose({
  focus: () => el.value?.focus(),
  el,
})
</script>

<style scoped>
textarea {
  resize: none;
  overflow-y: auto;
  font-family: inherit;
  line-height: 1.5;
}
</style>
