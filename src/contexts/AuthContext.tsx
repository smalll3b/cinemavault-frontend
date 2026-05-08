import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '../api/apiClient'
import { User } from '../types'
import { message } from 'antd'

interface AuthContextValue {
  user: User | null
  loading: boolean
  register: (name:string,email:string,password:string)=>Promise<void>
  login: (email:string,password:string)=>Promise<void>
  logout: ()=>Promise<void>
  toggleFavorite: (movieId:string)=>Promise<void>
  isAdmin: ()=>boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }>= ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const u = await apiClient.currentUser()
        setUser(u)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const register = async (name:string,email:string,password:string) => {
    setLoading(true)
    try {
      const u = await apiClient.register({ name, email, password })
      setUser(u)
      message.success('Registered and logged in')
    } catch (e:any) {
      message.error(e.message || 'Register failed')
      throw e
    } finally { setLoading(false) }
  }
  const login = async (email:string,password:string) => {
    setLoading(true)
    try {
      const u = await apiClient.login({ email, password })
      setUser(u)
      message.success('Welcome back')
    } catch (e:any) {
      message.error(e.message || 'Login failed')
      throw e
    } finally { setLoading(false) }
  }
  const logout = async () => {
    await apiClient.logout()
    setUser(null)
    message.info('Logged out')
  }
  const toggleFavorite = async (movieId:string) => {
    if (!user) { message.info('Please login to manage favorites'); throw new Error('Not logged in') }
    const favs = await apiClient.toggleFavorite(user.id, movieId)
    setUser({ ...user, favorites: favs })
  }
  const isAdmin = () => !!user && user.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, toggleFavorite, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}


