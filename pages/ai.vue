<template>
  <div class="ai-page anim-in">
    <div class="ai-chat-panel">
      <!-- Header -->
      <div class="chat-head">
        <div class="chat-head-l">
          <div class="ai-logo-wrap"><span class="chatra-glyph lg"></span></div>
          <div>
            <div class="chat-title">Chatra <span style="color:var(--teal)">AI</span></div>
            <div class="chat-sub">{{ tt('Ваш учебный ассистент', 'Сіздің оқу көмекшіңіз', 'Your learning assistant') }}</div>
          </div>
        </div>
        <div class="chat-head-r">
          <button v-if="msgs.length" class="clear-btn" :title="tt('Очистить чат', 'Чатты тазалау', 'Clear chat')" @click="clearChat">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
          <div class="online-pill">● Онлайн</div>
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
            <!-- Image preview if user sent image -->
            <img v-if="m.imagePreview" :src="m.imagePreview" class="msg-img-preview" alt="uploaded"/>
            <div :class="['msg-bubble', m.role]" v-html="fmt(m.text)"></div>
          </div>

          <!-- Typing indicator -->
          <div v-if="loading" class="chat-msg assistant">
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

      <!-- Quota bar for students -->
      <div v-if="ai.aiLimitReached.value" class="quota-bar exhausted">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Лимит запросов исчерпан ({{ ai.AI_LIMIT }}/{{ ai.AI_LIMIT }}). Обратитесь к администратору.
      </div>
      <div v-else-if="!ai.aiUnlimited.value && auth.user?.role === 'student'" class="quota-bar" :class="{ warn: ai.aiRemaining.value <= 2 }">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        Осталось запросов к ИИ: <strong>{{ ai.aiRemaining.value }} / {{ ai.AI_LIMIT }}</strong>
      </div>

      <!-- File preview bar -->
      <div v-if="pendingFile" class="file-prev">
        <div class="fp-info">
          <img v-if="pendingPreview" :src="pendingPreview" class="fp-thumb" alt="preview"/>
          <span v-if="pendingFile.type.startsWith('image/')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg></span>
          <span v-else><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg></span>
          <span>{{pendingFile.name}}</span>
          <span v-if="pendingFile.type.startsWith('image/')" class="fp-badge">ИИ прочитает текст</span>
        </div>
        <button class="fp-rm" @click="clearFile">×</button>
      </div>

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
          :placeholder="ai.aiLimitReached.value ? 'Лимит запросов исчерпан...' : 'Написать сообщение или спросить кое что...'"
          :disabled="loading || ai.aiLimitReached.value"
          @keydown.enter="send"
        />
        <button
          :class="['send-btn', {active: (txt.trim() || pendingFile) && !ai.aiLimitReached.value}]"
          :disabled="(!txt.trim() && !pendingFile) || loading || ai.aiLimitReached.value"
          @click="send"
        >
          <div v-if="loading" class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useAi } from '~/composables/useAi'
import { useI18n } from '~/composables/useI18n'
import { useAuthStore } from '~/stores/auth.store'

definePageMeta({ layout: 'default' })

const ai = useAi()
const auth = useAuthStore()
const { t, lang } = useI18n()
const msgs = computed(() => ai.msgs.value)
const loading = computed(() => ai.loading.value)

const area = ref<HTMLElement | null>(null)
const inp = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const txt = ref('')
const pendingFile = ref<File | null>(null)
const pendingPreview = ref<string | null>(null)

const tt = (ru: string, kk: string, en: string) =>
  lang.value === 'ru' ? ru : lang.value === 'kk' ? kk : en

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
const fmt = (t: string) => t
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
  // Reset input so same file can be picked again
  if (fileInput.value) fileInput.value.value = ''
}

const clearFile = () => {
  pendingFile.value = null
  pendingPreview.value = null
}

const send = async () => {
  if ((!txt.value.trim() && !pendingFile.value) || loading.value) return
  const message = txt.value
  const file = pendingFile.value
  txt.value = ''
  pendingFile.value = null
  pendingPreview.value = null
  await ai.send(message, file)
  scroll()
}

const quick = async (prompt: string) => {
  txt.value = prompt
  await send()
}

const clearChat = () => {
  if (!import.meta.client) return
  if (window.confirm(tt('Очистить чат? История переписки будет удалена.',
    'Чатты тазалау керек пе? Хат алмасу тарихы жойылады.',
    'Clear the chat? The conversation history will be deleted.'))) {
    ai.clear()
  }
}

watch(() => ai.msgs.value.length, () => scroll())
</script>

<style scoped>
.ai-page { display: flex; height: 100%; overflow: hidden }
.ai-chat-panel { flex: 1; display: flex; flex-direction: column; background: var(--bg); position: relative; overflow: hidden }

