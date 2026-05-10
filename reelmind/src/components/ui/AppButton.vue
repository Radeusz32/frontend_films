<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
})
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--loading': loading }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="btn-spinner" />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn--sm { padding: 6px 14px; font-size: 13px; }
.btn--md { padding: 10px 20px; font-size: 14px; }
.btn--lg { padding: 14px 28px; font-size: 16px; }

.btn--primary { background: #e11d48; color: #fff; }
.btn--primary:hover:not(:disabled) { background: #be123c; }

.btn--secondary { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; }
.btn--secondary:hover:not(:disabled) { background: #263348; }

.btn--ghost { background: transparent; color: #94a3b8; }
.btn--ghost:hover:not(:disabled) { color: #e2e8f0; background: rgba(255,255,255,0.05); }

.btn--danger { background: #dc2626; color: #fff; }
.btn--danger:hover:not(:disabled) { background: #b91c1c; }

.btn-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
