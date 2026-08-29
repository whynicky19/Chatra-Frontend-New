<template>
  <NuxtLayout>
    <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { setI18nLang } from '~/composables/useI18n'
// Тема применяется до первой отрисовки, иначе моргает светлый фон.
useHead({
  script: [
    {
      innerHTML: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})();`,
      tagPosition: 'head',
    }
  ]
})

// Язык подтягиваем уже после монтирования — localStorage доступен только
// на клиенте. Раньше это делал useI18n() через onMounted() внутри composable,
// что запрещено (lifecycle hook обязан вызываться только в setup компонента).
onMounted(() => {
  const saved = localStorage.getItem('_lang')
  if (saved === 'en' || saved === 'ru' || saved === 'kk') {
    setI18nLang(saved)
  }
})
</script>


