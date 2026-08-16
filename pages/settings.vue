<template>
  <div class="pg" ref="scroller" @scroll.passive="onScroll">
    <!-- Плавающая шапка: контент проезжает ПОД ней (см. apple-design §12),
         поэтому она полупрозрачная с backdrop-filter, а разделитель —
         не жёсткая линия, а мягкое затухание, появляющееся только когда
         под шапкой реально что-то есть (scroll edge effect). -->
    <header class="pg-head" :class="{ scrolled }">
      <div class="head-inner">
        <h1 class="pg-title">{{ t('settings.title') }}</h1>
        <button class="save-pill" :disabled="!canSave" @click="saveProfile">{{ t('settings.save') }}</button>
      </div>
    </header>

    <div class="pg-body">
      <section class="group g-1">
        <div class="group-body acct">
          <div class="acct-text">
            <div class="acct-name">{{ displayName }}</div>
            <div class="acct-mail">{{ auth.user?.email }}</div>
          </div>
          <div class="acct-badge">{{ auth.isTeacher || auth.isAdmin ? roleLabel : institutionLabel }}</div>
        </div>
      </section>

      <section class="group g-2">
        <h2 class="group-label">{{ t('settings.profile_details') }}</h2>
        <div class="group-body">
          <div class="row row-field">
            <label class="row-label" for="set-fullname">{{ t('settings.full_name') }}</label>
            <input id="set-fullname" v-model="fullnameInput" class="row-input" placeholder="Иванов Иван Иванович" maxlength="80"/>
          </div>
          <div class="row row-field">
            <div class="row-label">{{ t('settings.email') }}</div>
            <div class="row-value">{{ auth.user?.email }}</div>
          </div>
          <!-- Роль скрыта для студентов — не несёт полезной информации в их
               профиле; преподаватели/админы её по-прежнему видят. -->
          <div class="row row-field" v-if="auth.isTeacher">
            <div class="row-label">{{ t('settings.role') }}</div>
            <div class="row-value">
              {{ roleLabel }}
              <svg class="lock" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </div>
          </div>
          <div class="row row-field">
            <div class="row-label">{{ t('settings.institution') }}</div>
            <div class="row-value">{{ institutionLabel }}</div>
          </div>
        </div>
        <p class="group-foot" :class="{ err: nameInvalid }">
          {{ nameInvalid
            ? (lang==='ru'?'Введите фамилию и имя':lang==='kk'?'Тегі мен атыңызды енгізіңіз':'Enter last name and first name')
            : (lang==='ru'?'Это имя видят преподаватели и одногруппники.':lang==='kk'?'Бұл атыңызды оқытушылар мен курстастар көреді.':'Teachers and classmates see this name.') }}
        </p>
      </section>

      <section class="group g-3">
        <h2 class="group-label">{{ lang==='ru'?'Оформление':lang==='kk'?'Безендіру':'Appearance' }}</h2>
        <div class="group-body">
          <div class="row">
            <div class="ic" style="--ic:#5E5CE6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            </div>
            <div class="row-main">
              <div class="row-title">{{ lang==='ru'?'Тёмная тема':lang==='kk'?'Қараңғы тақырып':'Dark mode' }}</div>
              <div class="row-sub">{{ lang==='ru'?'Тёмное оформление интерфейса':lang==='kk'?'Интерфейстің қараңғы безендірілуі':'Dark interface appearance' }}</div>
            </div>
            <button class="sw" :class="{ on: isDark }" role="switch" :aria-checked="isDark"
              :aria-label="lang==='ru'?'Тёмная тема':lang==='kk'?'Қараңғы тақырып':'Dark mode'"
              @click="setTheme(!isDark)">
              <span class="sw-thumb"></span>
            </button>
          </div>
        </div>
      </section>

      <!-- Язык: список с галочкой, как в iOS «Язык и регион». Сегментный
           переключатель на три кода (RU/EN/KZ) требовал догадаться, что «KZ»
           — это қазақша; здесь язык назван на самом себе. -->
      <section class="group g-4">
        <h2 class="group-label">{{ lang==='ru'?'Язык':lang==='kk'?'Тіл':'Language' }}</h2>
        <div class="group-body" role="radiogroup"
             :aria-label="lang==='ru'?'Язык интерфейса':lang==='kk'?'Интерфейс тілі':'Interface language'">
          <button v-for="l in langs" :key="l.code" type="button" class="row row-check"
                  role="radio" :aria-checked="lang === l.code" @click="setLang(l.code as any)">
            <div class="row-main">
              <div class="row-title">{{ l.name }}</div>
            </div>
            <svg v-if="lang === l.code" class="check" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>
      </section>

      <section class="group g-5">
        <div class="group-body">
          <NuxtLink v-if="auth.isTeacher || auth.isAdmin" to="/rollover" class="row row-nav">
            <div class="ic" style="--ic:#FF9500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
            </div>
            <div class="row-main">
              <div class="row-title">{{ t('rollover.nav') }}</div>
              <div class="row-sub">{{ lang==='ru'?'Перевод предметов на новый учебный год':lang==='kk'?'Пәндерді жаңа оқу жылына ауыстыру':'Move subjects to a new academic year' }}</div>
            </div>
            <svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </NuxtLink>

          <NuxtLink to="/ai-limit" class="row row-nav">
            <div class="ic" style="--ic:#AF52DE">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M18 17l.7 1.8L20.5 19.5l-1.8.7L18 22l-.7-1.8L15.5 19.5l1.8-.7z"/></svg>
            </div>
            <div class="row-main">
              <div class="row-title">{{ lang==='ru'?'AI лимит':lang==='kk'?'AI лимиті':'AI limit' }}</div>
              <div class="row-sub">{{ lang==='ru'?'Дневной лимит запросов к ИИ':lang==='kk'?'ЖИ сұрауларының күндік лимиті':'Daily AI request limit' }}</div>
            </div>
            <svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </NuxtLink>

          <NuxtLink to="/security" class="row row-nav">
            <div class="ic" style="--ic:#34C759">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="row-main">
              <div class="row-title">{{ lang==='ru'?'Аккаунт и безопасность':lang==='kk'?'Аккаунт және қауіпсіздік':'Account & security' }}</div>
              <div class="row-sub">{{ lang==='ru'?'Пароль и удаление аккаунта':lang==='kk'?'Құпия сөз және аккаунтты жою':'Password and account deletion' }}</div>
            </div>
            <svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </NuxtLink>

          <NuxtLink to="/about" class="row row-nav">
            <div class="ic" style="--ic:#8E8E93">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </div>
            <div class="row-main">
              <div class="row-title">{{ lang==='ru'?'О приложении':lang==='kk'?'Қосымша туралы':'About' }}</div>
              <div class="row-sub">{{ lang==='ru'?'Условия и политика конфиденциальности':lang==='kk'?'Шарттар және құпиялылық саясаты':'Terms and privacy policy' }}</div>
            </div>
            <svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </NuxtLink>
        </div>
      </section>

      <!-- Выход — отдельной группой, как деструктивное действие в iOS -->
      <section class="group g-6">
        <div class="group-body">
          <button class="row row-danger" @click="doLogout">{{ t('nav.logout') }}</button>
        </div>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useAuthSvc } from '~/services/auth'
