import { ref, watch, type Ref } from 'vue'

export function useFileSize(url: Ref<string | undefined>) {
  const size = ref<number | null>(null)
  const checked = ref(false)

  watch(url, async (u) => {
    size.value = null
    checked.value = false
    if (!u) return
    try {
      const res = await fetch(u, { method: 'HEAD' })
      const len = res.headers.get('content-length')
      size.value = len ? Number(len) : null
    } catch {
      size.value = null
    } finally {
      checked.value = true
    }
  }, { immediate: true })

  return { size, checked }
}

export const formatBytes = (n: number): string => {
  if (n < 1024) return `${n} B`
  const units = ['KB', 'MB', 'GB']
  let val = n / 1024
  let i = 0
  while (val >= 1024 && i < units.length - 1) { val /= 1024; i++ }
  return `${val < 10 ? val.toFixed(1) : Math.round(val)} ${units[i]}`
}
