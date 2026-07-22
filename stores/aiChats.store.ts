import { defineStore } from 'pinia'
import { useAiSvc, type AiThread } from '~/services/ai'
import { applyQuota, refreshQuota } from '~/composables/useAiQuota'
import { useToast } from '~/composables/useToast'
import { useAuthStore } from '~/stores/auth.store'

export interface Msg {
  id: number
  role: 'user' | 'assistant'
  text: string
  imagePreview?: string
  ts: Date
}

// Системный промпт главного ассистента — перенесён дословно из старого useAi.ts.
const SYSTEM_PROMPT =
  'Ты AI-ассистент образовательной платформы. Отвечай на русском языке. ' +
  'Умеешь читать рукописный текст, распознавать формулы и таблицы на изображениях.'

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const isImageFile = (file: File) => file.type.startsWith('image/')

// Ключ localStorage-кэша сообщений конкретного треда.
const msgsKey = (uid: number | null | undefined, threadId: number) =>
  `_ai_msgs_${uid ?? 'anon'}_${threadId}`

// pinned первыми, внутри — по свежести (updated_at DESC).
const sortThreads = (arr: AiThread[]) =>
  [...arr].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

export const useAiChatsStore = defineStore('aiChats', {
  state: () => ({
    conversations: [] as AiThread[],
    activeId: null as number | null,
    messages: [] as Msg[],
    loading: false,
    sending: false,
    _nextId: 0,
  }),

  getters: {
    activeThread: (s): AiThread | null =>
      s.conversations.find(c => c.id === s.activeId) ?? null,
    sortedConversations: (s): AiThread[] => sortThreads(s.conversations),
  },

  actions: {
    _uid(): number | null | undefined {
      return useAuthStore().user?.id
    },

    _persistMsgs() {
      if (!import.meta.client || this.activeId == null) return
      try {
        // base64-превью не сохраняем — иначе быстро упрёмся в квоту localStorage.
        localStorage.setItem(
          msgsKey(this._uid(), this.activeId),
          JSON.stringify(this.messages.map(({ imagePreview, ...rest }) => rest)),
        )
      } catch {}
    },

    async loadThreads() {
      this.loading = true
      try {
        const rows = await useAiSvc().listThreads()
        this.conversations = sortThreads(rows)
      } catch {
        // список необязателен для рендера страницы; тихо игнорируем
      } finally {
        this.loading = false
      }
    },

    async createThread(): Promise<AiThread | null> {
      try {
        const thread = await useAiSvc().createThread()
        this.conversations = sortThreads([thread, ...this.conversations])
        return thread
      } catch (e: any) {
        useToast().err('AI: ' + (e?.response?.data?.detail || e?.message || 'ошибка'))
        return null
      }
    },

    async setActive(id: number) {
      this.activeId = id
      this.messages = []
      this._nextId = 0

      // Мгновенный показ из localStorage-кэша...
      if (import.meta.client) {
        try {
          const raw = localStorage.getItem(msgsKey(this._uid(), id))
          if (raw) {
            const arr = JSON.parse(raw)
            if (Array.isArray(arr)) {
              this.messages = arr.map((m: any) => ({ ...m, ts: m.ts ? new Date(m.ts) : new Date() }))
              this._nextId = this.messages.reduce((mx, x) => Math.max(mx, x.id || 0), 0)
            }
          }
        } catch {}
      }

      // ...затем всегда синхронизируемся с сервером.
      try {
        const rows = await useAiSvc().getHistory({ threadId: id })
        if (this.activeId !== id) return   // юзер уже переключился
        this.messages = rows.map((r, i) => ({
          id: i + 1,
          role: r.role,
          text: r.content,
          ts: r.created_at ? new Date(r.created_at) : new Date(),
        }))
        this._nextId = this.messages.length
        this._persistMsgs()
      } catch {}
    },

    async rename(id: number, title: string) {
      const conv = this.conversations.find(c => c.id === id)
      if (!conv) return
      const prev = conv.title
      const next = title.trim()
      if (!next || next === prev) return
      conv.title = next
      this.conversations = sortThreads(this.conversations)
      try {
        await useAiSvc().renameThread(id, next)
      } catch (e: any) {
        conv.title = prev
        this.conversations = sortThreads(this.conversations)
        useToast().err('AI: ' + (e?.response?.data?.detail || e?.message || 'ошибка'))
      }
    },

    async togglePin(id: number) {
      const conv = this.conversations.find(c => c.id === id)
      if (!conv) return
      const next = !conv.pinned
      conv.pinned = next
      this.conversations = sortThreads(this.conversations)
      try {
        await useAiSvc().pinThread(id, next)
      } catch (e: any) {
        conv.pinned = !next
        this.conversations = sortThreads(this.conversations)
        useToast().err('AI: ' + (e?.response?.data?.detail || e?.message || 'ошибка'))
      }
    },

    async remove(id: number) {
      const idx = this.conversations.findIndex(c => c.id === id)
      if (idx === -1) return
      const removed = this.conversations[idx]
      const wasActive = this.activeId === id
      this.conversations = this.conversations.filter(c => c.id !== id)
      if (wasActive) { this.activeId = null; this.messages = [] }
      if (import.meta.client) {
        try { localStorage.removeItem(msgsKey(this._uid(), id)) } catch {}
      }
      try {
        await useAiSvc().deleteThread(id)
      } catch (e: any) {
        this.conversations = sortThreads([removed, ...this.conversations])
        if (wasActive) this.activeId = id
        useToast().err('AI: ' + (e?.response?.data?.detail || e?.message || 'ошибка'))
      }
    },

    async send(text: string, file?: File | null) {
      const hasText = text.trim().length > 0
      const hasFile = !!file
      if ((!hasText && !hasFile) || this.sending) return

      // Новый чат ещё не заведён на бэке — тред создаётся лениво при первой
      // отправке, чтобы композер был доступен сразу, без обязательного
      // выбора/создания чата заранее.
      if (this.activeId == null) {
        const thread = await this.createThread()
        if (!thread) return
        await this.setActive(thread.id)
      }

      const threadId = this.activeId!
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
        id: ++this._nextId,
        role: 'user',
        text: displayText,
        imagePreview: imageBase64,
        ts: new Date(),
      }
      this.messages = [...this.messages, um]
      this._persistMsgs()
      this.sending = true

      try {
        const history = this.messages
          .slice(0, -1)
          .map(m => ({ role: m.role, content: m.text }))

        let userContent: string | Array<Record<string, unknown>>
        if (imageBase64) {
          userContent = [
            { type: 'image_url', image_url: { url: imageBase64, detail: 'high' } },
            {
              type: 'text',
              text: text.trim() || 'Прочитай и опиши содержимое изображения. Если на нём рукописный текст — распознай и перепиши его дословно.',
            },
          ]
        } else {
          userContent = displayText
        }

        const data = await useAiSvc().chat({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: userContent },
          ],
          max_tokens: 1500,
          temperature: 0.7,
          thread_id: threadId,
        })

        this.messages = [
          ...this.messages,
          { id: ++this._nextId, role: 'assistant', text: data.content || '', ts: new Date() },
        ]
        this._persistMsgs()

        applyQuota(data.quota)

        // Обновляем заголовок/свежесть треда локально, без перезагрузки списка.
        const conv = this.conversations.find(c => c.id === threadId)
        if (conv) {
          if (data.thread_title) conv.title = data.thread_title
          conv.updated_at = new Date().toISOString()
          this.conversations = sortThreads(this.conversations)
        }
      } catch (e: any) {
        useToast().err('AI: ' + (e?.response?.data?.detail || e?.message || 'ошибка'))
        this.messages = this.messages.filter(m => m.id !== um.id)
        this._persistMsgs()
        if (e?.response?.status === 429) refreshQuota(this._uid())
      } finally {
        this.sending = false
      }
    },

    clearLocalCache(uid: string) {
      if (!import.meta.client) return
      try {
        const prefix = `_ai_msgs_${uid}_`
        Object.keys(localStorage)
          .filter(k => k.startsWith(prefix))
          .forEach(k => localStorage.removeItem(k))
      } catch {}
    },
  },
})
