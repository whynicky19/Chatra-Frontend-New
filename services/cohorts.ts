import { useApi } from './api'

// Переход учебного года и правка дедлайнов потоков — только для
// преподавателя-владельца класса (или админа).

export interface RolloverPreviewItem {
  class_id: number
  class_name: string
  cohort_id: number
  academic_year: string
  student_count: number
  assignment_count: number
}

export interface RolloverRequest {
  class_ids: number[]
  new_academic_year: string // формат "2026/2027"
  new_start_date: string     // формат "2026-09-01"
}

export interface RolloverResultItem {
  // status: rolled | already_rolled | no_active_cohort | conflict
  class_id: number
  status: string
  new_cohort_id?: number | null
  deadlines_created?: number
}

export interface DeadlineResponse {
  id: number
  cohort_id: number
  assignment_id: number
  assignment_title?: string | null
  due_date: string
  is_published: boolean
}

export const useCohortsSvc = () => {
  const api = useApi()

  return {
    rolloverPreview: async (): Promise<RolloverPreviewItem[]> => {
      const { data } = await api.get('/rollover/preview')
      return data as RolloverPreviewItem[]
    },
    rollover: async (body: RolloverRequest): Promise<RolloverResultItem[]> => {
      const { data } = await api.post('/rollover', body)
      return data as RolloverResultItem[]
    },
    cohortDeadlines: async (cohortId: number): Promise<DeadlineResponse[]> => {
      const { data } = await api.get(`/cohorts/${cohortId}/deadlines`)
      return data as DeadlineResponse[]
    },
    updateDeadline: async (
      deadlineId: number,
      body: { due_date?: string; is_published?: boolean },
    ): Promise<DeadlineResponse> => {
      const { data } = await api.patch(`/deadlines/${deadlineId}`, body)
      return data as DeadlineResponse
    },
    publishAllDeadlines: async (cohortId: number): Promise<{ published: number }> => {
      const { data } = await api.patch(`/cohorts/${cohortId}/deadlines/publish-all`)
      return data as { published: number }
    },
  }
}
