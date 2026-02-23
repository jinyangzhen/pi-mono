import { lazy, Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Sun, Moon, Settings } from 'lucide-react'
import { useAuthStore } from './stores/authStore'
import { useSessionStore, initializeSession } from './stores/sessionStore'
import { ModeSwitcher } from './components/ModeSwitcher'
import SettingsDialog from './components/SettingsDialog'
import { ErrorBoundary, ErrorState, LoadingState } from './components/ErrorBoundary'
import type { UiMode } from './stores/types'

const ChatApp = lazy(() => import('chat/ChatApp'))
const TerminalApp = lazy(() => import('terminal/TerminalApp'))

function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark'
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  }
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)
  const [settingsOpen, setSettingsOpen] = useState(false)
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
            onClick={() => setSettingsOpen(true)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <ModeSwitcher />
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { session } = useSessionStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})

  const urlMode = searchParams.get('mode') as 'chat' | 'terminal' | null
  const urlSession = searchParams.get('session')

  const isModeAllowed = (mode: UiMode): boolean => {
    if (!user) return false
    return user.allowedModes.includes(mode)
  }

  const getAllowedMode = (): UiMode => {
    if (!user) return 'chat'
    if (user.allowedModes.length === 0) return 'chat'
    return user.allowedModes[0]
  }

  useEffect(() => {
    if (!user || isInitialized) return

    let requestedMode = urlMode || user.preferences.uiMode
    
    if (!isModeAllowed(requestedMode)) {
      requestedMode = getAllowedMode()
      const newParams = new URLSearchParams(searchParams)
      newParams.set('mode', requestedMode)
      setSearchParams(newParams, { replace: true })
    }

    initializeSession(requestedMode, user.id)
    setIsInitialized(true)
  }, [user, urlMode, isInitialized, searchParams, setSearchParams])

  useEffect(() => {
    if (!session) return

    const newParams = new URLSearchParams(searchParams)
    if (session.id !== urlSession) {
      newParams.set('session', session.id)
    }
    if (session.mode !== urlMode) {
      newParams.set('mode', session.mode)
    }

    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams, { replace: true })
    }
  }, [session, urlSession, urlMode, searchParams, setSearchParams])

  useEffect(() => {
    fetch('/api/me/api-keys')
      .then(r => r.json())
      .then(data => setApiKeys(data.apiKeys || {}))
      .catch(console.error)
  }, [])

  const currentMode = urlMode || session?.mode || user?.preferences.uiMode || 'chat'

  if (!isModeAllowed(currentMode)) {
    const allowedMode = getAllowedMode()
    if (currentMode !== allowedMode) {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('mode', allowedMode)
      setSearchParams(newParams, { replace: true })
    }
  }

  const handleSessionChange = (sessionId: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('session', sessionId)
    setSearchParams(newParams, { replace: true })
  }

  if (!user) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <ErrorBoundary fallback={<ErrorState title="Failed to load app" message="The requested app could not be loaded. This may be a network issue or the remote server may be down." onRetry={() => window.location.reload()} />}>
        <Suspense fallback={<LoadingState />}>
          {currentMode === 'terminal' ? (
            <TerminalApp 
              initialSessionId={session?.id}
              onSessionChange={handleSessionChange}
              apiKeys={apiKeys}
            />
          ) : (
            <ChatApp 
              initialSessionId={session?.id}
              onSessionChange={handleSessionChange}
              apiKeys={apiKeys}
            />
          )}
        </Suspense>
      </ErrorBoundary>
    </Layout>
  )
}
