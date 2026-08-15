<!--
  Общий макет юридического документа: политика конфиденциальности (privacy),
  условия использования (terms) и правила сообщества (rules).

  Раньше все три страницы несли собственную копию одной и той же разметки и
  ~110 строк одинакового CSS — правка стиля требовала трёх синхронных правок,
  и они уже начали расходиться. Здесь один источник правды.

  Документ занимает всю ширину экрана, но текст внутри не растягивается в
  строки по 150 символов: разделы раскладываются в колонки по ~480px, то есть
  ширина используется под БОЛЬШЕ разделов на экране, а не под более длинные
  строки. Порядок чтения задаётся номером у каждого раздела.
-->
<template>
  <div ref="pageEl" class="ld-page" @scroll.passive="onScroll">
    <!-- Матовая строка навигации: контент проезжает ПОД ней, поэтому у стекла
         есть что размывать. Разделитель проявляется только когда под панель
         действительно заехал текст. -->
    <header class="ld-nav" :class="{ 'is-solid': collapsed }">
      <div class="ld-nav-inner">
        <button class="ld-back" @click="goBack">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>{{ backLabel }}</span>
        </button>

        <span class="ld-nav-title" :class="{ 'is-visible': collapsed }">{{ title }}</span>

        <!-- Тот же сегментный переключатель, что в настройках: один элемент
             управления не должен выглядеть на двух экранах по-разному. -->
        <div class="ld-seg" :style="{ '--i': langIndex }">
          <span class="ld-seg-thumb" aria-hidden="true"></span>
          <button v-for="l in langs" :key="l.code" type="button" class="ld-seg-btn"
                  :class="{ active: lang === l.code }" @click="setLang(l.code)">{{ l.label }}</button>
        </div>
      </div>
    </header>

    <div class="ld-container">
      <!-- Обложка -->
      <div class="ld-hero">
        <div class="ld-icon" aria-hidden="true"><slot name="icon" /></div>
        <div class="ld-hero-text">
          <h1 class="ld-title">{{ title }}</h1>
          <p v-if="updated" class="ld-updated">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
            </svg>
            {{ updatedLabel }}: {{ updated }}
          </p>
        </div>
      </div>

      <!-- Лид: своя тихая подложка — это явно не один из разделов ниже, но и
           не потерявшийся кусок текста, каким он выглядел раньше. -->
      <p v-if="intro" class="ld-lead">{{ intro }}</p>

      <!-- Разделы: колонками по ширине экрана, с номерами — иначе при двух-трёх
           колонках непонятно, что за чем читать. -->
      <div v-if="sections?.length" class="ld-grid">
        <section v-for="(s, i) in sections" :key="i" class="ld-card">
          <h2 class="ld-card-title">
            <span class="ld-num">{{ i + 1 }}</span>{{ s.t }}
          </h2>
          <p class="ld-card-body">{{ s.b }}</p>
        </section>
      </div>

      <!-- Документ без разделов (правила сообщества) — сплошным текстом. -->
      <section v-if="body" class="ld-card ld-card--solo">
        <p class="ld-card-body">{{ body }}</p>
      </section>

      <footer class="ld-footer">© {{ year }} Chatra</footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from '#app'
import { useI18n } from '~/composables/useI18n'

defineProps<{
  title: string
  updated?: string
  updatedLabel?: string
  intro?: string
  sections?: { t: string; b: string }[]
  body?: string
}>()

const { lang, setLang } = useI18n()
const router = useRouter()

const langs = [
  { code: 'ru' as const, label: 'RU' },
  { code: 'en' as const, label: 'EN' },
  { code: 'kk' as const, label: 'KZ' },
]
const langIndex = computed(() => Math.max(0, langs.findIndex(l => l.code === lang.value)))

const year = new Date().getFullYear()
const backLabel = computed(() =>
  lang.value === 'ru' ? 'Назад' : lang.value === 'kk' ? 'Артқа' : 'Back')

