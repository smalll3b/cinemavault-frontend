export type MovieType = 'movie' | 'series' | 'episode'

export interface Movie {
  id: string
  title: string
  year: number
  type: MovieType
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
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  role?: 'user' | 'admin'
  favorites?: string[]
}
