import { defineStore } from 'pinia'
import { ref } from 'vue'
import { MoviesAPI } from '@/api/modules/movies.api'
import { UserAPI } from '@/api/modules/user.api'
import { RatingsAPI } from '@/api/modules/ratings.api'
import { i18n } from '@/i18n'
import { useToastStore } from './toast.store'
import type { Movie, MovieListParams, PaginatedMovies } from '@/types/movie'
import type { Rating, CreateRatingPayload } from '@/types/rating'

export const useMovieStore = defineStore('movies', () => {
  const movies = ref<Movie[]>([])
  const currentMovie = ref<Movie | null>(null)
  const watchlist = ref<Movie[]>([])
  const userRatings = ref<Rating[]>([])
  const searchResults = ref<Movie[]>([])
  const pagination = ref<Omit<PaginatedMovies, 'results'>>({ count: 0, next: null, previous: null })
  const loading = ref(false)
  const searchLoading = ref(false)
  const error = ref<string | null>(null)

  const t = (key: string) => i18n.global.t(key)

  async function fetchMovies(params?: MovieListParams): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const res = await MoviesAPI.getAll(params)
      movies.value = res.results
      pagination.value = { count: res.count, next: res.next, previous: res.previous }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load movies'
    } finally {
      loading.value = false
    }
  }

  async function fetchMovie(id: number): Promise<void> {
    loading.value = true
    error.value = null
    try {
      currentMovie.value = await MoviesAPI.getById(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load movie'
    } finally {
      loading.value = false
    }
  }

  async function search(query: string): Promise<void> {
    if (!query.trim()) { searchResults.value = []; return }
    searchLoading.value = true
    try {
      const res = await MoviesAPI.search(query)
      searchResults.value = res.results
    } catch {
      searchResults.value = []
    } finally {
      searchLoading.value = false
    }
  }

  async function fetchWatchlist(): Promise<void> {
    try {
      watchlist.value = await UserAPI.getWatchlist()
    } catch {
      watchlist.value = []
    }
  }

  async function toggleWatchlist(movieId: number): Promise<void> {
    const inList = watchlist.value.some((m) => m.id === movieId)
    try {
      if (inList) {
        await UserAPI.removeFromWatchlist(movieId)
        watchlist.value = watchlist.value.filter((m) => m.id !== movieId)
        useToastStore().success(t('toast.watchlist_removed'))
      } else {
        await UserAPI.addToWatchlist(movieId)
        const movie = movies.value.find((m) => m.id === movieId) ?? currentMovie.value
        if (movie) watchlist.value.push(movie)
        useToastStore().success(t('toast.watchlist_added'))
      }
    } catch {
      useToastStore().error(t('toast.error_watchlist'))
    }
  }

  function isInWatchlist(movieId: number): boolean {
    return watchlist.value.some((m) => m.id === movieId)
  }

  async function fetchUserRatings(): Promise<void> {
    try {
      userRatings.value = await RatingsAPI.getMyRatings()
    } catch {
      userRatings.value = []
    }
  }

  async function rateMovie(payload: CreateRatingPayload): Promise<void> {
    try {
      const rating = await RatingsAPI.create(payload)
      const idx = userRatings.value.findIndex((r) => r.movieId === payload.movieId)
      if (idx !== -1) userRatings.value[idx] = rating
      else userRatings.value.push(rating)
      useToastStore().success(t('toast.rating_saved'))
    } catch {
      useToastStore().error(t('toast.error_rating'))
      throw new Error('rating failed')
    }
  }

  async function removeRating(id: number): Promise<void> {
    try {
      await RatingsAPI.remove(id)
      userRatings.value = userRatings.value.filter((r) => r.id !== id)
      useToastStore().success(t('toast.rating_removed'))
    } catch {
      useToastStore().error(t('toast.error_rating'))
    }
  }

  function getUserRatingForMovie(movieId: number): Rating | undefined {
    return userRatings.value.find((r) => r.movieId === movieId)
  }

  function clearSearch(): void {
    searchResults.value = []
  }

  return {
    movies, currentMovie, watchlist, userRatings, searchResults,
    pagination, loading, searchLoading, error,
    fetchMovies, fetchMovie, search,
    fetchWatchlist, toggleWatchlist, isInWatchlist,
    fetchUserRatings, rateMovie, removeRating,
    getUserRatingForMovie, clearSearch,
  }
})
