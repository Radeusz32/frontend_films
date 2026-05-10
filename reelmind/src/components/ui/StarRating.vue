<script setup lang="ts">
import { ref } from 'vue'
const props = withDefaults(defineProps<{ modelValue: number; max?: number; readonly?: boolean; size?: number }>(), { max: 10, readonly: false, size: 20 })
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()
const hovered = ref(0)
function select(val: number) { if (!props.readonly) emit('update:modelValue', val) }
</script>

<template>
  <div class="stars" :style="{ gap: `${size / 5}px` }">
    <button
      v-for="i in max" :key="i" class="star"
      :class="{ active: i <= (hovered || modelValue), readonly }"
      :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${size}px` }"
      @mouseenter="!readonly && (hovered = i)"
      @mouseleave="!readonly && (hovered = 0)"
      @click="select(i)" :disabled="readonly" type="button"
    >★</button>
  </div>
</template>

<style scoped>
.stars { display: flex; align-items: center; }
.star { background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.15); transition: color 0.15s, transform 0.1s; padding: 0; line-height: 1; }
.star.active { color: var(--rating, #f59e0b); }
.star:hover:not(.readonly) { transform: scale(1.2); color: var(--rating, #f59e0b); }
.star.readonly { cursor: default; }
</style>
