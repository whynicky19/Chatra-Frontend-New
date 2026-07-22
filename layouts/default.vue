<template>
  <div class="shell">
    <AppSidebar />
    <main class="shell-main"><slot /></main>
    <ToastContainer />
    <LazyFilePreviewModal />
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useAuthStore } from '~/stores/auth.store'

const { fetchMe } = useAuth()
const auth = useAuthStore()

onMounted(async () => {
  if (auth.token && !auth.user) await fetchMe()
})
</script>
<style scoped>
.shell{display:flex;height:100vh;height:100dvh;overflow:hidden;background:var(--bg)}
.shell-main{position:relative;flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
@media (max-width:768px){
  .shell{flex-direction:column;overflow:hidden;width:100%;max-width:100vw;height:100vh;height:100dvh}
  .shell-main{overflow:hidden;width:100%;max-width:100vw;overflow-x:hidden;height:100%;padding-bottom:calc(76px + env(safe-area-inset-bottom, 0px));box-sizing:border-box}
}
@media (max-width:480px){
  .shell-main{padding-bottom:calc(72px + env(safe-area-inset-bottom, 0px))}
}
</style>