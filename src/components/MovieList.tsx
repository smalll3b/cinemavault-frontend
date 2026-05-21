import React from 'react'
import { Row, Col } from 'antd'
import MovieCard from './MovieCard'
import { Movie } from '../types'

export default function MovieList({ movies, onEdit, onDelete }:{ movies:Movie[], onEdit?:(m:Movie)=>void, onDelete?:(m:Movie)=>void }){
  return (
    <Row gutter={[16,16]}>
      {movies.map((m, idx) => (
        <Col key={m.id || `movie-${idx}`} xs={24} sm={12} md={8} lg={6}>
          <MovieCard movie={m} onEdit={() => onEdit?.(m)} onDelete={() => onDelete?.(m)} />
        </Col>
      ))}
    </Row>
  )
}







