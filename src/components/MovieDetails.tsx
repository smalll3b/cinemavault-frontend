import React from 'react'
import { Modal, Descriptions, Image } from 'antd'
import { Movie } from '../types'

export default function MovieDetails({ movie, open, onClose }:{ movie: Movie, open: boolean, onClose: ()=>void }){
  if (!movie) return null
  return (
    <Modal
      title={`${movie.title} (${movie.year})`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
    >
      <div style={{display:'flex', gap:16}}>
        <div style={{flex:'0 0 240px'}}>
          {movie.poster ? <Image src={movie.poster} alt={movie.title} width={220} /> : <div style={{width:220,height:330,background:'#ddd',display:'flex',alignItems:'center',justifyContent:'center'}}>No Image</div>}
        </div>
        <div style={{flex:1}}>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Title">{movie.title}</Descriptions.Item>
            <Descriptions.Item label="Year">{movie.year}</Descriptions.Item>
            <Descriptions.Item label="Type">{movie.type || movie.mediaType}</Descriptions.Item>
            <Descriptions.Item label="IMDB ID">{movie.imdb_id || '—'}</Descriptions.Item>
            <Descriptions.Item label="Runtime">{movie.runtime ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Genre">{movie.genre ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Director">{movie.director ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Actors">{movie.actors ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="External Rating">{movie.external_rating ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Description">{movie.plot ?? movie.description ?? '—'}</Descriptions.Item>
          </Descriptions>
        </div>
      </div>
    </Modal>
  )
}

