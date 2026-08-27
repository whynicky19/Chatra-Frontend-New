import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Reactive prefers-reduced-motion / -transparency / -contrast signals.
 *
 * Apple Design §14: respond to all three independently. A user with
 * `prefers-reduced-motion` but no transparency preference still gets
 * blur; a user with only `prefers-reduced-transparency` gets solid
 * surfaces but can keep their springs.
 */
export function useReducedMotion() {
  const reducedMotion = ref(false)
  const reducedTransparency = ref(false)
  const moreContrast = ref(false)

  let mqlMotion: MediaQueryList | null = null
  let mqlTransparency: MediaQueryList | null = null
  let mqlContrast: MediaQueryList | null = null

  const handle = (
    mql: MediaQueryList | null,
    ref_: typeof reducedMotion,
  ) => {
    if (!mql) return
    ref_.value = mql.matches
    const cb = (e: MediaQueryListEvent) => {
      ref_.value = e.matches
    }
    mql.addEventListener('change', cb)
    return () => mql.removeEventListener('change', cb)
  }

  let cleanups: Array<() => void> = []

  onMounted(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    mqlMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    mqlTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)')
    mqlContrast = window.matchMedia('(prefers-contrast: more)')

    reducedMotion.value = mqlMotion.matches
    reducedTransparency.value = mqlTransparency.matches
    moreContrast.value = mqlContrast.matches

    cleanups.push(handle(mqlMotion, reducedMotion)!)
    cleanups.push(handle(mqlTransparency, reducedTransparency)!)
    cleanups.push(handle(mqlContrast, moreContrast)!)
  })

  onUnmounted(() => {
    cleanups.forEach((fn) => fn())
    cleanups = []
  })

  return {
    reducedMotion,
    reducedTransparency,
    moreContrast,
  }
}
