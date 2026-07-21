<template>
  <div class="cw">
    <!-- Header -->
    <div class="cw-head">
      <div class="cw-head-l">
        <button v-if="props.showBack" class="btn btn-icon btn-ghost back-btn" @click="emit('back')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div class="cw-av">
          <img v-if="chatAvatar" :src="chatAvatar" class="cw-av-img"/>
          <div v-else :class="['av','av-sm',colorFor(chatsStore.active?.id||0)]">{{cInit}}</div>
        </div>
        <div>
          <div class="cw-name">{{chatTitle}}</div>
          <div class="cw-sub">
            <span :class="wsOk?'st-dot-on':'st-dot-off'"></span>
            <span :class="wsOk?'st-on':'st-off'">{{wsOk?(lang==='ru'?'В сети':'Online'):(lang==='ru'?'Оффлайн':'Offline')}}</span>
            <span class="cw-role">· {{ chatRole }}</span>
          </div>
        </div>
      </div>
      <div class="cw-head-r">
        <button class="btn btn-icon btn-ghost" @click="showSearch=!showSearch" title="Search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </button>
      </div>
    </div>

    <!-- Search bar -->
    <Transition name="slide-down">
      <div v-if="showSearch" class="search-bar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text4);flex-shrink:0"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input v-model="searchQ" class="search-inp" placeholder="Поиск в сообщениях..." @keydown.escape="showSearch=false;searchQ=''"/>
      </div>
    </Transition>

    <!-- Messages -->
    <div ref="area" class="msg-area" @scroll="onMsgScroll">
      <div v-if="loadingOlder" class="msg-older-spinner">
        <div class="spinner" style="width:18px;height:18px;border-width:2px"></div>
      </div>
      <div v-if="chatsStore.loadingMsgs" class="empty">
        <div class="spinner" style="width:24px;height:24px;border-width:3px"></div>
      </div>
      <div v-else-if="!filteredMsgs.length" class="empty">
        <div class="empty-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>
        <div class="empty-title">{{searchQ?'Ничего не найдено':'Нет сообщений'}}</div>
        <div class="empty-sub">{{searchQ?'Попробуйте другой запрос':'Начните переписку'}}</div>
      </div>
      <div v-else class="msgs">
        <div style="height:12px"></div>
        <ChatMessage
          v-for="(msg,i) in filteredMsgs"
          :key="msg.id"
          :message="msg"
          :is-own="msg.user_id===auth.user?.id"
          :chat-users="chatsStore.activeUsers"
          :show-name="shouldShowName(filteredMsgs,i)"
          @delete="deleteMsg(msg.id)"
          @scroll="scrollBottom"
        />
        <div style="height:12px"></div>
      </div>
    </div>

    <!-- Input -->
    <div class="inp-wrap">
      <div v-if="pendingFile" class="file-preview">
        <svg v-if="pendingFile.type.startsWith('image/')" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
        <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
        <span>{{pendingFile.name}}</span>
        <button class="btn btn-icon btn-ghost btn-sm" @click="pendingFile=null">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="inp-row">
        <textarea
          ref="ta"
          v-model="msgText"
          class="msg-inp"
          :placeholder="lang==='ru'?'Введите ваш запрос здесь...':'Type your message here...'"
          rows="1"
          @keydown.enter.exact.prevent="sendMessage"
          @input="resizeTA"
        ></textarea>
        <label class="attach-btn" title="Прикрепить файл">
          <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar" style="display:none" @change="onFilePick"/>
          <div class="attach-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
          </div>
        </label>
        <button
          :class="['send-btn',{active:msgText.trim()||pendingFile}]"
          :disabled="(!msgText.trim()&&!pendingFile)||sending"
          @click="sendMessage"
        >
          <div v-if="sending" class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff"></div>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>

  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useChatsStore } from '~/stores/chats.store'
import { useChat } from '~/composables/useChat'
import { useUploadSvc } from '~/services/uploads'
import { useI18n } from '~/composables/useI18n'
import { useUserRegistries } from '~/composables/useUserRegistries'

const props = defineProps<{ showBack?: boolean }>()
const emit = defineEmits<{ (e: 'back'): void }>()

const auth = useAuthStore()
const chatsStore = useChatsStore()
const { lang } = useI18n()
const { loadMsgs, loadOlderMsgs, loadUsers, connectWs, sendMsg, delMsg, MSG_PAGE_SIZE } = useChat()

const otherUserId = computed(() => {
  const users = chatsStore.activeUsers
  return users.find(u => u.id !== auth.user?.id)?.id ?? null
})

const wsOk = computed(() => {
  const uid = otherUserId.value
  if (!uid) return false
  const msgs = chatsStore.activeMsgs
  const last = [...msgs].reverse().find(m => m.user_id === uid)
  if (!last?.created_at) return false
  return Date.now() - new Date(last.created_at).getTime() < 10 * 60 * 1000
})
const uploadSvc = useUploadSvc()

