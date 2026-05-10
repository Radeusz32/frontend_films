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

async function loginAsDemo(role: 'admin' | 'user') {
  email.value = role === 'admin' ? 'admin@reelmind.app' : 'user@reelmind.app'
  password.value = role === 'admin' ? 'admin123' : 'user123'
  await handleSubmit()
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">
        <span class="logo-reel">Reel</span><span class="logo-mind">Mind</span>
      </div>
      <h1>{{ t('auth.login') }}</h1>

      <div v-if="authStore.error" class="auth-error">{{ authStore.error }}</div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <AppInput
          v-model="email"
          id="email"
          :label="t('auth.email')"
          type="email"
          placeholder="you@example.com"
        />
        <AppInput
          v-model="password"
          id="password"
          :label="t('auth.password')"
          type="password"
          placeholder="••••••••"
        />
        <AppButton type="submit" size="lg" :loading="authStore.loading" style="width: 100%">
          {{ authStore.loading ? t('auth.logging_in') : t('auth.sign_in') }}
        </AppButton>
      </form>

      <div class="divider"><span>or</span></div>

      <div class="demo-buttons">
        <AppButton variant="secondary" @click="loginAsDemo('user')" style="flex: 1">
          👤 {{ t('auth.demo_user') }}
        </AppButton>
        <AppButton variant="secondary" @click="loginAsDemo('admin')" style="flex: 1">
          🛡️ {{ t('auth.demo_admin') }}
        </AppButton>
      </div>

      <p class="auth-switch">
        {{ t('auth.no_account') }}
        <RouterLink to="/register">{{ t('auth.sign_up') }}</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at 50% 0%, rgba(225,29,72,0.1) 0%, transparent 60%), #020617;
  padding: 20px;
}
.auth-card {
  background: #0f172a; border: 1px solid #1e293b;
  border-radius: 20px; padding: 40px; width: 100%; max-width: 420px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6);
}
.auth-logo { font-size: 28px; font-weight: 800; margin-bottom: 8px; text-align: center; }
.logo-reel { color: #e2e8f0; }
.logo-mind { color: #e11d48; }
.auth-card h1 { font-size: 22px; font-weight: 700; color: #e2e8f0; margin: 0 0 24px; text-align: center; }

.auth-error {
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
  color: #ef4444; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 16px;
}
.auth-form { display: flex; flex-direction: column; gap: 16px; }

.divider {
  display: flex; align-items: center; gap: 12px; margin: 20px 0;
  color: #334155; font-size: 12px;
}
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #1e293b; }

.demo-buttons { display: flex; gap: 10px; margin-bottom: 20px; }

.auth-switch { text-align: center; font-size: 14px; color: #64748b; margin: 16px 0 0; }
.auth-switch a { color: #e11d48; text-decoration: none; font-weight: 600; }
.auth-switch a:hover { text-decoration: underline; }
</style>
