import { Outlet, useNavigate } from 'react-router-dom'
import { Sun, Moon, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuthStore } from './stores/authStore'
import { ModeSwitcher } from './components/ModeSwitcher'

function Layout() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark'
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  }
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const openSettings = () => {
    navigate('/settings')
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">TianGong</h1>
          {user && (
            <span className="text-sm text-muted-foreground">{user.name}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={openSettings}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <ModeSwitcher />
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return <Layout />
}
