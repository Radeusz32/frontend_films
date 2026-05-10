import { http } from '@/api/client'
import type { Rating, CreateRatingPayload } from '@/types/rating'

export const RatingsAPI = {
  getAll(): Promise<Rating[]> {
    return http.get<Rating[]>('/ratings')
  },

  getMyRatings(): Promise<Rating[]> {
    return http.get<Rating[]>('/ratings/me')
  },

  create(payload: CreateRatingPayload): Promise<Rating> {
    return http.post<Rating>('/ratings', payload)
  },

  remove(id: number): Promise<void> {
    return http.delete<void>(`/ratings/${id}`)
  },
}
