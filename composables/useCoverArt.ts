/**
 * Оформление обложек предметов: палитра, предметные иконки и локальное превью.
 *
 * Единственный источник правды по набору цветов и иконок — бэкенд
 * (GET /classes/cover/options, см. services/cover_art.py): он же рисует
 * готовую обложку, и разъехавшийся набор означал бы, что пользователь
 * выбирает вариант, которого сервер не знает. Здесь набор только
 * кэшируется на время сессии + лежат SVG-глифы для превью и пикера.
 *
 * Сами SVG нужны ТОЛЬКО для интерфейса: в сохранённой обложке иконка уже
 * впечатана бэкендом, поэтому карточки, шапки и списки ничего не
 * дорисовывают — они как и раньше показывают одну картинку по coverUrl.
 */
import { ref } from 'vue'
import { useApi } from '~/services/api'

export interface CoverColorOption { id: string; hex: string; deep: string }
export interface CoverIconOption { id: string; subject: string }
export interface CoverOptions {
  colors: CoverColorOption[]
  icons: CoverIconOption[]
  default_color: string
  default_icon: string
  ai_available: boolean
}

/**
 * Глифы предметных иконок в viewBox 24×24, обводкой (fill="none").
 * Повторяют то, что рисует бэкенд в services/cover_art.py, чтобы превью
 * до генерации совпадало с итоговой обложкой.
 */
export const COVER_ICON_PATHS: Record<string, string> = {
  sigma: 'M18.5 4.5H6l7 7.5-7 7.5h12.5',
  atom: 'M12 12m-1.6 0a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0'
    + ' M12 12m-10.5 0a10.5 4.6 0 1 0 21 0a10.5 4.6 0 1 0 -21 0',
  flask: 'M9 2.5h6M10 2.5v6.5L3.5 21h17L14 9V2.5',
  dna: 'M8.6 3c0 6 6.8 12 6.8 18M15.4 3c0 6-6.8 12-6.8 18M9.6 7h4.8M8.2 10.5h7.6M8.2 13.5h7.6M9.6 17h4.8',
  code: 'M8.5 6.5 3 12l5.5 5.5M15.5 6.5 21 12l-5.5 5.5M13.6 4.2l-3.2 15.6',
  column: 'M12 2.5 22 8H2zM3.5 10.5h17M7 10.5v9M12 10.5v9M17 10.5v9M2.5 21.5h19',
  globe: 'M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 1 0 0-19M12 2.5a5 9.5 0 1 0 0 19 5 9.5 0 1 0 0-19M2.5 12h19M4.4 7h15.2M4.4 17h15.2',
  letter: 'M3.5 20.5 12 3l8.5 17.5M7 14.5h10',
  book: 'M12 6.5v14M12 6.5 8 4.5 3 5.5v13l5-.7 4 2.2M12 6.5l4-2 5 1v13l-5-.7-4 2.2',
  chart: 'M4 3v17.5h17M8 20.5v-6M12.5 20.5V10M17 20.5V6',
  palette: 'M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 1 0 0-19M8 8.5h.01M12 6.8h.01M16 8.4h.01M7.4 12.5h.01M14.8 14.4a2.1 2.1 0 1 0 0 .01',
  note: 'M8 19.5a3 2.4 0 1 0 0-4.8 3 2.4 0 1 0 0 4.8M11 17V3.5M11 3.5c3 1 5 2.5 5 5.5',
}

