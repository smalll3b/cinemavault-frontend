import { Movie, User } from '../types'

const LS = window.localStorage
const KEY_MOVIES = 'cv_movies'
const KEY_USERS = 'cv_users'
const KEY_SESSION = 'cv_session'

function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 9)
}

function hashStr(input: string) {
  // For the mock environment, use a simple deterministic encoding to simulate hashing.
  // We avoid async WebCrypto here to keep the mock synchronous and deterministic.
  try {
    return btoa(input)
  } catch (e) {
    return input
  }
}

function seedIfNeeded() {
  if (!LS.getItem(KEY_MOVIES)) {
    const sample: Movie[] = [
      { id: 'm1', title: 'The Matrix', year: 1999, type: 'movie', poster: '', description: 'A hacker discovers reality.' },
      { id: 'm2', title: 'Inception', year: 2010, type: 'movie', poster: '', description: 'Dream heist.' },
      { id: 'm3', title: 'The Office', year: 2005, type: 'series', poster: '', description: 'Workplace sitcom.' }
    ]
    LS.setItem(KEY_MOVIES, JSON.stringify(sample))
  }
  if (!LS.getItem(KEY_USERS)) {
    const adminPass = hashStr('admin123')
    const userPass = hashStr('password')
    const admin: User = { id: 'u1', name: 'Admin', email: 'admin@cv.test', password: adminPass, role: 'admin', favorites: [] }
    const user: User = { id: 'u2', name: 'Alice', email: 'alice@cv.test', password: userPass, role: 'user', favorites: ['m1'] }
    LS.setItem(KEY_USERS, JSON.stringify([admin, user]))
  }
}

// seed synchronously at module top-level so initial users are available before first calls
seedIfNeeded()

function readMovies(): Movie[] {
  return JSON.parse(LS.getItem(KEY_MOVIES) || '[]')
}
function writeMovies(movies: Movie[]) {
  LS.setItem(KEY_MOVIES, JSON.stringify(movies))
}
function readUsers(): User[] {
  return JSON.parse(LS.getItem(KEY_USERS) || '[]')
}
function writeUsers(users: User[]) {
  LS.setItem(KEY_USERS, JSON.stringify(users))
}

export const mockApi = {
  async getMovies({ q, year, type }:{ q?:string, year?:number, type?:string } = {}) {
    await delay()
    let movies = readMovies()
    if (q) {
      const qq = q.toLowerCase()
      movies = movies.filter(m => m.title.toLowerCase().includes(qq) || (m.description||'').toLowerCase().includes(qq))
    }
    if (year) movies = movies.filter(m => m.year === year)
    if (type) movies = movies.filter(m => m.type === type)
    return movies
  },
  async getMovie(id:string) {
    await delay()
    return readMovies().find(m => m.id === id) || null
  },
  async createMovie(payload: Omit<Movie, 'id'>) {
    const movies = readMovies()
    const m: Movie = { ...payload, id: uid('m') }
    movies.unshift(m)
    writeMovies(movies)
    return m
  },
  async updateMovie(id:string, payload: Partial<Movie>) {
    const movies = readMovies()
    const idx = movies.findIndex(m => m.id === id)
    if (idx === -1) throw new Error('Not found')
    movies[idx] = { ...movies[idx], ...payload }
    writeMovies(movies)
    return movies[idx]
  },
  async deleteMovie(id:string) {
    let movies = readMovies()
    movies = movies.filter(m => m.id !== id)
    writeMovies(movies)
    return true
  },
  async register({ name, email, password }:{ name:string, email:string, password:string }) {
    await delay()
    const users = readUsers()
    if (users.find(u => u.email === email)) {
      throw new Error('Email already exists')
    }
    const hashed = hashStr(password)
    const u: User = { id: uid('u'), name, email, password: hashed, role: 'user', favorites: [] }
    users.push(u)
    writeUsers(users)
    LS.setItem(KEY_SESSION, u.id)
    return u
  },
  async login({ email, password }:{ email:string, password:string }) {
    await delay()
    const users = readUsers()
    const hashed = hashStr(password)
    let u = users.find(x => x.email === email && x.password === hashed)
    if (!u) {
      // backward-compat: some users may have been stored with plaintext passwords
      const plain = users.find(x => x.email === email && x.password === password)
      if (plain) {
        // migrate to hashed password
        plain.password = hashed
        writeUsers(users)
        u = plain
      }
    }
    if (!u) throw new Error('Invalid credentials')
    LS.setItem(KEY_SESSION, u.id)
    return u
  },
  async currentUser() {
    await delay()
    const id = LS.getItem(KEY_SESSION)
    if (!id) return null
    const users = readUsers()
    return users.find(u => u.id === id) || null
  },
  async logout() {
    LS.removeItem(KEY_SESSION)
    return true
  },
  async toggleFavorite(userId:string, movieId:string) {
    const users = readUsers()
    const u = users.find(x => x.id === userId)
    if (!u) throw new Error('User not found')
    u.favorites = u.favorites || []
    if (u.favorites.includes(movieId)) {
      u.favorites = u.favorites.filter(f => f !== movieId)
    } else {
      u.favorites.push(movieId)
    }
    writeUsers(users)
    return u.favorites
  }
}

function delay(ms = 200) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default mockApi






