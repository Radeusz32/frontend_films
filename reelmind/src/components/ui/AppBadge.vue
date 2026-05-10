<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }>(), {
  variant: 'default',
})
</script>

<template>
  <span class="badge" :class="`badge--${variant}`"><slot /></span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.badge--default { background: #1e293b; color: #94a3b8; }
.badge--success { background: rgba(34,197,94,0.15); color: #22c55e; }
.badge--warning { background: rgba(234,179,8,0.15); color: #eab308; }
.badge--danger { background: rgba(239,68,68,0.15); color: #ef4444; }
.badge--info { background: rgba(59,130,246,0.15); color: #3b82f6; }
</style>
