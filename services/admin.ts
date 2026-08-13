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

// Строка списка пользователей с агрегатами (GET /admin/users/overview).
export type AdminUserRow = {
  id: number
  email: string
  full_name: string | null
  role: string
  is_active: boolean
  is_verified: boolean
  ai_unlimited: boolean
  created_at: string | null
  total_tokens: number
  request_count: number
  class_count: number
  last_active: string | null
}

export type AdminUserDetail = AdminUserRow & {
  org_type: string
  ai: AiUsageTotals & {
    by_endpoint: { endpoint: string; label: string; group: string; group_label: string
      total_tokens: number; prompt_tokens: number; completion_tokens: number; request_count: number }[]
    messages_today: number
    message_limit: number
    general_tokens: number
    general_requests: number
    first_used: string | null
    last_used: string | null
  }
  classes: {
    id: number; name: string; role: 'creator' | 'member'
    cover_color: string | null; cover_icon: string | null; cover_thumbnail: string | null
    total_tokens: number; request_count: number
  }[]
  activity: {
    posts: number; submissions: number; graded: number
    avg_score: number | null; assignments_created: number
  }
}

export type AdminClassDetail = {
  id: number
  name: string
  description: string | null
  invite_code: string | null
  created_at: string | null
  cover_image: string | null
  cover_thumbnail: string | null
  cover_color: string | null
  cover_icon: string | null
  teacher: string | null
  creator: { id: number; full_name: string | null; email: string; role: string } | null
  members: {
    id: number; full_name: string | null; email: string; role: string; is_active: boolean
    total_tokens: number; request_count: number; last_active: string | null
  }[]
  member_count: number
  cohorts: { id: number; academic_year: string; status: string; student_count: number; start_date: string | null }[]
  content: {
    assignments: number; assignments_active: number; lectures: number
    submissions: number; graded: number; avg_score: number | null
  }
  ai: AiUsageTotals & {
    by_endpoint: AdminUserDetail['ai']['by_endpoint']
    first_used: string | null
    last_used: string | null
  }
}

export const useAdminSvc = () => {
  const api = useApi()
  return {
    users: async () => {
      const { data } = await api.get('/admin/users')
      return data as any[]
    },

    // Список с агрегатами для админки: расход токенов, число классов и
    // последнее действие приходят сразу, без запроса на каждую строку.
    usersOverview: async () => {
      const { data } = await api.get('/admin/users/overview')
      return data as AdminUserRow[]
    },

    userDetail: async (id: number) => {
      const { data } = await api.get(`/admin/users/${id}`)
      return data as AdminUserDetail
    },

    classDetail: async (id: number) => {
      const { data } = await api.get(`/admin/classes/${id}`)
      return data as AdminClassDetail
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
