import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthAPI } from '@/api/modules/auth.api'
import { config } from '@/api/config'
import { i18n } from '@/i18n'
import { useToastStore } from './toast.store'
import type { User } from '@/types/user'
import type { LoginPayload, RegisterPayload } from '@/types/auth'

const SESSION_KEY = 'rm_rec_popup_shown'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const showRecPopup = ref(false)

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const role = computed(() => user.value?.role ?? null)
  const needsOnboarding = computed(() => user.value !== null && user.value.onboardingCompleted === false)

  const t = (key: string) => i18n.global.t(key)

  function _triggerRecPopup() {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      showRecPopup.value = true
      sessionStorage.setItem(SESSION_KEY, '1')
    }
  }

  function closeRecPopup() {
    showRecPopup.value = false
  }

  async function login(payload: LoginPayload): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const res = await AuthAPI.login(payload)
      user.value = res.user
      useToastStore().success(t('toast.login_success'))
      _triggerRecPopup()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Login failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const res = await AuthAPI.register(payload)
      user.value = res.user
      useToastStore().success(t('toast.register_success'))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Register failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchMe(): Promise<void> {
    const token = localStorage.getItem(config.tokenKey)
    if (!token) return
    try {
      user.value = await AuthAPI.me()
    } catch {
      try {
        await AuthAPI.refresh()
        user.value = await AuthAPI.me()
      } catch {
        logout()
      }
    }
  }

  function logout(): void {
    AuthAPI.logout()
    user.value = null
    error.value = null
    useToastStore().success(t('toast.logout_success'))
  }

  function clearError(): void {
    error.value = null
  }

  return {
    user, loading, error, showRecPopup,
    isAuthenticated, isAdmin, role, needsOnboarding,
    login, register, fetchMe, logout, clearError, closeRecPopup,
  }
})
