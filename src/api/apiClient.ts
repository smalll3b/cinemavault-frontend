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
    ...data,
    ...raw,
    id: String(data?.id ?? data?._id ?? raw?.id ?? raw?._id ?? ''),
    title: String(data?.title ?? data?.name ?? raw?.title ?? ''),
    year: Number(data?.year ?? data?.release_year ?? raw?.year ?? 0),
    type: (data?.media_type ?? data?.type ?? raw?.media_type ?? 'movie') as MovieType,
    poster: data?.poster ?? raw?.poster ?? '',
    description: String(data?.plot ?? data?.description ?? data?.overview ?? raw?.plot ?? raw?.description ?? ''),
    imdbID: String(data?.imdb_id ?? data?.imdbID ?? raw?.imdb_id ?? raw?.imdbID ?? ''),
    imdbRating: String(data?.imdb_rating ?? data?.imdbRating ?? data?.rating ?? data?.vote_average ?? raw?.imdb_rating ?? ''),
  } as Movie
}

function toMovieList(payload: any): Movie[] {
  const data = unwrap<any>(payload)
  const list = Array.isArray(data)
    ? data
    : data?.movies || data?.items || data?.results || data?.data || []
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
  return Array.isArray(data) ? data : data?.movies || data?.items || data?.results || data?.data || []
}

function toMovieId(item: any) {
  return String(item?.movie_id ?? item?.movieId ?? item?.movie?.id ?? item?.id ?? '')
}

function toUser(payload: any): User {
  const data = unwrap<any>(payload) ?? {}
  return {
    id: String(data.id ?? data._id ?? ''),
    name: String(data.name ?? data.username ?? ''),
    email: String(data.email ?? ''),
    password: '',
    role: (data.role === 'admin' || data.isAdmin) ? 'admin' : 'user',
    favorites: Array.isArray(data.favorites) ? data.favorites.map((i: any) => String(i)) : [],
  }
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
    throw new Error(payload?.message || payload?.error || `Error ${response.status}`)
  }
  return payload as T
}

export const apiClient = {
  async getMovies(opts: MovieQuery = {}) {
    if (USE_MOCK_API) return mockApi.getMovies(opts)
    const query = buildQuery({ q: opts.q, year: opts.year, media_type: opts.type, limit: opts.limit ?? 1000 })
    const payload = await request<any>(`/movies${query ? `?${query}` : ''}`)
    return toMovieList(payload).filter(m => matchesMovieQuery(m, opts))
  },

  async getMovie(id: string) {
    if (USE_MOCK_API) return mockApi.getMovie(id)
    const payload = await request<any>(`/movies/${encodeURIComponent(id)}`)
    return toMovie(payload)
  },

  async createMovie(payload: Omit<Movie, 'id'>) {
    if (USE_MOCK_API) return mockApi.createMovie(payload)
    const body = {
      ...payload,
      media_type: payload.type,
      imdb_id: payload.imdbID,
      imdb_rating: payload.imdbRating,
      plot: payload.description,
    }
    const result = await request<any>('/movies', { method: 'POST', body: JSON.stringify(body) })
    return toMovie(result)
  },

  async updateMovie(id: string, payload: Partial<Movie>) {
    if (USE_MOCK_API) return mockApi.updateMovie(id, payload)
    const body = {
      ...payload,
      media_type: payload.type,
      imdb_id: payload.imdbID,
      imdb_rating: payload.imdbRating,
      plot: payload.description,
    }
    const result = await request<any>(`/movies/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) })
    return toMovie(result)
  },

  async deleteMovie(id: string) {
    if (USE_MOCK_API) return mockApi.deleteMovie(id)
    await request<void>(`/movies/${encodeURIComponent(id)}`, { method: 'DELETE' })
    return true
  },

  async login(p: any) {
    const res = await request<any>('/auth/login', { method: 'POST', auth: false, body: JSON.stringify(p) })
    const data = unwrap<any>(res)
    const token = data?.token || data?.accessToken
    if (token) setToken(token)
    return toUser(res)
  },

  async register(p: any) {
    const res = await request<any>('/auth/register', { method: 'POST', auth: false, body: JSON.stringify(p) })
    return this.login(p)
  },

  async currentUser() {
    if (USE_MOCK_API) return mockApi.currentUser()
    try {
      const res = await request<any>('/auth/profile')
      return toUser(res)
    } catch { return null }
  },

  async logout() { clearToken(); return true },

  async getWatchlistIds() { return this.getFavoriteIds() },

  async getFavoriteIds() {
    try {
      const res = await request<any>('/favorites')
      const items = normalizeListPayload(res)
      return items.map(toMovieId).filter(Boolean)
    } catch { return [] }
  },

  async getFavorites() {
    if (USE_MOCK_API) {
      const u = await mockApi.currentUser()
      const ids = u?.favorites || []
      const list = await Promise.all(ids.map(id => this.getMovie(id)))
      return (list || []).filter(Boolean) as Movie[]
    }
    const res = await request<any>('/favorites')
    const items = normalizeListPayload(res)
    return items.map((entry: any) => toMovie(entry.movie ?? entry)).filter((m: any) => !!m.id)
  },

  async addFavorite(movie_id: string) {
    await request<any>('/favorites', { method: 'POST', body: JSON.stringify({ movie_id: isNaN(Number(movie_id)) ? movie_id : Number(movie_id) }) })
    return this.getFavoriteIds()
  },

  async removeFavorite(movie_id: string) {
    const res = await request<any>('/favorites')
    const items = normalizeListPayload(res)
    const entry = items.find((i: any) => toMovieId(i) === movie_id)
    if (entry) await request<void>(`/favorites/${encodeURIComponent(entry.id || entry._id)}`, { method: 'DELETE' })
    return this.getFavoriteIds()
  },

  async toggleFavorite(id: string) {
    const favs = await this.getFavoriteIds()
    return favs.includes(id) ? this.removeFavorite(id) : this.addFavorite(id)
  },

  getStoredToken: getToken,
  clearStoredToken: clearToken
}

export default apiClient
