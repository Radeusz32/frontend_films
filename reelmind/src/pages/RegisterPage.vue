<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')

const passwordError = computed(() =>
  passwordConfirm.value && password.value !== passwordConfirm.value
    ? 'Passwords do not match'
    : '',
)

async function handleSubmit() {
  if (passwordError.value) return
  await authStore.register({
    name: name.value,
    email: email.value,
    password: password.value,
    passwordConfirm: passwordConfirm.value,
  })
  if (authStore.isAuthenticated) router.push({ name: 'home' })
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">
        <span class="logo-reel">Reel</span><span class="logo-mind">Mind</span>
      </div>
      <h1>{{ t('auth.register') }}</h1>

      <div v-if="authStore.error" class="auth-error">{{ authStore.error }}</div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <AppInput v-model="name" id="name" :label="t('auth.name')" placeholder="Jan Kowalski" />
        <AppInput v-model="email" id="email" :label="t('auth.email')" type="email" placeholder="you@example.com" />
        <AppInput v-model="password" id="password" :label="t('auth.password')" type="password" placeholder="••••••••" />
        <AppInput
          v-model="passwordConfirm"
          id="password-confirm"
          :label="t('auth.password_confirm')"
          type="password"
          placeholder="••••••••"
          :error="passwordError"
        />
        <AppButton type="submit" size="lg" :loading="authStore.loading" :disabled="!!passwordError" style="width: 100%">
          {{ authStore.loading ? t('auth.registering') : t('auth.sign_up') }}
        </AppButton>
      </form>

      <p class="auth-switch">
        {{ t('auth.have_account') }}
        <RouterLink to="/login">{{ t('auth.sign_in') }}</RouterLink>
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
.auth-switch { text-align: center; font-size: 14px; color: #64748b; margin: 20px 0 0; }
.auth-switch a { color: #e11d48; text-decoration: none; font-weight: 600; }
.auth-switch a:hover { text-decoration: underline; }
</style>