// Открыть могли откуда угодно (регистрация, логин, настройки, внешняя ссылка)
// — возвращаемся в историю браузера, а если её нет, уводим на главную, а не
// оставляем в тупике.
const goBack = () => {
  if (import.meta.client && window.history.length > 1) router.back()
  else router.push('/')
}

// Страница — собственный скролл-контейнер (см. .ld-page), поэтому слушаем
// её, а не window.
const pageEl = ref<HTMLElement | null>(null)
const collapsed = ref(false)
const onScroll = () => {
  const top = pageEl.value?.scrollTop ?? 0
  // Порог чуть меньше высоты блока с крупным заголовком: компактный
  // проявляется ровно тогда, когда крупный уходит за край.
  collapsed.value = top > 56
}
</script>

<style scoped>
/* #__nuxt фиксирован по высоте с overflow:hidden — страница должна быть
   собственным скролл-контейнером, иначе контент обрезается и не скроллится. */
.ld-page {
  /* Один просвет на все карточки — и между колонками, и между рядами, и между
     лидом и разделами. */
  --ld-gap: 16px;
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--bg);
  color: var(--text1);
  /* Системный шрифт платформы: в нём уже есть оптические размеры и таблицы
     трекинга, настроенные на разборчивость. */
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
}

/* ── Навигация ───────────────────────────────────────────────────────── */
.ld-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: background .22s ease, border-color .22s ease, backdrop-filter .22s ease;
}
.ld-nav.is-solid {
  background: color-mix(in srgb, var(--bg) 78%, transparent);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom-color: var(--border);
}
.ld-nav-inner {
  padding: 10px 32px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 54px;
}

.ld-back {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex: none;
  padding: 8px 8px 8px 0;
  background: none;
  border: none;
  color: var(--teal);
  font: inherit;
  font-size: 16px;
  letter-spacing: -0.3px;
  cursor: pointer;
  /* Отклик на нажатии, а не на отпускании — иначе кнопка ощущается мёртвой. */
  transition: opacity .1s ease;
}
.ld-back:active { opacity: .45; }

.ld-nav-title {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.4px;
  color: var(--text1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  transition: opacity .18s ease;
}
.ld-nav-title.is-visible { opacity: 1; }

/* ── Переключатель языка ─────────────────────────────────────────────── */
.ld-seg {
  position: relative;
  display: flex;
  flex: none;
  padding: 2px;
  border-radius: 9px;
  background: var(--bg2);
}
html.dark .ld-seg { background: var(--surface2); }
.ld-seg-thumb {
  position: absolute;
  top: 2px; bottom: 2px; left: 2px;
  width: calc((100% - 4px) / 3);
  border-radius: 7px;
  background: var(--surface);
  box-shadow: var(--sh-xs);
  transform: translateX(calc(var(--i) * 100%));
  transition: transform .34s cubic-bezier(.32,.72,0,1);
}
html.dark .ld-seg-thumb { background: var(--surface3); }
.ld-seg-btn {
  position: relative;
  z-index: 1;
  width: 40px;
  padding: 6px 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .02em;
  color: var(--text3);
  cursor: pointer;
  transition: color .2s ease, transform .18s cubic-bezier(.32,.72,0,1);
}
.ld-seg-btn.active { color: var(--text1); }
.ld-seg-btn:active { transform: scale(.93); }

/* ── Содержимое ──────────────────────────────────────────────────────── */
.ld-container { padding: 8px 32px 72px; }

.ld-hero {
  display: flex;
  align-items: center;
  gap: 18px;
  margin: 12px 0 22px;
}
.ld-icon {
  width: 56px; height: 56px;
  flex: none;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--teal) 12%, transparent);
  color: var(--teal);
}
.ld-hero-text { min-width: 0; }

/* Крупный текст: отрицательный трекинг и плотная интерлиньяж — по мере роста
   кегля буквы читаются слишком раскинутыми, а строки разъезжаются. */
.ld-title {
  margin: 0;
  font-size: clamp(30px, 5vw, 40px);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.03em;
}