/* Header */
.chat-head { display: flex; align-items: center; justify-content: space-between; padding: 0 28px; height: var(--topbar); border-bottom: 1px solid var(--border); background: var(--surface); backdrop-filter: blur(12px); position: relative; z-index: 2; flex-shrink: 0 }
.chat-head-l { display: flex; align-items: center; gap: 14px }
.ai-logo-wrap { width: 44px; height: 44px; border-radius: 14px; background: rgba(var(--teal-rgb),.08); border: 1px solid rgba(var(--teal-rgb),.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0 }
/* Знак Chatra: PNG как маска, красится в цвет темы */
.chatra-glyph { display: block; background: var(--teal); -webkit-mask: url('/logo-icon.png') center / contain no-repeat; mask: url('/logo-icon.png') center / contain no-repeat }
.chatra-glyph.sm { width: 16px; height: 16px }
.chatra-glyph.lg { width: 28px; height: 28px }
.chatra-glyph.xl { width: 44px; height: 44px }
.chat-title { font-family: -apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif; font-size: 20px; font-weight: 800; color: var(--text1) }
.chat-sub { font-size: 12px; color: var(--text4); margin-top: 1px }
.chat-head-r { display: flex; align-items: center; gap: 10px }
.clear-btn { width: 34px; height: 34px; border-radius: 10px; background: rgba(var(--teal-rgb),.08); color: var(--teal); display: flex; align-items: center; justify-content: center; transition: all .18s }
.clear-btn:hover { background: rgba(var(--teal-rgb),.16) }
.online-pill { font-size: 12px; font-weight: 600; color: var(--green); background: var(--green-l); padding: 5px 14px; border-radius: 100px; border: 1px solid rgba(74,222,128,.2) }

/* Messages */
.chat-area { flex: 1; overflow-y: auto; padding: 28px; position: relative; z-index: 1 }

/* Empty state */
.chat-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100%; gap: 8px }
.ai-empty-logo { width: 84px; height: 84px; border-radius: 24px; background: var(--surface); display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 20px rgba(var(--teal-rgb),.18), var(--sh-xs); margin-bottom: 6px }
.empty-title { font-size: 22px; font-weight: 800; letter-spacing: -.02em; color: var(--text1) }
.empty-hint { font-size: 13.5px; color: var(--text4); font-weight: 500; text-align: center; max-width: 380px; line-height: 1.45 }
.tip-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; width: 100%; max-width: 560px; margin-top: 16px }
.tip-card { display: flex; flex-direction: column; align-items: flex-start; gap: 0; padding: 16px; background: var(--surface); border-radius: 20px; box-shadow: var(--sh-sm); text-align: left; transition: transform .16s ease, box-shadow .2s ease; animation: rise .4s cubic-bezier(.16,1,.3,1) both }
.tip-card:hover { transform: translateY(-2px); box-shadow: var(--sh-md) }
.tip-card:active { transform: scale(.98) }
.tip-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(var(--teal-rgb),.10); color: var(--teal); display: flex; align-items: center; justify-content: center; margin-bottom: 12px }
.tip-title { font-size: 14px; font-weight: 800; color: var(--text1); line-height: 1.2 }
.tip-desc { font-size: 12px; color: var(--text4); line-height: 1.4; margin-top: 5px }
@keyframes rise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
@media (prefers-reduced-motion: reduce) { .tip-card { animation: none } }

/* Chat messages */
.chat-msgs { display: flex; flex-direction: column; gap: 20px }
.chat-msg { display: flex; flex-direction: column; gap: 8px; max-width: 72% }
.chat-msg.user { align-self: flex-end; align-items: flex-end }
.chat-msg.assistant { align-self: flex-start }
.msg-avatar { display: flex; align-items: center; gap: 8px }
.ai-av-icon { width: 26px; height: 26px; border-radius: 8px; background: var(--surface); border: 1px solid rgba(var(--teal-rgb),.2); box-shadow: var(--sh-xs); display: flex; align-items: center; justify-content: center }
.msg-sender { font-size: 12px; font-weight: 700; color: var(--teal) }

/* Image preview in message */
.msg-img-preview { max-width: 240px; max-height: 200px; border-radius: 12px; object-fit: cover; border: 1px solid rgba(var(--teal-rgb),.2); box-shadow: 0 4px 16px rgba(0,0,0,.3) }

.msg-bubble { padding: 13px 18px; border-radius: 20px; font-size: 14px; line-height: 1.6 }
.msg-bubble.user { background: linear-gradient(135deg, var(--teal), var(--teal-h)); color: #fff; border-bottom-right-radius: 6px; box-shadow: 0 4px 20px rgba(var(--teal-rgb),.3) }
.msg-bubble.assistant { background: var(--surface); color: var(--text1); border-top-left-radius: 6px; box-shadow: var(--sh-xs) }

/* Typing */
.typing { display: flex; gap: 5px; padding: 4px 0 }
.typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--teal); animation: pulse 1.2s infinite }
.typing span:nth-child(2) { animation-delay: .2s }
.typing span:nth-child(3) { animation-delay: .4s }

