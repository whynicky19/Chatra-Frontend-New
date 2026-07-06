import { useI18n } from '~/composables/useI18n'

// Централизованная обработка ошибок, связанных с потоками (когортами),
// чтобы не дублировать тексты по компонентам.
//
//  • 409 {"detail":"no_active_cohort"} — у класса нет активного учебного года
//    (вступление/добавление участника). Показываем понятный локализованный текст.
//  • 403 «...ваш учебный год в архиве» — сдача работы в архивном потоке.
//    Бэкенд уже присылает готовый человекочитаемый текст — показываем как есть.
export const useCohortErrors = () => {
  const { t } = useI18n()

  const detailOf = (e: any): string | undefined => {
    const d = e?.response?.data?.detail
    return typeof d === 'string' ? d : undefined
  }

  const isNoActiveCohort = (e: any): boolean => detailOf(e) === 'no_active_cohort'

  // Возвращает локализованное сообщение для показа в UI (тост/инлайн).
  // Для no_active_cohort — своя строка; для остальных — текст бэкенда либо fallback.
  const cohortErrorMessage = (e: any, fallback?: string): string => {
    if (isNoActiveCohort(e)) return t('cohort.no_active_cohort')
    return detailOf(e) || fallback || t('general.error')
  }

  return { isNoActiveCohort, cohortErrorMessage, detailOf }
}
