import React from 'react'
import { Card, Button } from 'antd'
import { HeartOutlined, HeartFilled } from '@ant-design/icons'
import { Movie } from '../types'
import { useAuth } from '../hooks/useAuth'
import MovieDetails from './MovieDetails'

const { Meta } = Card

export default function MovieCard({ movie, onEdit, onDelete }:{ movie:Movie, onEdit?:()=>void, onDelete?:()=>void }){
  const { user, toggleFavorite, isAdmin } = useAuth()
  const favoriteIds = user?.favorites || []
  const fav = favoriteIds.includes(movie.id)
  const [open, setOpen] = React.useState(false)
  return (
    <Card
      hoverable
      style={{ width: 240 }}
      cover={<div onClick={() => setOpen(true)} style={{height:320,background:'#ddd',display:'flex',alignItems:'center',justifyContent:'center', cursor: 'pointer'}}>{movie.poster ? <img src={movie.poster} alt={movie.title} style={{maxHeight:'100%',maxWidth:'100%'}}/> : <div style={{padding:20}}>{movie.title}</div>}</div>}
      actions={[
        <Button type="text" aria-pressed={fav} onClick={() => toggleFavorite(movie.id)} icon={fav ? <HeartFilled style={{color:'crimson'}}/> : <HeartOutlined />} />,
        isAdmin() ? <Button key="edit" type="link" onClick={onEdit}>Edit</Button> : null,
        isAdmin() ? <Button key="del" type="link" danger onClick={onDelete}>Delete</Button> : null
      ].filter(Boolean) as any}
    >
      <Meta title={`${movie.title} (${movie.year})`} description={movie.type === 'series' ? 'Series' : movie.type === 'episode' ? 'Episode' : 'Movie'} />
      <MovieDetails movie={movie} open={open} onClose={() => setOpen(false)} />
    </Card>
  )
}









