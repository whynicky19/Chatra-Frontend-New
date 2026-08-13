/**
 * Оформление обложек предметов: палитра, предметные иконки и локальное превью.
 *
 * Единственный источник правды по набору цветов и иконок — бэкенд
 * (GET /classes/cover/options, см. services/cover_art.py): он же рисует
 * готовую обложку, и разъехавшийся набор означал бы, что пользователь
 * выбирает вариант, которого сервер не знает. Здесь набор только
 * кэшируется на время сессии + лежат SVG-глифы для превью и пикера.
 *
 * Иконка НЕ входит в сохранённую картинку: бэкенд генерирует только пастельный
 * фон и специально оставляет центр кадра чистым. Рисует иконку
 * components/classes/SubjectCover.vue — он и есть единственное место, где
 * обложка собирается для показа.
 */
import { ref } from 'vue'
import { useApi } from '~/services/api'

export interface CoverColorOption {
  id: string
  /** Акцент бренда: свотч в пикере и подсветка выбора. */
  hex: string
  /** Основной насыщенный тон композиции — из него строится превью до генерации. */
  base: string
  /** Тон иконки, когда она рисуется в цвет (подсветка выбора в пикере). */
  ink: string
}
export interface CoverIconOption {
  id: string
  subject: string
  /** Секция пикера, см. ICON_GROUPS на бэкенде. Пусто у старого ответа. */
  group?: string
  group_label?: string
}
export interface CoverIconGroup { id: string; label: string }
export interface CoverOptions {
  colors: CoverColorOption[]
  icons: CoverIconOption[]
  /** Порядок секций пикера. Пусто — рисуем плоский список, как раньше. */
  groups?: CoverIconGroup[]
  default_color: string
  default_icon: string
  ai_available: boolean
}

/**
 * Глифы предметных иконок в viewBox 24×24, обводкой (fill="none").
 *
 * Набор обязан покрывать ВСЕ id из ICONS в services/cover_art.py: неизвестный
 * id молча падает в «книгу» (см. iconPath), и пикер превращается в две страницы
 * одинаковых книжек — так это и выглядело, пока набор на бэкенде расширили, а
 * здесь нет. Добавили символ на бэкенде — добавьте глиф сюда.
 */
