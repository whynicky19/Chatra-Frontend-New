<template>
  <div class="tab">
    <div class="bar">
      <div class="search-wrap">
        <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input v-model="q" class="search-inp" placeholder="Имя или email..."/>
        <button v-if="q" class="search-clear" @click="q = ''">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <select v-model="sort" class="sort-sel">
        <option value="tokens">Сначала с большим расходом</option>
        <option value="active">Сначала активные недавно</option>
        <option value="name">По имени</option>
        <option value="new">Сначала новые</option>
      </select>
      <button class="btn btn-teal btn-sm" @click="showCreate = true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Создать
      </button>
    </div>

    <div class="filters">
      <button v-for="f in roleFilters" :key="f.value"
              :class="['f-chip', { active: role === f.value }]" @click="role = f.value">
        {{ f.label }}
        <span class="f-chip-n">{{ roleCounts[f.value] }}</span>
      </button>
      <span class="f-divider"></span>
      <button :class="['f-chip', { active: onlyBlocked }]" @click="onlyBlocked = !onlyBlocked">
        Заблокированные
        <span class="f-chip-n">{{ blockedCount }}</span>
      </button>
      <button :class="['f-chip', { active: onlyUnlimited }]" @click="onlyUnlimited = !onlyUnlimited">
        Безлимит ИИ
        <span class="f-chip-n">{{ unlimitedCount }}</span>
      </button>
      <button :class="['f-chip', { active: onlyUnverified }]" @click="onlyUnverified = !onlyUnverified">
        Email не подтверждён
        <span class="f-chip-n">{{ unverifiedCount }}</span>
      </button>
    </div>

    <div v-if="loading" class="center-loading"><div class="spinner"></div></div>

    <template v-else>
      <div class="list-head">
        <span>{{ rows.length }} из {{ users.length }}</span>
        <span class="list-head-hint">нажмите на строку — откроется карточка</span>
      </div>
      <div class="list">
        <button v-for="u in rows" :key="u.id" class="row" @click="open(u)">
          <span class="row-avatar" :style="{ background: avatarColor(u.id) }">{{ initials(u.full_name || u.email) }}</span>
          <span class="row-id">
            <span class="row-name">
              {{ u.full_name || u.email.split('@')[0] }}
              <span v-if="!u.is_active" class="tag tag-off">заблокирован</span>
              <span v-else-if="!u.is_verified" class="tag tag-warn">не подтверждён</span>
              <span v-if="u.ai_unlimited" class="tag tag-teal">безлимит</span>
            </span>
            <span class="row-email">{{ u.email }}</span>
          </span>
          <span :class="['row-role', 'role-' + u.role]">{{ roleShort(u.role) }}</span>
          <span class="row-classes">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            {{ u.class_count }}
          </span>
          <span class="row-ai">
            <span class="row-bar"><span :style="{ width: tokenPct(u.total_tokens) + '%' }"></span></span>
            <span class="row-tokens">{{ fmt(u.total_tokens) }}</span>
          </span>
          <span class="row-seen">{{ fmtRelative(u.last_active) }}</span>
          <svg class="row-chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <div v-if="!rows.length" class="empty">Никого не найдено</div>
      </div>
    </template>

    <UserDetailModal :user-id="openedId" :row="openedRow" :is-self="openedId === auth.user?.id"
                     :busy="busy" @close="openedId = null"
                     @role="setRole" @unlimited="setUnlimited"
                     @block="doBlock" @unblock="doUnblock" @remove="doDelete"/>

    <Transition name="modal">
      <div v-if="showCreate" class="overlay" @click.self="showCreate = false">
        <div class="modal">
          <div class="modal-head">
            <span class="modal-title">Создать пользователя</span>
            <button class="btn btn-icon btn-ghost" @click="showCreate = false">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="frow"><label class="flabel">Email</label><input v-model="nu.e" type="email" class="input" placeholder="user@company.com"/></div>
          <div class="frow"><label class="flabel">Пароль</label><input v-model="nu.p" type="password" class="input" placeholder="Минимум 6 символов"/></div>
          <div class="frow"><label class="flabel">Роль</label>
            <select v-model="nu.r" class="input">
              <option value="student">Ученик</option>
              <option value="teacher">Учитель</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          <div class="modal-foot">
            <button class="btn btn-white" @click="showCreate = false">Отмена</button>
            <button class="btn btn-teal" :disabled="!nu.e || !nu.p || creating" @click="createUser">
              <div v-if="creating" class="spinner spinner-btn"></div><span v-else>Создать</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminSvc } from '~/services/admin'
