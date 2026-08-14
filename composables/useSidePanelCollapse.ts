import { ref, watch } from 'vue'

// Сворачивание второй колонки (список заданий / материалов лекции) — одно
// состояние на все такие страницы и между сессиями: свернул один раз, чтобы
// читать работу или PDF во всю ширину, — осталось свёрнутым.
const STORE_KEY = '_side_list_collapsed'
const collapsed = ref(false)
let initialized = false

export const useSidePanelCollapse = () => {
  if (!initialized) {
    initialized = true
    try { collapsed.value = localStorage.getItem(STORE_KEY) === '1' } catch {}
    watch(collapsed, (v) => {
      try { localStorage.setItem(STORE_KEY, v ? '1' : '0') } catch {}
    })
  }
  const toggle = () => { collapsed.value = !collapsed.value }
  return { collapsed, toggle }
}
