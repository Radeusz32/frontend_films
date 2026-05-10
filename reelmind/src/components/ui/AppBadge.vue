<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }>(), { variant: 'default' })
</script>

<template>
  <span class="badge" :class="`badge--${variant}`"><slot /></span>
</template>

<style scoped>
.badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  border: 1px solid transparent;
}
.badge--default { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.1); }
.badge--success { background: rgba(34,197,94,0.12); color: #4ade80; border-color: rgba(34,197,94,0.2); }
.badge--warning { background: rgba(245,158,11,0.12); color: #fbbf24; border-color: rgba(245,158,11,0.2); }
.badge--danger { background: rgba(239,68,68,0.12); color: #f87171; border-color: rgba(239,68,68,0.2); }
.badge--info { background: rgba(67,97,238,0.15); color: #818cf8; border-color: rgba(67,97,238,0.25); }
</style>
