<template>
  <div class="class-ai">

    <!-- ── Floating actions — no header bar, no divider under the cover ── -->
    <div class="ai-floating-actions">
      <button v-if="isTeacher && pendingSubs.length" class="hdr-btn" :class="{ 'hdr-btn-active': showSidebar }" @click="showSidebar = !showSidebar" title="Работы на проверку">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        <span class="hdr-badge">{{ pendingSubs.length }}</span>
      </button>
      <button class="hdr-btn" @click="clearAll" title="Очистить чат">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
      </button>
    </div>

    <div class="ai-body">

      <!-- ── Sidebar (teacher tool: grading pending submissions) ── -->
      <div v-if="showSidebar && isTeacher && pendingSubs.length" class="ai-sidebar">
        <div class="sb-section">
          <div class="sb-section-title">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            Работы на проверку ({{ pendingSubs.length }})
          </div>
          <div class="sb-sub-list">
            <div v-for="s in pendingSubs" :key="s.id" class="sb-sub">
              <div class="sb-sub-info">
                <span class="sb-sub-name">{{ getStudentName(s.student_id) }}</span>
                <div class="sb-sub-tags">
                  <span v-if="s.text_content" class="sub-chip">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/></svg>
                    текст
                  </span>
                  <span v-if="s.file_url" class="sub-chip"><span class="ftb ftb-sm">{{ emoji(s.file_url) }}</span> файл</span>
                </div>
              </div>
              <button class="grade-btn" :disabled="gradingId === s.id" @click="gradeOne(s)">
                <div v-if="gradingId === s.id" class="spin-xs white"></div>
                <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                {{ gradingId === s.id ? '...' : 'Проверить' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Messages ── -->
      <div ref="msgsEl" class="ai-msgs" @scroll="onAiMsgsScroll">
        <div v-if="!msgs.length" class="welcome">
          <div class="welcome-title">Готов помочь!</div>
          <div class="welcome-desc">Задайте вопрос по теме курса</div>
          <div class="quick-grid">
            <button v-for="q in quickItems" :key="q.t" class="quick-btn" @click="pushSend(q.p)">
              <svg v-if="q.i==='book'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
              <svg v-else-if="q.i==='key'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
              <svg v-else-if="q.i==='task'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1" ry="1"/></svg>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ q.t }}
            </button>
          </div>
        </div>

        <template v-else>
          <div v-for="m in msgs" :key="m.id" :class="['msg-row', m.role]">
            <div v-if="m.role==='assistant'" class="msg-sender">Chatra AI</div>
            <div class="msg-bubble" v-html="fmt(m.text)"></div>
          </div>
          <div v-if="loading" class="msg-row assistant">
            <div class="msg-sender">Chatra AI</div>
            <div class="msg-bubble typing-bbl"><span></span><span></span><span></span></div>
          </div>
        </template>
      </div>
    </div>

    <!-- ── Input ── -->
    <AiLimitNotice v-if="aiLimitReached" :quota="aiQuota.quota.value"/>

    <div class="ai-input-bar">
      <AutoTextarea ref="inputEl" v-model="inputTxt" class="ai-textarea"
        :placeholder="aiLimitReached ? 'Лимит исчерпан' : 'Спросите Chatra AI'"
        :max-height="140" submit-on-enter :disabled="aiLimitReached" @submit="send" />
      <button :class="['send-btn', { locked: aiLimitReached }]" :disabled="!inputTxt.trim() || loading || aiLimitReached" @click="send">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import katex from 'katex'
import { useAuthStore } from '~/stores/auth.store'
import { useAssignmentsSvc } from '~/services/assignments'
import { useUsersSvc } from '~/services/users'
import { useToast } from '~/composables/useToast'
import { parseUtc } from '~/composables/useDeadline'
import { useApi } from '~/services/api'
import { useAiQuota } from '~/composables/useAiQuota'
import type { Submission } from '~/services/assignments'

