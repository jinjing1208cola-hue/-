import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Materials = lazy(() => import('./pages/Materials'))
const Issues = lazy(() => import('./pages/Issues'))
const Settings = lazy(() => import('./pages/Settings'))
const Users = lazy(() => import('./pages/Users'))

function PageLoader() {
  return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>加载中...</div>
}

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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  )
}
