import { useApi } from './api'

export const useChatsSvc = () => {
  const api = useApi()
  return {
    list: async (opts?: { limit?: number; offset?: number }) => {
      const params: Record<string, any> = {}
      if (opts?.limit != null) params.limit = opts.limit
      if (opts?.offset != null) params.offset = opts.offset
      const { data } = await api.get('/chats/', { params }); return data as any[]
    },
    create: async (name: string) => { const { data } = await api.post('/chats/', { name }); return data },
    users: async (id: number) => { const { data } = await api.get(`/chats/${id}/users`); return data as any[] },
    addUser: async (chatId: number, userId: number) => {
      const { data } = await api.post(`/chats/${chatId}/users/${userId}`)
      return data
    },
    removeUser: async (chatId: number, userId: number) => {
      const { data } = await api.delete(`/chats/${chatId}/users/${userId}`)
      return data
    },
    markRead: async (chatId: number) => {
      const { data } = await api.put(`/chats/${chatId}/read`)
      return data
    },
  }
}
