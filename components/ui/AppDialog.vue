<template>
  <div
    :class="overlayClass"
    data-app-dialog-overlay
    @mousedown.self="overlayPointerDown = true"
    @mouseup.self="onOverlayPointerUp"
  >
    <div
      ref="panel"
      v-bind="$attrs"
      :class="panelClass"
      :style="panelStyle"
      :role="role"
      aria-modal="true"
      :aria-labelledby="labelledby"
      :aria-describedby="describedby"
      :aria-busy="busy || undefined"
      tabindex="-1"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  labelledby: string
  describedby?: string
  role?: 'dialog' | 'alertdialog'
  overlayClass?: string | string[] | Record<string, boolean>
  panelClass?: string | string[] | Record<string, boolean>
  panelStyle?: string | Record<string, string>
  closeOnEscape?: boolean
  closeOnOverlay?: boolean
  busy?: boolean
}>(), {
  role: 'dialog',
  overlayClass: 'overlay',
  panelClass: 'modal',
  closeOnEscape: true,
  closeOnOverlay: true,
  busy: false,
})

const emit = defineEmits<{ close: [] }>()
const panel = ref<HTMLElement | null>(null)
const overlayPointerDown = ref(false)
let opener: HTMLElement | null = null

let lockDepth = 0
let previousBodyOverflow = ''

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const focusable = () => Array.from(
  panel.value?.querySelectorAll<HTMLElement>(focusableSelector) || [],
).filter(el => !el.hidden && el.getAttribute('aria-hidden') !== 'true')

const requestClose = () => {
  if (!props.busy) emit('close')
}

const onOverlayPointerUp = () => {
  if (overlayPointerDown.value && props.closeOnOverlay) requestClose()
  overlayPointerDown.value = false
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEscape) {
    event.preventDefault()
    requestClose()
    return
  }
  if (event.key !== 'Tab' || !panel.value) return

  const candidates = focusable()
  if (!candidates.length) {
    event.preventDefault()
    panel.value.focus()
    return
  }
  const first = candidates[0]
  const last = candidates[candidates.length - 1]
  const active = document.activeElement
  if (event.shiftKey && (active === first || !panel.value.contains(active))) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(async () => {
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  if (lockDepth++ === 0) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  document.addEventListener('keydown', onKeydown, true)
  await nextTick()
  // Priority matters: querySelector over a comma-list returns the earliest DOM
  // match, which made a header close button steal focus from an autofocus form
  // field. Resolve each intent tier separately.
  const initial = panel.value?.querySelector<HTMLElement>('[data-dialog-autofocus]')
    || panel.value?.querySelector<HTMLElement>('[autofocus]')
    || panel.value?.querySelector<HTMLElement>('[aria-invalid="true"]')
    || panel.value?.querySelector<HTMLElement>(
      'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href]',
    )
  ;(initial || panel.value)?.focus()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown, true)
  lockDepth = Math.max(0, lockDepth - 1)
  if (lockDepth === 0) document.body.style.overflow = previousBodyOverflow
  if (opener?.isConnected) opener.focus()
})
</script>