// ── Props ────────────────────────────────────────────────────────────────────
const props = defineProps<{
  className?: string
  classPosts?: any[]
  classId?: number
  isTeacher?: boolean
  assignmentId?: number
  assignments?: any[]   // Assignment objects with description containing file URLs
}>()

// Сообщения листаются внутри своего собственного контейнера (не через
// tab-content), поэтому обложка класса наверху слушает это событие отдельно,
// чтобы точно так же плавно скрываться при скролле чата.
//
// Схлопывание завязано на фактический скролл (scrollTop > 24) ИЛИ на сам факт
// наличия сообщений: при малом числе сообщений контент не переполняет
// контейнер (scrollHeight === clientHeight), скролл физически невозможен,
// 'scroll' не срабатывает — без проверки msgs.length обложка и правая
// панель оставались бы развёрнутыми даже посреди активного диалога.
const emit = defineEmits<{ (e: 'scroll-state', collapsed: boolean): void }>()
const onAiMsgsScroll = (e: Event) => {
  emit('scroll-state', msgs.value.length > 0 || (e.target as HTMLElement).scrollTop > 24)
}

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_CHARS = 14000  // max chars per file in context

// ── Dependencies ──────────────────────────────────────────────────────────────
const auth = useAuthStore()
const svc = useAssignmentsSvc()
const usersSvc = useUsersSvc()
const toast = useToast()
const api = useApi()
const aiQuota = useAiQuota()
const aiLimitReached = computed(() => aiQuota.aiLimitReached.value)
const aiLimit = computed(() => aiQuota.aiLimit.value)

const studentMap = ref<Record<number, string>>({})

// ── State ─────────────────────────────────────────────────────────────────────
interface Msg { id: number; role: 'user' | 'assistant'; text: string }

const msgs = ref<Msg[]>([])
const loading = ref(false)
const inputTxt = ref('')
const showSidebar = ref(false)
const msgsEl = ref<HTMLElement>()
const inputEl = ref<{ focus: () => void } | null>(null)
const pendingSubs = ref<Submission[]>([])
const gradingId = ref<number | null>(null)
let nextId = 0

// ── Session persistence ────────────────────────────────────────────────────────
const storageKey = computed(() => `ai_chat_class_${props.classId ?? 'x'}`)

const persist = () => {
  try { sessionStorage.setItem(storageKey.value, JSON.stringify(msgs.value.slice(-60))) } catch {}
}
const restore = () => {
  try {
    const s = sessionStorage.getItem(storageKey.value)
    if (!s) return
    const arr = JSON.parse(s)
    if (Array.isArray(arr) && arr.length) {
      msgs.value = arr
      nextId = Math.max(...arr.map((m: Msg) => m.id), 0)
    }
  } catch {}
}

// ── Computed ──────────────────────────────────────────────────────────────────
// Лекции класса в порядке "1, 2, 3..." — posts.position с бэкенда (см.
// migrations/017), с fallback на id для лекций без position (старые записи).
// Номер нужен, чтобы AI мог связать "объясни 2 лекцию" с конкретным постом.
const cleanLectureTitle = (t: string) => (t || '').replace(/^\[LECTURE\]\[\d+\]\s*/, '').trim()
const numberedLectures = computed(() => {
  return (props.classPosts || [])
    .filter(p => p.title?.startsWith('[LECTURE]'))
    .slice()
    .sort((a, b) => {
      // NULLS FIRST, а не LAST: лекции без position (созданные до введения
      // нумерации) хронологически ВСЕГДА раньше уже пронумерованных — см.
      // тот же выбор и обоснование на бэкенде, crud/posts.py:56-66
      // (Posts.position.asc().nulls_first()). Раньше здесь стояло `??
      // Infinity`, кладущее лекции без position в КОНЕЦ — сайт и бэкенд
      // присваивали лекциям разные номера, и "объясни 2 лекцию" на сайте
      // мог означать совсем другой пост, чем в приложении.
      const pa = a.position ?? -Infinity, pb = b.position ?? -Infinity
      if (pa !== pb) return pa - pb
      return (a.id ?? 0) - (b.id ?? 0)
    })
    .map((post, i) => ({ post, number: i + 1, title: cleanLectureTitle(post.title) }))
})

