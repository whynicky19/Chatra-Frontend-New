import { ref, computed, watch } from 'vue'
import { useApi } from '~/services/api'
import { useAuthStore } from '~/stores/auth.store'

// Дефолт до первого ответа сервера; настоящий лимит приходит из /ai/limits.
export const AI_LIMIT = 50

// Дневная квота ИИ — серверная (GET /ai/limits), общая с приложением: считать
// локально нельзя, иначе лимит обходится сменой браузера или чисткой storage.
export interface AiQuota {
  limit: number
  used: number
  remaining: number | null   // null — безлимит
  unlimited: boolean
  resets_at?: string
}

// Модульный (singleton) стейт: квота глобальная для залогиненного юзера,
// а не для конкретного чата, поэтому все вызовы useAiQuota() делят одно
// реактивное значение.
const _quota = ref<AiQuota | null>(null)
let _quotaUserId: number | null | undefined = undefined

/** Квота из ответа /ai/chat — обновляет счётчик без лишнего запроса. */
export const applyQuota = (q: AiQuota | null | undefined) => {
  if (q && typeof q.limit === 'number') _quota.value = q
}

/** Актуализировать квоту с сервера (GET /ai/limits). */
export const refreshQuota = async (uid: number | null | undefined) => {
  if (!import.meta.client || uid == null) return
  try {
    applyQuota((await useApi().get('/ai/limits')).data)
  } catch {}
}

export const useAiQuota = () => {
  const auth = useAuthStore()

  // При смене пользователя (в т.ч. после повторного входа) сбрасываем квоту
  // и подтягиваем его собственную.
  watch(() => auth.user?.id, (id) => {
    if (id !== _quotaUserId) { _quotaUserId = id; _quota.value = null; refreshQuota(id) }
  }, { immediate: true })

  const quota = _quota
  const aiLimit = computed(() => _quota.value?.limit ?? AI_LIMIT)
  const aiUnlimited = computed(() => _quota.value?.unlimited ?? !!auth.user?.ai_unlimited)
  const aiCount = computed(() => _quota.value?.used ?? 0)
  const aiRemaining = computed(() =>
    _quota.value?.remaining ?? Math.max(0, aiLimit.value - aiCount.value))
  const aiLimitReached = computed(() =>
    !aiUnlimited.value && _quota.value != null && aiRemaining.value <= 0)

  return {
    quota, aiLimit, aiCount, aiRemaining, aiUnlimited, aiLimitReached,
    applyQuota, refreshQuota, AI_LIMIT,
  }
}
