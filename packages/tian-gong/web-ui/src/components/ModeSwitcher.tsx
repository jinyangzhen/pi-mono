import { MessageSquare, Terminal, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useSessionStore } from '../stores/sessionStore'
import type { UiMode } from '../stores/types'

export function ModeSwitcher() {
  const { user, switchMode } = useAuthStore()
  const { session, setSession } = useSessionStore()

  if (!user || user.allowedModes.length <= 1) {
    return null
  }

  const urlMode = new URLSearchParams(window.location.search).get('mode') as 'chat' | 'terminal' | null
  const currentMode = urlMode || session?.mode || user.preferences.uiMode

  const handleModeSwitch = (mode: UiMode) => {
    if (mode === currentMode) return
    
    switchMode(mode)
    
    if (session) {
      setSession({ ...session, mode })
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
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-accent ${
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
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-accent ${
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
