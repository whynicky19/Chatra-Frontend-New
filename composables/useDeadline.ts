// Бэкенд иногда отдаёт дедлайн без суффикса `Z`/offset — в таких случаях
// строку нужно явно трактовать как UTC, иначе разные браузеры/места кода
// парсят её то как UTC, то как локальное время, и дедлайн "плывёт".
//
// Защита от null/undefined: API может вернуть отсутствующее поле, а вызовы
// (calendar/notifications) используют parseUtc().getTime() без try/catch.
// Возвращаем Invalid Date — getTime() даст NaN, фильтры/сортировки спокойно
// отбросят такое значение (см. dotsArr/strip, dayItems, sorted).
export function parseUtc(d: string | null | undefined): Date {
  if (!d) return new Date(NaN)
  return new Date(d.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(d) ? d : d + 'Z')
}

export function useDeadline() {
  return { parseUtc }
}
