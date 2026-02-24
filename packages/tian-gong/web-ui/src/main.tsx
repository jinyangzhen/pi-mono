import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom'
import App from './App'
import SettingsPage from './components/SettingsPage'
import { lazy, Suspense } from 'react'
import { LoadingState } from './components/ErrorBoundary'
import './index.css'

const ChatApp = lazy(() => import('chat/ChatApp'))
const TerminalApp = lazy(() => import('terminal/TerminalApp'))

function ChatRoute() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session') || undefined
  return (
    <Suspense fallback={<LoadingState />}>
      <ChatApp initialSessionId={sessionId} />
    </Suspense>
  )
}

function TerminalRoute() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session') || undefined
  return (
    <Suspense fallback={<LoadingState />}>
      <TerminalApp initialSessionId={sessionId} />
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
