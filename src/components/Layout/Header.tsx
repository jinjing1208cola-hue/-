import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const pageTitles: Record<string, string> = {
  '/dashboard': '工作台概览',
  '/materials': '物料库',
  '/issues': '问题追踪',
  '/settings': '设置',
}

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation()
  const title = pageTitles[location.pathname] || '运营服务工作台'
  const { user } = useAuth()

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <span className="header-title">{title}</span>
      </div>
      <div className="header-right">
        <div className="header-avatar">{user?.name?.[0] || '李'}</div>
      </div>
    </header>
  )
}
