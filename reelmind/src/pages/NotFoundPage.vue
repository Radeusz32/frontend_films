<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppButton from '@/components/ui/AppButton.vue'
const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <div class="not-found">
    <h1 class="nf-code">404</h1>
    <h2>{{ t('errors.404') }}</h2>
    <p>The page you're looking for doesn't exist.</p>
    <AppButton size="lg" @click="router.push({ name: 'home' })">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      Go Home
    </AppButton>
  </div>
</template>

<style scoped>
.not-found { min-height: 80vh; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 14px; text-align: center; padding: 20px; }
.nf-code { font-size: 110px; font-weight: 900; color: var(--blue, #4361ee); margin: 0; line-height: 1; letter-spacing: -0.06em; text-shadow: 0 0 80px rgba(67,97,238,0.4); }
.not-found h2 { font-size: 26px; color: var(--text, #fff); margin: 0; font-weight: 800; }
.not-found p { color: var(--text-muted); margin: 0; }
</style>