export const COVER_ICON_PATHS: Record<string, string> = {
  // ── Точные науки ──────────────────────────────────────────────────────
  sigma: 'M18.5 4.5H6l7 7.5-7 7.5h12.5',
  cube: 'M12 2.5 21 7.5v9L12 21.5 3 16.5v-9zM3 7.5l9 5 9-5M12 12.5v9',
  dice: 'M4.5 4.5h15v15h-15zM9 9h.01M15 9h.01M9 15h.01M15 15h.01M12 12h.01',

  // ── Естественные науки ────────────────────────────────────────────────
  atom: 'M12 12m-1.6 0a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0'
    + ' M12 12m-10.5 0a10.5 4.6 0 1 0 21 0a10.5 4.6 0 1 0 -21 0',
  flask: 'M9 2.5h6M10 2.5v6.5L3.5 21h17L14 9V2.5',
  dna: 'M8.6 3c0 6 6.8 12 6.8 18M15.4 3c0 6-6.8 12-6.8 18M9.6 7h4.8M8.2 10.5h7.6M8.2 13.5h7.6M9.6 17h4.8',
  microscope: 'M9.5 3.5h3.5v8.5h-3.5zM11.2 12v2.5M7 14.5h8.5M4.5 21.5h15M7.5 21.5a4.5 4.5 0 0 1 4.5-4.5h.8a5.2 5.2 0 0 0 5.2-5.2V9.5',
  leaf: 'M4 20c0-9.5 6.6-15.5 16-15.5C20 14 13.8 20 4 20zM4 20c4-6 8-9.2 12-10.6',
  telescope: 'M3.5 13.5 14.5 4.5l3.5 4-11 9zM7 17l-2.5 4.5M12.5 12.5 16 21.5M2.5 11.5l2 2.5',
  globe: 'M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 1 0 0-19M12 2.5a5 9.5 0 1 0 0 19 5 9.5 0 1 0 0-19M2.5 12h19M4.4 7h15.2M4.4 17h15.2',

  // ── Технологии и инженерия ────────────────────────────────────────────
  code: 'M8.5 6.5 3 12l5.5 5.5M15.5 6.5 21 12l-5.5 5.5M13.6 4.2l-3.2 15.6',
  browser: 'M3 5.5h18v13H3zM3 9.5h18M6 7.5h.01M8.5 7.5h.01M11 7.5h.01',
  database: 'M12 3.5c4.4 0 8 1.2 8 2.75S16.4 9 12 9 4 7.8 4 6.25 7.6 3.5 12 3.5zM4 6.25v11.5c0 1.55 3.6 2.75 8 2.75s8-1.2 8-2.75V6.25M4 12c0 1.55 3.6 2.75 8 2.75s8-1.2 8-2.75',
  network: 'M12 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5M5.5 15.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5M18.5 15.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5M10.4 7.9 7.6 15.1M13.6 7.9l2.8 7.2M8 18h8',
  shield: 'M12 2.5 4.5 5.5v6c0 4.6 3.1 8.3 7.5 10 4.4-1.7 7.5-5.4 7.5-10v-6zM9.3 12.2l1.9 1.9 3.5-3.9',
  chip: 'M4.5 4.5h15v15h-15zM8.5 8.5h7v7h-7zM9.5 4.5V2M14.5 4.5V2M9.5 22v-2.5M14.5 22v-2.5M4.5 9.5H2M4.5 14.5H2M22 9.5h-2.5M22 14.5h-2.5',
  gear: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 1 0 0-7M12 5.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 1 0 0-13M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M5.2 18.8l2.1-2.1M16.7 7.3l2.1-2.1',
  compass: 'M12 2.8a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 1 0 0-3.6M11.1 6.3 6.4 18M12.9 6.3 17.6 18M6.4 18l-1.2 3.2M17.6 18l1.2 3.2M7.4 14.6a9.5 9.5 0 0 0 9.2 0',
  building: 'M4 21.5V7.5l8-5 8 5v14M3 21.5h18M9.5 21.5v-5h5v5M7.5 10.5h2M14.5 10.5h2M7.5 14h2M14.5 14h2',

  // ── Гуманитарные ──────────────────────────────────────────────────────
  column: 'M12 2.5 22 8H2zM3.5 10.5h17M7 10.5v9M12 10.5v9M17 10.5v9M2.5 21.5h19',
  scroll: 'M8 3.5h9.5a2 2 0 0 1 2 2v12.5a2.5 2.5 0 0 1-2.5 2.5H7a2.5 2.5 0 0 1-2.5-2.5V16H8M8 3.5a2 2 0 0 0-2 2V16M11 8h5.5M11 12h5.5',
  book: 'M12 6.5v14M12 6.5 8 4.5 3 5.5v13l5-.7 4 2.2M12 6.5l4-2 5 1v13l-5-.7-4 2.2',
  brain: 'M12 4.6a3.3 3.3 0 0 0-6 1.7A2.9 2.9 0 0 0 4.2 9a2.9 2.9 0 0 0 1.1 2.3 3 3 0 0 0 1.4 5.2A3.1 3.1 0 0 0 12 18.2zM12 4.6a3.3 3.3 0 0 1 6 1.7A2.9 2.9 0 0 1 19.8 9a2.9 2.9 0 0 1-1.1 2.3 3 3 0 0 1-1.4 5.2A3.1 3.1 0 0 1 12 18.2zM12 4.6v13.6',
  people: 'M9 11a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 1 0 0 6.4M2.5 20.5v-1.2c0-2.9 2.9-5.3 6.5-5.3s6.5 2.4 6.5 5.3v1.2M16.3 5.3a3.2 3.2 0 0 1 0 6M18 14.4c2 .8 3.5 2.6 3.5 4.9v1.2',

  // ── Языки ─────────────────────────────────────────────────────────────
  letter: 'M3.5 20.5 12 3l8.5 17.5M7 14.5h10',
  chat: 'M20.5 15.5a1.5 1.5 0 0 1-1.5 1.5H8l-4 3.5V6.5A1.5 1.5 0 0 1 5.5 5H19a1.5 1.5 0 0 1 1.5 1.5zM8 9h8M8 12.5h5',

  // ── Экономика и право ─────────────────────────────────────────────────
  chart: 'M4 3v17.5h17M8 20.5v-6M12.5 20.5V10M17 20.5V6',
  coins: 'M9 4.5a5 5 0 1 0 0 10 5 5 0 1 0 0-10M15 9.5a5 5 0 1 0 0 10 5 5 0 1 0 0-10M9 6.8v5.4M7.7 8.3h2.2M7.8 10.7h2.2',
  briefcase: 'M3.5 8.5h17v11h-17zM9 8.5V6.2a1.6 1.6 0 0 1 1.6-1.7h2.8A1.6 1.6 0 0 1 15 6.2v2.3M3.5 13.5h17M10.5 13.5h3',
  scale: 'M12 3.5v17M7.5 20.5h9M4.5 7.5h15M12 7.5V4.8M6.5 7.5 3.5 14h6zM17.5 7.5 14.5 14h6z',

  // ── Искусство и медиа ─────────────────────────────────────────────────
  palette: 'M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 2.1-.9 2.1-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2A4.4 4.4 0 0 0 21.5 9c-.6-3.2-4.4-5.5-9.5-5.5zM7.6 8.6h.01M11.6 6.6h.01M15.6 8.1h.01M6.6 12.6h.01',
  pen: 'M3 21l1-3.7L15.5 5.8l2.7 2.7L6.7 20zM14 7.3l2.7 2.7M18.2 3.1l2.7 2.7-2.4 2.4-2.7-2.7z',
  note: 'M8 19.5a3 2.4 0 1 0 0-4.8 3 2.4 0 1 0 0 4.8M11 17V3.5M11 3.5c3 1 5 2.5 5 5.5',
  camera: 'M3.5 7.5H7l1.8-2.5h6.4L17 7.5h3.5v12h-17zM12 17a4 4 0 1 0 0-8 4 4 0 1 0 0 8',
  mic: 'M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3M6 11v1a6 6 0 0 0 12 0v-1M12 18v3M9 21.5h6',

  // ── Медицина ──────────────────────────────────────────────────────────
  pulse: 'M12 20.5S3.5 15.2 3.5 9.4A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.8c0 5.8-8.5 11.1-8.5 11.1zM6.6 11.4h2.6l1.4-2.6 2 4.6 1.4-2h3.4',
  stethoscope: 'M6 3.5v4a4.5 4.5 0 0 0 9 0v-4M4.5 3.5h3M13.5 3.5h3M10.5 12v2.2a4.3 4.3 0 0 0 8.6 0v-1.4M19.1 8.4a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 1 0 0-4.4',
  pill: 'M8.5 5.5h7a5.5 5.5 0 0 1 0 11h-7a5.5 5.5 0 0 1 0-11M12 5.5v11',

  // ── Прикладные и профессии ────────────────────────────────────────────
  wrench: 'M15.5 3.5a5 5 0 0 0-6.3 6.3L3.6 15.4a2.1 2.1 0 0 0 3 3l5.6-5.6a5 5 0 0 0 6.3-6.3l-2.9 2.9-2.9-.7-.7-2.9z',
  chef: 'M6.5 16.5h11v4h-11zM6.5 16.5a4 4 0 1 1 1.7-7.6A4.2 4.2 0 0 1 12 5.5a4.2 4.2 0 0 1 3.8 3.4 4 4 0 1 1 1.7 7.6M9.5 16.5v-4M14.5 16.5v-4',
  scissors: 'M6 4.5 18 17M18 4.5 6 17M6.5 20.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 1 0 0 5M17.5 20.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 1 0 0 5',
  car: 'M2.5 16.5h19v-4l-2-.6-2.2-4.1a2 2 0 0 0-1.8-1.1h-7a2 2 0 0 0-1.8 1.1L4.5 11.9l-2 .6zM7 11.9h10M4.5 16.5v3h3v-3M16.5 16.5v3h3v-3M6.5 14.2h.01M17.5 14.2h.01',
  plane: 'M12 2.5c1.1 0 1.9 1.2 1.9 2.8v3.9l7.6 4.4v2.4l-7.6-2.2v3.8l2.4 1.8v1.6L12 20l-4.3 1v-1.6l2.4-1.8v-3.8L2.5 16v-2.4l7.6-4.4V5.3c0-1.6.8-2.8 1.9-2.8z',
  sprout: 'M12 20.5v-8M12 12.5c0-3.6-2.6-6.2-6.2-6.2 0 3.6 2.6 6.2 6.2 6.2M12 12.5c0-3 2.2-5.5 5.2-5.5 0 3-2.2 5.5-5.2 5.5M8 20.5h8',

  // ── Спорт ─────────────────────────────────────────────────────────────
  ball: 'M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 1 0 0-19M12 7.4l4.4 3.2-1.7 5.2H9.3l-1.7-5.2zM12 2.5v4.9M16.4 10.6 21 9.1M14.7 15.8l2.9 3.9M9.3 15.8l-2.9 3.9M7.6 10.6 3 9.1',
}

