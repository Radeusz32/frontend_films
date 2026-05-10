import { http } from '@/api/client'
import type {
  Movie,
  PaginatedMovies,
  MovieListParams,
  CreateMoviePayload,
  UpdateMoviePayload,
} from '@/types/movie'

export const MoviesAPI = {
  getAll(params?: MovieListParams): Promise<PaginatedMovies> {
    if (params) {
      return http.get<PaginatedMovies>('/movies', params as Record<string, string | number | undefined>)
    }
    return http.get<PaginatedMovies>('/movies')
  },

  getById(id: number): Promise<Movie> {
    return http.get<Movie>(`/movies/${id}`)
  },

  search(query: string): Promise<{ results: Movie[]; count: number }> {
    return http.get('/search', { query })
  },

  create(payload: CreateMoviePayload): Promise<Movie> {
    return http.post<Movie>('/movies', payload)
  },

  update(id: number, payload: UpdateMoviePayload): Promise<Movie> {
    return http.put<Movie>(`/movies/${id}`, payload)
  },

  remove(id: number): Promise<void> {
    return http.delete<void>(`/movies/${id}`)
  },
}
