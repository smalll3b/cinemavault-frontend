export type MovieType = 'movie' | 'series' | 'episode'

export interface Movie {
  id: string
  title: string
  year: number
  type: MovieType
  poster?: string
  description?: string
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  role?: 'user' | 'admin'
  favorites?: string[]
}

