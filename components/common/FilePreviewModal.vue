<template>
  <Transition name="modal">
  <div v-if="previewFile" class="overlay" @click.self="closePreview">
    <div class="fp-modal">
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

      <!-- Контейнер docx смонтирован ВСЕГДА (не внутри v-if/v-else-if цепочки
           ниже) и просто скрывается через v-show, пока идёт загрузка/рендер.
           docx-preview.renderAsync() пишет в этот DOM-узел ИМПЕРАТИВНО ещё
           ДО того, как loading становится false — если бы контейнер был
           частью v-else-if="kind==='docx'" (который исключает друг друга с
           v-if="loading"), ref был бы null всё время рендера, renderAsync
           тихо ничего не находил бы, и после загрузки показывался бы просто
           пустой div без единой ошибки в консоли. -->
      <div v-show="kind==='docx' && !loading && !errorMsg" ref="docxContainer" class="fp-docx"></div>

      <div class="fp-body" v-if="kind!=='docx' || loading || errorMsg">
        <div v-if="loading" class="fp-state">
          <div class="spinner" style="width:24px;height:24px;border-width:3px"></div>
        </div>

        <div v-else-if="errorMsg" class="fp-state fp-error">
          <div class="fp-error-text">{{ errorMsg }}</div>
          <button class="btn btn-teal btn-sm" @click="download">Скачать файл</button>
        </div>

        <img v-else-if="kind==='image'" :src="previewFile.url" class="fp-image" :alt="previewFile.name" @error="onImgError"/>

        <iframe v-else-if="kind==='pdf'" :src="previewFile.url" class="fp-iframe"></iframe>

        <iframe v-else-if="kind==='office'" :src="convertedPdfUrl" class="fp-iframe"></iframe>

        <div v-else-if="kind==='sheet'" class="fp-sheet" v-html="sheetHtml"></div>

        <pre v-else-if="kind==='text'" class="fp-text">{{ textContent }}</pre>

        <div v-else class="fp-state fp-error">
          <div class="fp-error-text">Предпросмотр для этого типа файла пока не поддерживается</div>
          <button class="btn btn-teal btn-sm" @click="download">Скачать файл</button>
        </div>
      </div>
    </div>
  </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useFilePreview, downloadFile } from '~/composables/useFilePreview'
import { useDocumentLoader, kindOf } from '~/composables/useDocumentLoader'

const { previewFile, closePreview } = useFilePreview()

const { loading, errorMsg, docxContainer, sheetHtml, textContent, convertedPdfUrl, load } = useDocumentLoader()

const kind = computed(() => kindOf(previewFile.value?.name))

const download = () => {
  if (previewFile.value) downloadFile(previewFile.value.url, previewFile.value.name)
}

// Битая/просроченная (403) картинка не должна показывать иконку «сломанного
// изображения» — переключаемся на общий экран ошибки с кнопкой «Скачать».
const onImgError = () => { errorMsg.value = 'Не удалось загрузить предпросмотр файла' }

watch(() => previewFile.value?.url, (url) => { if (url) load(previewFile.value) })
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
/* flex:1 — теперь это прямой flex-child .fp-modal (вынесен из .fp-body,
   см. комментарий в шаблоне), без display:flex — иначе сломало бы внутреннюю
   постраничную вёрстку, которую генерирует docx-preview.
   color: задаём явно — docx-preview рисует текст без своего цвета и он
   наследуется от body, который в тёмной теме белый (#FFF). С захардкоженным
   белым фоном .fp-docx получался белый текст на белом фоне — содержимое
   docx в тёмной теме пропадало. Документ оставляем «бумажным» (светлый фон)
   и принудительно красим текст в тёмный. */
.fp-docx{flex:1;width:100%;padding:24px;background:#fff;color:#1C1C1E;overflow:auto}
.fp-docx :deep(section),.fp-docx :deep(article),.fp-docx :deep(p),.fp-docx :deep(span),.fp-docx :deep(h1),.fp-docx :deep(h2),.fp-docx :deep(h3),.fp-docx :deep(h4),.fp-docx :deep(li),.fp-docx :deep(td),.fp-docx :deep(th){color:inherit}
.fp-sheet{width:100%;padding:16px;overflow:auto}
.fp-sheet :deep(table){border-collapse:collapse;font-size:13px}
.fp-sheet :deep(td),.fp-sheet :deep(th){border:1px solid var(--border);padding:4px 8px;white-space:nowrap}
.fp-text{width:100%;padding:20px;font-size:13px;line-height:1.6;color:var(--text1);white-space:pre-wrap;word-break:break-word;font-family:inherit}

/* Mobile — тот же паттерн шторки снизу, что и у остальных модалок
   (.overlay уже получает padding:0/align-items:flex-end глобально из
   main.css, здесь адаптируем сам .fp-modal под .modal/.post-sheet). */
@media (max-width: 768px) {
  .fp-modal{width:100%;max-width:100%;max-height:92vh;max-height:92dvh;border-radius:28px 28px 0 0;padding-bottom:env(safe-area-inset-bottom, 0px)}
  .fp-modal::before{content:'';display:block;width:36px;height:5px;border-radius:3px;background:var(--surface3);margin:10px auto 0;flex-shrink:0}
  .fp-head{padding:10px 14px 12px}
  .fp-title{font-size:13px}
  .fp-actions .btn-sm{padding:8px 10px;font-size:12px;gap:4px}
  .fp-iframe{min-height:70vh}
  .fp-docx{padding:8px}
  /* Настоящий узкий текст — это не наш паддинг, а поля страницы самого Word-
     документа: docx-preview всегда переносит pageMargins в padding секции
     (не зависит от ignoreWidth/ignoreHeight), а это обычно ~1 дюйм = 96px —
     на телефоне это съедало почти половину экрана. Прижимаем поля страницы
     под мобильный размер, а не под печатный. */
  .fp-docx :deep(section){padding:16px!important}
  /* Картинки уже подгоняются в JS (fitDocxDrawings в load()) с сохранением
     clip-path/transform обрезки Word — здесь только таблицы, у них после
     ignoreWidth нет обёртки с transform, поэтому safe просто ограничить шириной. */
  .fp-docx :deep(table){max-width:100%;table-layout:fixed;word-break:break-word}
  .fp-sheet{padding:10px}
}
</style>