/** Локализованные подписи иконок — предмет, для которого иконка предлагается. */
export const COVER_ICON_LABELS: Record<string, Record<string, string>> = {
  sigma:       { ru: 'Математика',      en: 'Mathematics',      kk: 'Математика' },
  cube:        { ru: 'Геометрия',       en: 'Geometry',         kk: 'Геометрия' },
  dice:        { ru: 'Статистика',      en: 'Statistics',       kk: 'Статистика' },
  atom:        { ru: 'Физика',          en: 'Physics',          kk: 'Физика' },
  flask:       { ru: 'Химия',           en: 'Chemistry',        kk: 'Химия' },
  dna:         { ru: 'Биология',        en: 'Biology',          kk: 'Биология' },
  microscope:  { ru: 'Микробиология',   en: 'Microbiology',     kk: 'Микробиология' },
  leaf:        { ru: 'Экология',        en: 'Ecology',          kk: 'Экология' },
  telescope:   { ru: 'Астрономия',      en: 'Astronomy',        kk: 'Астрономия' },
  globe:       { ru: 'География',       en: 'Geography',        kk: 'География' },
  code:        { ru: 'Программирование', en: 'Programming',     kk: 'Бағдарламалау' },
  browser:     { ru: 'Веб-разработка',  en: 'Web Development',  kk: 'Веб-әзірлеу' },
  database:    { ru: 'Базы данных',     en: 'Databases',        kk: 'Дерекқорлар' },
  network:     { ru: 'Сети',            en: 'Networks',         kk: 'Желілер' },
  shield:      { ru: 'Кибербезопасность', en: 'Cybersecurity',  kk: 'Киберқауіпсіздік' },
  chip:        { ru: 'Электроника',     en: 'Electronics',      kk: 'Электроника' },
  gear:        { ru: 'Механика',        en: 'Mechanical Eng.',  kk: 'Механика' },
  compass:     { ru: 'Архитектура',     en: 'Architecture',     kk: 'Сәулет' },
  building:    { ru: 'Строительство',   en: 'Construction',     kk: 'Құрылыс' },
  column:      { ru: 'История',         en: 'History',          kk: 'Тарих' },
  scroll:      { ru: 'Философия',       en: 'Philosophy',       kk: 'Философия' },
  book:        { ru: 'Литература',      en: 'Literature',       kk: 'Әдебиет' },
  brain:       { ru: 'Психология',      en: 'Psychology',       kk: 'Психология' },
  people:      { ru: 'Обществознание',  en: 'Social Studies',   kk: 'Қоғамтану' },
  letter:      { ru: 'Языки',           en: 'Languages',        kk: 'Тілдер' },
  chat:        { ru: 'Речь и общение',  en: 'Communication',    kk: 'Сөйлеу мәдениеті' },
  chart:       { ru: 'Экономика',       en: 'Economics',        kk: 'Экономика' },
  coins:       { ru: 'Финансы',         en: 'Finance',          kk: 'Қаржы' },
  briefcase:   { ru: 'Менеджмент',      en: 'Management',       kk: 'Менеджмент' },
  scale:       { ru: 'Право',           en: 'Law',              kk: 'Құқық' },
  palette:     { ru: 'Искусство',       en: 'Art',              kk: 'Өнер' },
  pen:         { ru: 'Графический дизайн', en: 'Graphic Design', kk: 'Графикалық дизайн' },
  note:        { ru: 'Музыка',          en: 'Music',            kk: 'Музыка' },
  camera:      { ru: 'Фотография',      en: 'Photography',      kk: 'Фотография' },
  mic:         { ru: 'Журналистика',    en: 'Journalism',       kk: 'Журналистика' },
  pulse:       { ru: 'Медицина',        en: 'Medicine',         kk: 'Медицина' },
  stethoscope: { ru: 'Сестринское дело', en: 'Nursing',         kk: 'Мейіргер ісі' },
  pill:        { ru: 'Фармация',        en: 'Pharmacy',         kk: 'Фармация' },
  wrench:      { ru: 'Технология',      en: 'Technology',       kk: 'Технология' },
  chef:        { ru: 'Кулинария',       en: 'Culinary Arts',    kk: 'Аспаздық' },
  scissors:    { ru: 'Швейное дело',    en: 'Fashion & Sewing', kk: 'Тігін ісі' },
  car:         { ru: 'Автодело',        en: 'Automotive',       kk: 'Автоісі' },
  plane:       { ru: 'Авиация',         en: 'Aviation',         kk: 'Авиация' },
  sprout:      { ru: 'Агрономия',       en: 'Agriculture',      kk: 'Агрономия' },
  ball:        { ru: 'Физкультура',     en: 'Physical Education', kk: 'Дене шынықтыру' },
}

