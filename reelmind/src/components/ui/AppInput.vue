<script setup lang="ts">
defineProps<{ modelValue: string; label?: string; type?: string; placeholder?: string; error?: string; id?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="field">
    <label v-if="label" :for="id" class="label">{{ label }}</label>
    <input
      :id="id"
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      class="input"
      :class="{ 'input--error': error }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="error-msg">{{ error }}</span>
  </div>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: 6px; }
.label { font-size: 13px; font-weight: 600; color: var(--text-muted); }
.input {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-sm, 8px);
  padding: 11px 14px; color: var(--text, #fff);
  font-size: 14px; outline: none; transition: all 0.2s;
}
.input::placeholder { color: var(--text-light, rgba(255,255,255,0.3)); }
.input:focus { border-color: var(--blue, #4361ee); background: rgba(255,255,255,0.09); box-shadow: 0 0 0 3px var(--blue-light, rgba(67,97,238,0.18)); }
.input--error { border-color: var(--error, #ef4444); }
.error-msg { font-size: 12px; color: var(--error, #ef4444); }
</style>
