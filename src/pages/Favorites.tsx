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

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all((user.favorites||[]).map(id => apiClient.getMovie(id))).then(list => setMovies(list.filter(Boolean) as Movie[])).finally(()=>setLoading(false))
  }, [user])

  if (!user) return <div>Please login to see favorites</div>
  return (
    <div>
      {loading ? <Spin /> : (movies.length ? <MovieList movies={movies} onEdit={()=>{}} onDelete={()=>{}} /> : <Empty />)}
    </div>
  )
}


