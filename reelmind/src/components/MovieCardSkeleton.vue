<script setup lang="ts">
import AppSkeleton from '@/components/ui/AppSkeleton.vue'
</script>

<template>
  <div class="skeleton-card">
    <AppSkeleton height="280px" />
    <div class="skeleton-body">
      <AppSkeleton height="16px" width="80%" />
      <AppSkeleton height="12px" width="50%" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: #0f172a;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #1e293b;
}
.skeleton-body { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 8px; }
</style>
