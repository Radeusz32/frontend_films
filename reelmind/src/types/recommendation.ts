import type { Movie } from './movie'

export interface Recommendation {
  movie: Movie
  score: number
  reason: string
}

export interface RecommendationResponse {
  recommendations: Recommendation[]
  generatedAt: string
}