const area = ref<HTMLElement|null>(null)
const ta = ref<HTMLTextAreaElement|null>(null)
const msgText = ref('')
const sending = ref(false)
const pendingFile = ref<File|null>(null)
const showSearch = ref(false)
const searchQ = ref('')

const avColors = ['bg-b0','bg-b1','bg-b2','bg-b3','bg-b4','bg-b5']
const colorFor = (id: number) => avColors[id % avColors.length]

const { nickRegistry, avatarRegistry } = useUserRegistries()
const getAvatar = (uid: number): string => uid===auth.user?.id&&auth.avatar ? auth.avatar : (avatarRegistry.value[uid]||'')

const chatTitle = computed(() => {
  const users = chatsStore.activeUsers
  const other = users.find(u => u.id !== auth.user?.id)
  if (other && users.length <= 2) {
    if (other.full_name) return other.full_name
    const nick = nickRegistry.value[other.id]
    if (nick) return nick
    return other.email.split('@')[0]
  }
  return chatsStore.active?.name || ''
})

const chatAvatar = computed(() => {
  const users = chatsStore.activeUsers
  const other = users.find(u => u.id !== auth.user?.id)
  if (other && users.length <= 2) return getAvatar(other.id)
  return ''
})

const cInit = computed(() => chatTitle.value.replace('@','')[0]?.toUpperCase()||'#')

const chatRole = computed(() => {
  const users = chatsStore.activeUsers
  const other = users.find(u => u.id !== auth.user?.id)
  if (!other) return ''
  if (other.role === 'admin') return lang.value === 'ru' ? 'Администратор' : 'Administrator'
  if (other.role === 'teacher') return lang.value === 'ru' ? 'Научный руководитель' : 'Supervisor'
  return lang.value === 'ru' ? 'Студент' : 'Student'
})

const filteredMsgs = computed(() => {
  if (!searchQ.value) return chatsStore.activeMsgs
  return chatsStore.activeMsgs.filter(m => m.content?.toLowerCase().includes(searchQ.value.toLowerCase()))
})

const shouldShowName = (msgs: any[], i: number) => {
  if (msgs[i].user_id === auth.user?.id) return false
  return !msgs[i-1] || msgs[i-1].user_id !== msgs[i].user_id
}

const scrollBottom = () => nextTick(() => { if (area.value) area.value.scrollTop = area.value.scrollHeight })

// FE-1: подгрузка более ранних сообщений при скролле вверх. loadingOlder не даёт
// параллельных запросов, noMoreOlder — когда достигли начала истории. При
// добавлении сообщений в начало сохраняем позицию скролла (anchor), чтобы список
// не «прыгал» и watcher на length не утаскивал вниз.
const loadingOlder = ref(false)
const noMoreOlder = ref(false)
const onMsgScroll = async () => {
  const el = area.value
  if (!el || loadingOlder.value || noMoreOlder.value || searchQ.value) return
  if (el.scrollTop > 80) return
  const chat = chatsStore.active
  if (!chat) return
  loadingOlder.value = true
  const prevHeight = el.scrollHeight
  const prevTop = el.scrollTop
  const added = await loadOlderMsgs(chat.id)
  if (added < MSG_PAGE_SIZE) noMoreOlder.value = true
  await nextTick()
  if (area.value) area.value.scrollTop = prevTop + (area.value.scrollHeight - prevHeight)
  loadingOlder.value = false
}
const resizeTA = () => { if (!ta.value) return; ta.value.style.height='auto'; ta.value.style.height=Math.min(ta.value.scrollHeight,140)+'px' }
const onFilePick = (e: Event) => { const f=(e.target as HTMLInputElement).files?.[0]; if(f) pendingFile.value=f }





const sendMessage = async () => {
  if (!chatsStore.active || (!msgText.value.trim() && !pendingFile.value)) return
  sending.value = true
  try {
    let content = msgText.value.trim()
    if (pendingFile.value) {
      const { file_url } = await uploadSvc.upload(pendingFile.value)
      const isImg = pendingFile.value.type.startsWith('image/')
      content = isImg
        ? `🖼️ [Фото](${file_url}) — ${pendingFile.value.name}`
        : `📎 [Файл](${file_url}) — ${pendingFile.value.name}`
      pendingFile.value = null
    }
    if (content) {
      const ok = await sendMsg(chatsStore.active.id, content)
      if (ok) { msgText.value=''; if(ta.value) ta.value.style.height='auto' }
    }
    scrollBottom()
  } finally { sending.value=false }
}

const deleteMsg = (id: number) => { if (chatsStore.active) delMsg(chatsStore.active.id, id) }

