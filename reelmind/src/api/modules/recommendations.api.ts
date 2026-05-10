import { http } from '@/api/client'
import type { RecommendationResponse } from '@/types/recommendation'

export const RecommendationsAPI = {
  get(): Promise<RecommendationResponse> {
    return http.get<RecommendationResponse>('/recommendations')
  },
}
