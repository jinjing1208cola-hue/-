import { useState, useEffect, useRef, useMemo, useCallback, useTransition, memo } from 'react'
import {
  Upload, ArrowUpDown, LayoutGrid, List, Plus,
  Image, Video, FileText, Trash2, FolderOpen, MessageSquare,
  CheckSquare, X, Download, ZoomIn, ZoomOut
} from 'lucide-react'
import Modal from '../components/common/Modal'
import {
  Material, getMaterials, addMaterial, updateMaterial, deleteMaterials,
  generateId, formatSize, formatDate,
} from '../lib/storage'

const CATEGORIES = ['产品图', '教程视频', '使用手册', '宣传素材', '其他']
const ACCEPT = 'image/*,video/*,.pdf'
const PAGE_SIZE = 30

type SortKey = 'name' | 'date' | 'size' | 'type'
type SortDir = 'asc' | 'desc'
type ViewMode = 'grid' | 'list'

// Memoized material card for grid view
const MaterialCard = memo(function MaterialCard({
  m, selected, onSelect, onPreview, onDelete, onCategoryChange, onNotesEdit,
}: {
  m: Material; selected: boolean; onSelect: (id: string) => void;
  onPreview: (m: Material) => void; onDelete: (id: string) => void;
  onCategoryChange: (id: string, cat: string) => void;
  onNotesEdit: (id: string, notes: string) => void;
}) {
  return (
    <div className={`material-card ${selected ? 'selected' : ''}`}>
      <div className="material-thumb" onClick={() => onPreview(m)}>
        {m.type === 'image' ? <img src={m.dataUrl} alt={m.name} loading="lazy" />
         : m.type === 'video' ? <div className="material-thumb-video"><video src={m.dataUrl} muted preload="metadata" /><div className="play-overlay">▶</div></div>
         : <div className="material-thumb-pdf"><FileText size={48} strokeWidth={1.2} style={{ color: '#f43f5e' }} /></div>}
        <label className="material-check" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selected} onChange={() => onSelect(m.id)} /></label>
      </div>
      <div className="material-info">
        <div className="material-name" title={m.name}>
          {m.type === 'image' ? <Image size={14} style={{ color: '#6366f1', verticalAlign: -2 }} /> :
           m.type === 'video' ? <Video size={14} style={{ color: '#f59e0b', verticalAlign: -2 }} /> :
           <FileText size={14} style={{ color: '#6b7280', verticalAlign: -2 }} />}
          {' '}{m.name}
        </div>
        <div className="material-meta"><span>{formatSize(m.size)}</span><span>·</span><span>{formatDate(m.uploadedAt)}</span></div>
        {m.notes && <div className="material-notes-preview" title={m.notes}>{m.notes}</div>}
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          <select className="material-category-select" value={m.category} onChange={e => onCategoryChange(m.id, e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn" style={{ fontSize: 11, padding: '4px 8px' }} onClick={(e) => { e.stopPropagation(); const n = prompt('编辑备注', m.notes); if (n !== null) onNotesEdit(m.id, n) }}><MessageSquare size={12} /></button>
        </div>
      </div>
      <button className="material-delete" onClick={() => onDelete(m.id)} title="删除"><Trash2 size={14} /></button>
    </div>
  )
})

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [category, setCategory] = useState('全部')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadCategory, setUploadCategory] = useState('其他')
  const [uploadNotes, setUploadNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [previewItem, setPreviewItem] = useState<Material | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [batchCatOpen, setBatchCatOpen] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [page, setPage] = useState(1)
  const [, startTransition] = useTransition()

  useEffect(() => { getMaterials().then(setMaterials) }, [])

  // Debounced search
  const handleSearch = useCallback((val: string) => {
    setSearch(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      startTransition(() => setDebouncedSearch(val))
    }, 300)
  }, [])

  // Reset page on filter change
  const handleCategoryChange2 = useCallback((cat: string) => {
    setCategory(cat)
    setPage(1)
  }, [])

  const filtered = useMemo(() => {
    let list = materials.filter(m => {
      if (category !== '全部' && m.category !== category) return false
      if (debouncedSearch && !m.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        && !m.notes.toLowerCase().includes(debouncedSearch.toLowerCase())) return false
      return true
    })
    list = [...list].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name); break
        case 'date': cmp = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime(); break
        case 'size': cmp = a.size - b.size; break
        case 'type': cmp = a.type.localeCompare(b.type); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [materials, category, debouncedSearch, sortKey, sortDir])

  // Pagination
  const paginated = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page])
  const hasMore = paginated.length < filtered.length

  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 400 && hasMore) {
        setPage(p => p + 1)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hasMore])

  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files)
    if (!arr.length) return
    setUploading(true)
    setUploadProgress({ current: 0, total: arr.length })
    const newMats: Material[] = []
    for (let i = 0; i < arr.length; i++) {
      const file = arr[i]
      let type: Material['type']
      if (file.type.startsWith('image/')) type = 'image'
      else if (file.type.startsWith('video/')) type = 'video'
      else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) type = 'pdf'
      else continue
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      const m: Material = {
        id: generateId(), name: file.name, type, size: file.size, dataUrl,
        category: uploadCategory, notes: uploadNotes, modelTag: '',
        uploadedAt: new Date().toISOString(),
      }
      await addMaterial(m)
      newMats.push(m)
      setUploadProgress({ current: i + 1, total: arr.length })
    }
    setMaterials(prev => [...prev, ...newMats])
    setUploading(false)
    setUploadOpen(false)
    setUploadNotes('')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }, [])

  const selectAll = useCallback(() => setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(m => m.id))), [filtered])

  const handleBatchDelete = async () => { await deleteMaterials([...selected]); setMaterials(prev => prev.filter(m => !selected.has(m.id))); setSelected(new Set()) }

  const handleBatchCategory = async (newCat: string) => {
    for (const id of selected) { const m = materials.find(x => x.id === id); if (m) { m.category = newCat; await updateMaterial(m) } }
    setMaterials(prev => prev.map(m => selected.has(m.id) ? { ...m, category: newCat } : m))
    setSelected(new Set()); setBatchCatOpen(false)
  }

  const handleUpdateNotes = useCallback(async (id: string, notes: string) => {
    const m = materials.find(x => x.id === id); if (!m) return
    m.notes = notes; await updateMaterial(m)
    setMaterials(prev => prev.map(x => x.id === id ? { ...x, notes } : x))
  }, [materials])

  const handleCategoryChange = useCallback(async (id: string, newCat: string) => {
    const m = materials.find(x => x.id === id); if (!m) return
    m.category = newCat; await updateMaterial(m)
    setMaterials(prev => prev.map(x => x.id === id ? { ...x, category: newCat } : x))
  }, [materials])

  const handlePreview = useCallback((m: Material) => { setPreviewItem(m); setZoomLevel(1) }, [])
  const handleDelete = useCallback(async (id: string) => { await deleteMaterials([id]); setMaterials(prev => prev.filter(x => x.id !== id)) }, [])

  const counts = useMemo(() => {
    const c: Record<string, number> = { '全部': materials.length }
    materials.forEach(m => { c[m.category] = (c[m.category] || 0) + 1 })
    return c
  }, [materials])

  const typeBadge = (t: Material['type']) => {
    const map = { image: 'badge-info', video: 'badge-warning', pdf: 'badge-neutral' }
    const label = { image: '图片', video: '视频', pdf: 'PDF' }
    return <span className={`badge ${map[t]}`}>{label[t]}</span>
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FolderOpen size={26} strokeWidth={1.8} style={{ color: 'var(--primary)' }} />物料库
          </h1>
          <p className="page-subtitle" style={{ marginTop: 4, marginBottom: 0 }}>管理产品图片、教程视频、使用手册等运营物料</p>
        </div>
        <button className="btn btn-primary" onClick={() => setUploadOpen(true)}><Plus size={16} /> 上传物料</button>
      </div>

      {selected.size > 0 && (
        <div className="batch-bar">
          <span className="batch-count"><CheckSquare size={16} style={{ verticalAlign: -3 }} /> 已选 {selected.size} 项</span>
          <button className="btn" onClick={selectAll}>{selected.size === filtered.length ? '取消全选' : '全选'}</button>
          <button className="btn" onClick={() => setBatchCatOpen(true)}><FolderOpen size={14} /> 批量改分类</button>
          <button className="btn" onClick={handleBatchDelete} style={{ color: 'var(--danger)' }}><Trash2 size={14} /> 批量删除</button>
          <button className="btn" onClick={() => setSelected(new Set())}><X size={14} /> 取消选择</button>
        </div>
      )}

      <Modal open={batchCatOpen} onClose={() => setBatchCatOpen(false)} title="批量修改分类" width={360}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CATEGORIES.map(c => <button key={c} className="btn" style={{ justifyContent: 'flex-start' }} onClick={() => handleBatchCategory(c)}><FolderOpen size={14} /> {c}</button>)}
        </div>
      </Modal>

      <div className="toolbar" style={{ marginBottom: 20, gap: 8 }}>
        {(['全部', ...CATEGORIES] as const).map(cat => (
          <button key={cat} className={`btn ${category === cat ? 'btn-primary' : ''}`} onClick={() => handleCategoryChange2(cat)}>
            {cat} {counts[cat] ? <span style={{ opacity: .7, fontSize: 12 }}>({counts[cat]})</span> : null}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <input className="search-input" placeholder="搜索名称或备注..." value={search} onChange={e => handleSearch(e.target.value)} style={{ width: 220 }} />
        <select className="sort-select" value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}>
          <option value="date">按日期</option><option value="name">按名称</option><option value="size">按大小</option><option value="type">按类型</option>
        </select>
        <button className="btn" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}><ArrowUpDown size={14} /></button>
        <div className="view-toggle">
          <button className={`btn ${viewMode === 'grid' ? 'btn-primary' : ''}`} onClick={() => setViewMode('grid')}><LayoutGrid size={15} /></button>
          <button className={`btn ${viewMode === 'list' ? 'btn-primary' : ''}`} onClick={() => setViewMode('list')}><List size={15} /></button>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal open={uploadOpen} onClose={() => { if (!uploading) setUploadOpen(false) }} title="上传物料" width={520}>
        {!uploading ? (
          <>
            <div className="form-group">
              <label className="form-label">选择分类</label>
              <select className="form-input" value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">备注说明</label>
              <textarea className="form-textarea" value={uploadNotes} onChange={e => setUploadNotes(e.target.value)} placeholder="可选，记录该物料的用途或说明..." rows={2} />
            </div>
            <div className={`upload-zone ${dragging ? 'dragging' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}>
              <div style={{ color: 'var(--primary)', marginBottom: 12 }}><Upload size={40} strokeWidth={1.5} /></div>
              <div className="upload-text">拖拽文件到此处，或点击选择</div>
              <div className="upload-hint">支持 JPG / PNG / GIF / MP4 / MOV / PDF · 可批量上传</div>
            </div>
            <input ref={fileInputRef} type="file" multiple accept={ACCEPT} style={{ display: 'none' }}
              onChange={e => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = '' }} />
          </>
        ) : (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div style={{ color: 'var(--primary)', marginBottom: 12 }}><Upload size={36} strokeWidth={1.5} /></div>
            <div style={{ fontSize: 16, fontWeight: 600, margin: '12px 0 8px' }}>正在上传...</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>{uploadProgress.current} / {uploadProgress.total}</div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${uploadProgress.total ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%` }} /></div>
          </div>
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal open={!!previewItem} onClose={() => { setPreviewItem(null); setZoomLevel(1) }} title={previewItem?.name || ''} width={960}>
        {previewItem && (
          <div className="preview-content">
            {previewItem.type === 'image' && (
              <div className="preview-image-wrap">
                <img src={previewItem.dataUrl} alt={previewItem.name} className="preview-media"
                  style={{ transform: `scale(${zoomLevel})`, cursor: zoomLevel > 1 ? 'grab' : 'zoom-in' }} />
                <div className="preview-zoom-controls">
                  <button className="btn" onClick={() => setZoomLevel(z => Math.max(.5, z - .25))}><ZoomOut size={14} /></button>
                  <span style={{ fontSize: 12, minWidth: 40, textAlign: 'center', fontWeight: 600, color: '#fff' }}>{Math.round(zoomLevel * 100)}%</span>
                  <button className="btn" onClick={() => setZoomLevel(z => Math.min(3, z + .25))}><ZoomIn size={14} /></button>
                  <button className="btn" onClick={() => setZoomLevel(1)} style={{ fontSize: 12 }}>重置</button>
                </div>
              </div>
            )}
            {previewItem.type === 'video' && (
              <video src={previewItem.dataUrl} controls className="preview-media" style={{ maxWidth: '100%', maxHeight: '65vh' }} />
            )}
            {previewItem.type === 'pdf' && (
              <embed src={previewItem.dataUrl} type="application/pdf" className="preview-pdf-iframe" style={{ height: "75vh", minHeight: 500 }} />
            )}
            <div className="preview-meta">
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 4 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{formatDate(previewItem.uploadedAt)}</span>
              <span><FileText size={14} style={{ verticalAlign: -2, marginRight: 4 }} />{formatSize(previewItem.size)}</span>
              <span><FolderOpen size={14} style={{ verticalAlign: -2, marginRight: 4 }} />{previewItem.category}</span>
            </div>
            <div className="preview-download">
              <a href={previewItem.dataUrl} download={previewItem.name} className="btn btn-primary"><Download size={16} /> 下载文件</a>
            </div>
            {previewItem.notes && (
              <div className="preview-notes"><MessageSquare size={16} style={{ color: 'var(--primary)', marginRight: 8, verticalAlign: -3 }} />{previewItem.notes}</div>
            )}
          </div>
        )}
      </Modal>

      {/* Empty */}
      {filtered.length === 0 && materials.length === 0 ? (
        <div className="card"><div className="empty" style={{ padding: 80 }}>
          <div style={{ color: 'var(--primary)', marginBottom: 16 }}><FolderOpen size={48} strokeWidth={1.2} /></div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>暂无物料</div>
          <div style={{ color: 'var(--text-muted)' }}>点击「上传物料」添加图片、视频或 PDF 文件</div>
        </div></div>
      ) : filtered.length === 0 ? (
        <div className="card"><div className="empty" style={{ padding: 60 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 12 }}><Image size={36} strokeWidth={1.2} /></div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>没有匹配的物料</div>
          <div style={{ color: 'var(--text-muted)' }}>试试调整筛选条件</div>
        </div></div>
      ) : viewMode === 'grid' ? (
        <>
          <div className="material-grid">
            {paginated.map(m => (
              <MaterialCard key={m.id} m={m} selected={selected.has(m.id)}
                onSelect={toggleSelect} onPreview={handlePreview} onDelete={handleDelete}
                onCategoryChange={handleCategoryChange} onNotesEdit={handleUpdateNotes} />
            ))}
          </div>
          {hasMore && <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>滚动加载更多...</div>}
        </>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={selectAll} /></th>
                <th>名称</th><th>类型</th><th>大小</th><th>分类</th><th>备注</th><th>日期</th><th style={{ width: 60 }}></th>
              </tr></thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} style={{ cursor: 'pointer' }} onClick={() => handlePreview(m)}>
                    <td onClick={e => e.stopPropagation()}><input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleSelect(m.id)} /></td>
                    <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      {m.type === 'image' ? <Image size={14} style={{ color: '#6366f1' }} /> : m.type === 'video' ? <Video size={14} style={{ color: '#f59e0b' }} /> : <FileText size={14} style={{ color: '#6b7280' }} />}
                      <span style={{ fontWeight: 500 }}>{m.name}</span></span></td>
                    <td>{typeBadge(m.type)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatSize(m.size)}</td>
                    <td><select className="material-category-select" value={m.category} onChange={e => handleCategoryChange(m.id, e.target.value)} onClick={e => e.stopPropagation()}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></td>
                    <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: 'var(--text-secondary)' }}>{m.notes || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(m.uploadedAt)}</td>
                    <td onClick={e => e.stopPropagation()}><button className="material-delete" style={{ position: 'static', opacity: 1 }} onClick={() => handleDelete(m.id)}><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
