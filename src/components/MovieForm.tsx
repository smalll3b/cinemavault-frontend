import React, { useEffect, useMemo } from 'react'
import { Modal, Form, Input, Select, InputNumber, message } from 'antd'
import { Movie } from '../types'
import { apiClient } from '../api/apiClient'

export default function MovieForm({ open, onClose, movie }:{ open:boolean, onClose:()=>void, movie:Movie | null }){
  const [form] = Form.useForm()
  const initialValues = useMemo(() => ({
    title: movie?.title ?? '',
    year: movie?.year ?? new Date().getFullYear(),
    type: movie?.type ?? 'movie',
    poster: movie?.poster ?? '',
    description: movie?.description ?? ''
  }), [movie])

  useEffect(() => {
    if (!open) return
    form.resetFields()
    form.setFieldsValue(initialValues)
  }, [open, initialValues, form])

  const onFinish = async (vals:any) => {
    try{
      const payload = {
        title: String(vals.title || '').trim(),
        year: Number(vals.year),
        type: vals.type || 'movie',
        poster: vals.poster?.trim?.() || '',
        description: vals.description?.trim?.() || ''
      }
      if (movie) await apiClient.updateMovie(movie.id, payload)
      else await apiClient.createMovie(payload)
      message.success('Saved')
      onClose()
    }catch(e:any){ message.error(e.message || 'Save failed') }
  }

  return (
    <Modal title={movie ? 'Edit Movie' : 'New Movie'} open={open} onCancel={onClose} onOk={() => form.submit()} destroyOnClose>
      <Form
        key={movie?.id ?? 'new'}
        form={form}
        layout="vertical"
        onFinish={onFinish}
        preserve={false}
        initialValues={initialValues}
      >
        <Form.Item name="title" label="Title" rules={[{ required: true, message: '請輸入標題' }]}>
          <Input placeholder="輸入電影標題" autoFocus />
        </Form.Item>
        <Form.Item name="year" label="Year" rules={[{ required: true, message: '請輸入年份' }, { type: 'number', message: '年份必須為數字' }]}>
          <InputNumber style={{width:'100%'}} min={1888} max={2100} placeholder="例如 2024" />
        </Form.Item>
        <Form.Item name="type" label="Type" rules={[{ required: true, message: '請選擇類型' }]}>
          <Select placeholder="Select type">
            <Select.Option value="movie">Movie</Select.Option>
            <Select.Option value="series">Series</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="poster" label="Poster URL" rules={[{ type: 'url', message: '請輸入有效的 URL 或留空' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description"> <Input.TextArea /> </Form.Item>
      </Form>
    </Modal>
  )
}










