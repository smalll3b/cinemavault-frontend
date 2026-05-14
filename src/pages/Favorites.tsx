import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { apiClient } from '../api/apiClient'
import MovieList from '../components/MovieList'
import { Movie } from '../types'
import { Spin, Empty } from 'antd'

export default function Favorites(){
  const { user } = useAuth()
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
        const freshUser = await apiClient.currentUser()
        const ids = freshUser?.favorites ?? user.favorites ?? []
        const list = await Promise.all(ids.map(id => apiClient.getMovie(id)))
        if (active) setMovies(list.filter(Boolean) as Movie[])
      } catch (e:any) {
        if (active) setError(e?.message || 'Failed to load favorites')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [user?.id, user?.favorites?.join('|')])

  if (!user) return <div>Please login to see favorites</div>
  return (
    <div>
      {loading ? <Spin /> : error ? <div>{error}</div> : (movies.length ? <MovieList movies={movies} onEdit={()=>{}} onDelete={()=>{}} /> : <Empty description="No favorites yet" />)}
    </div>
  )
}




