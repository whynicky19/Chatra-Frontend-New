<template>
  <div class="ai-page anim-in">
    <!-- ── Sidebar: chat history — overlay drawer on mobile, collapsible rail on desktop ── -->
    <div
      v-if="isMobile && mobileDrawerOpen"
      class="ai-backdrop"
      @click="closeDrawer"
    />
    <aside
      ref="sidebarEl"
      class="ai-sidebar"
      :class="{ collapsed: !isMobile && sidebarCollapsed, 'mobile-open': isMobile && mobileDrawerOpen }"
      :style="dragTranslate != null ? { transform: `translateX(${dragTranslate}px)`, transition: 'none' } : undefined"
      @touchstart="onDrawerTouchStart"
      @touchmove="onDrawerTouchMove"
      @touchend="onDrawerTouchEnd"
    >
      <div class="sb-head">
        <div class="sb-title">{{ t('ai.chats') }}</div>
        <button class="new-chat-btn" :title="t('ai.new_chat')" @click="newChat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>{{ t('ai.new_chat') }}</span>
        </button>
      </div>

      <div class="sb-search">
        <div class="search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
          <input v-model="query" class="search-inp" :placeholder="t('ai.search_placeholder')"/>
        </div>
      </div>

      <div class="sb-list">
        <!-- Empty state (no chats at all) -->
        <div v-if="!store.conversations.length" class="sb-empty">
          <div class="sb-empty-ico"><span class="chatra-glyph lg"></span></div>
          <div class="sb-empty-title">{{ t('ai.no_chats') }}</div>
          <div class="sb-empty-sub">{{ t('ai.no_chats_sub') }}</div>
          <button class="sb-empty-cta" @click="newChat">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {{ t('ai.new_chat') }}
          </button>
        </div>

        <!-- No search results -->
        <div v-else-if="!filtered.length" class="sb-noresult">{{ t('ai.no_search_results') }}</div>

        <template v-else>
          <div v-if="pinned.length" class="sb-section-lbl">{{ t('ai.pinned') }}</div>
          <ConvRow v-for="c in pinned" :key="c.id" :conv="c"/>

          <div v-if="unpinned.length" class="sb-section-lbl">{{ t('ai.all_chats') }}</div>
          <ConvRow v-for="c in unpinned" :key="c.id" :conv="c"/>
        </template>
      </div>
    </aside>

    <!-- ── Chat panel — always the main view ─────────────────────────────── -->
    <div class="ai-chat-panel">
      <!-- Header -->
      <div class="chat-head">
        <div class="chat-head-l">
          <button class="menu-btn" :title="t('ai.chats')" @click="toggleSidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div class="ai-logo-wrap"><span class="chatra-glyph lg"></span></div>
          <div class="chat-head-txt">
            <div class="chat-title">{{ store.activeThread?.title || 'Chatra AI' }}</div>
            <div class="chat-sub">{{ tt('Ваш учебный ассистент', 'Сіздің оқу көмекшіңіз', 'Your learning assistant') }}</div>
          </div>
        </div>
        <div class="chat-head-r">
          <div class="online-pill">● {{ t('nav.online') }}</div>
        </div>
      </div>

      <!-- Messages area -->
      <div ref="area" class="chat-area">
        <div v-if="!msgs.length" class="chat-empty-state">
          <div class="ai-empty-logo"><span class="chatra-glyph xl"></span></div>
          <div class="empty-title">Chatra AI</div>
          <p class="empty-hint">{{ tt('Спросите что угодно об учёбе — объясню, помогу, проверю',
            'Оқу туралы кез келген нәрсе сұраңыз — түсіндіремін, көмектесемін, тексеремін',
            "Ask anything about your studies — I'll explain, help, and review") }}</p>
          <div class="tip-grid">
            <button v-for="(tip, i) in tipCards" :key="i" class="tip-card" :style="{ animationDelay: (i * 60) + 'ms' }" @click="quick(tip.prompt)">
              <span class="tip-icon" v-html="tip.icon"></span>
              <span class="tip-title">{{ tip.title }}</span>
              <span class="tip-desc">{{ tip.desc }}</span>
            </button>
          </div>
        </div>

        <div v-else class="chat-msgs">
          <div v-for="m in msgs" :key="m.id" :class="['chat-msg', m.role]">
            <div v-if="m.role==='assistant'" class="msg-avatar">
              <div class="ai-av-icon"><span class="chatra-glyph sm"></span></div>
              <span class="msg-sender">Chatra AI</span>
            </div>
            <img v-if="m.imagePreview" :src="m.imagePreview" class="msg-img-preview" alt="uploaded"/>
            <div :class="['msg-bubble', m.role]" v-html="fmt(m.text)"></div>
          </div>

          <div v-if="sending" class="chat-msg assistant">
            <div class="msg-avatar">
              <div class="ai-av-icon"><span class="chatra-glyph sm"></span></div>
              <span class="msg-sender">Chatra AI</span>
            </div>
            <div class="msg-bubble assistant">
              <div class="typing"><span></span><span></span><span></span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- File preview bar -->
      <div v-if="pendingFile" class="file-prev">
        <div class="fp-info">
          <img v-if="pendingPreview" :src="pendingPreview" class="fp-thumb" alt="preview"/>
          <span v-if="pendingFile.type.startsWith('image/')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg></span>
          <span v-else><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg></span>
          <span>{{ pendingFile.name }}</span>
          <span v-if="pendingFile.type.startsWith('image/')" class="fp-badge">ИИ прочитает текст</span>
        </div>
        <button class="fp-rm" @click="clearFile">×</button>
      </div>

      <AiLimitNotice v-if="quota.aiLimitReached.value" :quota="quota.quota.value" class="notice-wide"/>

      <!-- Input -->
      <div class="chat-inp">
        <label class="attach-lbl" title="Прикрепить изображение / файл">
          <input ref="fileInput" type="file" accept="image/*,.pdf,.doc,.docx,.txt" style="display:none" @change="onFilePick"/>
          <div class="attach-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
          </div>
        </label>
        <input
          ref="inp"
          v-model="txt"
          class="chat-field"
          :placeholder="quota.aiLimitReached.value ? 'Дневной лимит исчерпан...' : 'Написать сообщение или спросить кое что...'"
          :disabled="sending || quota.aiLimitReached.value"
          @keydown.enter="send"
        />
        <button
          :class="['send-btn', {active: (txt.trim() || pendingFile) && !quota.aiLimitReached.value, locked: quota.aiLimitReached.value}]"
          :disabled="(!txt.trim() && !pendingFile) || sending || quota.aiLimitReached.value"
          @click="send"
        >
          <div v-if="sending" class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted, h, defineComponent } from 'vue'
