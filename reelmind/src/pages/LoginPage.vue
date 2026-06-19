<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

async function handleSubmit() {
  await authStore.login({ email: email.value, password: password.value })
  if (authStore.isAuthenticated) {
    const redirect = route.query['redirect'] as string | undefined
    router.push(redirect ?? { name: 'home' })
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <RouterLink to="/" class="auth-logo">
        <span class="logo-reel">Reel</span><span class="logo-mind">Mind</span>
      </RouterLink>
      <h1>{{ t('auth.login') }}</h1>
      <p class="auth-sub">Witaj z powrotem!</p>

      <div v-if="authStore.error" class="auth-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <AppInput v-model="email" id="email" :label="t('auth.email')" type="email" placeholder="you@example.com" />
        <AppInput v-model="password" id="password" :label="t('auth.password')" type="password" placeholder="••••••••" />
        <AppButton type="submit" size="lg" :loading="authStore.loading" style="width:100%;justify-content:center">
          {{ authStore.loading ? t('auth.logging_in') : t('auth.sign_in') }}
        </AppButton>
      </form>

      <p class="auth-switch">{{ t('auth.no_account') }} <RouterLink to="/register">{{ t('auth.sign_up') }}</RouterLink></p>
    </div>
  </div>
</template>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(ellipse at 50% 0%, rgba(67,97,238,0.12) 0%, transparent 60%), var(--bg, #07091a); padding: 20px; }
.auth-card { background: var(--bg-card, #0d1426); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-xl, 20px); padding: 44px 40px; width: 100%; max-width: 420px; box-shadow: 0 24px 80px rgba(0,0,0,0.6); }
.auth-logo { display: block; text-align: center; font-size: 26px; font-weight: 900; text-decoration: none; margin-bottom: 24px; letter-spacing: -0.05em; }
.logo-reel { color: var(--text, #fff); }
.logo-mind { color: var(--blue, #4361ee); }
.auth-card h1 { font-size: 22px; font-weight: 800; color: var(--text, #fff); margin: 0 0 4px; text-align: center; letter-spacing: -0.03em; }
.auth-sub { text-align: center; color: var(--text-muted); font-size: 14px; margin: 0 0 28px; }
.auth-error { display: flex; align-items: center; gap: 8px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #f87171; border-radius: var(--radius-sm, 8px); padding: 10px 14px; font-size: 13px; margin-bottom: 20px; }
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.auth-switch { text-align: center; font-size: 14px; color: var(--text-muted); margin: 16px 0 0; }
.auth-switch a { color: var(--blue, #4361ee); text-decoration: none; font-weight: 700; }
.auth-switch a:hover { text-decoration: underline; }
</style>
