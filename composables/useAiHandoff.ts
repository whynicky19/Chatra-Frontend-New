// Передача вопроса в ИИ-чат класса с другой страницы (вкладка «ИИ» класса
// монтируется уже после перехода). Отдельного чата под это не заводим:
// сообщение уходит в тот же тред класса, что и обычная переписка на вкладке.
const STORE_KEY = '_ai_handoff'
const MAX_AGE_MS = 2 * 60 * 1000

/**
 * Кроме текста сообщения несёт ссылку на источник фрагмента. Сервер по ней сам
 * достаёт лекцию и страницу (см. routers/ai.py:_fragment_context) — формулировке
 * в тексте он не доверяет, поэтому передавать нужно именно идентификаторы.
 */
export interface AiHandoff {
  classId: number
  text: string
  /** id сохранённого выделения; для неcохранённого — lectureId + quote. */
  annotationId?: number | null
  lectureId?: number | null
  page?: number | null
  quote?: string | null
  createdAt: number
}

export const queueAiMessage = (payload: Omit<AiHandoff, 'createdAt'>) => {
  if (!import.meta.client) return
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify({ ...payload, createdAt: Date.now() }))
  } catch {}
}

/** Забирает сообщение ровно один раз: повторный вход на вкладку его не отправит. */
export const takeAiMessage = (classId: number | undefined): AiHandoff | null => {
  if (!import.meta.client || classId == null) return null
  try {
    const raw = sessionStorage.getItem(STORE_KEY)
    if (!raw) return null
    const payload = JSON.parse(raw) as AiHandoff
    if (payload?.classId !== classId) return null
    sessionStorage.removeItem(STORE_KEY)
    if (!payload.text || Date.now() - payload.createdAt > MAX_AGE_MS) return null
    return payload
  } catch { return null }
}

const MAX_QUOTE = 1500

export interface QuoteContext {
  lang: 'ru' | 'en' | 'kk'
  text: string
  lectureTitle: string
  page?: number | null
}

/**
 * Видимая формулировка вопроса. Идентификаторы лекции/страницы в текст не
 * вписываем — они уходят полями запроса, а сервер добавляет источник в
 * системный контекст сам.
 */
export const buildQuotePrompt = (ctx: QuoteContext): string => {
  const quote = ctx.text.trim().replace(/\s+/g, ' ').slice(0, MAX_QUOTE)
  const title = ctx.lectureTitle?.trim()
  const page = ctx.page && ctx.page > 0 ? ctx.page : null

  if (ctx.lang === 'en') {
    const where = [title ? `the lecture “${title}”` : 'the lecture', page ? `p. ${page}` : ''].filter(Boolean).join(', ')
    return `Explain this excerpt from ${where}:\n\n«${quote}»`
  }
  if (ctx.lang === 'kk') {
    const where = [title ? `«${title}» дәрісінен` : 'дәрістен', page ? `${page}-бет` : ''].filter(Boolean).join(', ')
    return `Осы үзіндіні түсіндіріп бер (${where}):\n\n«${quote}»`
  }
  const where = [title ? `из лекции «${title}»` : 'из лекции', page ? `стр. ${page}` : ''].filter(Boolean).join(', ')
  return `Объясни этот фрагмент ${where}:\n\n«${quote}»`
}
