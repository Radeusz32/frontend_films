<script setup lang="ts">
import { useToastStore } from '@/stores/toast.store'

const toast = useToastStore()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="t in toast.toasts"
          :key="t.id"
          :class="['toast', `toast--${t.type}`]"
          role="alert"
        >
          <span class="toast-icon">
            <svg v-if="t.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </span>
          <span class="toast-message">{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 74px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 600;
  min-width: 320px;
  max-width: 440px;
  pointer-events: all;
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

.toast--success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(5, 150, 105, 0.10));
  border-color: rgba(16, 185, 129, 0.35);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(16, 185, 129, 0.1) inset, 0 1px 0 rgba(255,255,255,0.06) inset;
}

.toast--error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(185, 28, 28, 0.10));
  border-color: rgba(239, 68, 68, 0.35);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(239, 68, 68, 0.1) inset, 0 1px 0 rgba(255,255,255,0.06) inset;
}

.toast-icon-wrap {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast--success .toast-icon-wrap {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.toast--error .toast-icon-wrap {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.toast-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toast-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.6;
}

.toast--success .toast-label { color: #34d399; }
.toast--error   .toast-label { color: #f87171; }

.toast-message {
  color: #fff;
  line-height: 1.45;
  font-size: 14px;
  font-weight: 600;
}

.toast-close {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  color: rgba(255, 255, 255, 0.45);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.15s;
  align-self: flex-start;
}
.toast-close:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

/* Decorative glow line at top */
.toast::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20px;
  right: 20px;
  height: 1px;
}
.toast--success::before { background: linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.6), transparent); }
.toast--error::before   { background: linear-gradient(90deg, transparent, rgba(248, 113, 113, 0.6), transparent); }

/* Animations */
.toast-enter-active { transition: all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { transition: all 0.22s cubic-bezier(0.4, 0, 1, 1); }
.toast-enter-from { opacity: 0; transform: translateX(80px) scale(0.88); }
.toast-leave-to   { opacity: 0; transform: translateX(80px) scale(0.92); }
.toast-move       { transition: transform 0.28s ease; }
</style>
