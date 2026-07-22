import { useApi } from './api'

export interface AiThread {
  id: number
  title: string
  pinned: boolean
  created_at: string
  updated_at: string
}

interface HistoryParams { threadId?: number; classId?: number }

// Собирает query-параметры для /ai/history: class_id имеет приоритет
// (per-class путь), иначе thread_id (главный ассистент).
const historyParams = (p: HistoryParams) => {
  const params: Record<string, number> = {}
  if (p.classId != null) params.class_id = p.classId
  else if (p.threadId != null) params.thread_id = p.threadId
  return params
}

export const useAiSvc = () => {
  const api = useApi()

  return {
    /** GET /ai/threads — список тредов (pinned DESC, updated_at DESC) */
    listThreads: async (): Promise<AiThread[]> => {
      const { data } = await api.get('/ai/threads')
      return Array.isArray(data) ? data : []
    },

    /** POST /ai/threads — создать тред с дефолтным заголовком */
    createThread: async (): Promise<AiThread> => {
      const { data } = await api.post('/ai/threads', {})
      return data
    },

    /** PATCH /ai/threads/:id — переименовать */
    renameThread: async (id: number, title: string): Promise<AiThread> => {
      const { data } = await api.patch(`/ai/threads/${id}`, { title })
      return data
    },

    /** PATCH /ai/threads/:id — закрепить / открепить */
    pinThread: async (id: number, pinned: boolean): Promise<AiThread> => {
      const { data } = await api.patch(`/ai/threads/${id}`, { pinned })
      return data
    },

    /** DELETE /ai/threads/:id — удалить (каскадно чистит сообщения) */
    deleteThread: async (id: number): Promise<void> => {
      await api.delete(`/ai/threads/${id}`)
    },

    /** GET /ai/history — история треда или класса */
    getHistory: async (params: HistoryParams): Promise<any[]> => {
      const { data } = await api.get('/ai/history', { params: historyParams(params) })
      return Array.isArray(data) ? data : []
    },

    /** DELETE /ai/history — очистить историю треда или класса */
    clearHistory: async (params: HistoryParams): Promise<void> => {
      await api.delete('/ai/history', { params: historyParams(params) })
    },

    /** POST /ai/history/import — залить историю (только если тред пуст) */
    importHistory: async (
      messages: { role: string; content: string }[],
      params: HistoryParams,
    ): Promise<any[]> => {
      const { data } = await api.post('/ai/history/import', {
        messages,
        ...historyParams(params),
      })
      return Array.isArray(data) ? data : []
    },

    /** POST /ai/chat — отправить сообщение */
    chat: async (body: {
      messages: any[]
      max_tokens?: number
      temperature?: number
      class_id?: number
      thread_id?: number
      lecture_context?: string
    }): Promise<{ content: string; quota?: any; thread_title?: string }> => {
      const { data } = await api.post('/ai/chat', body)
      return data
    },
  }
}
