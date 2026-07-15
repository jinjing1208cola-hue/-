import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Bug, Settings2, Users2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const iconProps = { size: 18, strokeWidth: 1.8 }

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const sections = [
    {
      title: '核心功能',
      items: [
        { path: '/dashboard', label: '工作台概览', icon: <LayoutDashboard {...iconProps} /> },
        { path: '/materials', label: '物料库', icon: <Package {...iconProps} /> },
        { path: '/issues', label: '问题追踪', icon: <Bug {...iconProps} /> },
      ],
    },
  ]

  if (user?.isAdmin) {
    sections.push({
      title: '管理',
      items: [
        { path: '/users', label: '用户管理', icon: <Users2 {...iconProps} /> },
      ],
    })
  }

  sections.push({
    title: '系统',
    items: [
      { path: '/settings', label: '设置', icon: <Settings2 {...iconProps} /> },
    ],
  })

  return (
    <>
      {open && <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 99
      }} onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 3v18"/><path d="M3 9h18"/>
          </svg>
          运营工作台
        </div>
        <nav className="sidebar-nav">
          {sections.map(section => (
            <div key={section.title}>
              <div className="sidebar-section">{section.title}</div>
              {section.items.map(item => (
                <button
                  key={item.path}
                  className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => { navigate(item.path); onClose() }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
