/**
 * Общее форматирование и палитра админ-панели.
 *
 * Дашборд расхода, список пользователей и карточка предмета показывают одни и
 * те же сущности (токены, виды запросов, люди) — формат чисел, цвет функции и
 * цвет аватара обязаны совпадать во всех трёх местах, иначе одна и та же
 * запись выглядит по-разному на соседних экранах.
 */

// Виды расхода ИИ. Ключи — group из /admin/ai-usage/*; палитра проверена
// валидатором на светлой (#FFFFFF) и тёмной (#1C1C1E) поверхностях.
export const AI_GROUPS = ['chat', 'grade', 'cover', 'title', 'other'] as const

export const groupColor = (group: string) =>
  `var(--s-${(AI_GROUPS as readonly string[]).includes(group) ? group : 'other'})`

// Иконки видов расхода (пути SVG в системе 24×24).
export const KIND_ICONS: Record<string, string[]> = {
  chat: ['M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z'],
  grade: ['M9 11l3 3L22 4', 'M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11'],
  cover: ['M3 3h18v18H3z', 'M3 15l5-5 4 4 3-3 6 6'],
  title: ['M4 7V5h16v2', 'M9 20h6', 'M12 5v15'],
  other: ['M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z'],
}
export const kindIcon = (group: string) => KIND_ICONS[group] || KIND_ICONS.other

// Оттенок аватара закреплён за id: один и тот же человек не перекрашивается при
// смене сортировки или фильтра. Это идентичность, а не данные, — поэтому вне
// палитры видов расхода.
const AVATAR_TINTS = ['#5E5CE6', '#0A84FF', '#30B0C7', '#32A852', '#FF9F0A', '#FF6482', '#BF5AF2', '#64748B']

export const useAdminFormat = () => {
  const fmt = (n: number | null | undefined) => Math.round(n || 0).toLocaleString('ru-RU')

  // Компактная запись для крупных чисел в тесных местах (оси, плитки).
  const fmtShort = (n: number | null | undefined) => {
    const v = Math.round(n || 0)
    if (v >= 1e6) return (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace('.', ',') + ' млн'
    if (v >= 1e4) return Math.round(v / 1e3) + ' тыс.'
    return v.toLocaleString('ru-RU')
  }

  // Бэкенд шлёт naive-UTC без таймзоны — без 'Z' браузер считал бы время
  // локальным и показывал бы его со сдвигом на часовой пояс.
  const utcDate = (iso: string) => new Date(/Z$|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : iso + 'Z')

  const fmtDateTime = (iso?: string | null) => {
    if (!iso) return '—'
    const d = utcDate(iso)
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })
      + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const fmtDateLong = (iso?: string | null) =>
    iso ? utcDate(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

  /** «Сегодня, 14:32» / «Вчера, 09:10» / «12 авг., 18:00» — как в списках почты. */
  const fmtRelative = (iso?: string | null) => {
    if (!iso) return 'Нет активности'
    const d = utcDate(iso)
    const now = new Date()
    const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
    if (sameDay(d, now)) return `Сегодня, ${time}`
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (sameDay(d, yesterday)) return `Вчера, ${time}`
    const sameYear = d.getFullYear() === now.getFullYear()
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) })
      + `, ${time}`
  }

  // «3 записей» вместо «3 записи» — самая заметная мелочь в русском интерфейсе.
  const plural = (n: number, forms: [string, string, string]) => {
    const a = Math.abs(Math.round(n)) % 100
    if (a > 10 && a < 20) return forms[2]
    const b = a % 10
    return b === 1 ? forms[0] : b >= 2 && b <= 4 ? forms[1] : forms[2]
  }

  const initials = (name?: string | null) =>
    (name || '').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '—'

  const avatarColor = (id: number) => AVATAR_TINTS[Math.abs(id || 0) % AVATAR_TINTS.length]

  const ROLE_LABELS: Record<string, string> = {
    student: 'Ученик', teacher: 'Учитель', admin: 'Администратор',
  }
  const roleLabel = (role?: string | null) => ROLE_LABELS[role || ''] || role || '—'
  // В строке списка полное «Администратор» не помещается в чип — там нужен
  // короткий вариант, полный остаётся в карточке.
  const ROLE_SHORT: Record<string, string> = {
    student: 'Ученик', teacher: 'Учитель', admin: 'Админ',
  }
  const roleShort = (role?: string | null) => ROLE_SHORT[role || ''] || role || '—'

  return {
    fmt, fmtShort, utcDate, fmtDateTime, fmtDateLong, fmtRelative,
    plural, initials, avatarColor, roleLabel, roleShort, groupColor, kindIcon,
  }
}
