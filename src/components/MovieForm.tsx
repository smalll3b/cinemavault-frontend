import React, { useEffect } from 'react'
import { Modal, Form, Input, Select, InputNumber, message } from 'antd'
import { Movie } from '../types'
import { apiClient } from '../api/apiClient'

export default function MovieForm({ open, onClose, movie }:{ open:boolean, onClose:()=>void, movie:Movie | null }){
  const [form] = Form.useForm()
  useEffect(()=>{ if (movie) form.setFieldsValue(movie); else form.resetFields() }, [movie, form])

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
        <Form.Item name="title" label="Title" rules={[{required:true, message: '請輸入標題'}]}> <Input /> </Form.Item>
        <Form.Item name="year" label="Year" rules={[{required:true, message: '請輸入年份'}, { type: 'number', message: '年份必須為數字'}]}> <InputNumber style={{width:'100%'}} /> </Form.Item>
        <Form.Item name="type" label="Type" rules={[{ required: true, message: '請選擇類型' }]}>
          <Select>
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

