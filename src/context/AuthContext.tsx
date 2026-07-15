import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getUsers, addAppUser, generateId, type AppUser } from '../lib/storage'

interface AuthUser {
  id: string
  username: string
  name: string
  role: string
  isAdmin: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  updateAccount: (name: string, role: string) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: async () => false,
  logout: () => {},
  updateAccount: () => {},
  loading: true,
})

function getStoredUser(): AuthUser | null {
  try {
    const saved = localStorage.getItem('ops_auth_user')
    if (saved) return JSON.parse(saved)
  } catch {}
  return null
}

async function ensureDefaultAdmin() {
  const users = await getUsers()
  if (users.length === 0) {
    const admin: AppUser = {
      id: generateId(),
      username: 'admin',
      password: 'admin123',
      name: '管理员',
      role: '超级管理员',
      isAdmin: true,
      createdAt: new Date().toISOString(),
    }
    await addAppUser(admin)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ensureDefaultAdmin().then(() => setLoading(false))
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    const users = await getUsers()
    const found = users.find(u => u.username === username && u.password === password)
    if (found) {
      const u: AuthUser = {
        id: found.id,
        username: found.username,
        name: found.name,
        role: found.role,
        isAdmin: found.isAdmin,
      }
      setUser(u)
      localStorage.setItem('ops_auth_user', JSON.stringify(u))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('ops_auth_user')
  }

  const updateAccount = (name: string, role: string) => {
    if (!user) return
    const updated = { ...user, name, role }
    setUser(updated)
    localStorage.setItem('ops_auth_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateAccount, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
