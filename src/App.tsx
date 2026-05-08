import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { Layout, Menu, Dropdown, Button } from 'antd'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Favorites from './pages/Favorites'
import AdminDashboard from './pages/Admin/AdminDashboard'
import { useAuth } from './hooks/useAuth'

const { Header, Content } = Layout

export default function App(){
  const { user, logout, isAdmin } = useAuth()
  return (
    <Layout>
      <Header className="app-header">
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <Link to="/"><h3 style={{margin:0,color:'#000'}}>CinemaVault</h3></Link>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link to="/favorites">Favorites</Link>
          {isAdmin() && <Link to="/admin">Admin</Link>}
          {user ? <Dropdown menu={{items:[{key:'logout',label:'Logout',onClick:logout}]}}><Button>{user.name}</Button></Dropdown> : <><Link to="/login">Login</Link><Link to="/register">Register</Link></>}
        </div>
      </Header>
      <Content className="container">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={user ? <Navigate to="/"/> : <Login/>} />
          <Route path="/register" element={user ? <Navigate to="/"/> : <Register/>} />
          <Route path="/favorites" element={user ? <Favorites/> : <Navigate to="/login"/>} />
          <Route path="/admin" element={isAdmin() ? <AdminDashboard/> : <Navigate to="/"/>} />
        </Routes>
      </Content>
    </Layout>
  )
}