import { useToast } from '~/composables/useToast'
import { useI18n } from '~/composables/useI18n'
import { useAuth } from '~/composables/useAuth'
definePageMeta({ layout: 'default' })
const auth = useAuthStore(); const authSvc = useAuthSvc(); const toast = useToast(); const { t, lang, setLang } = useI18n()
const { logout } = useAuth()
const doLogout = () => { logout() }

const fullnameInput = ref('')
const isDark = ref(false)
const scrolled = ref(false)

// Язык подписан на самом себе — так его узнают и те, кто не читает текущий
// язык интерфейса.
const langs = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
  { code: 'kk', name: 'Қазақша' },
]

const savedName = computed(() => (auth.fullname || auth.nickname || '').trim())
const displayName = computed(() => savedName.value || auth.user?.email?.split('@')[0] || '—')
// Имя считается неполным, только когда его начали вводить: пустое поле —
// это «ещё не трогал», а не ошибка, и краснеть на пустом экране незачем.
const nameInvalid = computed(() => {
  const v = fullnameInput.value.trim()
  return !!v && v.split(/\s+/).filter(Boolean).length < 2
})
const canSave = computed(() => fullnameInput.value.trim() !== savedName.value && !nameInvalid.value)

const roleLabel = computed(() => {
  const role = auth.user?.role
  if (role === 'admin') return t('settings.admin')
  if (role === 'teacher') return lang.value === 'ru' ? 'Преподаватель' : 'Teacher'
  return t('settings.student')
})
const institutionLabel = computed(() => {
  const isSchool = auth.user?.org_type === 'school'
  return isSchool
    ? (lang.value === 'ru' ? 'Школа' : lang.value === 'kk' ? 'Мектеп' : 'School')
    : (lang.value === 'ru' ? 'Университет' : lang.value === 'kk' ? 'Университет' : 'University')
})

