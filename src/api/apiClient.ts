import mockApi from './mockApi'
import { Movie, MovieType, User } from '../types'

type MovieQuery = {
  q?: string
  year?: number
  type?: string
  page?: number
  limit?: number
  offset?: number
}

type ApiEnvelope<T> = {
  data?: T
  token?: string
  accessToken?: string
  user?: unknown
  message?: string
  error?: string
}

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') || ''
const USE_MOCK_API = !API_BASE_URL || import.meta.env.VITE_USE_MOCK_API === 'true'
const TOKEN_KEY = 'cv_token'

function getToken() {
  return window.localStorage.getItem(TOKEN_KEY)
}

function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token)
}

function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY)
}

function getBaseUrl(path: string) {
  if (!API_BASE_URL) throw new Error('VITE_API_URL is not configured')
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') return
    qs.set(key, String(value))
  })
  return qs.toString()
}

async function parseJson<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T
  const text = await response.text()
  if (!text) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    return text as T
  }
}

function unwrap<T>(payload: T | ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const env = payload as ApiEnvelope<T>
    return (env.data ?? payload) as T
  }
  return payload as T
}

function toMovie(raw: any): Movie {
  const data = raw?.movie ?? raw?.data?.movie ?? raw?.item ?? raw?.attributes ?? raw
  return {
    id: String(data?.id ?? data?._id ?? raw?.id ?? raw?._id ?? raw?.movie_id ?? ''),
    title: String(data?.title ?? data?.movie_title ?? data?.name ?? raw?.title ?? raw?.movie_title ?? ''),
    year: Number(data?.year ?? data?.releaseYear ?? data?.release_year ?? raw?.year ?? raw?.releaseYear ?? 0),
    type: (data?.media_type ?? data?.mediaType ?? data?.type ?? raw?.media_type ?? raw?.mediaType ?? raw?.type ?? 'movie') as MovieType,
    poster: data?.poster ?? data?.posterUrl ?? data?.poster_path ?? raw?.poster ?? raw?.posterUrl ?? '',
    description: data?.description ?? data?.overview ?? data?.plot ?? raw?.description ?? raw?.overview ?? '',
  }
}

function toMovieList(payload: any): Movie[] {
  const data = unwrap<any>(payload)
  const list = Array.isArray(data)
    ? data
    : data?.items || data?.movies || data?.results || data?.data || []
  return list.map(toMovie).filter((m: Movie) => !!m.id)
}

function matchesMovieQuery(movie: Movie, opts: MovieQuery) {
  const q = opts.q?.trim().toLowerCase()
  if (q) {
    const haystack = `${movie.title} ${movie.description || ''}`.toLowerCase()
    if (!haystack.includes(q)) return false
  }

  if (opts.year !== undefined && movie.year !== opts.year) return false

  if (opts.type && movie.type !== opts.type) return false

  return true
}

function normalizeListPayload(payload: any) {
  const data = unwrap<any>(payload)
  return Array.isArray(data)
    ? data
    : data?.items || data?.movies || data?.results || data?.watchlist || data?.data || []
}

function toMovieId(item: any) {
  return String(item?.movie_id ?? item?.movieId ?? item?.movie?.id ?? item?.id ?? item ?? '')
}

function toWatchlistEntryId(item: any) {
  return String(item?.id ?? item?._id ?? item?.watchlist_id ?? item?.watchlistId ?? '')
}

function toUser(payload: any): User {
  const data = unwrap<any>(payload) ?? {}
  const role = data.role === 'admin' || data.isAdmin ? 'admin' : 'user'
  return {
    id: String(data.id ?? data._id ?? data.userId ?? ''),
    name: String(data.name ?? data.username ?? ''),
    email: String(data.email ?? ''),
    password: String(data.password ?? ''),
    role,
    favorites: Array.isArray(data.favorites)
      ? data.favorites.map((item: any) => String(item))
      : Array.isArray(data.watchlist)
        ? data.watchlist.map((item: any) => toMovieId(item))
        : [],
  }
}

function toFavoriteIds(payload: any): string[] {
  return normalizeListPayload(payload)
    .map((item: any) => toMovieId(item))
    .filter(Boolean)
}

function toFavoriteEntryIds(payload: any): string[] {
  return normalizeListPayload(payload)
    .map((item: any) => toWatchlistEntryId(item))
    .filter(Boolean)
}

async function request<T>(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const response = await fetch(getBaseUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
      ...(init.auth === false || !getToken() ? {} : { Authorization: `Bearer ${getToken()}` }),
    },
    body: init.body,
  })

  const payload = await parseJson<any>(response)
  if (!response.ok) {
    if (response.status === 401) clearToken()
    const message = payload?.message || payload?.error || `Request failed (${response.status})`
    throw new Error(message)
  }
  return payload as T
}

async function requestReal<T>(path: string, init: RequestInit & { auth?: boolean } = {}) {
  return request<T>(path, init)
}

