import mockApi from './mockApi'
import { Movie, User } from '../types'

// Simple wrapper to allow switching to real fetch-based API later.
export const apiClient = {
  getMovies: async (opts?: any) => {
    return mockApi.getMovies(opts)
  },
  getMovie: async (id: string) => mockApi.getMovie(id),
  createMovie: async (payload: Omit<Movie, 'id'>) => mockApi.createMovie(payload),
  updateMovie: async (id: string, payload: Partial<Movie>) => mockApi.updateMovie(id, payload),
  deleteMovie: async (id: string) => mockApi.deleteMovie(id),
  register: async (p: { name: string; email: string; password: string }) => mockApi.register(p),
  login: async (p: { email: string; password: string }) => mockApi.login(p),
  currentUser: async () => mockApi.currentUser(),
  logout: async () => mockApi.logout(),
  toggleFavorite: async (userId: string, movieId: string) => mockApi.toggleFavorite(userId, movieId),
}

export default apiClient

