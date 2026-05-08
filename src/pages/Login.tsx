import React from 'react'
import { Form, Input, Button, Card } from 'antd'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const { login, loading } = useAuth()
  const nav = useNavigate()
  const onFinish = async (vals:any) => {
    await login(vals.email, vals.password)
    nav('/')
  }
  return (
    <div style={{display:'flex',justifyContent:'center',paddingTop:40}}>
      <Card title="Login" style={{width:360}}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: '請輸入電子郵件' },
              { type: 'email', message: '請輸入有效的電子郵件地址' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: '請輸入密碼' }, { min: 6, message: '密碼至少 6 位' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>Login</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}


