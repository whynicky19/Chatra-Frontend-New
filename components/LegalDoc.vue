<!--
  Общий макет юридического документа: политика конфиденциальности (privacy),
  условия использования (terms) и правила сообщества (rules).

  Раньше все три страницы несли собственную копию одной и той же разметки и
  ~110 строк одинакового CSS — правка стиля требовала трёх синхронных правок,
  и они уже начали расходиться. Здесь один источник правды.

  Оформление повторяет экран документа в приложении (lib/screens/legal/
  legal_doc_screen.dart): крупный заголовок, сворачивающийся в строку
  навигации, лид на тихой подложке и разделы карточками с волосяной рамкой.
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

        <div class="ld-langs">
          <button v-for="l in langs" :key="l.code" class="ld-lang"
                  :class="{ active: lang === l.code }" @click="setLang(l.code)">{{ l.label }}</button>
        </div>
      </div>
    </header>

    <div class="ld-container">
      <!-- Обложка -->
      <div class="ld-icon" aria-hidden="true"><slot name="icon" /></div>
      <h1 class="ld-title">{{ title }}</h1>

      <p v-if="updated" class="ld-updated">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
        </svg>
        {{ updatedLabel }}: {{ updated }}
      </p>

      <!-- Лид: своя тихая подложка — это явно не один из разделов ниже, но и
           не потерявшийся кусок текста, каким он выглядел раньше. -->
      <p v-if="intro" class="ld-lead">{{ intro }}</p>

      <!-- Разделы -->
      <section v-for="(s, i) in sections" :key="i" class="ld-card">
        <h2 class="ld-card-title">{{ s.t }}</h2>
        <p class="ld-card-body">{{ s.b }}</p>
      </section>

      <!-- Документ без разделов (правила сообщества) — сплошным текстом. -->
      <section v-if="body" class="ld-card">
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
  background: color-mix(in srgb, var(--bg) 80%, transparent);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom-color: var(--border);
}
.ld-nav-inner {
  max-width: 720px;
  margin: 0 auto;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 52px;
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

.ld-langs { display: flex; gap: 2px; flex: none; }
.ld-lang {
  border: none;
  background: transparent;
  color: var(--text4);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 9px;
  border-radius: 100px;
  cursor: pointer;
  transition: background .15s ease, color .15s ease;
}
.ld-lang.active { background: var(--teal); color: #fff; }

/* ── Содержимое ──────────────────────────────────────────────────────── */
.ld-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 8px 20px 72px;
}

.ld-icon {
  width: 52px; height: 52px;
  margin: 12px 0 16px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--teal) 12%, transparent);
  color: var(--teal);
}

/* Крупный текст: отрицательный трекинг и плотная интерлиньяж — по мере роста
   кегля буквы читаются слишком раскинутыми, а строки разъезжаются. */
.ld-title {
  margin: 0;
  font-size: clamp(30px, 6vw, 38px);
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
  margin: 12px 0 0;
  padding: 5px 11px;
  border-radius: 100px;
  background: var(--surface2);
  color: var(--text3);
  font-size: 13px;
  font-weight: 600;
}

.ld-lead {
  margin: 22px 0 0;
  padding: 16px 18px 18px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--teal) 7%, transparent);
  color: var(--text2);
  font-size: 17px;
  line-height: 1.55;
  letter-spacing: -0.2px;
  white-space: pre-line;
}

.ld-card {
  margin-top: 12px;
  padding: 16px 18px 18px;
  border-radius: 20px;
  background: var(--surface);
  /* Волосяная рамка вместо тени: сгруппированные списки iOS отделяются краем
     на общем фоне, а не «приподнятостью» материала. */
  border: 1px solid var(--border);
}
.ld-lead + .ld-card { margin-top: 22px; }

.ld-card-title {
  margin: 0 0 10px;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.4px;
  color: var(--text1);
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
  .ld-nav, .ld-nav-title, .ld-lang, .ld-back { transition: none; }
}

@media (max-width: 768px) {
  .ld-nav-inner, .ld-container { padding-left: 16px; padding-right: 16px; }
  /* Минимум 44px по HIG на любой тап-цели. */
  .ld-lang { padding: 12px 10px; }
}
</style>
