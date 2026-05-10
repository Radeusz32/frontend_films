export type UserRole = 'admin' | 'user'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  avatar?: string
  createdAt: string
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  avatar?: string
}