const onScroll = (e: Event) => { scrolled.value = (e.target as HTMLElement).scrollTop > 4 }

const saveProfile = async () => {
  const fn = fullnameInput.value.trim()
  if (fn) {
    try {
      await authSvc.updateMe(fn)
    } catch {
      // Сервер не принял имя — не сохраняем локально и не показываем "успех":
      // иначе клиент считал бы себя сохранённым, пока для остальных
      // (учителей/одноклассников) видно старое имя (рассинхрон, скрытый от юзера).
      toast.err(t('general.error'))
      return
    }
    auth.setFullname(fn)
  }
  toast.ok(t('settings.nick_saved'))
}
const setTheme = (dark: boolean) => {
  isDark.value = dark
  if (dark) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark') }
  else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light') }
}
onMounted(() => {
  const theme = localStorage.getItem('theme')
  isDark.value = theme === 'dark'
  if (isDark.value) document.documentElement.classList.add('dark')
  fullnameInput.value = auth.fullname || auth.nickname || ''
})
</script>
<style scoped>
.pg{height:100%;overflow-y:auto;background:var(--bg)}

/* ---------- Шапка ---------- */
.pg-head{
  position:sticky;top:0;z-index:10;
  padding:26px 32px 14px;
  background:transparent;
  transition:background .3s ease,backdrop-filter .3s ease,box-shadow .3s ease;
}
/* Стекло шапки тянется во всю ширину, а её содержимое живёт в той же
   колонке, что и карточки, — иначе «Сохранить» уезжает к краю экрана. */
.head-inner{
  display:flex;align-items:flex-end;justify-content:space-between;gap:16px;
}
.pg-head::after{
  /* Мягкое затухание вместо hairline-разделителя: край проявляется только
     тогда, когда под плавающей шапкой действительно проезжает контент. */
  content:'';position:absolute;left:0;right:0;top:100%;height:18px;pointer-events:none;
  background:linear-gradient(to bottom,var(--bg),transparent);
  opacity:0;transition:opacity .3s ease;
}
.pg-head.scrolled{
  background:rgba(242,242,247,.72);
  -webkit-backdrop-filter:blur(20px) saturate(180%);
  backdrop-filter:blur(20px) saturate(180%);
}
html.dark .pg-head.scrolled{background:rgba(11,11,13,.72)}
.pg-head.scrolled::after{opacity:1}
/* Крупный заголовок: чем больше кегль, тем плотнее трекинг и интерлиньяж. */
.pg-title{
  font-size:28px;font-weight:700;line-height:1.1;letter-spacing:-.024em;color:var(--text1);
}
.save-pill{
  flex-shrink:0;padding:8px 18px;border-radius:100px;
  background:var(--teal);color:#fff;font-size:14px;font-weight:600;letter-spacing:-.01em;
  transition:transform .22s cubic-bezier(.32,.72,0,1),opacity .22s ease,background .18s ease;
}
.save-pill:hover:not(:disabled){background:var(--teal-h)}
.save-pill:active:not(:disabled){transform:scale(.94);transition:transform .08s}
.save-pill:disabled{
  background:var(--surface2);color:var(--text4);cursor:default;
}

