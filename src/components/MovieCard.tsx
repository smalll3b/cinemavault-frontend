import React from 'react'
import { Card, Button } from 'antd'
import { HeartOutlined, HeartFilled } from '@ant-design/icons'
import { Movie } from '../types'
import { useAuth } from '../hooks/useAuth'

const { Meta } = Card

export default function MovieCard({ movie, onEdit, onDelete }:{ movie:Movie, onEdit?:()=>void, onDelete?:()=>void }){
  const { user, toggleFavorite, isAdmin } = useAuth()
  const fav = user?.favorites?.includes(movie.id)
  return (
    <Card
      hoverable
      style={{ width: 240 }}
      cover={<div style={{height:320,background:'#ddd',display:'flex',alignItems:'center',justifyContent:'center'}}>{movie.poster ? <img src={movie.poster} alt={movie.title} style={{maxHeight:'100%',maxWidth:'100%'}}/> : <div style={{padding:20}}>{movie.title}</div>}</div>}
      actions={[
        <Button type="text" onClick={() => toggleFavorite(movie.id)} icon={fav ? <HeartFilled style={{color:'crimson'}}/> : <HeartOutlined />} />,
        isAdmin() ? <Button key="edit" type="link" onClick={onEdit}>Edit</Button> : null,
        isAdmin() ? <Button key="del" type="link" danger onClick={onDelete}>Delete</Button> : null
      ].filter(Boolean) as any}
    >
      <Meta title={`${movie.title} (${movie.year})`} description={movie.type} />
    </Card>
  )
}






