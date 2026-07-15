import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import Materials from './pages/Materials'
import Issues from './pages/Issues'
import Settings from './pages/Settings'
import Users from './pages/Users'
import Login from './pages/Login'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f8f6fc', color: '#7c3aed', fontSize: 16, fontWeight: 600,
      }}>
        加载中...
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="materials" element={<Materials />} />
        <Route path="issues" element={<Issues />} />
        <Route path="settings" element={<Settings />} />
        {user.isAdmin && <Route path="users" element={<Users />} />}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