/* ---------- Группы ---------- */
.pg-body{
  padding:6px 32px 48px;display:flex;flex-direction:column;gap:26px;width:100%;
}
.group{animation:fadeIn .34s cubic-bezier(.16,1,.3,1) both}
.g-1{animation-delay:0s}.g-2{animation-delay:.04s}.g-3{animation-delay:.08s}
.g-4{animation-delay:.12s}.g-5{animation-delay:.16s}.g-6{animation-delay:.2s}
.group-label{
  font-size:12px;font-weight:600;color:var(--text4);
  letter-spacing:.06em;text-transform:uppercase;
  padding:0 4px 8px;
}
.group-body{
  background:var(--surface);border-radius:var(--r-2xl);
  box-shadow:var(--sh-sm);overflow:hidden;
}
.group-foot{
  font-size:12.5px;line-height:1.45;color:var(--text4);
  padding:8px 4px 0;transition:color .18s ease;
}
.group-foot.err{color:var(--red)}

/* ---------- Строка списка ---------- */
.row{
  position:relative;display:flex;align-items:center;gap:12px;
  padding:12px 16px;min-height:52px;width:100%;
  color:var(--text1);text-align:left;text-decoration:none;
  background:transparent;
  /* Отклик появляется мгновенно (см. :active ниже), а гаснет плавно —
     так нажатие читается сразу, а отпускание не мигает. */
  transition:background .32s ease;
}
/* Разделители подрезаны под текст, а не тянутся во всю ширину карточки. */
.row + .row::before{
  content:'';position:absolute;left:16px;right:0;top:0;height:1px;
  background:var(--border);
}
/* Отступ разделителя равняется по тексту той строки, которой он принадлежит:
   у строк с иконкой текст начинается за ней. */
.row + .row:has(.ic)::before{left:58px}

.ic{
  flex-shrink:0;width:30px;height:30px;border-radius:8px;
  display:flex;align-items:center;justify-content:center;
  background:var(--ic);color:#fff;
}
.row-main{flex:1;min-width:0}
.row-title{font-size:15px;font-weight:500;letter-spacing:-.01em;color:var(--text1)}
.row-sub{font-size:12.5px;line-height:1.35;color:var(--text4);margin-top:1px}
.chev{color:var(--text4);flex-shrink:0;transition:transform .22s cubic-bezier(.32,.72,0,1)}

.row-nav{cursor:pointer}
@media (hover:hover){
  .row-nav:hover{background:var(--glass)}
  .row-nav:hover .chev{transform:translateX(2px)}
}
.row-nav:active{background:var(--glass2);transition:none}

