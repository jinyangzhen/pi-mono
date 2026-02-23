import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Terminal, MessageSquare, Settings, HelpCircle, Menu, X, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import SettingsDialog from './SettingsDialog'

type Theme = 'light' | 'dark'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>('dark')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const location = useLocation()

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const navItems = [
    { path: '/', icon: MessageSquare, label: 'Chat' },
    { path: '/terminal', icon: Terminal, label: 'Terminal' },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/chat'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-card border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo - Mono theme primary gray */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground">
              <span className="font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-foreground hidden sm:block">Tian-gong</span>
          </div>

          {/* Mode badge */}
          <span className="px-2 py-0.5 text-2xs font-medium bg-secondary text-secondary-foreground">
            {(new URLSearchParams(window.location.search).get('mode') === 'terminal' || location.pathname === '/terminal') ? 'Terminal Mode' : 'Chat Mode'}
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-1">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button onClick={() => setSettingsOpen(true)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-b border-border bg-card px-4 py-2 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 text-sm ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="flex gap-1 mt-2 pt-2 border-t border-border">
            <button 
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
              <HelpCircle className="w-4 h-4" />
              <span>Help</span>
            </button>
            <button onClick={() => setSettingsOpen(true)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      {/* Footer info bar */}
      <footer className="hidden lg:flex items-center justify-between px-4 py-1.5 text-2xs text-muted-foreground border-t border-border bg-card shrink-0">
        <div className="flex items-center gap-4">
          <span>Tian-gong Agent v0.1.0</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-primary"></span>
            Connected
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>Press <kbd className="px-1 py-0.5 bg-background text-2xs">?</kbd> for shortcuts</span>
        </div>
      </footer>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