watch(() => chatsStore.active, async c => {
  if (c) {
    searchQ.value = ''
    noMoreOlder.value = false
    await Promise.all([loadMsgs(c.id), loadUsers(c.id)])
    connectWs(c.id)
    scrollBottom()
  }
}, { immediate: true })

// FE-1: авто-прокрутка вниз только когда мы НЕ догружаем старые сообщения
// (иначе подгрузка вверх мгновенно утаскивала бы список обратно вниз).
watch(() => chatsStore.activeMsgs.length, () => { if (!loadingOlder.value) scrollBottom() })
</script>
<style scoped>
.cw{display:flex;flex-direction:column;height:100%;background:var(--bg)}
.back-btn{margin-right:4px;flex-shrink:0}
.cw-head{display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:60px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--surface)}
@media (max-width:768px){
  .cw-head{padding:env(safe-area-inset-top, 0px) 10px 0;height:calc(56px + env(safe-area-inset-top, 0px))}
  .cw-head-r{gap:0}
  .cw-head-r .btn-icon{min-width:44px;min-height:44px}
  .back-btn{min-width:44px;min-height:44px;color:var(--teal)}
  .inp-row{padding:8px 10px;gap:4px;align-items:flex-end}
  .attach-icon{width:44px;height:44px}
  .send-btn{width:40px;height:40px;margin-bottom:2px}
  /* Поле ввода — пузырёк как в iMessage */
  .msg-inp{font-size:16px;background:var(--bg2);border-radius:20px;padding:10px 14px;min-height:40px}
  html.dark .msg-inp{background:var(--surface2)}
  .cw-name{font-size:15px}
  .cw-role{display:none}
}
.cw-head-l{display:flex;align-items:center;gap:12px}
.cw-av{flex-shrink:0;position:relative}
.cw-av-img{width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid rgba(var(--teal-rgb),.2)}
.cw-name{font-size:15px;font-weight:700;color:var(--text1)}
.cw-sub{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text4);margin-top:1px}
.st-dot-on{width:7px;height:7px;border-radius:50%;background:#22c55e;flex-shrink:0}
.st-dot-off{width:7px;height:7px;border-radius:50%;background:var(--text4);flex-shrink:0}
.st-on{color:#22c55e;font-weight:600}.st-off{color:var(--text4)}
.cw-role{color:var(--text4)}
.cw-head-r{display:flex;gap:4px}
.search-bar{display:flex;align-items:center;gap:8px;padding:8px 16px;border-bottom:1px solid var(--border);background:var(--surface2);flex-shrink:0}
.search-inp{flex:1;border:none;background:none;font-size:13px;color:var(--text1)}
.search-inp::placeholder{color:var(--text4)}
.msg-area{flex:1;overflow-y:auto;background:var(--bg)}
/* .empty центрируется своим flex(column)+justify-content:center, но это
   работает только если у него есть высота — msg-area не flex-контейнер,
   поэтому без явной height блок садится по верху. */
.msg-area>.empty{height:100%}
.msg-older-spinner{display:flex;justify-content:center;padding:8px 0}
.msgs{display:flex;flex-direction:column;gap:1px}
.inp-wrap{border-top:1px solid var(--border);background:var(--surface);flex-shrink:0}
.file-preview{display:flex;align-items:center;justify-content:space-between;padding:6px 14px;background:var(--teal-l);border-bottom:1px solid var(--teal-m);font-size:13px;color:var(--teal);font-weight:500}
.inp-row{display:flex;align-items:center;gap:10px;padding:10px 16px}
.attach-btn{cursor:pointer;flex-shrink:0}
.attach-icon{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--text4);transition:all .15s}
.attach-icon:hover{color:var(--teal)}
.msg-inp{flex:1;border:none;background:none;font-size:14px;line-height:1.4;resize:none;max-height:140px;color:var(--text1);outline:none}
.msg-inp::placeholder{color:var(--text4)}
.send-btn{width:40px;height:40px;border-radius:50%;background:var(--surface3);color:var(--text4);display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;border:none;transition:all .2s}
.send-btn.active{background:var(--teal);color:#fff;box-shadow:0 4px 14px rgba(var(--teal-rgb),.4)}
.send-btn.active:hover{background:var(--teal-h);transform:scale(1.05)}
.send-btn:disabled{opacity:.5;cursor:not-allowed}
.slide-down-enter-active,.slide-down-leave-active{transition:all .2s ease}
.slide-down-enter-from,.slide-down-leave-to{opacity:0;transform:translateY(-8px)}
.bg-b0{background:#00B1C9}.bg-b1{background:#009aaf}.bg-b2{background:#0d9488}.bg-b3{background:#0e7490}.bg-b4{background:#06b6d4}.bg-b5{background:#22d3ee}
</style>