/* File preview bar */
.quota-bar { display: flex; align-items: center; gap: 7px; padding: 8px 24px; font-size: 12px; color: var(--teal); background: rgba(var(--teal-rgb),.07); border-top: 1px solid rgba(var(--teal-rgb),.12); flex-shrink: 0; position: relative; z-index: 2 }
.quota-bar.warn { color: #f59e0b; background: rgba(245,158,11,.07); border-top-color: rgba(245,158,11,.15) }
.quota-bar.exhausted { color: var(--red); background: var(--red-l); border-top-color: rgba(248,113,113,.2) }
.file-prev { display: flex; align-items: center; justify-content: space-between; padding: 8px 24px; background: rgba(var(--teal-rgb),.08); border-top: 1px solid rgba(var(--teal-rgb),.12); font-size: 13px; font-weight: 500; color: var(--teal); position: relative; z-index: 2; flex-shrink: 0 }
.fp-info { display: flex; align-items: center; gap: 10px }
.fp-thumb { width: 36px; height: 36px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(var(--teal-rgb),.2) }
.fp-badge { font-size: 11px; font-weight: 600; background: rgba(var(--teal-rgb),.12); color: var(--teal); border: 1px solid rgba(var(--teal-rgb),.2); border-radius: 100px; padding: 2px 8px }
.fp-rm { background: none; border: none; cursor: pointer; color: var(--text3); font-size: 20px; padding: 0; line-height: 1; transition: color .15s }
.fp-rm:hover { color: var(--red) }

/* Input */
.chat-inp { display: flex; align-items: center; gap: 10px; padding: 14px 20px; background: var(--surface); backdrop-filter: blur(12px); border-top: 1px solid var(--border); position: relative; z-index: 2; flex-shrink: 0 }
.attach-lbl { cursor: pointer; flex-shrink: 0 }
.attach-icon { width: 36px; height: 36px; border-radius: var(--r-md); background: var(--surface2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text3); transition: all .15s }
.attach-icon:hover { background: rgba(var(--teal-rgb),.12); border-color: rgba(var(--teal-rgb),.2); color: var(--teal) }
.chat-field { flex: 1; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-xl); padding: 11px 18px; font-size: 14px; color: var(--text1); transition: all .2s; font-family: -apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif }
.chat-field:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(var(--teal-rgb),.1) }
.chat-field::placeholder { color: var(--text4) }
.chat-field:disabled { opacity: .5 }
.send-btn { width: 40px; height: 40px; border-radius: var(--r-md); background: var(--surface2); border: 1px solid var(--border); color: var(--text4); display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; transition: all .2s }
.send-btn.active { background: linear-gradient(135deg, var(--teal), var(--teal-h)); border-color: transparent; color: #fff; box-shadow: 0 4px 16px rgba(var(--teal-rgb),.4) }
.send-btn.active:hover { box-shadow: 0 6px 24px rgba(var(--teal-rgb),.6); transform: translateY(-1px) }
.send-btn:disabled { opacity: .4; cursor: not-allowed; transform: none }

/* Code blocks */
:deep(.code-bl) { background: #0a0a16; color: #99e6f0; border-radius: var(--r-md); padding: 14px; margin: 8px 0; overflow-x: auto; font-size: 13px; font-family: monospace; line-height: 1.6; border: 1px solid var(--border) }
:deep(.ic) { background: rgba(var(--teal-rgb),.15); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: .9em; color: var(--teal) }

@media (max-width:768px) {
  .ai-page { overflow-x: hidden; }
  .chat-head { padding: 0 14px; height: 54px; }
  .chat-title { font-size: 16px; }
  .chat-sub { display: none; }
  .online-pill { font-size: 11px; padding: 4px 10px; }
  .clear-btn { width: 44px; height: 44px; border-radius: 12px; }
  .chat-area { padding: 14px 12px; }
  .chat-msg { max-width: 90%; }
  .msg-bubble { padding: 10px 14px; font-size: 13px; }
  .chat-inp { padding: 10px 12px; gap: 6px; }
  .chat-field { font-size: 16px; padding: 10px 14px; }
  .send-btn { width: 44px; height: 44px; }
  .attach-icon { width: 44px; height: 44px; }
  .tip-grid { gap: 8px; padding: 0 4px; }
  .tip-card { padding: 12px; border-radius: 16px; }
  .tip-icon { width: 34px; height: 34px; margin-bottom: 8px; }
  .ai-empty-logo { width: 64px; height: 64px; border-radius: 18px; }
  .chatra-glyph.xl { width: 34px; height: 34px; }
  :deep(.code-bl) { font-size: 12px; overflow-x: auto; }
}
@media (max-width:480px) {
  .chat-head { padding: 0 10px; }
  .ai-logo-wrap { width: 36px; height: 36px; border-radius: 10px; }
  .chat-area { padding: 10px 10px; }
  .tip-grid { grid-template-columns: 1fr; }
}
</style>
