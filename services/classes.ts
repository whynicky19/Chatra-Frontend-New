import { useApi } from './api'

export type RotationMode = 'manual' | 'yearly'

export interface ClassResponse {
  id: number
  name: string
  description?: string
  created_by: number
  created_at: string
  is_active: boolean
  member_count?: number
  invite_code?: string | null
  cover_image?: string
  teacher?: string
  period?: string
  rotation_mode: RotationMode
  // true — пользователь состоит только в архивных потоках класса:
  // класс для него read-only (сдача работ вернёт 403).
  is_archived_for_user: boolean
}

export interface CohortResponse {
  id: number
  class_id: number
  academic_year: string
  start_date: string
  status: 'active' | 'archived' | string
  created_at: string
  student_count?: number
}

export const useClassesSvc = () => {
  const api = useApi()

  return {
    list: async (opts?: { limit?: number; offset?: number }): Promise<ClassResponse[]> => {
      const params: Record<string, any> = {}
      if (opts?.limit != null) params.limit = opts.limit
      if (opts?.offset != null) params.offset = opts.offset
      const { data } = await api.get('/classes/', { params })
      return data as ClassResponse[]
    },
    listAll: async (opts?: { limit?: number; offset?: number }): Promise<ClassResponse[]> => {
      // Returns all classes (for join-by-code search)
      const params: Record<string, any> = {}
      if (opts?.limit != null) params.limit = opts.limit
      if (opts?.offset != null) params.offset = opts.offset
      const { data } = await api.get('/classes/all', { params })
      return data as ClassResponse[]
    },
    get: async (id: number): Promise<ClassResponse> => {
      const { data } = await api.get(`/classes/${id}`)
      return data
    },
    join: async (classId: number): Promise<void> => {
      await api.post(`/classes/${classId}/join`, {})
    },
    leave: async (classId: number): Promise<void> => {
      await api.delete(`/classes/${classId}/leave`)
    },
    create: async (
      name: string,
      description?: string,
      teacher?: string,
      period?: string,
      cover_image?: string,
    ): Promise<ClassResponse> => {
      const { data } = await api.post('/classes/', { name, description, teacher, period, cover_image })
      return data
    },
    delete: async (classId: number): Promise<void> => {
      await api.delete(`/classes/${classId}`)
    },
    update: async (classId: number, body: Record<string, any>): Promise<ClassResponse> => {
      const { data } = await api.put(`/classes/${classId}`, body)
      return data
    },
    joinByCode: async (code: string): Promise<ClassResponse> => {
      const { data } = await api.post('/classes/join-by-code', { code })
      return data
    },
    // Проверка существования класса по коду без вступления (живой предпросмотр).
    // 404 — класса с таким кодом нет. Инвайт-код в ответе замаскирован бэкендом.
    lookupByCode: async (code: string): Promise<ClassResponse> => {
      const { data } = await api.get('/classes/lookup-by-code', { params: { code } })
      return data
    },
    members: async (classId: number, cohortId?: number): Promise<any[]> => {
      const params = cohortId != null ? `?cohort_id=${cohortId}` : ''
      const { data } = await api.get(`/classes/${classId}/members${params}`)
      return data as any[]
    },

    // Студенты из архивных потоков, которых можно вернуть (админ/владелец).
    rejoinableStudents: async (classId: number): Promise<any[]> => {
      const { data } = await api.get(`/classes/${classId}/rejoinable-students`)
      return data as any[]
    },
    addMember: async (classId: number, userId: number): Promise<void> => {
      await api.post(`/classes/${classId}/members`, { user_id: userId })
    },

    // ── Потоки (когорты) — только владелец класса / админ ──────────────────
    listCohorts: async (classId: number): Promise<CohortResponse[]> => {
      const { data } = await api.get(`/classes/${classId}/cohorts`)
      return data as CohortResponse[]
    },
    setRotationMode: async (classId: number, mode: RotationMode): Promise<ClassResponse> => {
      const { data } = await api.patch(`/classes/${classId}/rotation-mode`, { rotation_mode: mode })
      return data
    },
  }
}
