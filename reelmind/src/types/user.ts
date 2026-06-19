export type UserRole = 'admin' | 'user'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  avatar?: string
  createdAt: string
  onboardingCompleted: boolean
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  avatar?: string
}

export interface UserPreferences {
  favoriteGenres: string[]
  favoriteMovieIds: number[]
  preferredDecades: number[]
  preferredLanguages: string[]
  updatedAt: string | null
}

export interface SavePreferencesPayload {
  favoriteGenres: string[]
  favoriteMovieIds: number[]
  preferredDecades: number[]
  preferredLanguages: string[]
}
