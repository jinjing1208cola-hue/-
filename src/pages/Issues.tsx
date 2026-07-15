import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Bug, Plus, CheckCircle2, Circle, Trash2, Search,
  Paperclip, Image, Video, X
} from 'lucide-react'
import Modal from '../components/common/Modal'
import {
  Issue, Attachment, getIssues, addIssue, updateIssue, deleteIssue,
  generateId, formatDate, formatSize,
} from '../lib/storage'

const TAG_OPTIONS = ['硬件', '软件', '驱动', '连接', '按键', '灯光', '宏设置', '兼容性', '其他']

export default function Issues() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [filter, setFilter] = useState<'全部' | '未解决' | '已解决'>('全部')
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10))
  const [formTags, setFormTags] = useState<string[]>([])
  const [formAttachments, setFormAttachments] = useState<Attachment[]>([])
  const [uploadingFile, setUploadingFile] = useState(false)

  // Preview
  const [previewAttach, setPreviewAttach] = useState<Attachment | null>(null)
  const attachInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { getIssues().then(setIssues) }, [])

  const filtered = useMemo(() => {
    return issues
      .filter(i => {
        if (filter === '未解决') return !i.resolved
        if (filter === '已解决') return i.resolved
        return true
      })
      .filter(i => {
        if (!search) return true
        const q = search.toLowerCase()
        return i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) ||
          i.tags.some(t => t.toLowerCase().includes(q))
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [issues, filter, search])

  const stats = useMemo(() => ({
    total: issues.length,
    unresolved: issues.filter(i => !i.resolved).length,
    resolved: issues.filter(i => i.resolved).length,
  }), [issues])

  const handleAttachFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files)
    setUploadingFile(true)
    const newAttachments: Attachment[] = []

    for (const file of arr) {
      let type: Attachment['type']
      if (file.type.startsWith('image/')) type = 'image'
      else if (file.type.startsWith('video/')) type = 'video'
      else continue

      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      newAttachments.push({
        id: generateId(),
        name: file.name,
        type,
        dataUrl,
        size: file.size,
      })
    }

    setFormAttachments(prev => [...prev, ...newAttachments])
    setUploadingFile(false)
  }

  const removeFormAttachment = (id: string) => {
    setFormAttachments(prev => prev.filter(a => a.id !== id))
  }

  const handleAdd = async () => {
    if (!formTitle.trim()) return
    const issue: Issue = {
      id: generateId(),
      title: formTitle.trim(),
      description: formDesc.trim(),
      date: formDate,
      resolved: false,
      tags: formTags,
      attachments: formAttachments,
      createdAt: new Date().toISOString(),
    }
    await addIssue(issue)
    setIssues(prev => [issue, ...prev])
    setFormTitle(''); setFormDesc(''); setFormTags([])
    setFormAttachments([])
    setFormDate(new Date().toISOString().slice(0, 10))
    setAddOpen(false)
  }

  const handleToggleResolved = async (issue: Issue) => {
    const updated = { ...issue, resolved: !issue.resolved, resolvedAt: !issue.resolved ? new Date().toISOString() : undefined }
    await updateIssue(updated)
    setIssues(prev => prev.map(i => i.id === issue.id ? updated : i))
  }

  const handleDelete = async (id: string) => {
    await deleteIssue(id)
    setIssues(prev => prev.filter(i => i.id !== id))
  }

  const toggleTag = (tag: string) => {
    setFormTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bug size={26} strokeWidth={1.8} style={{ color: 'var(--primary)' }} />
            问题追踪
          </h1>
          <p className="page-subtitle" style={{ marginTop: 4, marginBottom: 0 }}>记录用户反馈的问题，跟踪解决进度</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
          <Plus size={16} /> 添加问题
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div className="stat-card" style={{ flex: 1, padding: '14px 20px', borderLeftColor: '#7c3aed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="stat-icon" style={{ width: 40, height: 40, background: '#f5f3ff', color: '#7c3aed' }}>
              <Bug size={18} strokeWidth={1.8} />
            </div>
            <div>
              <div className="stat-label">全部问题</div>
              <div className="stat-value" style={{ fontSize: 24 }}>{stats.total}</div>
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ flex: 1, padding: '14px 20px', borderLeftColor: '#f43f5e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="stat-icon" style={{ width: 40, height: 40, background: '#fff1f2', color: '#f43f5e' }}>
              <Circle size={18} strokeWidth={1.8} />
            </div>
            <div>
              <div className="stat-label">未解决</div>
              <div className="stat-value" style={{ fontSize: 24, color: 'var(--danger)' }}>{stats.unresolved}</div>
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ flex: 1, padding: '14px 20px', borderLeftColor: '#10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="stat-icon" style={{ width: 40, height: 40, background: '#ecfdf5', color: '#10b981' }}>
              <CheckCircle2 size={18} strokeWidth={1.8} />
            </div>
            <div>
              <div className="stat-label">已解决</div>
              <div className="stat-value" style={{ fontSize: 24, color: 'var(--success)' }}>{stats.resolved}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        {['全部', '未解决', '已解决'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : ''}`}
            onClick={() => setFilter(f as typeof filter)}>{f}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input className="search-input" placeholder="搜索问题..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
        </div>
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="添加问题" width={560}>
        <div className="form-group">
          <label className="form-label">问题标题 *</label>
          <input className="form-input" value={formTitle} onChange={e => setFormTitle(e.target.value)}
            placeholder="例如：键盘灯光无法同步" autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">问题描述</label>
          <textarea className="form-textarea" value={formDesc} onChange={e => setFormDesc(e.target.value)}
            placeholder="详细描述用户遇到的问题..." rows={4} />
        </div>
        <div className="form-group">
          <label className="form-label">日期 *</label>
          <input type="date" className="form-input" value={formDate} onChange={e => setFormDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">标签</label>
          <div className="tag-select">
            {TAG_OPTIONS.map(tag => (
              <button key={tag} className={`tag-chip ${formTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}>{tag}</button>
            ))}
          </div>
        </div>

        {/* Attachments */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Paperclip size={14} /> 附件（截图/视频）
          </label>

          {/* Attachment thumbnails */}
          {formAttachments.length > 0 && (
            <div className="attach-preview-grid">
              {formAttachments.map(a => (
                <div key={a.id} className="attach-preview-item">
                  {a.type === 'image' ? (
                    <img src={a.dataUrl} alt={a.name} />
                  ) : (
                    <div className="attach-video-thumb">
                      <video src={a.dataUrl} muted />
                      <div className="play-overlay">▶</div>
                    </div>
                  )}
                  <button className="attach-remove" onClick={() => removeFormAttachment(a.id)}>
                    <X size={12} />
                  </button>
                  <div className="attach-name" title={a.name}>{a.name}</div>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          <button className="btn" onClick={() => attachInputRef.current?.click()}
            style={{ marginTop: formAttachments.length > 0 ? 8 : 0, width: '100%', justifyContent: 'center' }}
            disabled={uploadingFile}>
            <Paperclip size={14} />
            {uploadingFile ? '上传中...' : '添加附件（图片/视频）'}
          </button>
          <input ref={attachInputRef} type="file" multiple accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={e => { if (e.target.files?.length) handleAttachFiles(e.target.files); e.target.value = '' }} />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn" onClick={() => { setAddOpen(false); setFormAttachments([]) }}>取消</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={!formTitle.trim()}>确认添加</button>
        </div>
      </Modal>

      {/* Attachment Preview Modal */}
      <Modal open={!!previewAttach} onClose={() => setPreviewAttach(null)}
        title={previewAttach?.name || ''} width={800}>
        {previewAttach && (
          <div className="preview-content">
            {previewAttach.type === 'image' ? (
              <img src={previewAttach.dataUrl} alt={previewAttach.name} className="preview-media" />
            ) : (
              <video src={previewAttach.dataUrl} controls className="preview-media" />
            )}
            <div className="preview-meta">
              <span>{previewAttach.name}</span>
              <span>{formatSize(previewAttach.size)}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Issues list */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty" style={{ padding: 80 }}>
            <div style={{ color: 'var(--primary)', marginBottom: 16 }}>
              {filter === '全部' ? <Bug size={48} strokeWidth={1.2} /> :
               filter === '未解决' ? <Circle size={48} strokeWidth={1.2} /> :
               <CheckCircle2 size={48} strokeWidth={1.2} />}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              {filter === '全部' ? '暂无记录的问题' : filter === '未解决' ? '所有问题已解决！' : '暂无已解决的问题'}
            </div>
            <div style={{ color: 'var(--text-muted)' }}>点击「添加问题」记录新的用户反馈</div>
          </div>
        </div>
      ) : (
        <div className="issue-list">
          {filtered.map(issue => (
            <div key={issue.id} className={`issue-item ${issue.resolved ? 'resolved' : ''}`}>
              <div className="issue-left">
                <button className={`issue-status-btn ${issue.resolved ? 'resolved' : ''}`}
                  onClick={() => handleToggleResolved(issue)}
                  title={issue.resolved ? '标记为未解决' : '标记为已解决'}>
                  {issue.resolved
                    ? <CheckCircle2 size={22} strokeWidth={1.8} style={{ color: '#10b981' }} />
                    : <Circle size={22} strokeWidth={1.8} style={{ color: '#d1d5db' }} />}
                </button>
              </div>
              <div className="issue-main">
                <div className="issue-title">{issue.title}</div>
                {issue.description && (
                  <div className="issue-desc">{issue.description}</div>
                )}

                {/* Attachments */}
                {issue.attachments.length > 0 && (
                  <div className="issue-attachments">
                    {issue.attachments.map(a => (
                      <div key={a.id} className="issue-attach-thumb"
                        onClick={() => setPreviewAttach(a)}
                        title={a.name}>
                        {a.type === 'image' ? (
                          <img src={a.dataUrl} alt={a.name} />
                        ) : (
                          <div className="issue-attach-video">
                            <video src={a.dataUrl} muted />
                            <div className="play-overlay" style={{ width: 28, height: 28, fontSize: 10 }}>▶</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="issue-meta">
                  <span className="issue-date">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 2 }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {issue.date}
                  </span>
                  {issue.tags.length > 0 && (
                    <span className="issue-tags">
                      {issue.tags.map(t => <span key={t} className="issue-tag">{t}</span>)}
                    </span>
                  )}
                  {issue.attachments.length > 0 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Paperclip size={11} /> {issue.attachments.length}
                    </span>
                  )}
                  <span className={`issue-status ${issue.resolved ? 'resolved' : 'unresolved'}`}>
                    {issue.resolved
                      ? <><CheckCircle2 size={12} strokeWidth={2} style={{ verticalAlign: -2 }} /> 已解决{issue.resolvedAt ? ` · ${formatDate(issue.resolvedAt)}` : ''}</>
                      : <><Circle size={12} strokeWidth={2} style={{ verticalAlign: -2 }} /> 未解决</>}
                  </span>
                </div>
              </div>
              <button className="issue-delete" onClick={() => handleDelete(issue.id)} title="删除">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
