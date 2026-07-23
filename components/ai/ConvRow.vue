<template>
  <div class="conv-row" :class="{ active }" @click="handleRowClick">
    <div class="row-main">
      <div class="row-top">
        <span v-if="conv.pinned" class="row-pin-ind">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5M9 10.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V16a1 1 0 001 1h12a1 1 0 001-1v-.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V7a1 1 0 011-1 2 2 0 000-4H8a2 2 0 000 4 1 1 0 011 1z"/></svg>
        </span>
        <input
          v-if="renaming"
          ref="renameInputEl"
          v-model="renameText"
          class="rename-inp"
          @keydown.enter.prevent="commit"
          @keydown.esc.prevent="cancel"
          @blur="commit"
          @click.stop
        />
        <div v-else class="row-title">{{ conv.title || t('ai.untitled') }}</div>
      </div>
      <div class="row-date">{{ dateLabel }}</div>
    </div>

    <div v-if="!renaming" class="row-menu-wrap" :class="{ 'menu-open': menuOpen }">
      <button
        ref="btnEl"
        class="row-btn"
        :class="{ active: menuOpen }"
        :title="t('ai.more')"
        @click.stop="toggleMenu"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
      </button>

      <Teleport to="body">
        <div v-if="menuOpen" class="row-menu" :style="{ top: menuPos.top + 'px', right: menuPos.right + 'px' }" @click.stop>
          <button class="row-menu-item" @click="onRename">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/></svg>
            <span>{{ t('ai.rename') }}</span>
          </button>
          <div class="row-menu-divider"/>
          <button class="row-menu-item" @click="onTogglePin">
            <svg width="17" height="17" viewBox="0 0 24 24" :fill="conv.pinned ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5M9 10.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V16a1 1 0 001 1h12a1 1 0 001-1v-.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V7a1 1 0 011-1 2 2 0 000-4H8a2 2 0 000 4 1 1 0 011 1z"/></svg>
            <span>{{ conv.pinned ? t('ai.unpin') : t('ai.pin') }}</span>
          </button>
          <button class="row-menu-item danger" @click="onDelete">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            <span>{{ t('ai.delete') }}</span>
          </button>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useAiChatsStore } from '~/stores/aiChats.store'
import { useI18n } from '~/composables/useI18n'
import type { AiThread } from '~/services/ai'

const props = defineProps<{ conv: AiThread; active: boolean }>()
const emit = defineEmits<{ open: [id: number] }>()

const store = useAiChatsStore()
const { t, lang } = useI18n()

const tt = (ru: string, kk: string, en: string) =>
  lang.value === 'ru' ? ru : lang.value === 'kk' ? kk : en

const dateLabel = computed(() => {
  const d = new Date(props.conv.updated_at)
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
})

// ── Row menu (floating popover, teleported so the sidebar's overflow:auto never clips it) ──
const menuOpen = ref(false)
const menuPos = ref({ top: 0, right: 0 })
const btnEl = ref<HTMLElement | null>(null)

const closeMenu = () => { menuOpen.value = false }
const toggleMenu = () => {
  if (menuOpen.value) { closeMenu(); return }
  const r = btnEl.value!.getBoundingClientRect()
  menuPos.value = { top: r.bottom + 6, right: window.innerWidth - r.right }
  menuOpen.value = true
}

const onDocClick = () => { if (menuOpen.value) closeMenu() }
const onScroll = () => { if (menuOpen.value) closeMenu() }

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('scroll', onScroll, true)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('scroll', onScroll, true)
})

// ── Inline rename ──
const renaming = ref(false)
const renameText = ref('')
const renameInputEl = ref<HTMLInputElement | null>(null)

const startRename = () => {
  renaming.value = true
  renameText.value = props.conv.title
  nextTick(() => { renameInputEl.value?.focus(); renameInputEl.value?.select() })
}
const commit = () => {
  if (!renaming.value) return
  renaming.value = false
  store.rename(props.conv.id, renameText.value)
}
const cancel = () => { renaming.value = false }

// ── Actions ──
const onRename = () => { closeMenu(); startRename() }
const onTogglePin = () => { closeMenu(); store.togglePin(props.conv.id) }
const onDelete = () => {
  closeMenu()
  if (!import.meta.client) return
  if (window.confirm(t('ai.delete_confirm'))) store.remove(props.conv.id)
}

const handleRowClick = () => {
  if (renaming.value) return
  emit('open', props.conv.id)
}
</script>

<style scoped>
.conv-row { display: flex; align-items: center; gap: 8px; padding: 10px 10px; border-radius: var(--r-lg); cursor: pointer; transition: background .15s; position: relative }
.conv-row:hover { background: var(--surface2) }
.conv-row.active { background: rgba(var(--teal-rgb),.1) }
.conv-row.active .row-title { color: var(--teal) }
.row-main { flex: 1; min-width: 0 }
.row-top { display: flex; align-items: center; gap: 5px; min-width: 0 }
.row-pin-ind { color: var(--teal); display: inline-flex; flex-shrink: 0 }
.row-title { flex: 1; min-width: 0; font-size: 13.5px; font-weight: 600; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
.row-date { font-size: 11px; color: var(--text4); margin-top: 2px }
.rename-inp { width: 100%; border: 1px solid var(--teal); border-radius: 8px; background: var(--surface); font-size: 13.5px; color: var(--text1); padding: 3px 7px; outline: none; box-shadow: 0 0 0 3px rgba(var(--teal-rgb),.1) }

.row-menu-wrap { position: relative; flex-shrink: 0; align-self: center; opacity: 0; transition: opacity .15s }
.conv-row:hover .row-menu-wrap, .conv-row.active .row-menu-wrap, .row-menu-wrap.menu-open { opacity: 1 }
.row-btn { width: 28px; height: 28px; border-radius: 8px; background: var(--surface2); color: var(--text3); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .15s, color .15s, transform .12s; border: none }
.row-btn:hover, .row-btn.active { background: rgba(var(--teal-rgb),.14); color: var(--teal) }
.row-btn:active { transform: scale(.92) }

.row-menu { position: fixed; z-index: 1000; min-width: 200px; padding: 8px; background: var(--surface); border: 1px solid var(--border); border-radius: 18px; box-shadow: 0 12px 32px rgba(0,0,0,.16), var(--sh-md); display: flex; flex-direction: column; transform-origin: top right; animation: menuIn .16s cubic-bezier(.16,1,.3,1) both }
@keyframes menuIn { from { opacity: 0; transform: translateY(-6px) scale(.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
.row-menu-divider { height: 1px; margin: 6px 4px; background: var(--border) }
.row-menu-item { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 11px; background: none; border: none; font-size: 14px; font-weight: 600; color: var(--text2); text-align: left; cursor: pointer; transition: background .12s }
.row-menu-item:hover { background: var(--surface2) }
.row-menu-item.danger { color: var(--red) }
.row-menu-item.danger:hover { background: var(--red-l) }

@media (max-width: 768px) {
  .row-menu-wrap { opacity: 1 }
  .row-btn { width: 32px; height: 32px }
}
</style>