async function requestWithFallback<T>(paths: string[], init: RequestInit & { auth?: boolean } = {}) {
  let lastError: unknown
  for (const path of paths) {
    try {
      return await requestReal<T>(path, init)
    } catch (error: any) {
      lastError = error
      const message = String(error?.message || '')
      if (!/404|405|Not Found/i.test(message)) throw error
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Request failed')
}

function authResult(payload: any) {
  const data = unwrap<any>(payload) ?? {}
  const token = data.token || data.accessToken || data.jwt || data.data?.token || data.data?.accessToken
  const user = data.user ?? data.profile ?? data.data?.user ?? data
  return { token: token ? String(token) : '', user }
}

export const apiClient = {
  async getMovies(opts: MovieQuery = {}) {
    if (USE_MOCK_API) return mockApi.getMovies(opts)
    const query = buildQuery({
      query: opts.q,
      q: opts.q,
      year: opts.year,
      media_type: opts.type,
      type: opts.type,
      page: opts.page,
      limit: opts.limit ?? 1000,
      offset: opts.offset,
    })
    const payload = await requestReal<any>(`/movies${query ? `?${query}` : ''}`)
    return toMovieList(payload).filter(movie => matchesMovieQuery(movie, opts))
  },

  async getMovie(id: string) {
    if (USE_MOCK_API) return mockApi.getMovie(id)
    const payload = await requestReal<any>(`/movies/${encodeURIComponent(id)}`)
    return payload ? toMovie(payload) : null
  },

  async createMovie(payload: Omit<Movie, 'id'>) {
    if (USE_MOCK_API) return mockApi.createMovie(payload)
    const body = {
      ...payload,
      media_type: payload.type,
    }
    const result = await requestReal<any>('/movies', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return toMovie(result)
  },

  async updateMovie(id: string, payload: Partial<Movie>) {
    if (USE_MOCK_API) return mockApi.updateMovie(id, payload)
    const body = {
      ...payload,
      media_type: payload.type,
    }
    const result = await requestReal<any>(`/movies/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
    return toMovie(result)
  },

  async deleteMovie(id: string) {
    if (USE_MOCK_API) return mockApi.deleteMovie(id)
    await requestReal<void>(`/movies/${encodeURIComponent(id)}`, { method: 'DELETE' })
    return true
  },

  async register(p: { name: string; email: string; password: string }) {
    if (USE_MOCK_API) return mockApi.register(p)
    const payload = await requestReal<any>('/auth/register', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(p),
    })
    const { token, user } = authResult(payload)
    if (token) setToken(token)
    return toUser(user)
  },

  async login(p: { email: string; password: string }) {
    if (USE_MOCK_API) return mockApi.login(p)
    const payload = await requestReal<any>('/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(p),
    })
    const { token, user } = authResult(payload)
    if (token) setToken(token)
    return toUser(user)
  },

  async currentUser() {
    if (USE_MOCK_API) return mockApi.currentUser()
    try {
      const profile = await requestReal<any>('/auth/profile')
      const user = toUser(profile)
      if (!user.favorites?.length) {
        user.favorites = await this.getFavoriteIds()
      }
      return user
    } catch (error: any) {
      if (error?.message?.includes('401')) clearToken()
      return null
    }
  },

  async logout() {
    if (USE_MOCK_API) return mockApi.logout()
    clearToken()
    return true
  },

  async getWatchlistIds() {
    return this.getFavoriteIds()
  },

  async getFavoriteIds() {
    if (USE_MOCK_API) {
      const u = await mockApi.currentUser()
      return u?.favorites || []
    }
    const payload = await requestWithFallback<any>(['/watchlist', '/favorites'])
    return toFavoriteIds(payload)
  },

  async addToWatchlist(movieId: string) {
    return this.addFavorite(movieId)
  },

  async addFavorite(movieId: string) {
    if (USE_MOCK_API) {
      const u = await mockApi.currentUser()
      if (!u) throw new Error('Not logged in')
      return mockApi.toggleFavorite(u.id, movieId)
    }
    await requestWithFallback<any>(['/watchlist', '/favorites'], {
      method: 'POST',
      body: JSON.stringify({ movie_id: movieId, status: 'to-watch' }),
    })
    return this.getFavoriteIds()
  },

  async removeFromWatchlist(movieId: string) {
    return this.removeFavorite(movieId)
  },

  async removeFavorite(movieId: string) {
    if (USE_MOCK_API) {
      const u = await mockApi.currentUser()
      if (!u) throw new Error('Not logged in')
      return mockApi.toggleFavorite(u.id, movieId)
    }
    const listPayload = await requestWithFallback<any>(['/watchlist', '/favorites'])
    const entries = normalizeListPayload(listPayload)
    const entry = entries.find((item: any) => toMovieId(item) === movieId)
    const entryId = entry ? toWatchlistEntryId(entry) : movieId
    await requestWithFallback<void>([
      `/watchlist/${encodeURIComponent(entryId)}`,
      `/favorites/${encodeURIComponent(entryId)}`,
    ], { method: 'DELETE' })
    return this.getFavoriteIds()
  },

  async toggleFavorite(movieId: string) {
    if (USE_MOCK_API) {
      const u = await mockApi.currentUser()
      if (!u) throw new Error('Not logged in')
      return mockApi.toggleFavorite(u.id, movieId)
    }
    const favorites = await this.getFavoriteIds()
    if (favorites.includes(movieId)) {
      return this.removeFavorite(movieId)
    }
    return this.addFavorite(movieId)
  },

  clearStoredToken: clearToken,
  getStoredToken: getToken,
}

export default apiClient









