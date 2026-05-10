import type { User } from './user'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  passwordConfirm: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: User
}

export interface RefreshResponse {
  access: string
}
