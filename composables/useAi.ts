
import { ref, computed, watch } from 'vue'
import { useApi } from '~/services/api'
import { useToast } from '~/composables/useToast'
import { useAuthStore } from '~/stores/auth.store'

// Дефолт до первого ответа сервера; настоящий лимит приходит из /ai/limits.
export const AI_LIMIT = 50

interface Msg {
  id: number
  role: 'user' | 'assistant'
  text: string
  imagePreview?: string
  ts: Date
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const isImageFile = (file: File) => file.type.startsWith('image/')

// История чата: модульный стейт + localStorage. Ключ содержит id
// пользователя — у каждого аккаунта своя история, и она переживает
// выход из аккаунта (при logout ключи не удаляются).
const LEGACY_CHAT_KEY = '_ai_chat_history'
const chatKeyFor = (uid: number | null | undefined) => `_ai_chat_history_${uid ?? 'anon'}`
const _msgs = ref<Msg[]>([])
let _loadedKey: string | null = null
let _nextId = 0
// Ключ треда, уже синхронизированного с сервером (чтобы не дёргать /ai/history
// повторно из каждого компонента, который вызвал useAi()).
let _syncedKey: string | null = null

const loadMsgsFor = (key: string, migrateLegacy: boolean) => {
  if (_loadedKey === key || !import.meta.client) return
  _loadedKey = key
  _msgs.value = []
  _nextId = 0
  try {
    let raw = localStorage.getItem(key)
    // Миграция: история, сохранённая до разделения по аккаунтам,
    // достаётся первому вошедшему пользователю (но не анониму).
    if (!raw && migrateLegacy) {
      const legacy = localStorage.getItem(LEGACY_CHAT_KEY)
      if (legacy) {
        raw = legacy
        localStorage.setItem(key, legacy)
        localStorage.removeItem(LEGACY_CHAT_KEY)
      }
    }
    if (raw) {
      const arr = JSON.parse(raw) as Msg[]
      if (Array.isArray(arr)) {
        _msgs.value = arr
        _nextId = arr.reduce((m, x) => Math.max(m, x.id || 0), 0)
      }
    }
  } catch {}
}

const persistMsgs = () => {
  if (!import.meta.client || !_loadedKey) return
  try {
    // base64-превью изображений не сохраняем — иначе быстро упрёмся в квоту localStorage
    localStorage.setItem(_loadedKey, JSON.stringify(_msgs.value.map(({ imagePreview, ...rest }) => rest)))
  } catch {}
}

// Дневная квота ИИ — серверная (GET /ai/limits), общая с приложением: считать
// локально нельзя, иначе лимит обходится сменой браузера или чисткой storage.
export interface AiQuota {
  limit: number
  used: number
  remaining: number | null   // null — безлимит
  unlimited: boolean
  resets_at?: string
}

const _quota = ref<AiQuota | null>(null)
let _quotaUserId: number | null | undefined = undefined

/** Квота из ответа /ai/chat — обновляет счётчик без лишнего запроса. */
export const applyQuota = (q: AiQuota | null | undefined) => {
  if (q && typeof q.limit === 'number') _quota.value = q
}

export const useAi = () => {
  const msgs = _msgs
  const loading = ref(false)
  const api = useApi()
  const toast = useToast()
  const auth = useAuthStore()

  // Серверная история → _msgs (синхронизация с приложением). Если на сервере
  // пусто, а локально есть — разово заливаем локальную историю (миграция).
  const syncFromServer = async (uid: number | null | undefined) => {
    if (!import.meta.client || uid == null) return
    const key = chatKeyFor(uid)
    if (_syncedKey === key) return
    _syncedKey = key
    try {
      let rows = (await api.get('/ai/history')).data as any[]
      if ((!rows || rows.length === 0) && _msgs.value.length) {
        rows = (await api.post('/ai/history/import', {
          messages: _msgs.value.map(m => ({ role: m.role, content: m.text })),
        })).data
      }
      if (Array.isArray(rows)) {
        _msgs.value = rows.map((r, i) => ({
          id: i + 1, role: r.role, text: r.content,
          ts: r.created_at ? new Date(r.created_at) : new Date(),
        }))
        _nextId = _msgs.value.length
        _loadedKey = key
        persistMsgs()
      }
    } catch { _syncedKey = null }
  }

  const refreshQuota = async (uid: number | null | undefined) => {
    if (!import.meta.client || uid == null) return
    try {
      applyQuota((await api.get('/ai/limits')).data)
    } catch {}
  }

  // Подхватываем историю текущего аккаунта; при смене пользователя
  // (в т.ч. после повторного входа) загружается его собственная.
  watch(() => auth.user?.id, (id) => {
    loadMsgsFor(chatKeyFor(id), id != null)
    syncFromServer(id)
    if (id !== _quotaUserId) { _quotaUserId = id; _quota.value = null; refreshQuota(id) }
  }, { immediate: true })

  const quota = _quota
  const aiLimit = computed(() => _quota.value?.limit ?? AI_LIMIT)
  const aiUnlimited = computed(() => _quota.value?.unlimited ?? !!auth.user?.ai_unlimited)
  const aiCount = computed(() => _quota.value?.used ?? 0)
  const aiRemaining = computed(() =>
    _quota.value?.remaining ?? Math.max(0, aiLimit.value - aiCount.value))
  const aiLimitReached = computed(() =>
    !aiUnlimited.value && _quota.value != null && aiRemaining.value <= 0)

  const send = async (text: string, file?: File | null) => {
    const hasText = text.trim().length > 0
    const hasFile = !!file
    if ((!hasText && !hasFile) || loading.value) return

    if (aiLimitReached.value) {
      toast.err(`Дневной лимит ИИ исчерпан (${aiLimit.value} сообщений в сутки). Лимит обновится завтра.`)
      return
    }

    let imageBase64: string | undefined
    let displayText = text.trim()

    if (hasFile) {
      if (isImageFile(file!)) {
        imageBase64 = await fileToBase64(file!)
        displayText = displayText || `[Изображение: ${file!.name}]`
      } else {
        displayText = displayText
          ? `${displayText}\n[Файл: ${file!.name}]`
          : `[Файл: ${file!.name}]`
      }
    }

    const um: Msg = {
      id: ++_nextId,
      role: 'user',
      text: displayText,
      imagePreview: imageBase64,
      ts: new Date(),
    }
    msgs.value = [...msgs.value, um]
    persistMsgs()
    loading.value = true

    try {
      const history = msgs.value
        .slice(0, -1)
        .map(m => ({ role: m.role, content: m.text }))

      let userContent: string | Array<Record<string, unknown>>

      if (imageBase64) {
        userContent = [
          {
            type: 'image_url',
            image_url: { url: imageBase64, detail: 'high' },
          },
          {
            type: 'text',
            text: text.trim() || 'Прочитай и опиши содержимое изображения. Если на нём рукописный текст — распознай и перепиши его дословно.',
          },
        ]
      } else {
        userContent = displayText
      }

      const { data } = await api.post('/ai/chat', {
        messages: [
          {
            role: 'system',
            content:
              'Ты AI-ассистент образовательной платформы. Отвечай на русском языке. ' +
              'Умеешь читать рукописный текст, распознавать формулы и таблицы на изображениях.',
          },
          ...history,
          { role: 'user', content: userContent },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      })

      msgs.value = [
        ...msgs.value,
        { id: ++_nextId, role: 'assistant', text: data.content || '', ts: new Date() },
      ]
      persistMsgs()

      applyQuota(data.quota)
    } catch (e: any) {
      toast.err('AI: ' + (e?.response?.data?.detail || e.message || 'ошибка'))
      msgs.value = msgs.value.filter(m => m.id !== um.id)
      persistMsgs()
      // 429 — квота исчерпана: подтягиваем актуальное состояние, чтобы
      // ввод заблокировался и счётчик показал 0.
      if (e?.response?.status === 429) refreshQuota(auth.user?.id)
    } finally {
      loading.value = false
    }
  }

  const clear = () => {
    msgs.value = []
    if (import.meta.client && _loadedKey) { try { localStorage.removeItem(_loadedKey) } catch {} }
    // Чистим и на сервере — иначе история «воскреснет» на другом устройстве.
    // .catch: без него отклонённый промис стал бы unhandledrejection → тост.
    api.delete('/ai/history').catch(() => {})
  }

  return {
    msgs, loading, send, clear,
    quota, aiLimit, aiCount, aiRemaining, aiUnlimited, aiLimitReached,
    applyQuota, refreshQuota, AI_LIMIT,
  }
}