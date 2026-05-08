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

function MovieForm({ open, onClose, movie }:{ open:boolean, onClose:()=>void, movie:Movie | null }){
  const [form] = Form.useForm()

  useEffect(()=>{ if (movie) form.setFieldsValue(movie); else form.resetFields() }, [movie])

  const onFinish = async (vals:any) => {
    try{
      if (movie) await apiClient.updateMovie(movie.id, vals)
      else await apiClient.createMovie(vals)
      message.success('Saved')
      onClose()
    }catch(e:any){ message.error(e.message || 'Save failed') }
  }

  return (
      <Modal title={movie ? 'Edit Movie' : 'New Movie'} open={open} onCancel={onClose} onOk={() => form.submit()}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ type: 'movie' }}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: '請輸入標題' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="year"
          label="Year"
          rules={[{ required: true, message: '請輸入年份' }, { type: 'number', message: '年份必須為數字' }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: '請選擇類型' }]}
        >
          <Select>
            <Select.Option value="movie">Movie</Select.Option>
            <Select.Option value="series">Series</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="poster"
          label="Poster URL"
          rules={[{ type: 'url', message: '請輸入有效的 URL 或留空' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description"> <Input.TextArea /> </Form.Item>
      </Form>
    </Modal>
  )
}








