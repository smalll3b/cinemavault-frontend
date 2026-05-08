import React from 'react'
import { Select, Radio } from 'antd'
import { MovieType } from '../types'

export default function FilterControls({ year, setYear, type, setType }:{ year?:number, setYear:(y?:number)=>void, type?:MovieType | '', setType:(t:MovieType | '')=>void }){
  const years = Array.from({length:30}, (_,i)=> 2026 - i)
  return (
    <div style={{display:'flex',gap:12,alignItems:'center'}}>
      <Select allowClear style={{width:140}} placeholder="Year" value={year} onChange={(v)=>setYear(v)}>
        {years.map(y => <Select.Option key={y} value={y}>{y}</Select.Option>)}
      </Select>
      <Radio.Group value={type} onChange={e=>setType(e.target.value)}>
        <Radio.Button value={''}>All</Radio.Button>
        <Radio.Button value={'movie'}>Movie</Radio.Button>
        <Radio.Button value={'series'}>Series</Radio.Button>
      </Radio.Group>
    </div>
  )
}