// Текст самих лекций (поле content/description в JSON-теле поста) — раньше
// сюда попадали только URL прикреплённых файлов, а собственный текст лекции
// (если преподаватель написал его без вложений) модель вообще не видела.
const lectureTextBlocks = computed(() => {
  const blocks: string[] = []
  for (const { post, number, title } of numberedLectures.value) {
    let content = ''
    try {
      const b = JSON.parse(post.body || '{}')
      content = (b.content ?? b.description ?? '').toString()
    } catch { content = post.body || '' }
    content = content.replace(/\n{3,}/g, '\n\n').trim()
    if (!content) continue
    blocks.push(`### Лекция ${number}${title ? `: ${title}` : ''}\n${content.slice(0, MAX_CHARS)}`)
  }
  return blocks
})

const quickItems = [
  { i: 'book', t: 'Объясни материал', p: 'Подробно объясни основные темы и содержание материалов этого класса. Опирайся на прикреплённые файлы.' },
  { i: 'key', t: 'Ключевые понятия', p: 'Выдели и объясни все ключевые понятия и термины из материалов класса.' },
  { i: 'task', t: 'Помощь с заданием', p: 'Объясни требования к заданию. Что важно учесть? На что обратить внимание?' },
  { i: 'help', t: 'Частые ошибки', p: 'Какие типичные ошибки допускают по данной теме и как их избежать?' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
const getStudentName = (id: number) => studentMap.value[id] || `Студент #${id}`

const emoji = (url: string) => {
  const e = url.split('.').pop()?.split('?')[0]?.toLowerCase() || ''
  if (e === 'pdf') return 'PDF'
  if (['doc', 'docx'].includes(e)) return 'DOC'
  if (['txt', 'md', 'csv'].includes(e)) return 'TXT'
  if (['xls', 'xlsx'].includes(e)) return 'XLS'
  if (['ppt', 'pptx'].includes(e)) return 'PPT'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(e)) return 'IMG'
  return 'FILE'
}

// Похоже на денежную сумму ($5, $12.50) — не формула, рендерить как есть.
const looksLikeCurrency = (tex: string) => /^\s*\d[\d,.\s]*\s*$/.test(tex)
const renderMath = (tex: string, displayMode: boolean) => {
  try {
    return katex.renderToString(tex.trim(), { displayMode, throwOnError: false, strict: false })
  } catch {
    return displayMode ? `$$${tex}$$` : `$${tex}$`
  }
}

const inlineFmt = (s: string) => s
  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  .replace(/\*(.*?)\*/g, '<em>$1</em>')
  .replace(/`([^`]+)`/g, '<code>$1</code>')

// Таблицу опознаём по строке-разделителю (только "-", "|", ":", пробелы) —
// а не по обязательным крайним "|", т.к. модель их часто опускает.
// Требуем "|" и в самой строке-разделителе, иначе горизонтальная черта "---"
// (частый в ответах разделитель разделов) ошибочно считалась бы таблицей.
const isTableRow = (l: string) => l.includes('|')
const isTableSep = (l: string) => /^[-|:\s]+$/.test(l) && l.includes('-') && l.includes('|')
const isUl = (l: string) => /^\s*[-*]\s+\S/.test(l)
const isOl = (l: string) => /^\s*\d+\.\s+\S/.test(l)
const splitRow = (l: string) => {
  let s = l.trim()
  if (s.startsWith('|')) s = s.slice(1)
  if (s.endsWith('|')) s = s.slice(0, -1)
  return s.split('|').map(c => c.trim())
}
const stripMarker = (l: string) => l.replace(/^\s*(?:[-*]|\d+\.)\s+/, '')

// Формулы (KaTeX) и код-блоки рендерятся до построчного разбора; код-блоки —
// через плейсхолдеры, чтобы их внутренние переносы строк не путались со
// списками/таблицами при построчном разборе ниже.
const fmt = (t: string): string => {
  // Формулы — из СЫРОГО текста, ДО HTML-экранирования: KaTeX должен получить LaTeX-исходник как есть, включая "&" — разделитель столбцов в aligned/matrix/pmatrix. Раньше экранирование "&" → "&amp;" происходило ПЕРВЫМ шагом, ломая этот разделитель ещё до того, как формула доходила до KaTeX.
  const mathBlocks: string[] = []
  const stashMath = (html: string) => { mathBlocks.push(html); return ` MATH${mathBlocks.length - 1} ` }
  let s = t
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => stashMath(renderMath(tex, true)))
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, tex) => stashMath(renderMath(tex, true)))
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, tex) => stashMath(renderMath(tex, false)))
    .replace(/\$([^$\n]+?)\$/g, (m, tex) => (looksLikeCurrency(tex) ? m : stashMath(renderMath(tex, false))))

  s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const codeBlocks: string[] = []
  s = s.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, _lang, code) => {
    codeBlocks.push(`<pre class="code-bl"><code>${code}</code></pre>`)
    return ` CODE${codeBlocks.length - 1} `
  })

  const lines = s.split('\n')
  const parts: { block: boolean; html: string }[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (/^ CODE\d+ $/.test(line.trim())) {
      parts.push({ block: true, html: line.trim() })
      i++
      continue
    }
    if (isTableRow(line) && isTableSep(lines[i + 1] || '')) {
      const header = splitRow(line).map(inlineFmt)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && isTableRow(lines[i])) { rows.push(splitRow(lines[i]).map(inlineFmt)); i++ }
      let html = '<table class="md-table"><thead><tr>' + header.map(c => `<th>${c}</th>`).join('') + '</tr></thead>'
      if (rows.length) html += '<tbody>' + rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') + '</tbody>'
      html += '</table>'
      parts.push({ block: true, html })
      continue
    }
    if (isUl(line) || isOl(line)) {
      const ordered = isOl(line)
      const items: string[] = []
      while (i < lines.length && (ordered ? isOl(lines[i]) : isUl(lines[i]))) { items.push(inlineFmt(stripMarker(lines[i]))); i++ }
      const tag = ordered ? 'ol' : 'ul'
      parts.push({ block: true, html: `<${tag}>${items.map(it => `<li>${it}</li>`).join('')}</${tag}>` })
      continue
    }
    parts.push({ block: false, html: inlineFmt(line) })
    i++
  }

  let html = ''
  parts.forEach((p, idx) => {
    if (!p.block && idx > 0 && !parts[idx - 1].block) html += '<br>'
    html += p.html
  })
  return html
    .replace(/ CODE(\d+) /g, (_, idx) => codeBlocks[Number(idx)])
    .replace(/ MATH(\d+) /g, (_, idx) => mathBlocks[Number(idx)])
}

// Единая точка, откуда обложка/сайдбар схлопываются при появлении сообщений
// (send/gradeOne зовут scrollBottom() сразу после push — .push() мутирует
// массив без переприсваивания msgs.value, поэтому watch(msgs, ...) ниже на
// него НЕ реагирует, и вызов эмита пришлось перенести сюда).
const scrollBottom = () => nextTick(() => {
  if (msgsEl.value) msgsEl.value.scrollTop = msgsEl.value.scrollHeight
  if (msgs.value.length > 0) emit('scroll-state', true)
})

// ── Build system prompt ────────────────────────────────────────────────────────
const buildSystem = (): string => {
  const className = props.className || 'этого класса'
  let sys = `Ты — опытный ИИ-ассистент и педагог класса "${className}". Помогаешь студентам понять материалы, объясняешь темы доступно, помогаешь решать задания и проверяешь работы. Отвечай на русском языке. Будь точным, дружелюбным и педагогически грамотным.`
  sys += ` Материалы курса помечены заголовками вида "### Лекция N: <тема>" — если студент просит объяснить материал по номеру (например "объясни 2 лекцию"), найди блок с этим номером и объясняй именно его. Объясняй подробно: раскрывай ключевые понятия, приводи примеры и связи между идеями, а не просто пересказывай заголовок. Математические формулы записывай в LaTeX: инлайн — $...$ или \\(...\\), блочные — $$...$$ или \\[...\\]. Код — в блоках \`\`\`язык.`

  // Текст самих лекций (JSON content/description постов) — до файлов, чтобы
  // текстовые лекции без вложений тоже были видны модели.
  if (lectureTextBlocks.value.length > 0) {
    sys += `\n\n${'='.repeat(60)}\nТЕКСТ ЛЕКЦИЙ:\n${'='.repeat(60)}\n\n${lectureTextBlocks.value.join('\n\n')}`
  }

  // Add assignments context (titles, descriptions, criteria)
  if (props.assignments && props.assignments.length > 0) {
    sys += `\n\n${'='.repeat(60)}\nЗАДАНИЯ КЛАССА:\n${'='.repeat(60)}`
    for (const a of props.assignments) {
      sys += `\n\n[Задание: ${a.title}]`
      if (a.description) {
        // Strip URLs from description for readability
        const cleanDesc = a.description.replace(/(https?:\/\/[^\s]+)/g, '[файл]').trim()
        if (cleanDesc) sys += `\nОписание: ${cleanDesc}`
      }
      try {
        const criteria = JSON.parse(a.criteria)
        if (criteria.length > 0) {
          sys += `\nКритерии оценивания: ${criteria.map((c: any) => `${c.name} (${c.weight} баллов)`).join(', ')}`
        }
      } catch {}
      if (a.max_score) sys += `\nМакс. балл: ${a.max_score}`
      if (a.deadline) sys += `\nДедлайн: ${parseUtc(a.deadline).toLocaleDateString('ru-RU')}`
    }
    sys += `\n\n${'='.repeat(60)}`
  }

  return sys
}

