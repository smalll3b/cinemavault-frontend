import React, { useEffect, useMemo } from 'react'
import { Modal, Form, Input, Select, InputNumber, message, Row, Col } from 'antd'
import { Movie } from '../types'
import { apiClient } from '../api/apiClient'
import { fetchOmdbMovieByTitle } from '../api/omdb'

export default function MovieForm({ open, onClose, movie }:{ open:boolean, onClose:()=>void, movie:Movie | null }){
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const [omdbLoading, setOmdbLoading] = React.useState(false)
  
  const fields = [
    'title', 'year', 'type', 'poster', 'description', 
    'rated', 'released', 'runtime', 'genre', 'director', 
    'writer', 'actors', 'language', 'country', 'awards', 
    'imdbRating', 'imdbID'
  ]

  const initialValues = useMemo(() => {
    const vals: any = {}
    fields.forEach(f => {
      vals[f] = (movie as any)?.[f] ?? ''
    })
    vals.year = movie?.year ?? new Date().getFullYear()
    vals.type = movie?.type ?? 'movie'
    return vals
  }, [movie])

  useEffect(() => {
    if (!open) return
    form.resetFields()
    form.setFieldsValue(initialValues)
  }, [open, initialValues, form])

  const handleOmdbLookup = async () => {
    const title = String(form.getFieldValue('title') || '').trim()
    if (!title) {
      messageApi.info('請先輸入電影標題')
      return
    }

    setOmdbLoading(true)
    try {
      const suggestion = await fetchOmdbMovieByTitle(title)
      form.setFieldsValue(suggestion)
      messageApi.success('已從 OMDB 載入資料')
    } catch (e: any) {
      messageApi.error(e?.message || 'OMDB 查詢失敗')
    } finally {
      setOmdbLoading(false)
    }
  }

  const onFinish = async (vals:any) => {
    try {
      // 這裡的 vals 會包含所有 Form.Item 內的名稱
      const payload = { ...vals }
      
      if (movie) await apiClient.updateMovie(movie.id, payload)
      else await apiClient.createMovie(payload)
      messageApi.success('Saved')
      onClose()
    } catch(e:any) { 
      messageApi.error(e.message || 'Save failed') 
    }
  }

  return (
    <>
      {contextHolder}
      <Modal
        title={movie ? 'Edit Movie' : 'New Movie'}
        open={open}
        onCancel={onClose}
        onOk={() => form.submit()}
        width={850}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialValues}
        >
          <Row gutter={12}>
            <Col span={24}>
              <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input.Search enterButton="Fetch from OMDB" onSearch={handleOmdbLookup} loading={omdbLoading} />
              </Form.Item>
            </Col>
            <Col span={6}><Form.Item name="year" label="Year"><InputNumber style={{width:'100%'}}/></Form.Item></Col>
            <Col span={6}>
              <Form.Item name="type" label="Type">
                <Select options={[{value:'movie',label:'Movie'},{value:'series',label:'Series'},{value:'episode',label:'Episode'}]} />
              </Form.Item>
            </Col>
            <Col span={6}><Form.Item name="imdbID" label="IMDB ID"><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="imdbRating" label="IMDB Rating"><Input /></Form.Item></Col>
            
            <Col span={8}><Form.Item name="runtime" label="Runtime"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="genre" label="Genre"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="rated" label="Rated"><Input /></Form.Item></Col>

            <Col span={12}><Form.Item name="director" label="Director"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="actors" label="Actors"><Input /></Form.Item></Col>
            
            <Col span={8}><Form.Item name="released" label="Released"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="language" label="Language"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="country" label="Country"><Input /></Form.Item></Col>

            <Col span={24}><Form.Item name="poster" label="Poster URL"><Input /></Form.Item></Col>
            <Col span={24}><Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}
