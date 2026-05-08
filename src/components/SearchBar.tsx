import React from 'react'
import { Input } from 'antd'

export default function SearchBar({ value, onChange }:{ value:string, onChange:(v:string)=>void }){
  return (
    <Input.Search
      placeholder="Search by title or description"
      allowClear
      value={value}
      onChange={e=>onChange(e.target.value)}
      style={{ maxWidth: 480 }}
    />
  )
}

