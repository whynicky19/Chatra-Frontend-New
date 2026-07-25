// Бэкенд иногда отдаёт дедлайн без суффикса `Z`/offset — в таких случаях
// строку нужно явно трактовать как UTC, иначе разные браузеры/места кода
// парсят её то как UTC, то как локальное время, и дедлайн "плывёт".
export function parseUtc(d: string): Date {
  return new Date(d.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(d) ? d : d + 'Z')
}

export function useDeadline() {
  return { parseUtc }
}
