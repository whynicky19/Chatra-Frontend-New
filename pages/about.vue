<template>
  <div class="pg anim-in">
    <div class="pg-head">
      <NuxtLink to="/settings" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        {{ t('settings.title') }}
      </NuxtLink>
      <h1 class="pg-title">{{ lang==='ru'?'О приложении':lang==='kk'?'Қосымша туралы':'About' }}</h1>
      <p class="pg-sub">{{ lang==='ru'?'Документы и правовая информация':lang==='kk'?'Құжаттар және құқықтық ақпарат':'Documents and legal information' }}</p>
    </div>

    <div class="pg-body">
      <!-- Один сгруппированный список вместо трёх отдельных карточек с тенями:
           это три пункта одного раздела, а не три самостоятельных объекта.
           Строки те же, что в настройках, — переход между экранами не должен
           менять правила игры. -->
      <h2 class="group-label">{{ lang==='ru'?'Документы':lang==='kk'?'Құжаттар':'Documents' }}</h2>
      <nav class="group-body">
        <NuxtLink to="/terms" class="row row-nav">
          <div class="ic" style="--ic:#007AFF">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/></svg>
          </div>
          <div class="row-main">
            <div class="row-title">{{ t('common.terms') }}</div>
            <div class="row-sub">{{ lang==='ru'?'Права и обязанности при использовании сервиса':lang==='kk'?'Сервисті пайдалану кезіндегі құқықтар мен міндеттер':'Your rights and obligations when using the service' }}</div>
          </div>
          <svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </NuxtLink>
        <NuxtLink to="/privacy" class="row row-nav">
          <div class="ic" style="--ic:#34C759">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
          </div>
          <div class="row-main">
            <div class="row-title">{{ t('common.privacy') }}</div>
            <div class="row-sub">{{ lang==='ru'?'Какие данные мы собираем и зачем':lang==='kk'?'Қандай деректерді жинаймыз және не үшін':'What data we collect and why' }}</div>
          </div>
          <svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </NuxtLink>
        <NuxtLink to="/rules" class="row row-nav">
          <div class="ic" style="--ic:#FF9500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div class="row-main">
            <div class="row-title">{{ t('common.rules') }}</div>
            <div class="row-sub">{{ lang==='ru'?'Как вести себя на платформе':lang==='kk'?'Платформада өзін қалай ұстау керек':'How to behave on the platform' }}</div>
          </div>
          <svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </NuxtLink>
      </nav>

      <div class="brand">
        <div class="brand-name">Chatra</div>
        <div class="brand-year">© {{ year }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

definePageMeta({ layout: 'default' })
const { t, lang } = useI18n()

const year = new Date().getFullYear()
</script>

<style scoped>
.pg{height:100%;display:flex;flex-direction:column;overflow-y:auto;background:var(--bg)}
.pg-head{padding:26px 32px 0;flex-shrink:0}
.back-link{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:var(--text4);text-decoration:none;margin-bottom:10px;transition:color .15s}
.back-link:hover{color:var(--teal)}
/* Шрифт и трекинг заголовка приходят из .pg-title в main.css: пиннить здесь
   'SF Pro Display' значит навязать мелкому тексту крупный оптический размер.
   Вес 700, а не 800: у Apple заголовок набирается bold, а не heavy. */
.pg-title{font-size:28px;font-weight:700;line-height:1.1;letter-spacing:-.024em;color:var(--text1);margin-bottom:4px}
.pg-sub{font-size:15px;color:var(--text4)}
.pg-body{padding:20px 32px 40px;display:flex;flex-direction:column;width:100%}

.group-label{
  font-size:12px;font-weight:600;color:var(--text4);
  letter-spacing:.06em;text-transform:uppercase;padding:0 4px 8px;
}
.group-body{background:var(--surface);border-radius:var(--r-2xl);box-shadow:var(--sh-sm);overflow:hidden}

.row{
  position:relative;display:flex;align-items:center;gap:12px;
  padding:12px 16px;min-height:52px;width:100%;
  color:var(--text1);text-decoration:none;background:transparent;
  /* Отклик появляется мгновенно (см. :active ниже), а гаснет плавно. */
  transition:background .32s ease;
}
/* Разделитель равняется по тексту строки, а не по краю карточки. */
.row + .row::before{content:'';position:absolute;left:58px;right:0;top:0;height:1px;background:var(--border)}
.ic{
  flex-shrink:0;width:30px;height:30px;border-radius:8px;
  display:flex;align-items:center;justify-content:center;
  background:var(--ic);color:#fff;
}
.row-main{flex:1;min-width:0}
.row-title{font-size:15px;font-weight:500;letter-spacing:-.01em;color:var(--text1)}
.row-sub{font-size:12.5px;line-height:1.35;color:var(--text4);margin-top:1px}
.chev{color:var(--text4);flex-shrink:0;transition:transform .22s cubic-bezier(.32,.72,0,1)}
@media (hover:hover){
  .row-nav:hover{background:var(--glass)}
  .row-nav:hover .chev{transform:translateX(2px)}
}
.row-nav:active{background:var(--glass2);transition:none}

.brand{text-align:center;margin-top:32px}
.brand-name{font-size:15px;font-weight:600;letter-spacing:-.01em;color:var(--text4)}
.brand-year{font-size:12.5px;color:var(--text4);margin-top:2px;opacity:.7}

@media(max-width:768px){
  .pg-head{padding:calc(16px + env(safe-area-inset-top,0px)) 16px 0}
  .pg-body{padding:16px 16px 90px}
  .group-body{border-radius:var(--r-xl)}
  .row{min-height:56px;padding:13px 16px}
  .back-link{position:relative;display:inline-flex}
  .back-link::after{content:'';position:absolute;top:-14px;bottom:-14px;left:-6px;right:-6px}
}
</style>