// ── Grade submission ───────────────────────────────────────────────────────────
const gradeOne = async (sub: Submission) => {
  gradingId.value = sub.id
  try {
    const result = await svc.aiGrade(sub.id)
    if (result.status === 'needs_review' || !result.grade) {
      const txt = `**Работа студента ${getStudentName(sub.student_id)}** — не удалось надёжно распознать рукописный текст, отправлено на ручную проверку учителем.`
      msgs.value.push({ id: ++nextId, role: 'assistant', text: txt })
      pendingSubs.value = pendingSubs.value.filter(s => s.id !== sub.id)
      scrollBottom()
      persist()
      toast.ok('Отправлено на ручную проверку')
      return
    }
    const grade = result.grade
    const txt = [
      `**Работа студента ${getStudentName(sub.student_id)} проверена ИИ**`,
      ``,
      `**Оценка: ${grade.score} баллов**`,
      grade.feedback ? `\n**Фидбек:** ${grade.feedback}` : '',
    ].join('\n')
    msgs.value.push({ id: ++nextId, role: 'assistant', text: txt })
    pendingSubs.value = pendingSubs.value.filter(s => s.id !== sub.id)
    scrollBottom()
    persist()
    toast.ok(`Оценка выставлена: ${grade.score} баллов`)
  } catch (e: any) {
    toast.err(e?.response?.data?.detail || 'Ошибка проверки работы')
  } finally { gradingId.value = null }
}

