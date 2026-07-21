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
      <NuxtLink to="/terms" class="scard link-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/></svg>
        <span style="flex:1">{{ t('common.terms') }}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </NuxtLink>

      <NuxtLink to="/privacy" class="scard link-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
        <span style="flex:1">{{ t('common.privacy') }}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </NuxtLink>

      <div class="brand">Chatra</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

definePageMeta({ layout: 'default' })
const { t, lang } = useI18n()
</script>

<style scoped>
.pg{height:100%;display:flex;flex-direction:column;overflow-y:auto;background:var(--bg)}
.pg-head{padding:28px 32px 0;flex-shrink:0}
.back-link{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:var(--text4);text-decoration:none;margin-bottom:10px;transition:color .15s}
.back-link:hover{color:var(--teal)}
.pg-title{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;font-size:26px;font-weight:800;color:var(--text1);margin-bottom:4px}
.pg-sub{font-size:14px;color:var(--text4)}
.pg-body{padding:20px 32px 40px;display:flex;flex-direction:column;gap:16px}
.scard{background:var(--surface);border-radius:20px;box-shadow:var(--sh-sm)}
.link-card{display:flex;align-items:center;gap:12px;padding:16px 24px;color:var(--text1);text-decoration:none;font-size:15px;font-weight:600;transition:background .15s}
.link-card:hover{background:var(--hover,rgba(0,0,0,.03))}
.brand{text-align:center;font-size:12.5px;color:var(--text4);margin-top:8px}

@media(max-width:768px){.pg-head{padding:20px 18px 0}.pg-body{padding:16px 18px 32px}}
</style>
