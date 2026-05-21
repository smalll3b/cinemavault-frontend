import { MovieType } from '../types'

const DEFAULT_BASE_URL = 'https://www.omdbapi.com/'

export type OmdbMovieSuggestion = {
  title?: string
  year?: number
  type?: MovieType
  poster?: string
  description?: string
}

type OmdbResponse = {
  Response?: 'True' | 'False'
  Error?: string
  Title?: string
  Year?: string
  Type?: string
  Poster?: string
  Plot?: string
}

function normalizeType(type?: string): MovieType | undefined {
  if (type === 'movie' || type === 'series' || type === 'episode') return type
  return undefined
}

function normalizeYear(year?: string): number | undefined {
  if (!year) return undefined
  const parsed = Number.parseInt(year, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

function normalizeText(value?: string): string | undefined {
  if (!value || value === 'N/A') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function buildProxyUrl(proxyUrl: string, title: string) {
  const trimmed = proxyUrl.trim()
  if (!trimmed) return ''

  if (trimmed.includes('{title}')) {
    return trimmed.replaceAll('{title}', encodeURIComponent(title))
  }

  const url = new URL(trimmed, window.location.origin)
  url.searchParams.set('title', title)
  url.searchParams.set('plot', 'short')
  return url.toString()
}

function mapResponseToSuggestion(data: any): OmdbMovieSuggestion {
  const source = data?.data ?? data ?? {}
  const movie = source?.movie ?? source?.result ?? source

  return {
    title: normalizeText(movie?.Title ?? movie?.title),
    year: normalizeYear(movie?.Year ?? movie?.year),
    type: normalizeType(movie?.Type ?? movie?.type),
    poster: normalizeText(movie?.Poster ?? movie?.poster),
    description: normalizeText(movie?.Plot ?? movie?.plot ?? movie?.description),
  }
}

function getDerivedProxyUrl() {
  const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim()
  if (!apiBaseUrl) return ''
  return `${apiBaseUrl.replace(/\/+$/, '')}/omdb`
}

export async function fetchOmdbMovieByTitle(title: string): Promise<OmdbMovieSuggestion> {
  const apiKey = import.meta.env.VITE_OMDB_API_KEY as string | undefined
  const baseUrl = (import.meta.env.VITE_OMDB_BASE_URL as string | undefined)?.trim() || DEFAULT_BASE_URL
  const proxyUrl = (import.meta.env.VITE_OMDB_PROXY_URL as string | undefined)?.trim() || getDerivedProxyUrl()

  const searchTitle = title.trim()
  if (!searchTitle) {
    throw new Error('Please enter a title first')
  }

  if (proxyUrl) {
    const response = await fetch(buildProxyUrl(proxyUrl, searchTitle))
    const data = await response.json()
    if (!response.ok) {
      throw new Error(`OMDB proxy request failed (${response.status})`)
    }
    return mapResponseToSuggestion(data)
  }

  if (!apiKey) {
    throw new Error('OMDB proxy is not configured and VITE_OMDB_API_KEY is not set')
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    t: searchTitle,
    plot: 'short',
  })

  const response = await fetch(`${baseUrl}?${params.toString()}`)
  const data = (await response.json()) as OmdbResponse

  if (!response.ok) {
    throw new Error(`OMDB request failed (${response.status})`)
  }

  if (data.Response === 'False') {
    throw new Error(data.Error || 'Movie not found on OMDB')
  }

  return {
    title: normalizeText(data.Title),
    year: normalizeYear(data.Year),
    type: normalizeType(data.Type),
    poster: normalizeText(data.Poster),
    description: normalizeText(data.Plot),
  }
}



