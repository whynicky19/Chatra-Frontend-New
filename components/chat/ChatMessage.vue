<template>
  <div :class="['mrow',{own:isOwn}]">
    <!-- Avatar -->
    <div v-if="!isOwn" class="msg-av" style="align-self:flex-end">
      <img v-if="senderAvatar" :src="senderAvatar" class="msg-av-img"/>
      <div v-else :class="['av','av-sm',colorFor(message.user_id)]">{{senderInit}}</div>
    </div>

    <div :class="['mgroup',{own:isOwn}]">
      <!-- Sender nick -->
      <div v-if="showName&&!isOwn" class="sender-name">{{senderNick}}</div>

      <!-- Bubble -->
      <div :class="['bubble',isOwn?'b-own':'b-other']" @mouseenter="hov=true" @mouseleave="hov=false">
        <!-- Image -->
        <img v-if="isImage" :src="fileUrl" class="msg-img" @load="$emit('scroll')" @click="lightbox=true"/>
        <!-- File -->
        <a v-else-if="isFile" :href="fileUrl" target="_blank" class="msg-file">
          <span class="ftb" style="font-size:9px;font-weight:800;padding:3px 7px;border-radius:4px;flex-shrink:0">{{fileExt.toUpperCase()||'FILE'}}</span>
          <div>
            <div class="file-name truncate">{{fileName}}</div>
            <div style="font-size:11px;opacity:.6;margin-top:1px">Скачать</div>
          </div>
        </a>
        <!-- Text -->
        <div v-else class="msg-text">{{message.content}}</div>

        <!-- Time -->
        <div class="msg-time">{{msgTime}}</div>

        <!-- Hover actions -->
        <Transition name="ha">
          <div v-if="hov&&isOwn" :class="['msg-actions',{own:isOwn}]">
            <button class="ea-del" @click.stop="$emit('delete')" title="Удалить">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </div>
        </Transition>
      </div>

    </div>

    <!-- Own avatar -->
    <div v-if="isOwn" class="msg-av" style="align-self:flex-end">
      <img v-if="ownAvatar" :src="ownAvatar" class="msg-av-img"/>
      <div v-else class="av av-sm bg-b0">{{ownInit}}</div>
    </div>

    <!-- Lightbox -->
    <div v-if="lightbox" class="lightbox" @click="lightbox=false">
      <img :src="fileUrl"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useUserRegistries } from '~/composables/useUserRegistries'

const props = defineProps<{
  message: any
  isOwn: boolean
  chatUsers?: any[]
  showName?: boolean
}>()
defineEmits<{delete:[]; scroll:[]}>()

const auth = useAuthStore()
const hov = ref(false)
const lightbox = ref(false)

const avColors = ['bg-b0','bg-b1','bg-b2','bg-b3','bg-b4','bg-b5']
const colorFor = (id: number) => avColors[id % avColors.length]

const { nickRegistry, avatarRegistry } = useUserRegistries()

const getAvatar = (uid: number): string => {
  if (uid === auth.user?.id && auth.avatar) return auth.avatar
  return avatarRegistry.value[uid] || ''
}
const getNickForUser = (uid: number): string => {
  const u = props.chatUsers?.find(u => u.id === uid)
  if (u?.full_name) return u.full_name
  if (nickRegistry.value[uid]) return nickRegistry.value[uid]
  return u?.email?.split('@')[0] || `User ${uid}`
}

const senderNick = computed(() => getNickForUser(props.message.user_id))
const senderInit = computed(() => senderNick.value[0]?.toUpperCase() || '?')
const senderAvatar = computed(() => getAvatar(props.message.user_id))
const ownInit = computed(() => (auth.user?.email || '?')[0]?.toUpperCase())
const ownAvatar = computed(() => auth.avatar || getAvatar(auth.user?.id || 0))

// Вложение: сайт шлёт markdown «🖼️ [Фото](url) — имя», приложение — голую
// ссылку «/uploads/xxx.png». Раньше учитывался только первый формат, поэтому
// фото из приложения показывалось строкой с путём вместо картинки.
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'bmp']
const pathOf = (url: string) => url.split('#')[0].split('?')[0]