/* ---------- Поля профиля ---------- */
.row-field{gap:16px}
.row-label{font-size:15px;font-weight:400;color:var(--text1);flex-shrink:0;min-width:132px}
.row-input{
  flex:1;min-width:0;border:none;background:transparent;
  font-size:15px;color:var(--text1);text-align:right;padding:0;
  text-overflow:ellipsis;
}
.row-input::placeholder{color:var(--text4)}
.row-value{
  flex:1;min-width:0;display:flex;align-items:center;justify-content:flex-end;gap:6px;
  font-size:15px;color:var(--text4);text-align:right;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.lock{flex-shrink:0;opacity:.6}

/* ---------- Карточка аккаунта ---------- */
.acct{display:flex;align-items:center;gap:16px;padding:20px}
.acct-text{flex:1;min-width:0}
.acct-name{
  font-size:20px;font-weight:600;letter-spacing:-.02em;color:var(--text1);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.acct-mail{
  font-size:13px;color:var(--text4);margin-top:2px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.acct-badge{
  flex-shrink:0;padding:5px 11px;border-radius:100px;
  background:var(--teal-l);color:var(--teal);
  font-size:11.5px;font-weight:600;letter-spacing:.01em;white-space:nowrap;
}

/* ---------- Переключатель ---------- */
.sw{
  flex-shrink:0;position:relative;width:51px;height:31px;border-radius:100px;
  background:var(--surface3);
  transition:background .28s cubic-bezier(.32,.72,0,1);
}
.sw.on{background:var(--teal)}
.sw-thumb{
  position:absolute;top:2px;left:2px;width:27px;height:27px;border-radius:50%;
  background:#fff;box-shadow:0 3px 8px rgba(0,0,0,.15),0 1px 1px rgba(0,0,0,.16);
  /* Лёгкий перелёт — щелчок тумблера физичен, у него есть инерция. */
  transition:transform .32s cubic-bezier(.34,1.4,.64,1);
}
.sw.on .sw-thumb{transform:translateX(20px)}
.sw:active .sw-thumb{box-shadow:0 3px 10px rgba(0,0,0,.2)}

/* ---------- Выбор языка ---------- */
.row-check{cursor:pointer}
@media (hover:hover){ .row-check:hover{background:var(--glass)} }
.row-check:active{background:var(--glass2);transition:none}
/* Галочка не переезжает между строками, а появляется на месте — поэтому
   короткое проявление с лёгким масштабом, без перемещения по экрану. */
@keyframes check-in{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
.check{
  color:var(--teal);flex-shrink:0;
  animation:check-in .2s cubic-bezier(.16,1,.3,1) both;
}

/* ---------- Выход ---------- */
.row-danger{
  justify-content:center;color:var(--red);font-size:15px;font-weight:500;
  min-height:50px;
}
@media (hover:hover){ .row-danger:hover{background:var(--red-l)} }
.row-danger:active{background:var(--red-l);transition:none}

/* ---------- Адаптив ---------- */
@media (max-width:768px){
  .pg{overflow-x:hidden}
  .pg-head{padding:calc(16px + env(safe-area-inset-top,0px)) 16px 12px}
  /* Крупный мобильный заголовок (28px/800 задаётся глобально в main.css)
     на 390px переносится на две строки, поэтому кнопка равняется по ПЕРВОЙ
     строке, а не повисает у нижней. */
  .head-inner{align-items:flex-start}
  .save-pill{margin-top:1px;padding:7px 14px;font-size:13px}
  .pg-body{padding:4px 16px 90px;gap:22px}
  .group-body{border-radius:var(--r-xl)}
  .row{min-height:56px;padding:13px 16px}
  /* iOS зумит страницу на фокусе поля с кеглем < 16px. */
  .row-input{font-size:16px}
  .row-field{flex-direction:column;align-items:stretch;gap:4px}
  .row-label{min-width:0;font-size:12.5px;color:var(--text4)}
  /* В столбик подпись уже серая, поэтому значение поднимаем по контрасту —
     иначе вся строка получается одним серым пятном. */
  .row-input,.row-value{text-align:left;justify-content:flex-start}
  .row-value{color:var(--text2)}
  .acct{padding:18px 16px;flex-wrap:wrap}
  /* Текст занимает всю ширину — бейдж переносится на вторую строку и
     выравнивается по имени, а не липнет к нему сбоку. */
  .acct-text{min-width:100%}
  .acct-badge{margin-top:10px}
  .sw{width:51px;height:31px}
}
@media (max-width:480px){
  .pg-head{padding:calc(12px + env(safe-area-inset-top,0px)) 14px 10px}
  .pg-body{padding:4px 14px 90px}
}

/* «Меньше прозрачности» — плотная шапка вместо размытого стекла. */
@media (prefers-reduced-transparency:reduce){
  .pg-head.scrolled{background:var(--bg);-webkit-backdrop-filter:none;backdrop-filter:none}
  html.dark .pg-head.scrolled{background:var(--bg)}
}
</style>