/* Мелкий текст — трекинг около нуля: сжимать его, как заголовок, значит
   ухудшить разборчивость. */
.ld-updated {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin: 10px 0 0;
  padding: 5px 11px;
  border-radius: 100px;
  background: var(--surface2);
  color: var(--text3);
  font-size: 13px;
  font-weight: 600;
}

.ld-lead {
  margin: 0 0 var(--ld-gap);
  padding: 18px 22px 20px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--teal) 7%, transparent);
  color: var(--text2);
  font-size: 17px;
  line-height: 1.55;
  letter-spacing: -0.2px;
  white-space: pre-line;
}

/* Колонка ~480px — компромисс между «занять весь экран» и строкой длиннее
   75 символов, которую глаз теряет при переносе. На 1440 выходит 2 колонки,
   на 1920 — 3, на планшете — одна.
   align-items оставлен по умолчанию (stretch): при align-items:start карточки
   в ряду сохраняли собственную высоту, и от короткой карточки до следующего
   ряда оставался отступ втрое больше, чем от длинной — сетка выглядела
   рваной. Теперь ряд выравнивается по высоте и все просветы равны --ld-gap. */
.ld-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 480px), 1fr));
  gap: var(--ld-gap);
}

.ld-card {
  padding: 18px 22px 20px;
  border-radius: 20px;
  background: var(--surface);
  /* Волосяная рамка вместо тени: сгруппированные списки iOS отделяются краем
     на общем фоне, а не «приподнятостью» материала. */
  border: 1px solid var(--border);
}
/* Документ без разделов идёт одной карточкой во всю ширину. */
.ld-grid + .ld-card--solo { margin-top: var(--ld-gap); }

.ld-card-title {
  display: flex;
  align-items: baseline;
  gap: 9px;
  margin: 0 0 10px;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.4px;
  color: var(--text1);
}
/* Номер задаёт порядок чтения, когда разделы стоят в несколько колонок. */
.ld-num {
  flex: none;
  min-width: 22px;
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--teal);
}
/* pre-line — в тексте разделов есть абзацы и списки, разделённые \n. */
.ld-card-body {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  letter-spacing: -0.2px;
  color: var(--text2);
  white-space: pre-line;
}

.ld-footer {
  text-align: center;
  color: var(--text4);
  font-size: 13px;
  margin-top: 36px;
}

/* ── Доступность ─────────────────────────────────────────────────────── */
/* Тема на сайте переключается классом html.dark, а не системной настройкой.
   Раньше здесь стоял @media (prefers-color-scheme: dark), из-за чего у
   пользователя со светлой темой в приложении и тёмной в системе юридические
   страницы всё равно открывались тёмными. Токены var(--*) уже переопределены
   в html.dark, поэтому собственных правил тут больше не нужно. */

@media (prefers-reduced-transparency: reduce) {
  .ld-nav.is-solid {
    background: var(--bg);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

@media (prefers-contrast: more) {
  .ld-card { border-color: var(--border2); }
  .ld-lead { border: 1px solid var(--border2); }
}

@media (prefers-reduced-motion: reduce) {
  .ld-nav, .ld-nav-title, .ld-seg-btn, .ld-back { transition: none; }
}

@media (max-width: 768px) {
  .ld-nav-inner { padding-left: 16px; padding-right: 16px; }
  .ld-container { padding-left: 16px; padding-right: 16px; }
  /* На узком экране заголовок переносится, и иконка, выровненная по центру
     двух строк, повисает сбоку буквой «Г» — поэтому здесь она встаёт над
     заголовком. */
  .ld-hero { flex-direction: column; align-items: flex-start; gap: 12px; margin-bottom: 18px; }
  .ld-icon { width: 48px; height: 48px; border-radius: 14px; }
  .ld-lead, .ld-card { padding: 16px 18px 18px; }
  /* Минимум 44px по HIG на любой тап-цели. */
  .ld-seg-btn { width: 42px; padding: 11px 0; }
}
</style>
