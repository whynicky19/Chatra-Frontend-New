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
  // Миниатюра обложки (≤480px) — использовать в списках/сетках/карточках
  // вместо cover_image, чтобы не гонять полноразмерную картинку при
  // скролле каталога классов. Полный cover_image — только на странице
  // класса и в местах, где обложка показывается крупно.
  cover_thumbnail?: string
  // Оформление обложки: слаг цвета и слаг предметной иконки. По ним обложка
  // генерируется заново, а превью рисуется локально. null — предмет создан
  // до перехода на генерируемые обложки и показывает загруженную картинку.
  cover_color?: string | null
  cover_icon?: string | null
  // 'ai' | 'fallback' | 'upload' | null
  cover_source?: string | null
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
    // Обложка не загружается, а собирается сервером по паре «цвет + иконка»:
    // предмет создаётся сразу с готовой обложкой-фолбэком, AI-версию клиент
    // запрашивает следующим шагом через generateCover().
    create: async (
      name: string,
      description?: string,
      teacher?: string,
      period?: string,
      cover_color?: string,
      cover_icon?: string,
    ): Promise<ClassResponse> => {
      const { data } = await api.post('/classes/', {
        name, description, teacher, period, cover_color, cover_icon,
      })
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
    // Генерация обложки — только владелец класса. Один и тот же эндпоинт
    // обслуживает и первую генерацию, и «Перегенерировать», и переход старого
    // предмета с загруженной картинки на новую систему. Вызывать строго по
    // явному действию пользователя: каждый вызов стоит денег.
    generateCover: async (classId: number, color?: string, icon?: string): Promise<{
      cover_image: string | null
      cover_thumbnail: string | null
      cover_color: string | null
      cover_icon: string | null
      cover_source: string | null
    }> => {
      const { data } = await api.post(`/classes/${classId}/cover/generate`, { color, icon })
      return data
    },
    // Ждёт завершения УЖЕ ИДУЩЕЙ генерации: сервер на повторный запрос
    // отвечает 409 cover_generation_in_progress (а при обрыве соединения и
    // подавно продолжает дорисовывать сам) — результат появится в БД, хотя
    // сам POST упал. Опрашиваем класс, пока не придёт новая картинка
    // относительно [prevImage]/[prevSource], либо до таймаута (~160 c).
    awaitPendingCover: async (
      classId: number,
      prevImage?: string | null,
      prevSource?: string | null,
      signal?: AbortSignal,
    ): Promise<{
      cover_image: string | null
      cover_thumbnail: string | null
      cover_color: string | null
      cover_icon: string | null
      cover_source: string | null
    } | null> => {
      for (let i = 0; i < 40; i++) {
        // AbortSignal позволяет вызывающей стороне (например, onUnmounted)
        // прервать 160-секундный polling. Без этого цикл продолжает молотить
        // и логировать setTimeout после ухода со страницы.
        if (signal?.aborted) return null
        await new Promise<void>((resolve) => {
          const t = setTimeout(resolve, 4000)
          if (signal) {
            const onAbort = () => { clearTimeout(t); resolve() }
            signal.addEventListener('abort', onAbort, { once: true })
          }
        })
        if (signal?.aborted) return null
        try {
          const { data } = await api.get(`/classes/${classId}`)
          const img = data?.cover_image || ''
          const src = data?.cover_source || ''
          if (src && img && (img !== (prevImage || '') || src !== (prevSource || ''))) {
            return {
              cover_image: data.cover_image,
              cover_thumbnail: data.cover_thumbnail,
              cover_color: data.cover_color,
              cover_icon: data.cover_icon,
              cover_source: data.cover_source,
            }
          }
        } catch { /* одиночный сбой опроса не повод бросать ожидание */ }
      }
      return null
    },
    // Перегенерация инвайт-кода — только владелец класса / админ.
    // Старый код перестаёт работать, возвращается новый.
    regenerateCode: async (classId: number): Promise<string> => {
      const { data } = await api.post(`/classes/${classId}/regenerate-code`, {})
      return (data as { invite_code: string }).invite_code
    },
  }
}
