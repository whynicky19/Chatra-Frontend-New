import { ref, watch, effectScope } from 'vue'
import { useAuthStore } from '~/stores/auth.store'

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'red'

export const HIGHLIGHT_COLORS: HighlightColor[] = ['yellow', 'green', 'blue', 'red']

/** Откуда открыт просмотрщик: без этого выделение некуда привязать. */
export interface HighlightContext {
  classId: number
  lectureId: number
  lectureTitle: string
  fileIndex: number
}

export interface Highlight {
  id: string
  classId: number
  lectureId: number
  fileIndex: number
  fileName: string
  /** Страница PDF, с которой снято выделение. 0 — документ без страниц (docx/txt/таблица). */
  page: number
  /** Границы в тексте поверхности (см. useTextHighlighter): по ним выделение восстанавливается. */
  start: number
  end: number
  text: string
  color: HighlightColor
  note: string
  createdAt: number
}

// Выделения хранятся локально: серверных ручек для них нет, а привязка к
// пользователю нужна — общий браузер (класс, семейный ноутбук) не должен
// показывать чужие пометки. Формат плоский, чтобы при появлении API его можно
// было отправить на сервер как есть.
const items = ref<Highlight[]>([])
let loadedFor: string | null = null
let persisting = false

const keyFor = (uid: string) => `_highlights_${uid}`

const readStorage = (uid: string): Highlight[] => {
  try {
    const raw = localStorage.getItem(keyFor(uid))
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

const newId = () => `h${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

// Профиль (auth.user) подтягивается асинхронно уже после первого рендера
// страницы, поэтому на нём одном ключ строить нельзя: выделения успели бы
// записаться под «анонимным» ключом и пропасть, как только профиль приедет.
// sub из сохранённого токена доступен сразу и даёт тот же самый id.
const uidFromToken = (): string | null => {
  try {
    const tk = localStorage.getItem('_tk')
    if (!tk) return null
    const payload = JSON.parse(atob(tk.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload?.sub != null ? String(payload.sub) : null
  } catch { return null }
}

export const useHighlights = () => {
  const auth = useAuthStore()
  const uid = import.meta.client
    ? String(auth.user?.id ?? uidFromToken() ?? 'anon')
    : 'anon'

  if (import.meta.client && loadedFor !== uid) {
    loadedFor = uid
    items.value = readStorage(uid)
    if (!persisting) {
      persisting = true
      // Отдельный scope: обычный watch привязался бы к компоненту, из которого
      // композабл вызвали первым, и умер бы вместе с ним — правки из списка
      // выделений после закрытия просмотрщика перестали бы сохраняться.
      effectScope(true).run(() => {
        watch(items, (v) => {
          try { localStorage.setItem(keyFor(loadedFor || 'anon'), JSON.stringify(v)) } catch {}
        }, { deep: true })
      })
    }
  }

  const forLecture = (classId: number, lectureId: number) =>
    items.value
      .filter(h => h.classId === classId && h.lectureId === lectureId)
      .sort((a, b) => a.fileIndex - b.fileIndex || a.page - b.page || a.start - b.start)

  const forSurface = (classId: number, lectureId: number, fileIndex: number, page: number) =>
    items.value.filter(h =>
      h.classId === classId && h.lectureId === lectureId && h.fileIndex === fileIndex && h.page === page)

  const byId = (id: string) => items.value.find(h => h.id === id) || null

  const add = (h: Omit<Highlight, 'id' | 'createdAt'>): Highlight => {
    const created: Highlight = { ...h, id: newId(), createdAt: Date.now() }
    items.value = [...items.value, created]
    return created
  }

  const update = (id: string, patch: Partial<Pick<Highlight, 'color' | 'note'>>) => {
    items.value = items.value.map(h => (h.id === id ? { ...h, ...patch } : h))
  }

  const remove = (id: string) => { items.value = items.value.filter(h => h.id !== id) }

  return { items, forLecture, forSurface, byId, add, update, remove }
}
