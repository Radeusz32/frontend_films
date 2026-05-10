<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppButton from '@/components/ui/AppButton.vue'

const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <div class="not-found">
    <div class="nf-content">
      <h1 class="nf-code">404</h1>
      <h2>{{ t('errors.404') }}</h2>
      <p>The page you're looking for doesn't exist.</p>
      <AppButton size="lg" @click="router.push({ name: 'home' })">← Go Home</AppButton>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 80vh; display: flex; align-items: center; justify-content: center;
}
.nf-content { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.nf-code { font-size: 120px; font-weight: 900; color: #e11d48; margin: 0; line-height: 1; }
.nf-content h2 { font-size: 28px; color: #e2e8f0; margin: 0; }
.nf-content p { color: #64748b; margin: 0; }
</style>
