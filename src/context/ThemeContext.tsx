import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface ThemeColors {
  name: string
  label: string
  primary: string
  primaryLight: string
  sidebarBg: string
  sidebarBorder: string
  sidebarActiveBg: string
  sidebarActiveText: string
  bg: string
  border: string
  borderStrong: string
}

export const themes: ThemeColors[] = [
  {
    name: 'purple', label: '淡紫',
    primary: '#7c3aed', primaryLight: '#f5f3ff',
    sidebarBg: '#faf7fd', sidebarBorder: '#ede4f7',
    sidebarActiveBg: '#ede4f7', sidebarActiveText: '#7c3aed',
    bg: '#f8f6fc', border: '#eeeaf5', borderStrong: '#e1daee',
  },
  {
    name: 'blue', label: '天蓝',
    primary: '#3b82f6', primaryLight: '#eff6ff',
    sidebarBg: '#f5f9ff', sidebarBorder: '#dbeafe',
    sidebarActiveBg: '#dbeafe', sidebarActiveText: '#3b82f6',
    bg: '#f6f9fe', border: '#e8f0fd', borderStrong: '#bfdbfe',
  },
  {
    name: 'green', label: '薄荷',
    primary: '#10b981', primaryLight: '#ecfdf5',
    sidebarBg: '#f6fdf9', sidebarBorder: '#d1fae5',
    sidebarActiveBg: '#d1fae5', sidebarActiveText: '#059669',
    bg: '#f8fdfa', border: '#e6f9f0', borderStrong: '#a7f3d0',
  },
  {
    name: 'rose', label: '玫瑰',
    primary: '#f43f5e', primaryLight: '#fff1f2',
    sidebarBg: '#fff7f8', sidebarBorder: '#fecdd3',
    sidebarActiveBg: '#fecdd3', sidebarActiveText: '#e11d48',
    bg: '#fefafb', border: '#fde8ec', borderStrong: '#fda4af',
  },
  {
    name: 'amber', label: '暖阳',
    primary: '#f59e0b', primaryLight: '#fffbeb',
    sidebarBg: '#fffdf8', sidebarBorder: '#fde68a',
    sidebarActiveBg: '#fef3c7', sidebarActiveText: '#d97706',
    bg: '#fffdf7', border: '#fef5e0', borderStrong: '#fcd34d',
  },
  {
    name: 'dark', label: '暗夜',
    primary: '#a78bfa', primaryLight: '#2d2450',
    sidebarBg: '#1a1a2e', sidebarBorder: '#2d2d44',
    sidebarActiveBg: '#2d2450', sidebarActiveText: '#c4b5fd',
    bg: '#12121f', border: '#2d2d44', borderStrong: '#3d3d54',
  },
]

const defaultTheme = themes[0]

interface ThemeContextValue {
  theme: ThemeColors
  setTheme: (theme: ThemeColors) => void
  allThemes: ThemeColors[]
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  setTheme: () => {},
  allThemes: themes,
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeColors>(() => {
    try {
      const saved = localStorage.getItem('ops_theme')
      if (saved) {
        const found = themes.find(t => t.name === saved)
        if (found) return found
      }
    } catch {}
    return defaultTheme
  })

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--primary', theme.primary)
    root.style.setProperty('--primary-light', theme.primaryLight)
    root.style.setProperty('--sidebar-bg', theme.sidebarBg)
    root.style.setProperty('--sidebar-border', theme.sidebarBorder)
    root.style.setProperty('--sidebar-active-bg', theme.sidebarActiveBg)
    root.style.setProperty('--sidebar-active-text', theme.sidebarActiveText)
    root.style.setProperty('--bg', theme.bg)
    root.style.setProperty('--border', theme.border)
    root.style.setProperty('--border-strong', theme.borderStrong)

    const isDark = theme.name === 'dark'
    root.style.setProperty('--text', isDark ? '#e2e8f0' : '#1a1a2e')
    root.style.setProperty('--text-secondary', isDark ? '#94a3b8' : '#6b7280')
    root.style.setProperty('--text-muted', isDark ? '#64748b' : '#9ca3af')
    root.style.setProperty('--bg-card', isDark ? '#1e1e32' : '#ffffff')
    root.style.setProperty('--sidebar-text', isDark ? '#94a3b8' : '#4b5563')
    root.style.setProperty('--sidebar-hover', isDark ? '#2d2d44' : '#f9fafb')

    localStorage.setItem('ops_theme', theme.name)
  }, [theme])

  const setTheme = (t: ThemeColors) => setThemeState(t)

  return (
    <ThemeContext.Provider value={{ theme, setTheme, allThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
