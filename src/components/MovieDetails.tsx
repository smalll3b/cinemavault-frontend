import React from 'react'
import { Modal, Descriptions, Image } from 'antd'
import { Movie } from '../types'

export default function MovieDetails({ movie, open, onClose }:{ movie: Movie, open: boolean, onClose: ()=>void }){
  if (!movie) return null
  
  const m = movie as any
  // 增加容錯：相容不同來源的欄位命名與 N/A 處理
  const getVal = (val: any) => (val && String(val).trim() !== 'N/A' ? String(val) : '—')
  
  // 嘗試獲取所有可能的欄位名稱變體
  const imdbID = m.imdbID || m.imdb_id || m.imdbId
  const imdbRating = m.imdbRating || m.imdb_rating || m.rating || m.vote_average
  const description = m.description || m.overview || m.plot

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
            <Descriptions.Item label="Type">{movie.type}</Descriptions.Item>
            <Descriptions.Item label="IMDB ID">{getVal(imdbID)}</Descriptions.Item>
            <Descriptions.Item label="IMDB Rating">{getVal(imdbRating)}</Descriptions.Item>
            <Descriptions.Item label="Runtime">{getVal(movie.runtime)}</Descriptions.Item>
            <Descriptions.Item label="Genre">{getVal(movie.genre)}</Descriptions.Item>
            <Descriptions.Item label="Director">{getVal(movie.director)}</Descriptions.Item>
            <Descriptions.Item label="Actors">{getVal(movie.actors)}</Descriptions.Item>
            <Descriptions.Item label="Rated">{getVal(movie.rated)}</Descriptions.Item>
            <Descriptions.Item label="Released">{getVal(movie.released)}</Descriptions.Item>
            <Descriptions.Item label="Language">{getVal(movie.language)}</Descriptions.Item>
            <Descriptions.Item label="Country">{getVal(movie.country)}</Descriptions.Item>
            <Descriptions.Item label="Description">{getVal(description)}</Descriptions.Item>
          </Descriptions>
        </div>
      </div>
    </Modal>
  )
}
