// Передача вопроса в ИИ-чат класса с другой страницы (вкладка «ИИ» класса
// монтируется уже после перехода). Отдельного чата под это не заводим:
// сообщение уходит в тот же тред класса, что и обычная переписка на вкладке.
const STORE_KEY = '_ai_handoff'
const MAX_AGE_MS = 2 * 60 * 1000

interface AiHandoff { classId: number; text: string; createdAt: number }

export const queueAiMessage = (classId: number, text: string) => {
  if (!import.meta.client) return
  const payload: AiHandoff = { classId, text, createdAt: Date.now() }
  try { sessionStorage.setItem(STORE_KEY, JSON.stringify(payload)) } catch {}
}

/** Забирает сообщение ровно один раз: повторный вход на вкладку его не отправит. */
export const takeAiMessage = (classId: number | undefined): string | null => {
  if (!import.meta.client || classId == null) return null
  try {
    const raw = sessionStorage.getItem(STORE_KEY)
    if (!raw) return null
    const payload = JSON.parse(raw) as AiHandoff
    if (payload?.classId !== classId) return null
    sessionStorage.removeItem(STORE_KEY)
    if (!payload.text || Date.now() - payload.createdAt > MAX_AGE_MS) return null
    return payload.text
  } catch { return null }
}

const MAX_QUOTE = 1500

export interface QuoteContext {
  lang: 'ru' | 'en' | 'kk'
  text: string
  lectureTitle: string
  lectureId: number
  fileName: string
  page?: number | null
}

/**
 * Вопрос звучит как обычное сообщение студента, а служебные идентификаторы
 * уходят отдельной строкой в конце — по ним модель понимает, из какого
 * материала фрагмент, и может опереться на текст этой лекции в системном
 * промпте (см. buildSystem в ClassAiChat.vue).
 */
export const buildQuotePrompt = (ctx: QuoteContext): string => {
  const quote = ctx.text.trim().replace(/\s+/g, ' ').slice(0, MAX_QUOTE)
  const title = ctx.lectureTitle?.trim()
  const page = ctx.page && ctx.page > 0 ? ctx.page : null

  if (ctx.lang === 'en') {
    const where = [title ? `the lecture “${title}”` : 'the lecture', page ? `p. ${page}` : ''].filter(Boolean).join(', ')
    return `Explain this excerpt from ${where}:\n\n«${quote}»\n\n(source: lecture #${ctx.lectureId}, file “${ctx.fileName}”)`
  }
  if (ctx.lang === 'kk') {
    const where = [title ? `«${title}» дәрісінен` : 'дәрістен', page ? `${page}-бет` : ''].filter(Boolean).join(', ')
    return `Осы үзіндіні түсіндіріп бер (${where}):\n\n«${quote}»\n\n(дереккөз: дәріс #${ctx.lectureId}, файл «${ctx.fileName}»)`
  }
  const where = [title ? `из лекции «${title}»` : 'из лекции', page ? `стр. ${page}` : ''].filter(Boolean).join(', ')
  return `Объясни этот фрагмент ${where}:\n\n«${quote}»\n\n(источник: лекция #${ctx.lectureId}, файл «${ctx.fileName}»)`
}
