import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface AuthUser {
  username: string
  name: string
  role: string
}

interface AuthContextValue {
  user: AuthUser | null
  login: (username: string, password: string) => boolean
  logout: () => void
  updateAccount: (name: string, role: string) => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => false,
  logout: () => {},
  updateAccount: () => {},
})

// Default credentials
const DEFAULT_USERNAME = 'admin'
const DEFAULT_PASSWORD = 'admin123'

function getStoredCredentials() {
  try {
    const saved = localStorage.getItem('ops_auth_creds')
    if (saved) return JSON.parse(saved)
  } catch {}
  return { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD }
}

function getStoredUser(): AuthUser | null {
  try {
    const saved = localStorage.getItem('ops_auth_user')
    if (saved) return JSON.parse(saved)
  } catch {}
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)

  const login = (username: string, password: string): boolean => {
    const creds = getStoredCredentials()
    if (username === creds.username && password === creds.password) {
      const u: AuthUser = {
        username,
        name: creds.username === DEFAULT_USERNAME ? '李工' : username,
        role: '内容运营',
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
    <AuthContext.Provider value={{ user, login, logout, updateAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export { DEFAULT_USERNAME, DEFAULT_PASSWORD }
