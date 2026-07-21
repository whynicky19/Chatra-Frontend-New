import { defineStore } from 'pinia'

export interface LastMessagePreview {
  id: number
  content: string
  user_id: number
  created_at: string | null
  is_read: boolean
}
export interface Chat { id: number; name: string; unread_count?: number; last_message?: LastMessagePreview | null }
export interface Msg {
  id: number
  content: string
  chat_id: number
  user_id: number
  created_at: string | null
  is_read: boolean | null
  file_url: string | null
}
export interface ChatUser { id: number; email: string; role: string; is_active: boolean }

export const useChatsStore = defineStore('chats', {
  state: () => ({
    chats: [] as Chat[],
    active: null as Chat | null,
    messages: {} as Record<number, Msg[]>,
    chatUsers: {} as Record<number, ChatUser[]>,
    loadingChats: false,
    loadingMsgs: false,
    ws: {} as Record<number, WebSocket>,
    unread: {} as Record<number, number>,
    lastSeen: {} as Record<number, number>,
  }),

  getters: {
    activeMsgs: (s): Msg[] => s.active ? (s.messages[s.active.id] || []) : [],
    activeUsers: (s): ChatUser[] => s.active ? (s.chatUsers[s.active.id] || []) : [],
    totalUnread: (s) => Object.values(s.unread).reduce((a, b) => a + b, 0),
  },

  actions: {
    setChats(c: Chat[]) {
      this.chats = c
      // unread_count с сервера — источник истины, кроме активного чата
      // (там он уже 0 локально и на сервере после markRead).
      c.forEach(ch => {
        if (this.active?.id !== ch.id) this.unread[ch.id] = ch.unread_count || 0
      })
    },
    addChat(c: Chat) {
      if (!this.chats.find(x => x.id === c.id)) {
        this.chats.unshift(c)
        if (c.unread_count) this.unread[c.id] = c.unread_count
      }
    },
    // Обновляет unread_count/last_message существующих чатов из свежего
    // /chats/ (поллинг раз в 3с — подстраховка на случай пропущенного WS),
    // не трогая активный чат — он уже прочитан и его история загружена целиком.
    syncSummaries(fresh: Chat[]) {
      const byId = new Map(fresh.map(ch => [ch.id, ch]))
      this.chats.forEach((ch, i) => {
        const f = byId.get(ch.id)
        if (!f) return
        if (this.active?.id !== ch.id) this.unread[ch.id] = f.unread_count || 0
        if ((f.last_message?.id) !== (ch.last_message?.id) || f.last_message?.is_read !== ch.last_message?.is_read) {
          this.chats[i] = { ...ch, last_message: f.last_message, unread_count: f.unread_count }
        }
      })
    },

    // Единая точка входа для входящих WS-событий о новом сообщении — держит
    // карточку чата в списке актуальной в реальном времени, даже если
    // полная история этого чата не загружена (чат не открыт).
    applyIncoming(chatId: number, data: any, myId: number) {
      if (data.type !== 'message') return
      const idx = this.chats.findIndex(c => c.id === chatId)
      const msg: LastMessagePreview = {
        id: data.id, content: data.content, user_id: data.user_id,
        created_at: data.created_at ?? null, is_read: !!data.is_read,
      }
      if (idx !== -1) this.chats[idx] = { ...this.chats[idx], last_message: msg }
      if (this.messages[chatId]) {
        this.addMsg(chatId, { ...msg, chat_id: chatId, file_url: null } as Msg, myId)
      } else if (this.active?.id !== chatId && data.user_id !== myId) {
        this.unread[chatId] = (this.unread[chatId] || 0) + 1
      }
    },

    setActive(c: Chat | null) {
      this.active = c
      if (c) {
        this.unread[c.id] = 0
        this.lastSeen[c.id] = (this.messages[c.id] || []).at(-1)?.id || 0
      }
    },

    setMsgs(id: number, m: Msg[]) { this.messages[id] = m },

    mergeMsgs(id: number, m: Msg[]) {
      if (!this.messages[id]) { this.messages[id] = m; return }
      // Обновляем поля уже известных сообщений (важно для is_read — иначе
      // галочки "прочитано" замирают на первом значении и не меняются) и
      // добавляем новые.
      const fresh = new Map(m.map(x => [x.id, x]))
      this.messages[id] = this.messages[id].map(x => fresh.get(x.id) ?? x)
      const existingIds = new Set(this.messages[id].map(x => x.id))
      const toAdd = m.filter(x => !existingIds.has(x.id))
      if (toAdd.length) this.messages[id].push(...toAdd)
    },

    // FE-1: добавляет более старые сообщения в начало (пагинация вверх).
    // Возвращает сколько реально добавлено, чтобы вызывающий понял, есть ли ещё.
    prependMsgs(id: number, m: Msg[]): number {
      if (!this.messages[id]) { this.messages[id] = m; return m.length }
      const existingIds = new Set(this.messages[id].map(x => x.id))
      const toAdd = m.filter(x => !existingIds.has(x.id))
      if (toAdd.length) this.messages[id] = [...toAdd, ...this.messages[id]]
      return toAdd.length
    },

    addMsg(id: number, m: Msg, myId: number) {
      if (!this.messages[id]) this.messages[id] = []
      if (!this.messages[id].find(x => x.id === m.id)) {
        this.messages[id].push(m)
        if (this.active?.id !== id && m.user_id !== myId) {
          this.unread[id] = (this.unread[id] || 0) + 1
        }
        const idx = this.chats.findIndex(c => c.id === id)
        if (idx !== -1) {
          this.chats[idx] = {
            ...this.chats[idx],
            last_message: { id: m.id, content: m.content, user_id: m.user_id, created_at: m.created_at, is_read: !!m.is_read },
          }
        }
      }
    },

    markRead(id: number) {
      this.unread[id] = 0
      this.lastSeen[id] = (this.messages[id] || []).at(-1)?.id || 0
    },

    removeMsg(cid: number, mid: number) {
      if (this.messages[cid]) this.messages[cid] = this.messages[cid].filter(m => m.id !== mid)
    },

    setChatUsers(id: number, u: ChatUser[]) { this.chatUsers[id] = u },

    // токен передаётся query-параметром для аутентификации на бэке
    connectWs(chatId: number, wsBase: string, onMsg: (data: any) => void, token?: string) {
      if (this.ws[chatId]) return
      const tokenParam = token ? `?token=${encodeURIComponent(token)}` : ''
      const ws = new WebSocket(`${wsBase}/ws/${chatId}${tokenParam}`)
      ws.onmessage = (ev) => {
        try { onMsg(JSON.parse(ev.data)) } catch {}
      }
      ws.onclose = () => { delete this.ws[chatId] }
      ws.onerror = () => { delete this.ws[chatId] }
      this.ws[chatId] = ws
    },

    sendWs(chatId: number, d: object) {
      const w = this.ws[chatId]
      if (w && w.readyState === WebSocket.OPEN) w.send(JSON.stringify(d))
    },

    disconnectAll() {
      Object.values(this.ws).forEach(w => { try { w.close() } catch {} })
      this.ws = {}
    },
  },
})