import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useFullscreen(target: Ref<HTMLElement | null>) {
  const isFullscreen = ref(false)

  const toggleFullscreen = async () => {
    const el = target.value as any
    if (!el) return
    if (!document.fullscreenElement) {
      try {
        await (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.())
      } catch {
        // iOS Safari и старые браузеры без Fullscreen API — CSS-имитация
        el.classList.toggle('immersive-fallback', true)
        isFullscreen.value = true
      }
      return
    }
    const doc = document as any
    await (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.())
  }

  const exitImmersiveFallback = () => {
    const el = target.value
    if (el?.classList.contains('immersive-fallback')) {
      el.classList.remove('immersive-fallback')
      isFullscreen.value = false
    }
  }

  const onChange = () => { isFullscreen.value = !!document.fullscreenElement }
  onMounted(() => document.addEventListener('fullscreenchange', onChange))
  onUnmounted(() => document.removeEventListener('fullscreenchange', onChange))

  return { isFullscreen, toggleFullscreen, exitImmersiveFallback }
}
