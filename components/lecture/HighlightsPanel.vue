<template>
  <div class="hp">
    <div v-if="!hideHeader" class="hp-label">
      {{ t('hl.section') }}
      <span v-if="items.length" class="hp-count">{{ items.length }}</span>
    </div>

    <div v-if="!items.length" class="hp-empty">{{ t('hl.empty') }}</div>

    <div v-else class="hp-list">
      <div v-for="h in items" :key="h.id" class="hp-row" :class="`hp-${h.color}`" @click="$emit('go', h)">
        <span class="hp-bar"></span>
        <div class="hp-main">
          <div class="hp-text">{{ h.selected_text.trim() }}</div>
          <div v-if="h.comment" class="hp-note">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
            {{ h.comment }}
          </div>
          <div class="hp-meta">
            <template v-if="showLecture && h.lecture_title">{{ h.lecture_title }}<span v-if="h.page"> · </span></template>
            <template v-if="h.page">{{ t('hl.page') }} {{ h.page }}</template>
          </div>
        </div>
        <div class="hp-actions">
          <button class="hp-act" :title="t('hl.note')" @click.stop="$emit('note', h)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
          </button>
          <button class="hp-act hp-act-del" :title="t('hl.delete')" @click.stop="$emit('remove', h)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
import type { Highlight } from '~/composables/useHighlights'

defineProps<{ items: Highlight[]; showLecture?: boolean; hideHeader?: boolean }>()
defineEmits<{
  (e: 'go', h: Highlight): void
  (e: 'note', h: Highlight): void
  (e: 'remove', h: Highlight): void
}>()

const { t } = useI18n()
</script>

<style scoped>
.hp-label {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; font-weight: 700; color: var(--text4);
  text-transform: uppercase; letter-spacing: .04em; margin-bottom: 12px;
}
.hp-count {
  font-size: 11px; font-weight: 700; letter-spacing: 0;
  background: var(--surface3); color: var(--text3); padding: 1px 7px; border-radius: 100px;
}
.hp-empty { font-size: 13px; color: var(--text4); line-height: 1.5; padding: 4px 0; }

.hp-list {
  display: flex; flex-direction: column;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--r-lg); overflow: hidden;
}
.hp-row {
  position: relative; display: flex; align-items: flex-start; gap: 11px;
  padding: 11px 12px 11px 0; border-bottom: 1px solid var(--border);
  cursor: pointer; transition: background .1s ease-out;
}
.hp-row:last-child { border-bottom: none; }
.hp-row:hover { background: var(--surface3); }

/* Цвет выделения — кромкой слева: тон повторяет саму пометку в документе,
   поэтому строку списка можно узнать, не читая текст. */
.hp-bar { width: 3px; align-self: stretch; border-radius: 0 3px 3px 0; flex-shrink: 0; }
.hp-yellow .hp-bar { background: #FFD84D; }
.hp-green .hp-bar { background: #7BDCA0; }
.hp-blue .hp-bar { background: #7CC5F5; }
.hp-red .hp-bar { background: #FF9A9A; }

.hp-main { flex: 1; min-width: 0; }
.hp-text {
  font-size: 13px; line-height: 1.45; color: var(--text1);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.hp-note {
  display: flex; align-items: flex-start; gap: 5px; margin-top: 5px;
  font-size: 12px; line-height: 1.4; color: var(--text3);
}
.hp-note svg { flex-shrink: 0; margin-top: 2px; }
.hp-meta { font-size: 11.5px; color: var(--text4); margin-top: 4px; }

.hp-actions { display: flex; gap: 2px; flex-shrink: 0; opacity: 0; transition: opacity .15s; }
.hp-row:hover .hp-actions, .hp-row:focus-within .hp-actions { opacity: 1; }
.hp-act {
  width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
  border: none; background: none; border-radius: 8px; color: var(--text4); cursor: pointer;
  transition: background .12s, color .12s;
}
.hp-act:hover { background: var(--surface); color: var(--text2); }
.hp-act-del:hover { background: var(--red-l); color: var(--red); }

@media (hover: none) {
  /* Без ховера действия иначе недостижимы. */
  .hp-actions { opacity: 1; }
  .hp-act { width: 34px; height: 34px; }
}
</style>