// ── Load pending submissions ───────────────────────────────────────────────────
const loadPending = async () => {
  if (!props.isTeacher || !props.assignmentId) return
  try {
    const [subs, users] = await Promise.all([
      svc.getSubmissions(props.assignmentId),
      usersSvc.all()
    ])
    pendingSubs.value = subs.filter(s => s.status === 'submitted' || s.status === 'late')
    const fnReg: Record<number, string> = JSON.parse(localStorage.getItem('_fullname_registry') || '{}')
    const map: Record<number, string> = {}
    for (const u of users) {
      map[u.id] = fnReg[u.id] || u.full_name || u.fullname || u.name || u.email || `Студент #${u.id}`
    }
    studentMap.value = map
  } catch {}
}

// ── Send ──────────────────────────────────────────────────────────────────────
const pushSend = (text: string) => { inputTxt.value = text; send() }

const send = async () => {
  const text = inputTxt.value.trim()
  if (!text || loading.value) return

  if (aiLimitReached.value) {
    toast.err(`Дневной лимит ИИ исчерпан (${aiLimit.value} сообщений в сутки). Лимит обновится завтра.`)
    return
  }

  // Высоту поля после очистки пересчитывает сама AutoTextarea (watch на value).
  inputTxt.value = ''

  msgs.value.push({ id: ++nextId, role: 'user', text })
  scrollBottom()
  persist()
  loading.value = true

  try {
    // Use last 20 messages for context
    const history = msgs.value.slice(-20).map(m => ({ role: m.role, content: m.text }))
    const systemPrompt = buildSystem()

    const { data } = await api.post('/ai/chat', {
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
      ],
      max_tokens: 2500,
      temperature: 0.55,
      class_id: props.classId,  // тред ИИ-вкладки класса (не глобальный)
    })

    const reply = data.content || '...'
    msgs.value.push({ id: ++nextId, role: 'assistant', text: reply })
    scrollBottom()
    persist()
    aiQuota.applyQuota(data.quota)
  } catch (e: any) {
    toast.err('ИИ: ' + (e?.response?.data?.detail || e.message || 'ошибка соединения'))
    // 429 — дневная квота исчерпана: обновляем счётчик, чтобы ввод заблокировался.
    if (e?.response?.status === 429) aiQuota.refreshQuota(auth.user?.id)
  } finally {
    loading.value = false
  }
}