/**
 * Локализованные подписи секций пикера. Бэкенд присылает английские
 * (group_label) — их и показываем, если ключ вдруг незнакомый.
 */
export const COVER_GROUP_LABELS: Record<string, Record<string, string>> = {
  exact:      { ru: 'Точные науки',       en: 'Exact sciences',   kk: 'Нақты ғылымдар' },
  natural:    { ru: 'Естественные науки', en: 'Natural sciences', kk: 'Жаратылыстану' },
  tech:       { ru: 'IT и инженерия',     en: 'Technology',       kk: 'IT және инженерия' },
  humanities: { ru: 'Гуманитарные',       en: 'Humanities',       kk: 'Гуманитарлық' },
  language:   { ru: 'Языки',              en: 'Languages',        kk: 'Тілдер' },
  business:   { ru: 'Экономика и право',  en: 'Business & law',   kk: 'Экономика және құқық' },
  arts:       { ru: 'Искусство и медиа',  en: 'Arts & media',     kk: 'Өнер және медиа' },
  health:     { ru: 'Медицина',           en: 'Health',           kk: 'Медицина' },
  applied:    { ru: 'Прикладные',         en: 'Applied',          kk: 'Қолданбалы' },
  sport:      { ru: 'Спорт',              en: 'Sport',            kk: 'Спорт' },
}

