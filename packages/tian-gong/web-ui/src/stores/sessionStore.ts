import { create } from 'zustand'
import type { UiMode } from './types'

export interface Session {
  id: string
  createdAt: Date
  mode: UiMode
  userId: string
}

export interface SessionState {
  session: Session | null
  setSession: (session: Session) => void
  clearSession: () => void
  updateMode: (mode: UiMode) => void
}

const createNewSession = (mode: UiMode, userId: string): Session => ({
  id: crypto.randomUUID(),
  createdAt: new Date(),
  mode,
  userId,
})

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,

  setSession: (session: Session) => {
    set({ session })
    localStorage.setItem('tian_session_id', session.id)
  },

  clearSession: () => {
    set({ session: null })
    localStorage.removeItem('tian_session_id')
  },

  updateMode: (mode: UiMode) => {
    const current = get().session
    if (current) {
      set({ session: { ...current, mode } })
    }
  },
}))

export const initializeSession = (mode: UiMode, userId: string) => {
  const storedId = localStorage.getItem('tian_session_id')
  const store = useSessionStore.getState()
  
  if (storedId && !store.session) {
    store.setSession({
      id: storedId,
      createdAt: new Date(),
      mode,
      userId,
    })
  } else if (!store.session) {
    store.setSession(createNewSession(mode, userId))
  }
}
