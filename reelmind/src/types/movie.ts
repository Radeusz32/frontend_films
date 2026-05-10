export type MovieGenre =
  | 'Action'
  | 'Comedy'
  | 'Drama'
  | 'Horror'
  | 'Sci-Fi'
  | 'Thriller'
  | 'Romance'
  | 'Animation'
  | 'Documentary'
  | 'Fantasy'

export interface Movie {
  id: number
  title: string
  description: string
  genre: MovieGenre[]
  year: number
  rating: number
  director: string
  cast: string[]
  duration: number
  posterUrl: string
  backdropUrl: string
  trailerUrl?: string
  language: string
  country: string
}

export interface MovieListParams {
  page?: number
  limit?: number
  genre?: MovieGenre
  year?: number
  search?: string
  sortBy?: 'rating' | 'year' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedMovies {
  results: Movie[]
  count: number
  next: string | null
  previous: string | null
}

export interface CreateMoviePayload {
  title: string
  description: string
  genre: MovieGenre[]
  year: number
  director: string
  cast: string[]
  duration: number
  posterUrl: string
  backdropUrl: string
  trailerUrl?: string
  language: string
  country: string
}

export type UpdateMoviePayload = Partial<CreateMoviePayload>

export interface WatchlistItem {
  movieId: number
  addedAt: string
}