import { useAiChatsStore } from '~/stores/aiChats.store'
import { useAiQuota } from '~/composables/useAiQuota'
import { useI18n } from '~/composables/useI18n'
import type { AiThread } from '~/services/ai'

definePageMeta({ layout: 'default' })

const store = useAiChatsStore()
const quota = useAiQuota()
const { t, lang } = useI18n()

const msgs = computed(() => store.messages)
const sending = computed(() => store.sending)

const area = ref<HTMLElement | null>(null)
const inp = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const sidebarEl = ref<HTMLElement | null>(null)
const txt = ref('')
const pendingFile = ref<File | null>(null)
const pendingPreview = ref<string | null>(null)
const query = ref('')

const isMobile = ref(false)
// Мобилка: история — slide-over drawer поверх чата. Десктоп: сворачиваемый рельс.
const mobileDrawerOpen = ref(false)
const sidebarCollapsed = ref(false)
const SIDEBAR_COLLAPSE_KEY = '_ai_sidebar_collapsed'

// Инлайн-переименование
const renamingId = ref<number | null>(null)
const renameText = ref('')

const tt = (ru: string, kk: string, en: string) =>
  lang.value === 'ru' ? ru : lang.value === 'kk' ? kk : en

// ── Sidebar list ──────────────────────────────────────────────────────────
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = store.sortedConversations
  if (!q) return list
  return list.filter(c => (c.title || '').toLowerCase().includes(q))
})
const pinned = computed(() => filtered.value.filter(c => c.pinned))
const unpinned = computed(() => filtered.value.filter(c => !c.pinned))

