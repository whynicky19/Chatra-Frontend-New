<template>
  <NuxtLayout>
    <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Тема применяется до первой отрисовки, иначе моргает светлый фон.
useHead({
  script: [
    {
      children: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})();`,
      tagPosition: 'head',
    }
  ]
})
</script>
