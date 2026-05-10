import type { Movie, CreateMoviePayload, UpdateMoviePayload, MovieListParams } from '@/types/movie'
import type { LoginPayload, RegisterPayload } from '@/types/auth'
import type { Rating, CreateRatingPayload } from '@/types/rating'
import type { UpdateUserPayload } from '@/types/user'
import { ApiException } from '@/types/api'
import {
  mockUsers,
  mockPasswords,
  mockMovies,
  mockRatings,
  mockWatchlist,
  mockRecommendations,
} from './mockData'
import { config } from './config'

let moviesDb = [...mockMovies]
let ratingsDb = [...mockRatings]
let watchlistDb = [...mockWatchlist]
let usersDb = [...mockUsers]
let nextMovieId = moviesDb.length + 1
let nextRatingId = ratingsDb.length + 1

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function getCurrentUserId(): number {
  const token = localStorage.getItem(config.tokenKey)
  if (!token) throw new ApiException('Unauthorized', 401)
  const payload = JSON.parse(atob(token.split('.')[1] ?? ''))
  return payload.userId as number
}

function requireAdmin(): void {
  const userId = getCurrentUserId()
  const user = usersDb.find((u) => u.id === userId)
  if (!user || user.role !== 'admin') throw new ApiException('Forbidden', 403)
}

function makeToken(userId: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ userId, exp: Date.now() + 3600000 }))
  return `${header}.${payload}.mock-signature`
}

