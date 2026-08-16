import { useApi } from './api'

export type AnnotationColor = 'yellow' | 'green' | 'blue' | 'red'

/** Строка ответа /annotations — общая с мобильным приложением. */
export interface Annotation {
  id: number
  user_id: number
  lecture_id: number
  class_id: number
  /** -1 — текст самой лекции, иначе индекс вложения. */
  file_index: number
  /** Страница PDF (1..N); 0 — документ без страниц. */
  page: number
  selected_text: string
  /** Текст вокруг фрагмента: по нему выделение находится, если смещения не сошлись. */
  prefix: string
  suffix: string
  start_offset: number
  end_offset: number
  color: AnnotationColor
  comment: string | null
  created_at: string
  updated_at: string
  lecture_title: string | null
}

export interface AnnotationCreate {
  lecture_id: number
  class_id: number
  file_index: number
  page: number
  selected_text: string
  prefix: string
  suffix: string
  start_offset: number
  end_offset: number
  color: AnnotationColor
  comment?: string | null
}

export const useAnnotationsSvc = () => {
  const api = useApi()

  return {
    list: async (params?: { lecture_id?: number; class_id?: number }): Promise<Annotation[]> => {
      const { data } = await api.get('/annotations', { params })
      return Array.isArray(data) ? data : []
    },

    create: async (body: AnnotationCreate): Promise<Annotation> => {
      const { data } = await api.post('/annotations', body)
      return data
    },

    // Меняются только цвет и заметка: положение — свойство самого выделения.
    update: async (id: number, body: { color?: AnnotationColor; comment?: string | null }): Promise<Annotation> => {
      const { data } = await api.patch(`/annotations/${id}`, body)
      return data
    },

    remove: async (id: number): Promise<void> => {
      await api.delete(`/annotations/${id}`)
    },
  }
}
