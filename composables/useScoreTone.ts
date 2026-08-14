// Единая шкала «качества результата» для всех мест, где показывается балл:
// кольцо результата, вердикт под ним, полоски по критериям, пилюли баллов в
// списке работ. Раньше каждый из этих элементов был просто бирюзовым, из-за
// чего 2/10 и 10/10 выглядели одинаково — цвет не нёс информации.
export type ScoreTone = 'excellent' | 'good' | 'ok' | 'poor'

export const scoreRatio = (score: number, max: number) =>
  max > 0 ? Math.min(1, Math.max(0, score / max)) : 0

export const scoreTone = (score: number, max: number): ScoreTone => {
  const r = scoreRatio(score, max)
  if (r >= 0.85) return 'excellent'
  if (r >= 0.7) return 'good'
  if (r >= 0.5) return 'ok'
  return 'poor'
}

// Ключи уже жили в словаре (am.score_*) — здесь они наконец используются.
export const scoreToneKey = (tone: ScoreTone) => ({
  excellent: 'am.score_excellent',
  good: 'am.score_good',
  ok: 'am.score_needs_improvement',
  poor: 'am.score_poor',
}[tone])
