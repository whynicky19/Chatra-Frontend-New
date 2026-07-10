import { useApi } from './api'

export const useMsgsSvc = () => {
  const api = useApi()
  return {
    // FE-1: keyset-пагинация. opts.limit — размер страницы (последние N),
    // opts.beforeId — грузить сообщения старше этого id (скролл вверх).
    // Без opts поведение как раньше — вся история.
    list: async (chatId: number, opts?: { limit?: number; beforeId?: number }) => {
      try {
        const params: Record<string, any> = {}
        if (opts?.limit != null) params.limit = opts.limit
        if (opts?.beforeId != null) params.before_id = opts.beforeId
        const { data } = await api.get(`/messages/chat/${chatId}`, { params })
        return (data as any[]).map(m => ({
          ...m,
          is_read: m.is_read ?? false,
          file_url: m.file_url ?? null,   // fixed: was fike_url
        }))
      } catch { return [] }
    },

    send: async (chatId: number, content: string) => {
      const { data } = await api.post(`/messages/chat/${chatId}`, { content })
      return data
    },

    del: async (id: number) => {
      await api.delete(`/messages/${id}`)
    },
  }
}
