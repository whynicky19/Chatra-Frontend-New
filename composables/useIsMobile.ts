import { ref, onMounted, onUnmounted } from 'vue'

export function useIsMobile(breakpoint = 768) {
  const isMobile = ref(false)
  let handler: (() => void) | null = null

  onMounted(() => {
    handler = () => { isMobile.value = window.innerWidth <= breakpoint }
    handler()
    window.addEventListener('resize', handler)
  })
  onUnmounted(() => { if (handler) window.removeEventListener('resize', handler) })

  return isMobile
}
