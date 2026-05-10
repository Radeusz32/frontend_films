<script setup lang="ts">
defineProps<{ width?: string; height?: string; rounded?: boolean }>()
</script>

<template>
  <div
    class="skeleton"
    :style="{ width: width ?? '100%', height: height ?? '1rem' }"
    :class="{ 'skeleton--rounded': rounded }"
  />
</template>

<style scoped>
.skeleton {
  background: linear-gradient(90deg, #1e293b 25%, #263348 50%, #1e293b 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}
.skeleton--rounded { border-radius: 50%; }
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
