<template>
  <div class="pts">
    <PdfThumbnail
      v-for="p in pageCount"
      :key="p"
      :doc="doc"
      :page-num="p"
      :active="p === currentPage"
      @click="$emit('select', p)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{ doc: any; pageCount: number; currentPage: number }>()
defineEmits<{ (e: 'select', page: number): void }>()
</script>

<style scoped>
.pts { display: flex; gap: 8px; overflow-x: auto; padding: 10px 14px; }
</style>