/**
 * Запасной набор на случай, если запрос к /classes/cover/options не прошёл:
 * пикер обязан открыться и без сети. Значения совпадают с PALETTE
 * в services/cover_art.py.
 */
export const FALLBACK_COVER_OPTIONS: CoverOptions = {
  colors: [
    { id: 'blue',   hex: '#0A84FF', base: '#3B82F6', ink: '#1D4ED8' },
    { id: 'purple', hex: '#8B5CF6', base: '#7C5CE6', ink: '#6D28D9' },
    { id: 'green',  hex: '#22C55E', base: '#12A970', ink: '#047857' },
    { id: 'orange', hex: '#F97316', base: '#F4842B', ink: '#C2410C' },
    { id: 'red',    hex: '#EF4444', base: '#E4534F', ink: '#B91C1C' },
    { id: 'pink',   hex: '#EC4899', base: '#E8559C', ink: '#BE185D' },
    { id: 'teal',   hex: '#00B1C9', base: '#12A2B5', ink: '#0E7490' },
    { id: 'indigo', hex: '#6366F1', base: '#5A5FE0', ink: '#4338CA' },
    { id: 'gold',   hex: '#EAB308', base: '#B38C22', ink: '#854D0E' },
    { id: 'lime',   hex: '#84CC16', base: '#6FA81B', ink: '#3F6212' },
    { id: 'bronze', hex: '#C2763A', base: '#B4703C', ink: '#7C2D12' },
    { id: 'slate',  hex: '#7C8BA5', base: '#64748B', ink: '#334155' },
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

  const colorBase = (id?: string | null): string =>
    (cached.value || FALLBACK_COVER_OPTIONS).colors.find((c) => c.id === id)?.base
    || FALLBACK_COVER_OPTIONS.colors.find((c) => c.id === id)?.base
    || '#12A2B5'

  /** Тон иконки, когда она рисуется в цвет. Сейчас на обложке глиф белый
 *  (композиция насыщенная, см. ICON_ON_ARTWORK) — значение нужно пикеру. */
  const colorInk = (id?: string | null): string =>
    (cached.value || FALLBACK_COVER_OPTIONS).colors.find((c) => c.id === id)?.ink
    || FALLBACK_COVER_OPTIONS.colors.find((c) => c.id === id)?.ink
    || '#0E7490'

  /** Подложка превью — та же светлая пастель, что и фон обложки
   *  (render_background() на бэкенде): выбор цвета не должен обманывать
   *  ожидания. */
  const previewBackground = (color?: string | null) => colorBase(color)

  const iconPath = (icon?: string | null) =>
    COVER_ICON_PATHS[icon || ''] || COVER_ICON_PATHS.book

  const iconLabel = (icon: string, lang: string) =>
    COVER_ICON_LABELS[icon]?.[lang] || COVER_ICON_LABELS[icon]?.en || icon

  /** Подпись секции: свой перевод, иначе английская с бэкенда. */
  const groupLabel = (group: string, lang: string, fallback = '') =>
    COVER_GROUP_LABELS[group]?.[lang] || COVER_GROUP_LABELS[group]?.en || fallback || group

  return {
    options: cached, load, colorHex, colorBase, colorInk, previewBackground,
    iconPath, iconLabel, groupLabel,
  }
}
