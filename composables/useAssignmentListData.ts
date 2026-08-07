import { provide, inject, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import type { Assignment, Submission } from '~/services/assignments'

export interface AssignmentListDataCtx {
  assignments: Ref<Assignment[]>
  mySubmissions: Ref<Submission[]>
  loading: Ref<boolean>
  classId: ComputedRef<number>
  readonly: Ref<boolean>
  refreshMySubmissions: () => Promise<void>
}

const ASSIGNMENT_LIST_KEY: InjectionKey<AssignmentListDataCtx> = Symbol('assignment-list-data')

export const provideAssignmentListData = (ctx: AssignmentListDataCtx) => provide(ASSIGNMENT_LIST_KEY, ctx)

export function useAssignmentListData(): AssignmentListDataCtx {
  const ctx = inject(ASSIGNMENT_LIST_KEY)
  if (!ctx) throw new Error('useAssignmentListData() must be used inside the assignments route tree')
  return ctx
}