const shortDate = (iso: string): string => {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const now = Date.now()
  const diff = now - d.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return tt('сейчас', 'қазір', 'now')
  if (min < 60) return `${min}${tt('м', 'м', 'm')}`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `${hrs}${tt('ч', 'с', 'h')}`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}${tt('д', 'к', 'd')}`
  return d.toLocaleDateString(lang.value === 'en' ? 'en-US' : lang.value === 'kk' ? 'kk-KZ' : 'ru-RU', { day: 'numeric', month: 'short' })
}

// ── Sidebar open/close (drawer on mobile, collapse on desktop) ────────────
const closeDrawer = () => { mobileDrawerOpen.value = false }

const toggleSidebar = () => {
  if (isMobile.value) {
    mobileDrawerOpen.value = !mobileDrawerOpen.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
    if (import.meta.client) {
      try { localStorage.setItem(SIDEBAR_COLLAPSE_KEY, sidebarCollapsed.value ? '1' : '0') } catch {}
    }
  }
}

// ── Actions ───────────────────────────────────────────────────────────────
const openConv = (id: number) => {
  if (renamingId.value != null) return
  store.setActive(id)
  if (isMobile.value) closeDrawer()
  scroll()
}

const newChat = async () => {
  const thread = await store.createThread()
  if (thread) {
    await store.setActive(thread.id)
    query.value = ''
    if (isMobile.value) closeDrawer()
  }
}

const startRename = (c: AiThread) => {
  renamingId.value = c.id
  renameText.value = c.title
  nextTick(() => {
    const el = document.querySelector<HTMLInputElement>('.rename-inp')
    el?.focus()
    el?.select()
  })
}
const commitRename = (c: AiThread) => {
  if (renamingId.value !== c.id) return
  const val = renameText.value
  renamingId.value = null
  store.rename(c.id, val)
}
const cancelRename = () => { renamingId.value = null }

const togglePin = (c: AiThread) => store.togglePin(c.id)

const confirmDelete = (c: AiThread) => {
  if (!import.meta.client) return
  if (window.confirm(t('ai.delete_confirm'))) store.remove(c.id)
}

// ── Inline conversation row component ─────────────────────────────────────
const ConvRow = defineComponent({
  props: { conv: { type: Object as () => AiThread, required: true } },
  setup(p) {
    return () => {
      const c = p.conv
      const active = c.id === store.activeId
      const renaming = renamingId.value === c.id

      const actions = h('div', { class: 'row-actions' }, [
        h('button', {
          class: 'row-btn', title: c.pinned ? t('ai.unpin') : t('ai.pin'),
          onClick: (e: Event) => { e.stopPropagation(); togglePin(c) },
        }, [pinIcon(c.pinned)]),
        h('button', {
          class: 'row-btn', title: t('ai.rename'),
          onClick: (e: Event) => { e.stopPropagation(); startRename(c) },
        }, [penIcon()]),
        h('button', {
          class: 'row-btn danger', title: t('ai.delete'),
          onClick: (e: Event) => { e.stopPropagation(); confirmDelete(c) },
        }, [trashIcon()]),
      ])

      const titleEl = renaming
        ? h('input', {
            class: 'rename-inp',
            value: renameText.value,
            onInput: (e: Event) => { renameText.value = (e.target as HTMLInputElement).value },
            onKeydown: (e: KeyboardEvent) => {
              if (e.key === 'Enter') { e.preventDefault(); commitRename(c) }
              else if (e.key === 'Escape') { e.preventDefault(); cancelRename() }
            },
            onBlur: () => commitRename(c),
            onClick: (e: Event) => e.stopPropagation(),
          })
        : h('div', { class: 'row-title' }, c.title || t('ai.untitled'))

      return h('div', {
        class: ['conv-row', { active }],
        onClick: () => openConv(c.id),
      }, [
        h('div', { class: 'row-main' }, [
          h('div', { class: 'row-top' }, [
            c.pinned ? h('span', { class: 'row-pin-ind' }, [pinIcon(true)]) : null,
            titleEl,
          ]),
          h('div', { class: 'row-date' }, shortDate(c.updated_at)),
        ]),
        renaming ? null : actions,
      ])
    }
  },
})

const pinIcon = (filled: boolean) => h('svg', {
  width: 13, height: 13, viewBox: '0 0 24 24',
  fill: filled ? 'currentColor' : 'none', stroke: 'currentColor', 'stroke-width': 2,
  'stroke-linecap': 'round', 'stroke-linejoin': 'round',
}, [h('path', { d: 'M12 17v5M9 10.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V16a1 1 0 001 1h12a1 1 0 001-1v-.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V7a1 1 0 011-1 2 2 0 000-4H8a2 2 0 000 4 1 1 0 011 1z' })])

const penIcon = () => h('svg', {
  width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
}, [h('path', { d: 'M12 20h9' }), h('path', { d: 'M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z' })])

const trashIcon = () => h('svg', {
  width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
}, [h('polyline', { points: '3 6 5 6 21 6' }), h('path', { d: 'M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2' })])

// ── Empty-state tip cards ─────────────────────────────────────────────────
const icoBook = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>'
const icoBulb = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0012 2z"/></svg>'
const icoPen = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5z"/></svg>'
const icoWarn = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'

const tipCards = computed(() => [
  { icon: icoBook, title: tt('Объяснить тему', 'Тақырыпты түсіндір', 'Explain a topic'),
    desc: tt('Разбери сложную концепцию простыми словами', 'Күрделі тұжырымды қарапайым сөздермен', 'Break down a complex concept in simple words'),
    prompt: tt('Объясни тему простыми словами', 'Тақырыпты қарапайым сөздермен түсіндір', 'Explain a topic in simple words') },
  { icon: icoBulb, title: tt('Разобрать концепции', 'Тұжырымдарды ашу', 'Break down concepts'),
    desc: tt('Помоги понять разницу между подходами', 'Тәсілдер арасындағы айырмашылықты түсін', 'Understand the difference between approaches'),
    prompt: tt('Помоги понять разницу между подходами', 'Тәсілдер арасындағы айырмашылықты түсінуге көмектес', 'Help me understand the difference between approaches') },
  { icon: icoPen, title: tt('Помочь с заданием', 'Тапсырмаға көмек', 'Help with a task'),
    desc: tt('Подскажи, с чего начать решение', 'Шешімді қайдан бастау керектігін айт', 'Tell me where to start the solution'),
    prompt: tt('Подскажи, с чего начать решение задания', 'Тапсырманы шешуді қайдан бастау керектігін айт', 'Tell me where to start solving the task') },
  { icon: icoWarn, title: tt('Найти ошибки', 'Қателерді тап', 'Find mistakes'),
    desc: tt('Проверь мой код и укажи на проблемы', 'Кодымды тексеріп, мәселелерді көрсет', 'Review my code and point out issues'),
    prompt: tt('Проверь мой код и укажи на ошибки', 'Кодымды тексеріп, қателерді көрсет', 'Review my code and point out mistakes') },
])

// Сначала экранируем HTML, потом markdown-замены — иначе XSS через v-html
const fmt = (s: string) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/```(\w+)?\n?([^`]*?)```/gs, '<pre class="code-bl"><code>$2</code></pre>')
  .replace(/`([^`]+)`/g, '<code class="ic">$1</code>')
  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  .replace(/\n/g, '<br>')

const scroll = () => nextTick(() => {
  if (area.value) area.value.scrollTop = area.value.scrollHeight
})

const onFilePick = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  pendingFile.value = f
  if (f.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = () => { pendingPreview.value = reader.result as string }
    reader.readAsDataURL(f)
  } else {
    pendingPreview.value = null
  }
  if (fileInput.value) fileInput.value.value = ''
}

const clearFile = () => {
  pendingFile.value = null
  pendingPreview.value = null
}

const send = async () => {
  if ((!txt.value.trim() && !pendingFile.value) || sending.value) return
  const message = txt.value
  const file = pendingFile.value
  txt.value = ''
  pendingFile.value = null
  pendingPreview.value = null
  await store.send(message, file)
  scroll()
}

const quick = async (prompt: string) => {
  txt.value = prompt
  await send()
}

// ── Swipe gesture: edge-swipe opens the mobile drawer, drag-to-close ──────
const SWIPE_EDGE = 24
let touchStartX = 0
let touchTracking: 'edge' | 'drawer' | null = null
const dragTranslate = ref<number | null>(null)
let sidebarWidth = 320

const onWindowTouchStart = (e: TouchEvent) => {
  if (!isMobile.value || mobileDrawerOpen.value) return
  const x = e.touches[0].clientX
  if (x > SWIPE_EDGE) return
  touchStartX = x
  touchTracking = 'edge'
  sidebarWidth = sidebarEl.value?.offsetWidth || 320
  dragTranslate.value = -sidebarWidth
}
const onWindowTouchMove = (e: TouchEvent) => {
  if (touchTracking !== 'edge') return
  const dx = e.touches[0].clientX - touchStartX
  dragTranslate.value = Math.max(-sidebarWidth, Math.min(0, -sidebarWidth + dx))
}
const onWindowTouchEnd = () => {
  if (touchTracking !== 'edge') return
  const opened = (dragTranslate.value ?? -sidebarWidth) > -sidebarWidth * 0.6
  dragTranslate.value = null
  touchTracking = null
  mobileDrawerOpen.value = opened
}

const onDrawerTouchStart = (e: TouchEvent) => {
  if (!isMobile.value || !mobileDrawerOpen.value) return
  touchStartX = e.touches[0].clientX
  touchTracking = 'drawer'
  sidebarWidth = sidebarEl.value?.offsetWidth || 320
  dragTranslate.value = 0
}
const onDrawerTouchMove = (e: TouchEvent) => {
  if (touchTracking !== 'drawer') return
  const dx = e.touches[0].clientX - touchStartX
  dragTranslate.value = Math.max(-sidebarWidth, Math.min(0, dx))
}
const onDrawerTouchEnd = () => {
  if (touchTracking !== 'drawer') return
  const closed = (dragTranslate.value ?? 0) < -sidebarWidth * 0.3
  dragTranslate.value = null
  touchTracking = null
  if (closed) mobileDrawerOpen.value = false
}

// ── Lifecycle ─────────────────────────────────────────────────────────────
let mq: MediaQueryList | null = null
const onMq = (e: MediaQueryListEvent | MediaQueryList) => { isMobile.value = e.matches }

onMounted(async () => {
  mq = window.matchMedia('(max-width: 768px)')
  isMobile.value = mq.matches
  mq.addEventListener('change', onMq)

  if (import.meta.client) {
    try { sidebarCollapsed.value = localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1' } catch {}
    window.addEventListener('touchstart', onWindowTouchStart, { passive: true })
    window.addEventListener('touchmove', onWindowTouchMove, { passive: true })
    window.addEventListener('touchend', onWindowTouchEnd)
  }

  await store.loadThreads()
  // Автооткрытие самого свежего чата, если он есть — на любом экране.
  if (store.activeId == null && store.sortedConversations.length) {
    await store.setActive(store.sortedConversations[0].id)
    scroll()
  }
})

onUnmounted(() => {
  if (mq) mq.removeEventListener('change', onMq)
  if (import.meta.client) {
    window.removeEventListener('touchstart', onWindowTouchStart)
    window.removeEventListener('touchmove', onWindowTouchMove)
    window.removeEventListener('touchend', onWindowTouchEnd)
  }
})

watch(() => store.messages.length, () => scroll())
watch(() => store.activeId, () => scroll())
</script>

<style scoped>
.ai-page { display: flex; height: 100%; overflow: hidden; position: relative }

/* ── Sidebar ─────────────────────────────────────────────────────────── */
.ai-sidebar { width: 288px; flex-shrink: 0; display: flex; flex-direction: column; background: var(--surface); border-right: 1px solid var(--border); overflow: hidden; transition: width .25s cubic-bezier(.4,0,.2,1) }
.ai-sidebar.collapsed { width: 0; border-right-color: transparent }
.sb-head { display: flex; align-items: center; justify-content: space-between; padding: 0 16px; height: var(--topbar); border-bottom: 1px solid var(--border); flex-shrink: 0 }
.sb-title { font-size: 18px; font-weight: 800; letter-spacing: -.02em; color: var(--text1) }
.new-chat-btn { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: var(--r-md); background: linear-gradient(135deg, var(--teal), var(--teal-h)); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; transition: box-shadow .18s, transform .18s; box-shadow: 0 3px 12px rgba(var(--teal-rgb),.3) }
.new-chat-btn:hover { box-shadow: 0 5px 18px rgba(var(--teal-rgb),.5); transform: translateY(-1px) }
.new-chat-btn:active { transform: scale(.97) }

.sb-search { padding: 12px 14px 6px }
.search-wrap { display: flex; align-items: center; gap: 8px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-md); padding: 8px 12px; color: var(--text4); transition: border-color .18s }
.search-wrap:focus-within { border-color: var(--teal) }
.search-inp { flex: 1; border: none; background: none; font-size: 13px; color: var(--text1); outline: none }
.search-inp::placeholder { color: var(--text4) }

.sb-list { flex: 1; overflow-y: auto; padding: 6px 10px 14px }
.sb-section-lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--text4); padding: 12px 8px 6px }

.conv-row { display: flex; align-items: center; gap: 8px; padding: 10px 10px; border-radius: var(--r-lg); cursor: pointer; transition: background .15s; position: relative }
.conv-row:hover { background: var(--surface2) }
.conv-row.active { background: rgba(var(--teal-rgb),.1) }
.conv-row.active .row-title { color: var(--teal) }
.row-main { flex: 1; min-width: 0 }
.row-top { display: flex; align-items: center; gap: 5px; min-width: 0 }
.row-pin-ind { color: var(--teal); display: inline-flex; flex-shrink: 0 }
.row-title { font-size: 13.5px; font-weight: 600; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
.row-date { font-size: 11px; color: var(--text4); margin-top: 2px }
.rename-inp { width: 100%; border: 1px solid var(--teal); border-radius: 8px; background: var(--surface); font-size: 13.5px; color: var(--text1); padding: 3px 7px; outline: none; box-shadow: 0 0 0 3px rgba(var(--teal-rgb),.1) }

.row-actions { display: flex; align-items: center; gap: 3px; flex-shrink: 0; opacity: 0; transition: opacity .15s }
.conv-row:hover .row-actions, .conv-row.active .row-actions { opacity: 1 }
.row-btn { width: 28px; height: 28px; border-radius: 8px; background: var(--surface2); color: var(--text3); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s }
.row-btn:hover { background: rgba(var(--teal-rgb),.14); color: var(--teal) }
.row-btn.danger:hover { background: var(--red-l); color: var(--red) }

.sb-empty { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 48px 20px; gap: 6px }
.sb-empty-ico { width: 56px; height: 56px; border-radius: 18px; background: var(--surface2); display: flex; align-items: center; justify-content: center; margin-bottom: 6px }
.sb-empty-title { font-size: 15px; font-weight: 700; color: var(--text1) }
.sb-empty-sub { font-size: 12.5px; color: var(--text4); line-height: 1.4; max-width: 200px }
.sb-empty-cta, .panel-placeholder .sb-empty-cta { display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; padding: 9px 16px; border-radius: var(--r-md); background: linear-gradient(135deg, var(--teal), var(--teal-h)); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 3px 12px rgba(var(--teal-rgb),.3); transition: transform .16s, box-shadow .18s }
.sb-empty-cta:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(var(--teal-rgb),.5) }
.sb-noresult { text-align: center; font-size: 13px; color: var(--text4); padding: 32px 16px }

/* ── Chat panel ──────────────────────────────────────────────────────── */
.ai-chat-panel { flex: 1; display: flex; flex-direction: column; background: var(--bg); position: relative; overflow: hidden; min-width: 0 }

.chat-head { display: flex; align-items: center; justify-content: space-between; padding: 0 28px; height: var(--topbar); border-bottom: 1px solid var(--border); background: var(--surface); backdrop-filter: blur(12px); position: relative; z-index: 2; flex-shrink: 0 }
.chat-head-l { display: flex; align-items: center; gap: 14px; min-width: 0 }
.chat-head-txt { min-width: 0 }
.menu-btn { display: flex; width: 34px; height: 34px; border-radius: 10px; background: var(--surface2); color: var(--text2); align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; transition: background .15s }
.menu-btn:hover { background: rgba(var(--teal-rgb),.12); color: var(--teal) }
.ai-logo-wrap { width: 44px; height: 44px; border-radius: 14px; background: rgba(var(--teal-rgb),.08); border: 1px solid rgba(var(--teal-rgb),.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0 }
.chatra-glyph { display: block; background: var(--teal); -webkit-mask: url('/logo-icon.png') center / contain no-repeat; mask: url('/logo-icon.png') center / contain no-repeat }
.chatra-glyph.sm { width: 16px; height: 16px }
.chatra-glyph.lg { width: 28px; height: 28px }
.chatra-glyph.xl { width: 44px; height: 44px }
.chat-title { font-family: -apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif; font-size: 20px; font-weight: 800; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
.chat-sub { font-size: 12px; color: var(--text4); margin-top: 1px }
.chat-head-r { display: flex; align-items: center; gap: 10px; flex-shrink: 0 }
.online-pill { font-size: 12px; font-weight: 600; color: var(--green); background: var(--green-l); padding: 5px 14px; border-radius: 100px; border: 1px solid rgba(74,222,128,.2) }

.chat-area { flex: 1; overflow-y: auto; padding: 28px; position: relative; z-index: 1 }

.chat-empty-state, .panel-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100%; gap: 8px }
.panel-placeholder { text-align: center; padding: 20px }
.ai-empty-logo { width: 84px; height: 84px; border-radius: 26px; background: var(--surface); display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 20px rgba(var(--teal-rgb),.18), var(--sh-xs); margin-bottom: 6px }
.empty-title { font-size: 22px; font-weight: 800; letter-spacing: -.02em; color: var(--text1) }
.empty-hint { font-size: 13.5px; color: var(--text4); font-weight: 500; text-align: center; max-width: 380px; line-height: 1.45 }
.tip-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; width: 100%; max-width: 560px; margin-top: 16px }
.tip-card { display: flex; flex-direction: column; align-items: flex-start; gap: 0; padding: 16px; background: var(--surface); border-radius: 22px; box-shadow: var(--sh-sm); text-align: left; transition: transform .16s ease, box-shadow .2s ease; animation: rise .4s cubic-bezier(.16,1,.3,1) both }
.tip-card:hover { transform: translateY(-2px); box-shadow: var(--sh-md) }
.tip-card:active { transform: scale(.98) }
.tip-icon { width: 40px; height: 40px; border-radius: 13px; background: rgba(var(--teal-rgb),.10); color: var(--teal); display: flex; align-items: center; justify-content: center; margin-bottom: 12px }
.tip-title { font-size: 14px; font-weight: 800; color: var(--text1); line-height: 1.2 }
.tip-desc { font-size: 12px; color: var(--text4); line-height: 1.4; margin-top: 5px }
@keyframes rise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
@media (prefers-reduced-motion: reduce) { .tip-card { animation: none } }

.chat-msgs { display: flex; flex-direction: column; gap: 22px }
.chat-msg { display: flex; flex-direction: column; gap: 8px; max-width: 72% }
.chat-msg.user { align-self: flex-end; align-items: flex-end }
.chat-msg.assistant { align-self: flex-start }
.msg-avatar { display: flex; align-items: center; gap: 8px }
.ai-av-icon { width: 26px; height: 26px; border-radius: 8px; background: var(--surface); border: 1px solid rgba(var(--teal-rgb),.2); box-shadow: var(--sh-xs); display: flex; align-items: center; justify-content: center }
.msg-sender { font-size: 12px; font-weight: 700; color: var(--teal) }
.msg-img-preview { max-width: 240px; max-height: 200px; border-radius: 14px; object-fit: cover; border: 1px solid rgba(var(--teal-rgb),.2); box-shadow: 0 4px 16px rgba(0,0,0,.3) }
.msg-bubble { padding: 14px 19px; border-radius: 22px; font-size: 14.5px; line-height: 1.62 }
.msg-bubble.user { background: linear-gradient(135deg, var(--teal), var(--teal-h)); color: #fff; border-bottom-right-radius: 7px; box-shadow: 0 4px 20px rgba(var(--teal-rgb),.3) }
.msg-bubble.assistant { background: var(--surface); color: var(--text1); border-top-left-radius: 7px; box-shadow: var(--sh-xs) }

.typing { display: flex; gap: 5px; padding: 4px 0 }
.typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--teal); animation: pulse 1.2s infinite }
.typing span:nth-child(2) { animation-delay: .2s }
.typing span:nth-child(3) { animation-delay: .4s }

.file-prev { display: flex; align-items: center; justify-content: space-between; padding: 8px 24px; background: rgba(var(--teal-rgb),.08); border-top: 1px solid rgba(var(--teal-rgb),.12); font-size: 13px; font-weight: 500; color: var(--teal); position: relative; z-index: 2; flex-shrink: 0 }
.fp-info { display: flex; align-items: center; gap: 10px }
.fp-thumb { width: 36px; height: 36px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(var(--teal-rgb),.2) }
.fp-badge { font-size: 11px; font-weight: 600; background: rgba(var(--teal-rgb),.12); color: var(--teal); border: 1px solid rgba(var(--teal-rgb),.2); border-radius: 100px; padding: 2px 8px }
.fp-rm { background: none; border: none; cursor: pointer; color: var(--text3); font-size: 20px; padding: 0; line-height: 1; transition: color .15s }
.fp-rm:hover { color: var(--red) }

.chat-inp { display: flex; align-items: center; gap: 10px; padding: 16px 20px; background: var(--surface); backdrop-filter: blur(12px); border-top: 1px solid var(--border); position: relative; z-index: 2; flex-shrink: 0 }
.attach-lbl { cursor: pointer; flex-shrink: 0 }
.attach-icon { width: 38px; height: 38px; border-radius: var(--r-lg); background: var(--surface2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text3); transition: all .15s }
.attach-icon:hover { background: rgba(var(--teal-rgb),.12); border-color: rgba(var(--teal-rgb),.2); color: var(--teal) }
.chat-field { flex: 1; background: var(--surface2); border: 1px solid var(--border); border-radius: 26px; padding: 12px 20px; font-size: 14px; color: var(--text1); transition: all .2s; font-family: -apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif }
.chat-field:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(var(--teal-rgb),.1) }
.chat-field::placeholder { color: var(--text4) }
.chat-field:disabled { opacity: .5 }
.send-btn { width: 42px; height: 42px; border-radius: 50%; background: var(--surface2); border: 1px solid var(--border); color: var(--text4); display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; transition: all .2s }
.send-btn.active { background: linear-gradient(135deg, var(--teal), var(--teal-h)); border-color: transparent; color: #fff; box-shadow: 0 4px 16px rgba(var(--teal-rgb),.4) }
.send-btn.active:hover { box-shadow: 0 6px 24px rgba(var(--teal-rgb),.6); transform: translateY(-1px) }
.send-btn:disabled { opacity: .4; cursor: not-allowed; transform: none }
.send-btn.locked { background: var(--surface2); border-color: var(--border); color: var(--text4); box-shadow: none; opacity: 1 }
.notice-wide { margin: 0 24px 10px; position: relative; z-index: 2 }

:deep(.code-bl) { background: #0a0a16; color: #99e6f0; border-radius: var(--r-md); padding: 14px; margin: 8px 0; overflow-x: auto; font-size: 13px; font-family: monospace; line-height: 1.6; border: 1px solid var(--border) }
:deep(.ic) { background: rgba(var(--teal-rgb),.15); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: .9em; color: var(--teal) }

/* ── Mobile: sidebar becomes a slide-over drawer with backdrop ─────────── */
@media (max-width: 768px) {
  .ai-page { overflow-x: hidden }

  .ai-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.38); z-index: 20; animation: fadeIn .2s ease }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

  .ai-sidebar { position: fixed; inset: 0 auto 0 0; width: 82vw; max-width: 340px; z-index: 21; border-right: none;
    box-shadow: 0 0 40px rgba(0,0,0,.25); transform: translateX(-100%); transition: transform .28s cubic-bezier(.4,0,.2,1) }
  .ai-sidebar.mobile-open { transform: translateX(0) }

  .sb-head { padding: env(safe-area-inset-top, 0px) 14px 0; height: calc(54px + env(safe-area-inset-top, 0px)) }
  .chat-head { padding: env(safe-area-inset-top, 0px) 14px 0; height: calc(54px + env(safe-area-inset-top, 0px)) }
  .chat-title { font-size: 17px }
  .chat-sub { display: none }
  .ai-logo-wrap { display: none }
  .online-pill { display: none }
  .row-actions { opacity: 1 }
  .row-btn { width: 32px; height: 32px }
  .chat-area { padding: 14px 12px }
  .chat-msg { max-width: 88% }
  .msg-bubble { padding: 11px 15px; font-size: 15px; border-radius: 19px }
  .chat-inp { padding: 10px 12px; gap: 6px }
  .chat-field { font-size: 16px; padding: 10px 14px }
  .send-btn { width: 44px; height: 44px }
  .attach-icon { width: 44px; height: 44px }
  .tip-grid { gap: 8px; padding: 0 4px }
  .tip-card { padding: 12px; border-radius: 17px }
  .tip-icon { width: 34px; height: 34px; margin-bottom: 8px }
  .ai-empty-logo { width: 64px; height: 64px; border-radius: 19px }
  .chatra-glyph.xl { width: 34px; height: 34px }
  :deep(.code-bl) { font-size: 12px; overflow-x: auto }
}
@media (max-width: 480px) {
  .chat-head { padding: 0 10px }
  .chat-area { padding: 10px 10px }
  .tip-grid { grid-template-columns: 1fr }
}
</style>
