import { MovieType } from '../types'

const DEFAULT_BASE_URL = 'https://www.omdbapi.com/'

export type OmdbMovieSuggestion = {
  title?: string
  year?: number
  type?: MovieType
  poster?: string
  description?: string
  rated?: string
  released?: string
  runtime?: string
  genre?: string
  director?: string
  writer?: string
  actors?: string
  language?: string
  country?: string
  awards?: string
  imdbRating?: string
  imdbID?: string
  external_rating?: number // 增加此欄位以符合後端 1-10 數字格式
}

// ---------------------------------------------------------------------------
// 資料正規化工具函數 (Normalization Utilities)
// ---------------------------------------------------------------------------

function normalizeType(value?: any): MovieType {
  const t = String(value || '').trim().toLowerCase()
  if (t.includes('series')) return 'series'
  if (t.includes('episode')) return 'episode'
  return 'movie'
}

function normalizeYear(year?: any): number | undefined {
  if (year === null || year === undefined || year === '' || String(year).trim().toUpperCase() === 'N/A') {
    return undefined
  }
  const parsed = typeof year === 'number' ? year : Number.parseInt(String(year), 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

function normalizeText(value?: any): string {
  const s = String(value ?? '').trim()
  // 最小改動：若為空或 N/A 則回傳 'N/A'
  return (s === '' || s.toUpperCase() === 'N/A') ? 'N/A' : s
}

// ---------------------------------------------------------------------------
// 核心映射邏輯 (Response Mapping)
// ---------------------------------------------------------------------------

export function mapResponseToSuggestion(data: any): OmdbMovieSuggestion {
  // 1. 取得資料核心
  const body = data?.movie ?? data?.data?.movie ?? data?.data ?? data?.result ?? data ?? {}
  const m = Array.isArray(body) ? body[0] : body

  if (!m || typeof m !== 'object') return {}

  const get = (k: string) => {
    const entry = Object.entries(m).find(([key]) => key.toLowerCase() === k.toLowerCase())
    return entry ? entry[1] : undefined
  }

  // 2. 處理評分
  let rating = get('imdbRating') || get('rating') || get('imdb_rating') || get('vote_average')

  const isInvalid = (v: any) => v === null || v === undefined || String(v).trim().toUpperCase() === 'N/A'
  
  if (isInvalid(rating) && Array.isArray(m.Ratings)) {
    const imdb = m.Ratings.find((r: any) => /imdb|internet movie/i.test(r.Source || ''))
    if (imdb) rating = imdb.Value
  }

  let ratingStr = normalizeText(rating)
  if (ratingStr !== 'N/A' && ratingStr.includes('/')) {
    ratingStr = ratingStr.split('/')[0].trim()
  }

  // 轉換為後端需要的 1-10 數字格式
  const numericRating = parseFloat(ratingStr)
  const external_rating = !isNaN(numericRating) ? numericRating : undefined

  // 3. 返回物件
  return {
    title: normalizeText(get('Title') || get('title')),
    year: normalizeYear(get('Year') || get('year')),
    type: normalizeType(get('Type') || get('type')),
    poster: normalizeText(get('Poster') || get('poster')),
    description: normalizeText(get('Plot') || get('plot') || get('description')),
    rated: normalizeText(get('Rated') || get('rated')),
    released: normalizeText(get('Released') || get('released')),
    runtime: normalizeText(get('Runtime') || get('runtime')),
    genre: normalizeText(get('Genre') || get('genre')),
    director: normalizeText(get('Director') || get('director')),
    writer: normalizeText(get('Writer') || get('writer')),
    actors: normalizeText(get('Actors') || get('actors')),
    language: normalizeText(get('Language') || get('language')),
    country: normalizeText(get('Country') || get('country')),
    awards: normalizeText(get('Awards') || get('awards')),
    imdbRating: ratingStr, // 已透過 normalizeText 處理，預設會是 'N/A'
    external_rating: external_rating,
    imdbID: normalizeText(get('imdbID') || get('imdb_id')),
  }
}

// ---------------------------------------------------------------------------
// API 請求與網址處理 (API Fetching)
// ---------------------------------------------------------------------------

function getDerivedProxyUrl(): string {
  const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim()
  if (!apiBaseUrl) return ''
  return `${apiBaseUrl.replace(/\/+$/, '')}/omdb`
}

export async function fetchOmdbMovieByTitle(title: string): Promise<OmdbMovieSuggestion> {
  const apiKey = import.meta.env.VITE_OMDB_API_KEY as string | undefined
  const baseUrl = (import.meta.env.VITE_OMDB_BASE_URL as string | undefined)?.trim() || DEFAULT_BASE_URL
  const proxyUrl = (import.meta.env.VITE_OMDB_PROXY_URL as string | undefined)?.trim() || getDerivedProxyUrl()

  const searchTitle = String(title || '').trim()
  if (!searchTitle) throw new Error('Please enter a title first')

  let data: any

  if (proxyUrl) {
    const url = `${proxyUrl}${proxyUrl.includes('?') ? '&' : '?'}t=${encodeURIComponent(searchTitle)}&title=${encodeURIComponent(searchTitle)}&plot=short`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`OMDB proxy request failed (${response.status})`)
    data = await response.json()
  } else {
    if (!apiKey) throw new Error('OMDB proxy is not configured and VITE_OMDB_API_KEY is not set')
    const params = new URLSearchParams({ apikey: apiKey, t: searchTitle, plot: 'short' })
    const response = await fetch(`${baseUrl}?${params.toString()}`)
    if (!response.ok) throw new Error(`OMDB request failed (${response.status})`)
    data = await response.json()
  }

  if (data && data.Response === 'False') {
    throw new Error(data.Error || 'Movie not found on OMDB')
  }

  return mapResponseToSuggestion(data)
}