import type { AdminUserRow } from '~/services/admin'
import { useAdminFormat } from '~/composables/useAdminFormat'
import { useAuthStore } from '~/stores/auth.store'
import { useToast } from '~/composables/useToast'

// Страница показывает над вкладками общее число аккаунтов и подставляет
// имена создателей предметов — поэтому список уходит наверх.
const emit = defineEmits<{ loaded: [rows: AdminUserRow[]] }>()

const adminSvc = useAdminSvc()
const auth = useAuthStore()
const toast = useToast()
const { fmt, initials, avatarColor, roleShort, fmtRelative, utcDate } = useAdminFormat()

const users = ref<AdminUserRow[]>([])
const loading = ref(false)
const q = ref('')
const role = ref('all')
const sort = ref<'tokens' | 'active' | 'name' | 'new'>('tokens')
const onlyBlocked = ref(false)
const onlyUnlimited = ref(false)
const onlyUnverified = ref(false)
const busy = ref(false)

const roleFilters = [
  { value: 'all', label: 'Все' },
  { value: 'student', label: 'Ученики' },
  { value: 'teacher', label: 'Учителя' },
  { value: 'admin', label: 'Админы' },
]
const roleCounts = computed(() => ({
  all: users.value.length,
  student: users.value.filter(u => u.role === 'student').length,
  teacher: users.value.filter(u => u.role === 'teacher').length,
  admin: users.value.filter(u => u.role === 'admin').length,
} as Record<string, number>))
const blockedCount = computed(() => users.value.filter(u => !u.is_active).length)
const unlimitedCount = computed(() => users.value.filter(u => u.ai_unlimited).length)
const unverifiedCount = computed(() => users.value.filter(u => !u.is_verified).length)

const rows = computed(() => {
  const needle = q.value.trim().toLowerCase()
  const list = users.value.filter(u => {
    if (role.value !== 'all' && u.role !== role.value) return false
    if (onlyBlocked.value && u.is_active) return false
    if (onlyUnlimited.value && !u.ai_unlimited) return false
    if (onlyUnverified.value && u.is_verified) return false
    if (!needle) return true
    return u.email.toLowerCase().includes(needle) || (u.full_name || '').toLowerCase().includes(needle)
  })
  const name = (u: AdminUserRow) => (u.full_name || u.email).toLowerCase()
  const ts = (v: string | null) => (v ? utcDate(v).getTime() : 0)
  return [...list].sort((a, b) => {
    if (sort.value === 'tokens') return b.total_tokens - a.total_tokens || name(a).localeCompare(name(b))
    if (sort.value === 'active') return ts(b.last_active) - ts(a.last_active)
    if (sort.value === 'new') return ts(b.created_at) - ts(a.created_at) || b.id - a.id
    return name(a).localeCompare(name(b))
  })
})

const maxTokens = computed(() => Math.max(1, ...users.value.map(u => u.total_tokens)))
// Полоса — сравнение с самым «дорогим» аккаунтом, а не доля от общего расхода:
// в списке важно, кто выделяется, а не сколько процентов у каждого.
const tokenPct = (v: number) => (v > 0 ? Math.max(3, (v / maxTokens.value) * 100) : 0)

const openedId = ref<number | null>(null)
const openedRow = computed(() => users.value.find(u => u.id === openedId.value) ?? null)
const open = (u: AdminUserRow) => { openedId.value = u.id }

const load = async () => {
  loading.value = true
  try {
    users.value = await adminSvc.usersOverview()
    emit('loaded', users.value)
  } catch { toast.err('Не удалось загрузить пользователей') }
  finally { loading.value = false }
}

