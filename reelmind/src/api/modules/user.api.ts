import { http } from '@/api/client'
import type { User, UpdateUserPayload, UserPreferences, SavePreferencesPayload } from '@/types/user'
import type { Movie } from '@/types/movie'

export const UserAPI = {
  getProfile(): Promise<User> {
    return http.get<User>('/user')
  },

  updateProfile(payload: UpdateUserPayload): Promise<User> {
    return http.put<User>('/user', payload)
  },

  getWatchlist(): Promise<Movie[]> {
    return http.get<Movie[]>('/user/watchlist')
  },

  addToWatchlist(movieId: number): Promise<void> {
    return http.post<void>('/user/watchlist', { movieId })
  },

  removeFromWatchlist(movieId: number): Promise<void> {
    return http.delete<void>(`/user/watchlist/${movieId}`)
  },

  getOnboarding(): Promise<UserPreferences> {
    return http.get<UserPreferences>('/user/onboarding')
  },

  saveOnboarding(payload: SavePreferencesPayload): Promise<User> {
    return http.post<User>('/user/onboarding', payload)
  },

  dismissOnboarding(): Promise<User> {
    return http.post<User>('/user/onboarding/dismiss')
  },
}