const clearAll = () => {
  msgs.value = []
  try { sessionStorage.removeItem(storageKey.value) } catch {}
  // Чистим тред этого класса и на сервере (синхронно с приложением).
  // .catch: отклонённый промис иначе стал бы unhandledrejection → тост.
  if (props.classId != null) api.delete('/ai/history', { params: { class_id: props.classId } }).catch(() => {})
  emit('scroll-state', false)
}

// Серверная история треда класса → msgs (синхронно с приложением). Если на
// сервере пусто, а локально (сессия) есть — разово заливаем на сервер.
const syncFromServer = async () => {
  if (props.classId == null) return
  try {
    let rows = (await api.get('/ai/history', { params: { class_id: props.classId } })).data as any[]
    if ((!rows || rows.length === 0) && msgs.value.length) {
      rows = (await api.post('/ai/history/import', {
        class_id: props.classId,
        messages: msgs.value.map(m => ({ role: m.role, content: m.text })),
      })).data
    }
    if (Array.isArray(rows)) {
      msgs.value = rows.map((r, i) => ({ id: i + 1, role: r.role, text: r.content }))
      nextId = msgs.value.length
      persist()
      nextTick(scrollBottom)
    }
  } catch {}
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
watch(msgs, scrollBottom)

onMounted(() => {
  restore()
  syncFromServer()
  nextTick(scrollBottom)
  loadPending()
})
</script>

<style scoped>
.class-ai { display: flex; flex-direction: column; height: 100%; background: var(--bg); overflow: hidden; position: relative; }

/* Minimal top bar — clear-chat action only, no title/branding */
/* Floating actions — overlay the messages area, no header bar/divider under the cover */
.ai-floating-actions { position: absolute; top: 12px; right: 14px; z-index: 5; display: flex; gap: 8px; }
.hdr-btn { position: relative; width: 34px; height: 34px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); color: var(--text3); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; box-shadow: var(--sh-xs); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
.hdr-btn:hover, .hdr-btn-active { background: rgba(var(--teal-rgb),.1); border-color: rgba(var(--teal-rgb),.25); color: var(--teal); }
.hdr-badge { position: absolute; top: -4px; right: -4px; min-width: 16px; height: 16px; background: var(--yellow); border-radius: 8px; font-size: 10px; font-weight: 700; color: #1c1c1e; display: flex; align-items: center; justify-content: center; border: 2px solid var(--surface); padding: 0 3px; }

/* Body */
.ai-body { flex: 1; display: flex; overflow: hidden; min-height: 0; position: relative; }

/* Sidebar (teacher tools) */
.ai-sidebar { width: 265px; flex-shrink: 0; background: var(--surface); border-right: 1px solid var(--border); overflow-y: auto; padding: 14px 12px; display: flex; flex-direction: column; gap: 18px; }
.sb-section { display: flex; flex-direction: column; gap: 8px; }
.sb-section-title { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--text4); }
.sb-empty { font-size: 12px; color: var(--text4); padding: 4px 0; }
.sb-sub-list { display: flex; flex-direction: column; gap: 6px; }
.sb-sub { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 10px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-md); }
.sb-sub-name { font-size: 12px; font-weight: 600; color: var(--text1); }
.sb-sub-tags { display: flex; gap: 4px; margin-top: 3px; }
.sub-chip { font-size: 11px; color: var(--text4); background: var(--surface3); padding: 1px 7px; border-radius: 100px; }
.grade-btn { display: flex; align-items: center; gap: 5px; padding: 5px 10px; background: var(--teal); color: #fff; border: none; border-radius: var(--r-md); font-size: 11px; font-weight: 600; cursor: pointer; transition: all .15s; font-family: inherit; white-space: nowrap; flex-shrink: 0; }
.grade-btn:disabled { opacity: .5; cursor: not-allowed; }
.grade-btn:not(:disabled):hover { background: var(--teal-h); }

/* Messages */
.ai-msgs { flex: 1; overflow-y: auto; padding: 56px 20px 18px; display: flex; flex-direction: column; gap: 14px; }

/* Welcome */
.welcome { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; margin: auto; max-width: 440px; padding: 20px; }
.welcome-title { font-family: -apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif; font-size: 21px; font-weight: 900; color: var(--text1); }
.welcome-desc { font-size: 13px; color: var(--text4); line-height: 1.5; }
.quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; margin-top: 8px; }
.quick-btn { display: flex; align-items: center; gap: 9px; padding: 12px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); font-size: 12px; color: var(--text2); cursor: pointer; text-align: left; transition: all .17s; font-family: inherit; }
.quick-btn:hover { background: rgba(var(--teal-rgb),.07); border-color: rgba(var(--teal-rgb),.25); color: var(--teal); transform: translateY(-1px); }
.quick-icon { font-size: 17px; flex-shrink: 0; }

