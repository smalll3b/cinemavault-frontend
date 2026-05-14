import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Table, Button, Space, Popconfirm, message } from 'antd'
import { apiClient } from '../../api/apiClient'
import { Movie } from '../../types'
import MovieForm from '../../components/MovieForm'

export default function AdminDashboard(){
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [editing, setEditing] = useState<Movie | null>(null)
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    const list = await apiClient.getMovies()
    setMovies(list)
    setLoading(false)
  }
  useEffect(()=>{ load() }, [])

  // open edit modal if navigated here with state.editId
  const location = useLocation()
  useEffect(() => {
    const anyState = (location as any).state
    if (anyState && anyState.editId) {
      const movie = movies.find(m => m.id === anyState.editId)
      if (movie) {
        setEditing(movie)
        setVisible(true)
        // clear the navigation state so modal won't reopen on subsequent renders
        navigate(location.pathname, { replace: true, state: {} })
      }
    }
  }, [location, movies, navigate])

  const onDelete = async (m:Movie) => {
    await apiClient.deleteMovie(m.id)
    message.success('Deleted')
    load()
  }
  const onEdit = (m:Movie) => { setEditing(m); setVisible(true) }
  const onCreate = () => { setEditing(null); setVisible(true) }

  return (
    <div>
      <Space style={{marginBottom:16}}>
        <Button type="primary" onClick={onCreate}>New Movie</Button>
        <Button onClick={load}>Refresh</Button>
      </Space>
      <Table dataSource={movies} rowKey="id" loading={loading}>
        <Table.Column title="Title" dataIndex="title" key="title" />
        <Table.Column title="Year" dataIndex="year" key="year" />
        <Table.Column title="Type" dataIndex="type" key="type" />
        <Table.Column title="Actions" key="actions" render={(_, record:Movie) => (
          <Space>
            <Button onClick={()=>onEdit(record)}>Edit</Button>
            <Popconfirm title="Delete?" onConfirm={()=>onDelete(record)}>
              <Button danger>Delete</Button>
            </Popconfirm>
          </Space>
        )} />
      </Table>

      <MovieForm open={visible} onClose={() => { setVisible(false); load() }} movie={editing} />
    </div>
  )
}












