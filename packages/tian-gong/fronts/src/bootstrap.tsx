import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom'
import App from './App'
import SettingsPage from './components/SettingsPage'
import { lazy, Suspense, useCallback } from 'react'
import { LoadingState } from './components/ErrorBoundary'
import './index.css'

const ChatApp = lazy(() => import('chat/ChatApp'))
const TerminalApp = lazy(() => import('terminal/TerminalApp'))

function ChatRoute() {
  const [searchParams, setSearchParams] = useSearchParams()
  const sessionId = searchParams.get('session') || undefined

  const handleSessionChange = useCallback((newSessionId: string) => {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('session', newSessionId)
    setSearchParams(newSearchParams, { replace: true })
  }, [searchParams, setSearchParams])

  // Initialize sessionId in URL if not present
  React.useEffect(() => {
    if (!searchParams.has('session')) {
      const storedSessionId = localStorage.getItem('tian_session_id')
      if (storedSessionId) {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('session', storedSessionId)
        setSearchParams(newSearchParams, { replace: true })
      }
    }
  }, [searchParams, setSearchParams])

  return (
    <Suspense fallback={<LoadingState />}>
      <ChatApp 
        initialSessionId={sessionId} 
        onSessionChange={handleSessionChange}
      />
    </Suspense>
  )
}

function TerminalRoute() {
  const [searchParams, setSearchParams] = useSearchParams()
  const sessionId = searchParams.get('session') || undefined

  const handleSessionChange = useCallback((newSessionId: string) => {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('session', newSessionId)
    setSearchParams(newSearchParams, { replace: true })
  }, [searchParams, setSearchParams])

  // Initialize sessionId in URL if not present
  React.useEffect(() => {
    if (!searchParams.has('session')) {
      const storedSessionId = localStorage.getItem('tian_session_id')
      if (storedSessionId) {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('session', storedSessionId)
        setSearchParams(newSearchParams, { replace: true })
      }
    }
  }, [searchParams, setSearchParams])

  return (
    <Suspense fallback={<LoadingState />}>
      <TerminalApp 
        initialSessionId={sessionId} 
        onSessionChange={handleSessionChange}
      />
    </Suspense>
  )
}

function SettingsRoute() {
  const navigate = useNavigate()
  return <SettingsPage onBack={() => navigate(-1)} />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="chat" element={<ChatRoute />} />
          <Route path="terminal" element={<TerminalRoute />} />
          <Route path="settings" element={<SettingsRoute />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
