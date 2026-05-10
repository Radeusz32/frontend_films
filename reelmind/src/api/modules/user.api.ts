import { http } from '@/api/client'
import type { User, UpdateUserPayload } from '@/types/user'
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
}
