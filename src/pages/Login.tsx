import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Keyboard, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const { theme } = useTheme()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('请输入账号和密码')
      return
    }
    setLoading(true)
    // Small delay for UX
    setTimeout(() => {
      const ok = login(username.trim(), password)
      if (!ok) {
        setError('账号或密码错误')
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `radial-gradient(ellipse 60% 50% at 50% -10%, ${theme.primary}15 0%, ${theme.bg} 70%)`,
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)',
        padding: 40,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: 'var(--radius)',
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.primary}cc)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: `0 8px 24px ${theme.primary}30`,
          }}>
            <Keyboard size={26} style={{ color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.3px', marginBottom: 4 }}>
            运营工作台
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            键盘产品内容运营管理系统
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'var(--danger-light)',
              border: '1px solid #fecdd3',
              borderRadius: 'var(--radius-sm)',
              color: '#e11d48',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
            }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">账号</label>
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="请输入账号"
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">密码</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="请输入密码"
                style={{ paddingRight: 44 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  border: 'none', background: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 6,
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 24px',
              fontSize: 15,
              justifyContent: 'center',
            }}
          >
            {loading ? '登录中...' : '登 录'}
          </button>

          <p style={{
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--text-muted)',
            marginTop: 20,
          }}>
            默认账号: admin / admin123
          </p>
        </form>
      </div>
    </div>
  )
}
