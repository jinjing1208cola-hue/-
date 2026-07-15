import { useState, useEffect } from 'react'
import { Users2, Plus, Trash2, Shield, User, AlertCircle, Check } from 'lucide-react'
import { getUsers, addAppUser, deleteAppUser, updateAppUser, generateId, type AppUser } from '../lib/storage'
import Modal from '../components/common/Modal'

export default function Users() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [editUser, setEditUser] = useState<AppUser | null>(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')

  // Form
  const [formUsername, setFormUsername] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formName, setFormName] = useState('')
  const [formRole, setFormRole] = useState('运营')
  const [formIsAdmin, setFormIsAdmin] = useState(false)

  useEffect(() => { getUsers().then(setUsers) }, [])

  const resetForm = () => {
    setFormUsername(''); setFormPassword(''); setFormName('')
    setFormRole('运营'); setFormIsAdmin(false)
    setError('')
  }

  const handleAdd = async () => {
    setError('')
    if (!formUsername.trim() || !formPassword.trim() || !formName.trim()) {
      setError('请填写所有必填字段')
      return
    }
    if (formPassword.length < 4) {
      setError('密码至少 4 位')
      return
    }
    if (users.find(u => u.username === formUsername.trim())) {
      setError('账号已存在')
      return
    }

    const newUser: AppUser = {
      id: generateId(),
      username: formUsername.trim(),
      password: formPassword,
      name: formName.trim(),
      role: formRole.trim() || '运营',
      isAdmin: formIsAdmin,
      createdAt: new Date().toISOString(),
    }
    await addAppUser(newUser)
    setUsers(prev => [...prev, newUser])
    setAddOpen(false)
    resetForm()
    setDone('账号创建成功')
    setTimeout(() => setDone(''), 2000)
  }

  const handleDelete = async (id: string) => {
    await deleteAppUser(id)
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  const handleToggleAdmin = async (user: AppUser) => {
    if (users.filter(u => u.isAdmin).length === 1 && user.isAdmin) {
      setError('至少保留一个管理员')
      setTimeout(() => setError(''), 2000)
      return
    }
    const updated = { ...user, isAdmin: !user.isAdmin }
    await updateAppUser(updated)
    setUsers(prev => prev.map(u => u.id === user.id ? updated : u))
  }

  const openEdit = (u: AppUser) => {
    setEditUser(u)
    setFormUsername(u.username)
    setFormPassword('')
    setFormName(u.name)
    setFormRole(u.role)
    setFormIsAdmin(u.isAdmin)
    setError('')
  }

  const handleEdit = async () => {
    if (!editUser) return
    setError('')
    if (!formName.trim()) { setError('请填写姓名'); return }

    const updated = { ...editUser, name: formName.trim(), role: formRole.trim() || '运营', isAdmin: formIsAdmin }

    if (formPassword && formPassword.length >= 4) {
      updated.password = formPassword
    }

    if (!updated.isAdmin && users.filter(u => u.isAdmin).length === 1 && editUser.isAdmin) {
      setError('至少保留一个管理员')
      return
    }

    await updateAppUser(updated)
    setUsers(prev => prev.map(u => u.id === editUser.id ? updated : u))
    setEditUser(null)
    resetForm()
    setDone('修改成功')
    setTimeout(() => setDone(''), 2000)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users2 size={26} strokeWidth={1.8} style={{ color: 'var(--primary)' }} />
            用户管理
          </h1>
          <p className="page-subtitle" style={{ marginTop: 4, marginBottom: 0 }}>管理系统账号，创建或删除用户</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setAddOpen(true) }}>
          <Plus size={16} /> 添加用户
        </button>
      </div>

      {done && (
        <div style={{
          padding: '10px 16px', background: 'var(--success-light)', border: '1px solid #a7f3d0',
          borderRadius: 'var(--radius)', color: '#059669', fontSize: 14, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Check size={16} /> {done}
        </div>
      )}
      {error && (
        <div style={{
          padding: '10px 16px', background: 'var(--danger-light)', border: '1px solid #fecdd3',
          borderRadius: 'var(--radius)', color: '#e11d48', fontSize: 14, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); resetForm() }} title="添加用户" width={480}>
        <div className="form-group">
          <label className="form-label">账号 *</label>
          <input className="form-input" value={formUsername} onChange={e => setFormUsername(e.target.value)}
            placeholder="登录用的用户名" autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">密码 *</label>
          <input className="form-input" type="password" value={formPassword}
            onChange={e => setFormPassword(e.target.value)} placeholder="至少 4 位" />
        </div>
        <div className="form-group">
          <label className="form-label">姓名 *</label>
          <input className="form-input" value={formName} onChange={e => setFormName(e.target.value)}
            placeholder="显示名称" />
        </div>
        <div className="form-group">
          <label className="form-label">角色</label>
          <input className="form-input" value={formRole} onChange={e => setFormRole(e.target.value)}
            placeholder="如：内容运营、技术支持" />
        </div>
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={formIsAdmin} onChange={e => setFormIsAdmin(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
            设为管理员
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn" onClick={() => { setAddOpen(false); resetForm() }}>取消</button>
          <button className="btn btn-primary" onClick={handleAdd}>确认添加</button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editUser} onClose={() => { setEditUser(null); resetForm() }} title="编辑用户" width={480}>
        <div className="form-group">
          <label className="form-label">账号</label>
          <input className="form-input" value={formUsername} disabled
            style={{ opacity: .6 }} />
        </div>
        <div className="form-group">
          <label className="form-label">新密码（留空不修改）</label>
          <input className="form-input" type="password" value={formPassword}
            onChange={e => setFormPassword(e.target.value)} placeholder="至少 4 位" />
        </div>
        <div className="form-group">
          <label className="form-label">姓名 *</label>
          <input className="form-input" value={formName} onChange={e => setFormName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">角色</label>
          <input className="form-input" value={formRole} onChange={e => setFormRole(e.target.value)} />
        </div>
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={formIsAdmin} onChange={e => setFormIsAdmin(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
            设为管理员
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn" onClick={() => { setEditUser(null); resetForm() }}>取消</button>
          <button className="btn btn-primary" onClick={handleEdit}>保存修改</button>
        </div>
      </Modal>

      {/* User List */}
      <div className="card">
        <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>用户</th><th>账号</th><th>角色</th><th>权限</th><th>创建时间</th><th style={{ width: 120 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const colors = ['#7c3aed', '#10b981', '#f59e0b', '#f43f5e', '#6366f1', '#ec4899']
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar" style={{ background: colors[i % colors.length] }}>
                          {u.name[0]}
                        </div>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{u.username}</td>
                    <td>{u.role}</td>
                    <td>
                      <span className={`badge ${u.isAdmin ? 'badge-warning' : 'badge-neutral'}`}
                        style={{ cursor: 'pointer' }} onClick={() => handleToggleAdmin(u)}>
                        {u.isAdmin ? <><Shield size={11} style={{ verticalAlign: -1 }} /> 管理员</> : <><User size={11} style={{ verticalAlign: -1 }} /> 普通用户</>}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(u.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn" style={{ fontSize: 12, padding: '4px 12px' }}
                          onClick={() => openEdit(u)}>编辑</button>
                        <button className="btn" style={{ fontSize: 12, padding: '4px 10px', color: 'var(--danger)' }}
                          onClick={() => handleDelete(u.id)}
                          title="删除"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
