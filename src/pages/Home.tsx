import React, { useEffect, useState } from 'react'
import { Input, Row, Col, Spin, Empty, Pagination } from 'antd'
import { apiClient } from '../api/apiClient'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import SearchBar from '../components/SearchBar'
import FilterControls from '../components/FilterControls'
import MovieList from '../components/MovieList'
import MovieForm from '../components/MovieForm'
import { Movie } from '../types'

export default function Home(){
  const [q, setQ] = useState('')
  const [year, setYear] = useState<number|undefined>(undefined)
  const [type, setType] = useState<'movie'|'series'|''|undefined>('')
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)

  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  // load function and debounce search + client-side pagination
  const load = () => {
    setLoading(true)
    const payload = { q: q || undefined, year, type: type || undefined }
    return apiClient.getMovies(payload as any).then(list => { setMovies(list) }).finally(()=>setLoading(false))
  }

  useEffect(() => {
    let mounted = true
    setLoading(true)
    const payload = { q: q || undefined, year, type: type || undefined }
    const t = setTimeout(() => {
      apiClient.getMovies(payload as any).then(list => { if (mounted) setMovies(list) }).finally(()=>mounted && setLoading(false))
    }, 300)
    return ()=>{ mounted = false; clearTimeout(t) }
  }, [q, year, type])

  // pagination handling: slice movies for current page
  const [page, setPage] = useState(1)
  const pageSize = 8
  useEffect(()=> setPage(1), [q, year, type])
  const paginated = movies.slice((page-1)*pageSize, page*pageSize)

  const handleDelete = async (id: string) => {
    if (!isAdmin()) { message.error('僅管理員可刪除電影'); return }
    if (!confirm('確定要刪除這部電影嗎？')) return
    try{
      await apiClient.deleteMovie(id)
      message.success('已刪除')
      await load()
    }catch(e:any){ message.error(e.message || '刪除失敗') }
  }
  const handleEdit = (id: string) => {
    if (!isAdmin()) { message.info('請到管理頁面進行編輯'); navigate('/admin'); return }
    ;(async () => {
      try {
        const m = await apiClient.getMovie(id)
        setEditing(m)
        setEditVisible(true)
      } catch (e:any) { message.error('無法載入電影資料') }
    })()
  }

  const [editVisible, setEditVisible] = useState(false)
  const [editing, setEditing] = useState<Movie | null>(null)

  return (
    <div>
      <Row justify="space-between" align="middle" style={{marginBottom:16}}>
        <Col>
          <SearchBar value={q} onChange={setQ} />
        </Col>
        <Col>
          <FilterControls year={year} setYear={setYear as any} type={type as any} setType={setType as any} />
        </Col>
      </Row>
      {loading ? <Spin /> : (movies.length ? <>
        <MovieList movies={paginated} onEdit={(m)=>handleEdit(m.id)} onDelete={(m)=>handleDelete(m.id)} />
        <MovieForm open={editVisible} onClose={() => { setEditVisible(false); setEditing(null); load() }} movie={editing} />
        {movies.length > pageSize && (
          <div style={{textAlign:'center', marginTop:16}}>
            <Pagination current={page} pageSize={pageSize} total={movies.length} onChange={(p)=>setPage(p)} />
          </div>
        )}
      </> : <Empty />)}
    </div>
  )
}