export const mockRouter = {
  async handle<T>(method: string, path: string, body?: unknown): Promise<T> {
    await delay()

    // AUTH
    if (method === 'POST' && path === '/auth/login') {
      const { email, password } = body as LoginPayload
      const user = usersDb.find((u) => u.email === email)
      if (!user || mockPasswords[email] !== password) {
        throw new ApiException('Invalid credentials', 401)
      }
      const access = makeToken(user.id)
      const refresh = makeToken(user.id)
      return { access, refresh, user } as T
    }

    if (method === 'POST' && path === '/auth/register') {
      const { name, email, password, passwordConfirm } = body as RegisterPayload
      if (password !== passwordConfirm) throw new ApiException('Passwords do not match', 400)
      if (usersDb.find((u) => u.email === email)) throw new ApiException('Email already in use', 400)
      const newUser = {
        id: usersDb.length + 1,
        name,
        email,
        role: 'user' as const,
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`,
        createdAt: new Date().toISOString(),
      }
      usersDb.push(newUser)
      mockPasswords[email] = password
      const access = makeToken(newUser.id)
      const refresh = makeToken(newUser.id)
      return { access, refresh, user: newUser } as T
    }

    if (method === 'GET' && path === '/auth/me') {
      const userId = getCurrentUserId()
      const user = usersDb.find((u) => u.id === userId)
      if (!user) throw new ApiException('User not found', 404)
      return user as T
    }

    if (method === 'POST' && path === '/auth/logout') {
      return {} as T
    }

    if (method === 'POST' && path === '/auth/refresh') {
      const userId = getCurrentUserId()
      return { access: makeToken(userId) } as T
    }

    // MOVIES
    if (method === 'GET' && path.startsWith('/movies') && !path.includes('/ratings')) {
      const idMatch = path.match(/^\/movies\/(\d+)$/)
      if (idMatch) {
        const movie = moviesDb.find((m) => m.id === Number(idMatch[1]))
        if (!movie) throw new ApiException('Movie not found', 404)
        return movie as T
      }

      const params = typeof body === 'object' && body !== null ? (body as MovieListParams) : {}
      let results = [...moviesDb]
      if (params.genre) results = results.filter((m) => m.genre.includes(params.genre!))
      if (params.year) results = results.filter((m) => m.year === params.year)
      if (params.search) {
        const q = params.search.toLowerCase()
        results = results.filter(
          (m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q),
        )
      }
      if (params.sortBy === 'rating') results.sort((a, b) => b.rating - a.rating)
      else if (params.sortBy === 'year') results.sort((a, b) => b.year - a.year)
      else if (params.sortBy === 'title') results.sort((a, b) => a.title.localeCompare(b.title))
      const page = params.page ?? 1
      const limit = params.limit ?? 12
      const start = (page - 1) * limit
      return {
        results: results.slice(start, start + limit),
        count: results.length,
        next: start + limit < results.length ? `/movies?page=${page + 1}` : null,
        previous: page > 1 ? `/movies?page=${page - 1}` : null,
      } as T
    }

    if (method === 'POST' && path === '/movies') {
      requireAdmin()
      const payload = body as CreateMoviePayload
      const movie: Movie = { ...payload, id: nextMovieId++, rating: 0 }
      moviesDb.push(movie)
      return movie as T
    }

    if (method === 'PUT' && path.match(/^\/movies\/(\d+)$/)) {
      requireAdmin()
      const id = Number(path.split('/')[2])
      const idx = moviesDb.findIndex((m) => m.id === id)
      if (idx === -1) throw new ApiException('Movie not found', 404)
      moviesDb[idx] = { ...moviesDb[idx]!, ...(body as UpdateMoviePayload) }
      return moviesDb[idx] as T
    }

    if (method === 'DELETE' && path.match(/^\/movies\/(\d+)$/)) {
      requireAdmin()
      const id = Number(path.split('/')[2])
      moviesDb = moviesDb.filter((m) => m.id !== id)
      return {} as T
    }

    // RATINGS
    if (method === 'GET' && path === '/ratings') {
      const userId = getCurrentUserId()
      return ratingsDb.filter((r) => r.userId === userId) as T
    }

    if (method === 'GET' && path === '/ratings/me') {
      const userId = getCurrentUserId()
      return ratingsDb.filter((r) => r.userId === userId) as T
    }

    if (method === 'POST' && path === '/ratings') {
      const userId = getCurrentUserId()
      const payload = body as CreateRatingPayload
      const existing = ratingsDb.find((r) => r.movieId === payload.movieId && r.userId === userId)
      if (existing) {
        existing.value = payload.value
        existing.review = payload.review
        return existing as T
      }
      const rating: Rating = {
        id: nextRatingId++,
        userId,
        movieId: payload.movieId,
        value: payload.value,
        review: payload.review,
        createdAt: new Date().toISOString(),
      }
      ratingsDb.push(rating)
      return rating as T
    }

    if (method === 'DELETE' && path.match(/^\/ratings\/(\d+)$/)) {
      const userId = getCurrentUserId()
      const id = Number(path.split('/')[2])
      const rating = ratingsDb.find((r) => r.id === id)
      if (!rating) throw new ApiException('Rating not found', 404)
      if (rating.userId !== userId) throw new ApiException('Forbidden', 403)
      ratingsDb = ratingsDb.filter((r) => r.id !== id)
      return {} as T
    }

    // RECOMMENDATIONS
    if (method === 'GET' && path === '/recommendations') {
      getCurrentUserId()
      return {
        recommendations: mockRecommendations,
        generatedAt: new Date().toISOString(),
      } as T
    }

    // USER
    if (method === 'GET' && path === '/user') {
      const userId = getCurrentUserId()
      const user = usersDb.find((u) => u.id === userId)
      if (!user) throw new ApiException('User not found', 404)
      return user as T
    }

    if (method === 'PUT' && path === '/user') {
      const userId = getCurrentUserId()
      const idx = usersDb.findIndex((u) => u.id === userId)
      if (idx === -1) throw new ApiException('User not found', 404)
      usersDb[idx] = { ...usersDb[idx]!, ...(body as UpdateUserPayload) }
      return usersDb[idx] as T
    }

    // WATCHLIST
    if (method === 'GET' && path === '/user/watchlist') {
      getCurrentUserId()
      return moviesDb.filter((m) => watchlistDb.includes(m.id)) as T
    }

    if (method === 'POST' && path === '/user/watchlist') {
      getCurrentUserId()
      const { movieId } = body as { movieId: number }
      if (!watchlistDb.includes(movieId)) watchlistDb.push(movieId)
      return {} as T
    }

    if (method === 'DELETE' && path.match(/^\/user\/watchlist\/(\d+)$/)) {
      getCurrentUserId()
      const id = Number(path.split('/')[3])
      watchlistDb = watchlistDb.filter((mid) => mid !== id)
      return {} as T
    }

    // SEARCH
    if (method === 'GET' && path.startsWith('/search')) {
      const url = new URL(`http://mock${path}`)
      const query = url.searchParams.get('query')?.toLowerCase() ?? ''
      const results = moviesDb.filter(
        (m) => m.title.toLowerCase().includes(query) || m.description.toLowerCase().includes(query),
      )
      return { results, count: results.length } as T
    }

    // ADMIN
    if (method === 'GET' && path === '/admin/stats') {
      requireAdmin()
      return {
        totalMovies: moviesDb.length,
        totalUsers: usersDb.length,
        totalRatings: ratingsDb.length,
        averageRating: (ratingsDb.reduce((s, r) => s + r.value, 0) / (ratingsDb.length || 1)).toFixed(1),
      } as T
    }

    if (method === 'GET' && path === '/admin/users') {
      requireAdmin()
      return usersDb as T
    }

    throw new ApiException(`No mock handler for ${method} ${path}`, 404)
  },
}
