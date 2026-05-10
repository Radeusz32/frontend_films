import { http } from '@/api/client'
import type { User } from '@/types/user'

export interface AdminStats {
  totalMovies: number
  totalUsers: number
  totalRatings: number
  averageRating: string
}

export const AdminAPI = {
  getStats(): Promise<AdminStats> {
    return http.get<AdminStats>('/admin/stats')
  },

  getUsers(): Promise<User[]> {
    return http.get<User[]>('/admin/users')
  },
}
