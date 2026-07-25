import { useApi } from './api'
export const useUploadSvc=()=>{
  const api=useApi()
  return{
    upload:async(file:File)=>{const f=new FormData();f.append('file',file);const{data}=await api.post('/upload/',f,{headers:{'Content-Type':'multipart/form-data'}});return data as{file_url:string}},
    // Конвертирует .ppt/.pptx/.doc/.rtf в PDF на бэкенде (LibreOffice), чтобы
    // показать предпросмотр в родном PDF-вьюере браузера (см. FilePreviewModal.vue).
    previewPdf:async(url:string)=>{const{data}=await api.get('/upload/utils/preview-pdf',{params:{url}});return data as{pdf_url:string}},
  }
}