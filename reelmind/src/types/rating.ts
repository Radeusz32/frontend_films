export interface Rating {
  id: number
  movieId: number
  userId: number
  value: number
  review?: string
  createdAt: string
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
