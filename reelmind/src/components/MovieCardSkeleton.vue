<script setup lang="ts">
import AppSkeleton from '@/components/ui/AppSkeleton.vue'
</script>

<template>
  <div class="skeleton-card">
    <AppSkeleton height="100%" />
  </div>
</template>

<style scoped>
.skeleton-card {
  aspect-ratio: 2/3;
  border-radius: var(--radius-md, 12px);
  overflow: hidden;
}
</style>