/** Локализованные подписи иконок — предмет, для которого иконка предлагается. */
export const COVER_ICON_LABELS: Record<string, Record<string, string>> = {
  sigma:   { ru: 'Математика',   en: 'Mathematics',      kk: 'Математика' },
  atom:    { ru: 'Физика',       en: 'Physics',          kk: 'Физика' },
  flask:   { ru: 'Химия',        en: 'Chemistry',        kk: 'Химия' },
  dna:     { ru: 'Биология',     en: 'Biology',          kk: 'Биология' },
  code:    { ru: 'Информатика',  en: 'Computer Science', kk: 'Информатика' },
  column:  { ru: 'История',      en: 'History',          kk: 'Тарих' },
  globe:   { ru: 'География',    en: 'Geography',        kk: 'География' },
  letter:  { ru: 'Языки',        en: 'Languages',        kk: 'Тілдер' },
  book:    { ru: 'Литература',   en: 'Literature',       kk: 'Әдебиет' },
  chart:   { ru: 'Экономика',    en: 'Economics',        kk: 'Экономика' },
  palette: { ru: 'Искусство',    en: 'Art',              kk: 'Өнер' },
  note:    { ru: 'Музыка',       en: 'Music',            kk: 'Музыка' },
}

/**
 * Запасной набор на случай, если запрос к /classes/cover/options не прошёл:
 * пикер обязан открыться и без сети. Значения совпадают с PALETTE
 * в services/cover_art.py.
 */
export const FALLBACK_COVER_OPTIONS: CoverOptions = {
  colors: [
    { id: 'blue',   hex: '#0A84FF', deep: '#0A2A5E' },
    { id: 'purple', hex: '#8B5CF6', deep: '#2B1857' },
    { id: 'green',  hex: '#22C55E', deep: '#0B3722' },
    { id: 'orange', hex: '#F97316', deep: '#54220A' },
    { id: 'red',    hex: '#EF4444', deep: '#511616' },
    { id: 'pink',   hex: '#EC4899', deep: '#4F1030' },
    { id: 'teal',   hex: '#00B1C9', deep: '#00303A' },
    { id: 'indigo', hex: '#6366F1', deep: '#1C1D52' },
  ],
  icons: Object.keys(COVER_ICON_PATHS).map((id) => ({ id, subject: id })),
  default_color: 'teal',
  default_icon: 'book',
  ai_available: true,
}

// Кэш на сессию: набор меняется только с деплоем бэкенда, дёргать его при
// каждом открытии формы создания предмета незачем.
const cached = ref<CoverOptions | null>(null)
let inflight: Promise<CoverOptions> | null = null

export const useCoverArt = () => {
  const api = useApi()

  const load = async (): Promise<CoverOptions> => {
    if (cached.value) return cached.value
    if (inflight) return inflight
    inflight = api.get('/classes/cover/options')
      .then(({ data }) => {
        // Пустой или обрезанный ответ (старый бэкенд, прокси) не должен
        // оставить пикер без единого варианта — тогда предмет вообще нельзя
        // было бы создать.
        const o = data as CoverOptions
        cached.value = o?.colors?.length && o?.icons?.length ? o : FALLBACK_COVER_OPTIONS
        return cached.value
      })
      .catch(() => FALLBACK_COVER_OPTIONS)
      .finally(() => { inflight = null })
    return inflight
  }

  const colorHex = (id?: string | null): string =>
    (cached.value || FALLBACK_COVER_OPTIONS).colors.find((c) => c.id === id)?.hex
    || FALLBACK_COVER_OPTIONS.colors.find((c) => c.id === id)?.hex
    || '#00B1C9'

  const colorDeep = (id?: string | null): string =>
    (cached.value || FALLBACK_COVER_OPTIONS).colors.find((c) => c.id === id)?.deep
    || FALLBACK_COVER_OPTIONS.colors.find((c) => c.id === id)?.deep
    || '#00303A'

  /** Градиент превью — тот же диагональный переход deep→hex, что рисует
   *  render_background() на бэкенде, чтобы выбор не обманывал ожидания. */
  const previewGradient = (color?: string | null) =>
    `linear-gradient(135deg, ${colorDeep(color)}, ${colorHex(color)})`

  const iconPath = (icon?: string | null) =>
    COVER_ICON_PATHS[icon || ''] || COVER_ICON_PATHS.book

  const iconLabel = (icon: string, lang: string) =>
    COVER_ICON_LABELS[icon]?.[lang] || COVER_ICON_LABELS[icon]?.en || icon

  return { options: cached, load, colorHex, colorDeep, previewGradient, iconPath, iconLabel }
}
