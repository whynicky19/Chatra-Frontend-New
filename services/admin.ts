import { useApi } from './api'

export type AiUsageTotals = {
  total_tokens: number
  prompt_tokens: number
  completion_tokens: number
  request_count: number
  user_count: number
  class_count: number
  avg_tokens: number
}

// Общая форма строки разреза (по виду запроса / классу / пользователю).
type AiUsageSlice = {
  total_tokens: number
  prompt_tokens: number
  completion_tokens: number
  request_count: number
  avg_tokens: number
  last_used: string | null
}

export type AiDashboard = {
  days: number
  since: string
  generated_at: string
  totals: AiUsageTotals
  totals_all_time: AiUsageTotals
  by_endpoint: (AiUsageSlice & {
    endpoint: string; label: string; group: string; group_label: string; user_count: number
  })[]
  by_group: {
    group: string; label: string; endpoints: string[]
    total_tokens: number; prompt_tokens: number; completion_tokens: number; request_count: number
  }[]
  by_class: (AiUsageSlice & {
    class_id: number | null; class_name: string | null
    kinds: Record<string, number>; user_count: number
  })[]
  by_day: {
    date: string; total_tokens: number; prompt_tokens: number
    completion_tokens: number; request_count: number; kinds: Record<string, number>
  }[]
  top_users: (AiUsageSlice & {
    user_id: number; name: string | null; email: string | null
    role: string | null; ai_unlimited: boolean; kinds: Record<string, number>
  })[]
  labels: Record<string, string>
  limits: { daily_token_budget: number; tokens_used_today: number; daily_message_limit: number }
}

export const useAdminSvc = () => {
  const api = useApi()
  return {
    users: async () => {
      const { data } = await api.get('/admin/users')
      return data as any[]
    },

    create: async (p: { email: string; password: string; role: string }) => {
      const { data } = await api.post('/admin/users', p)
      return data
    },

    // role is sent as query param matching backend: PUT /admin/users/{id}/role?new_role=...\
    role: async (id: number, r: string) => {
      await api.put(`/admin/users/${id}/role`, null, { params: { new_role: r } })
    },

    block: async (id: number) => {
      await api.put(`/admin/users/${id}/block`)
    },

    unblock: async (id: number) => {
      await api.put(`/admin/users/${id}/unblock`)
    },

    del: async (id: number) => {
      await api.delete(`/admin/users/${id}`)
    },

    setAiUnlimited: async (id: number, unlimited: boolean) => {
      await api.put(`/admin/users/${id}/ai_unlimited`, { unlimited })
    },

    // endpoint — вид расхода; можно перечислить несколько через запятую
    // (клик по «Чат с ИИ» в дашборде = chat + chat_vision).
    aiUsage: async (params?: {
      class_id?: number; endpoint?: string; user_id?: number
      days?: number; page?: number; page_size?: number
    }) => {
      const { data } = await api.get('/admin/ai-usage', { params })
      return data as { total: number; page: number; page_size: number; items: any[] }
    },

    // Весь дашборд расхода одним запросом: итоги, разбивка по видам запросов,
    // классам, дням и пользователям за выбранный период.
    aiDashboard: async (params?: { days?: number; top_users?: number; top_classes?: number }) => {
      const { data } = await api.get('/admin/ai-usage/dashboard', { params })
      return data as AiDashboard
    },

    aiUsageSummary: async () => {
      const { data } = await api.get('/admin/ai-usage/summary')
      return data as any[]
    },
  }
}