const patch = (id: number, fields: Partial<AdminUserRow>) => {
  const u = users.value.find(x => x.id === id)
  if (u) Object.assign(u, fields)
}

const setRole = async (id: number, newRole: string) => {
  busy.value = true
  try { await adminSvc.role(id, newRole); patch(id, { role: newRole }); toast.ok('Роль обновлена') }
  catch { toast.err('Не удалось изменить роль') }
  finally { busy.value = false }
}
const setUnlimited = async (id: number, value: boolean) => {
  busy.value = true
  try {
    await adminSvc.setAiUnlimited(id, value)
    patch(id, { ai_unlimited: value })
    toast.ok(value ? 'Безлимитный доступ включён' : 'Действует дневной лимит')
  } catch { toast.err('Не удалось обновить доступ к ИИ') }
  finally { busy.value = false }
}
const doBlock = async (id: number) => {
  busy.value = true
  try { await adminSvc.block(id); patch(id, { is_active: false }); toast.ok('Пользователь заблокирован') }
  catch { toast.err('Не удалось заблокировать') }
  finally { busy.value = false }
}
const doUnblock = async (id: number) => {
  busy.value = true
  try { await adminSvc.unblock(id); patch(id, { is_active: true }); toast.ok('Пользователь разблокирован') }
  catch { toast.err('Не удалось разблокировать') }
  finally { busy.value = false }
}
const doDelete = async (id: number) => {
  // Удаление аккаунта необратимо и уносит с собой его файлы — спрашиваем.
  const u = users.value.find(x => x.id === id)
  if (!confirm(`Удалить аккаунт ${u?.full_name || u?.email}? Действие необратимо.`)) return
  busy.value = true
  try {
    await adminSvc.del(id)
    users.value = users.value.filter(x => x.id !== id)
    emit('loaded', users.value)
    openedId.value = null
    toast.ok('Аккаунт удалён')
  } catch { toast.err('Не удалось удалить аккаунт') }
  finally { busy.value = false }
}

const showCreate = ref(false)
const creating = ref(false)
const nu = ref({ e: '', p: '', r: 'student' })
const createUser = async () => {
  creating.value = true
  try {
    await adminSvc.create({ email: nu.value.e, password: nu.value.p, role: nu.value.r })
    showCreate.value = false
    nu.value = { e: '', p: '', r: 'student' }
    toast.ok('Пользователь создан')
    // Перечитываем список: у нового аккаунта нужны те же агрегаты, что у всех.
    await load()
  } catch (e: any) { toast.err(e?.response?.data?.detail || 'Не удалось создать пользователя') }
  finally { creating.value = false }
}

onMounted(load)
</script>

<style scoped>
.tab{display:flex;flex-direction:column;gap:12px}

.bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.search-wrap{position:relative;display:flex;align-items:center;gap:7px;flex:1;min-width:200px;background:var(--surface);border:1px solid var(--border2);border-radius:var(--r-md);padding:9px 11px}
.search-icon{color:var(--text4);flex-shrink:0}
.search-inp{flex:1;border:none;background:none;font-size:13px;color:var(--text1);min-width:0}
.search-inp::placeholder{color:var(--text4)}
.search-clear{display:flex;color:var(--text4);background:none;border:none;cursor:pointer}
.search-clear:hover{color:var(--text1)}
.sort-sel{border:1px solid var(--border2);border-radius:var(--r-md);padding:9px 11px;font-size:12.5px;background:var(--surface);color:var(--text2);cursor:pointer}

.filters{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.f-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:100px;font-size:12.5px;font-weight:600;color:var(--text3);background:var(--surface);border:1px solid var(--border);cursor:pointer;transition:all .15s}
.f-chip:hover{color:var(--text1);border-color:var(--border2)}
.f-chip.active{color:var(--teal);background:rgba(var(--teal-rgb),.1);border-color:rgba(var(--teal-rgb),.28)}
.f-chip-n{font-size:10.5px;font-weight:800;color:var(--text4);background:var(--surface2);border-radius:100px;padding:1px 6px}
.f-chip.active .f-chip-n{color:var(--teal);background:rgba(var(--teal-rgb),.14)}
.f-divider{width:1px;height:18px;background:var(--border2);margin:0 2px}

