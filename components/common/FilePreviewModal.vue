<template>
  <div v-if="previewFile" class="overlay" @click.self="closePreview">
    <div class="fp-modal anim-scale">
      <div class="fp-head">
        <div class="fp-title truncate">{{ previewFile.name }}</div>
        <div class="fp-actions">
          <button class="btn btn-white btn-sm" @click="download">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Скачать
          </button>
          <button class="btn btn-icon btn-ghost" @click="closePreview">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <div class="fp-body">
        <div v-if="loading" class="fp-state">
          <div class="spinner" style="width:24px;height:24px;border-width:3px"></div>
        </div>

        <div v-else-if="errorMsg" class="fp-state fp-error">
          <div class="fp-error-text">{{ errorMsg }}</div>
          <button class="btn btn-teal btn-sm" @click="download">Скачать файл</button>
        </div>

        <img v-else-if="kind==='image'" :src="previewFile.url" class="fp-image" :alt="previewFile.name"/>

        <iframe v-else-if="kind==='pdf'" :src="previewFile.url" class="fp-iframe"></iframe>

        <div v-else-if="kind==='docx'" ref="docxContainer" class="fp-docx"></div>

        <div v-else-if="kind==='sheet'" class="fp-sheet" v-html="sheetHtml"></div>

        <pre v-else-if="kind==='text'" class="fp-text">{{ textContent }}</pre>

        <div v-else class="fp-state fp-error">
          <div class="fp-error-text">Предпросмотр для этого типа файла пока не поддерживается</div>
          <button class="btn btn-teal btn-sm" @click="download">Скачать файл</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useFilePreview, downloadFile } from '~/composables/useFilePreview'

const { previewFile, closePreview } = useFilePreview()

const loading = ref(false)
const errorMsg = ref('')
const docxContainer = ref<HTMLElement | null>(null)
const sheetHtml = ref('')
const textContent = ref('')

const extOf = (name: string) => name.split('.').pop()?.toLowerCase().split('?')[0] || ''

const kind = computed(() => {
  const ext = extOf(previewFile.value?.name || '')
  if (['png','jpg','jpeg','gif','webp','bmp','svg'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (ext === 'docx') return 'docx'
  if (['xlsx','xls','csv'].includes(ext)) return 'sheet'
  if (['txt','md'].includes(ext)) return 'text'
  return 'unsupported'
})

const download = () => {
  if (previewFile.value) downloadFile(previewFile.value.url, previewFile.value.name)
}

const load = async () => {
  errorMsg.value = ''
  sheetHtml.value = ''
  textContent.value = ''
  if (!previewFile.value) return
  const f = previewFile.value
  const k = kind.value
  if (k === 'image' || k === 'pdf' || k === 'unsupported') return

  loading.value = true
  try {
    const res = await fetch(f.url)
    if (!res.ok) throw new Error('fetch failed')

    if (k === 'docx') {
      const blob = await res.blob()
      await nextTick()
      if (docxContainer.value) {
        docxContainer.value.innerHTML = ''
        const { renderAsync } = await import('docx-preview')
        await renderAsync(blob, docxContainer.value, undefined, { className: 'docx-view', inWrapper: false })
      }
    } else if (k === 'sheet') {
      const buf = await res.arrayBuffer()
      const XLSX = await import('xlsx')
      const wb = XLSX.read(buf, { type: 'array' })
      const sheetName = wb.SheetNames[0]
      const sheet = wb.Sheets[sheetName]
      sheetHtml.value = XLSX.utils.sheet_to_html(sheet, { editable: false })
    } else if (k === 'text') {
      textContent.value = await res.text()
    }
  } catch {
    errorMsg.value = 'Не удалось загрузить предпросмотр файла'
  } finally {
    loading.value = false
  }
}

watch(() => previewFile.value?.url, (url) => { if (url) load() })
</script>

<style scoped>
.fp-modal{background:var(--surface);border-radius:var(--r-xl);width:min(900px,92vw);max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:var(--sh-lg)}
.fp-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;border-bottom:1px solid var(--border);flex-shrink:0}
.fp-title{font-size:14px;font-weight:700;color:var(--text1)}
.fp-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}
.fp-body{flex:1;overflow:auto;background:var(--bg);display:flex}
.fp-state{margin:auto;display:flex;flex-direction:column;align-items:center;gap:14px;padding:60px 20px}
.fp-error-text{font-size:13px;color:var(--text4);text-align:center;max-width:320px}
.fp-image{max-width:100%;max-height:100%;margin:auto;object-fit:contain}
.fp-iframe{width:100%;min-height:78vh;border:none}
.fp-docx{width:100%;padding:24px;background:#fff;overflow:auto}
.fp-sheet{width:100%;padding:16px;overflow:auto}
.fp-sheet :deep(table){border-collapse:collapse;font-size:13px}
.fp-sheet :deep(td),.fp-sheet :deep(th){border:1px solid var(--border);padding:4px 8px;white-space:nowrap}
.fp-text{width:100%;padding:20px;font-size:13px;line-height:1.6;color:var(--text1);white-space:pre-wrap;word-break:break-word;font-family:inherit}
</style>
