import { http } from '@/api/client'
import { config } from '@/api/config'
import type { LoginPayload, RegisterPayload, AuthResponse, RefreshResponse } from '@/types/auth'
import type { User } from '@/types/user'

export const AuthAPI = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await http.post<AuthResponse>('/auth/login', payload)
    localStorage.setItem(config.tokenKey, res.access)
    localStorage.setItem(config.refreshKey, res.refresh)
    return res
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await http.post<AuthResponse>('/auth/register', payload)
    localStorage.setItem(config.tokenKey, res.access)
    localStorage.setItem(config.refreshKey, res.refresh)
    return res
  },

  async me(): Promise<User> {
    return http.get<User>('/auth/me')
  },

  async refresh(): Promise<string> {
    const refresh = localStorage.getItem(config.refreshKey)
    const res = await http.post<RefreshResponse>('/auth/refresh', { refresh })
    localStorage.setItem(config.tokenKey, res.access)
    return res.access
  },

  logout(): void {
    localStorage.removeItem(config.tokenKey)
    localStorage.removeItem(config.refreshKey)
    http.post('/auth/logout').catch(() => undefined)
  },
}
