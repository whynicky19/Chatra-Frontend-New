import { useApi } from './api'
export const usePostsSvc=()=>{
  const api=useApi()
  return{
    // FE-1: classId сужает выборку на сервере (лекции/материалы класса),
    // limit/offset — пагинация. Без аргументов поведение прежнее (все посты).
    list:async(opts?:{classId?:number;limit?:number;offset?:number})=>{
      const params:Record<string,any>={}
      if(opts?.classId!=null)params.class_id=opts.classId
      if(opts?.limit!=null)params.limit=opts.limit
      if(opts?.offset!=null)params.offset=opts.offset
      const{data}=await api.get('/posts/',{params});return data as any[]
    },
    create:async(title:string,body:string)=>{const{data}=await api.post('/posts/create',{title,body});return data},
    update:async(id:number,title:string,body:string)=>{const{data}=await api.put(`/posts/${id}`,{title,body});return data},
    remove:async(id:number)=>{const{data}=await api.delete(`/posts/${id}`);return data},
  }
}
