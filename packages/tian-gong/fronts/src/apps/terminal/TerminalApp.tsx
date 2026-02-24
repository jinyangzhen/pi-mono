import { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { SearchAddon } from '@xterm/addon-search'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { RefreshCw, Download, Maximize2, Minimize2, Plus } from 'lucide-react'
import '@xterm/xterm/css/xterm.css'
import { AppProps } from '../../shared/types'

interface TerminalSession {
  id: string
  ws: WebSocket | null
  term: XTerm | null
  fitAddon: FitAddon | null
}



export function TerminalApp({ initialSessionId, onSessionChange }: AppProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const [session, setSession] = useState<TerminalSession | null>(null)
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const reconnectAttempts = useRef(0)
  const MAX_RECONNECT = 5
  const sessionIdRef = useRef<string | null>(initialSessionId || null)

  const getUserId = useCallback(() => {
    return localStorage.getItem('tian_user_id') || 'demo-user'
  }, [])

  const connectWebSocket = useCallback(() => {
    if (!terminalRef.current) return

    let currentSession = session
    if (!currentSession) {
      const term = new XTerm({
        fontFamily: '"JetBrains Mono", "SF Mono", "Cascadia Code", "Fira Code", Consolas, monospace',
        fontSize: 14,
        lineHeight: 1.2,
        theme: {
          background: '#09090b',
          foreground: '#e4e4e7',
          cursor: '#e4e4e7',
          cursorAccent: '#09090b',
          black: '#09090b',
          red: '#ef4444',
          green: '#22c55e',
          yellow: '#eab308',
          blue: '#3b82f6',
          magenta: '#a855f7',
          cyan: '#06b6d4',
          white: '#e4e4e7',
          brightBlack: '#52525b',
          brightRed: '#f87171',
          brightGreen: '#4ade80',
          brightYellow: '#facc15',
          brightBlue: '#60a5fa',
          brightMagenta: '#c084fc',
          brightCyan: '#22d3ee',
          brightWhite: '#ffffff',
        },
        cursorBlink: true,
        cursorStyle: 'block' as const,
        scrollback: 10000,
        allowProposedApi: true,
      })

      const fitAddon = new FitAddon()
      const searchAddon = new SearchAddon()
      const webLinksAddon = new WebLinksAddon()

      term.loadAddon(fitAddon)
      term.loadAddon(searchAddon)
      term.loadAddon(webLinksAddon)

      term.open(terminalRef.current)
      fitAddon.fit()

      currentSession = {
        id: '',
        ws: null,
        term,
        fitAddon,
      }
      setSession(currentSession)
    }

    const currentTerm = currentSession.term!
    const currentFitAddon = currentSession.fitAddon!

    let sessionRef = currentSession

    setStatus('connecting')

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const storedSession = localStorage.getItem('tian_session_id')
    const newSessionId = storedSession || sessionIdRef.current || crypto.randomUUID()
    sessionIdRef.current = newSessionId

    const ws = new WebSocket(
      `${wsProtocol}//${window.location.host}/ws?session=${newSessionId}&userId=${getUserId()}&mode=tui`
    )

    sessionRef = { ...sessionRef, id: newSessionId, ws }
    setSession(sessionRef)

    ws.onopen = () => {
      reconnectAttempts.current = 0
      setStatus('connected')
      currentTerm.writeln('\x1b[32m✓ Connected to Tian-gong Agent Terminal\x1b[0m')
      currentTerm.writeln('')
      onSessionChange?.(newSessionId)
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)

      switch (message.type) {
        case 'output':
          currentTerm.write(message.payload.data)
          break

        case 'connected':
          const payloadSessionId = message.payload.sessionId
          sessionIdRef.current = payloadSessionId
          localStorage.setItem('tian_session_id', payloadSessionId)
          onSessionChange?.(payloadSessionId)
          break

        case 'exit':
          currentTerm.writeln('')
          currentTerm.writeln(`\x1b[33mProcess exited with code ${message.payload.exitCode}\x1b[0m`)
          setStatus('disconnected')
          break

        case 'error':
          currentTerm.writeln('')
          currentTerm.writeln(`\x1b[31mError: ${message.payload.message}\x1b[0m`)
          break
      }
    }

    ws.onclose = () => {
      setStatus('disconnected')

      if (reconnectAttempts.current < MAX_RECONNECT) {
        reconnectAttempts.current++
        currentTerm.writeln(`\x1b[33mConnection lost. Reconnecting (${reconnectAttempts.current}/${MAX_RECONNECT})...\x1b[0m`)
        setTimeout(connectWebSocket, 3000)
      } else {
        currentTerm.writeln('\x1b[31m✗ Connection lost. Please refresh the page.\x1b[0m')
      }
    }

    ws.onerror = () => {
      setStatus('disconnected')
    }

    currentTerm.onData((data) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', payload: { data } }))
      }
    })

    const handleResize = () => {
      currentFitAddon.fit()
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'resize',
            payload: { cols: currentTerm.cols, rows: currentTerm.rows },
          })
        )
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [session, getUserId, onSessionChange])

  useEffect(() => {
    const cleanup = connectWebSocket()

    return () => {
      cleanup?.()
      session?.ws?.close()
      session?.term?.dispose()
    }
  }, [])

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && session?.fitAddon) {
        session.fitAddon.fit()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [session])

  const handleReset = () => {
    session?.ws?.close()
    session?.term?.clear()
    reconnectAttempts.current = 0
    connectWebSocket()
  }

  const handleNewSession = () => {
    if (confirm('Start a new session? Current session will be disconnected.')) {
      localStorage.removeItem('tian_session_id')
      session?.ws?.close()
      session?.term?.clear()
      reconnectAttempts.current = 0
      connectWebSocket()
    }
  }

  const handleDownloadLog = () => {
    const selection = session?.term?.getSelection() || ''
    const blob = new Blob([selection || 'No content selected.'] as BlobPart[], {
      type: 'text/plain',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tian-agent-log-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-terminal-bg text-foreground">
      <div className="flex items-center gap-2 px-4 py-2 bg-card border-b border-border">
        <button
          onClick={handleNewSession}
          className="btn btn-sm btn-secondary flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>

        <button
          onClick={handleReset}
          className="btn btn-sm btn-ghost flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        <button
          onClick={handleDownloadLog}
          className="btn btn-sm btn-ghost flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Log</span>
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-2 text-xs">
          <span
            className={`w-2 h-2`}
            style={{
              background: status === 'connected' ? 'oklch(0.7077 0.165 173.412)' : 
                         status === 'connecting' ? 'oklch(0.7692 0.1886 84.429)' : 
                         'oklch(0.7022 0.1892 22.2279)',
              animation: status !== 'disconnected' ? 'pulse 2s infinite' : 'none'
            }}
          />
          <span className="text-muted-foreground capitalize">{status}</span>
        </div>

        <button
          onClick={toggleFullscreen}
          className="btn btn-sm btn-ghost"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 p-3 overflow-hidden">
        <div
          ref={terminalRef}
          className="h-full overflow-hidden"
          style={{ 
            minHeight: '200px',
            background: 'oklch(0.1448 0 0)'
          }}
        />
      </div>
    </div>
  )
}

export default TerminalApp