/* Bubbles — геометрия синхронизирована с pages/ai.vue (тот же "Chatra AI",
   только на отдельной странице) — раньше это были два независимо
   подобранных значения (радиус/паддинг/тень) для одной и той же фичи. */
.msg-row { display: flex; flex-direction: column; gap: 6px; max-width: 78%; }
.msg-row.user { align-self: flex-end; align-items: flex-end; }
.msg-row.assistant { align-self: flex-start; }
.msg-sender { font-size: 12px; font-weight: 700; color: var(--text3); }
.msg-bubble { padding: 12px 17px; border-radius: 20px; font-size: 14px; line-height: 1.6; word-break: break-word; }
.msg-row.assistant .msg-bubble { background: var(--surface); border: 1px solid var(--border); color: var(--text1); border-bottom-left-radius: 6px; }
.msg-row.user .msg-bubble { background: linear-gradient(135deg,var(--teal),var(--teal-h)); color: #fff; border-bottom-right-radius: 6px; box-shadow: 0 4px 20px rgba(var(--teal-rgb),.3); }
:deep(.msg-bubble code) { background: rgba(255,255,255,.12); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
:deep(.msg-bubble strong) { font-weight: 700; }
:deep(.msg-bubble em) { font-style: italic; opacity: .9; }
:deep(.msg-bubble .code-bl) { background: #0a0a16; color: #99e6f0; border-radius: 8px; padding: 12px; margin: 6px 0; overflow-x: auto; font-size: 12px; font-family: monospace; line-height: 1.6; }
:deep(.msg-bubble .code-bl code) { background: none; padding: 0; }
:deep(.msg-bubble .katex) { font-size: 1em; }
:deep(.msg-bubble .katex-display) { margin: 8px 0; overflow-x: auto; overflow-y: hidden; }
:deep(.msg-bubble ul), :deep(.msg-bubble ol) { margin: 6px 0; padding-left: 20px; }
:deep(.msg-bubble li) { margin: 2px 0; }
:deep(.msg-bubble .md-table) { border-collapse: collapse; margin: 8px 0; font-size: 12.5px; display: block; overflow-x: auto; max-width: 100%; }
:deep(.msg-bubble .md-table th), :deep(.msg-bubble .md-table td) { border: 1px solid var(--border); padding: 6px 10px; text-align: left; }
:deep(.msg-bubble .md-table th) { background: rgba(0,0,0,.04); font-weight: 700; }

/* Typing indicator */
.typing-bbl { display: flex; align-items: center; gap: 5px; padding: 14px 18px; }
.typing-bbl span { width: 6px; height: 6px; border-radius: 50%; background: var(--text4); animation: bounce .8s ease infinite; }
.typing-bbl span:nth-child(2) { animation-delay: .14s; }
.typing-bbl span:nth-child(3) { animation-delay: .28s; }
@keyframes bounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)} }

