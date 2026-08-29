import { ref, watch, effectScope } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useAnnotationsSvc, type Annotation, type AnnotationColor } from '~/services/annotations'

export type HighlightColor = AnnotationColor
export type Highlight = Annotation

export const HIGHLIGHT_COLORS: HighlightColor[] = ['yellow', 'green', 'blue', 'red']

/** Откуда открыт просмотрщик: без этого выделение некуда привязать. */
export interface HighlightContext {
  classId: number
  lectureId: number
  lectureTitle: string
  fileIndex: number
}

// Выделения живут на сервере (GET/POST/PATCH/DELETE /annotations) — они общие с
// мобильным приложением. Здесь только реактивное зеркало ответа плюс кэш в
// localStorage: при возврате на лекцию пометки видны сразу, не дожидаясь сети,
// а сервер догружается следом и переписывает кэш.
const items = ref<Highlight[]>([])
const loading = ref(false)
let loadedFor: string | null = null
let persisting = false
// Сохраняем detached- scope, чтобы при смене uid (смена пользователя или
// сначала зашли под 'anon', потом подтянулся auth.user) старый watcher
// не продолжал писать в кэш предыдущего uid. Без dispose() на каждой
// инициализации накапливались бы зомби-watchers.
let persistScope: ReturnType<typeof effectScope> | null = null

const CACHE_KEY = (uid: string) => `_annotations_${uid}`

// Профиль (auth.user) подтягивается асинхронно уже после первого рендера
// страницы, поэтому на нём одном ключ кэша строить нельзя: он успел бы
// записаться под «анонимным» ключом. sub из сохранённого токена доступен сразу.
const uidFromToken = (): string | null => {
  try {
    const tk = localStorage.getItem('_tk')
    if (!tk) return null
    const payload = JSON.parse(atob(tk.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload?.sub != null ? String(payload.sub) : null
  } catch { return null }
}

const readCache = (uid: string): Highlight[] => {
  try {
    const raw = localStorage.getItem(CACHE_KEY(uid))
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

const upsert = (row: Highlight) => {
  const i = items.value.findIndex(h => h.id === row.id)
  items.value = i === -1
    ? [...items.value, row]
    : items.value.map(h => (h.id === row.id ? row : h))
}

export const useHighlights = () => {
  const auth = useAuthStore()
  const svc = useAnnotationsSvc()
  // auth.user подтягивается асинхронно (fetchMe в plugin), и если на момент
  // первого вызова useHighlights() он ещё null, придётся подождать. Иначе
  // кэш уйдёт в _annotations_anon, и под реальным uid прочитается пустота.
  // uidFromToken() доступен сразу из _tk в localStorage.
  const tokenUid = uidFromToken()
  const uid = import.meta.client
    ? String(auth.user?.id ?? tokenUid ?? 'anon')
    : 'anon'

  if (import.meta.client && loadedFor !== uid) {
    // Перед сменой uid сохраняем накопленные items под СТАРЫМ ключом — иначе
    // (если первый вход был под 'anon' до загрузки auth.user) они потеряются.
    if (loadedFor && items.value.length) {
      try { localStorage.setItem(CACHE_KEY(loadedFor), JSON.stringify(items.value)) } catch {}
    }
    loadedFor = uid
    items.value = readCache(uid)
    if (!persisting) {
      persisting = true
      // Отдельный scope: обычный watch привязался бы к компоненту, из которого
      // композабл вызвали первым, и умер бы вместе с ним — кэш перестал бы
      // обновляться после закрытия просмотрщика.
      persistScope = effectScope(true)
      persistScope.run(() => {
        watch(items, (v) => {
          try { localStorage.setItem(CACHE_KEY(loadedFor || 'anon'), JSON.stringify(v)) } catch {}
        }, { deep: true })
      })
    }
  }

  /** Подтягивает выделения лекции (или всего класса) с сервера. */
  const load = async (params: { lectureId?: number; classId?: number }) => {
    if (!import.meta.client) return
    loading.value = true
    try {
      const rows = await svc.list({ lecture_id: params.lectureId, class_id: params.classId })
      // Заменяем только ту часть, которую сервер и отдавал: пометки других
      // лекций остаются из кэша, иначе список «Мои выделения» мигал бы пустым
      // при каждом заходе в лекцию.
      const scope = (h: Highlight) =>
        params.lectureId != null ? h.lecture_id === params.lectureId
        : params.classId != null ? h.class_id === params.classId
        : true
      items.value = [...items.value.filter(h => !scope(h)), ...rows]
    } catch {
      // Офлайн/сбой сети — остаёмся на кэше, пометки не пропадают с экрана.
    } finally {
      loading.value = false
    }
  }

  const forLecture = (classId: number, lectureId: number) =>
    items.value
      .filter(h => h.class_id === classId && h.lecture_id === lectureId)
      .sort((a, b) => a.file_index - b.file_index || a.page - b.page || a.start_offset - b.start_offset)

  const byId = (id: number) => items.value.find(h => h.id === id) || null

  const add = async (body: Omit<Annotation, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'lecture_title' | 'comment'> & { comment?: string | null }): Promise<Highlight | null> => {
    try {
      const created = await svc.create({
        lecture_id: body.lecture_id,
        class_id: body.class_id,
        file_index: body.file_index,
        page: body.page,
        selected_text: body.selected_text,
        prefix: body.prefix,
        suffix: body.suffix,
        start_offset: body.start_offset,
        end_offset: body.end_offset,
        color: body.color,
        comment: body.comment ?? null,
      })
      upsert(created)
      return created
    } catch {
      return null
    }
  }

  /** Оптимистично: цвет и заметка меняются мгновенно, ошибка откатывает. */
  const update = async (id: number, patch: { color?: HighlightColor; comment?: string | null }) => {
    const before = byId(id)
    if (!before) return
    upsert({ ...before, ...patch } as Highlight)
    try {
      upsert(await svc.update(id, patch))
    } catch {
      upsert(before)
    }
  }

  const remove = async (id: number) => {
    const before = byId(id)
    if (!before) return
    items.value = items.value.filter(h => h.id !== id)
    try {
      await svc.remove(id)
    } catch {
      upsert(before)
    }
  }

  return { items, loading, load, forLecture, byId, add, update, remove }
}
