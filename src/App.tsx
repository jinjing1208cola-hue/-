import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import Materials from './pages/Materials'
import Issues from './pages/Issues'
import Settings from './pages/Settings'
import Login from './pages/Login'

export default function App() {
  const { user } = useAuth()

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
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
