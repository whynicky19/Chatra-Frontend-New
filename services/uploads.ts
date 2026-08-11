import { useApi } from './api'
// Бэкенд кладёт оригинальное имя файла прямо в путь file_url (пробелы и все),
// а этот URL потом хранится как обычный текст в описании (📎-ссылки, обычные
// URL) — необработанный пробел ломает регэкспы, которые находят вложения
// в тексте (см. composables/useAttachments.ts). encodeURI() один раз здесь
// экранирует пробел/спецсимволы, не трогая уже закодированные %XX и служебные
// ?/&/=/# — валидный URL остаётся валидным для бэкенда.
const safeUrl = (url?: string): string | undefined => { if (!url) return url; try { return encodeURI(url) } catch { return url } }
export const useUploadSvc=()=>{
  const api=useApi()
  return{
    upload:async(file:File)=>{const f=new FormData();f.append('file',file);const{data}=await api.post('/upload/',f,{headers:{'Content-Type':'multipart/form-data'}});return{...data,file_url:safeUrl(data?.file_url)}as{file_url:string}},
    // Конвертирует .ppt/.pptx/.doc/.rtf в PDF на бэкенде (LibreOffice), чтобы
    // показать предпросмотр в родном PDF-вьюере браузера (см. FilePreviewModal.vue).
    previewPdf:async(url:string)=>{const{data}=await api.get('/upload/utils/preview-pdf',{params:{url}});return data as{pdf_url:string}},
  }
}