import { useState } from 'react'
import { Settings2, User, Palette, Check, LogOut, Key, AlertCircle } from 'lucide-react'
import { useTheme, themes } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, logout, updateAccount } = useAuth()
  const { theme, setTheme } = useTheme()

  // Account editing
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(user?.name || '')
  const [draftRole, setDraftRole] = useState(user?.role || '')
  const [saved, setSaved] = useState(false)

  // Password change
  const [pwOpen, setPwOpen] = useState(false)
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwDone, setPwDone] = useState(false)

  const handleSaveAccount = () => {
    if (!draftName.trim()) return
    updateAccount(draftName.trim(), draftRole.trim() || '内容运营')
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChangePassword = () => {
    setPwError('')
    if (!oldPw || !newPw || !confirmPw) {
      setPwError('请填写所有密码字段')
      return
    }
    if (newPw.length < 4) {
      setPwError('新密码至少 4 位')
      return
    }
    if (newPw !== confirmPw) {
      setPwError('两次输入的新密码不一致')
      return
    }

    const creds = (() => {
      try {
        const saved = localStorage.getItem('ops_auth_creds')
        if (saved) return JSON.parse(saved)
      } catch {}
      return { username: 'admin', password: 'admin123' }
    })()

    if (oldPw !== creds.password) {
      setPwError('原密码错误')
      return
    }

    creds.password = newPw
    localStorage.setItem('ops_auth_creds', JSON.stringify(creds))
    setPwDone(true)
    setOldPw(''); setNewPw(''); setConfirmPw('')
    setTimeout(() => { setPwOpen(false); setPwDone(false) }, 1500)
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Settings2 size={26} strokeWidth={1.8} style={{ color: 'var(--primary)' }} />
        设置
      </h1>
      <p className="page-subtitle" style={{ marginTop: 4 }}>自定义工作台外观与账号信息</p>

      {/* Account Section */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={16} strokeWidth={1.8} />
          账号信息
        </div>
        <div className="card-body">
          {!editing ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 700,
                  boxShadow: `0 4px 16px ${theme.primary}40`,
                }}>
                  {user?.name?.[0] || '?'}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{user?.name}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{user?.role}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12, fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 50 }}>账号</span>
                  <span style={{ fontWeight: 500 }}>{user?.username}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 50 }}>姓名</span>
                  <span style={{ fontWeight: 500 }}>{user?.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 50 }}>角色</span>
                  <span style={{ fontWeight: 500 }}>{user?.role}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => { setDraftName(user?.name || ''); setDraftRole(user?.role || ''); setEditing(true) }}>
                  编辑信息
                </button>
                <button className="btn" onClick={() => setPwOpen(true)}>
                  <Key size={14} /> 修改密码
                </button>
              </div>

              {/* Password change inline */}
              {pwOpen && (
                <div style={{
                  marginTop: 20, padding: 20,
                  background: '#faf9f7', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                }}>
                  <h4 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600 }}>修改密码</h4>
                  {pwError && (
                    <div style={{
                      padding: '8px 12px', background: 'var(--danger-light)',
                      border: '1px solid #fecdd3', borderRadius: 'var(--radius-sm)',
                      color: '#e11d48', fontSize: 13, display: 'flex', alignItems: 'center',
                      gap: 6, marginBottom: 12,
                    }}>
                      <AlertCircle size={14} />{pwError}
                    </div>
                  )}
                  {pwDone && (
                    <div style={{
                      padding: '8px 12px', background: 'var(--success-light)',
                      border: '1px solid #a7f3d0', borderRadius: 'var(--radius-sm)',
                      color: '#059669', fontSize: 13, display: 'flex', alignItems: 'center',
                      gap: 6, marginBottom: 12,
                    }}>
                      <Check size={14} />密码修改成功
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">原密码</label>
                    <input className="form-input" type="password" value={oldPw}
                      onChange={e => setOldPw(e.target.value)} placeholder="输入原密码" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">新密码</label>
                    <input className="form-input" type="password" value={newPw}
                      onChange={e => setNewPw(e.target.value)} placeholder="输入新密码（至少4位）" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">确认新密码</label>
                    <input className="form-input" type="password" value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)} placeholder="再次输入新密码" />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={handleChangePassword}>确认修改</button>
                    <button className="btn" onClick={() => { setPwOpen(false); setPwError('') }}>取消</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="form-group">
                <label className="form-label">姓名</label>
                <input className="form-input" value={draftName}
                  onChange={e => setDraftName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">角色</label>
                <input className="form-input" value={draftRole}
                  onChange={e => setDraftRole(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={handleSaveAccount}>
                  {saved ? <><Check size={14} /> 已保存</> : '保存'}
                </button>
                <button className="btn" onClick={() => setEditing(false)}>取消</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Theme Section */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Palette size={16} strokeWidth={1.8} />
          侧边栏配色
        </div>
        <div className="card-body">
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
            选择你喜欢的侧边栏主题配色，设置即时生效并自动保存
          </p>
          <div className="theme-grid">
            {themes.map(t => {
              const active = theme.name === t.name
              return (
                <button
                  key={t.name}
                  className={`theme-card ${active ? 'active' : ''}`}
                  onClick={() => setTheme(t)}
                  style={{
                    border: active ? `2px solid ${t.primary}` : `1px solid ${t.borderStrong}`,
                  }}
                >
                  <div style={{ display: 'flex', gap: 4, height: 40, marginBottom: 8 }}>
                    <div style={{
                      width: 28, borderRadius: '4px 0 0 4px',
                      background: t.sidebarBg, border: `1px solid ${t.sidebarBorder}`,
                    }} />
                    <div style={{ flex: 1, borderRadius: '0 4px 4px 0', background: t.bg }}>
                      <div style={{
                        height: 6, margin: '6px 8px 3px', borderRadius: 3,
                        background: t.primary, opacity: .7, width: '40%',
                      }} />
                      <div style={{
                        height: 4, margin: '3px 8px', borderRadius: 2,
                        background: '#e2e8f0',
                      }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</span>
                    {active && <Check size={16} style={{ color: t.primary }} />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        className="btn"
        onClick={logout}
        style={{
          width: '100%', justifyContent: 'center',
          color: 'var(--danger)', borderColor: '#fecdd3',
          padding: '12px 24px', fontSize: 15,
        }}
      >
        <LogOut size={16} /> 退出登录
      </button>
    </div>
  )
}