.list-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;font-size:11.5px;color:var(--text4);padding:0 4px}
.list-head-hint{font-size:11.5px}
.list{display:flex;flex-direction:column;gap:6px}
.row{display:grid;grid-template-columns:38px minmax(150px,1.6fr) auto 58px minmax(120px,1fr) 132px 15px;align-items:center;gap:12px;width:100%;padding:11px 14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);box-shadow:var(--sh-xs);cursor:pointer;text-align:left;font-family:inherit;transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .22s,border-color .2s}
.row:hover{transform:translateY(-2px);box-shadow:var(--sh-md);border-color:var(--border2)}
.row:active{transform:translateY(0);transition-duration:.09s}
.row-avatar{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12.5px;font-weight:800;flex-shrink:0}
.row-id{display:flex;flex-direction:column;gap:1px;min-width:0}
.row-name{display:flex;align-items:center;gap:6px;font-size:13.5px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row-email{font-size:12px;color:var(--text4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tag{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.03em;padding:1px 6px;border-radius:100px;flex-shrink:0}
.tag-off{color:var(--red);background:var(--red-l)}
.tag-warn{color:#B26A00;background:rgba(255,149,0,.16)}
.tag-teal{color:var(--teal);background:rgba(var(--teal-rgb),.12)}
html.dark .tag-warn{color:#FF9F0A}
.row-role{font-size:11.5px;font-weight:700;color:var(--text3);background:var(--surface2);border:1px solid var(--border);border-radius:100px;padding:3px 10px;text-align:center;white-space:nowrap}
.role-admin{color:var(--teal);background:rgba(var(--teal-rgb),.1);border-color:rgba(var(--teal-rgb),.22)}
.row-classes{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--text4);font-variant-numeric:tabular-nums}
.row-ai{display:flex;align-items:center;gap:9px;min-width:0}
.row-bar{flex:1;height:6px;border-radius:3px;background:var(--surface2);overflow:hidden;min-width:34px}
.row-bar span{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,var(--teal-h),var(--teal));transition:width .5s cubic-bezier(.22,1,.36,1)}
.row-tokens{font-size:12.5px;font-weight:700;color:var(--text1);font-variant-numeric:tabular-nums;white-space:nowrap}
.row-seen{font-size:11.5px;color:var(--text4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row-chev{color:var(--text4);flex-shrink:0}
.empty{text-align:center;padding:28px;color:var(--text4);font-size:13px}
.center-loading{display:flex;justify-content:center;padding:32px}
.spinner-btn{width:13px;height:13px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff}

@media (max-width:1100px){
  .row{grid-template-columns:38px minmax(140px,1.6fr) auto minmax(110px,1fr) 15px}
  .row-classes,.row-seen{display:none}
}
@media (max-width:768px){
  .bar{gap:6px}
  /* Поиск занимает всю первую строку: втиснутая рядом сортировка сжималась до
     нечитаемых двух символов. */
  .search-wrap{flex:1 1 100%}
  .sort-sel{flex:1;min-width:0}
  .filters{overflow-x:auto;-webkit-overflow-scrolling:touch;flex-wrap:nowrap;padding-bottom:2px}
  .f-chip{flex-shrink:0}
  .f-divider{display:none}
  .list-head-hint{display:none}
  /* На телефоне строка становится карточкой в две линии: сетка из шести
     колонок здесь нечитаема. */
  .row{grid-template-columns:38px 1fr auto;grid-template-areas:'avatar id role' 'ai ai ai';gap:8px 10px;padding:12px}
  .row-avatar{grid-area:avatar}
  .row-id{grid-area:id}
  .row-role{grid-area:role}
  .row-ai{grid-area:ai}
  .row-chev{display:none}
}
</style>
