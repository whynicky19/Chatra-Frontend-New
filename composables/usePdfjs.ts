// Ленивая загрузка pdfjs-dist (тяжёлая либа) + настройка воркера — один раз на
// всё приложение, кэшируем промис, чтобы повторные открытия PDF не тянули
// модуль и не переустанавливали workerSrc заново.
let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null

export function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      // legacy-сборка вместо build/pdf.mjs — обычная (не legacy) использует
      // самый свежий синтаксис (напр. Uint8Array.prototype.toHex), который
      // есть не во всех браузерах пользователей ещё, а не только в новых Chrome.
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
      // ?url — Vite отдаёт финальный (захэшированный/скопированный в billed) URL
      // ассета, вместо попытки заинлайнить воркер как модуль.
      const workerUrl = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')).default
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
      return pdfjsLib
    })()
  }
  return pdfjsPromise
}
