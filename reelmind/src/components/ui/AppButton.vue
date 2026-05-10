<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>(), { variant: 'primary', size: 'md', loading: false, disabled: false, type: 'button' })
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
  display: inline-flex; align-items: center; gap: 8px;
  border: none; border-radius: var(--radius-sm, 8px);
  font-family: inherit; font-weight: 700; cursor: pointer;
  transition: all 0.18s; white-space: nowrap; letter-spacing: -0.01em;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }

.btn--sm { padding: 6px 14px; font-size: 13px; }
.btn--md { padding: 10px 20px; font-size: 14px; }
.btn--lg { padding: 13px 26px; font-size: 15px; }

.btn--primary { background: var(--blue, #4361ee); color: #fff; box-shadow: 0 2px 12px rgba(67,97,238,0.4); }
.btn--primary:hover:not(:disabled) { background: var(--blue-dark, #3451db); box-shadow: 0 4px 20px rgba(67,97,238,0.5); transform: translateY(-1px); }
.btn--primary:active:not(:disabled) { transform: translateY(0); }

.btn--secondary { background: rgba(255,255,255,0.1); color: var(--text, #fff); border: 1px solid rgba(255,255,255,0.15); backdrop-filter: blur(4px); }
.btn--secondary:hover:not(:disabled) { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.25); }

.btn--ghost { background: transparent; color: var(--text-muted, rgba(255,255,255,0.55)); border: 1px solid rgba(255,255,255,0.1); }
.btn--ghost:hover:not(:disabled) { color: var(--text, #fff); background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.2); }

.btn--danger { background: #ef4444; color: #fff; }
.btn--danger:hover:not(:disabled) { background: #dc2626; }

.btn-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
