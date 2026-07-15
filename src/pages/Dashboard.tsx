import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext"
import { Package, AlertCircle, CheckCircle2, Calendar, ArrowRight, Image, Video, FileText } from 'lucide-react'
import { getMaterials, getIssues, Material, Issue, formatDate } from '../lib/storage'

const iconProps = { size: 22, strokeWidth: 1.8 }

export default function Dashboard() {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<Material[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    getMaterials().then(setMaterials)
    getIssues().then(setIssues)
  }, [])

  const unresolvedIssues = issues.filter(i => !i.resolved)
  const recentMaterials = [...materials].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).slice(0, 5)
  const recentIssues = [...issues].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  const imageCount = materials.filter(m => m.type === 'image').length
  const videoCount = materials.filter(m => m.type === 'video').length
  const pdfCount = materials.filter(m => m.type === 'pdf').length

  return (
    <div>
      <h1 className="page-title">工作台概览</h1>
      <p className="page-subtitle">{user ? `欢迎回来，${user.name}` : "键盘产品内容运营工作台"}</p>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/materials')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Package {...iconProps} />
          </div>
          <div className="stat-info">
            <div className="stat-label">物料总数</div>
            <div className="stat-value">{materials.length}</div>
            <div className="stat-change" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#6366f1' }}><Image size={13} /> {imageCount}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#f59e0b' }}><Video size={13} /> {videoCount}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#6b7280' }}><FileText size={13} /> {pdfCount}</span>
            </div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/issues')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: '#fff1f2', color: '#f43f5e' }}>
            <AlertCircle {...iconProps} />
          </div>
          <div className="stat-info">
            <div className="stat-label">待解决问题</div>
            <div className="stat-value">{unresolvedIssues.length}</div>
            <div className="stat-change down">共记录 {issues.length} 个问题</div>
          </div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle2 {...iconProps} />
          </div>
          <div className="stat-info">
            <div className="stat-label">已解决问题</div>
            <div className="stat-value">{issues.filter(i => i.resolved).length}</div>
            <div className="stat-change up">{issues.length ? Math.round(issues.filter(i => i.resolved).length / issues.length * 100) : 0}% 解决率</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <Calendar {...iconProps} />
          </div>
          <div className="stat-info">
            <div className="stat-label">今日日期</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}</div>
            <div className="stat-change">键盘内容运营工作台</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent Materials */}
        <div className="card">
          <div className="card-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Package size={16} strokeWidth={1.8} /> 最近上传的物料</span>
            <button className="btn" style={{ fontSize: 13, padding: '5px 14px' }} onClick={() => navigate('/materials')}>查看全部 <ArrowRight size={14} /></button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentMaterials.length === 0 ? (
              <div className="empty" style={{ padding: 40, fontSize: 14 }}>暂无物料，去上传第一个吧</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>名称</th><th>类型</th><th>分类</th><th>上传时间</th></tr>
                </thead>
                <tbody>
                  {recentMaterials.map(m => (
                    <tr key={m.id}>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {m.type === 'image' ? <Image size={14} style={{ color: '#6366f1' }} /> :
                           m.type === 'video' ? <Video size={14} style={{ color: '#f59e0b' }} /> :
                           <FileText size={14} style={{ color: '#6b7280' }} />}
                          {m.name}
                        </span>
                      </td>
                      <td><span className={`badge ${m.type === 'image' ? 'badge-info' : m.type === 'video' ? 'badge-warning' : 'badge-neutral'}`}>{m.type === 'image' ? '图片' : m.type === 'video' ? '视频' : 'PDF'}</span></td>
                      <td>{m.category}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(m.uploadedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Issues */}
        <div className="card">
          <div className="card-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={16} strokeWidth={1.8} /> 最近添加的问题</span>
            <button className="btn" style={{ fontSize: 13, padding: '5px 14px' }} onClick={() => navigate('/issues')}>查看全部 <ArrowRight size={14} /></button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentIssues.length === 0 ? (
              <div className="empty" style={{ padding: 40, fontSize: 14 }}>暂无问题记录</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>标题</th><th>日期</th><th>状态</th></tr>
                </thead>
                <tbody>
                  {recentIssues.map(i => (
                    <tr key={i.id}>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {i.title}
                      </td>
                      <td>{i.date}</td>
                      <td>
                        <span className={`badge ${i.resolved ? 'badge-success' : 'badge-danger'}`}>
                          {i.resolved ? '已解决' : '未解决'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
