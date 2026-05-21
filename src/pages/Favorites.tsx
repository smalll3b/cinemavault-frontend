import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { apiClient } from '../api/apiClient'
import MovieList from '../components/MovieList'
import { Movie } from '../types'
import { Spin, Empty, message } from 'antd'

export default function Favorites(){
  const { user } = useAuth()
  const [messageApi, contextHolder] = message.useMessage()
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        // Fetch favorite movie objects directly from the backend via apiClient.getFavorites()
        const list = await apiClient.getFavorites()
        const valid = (list || []).filter((m): m is Movie => !!m && !!m.id && !!m.title)
        if (active) setMovies(valid)
      } catch (e:any) {
        if (active) setError(e?.message || 'Failed to load favorites')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [user?.id])

  if (!user) return <div>Please login to see favorites</div>
  return (
    <div>
      {loading ? <Spin /> : error ? <div>{error}</div> : (movies.length ? <MovieList movies={movies} onEdit={()=>{}} onDelete={()=>{}} /> : <Empty description="No favorites yet" />)}
    </div>
  )
}








