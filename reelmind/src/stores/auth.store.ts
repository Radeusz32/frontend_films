import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthAPI } from '@/api/modules/auth.api'
import { config } from '@/api/config'
import type { User } from '@/types/user'
import type { LoginPayload, RegisterPayload } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const role = computed(() => user.value?.role ?? null)

  async function login(payload: LoginPayload): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const res = await AuthAPI.login(payload)
      user.value = res.user
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
      // access token expired — try refresh before giving up
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
  }

  function clearError(): void {
    error.value = null
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    role,
    login,
    register,
    fetchMe,
    logout,
    clearError,
  }
})
