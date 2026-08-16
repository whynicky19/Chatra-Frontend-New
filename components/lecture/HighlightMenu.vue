<template>
  <div
    class="hm"
    :class="{ 'hm-below': below }"
    :style="{ left: `${x}px`, top: `${y}px` }"
    @mousedown.prevent
    @pointerdown.stop
    @click.stop
  >
    <div v-if="!noteOpen" class="hm-row">
      <button
        v-for="c in HIGHLIGHT_COLORS"
        :key="c"
        class="hm-color"
        :class="[`hm-${c}`, { active: c === color }]"
        :title="t(`hl.color_${c}`)"
        :aria-label="t(`hl.color_${c}`)"
        @click="$emit('pick-color', c)"
      ><span></span></button>

      <span class="hm-sep"></span>

      <button class="hm-btn" :class="{ active: !!note }" :title="t('hl.note')" @click="$emit('open-note')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
        <span class="hm-label">{{ t('hl.note') }}</span>
      </button>

      <button class="hm-btn hm-ai" :title="t('hl.ask_ai')" @click="$emit('ask-ai')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z"/><path d="M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9L18 15z"/></svg>
        <span class="hm-label">{{ t('hl.ask_ai') }}</span>
      </button>

      <span class="hm-sep"></span>

      <button class="hm-btn hm-icon" :class="{ active: moreOpen }" :title="t('hl.more')" @click="moreOpen = !moreOpen">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>
      </button>
    </div>

    <div v-if="moreOpen && !noteOpen" class="hm-more">
      <button class="hm-more-btn" @click="$emit('copy')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        {{ t('hl.copy') }}
      </button>
      <button v-if="saved" class="hm-more-btn hm-danger" @click="$emit('remove')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
        {{ t('hl.delete') }}
      </button>
    </div>

    <div v-if="noteOpen" class="hm-note">
      <textarea
        ref="noteEl"
        v-model="draft"
        class="hm-note-input"
        rows="2"
        :placeholder="t('hl.note_placeholder')"
        @keydown.enter.exact.prevent="save"
        @keydown.esc.stop="$emit('close-note')"
      ></textarea>
      <div class="hm-note-foot">
        <button class="hm-note-cancel" @click="$emit('close-note')">{{ t('general.cancel') }}</button>
        <button class="hm-note-save" @click="save">{{ t('general.save') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { HIGHLIGHT_COLORS, type HighlightColor } from '~/composables/useHighlights'

const props = defineProps<{
  x: number
  y: number
  below?: boolean
  color?: HighlightColor | null
  note?: string
  /** Выделение уже сохранено — значит его можно удалить. */
  saved?: boolean
  noteOpen?: boolean
}>()

const emit = defineEmits<{
  (e: 'pick-color', c: HighlightColor): void
  (e: 'open-note'): void
  (e: 'close-note'): void
  (e: 'save-note', text: string): void
  (e: 'ask-ai'): void
  (e: 'copy'): void
  (e: 'remove'): void
}>()

const { t } = useI18n()
const moreOpen = ref(false)
const draft = ref(props.note || '')
const noteEl = ref<HTMLTextAreaElement | null>(null)

watch(() => props.note, (v) => { draft.value = v || '' })
watch(() => props.noteOpen, (open) => {
  if (!open) return
  draft.value = props.note || ''
  nextTick(() => noteEl.value?.focus())
}, { immediate: true })

const save = () => emit('save-note', draft.value.trim())
</script>

<style scoped>
.hm {
  position: absolute; z-index: 40; transform: translate(-50%, calc(-100% - 10px));
  display: flex; flex-direction: column; gap: 6px; padding: 6px;
  background: var(--surface); border: 1px solid var(--border); border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,.16), 0 2px 8px rgba(0,0,0,.08);
  -webkit-backdrop-filter: blur(20px) saturate(180%); backdrop-filter: blur(20px) saturate(180%);
  animation: hm-in .16s cubic-bezier(.22,1,.36,1);
}
.hm-below { transform: translate(-50%, 10px); }
@keyframes hm-in { from { opacity: 0; transform: translate(-50%, calc(-100% - 4px)) scale(.96); } }
.hm-below { animation-name: hm-in-below; }
@keyframes hm-in-below { from { opacity: 0; transform: translate(-50%, 4px) scale(.96); } }

.hm-row { display: flex; align-items: center; gap: 2px; }
.hm-sep { width: 1px; height: 18px; background: var(--border); margin: 0 4px; flex-shrink: 0; }

.hm-color {
  width: 30px; height: 30px; border: none; background: none; padding: 0; cursor: pointer;
  display: flex; align-items: center; justify-content: center; border-radius: 9px;
  transition: background .12s ease-out;
}
.hm-color span {
  width: 17px; height: 17px; border-radius: 50%; display: block;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.08);
  transition: transform .14s cubic-bezier(.32,.72,0,1);
}
.hm-color:hover span { transform: scale(1.14); }
.hm-color:active span { transform: scale(.94); }
.hm-color.active { background: var(--surface3); }
.hm-color.active span { box-shadow: inset 0 0 0 1px rgba(0,0,0,.12), 0 0 0 2px var(--surface), 0 0 0 3.5px var(--text3); }
.hm-yellow span { background: #FFD84D; }
.hm-green span { background: #7BDCA0; }
.hm-blue span { background: #7CC5F5; }
.hm-red span { background: #FF9A9A; }

.hm-btn {
  display: flex; align-items: center; gap: 5px; height: 30px; padding: 0 9px;
  border: none; background: none; border-radius: 9px; cursor: pointer;
  color: var(--text2); font-family: inherit; font-size: 12.5px; font-weight: 600;
  white-space: nowrap; transition: background .12s ease-out, color .12s ease-out;
}
.hm-btn:hover { background: var(--surface2); color: var(--text1); }
.hm-btn:active { background: var(--surface3); }
.hm-btn.active { color: var(--teal); }
.hm-btn.hm-icon { padding: 0; width: 30px; justify-content: center; }
.hm-ai:hover { color: var(--teal); }

.hm-more { display: flex; flex-direction: column; gap: 1px; padding-top: 5px; border-top: 1px solid var(--border); }
.hm-more-btn {
  display: flex; align-items: center; gap: 8px; padding: 7px 9px; border: none; background: none;
  border-radius: 9px; cursor: pointer; color: var(--text2); font-family: inherit;
  font-size: 12.5px; font-weight: 600; text-align: left; transition: background .12s ease-out;
}
.hm-more-btn:hover { background: var(--surface2); color: var(--text1); }
.hm-danger { color: var(--red); }
.hm-danger:hover { background: var(--red-l); color: var(--red); }

.hm-note { display: flex; flex-direction: column; gap: 8px; width: 244px; padding: 2px; }
.hm-note-input {
  width: 100%; resize: none; border: 1px solid var(--border); border-radius: 11px;
  background: var(--surface2); color: var(--text1); padding: 9px 11px;
  font-family: inherit; font-size: 13px; line-height: 1.45; outline: none;
  transition: border-color .15s;
}
.hm-note-input:focus { border-color: rgba(var(--teal-rgb),.45); }
.hm-note-foot { display: flex; justify-content: flex-end; gap: 6px; }
.hm-note-cancel, .hm-note-save {
  height: 28px; padding: 0 12px; border-radius: 9px; border: none; cursor: pointer;
  font-family: inherit; font-size: 12.5px; font-weight: 600; transition: opacity .15s, background .15s;
}
.hm-note-cancel { background: var(--surface2); color: var(--text3); }
.hm-note-cancel:hover { background: var(--surface3); color: var(--text2); }
.hm-note-save { background: var(--teal); color: #fff; }
.hm-note-save:hover { opacity: .88; }

@media (max-width: 768px) {
  /* Минимум 44px по HIG: меню на тач-экране — основная тап-цель. */
  .hm-color, .hm-btn, .hm-btn.hm-icon { height: 38px; }
  .hm-color { width: 38px; }
  .hm-btn.hm-icon { width: 38px; }
  .hm-label { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .hm { animation: none; }
  .hm-color span { transition: none; }
}
</style>
