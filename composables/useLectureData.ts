import { provide, inject, type ComputedRef, type InjectionKey, type Ref } from 'vue'

export interface LecturePost { id: number; title: string; created_at: string; body: string; position?: number }
export interface LectureFile { url: string; name: string }

export interface LectureDataCtx {
  post: Ref<LecturePost | null>
  files: ComputedRef<LectureFile[]>
  loading: Ref<boolean>
  classId: ComputedRef<number>
}

const LECTURE_KEY: InjectionKey<LectureDataCtx> = Symbol('lecture-data')

export const provideLectureData = (ctx: LectureDataCtx) => provide(LECTURE_KEY, ctx)

export function useLectureData(): LectureDataCtx {
  const ctx = inject(LECTURE_KEY)
  if (!ctx) throw new Error('useLectureData() must be used inside the lecture route tree')
  return ctx
}
