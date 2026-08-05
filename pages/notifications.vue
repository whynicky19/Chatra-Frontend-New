<template>
  <div class="pg">
    <button class="back-row" @click="goBack">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6"/></svg>
      {{ t('nav.classes') }}
    </button>
    <div class="pg-head">
      <h1 class="pg-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        Уведомления
      </h1>
      <button v-if="unreadCount > 0" class="btn btn-ghost btn-sm" @click="markAllRead">Прочитать все</button>
    </div>
    <div class="pg-body">
      <div v-if="loading" style="display:flex;justify-content:center;padding:40px"><div class="spinner"></div></div>
      <div v-else-if="!items.length" class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--border2)" stroke-width="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        <div>Уведомлений нет</div>
      </div>
      <div v-else class="notif-list">
        <div
          v-for="item in sorted"
          :key="item.key"
          :class="['notif-card', { unread: !item.read }]"
          :style="!item.read ? { borderLeftColor: item.color } : {}"
          @click="markRead(item.key)"
        >
          <div class="notif-icon" :style="{ background: item.color + '16' }">
            <svg v-if="item.type==='assignment'" width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="item.color" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1" ry="1"/><path d="M9 12h6M9 16h4"/></svg>
            <svg v-else-if="item.type==='deadline'" width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="item.color" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="item.color" stroke-width="2"><polyline points="22 11.08 12 2.18 2 11.08"/><path d="M22 11.08V19a2 2 0 01-2 2H4a2 2 0 01-2-2v-7.92"/><polyline points="7 22 7 12 17 12 17 22"/></svg>
          </div>
          <div class="notif-body">
            <div class="notif-title">{{ item.title }}</div>
            <div class="notif-desc">{{ item.desc }}</div>
            <div class="notif-date">{{ fmtDate(item.date) }}</div>
          </div>
          <div v-if="!item.read" class="unread-dot" :style="{ background: item.color }"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from '#app'
import { useAuthStore } from '~/stores/auth.store'
import { useAssignmentsSvc } from '~/services/assignments'
import { useClassesSvc } from '~/services/classes'
import { useNotificationsSvc } from '~/services/notifications'
import { parseUtc } from '~/composables/useDeadline'
import { useNotificationsStore } from '~/stores/notifications.store'
import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'
definePageMeta({ layout: 'default' })

const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()
const assignSvc = useAssignmentsSvc()
const classesSvc = useClassesSvc()
const notifSvc = useNotificationsSvc()
const notifStore = useNotificationsStore()
const toast = useToast()
const goBack = () => router.push('/')

interface NotifItem {
  key: string
  type: 'assignment' | 'deadline' | 'grade'
  title: string
  desc: string
  date: string
  color: string
  read: boolean
}

const loading = ref(false)
const items = ref<NotifItem[]>([])

// Состояние (read/dismissed) — серверная истина, синхронно с приложением.
const stateMap = ref<Record<string, { read: boolean; dismissed: boolean }>>({})

const markRead = (key: string) => {
  const it = items.value.find(i => i.key === key)
  if (it) it.read = true
  stateMap.value[key] = { read: true, dismissed: stateMap.value[key]?.dismissed || false }
  notifStore.setUnread(items.value.filter(i => !i.read).length)
  // fire-and-forget: локально уже отметили; сбой синка не должен всплывать тостом
  notifSvc.setState(key, { read: true }).catch(() => {})
}
const markAllRead = () => {
  const keys = items.value.filter(i => !i.read).map(i => i.key)
  items.value.forEach(i => { i.read = true; stateMap.value[i.key] = { read: true, dismissed: stateMap.value[i.key]?.dismissed || false } })
  notifStore.setUnread(0)
  if (keys.length) notifSvc.readAll(keys).catch(() => {})
}

const unreadCount = computed(() => items.value.filter(i => !i.read).length)

const sorted = computed(() => [...items.value].sort((a, b) => {
  if (a.read !== b.read) return a.read ? 1 : -1
  return new Date(b.date).getTime() - new Date(a.date).getTime()
}))