/* Input bar */
.ai-input-bar { display: flex; align-items: flex-end; gap: 10px; padding: 12px 18px; background: var(--surface); border-top: 1px solid var(--border); flex-shrink: 0; }
.ai-textarea { flex: 1; min-width: 0; background: var(--surface2); border: 1px solid var(--border); border-radius: 14px; padding: 11px 15px; color: var(--text1); font-size: 13.5px; resize: none; line-height: 1.5; max-height: 140px; overflow-y: auto; transition: border-color .15s; font-family: inherit; }
.ai-textarea:focus { border-color: rgba(var(--teal-rgb),.45); outline: none; }
.send-btn { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg,var(--teal),var(--teal-h)); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .18s; flex-shrink: 0; box-shadow: 0 4px 14px rgba(var(--teal-rgb),.4); }
.send-btn:disabled { opacity: .35; cursor: not-allowed; box-shadow: none; }
.send-btn.locked { background: var(--surface2); color: var(--text4); box-shadow: none; opacity: 1; }
html.dark .send-btn.locked { background: var(--surface3, var(--surface2)); }
.send-btn:not(:disabled):hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(var(--teal-rgb),.6); }

@media (max-width: 768px) {
  /* На iOS текст поля ввода меньше 16px заставляет Safari зумить страницу
     при фокусе — из-за этого поле выглядит "не влезающим" и скролл ломается. */
  .ai-textarea { font-size: 16px; padding: 10px 13px; }
  .ai-input-bar { padding: 10px 12px; }

  /* Фиксированная ширина 265px у .ai-sidebar сжимала .ai-msgs почти до нуля
     на экранах ≤768px (места оставалось меньше 110px) — сайдбар вылезал за
     пределы экрана. На мобильном превращаем его в полноэкранную шторку
     поверх чата вместо колонки рядом с сообщениями. */
  .ai-sidebar { position: absolute; inset: 0; width: 100%; z-index: 20; }
  .ai-floating-actions { z-index: 30; }
  .ai-msgs { min-width: 0; }
  .msg-row { max-width: 88%; }
  .msg-bubble { padding: 11px 15px; font-size: 15px; border-radius: 19px; }
  .quick-grid { grid-template-columns: 1fr; }
}

/* Spinners */
.spin-xs { width: 12px; height: 12px; border: 2px solid var(--border2); border-top-color: var(--teal); border-radius: 50%; animation: spin .6s linear infinite; flex-shrink: 0; }
.spin-xs.white { border-color: rgba(255,255,255,.3); border-top-color: #fff; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
