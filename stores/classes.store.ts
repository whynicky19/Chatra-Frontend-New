import { defineStore } from 'pinia'
import { useClassesSvc, type ClassResponse } from '~/services/classes'
import { usePostsSvc } from '~/services/posts'
import { sameFilePath } from '~/composables/useFileUrl'

// Не чаще раза в минуту — молчаливое обновление в фоне, а не при каждом
// заходе на страницу.
const STALE_MS = 60_000

export const useClassesStore = defineStore('classes', {
  state: () => ({
    list: [] as ClassResponse[],
    posts: [] as any[],
    loaded: false,
    lastFetch: 0,
  }),

  getters: {
    byId: (s) => (id: number) => s.list.find(c => c.id === id) || null,
  },

  actions: {
    // Список классов живёт в сторе, а не в локальном state страницы — Nuxt
    // полностью пересоздаёт компонент страницы при каждой навигации, и без
    // общего кэша каталог (со всеми обложками) гонял бы GET /classes/ и
    // перерисовывал сетку с нуля при каждом возврате на главную (отсюда
    // и повторные скачивания обложек, и мигание). Если данные уже есть и
    // не устарели — отдаём их сразу, без сети и без сброса списка.
    async ensure(force = false) {
      const stale = Date.now() - this.lastFetch > STALE_MS
      if (this.loaded && !force && !stale) return
      const classesSvc = useClassesSvc()
      const postsSvc = usePostsSvc()
      const [classes, posts] = await Promise.all([classesSvc.list(), postsSvc.list()])
      // Подписи (exp/sig) в cover_image/cover_thumbnail пересчитываются бэкендом
      // при каждом запросе, даже если сам файл не менялся — если подставлять их
      // как есть, каждое фоновое обновление каталога заставляло бы браузер
      // перекачивать те же обложки заново. Оставляем прежний URL, пока путь
      // файла совпадает.
      this.list = classes.map(c => {
        const prev = this.list.find(p => p.id === c.id)
        if (!prev) return c
        return {
          ...c,
          cover_image: sameFilePath(prev.cover_image, c.cover_image) ? prev.cover_image : c.cover_image,
          cover_thumbnail: sameFilePath(prev.cover_thumbnail, c.cover_thumbnail) ? prev.cover_thumbnail : c.cover_thumbnail,
        }
      })
      this.posts = posts
      this.loaded = true
      this.lastFetch = Date.now()
    },

    upsert(cls: ClassResponse) {
      const idx = this.list.findIndex(c => c.id === cls.id)
      if (idx !== -1) {
        const prev = this.list[idx]
        this.list[idx] = {
          ...prev,
          ...cls,
          cover_image: sameFilePath(prev.cover_image, cls.cover_image) ? prev.cover_image : cls.cover_image,
          cover_thumbnail: sameFilePath(prev.cover_thumbnail, cls.cover_thumbnail) ? prev.cover_thumbnail : cls.cover_thumbnail,
        }
      } else {
        this.list.push(cls)
      }
    },

    remove(id: number) {
      this.list = this.list.filter(c => c.id !== id)
    },
  },
})
