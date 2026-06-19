export interface Rating {
  id: number
  movieId: number
  userId: number
  value: number
  review?: string
  createdAt: string
}

export interface MovieReview {
  id: number
  userId: number
  movieId: number
  userName: string
  userAvatar: string | null
  value: number
  review?: string
  createdAt: string
}

export interface MovieReviewsResponse {
  reviews: MovieReview[]
  count: number
  averageRating: number | null
}

export interface CreateRatingPayload {
  movieId: number
  value: number
  review?: string
}

export interface UpdateRatingPayload {
  value?: number
  review?: string
}