const attachment = computed(() => {
  const raw = (props.message.content || '').trim()
  if (!raw) return null
  const md = raw.match(/\[[^\]]*\]\(([^()\s]+)\)/)
  if (md) {
    return { url: md[1], name: raw.match(/—\s*(.+)$/)?.[1]?.trim() || pathOf(md[1]).split('/').pop() || 'Файл' }
  }
  if (!/\s/.test(raw) && /^(https?:\/\/\S+?)?\/?uploads\/\S+$/i.test(raw)) {
    const name = decodeURIComponent(raw.split('#')[1] || pathOf(raw).split('/').pop() || 'Файл')
    return { url: raw, name }
  }
  return null
})

const isImage = computed(() => {
  const url = attachment.value?.url
  if (!url) return false
  const ext = pathOf(url).split('.').pop()?.toLowerCase() || ''
  return IMAGE_EXTS.includes(ext)
})
const isFile = computed(() => !!attachment.value && !isImage.value)
// Относительная ссылка ведёт на бэкенд, а не на origin сайта.
const apiBase = (useRuntimeConfig().public.apiBase as string) || ''
const fileUrl = computed(() => {
  const url = attachment.value?.url || ''
  return url.startsWith('/') ? `${apiBase}${url}` : url
})
const fileName = computed(() => attachment.value?.name || 'Файл')
const fileExt = computed(() => fileName.value.split('.').pop()?.toLowerCase() || '')
const fileEmoji = computed(() => ({pdf:'📄',doc:'📝',docx:'📝',xls:'📊',xlsx:'📊',zip:'🗜️',mp4:'🎥',mp3:'🎵'})[fileExt.value] || '📎')

const msgTime = computed(() => {
  if (!props.message.created_at) return ''
  try { return new Date(props.message.created_at).toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'}) }
  catch { return '' }
})



</script>
<style scoped>
.mrow{display:flex;align-items:flex-end;gap:8px;padding:2px 16px;animation:fadeIn .15s ease}
.mrow.own{flex-direction:row-reverse}
.mgroup{display:flex;flex-direction:column;max-width:70%}
.mgroup.own{align-items:flex-end}
.msg-av{flex-shrink:0}
.msg-av-img{width:32px;height:32px;border-radius:50%;object-fit:cover;border:1px solid var(--border)}
.sender-name{font-size:12px;font-weight:600;color:var(--accent);margin-bottom:3px;padding-left:2px}
.bubble{position:relative;border-radius:var(--r-lg);word-break:break-word;transition:box-shadow .15s}
.b-other{background:var(--surface2);border:1px solid var(--border);border-bottom-left-radius:4px;color:var(--text1)}
.b-own{background:linear-gradient(135deg,var(--teal-d),var(--teal));color:#fff;border-bottom-right-radius:4px;box-shadow:0 4px 12px rgba(var(--teal-rgb),.3)}
.msg-text{font-size:14px;line-height:1.5;padding:9px 13px;white-space:pre-wrap}
.msg-img{max-width:260px;max-height:220px;border-radius:var(--r-md);cursor:pointer;display:block;margin:6px}
.msg-file{display:flex;align-items:center;gap:10px;padding:10px 13px;text-decoration:none;color:inherit}
.file-name{font-size:13px;font-weight:500;max-width:160px}
.b-own .msg-file{color:#fff}
.msg-time{font-size:11px;opacity:.55;padding:0 10px 6px;text-align:right}
.msg-actions{position:absolute;top:-38px;left:0;display:flex;align-items:center;gap:2px;background:var(--surface);border:1px solid var(--border);border-radius:100px;padding:4px 8px;box-shadow:var(--sh-md);z-index:10;white-space:nowrap}
.msg-actions.own{left:auto;right:0}
.ea-del{display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;cursor:pointer;border:none;background:none;color:var(--text3);transition:all .12s}
.ea-del:hover{background:var(--red-l);color:var(--red)}
.lightbox{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out}
.lightbox img{max-width:90vw;max-height:90vh;border-radius:var(--r-lg)}
.ha-enter-active,.ha-leave-active{transition:opacity .15s}
.ha-enter-from,.ha-leave-to{opacity:0}
.bg-b0{background:#2563eb}
</style>