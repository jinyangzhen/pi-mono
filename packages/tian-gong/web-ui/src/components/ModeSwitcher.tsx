import { MessageSquare, Terminal, ChevronDown } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import type { UiMode } from '../stores/types'

export function ModeSwitcher() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  if (!user || user.allowedModes.length <= 1) {
    return null
  }

  const currentPath = location.pathname
  const isTerminal = currentPath === '/terminal'
  const currentMode = isTerminal ? 'terminal' : 'chat'

  const handleModeSwitch = (mode: UiMode) => {
    if (mode === currentMode) return
    
    if (mode === 'terminal') {
      navigate('/terminal')
    } else {
      navigate('/chat')
    }
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        {currentMode === 'terminal' ? (
          <>
            <Terminal className="w-4 h-4" />
            <span>Terminal</span>
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </>
        )}
        <ChevronDown className="w-3 h-3" />
      </button>

      <div className="absolute top-full left-0 mt-1 py-1 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[140px]">
        {user.allowedModes.includes('chat') && (
          <button
            onClick={() => handleModeSwitch('chat')}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-muted ${
              currentMode === 'chat' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>
        )}
        {user.allowedModes.includes('terminal') && (
          <button
            onClick={() => handleModeSwitch('terminal')}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-muted ${
              currentMode === 'terminal' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Terminal</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default ModeSwitcher