const fmtDate = (iso: string) => {
  try {
    const d = parseUtc(iso)
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
      ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

const isDismissed = (key: string) => stateMap.value[key]?.dismissed === true
const isRead = (key: string) => stateMap.value[key]?.read === true

onMounted(async () => {
  loading.value = true
  try {
    const [classes, subs, states] = await Promise.all([
      classesSvc.list(),
      assignSvc.mySubmissions().catch(() => [] as any[]),
      notifSvc.states(),
    ])
    stateMap.value = Object.fromEntries(
      states.map(s => [s.notif_key, { read: s.read, dismissed: s.dismissed }])
    )

    const classIds = classes.map((c: any) => c.id)

    const perClass = await Promise.all(
      classIds.map((id: number) => assignSvc.list(id).catch(() => [] as any[]))
    )
    const allAssignments: any[] = perClass.flat()

    const now = Date.now()
    const sevenDays = 7 * 24 * 3600 * 1000
    const collected: NotifItem[] = []

    // New assignments (last 7 days)
    for (const a of allAssignments) {
      const age = now - parseUtc(a.created_at).getTime()
      if (age > sevenDays) continue
      const key = `assignment:${a.id}`
      if (isDismissed(key)) continue
      collected.push({
        key, type: 'assignment',
        title: 'Новое задание',
        desc: a.title,
        date: a.created_at,
        // Фирменный teal, не отдельный акцент (раньше индиго #6366f1 — вне
        // бренда: единственный акцент сайта это --teal).
        color: '#00B1C9',
        read: isRead(key),
      })
    }

    // Upcoming deadlines (no submission, deadline within 48h)
    const submittedIds = new Set(subs.map((s: any) => s.assignment_id))
    const fortyEightH = 48 * 3600 * 1000
    for (const a of allAssignments) {
      if (!a.deadline || submittedIds.has(a.id)) continue
      const dl = parseUtc(a.deadline).getTime()
      if (dl < now || dl - now > fortyEightH) continue
      const key = `deadline:${a.id}`
      if (isDismissed(key)) continue
      collected.push({
        key, type: 'deadline',
        title: 'Дедлайн близко',
        desc: `${a.title} — до ${parseUtc(a.deadline).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`,
        date: a.deadline,
        color: 'var(--red)',
        read: isRead(key),
      })
    }

    // Graded submissions
    for (const s of subs) {
      if (s.status !== 'graded') continue
      const a = allAssignments.find((x: any) => x.id === s.assignment_id)
      const key = `grade:${s.id}`
      if (isDismissed(key)) continue
      collected.push({
        key, type: 'grade',
        title: 'Работа проверена',
        desc: a ? `${a.title} — оценка выставлена` : `Работа #${s.id} проверена`,
        date: s.grade?.graded_at || s.submitted_at,
        color: 'var(--green)',
        read: isRead(key),
      })
    }

    items.value = collected
    notifStore.setUnread(collected.filter(i => !i.read).length)
  } catch {
    // Раньше молча показывали "Уведомлений нет", неотличимое от настоящего
    // пустого списка при реальном сбое загрузки.
    toast.err('Не удалось загрузить уведомления')
  }
  finally { loading.value = false }
})
</script>
<style scoped>
.pg{height:100%;overflow-y:auto;background:var(--bg);width:100%}
.back-row{display:inline-flex;align-items:center;gap:2px;background:none;border:none;color:var(--teal);font-size:15px;font-weight:500;cursor:pointer;padding:4px 0;margin:20px 0 0 32px;font-family:inherit;transition:opacity .15s}
.back-row:hover{opacity:.7}
.pg-head{padding:8px 32px 0;display:flex;align-items:center;justify-content:space-between}
.pg-title{font-size:20px;font-weight:700;letter-spacing:-.02em;display:flex;align-items:center;gap:8px}
.pg-body{padding:20px 32px 32px}
.empty-state{display:flex;flex-direction:column;align-items:center;gap:16px;padding:80px 0;color:var(--text4);font-size:14px}
.notif-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:12px;width:100%}
.notif-card{display:flex;align-items:flex-start;gap:14px;padding:16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xl);box-shadow:var(--sh-xs);cursor:pointer;transition:transform .2s cubic-bezier(.22,1,.36,1),box-shadow .2s,background .15s,border-color .15s;position:relative}
.notif-card:hover{background:var(--surface2);border-color:var(--border2);transform:translateY(-2px);box-shadow:var(--sh-md)}
.notif-card:active{transform:translateY(0) scale(.99)}
.notif-card.unread{border-left:3px solid var(--teal);background:var(--surface)}
.notif-icon{width:44px;height:44px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.notif-body{flex:1;min-width:0}
.notif-title{font-size:14.5px;font-weight:650;margin-bottom:3px;color:var(--text1);letter-spacing:-.01em}
.notif-desc{font-size:13px;color:var(--text3);margin-bottom:6px;line-height:1.45;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.notif-date{font-size:11px;color:var(--text4);font-weight:500}
.unread-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:6px;box-shadow:0 0 0 3px rgba(var(--teal-rgb),.15)}
@media(max-width:768px){
  .back-row{margin:calc(14px + env(safe-area-inset-top, 0px)) 0 0 16px;position:relative;min-height:44px;display:inline-flex}
  .back-row::after{content:'';position:absolute;top:-9px;bottom:-9px;left:-4px;right:-4px}
  .pg-head{padding:6px 16px 0}
  .pg-title svg{display:none}
  .pg-head .btn-ghost{color:var(--teal);font-weight:600;flex-shrink:0}
  .pg-body{padding:14px 16px 28px}
  .notif-list{grid-template-columns:1fr}
  .notif-card{border-radius:18px;padding:14px}
  .notif-card:active{background:var(--surface2)}
  .empty-state{min-height:55vh;justify-content:center;padding:0}
}
</style>
