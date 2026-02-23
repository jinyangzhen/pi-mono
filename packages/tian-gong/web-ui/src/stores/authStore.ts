import { create } from 'zustand'
import type { TianUser, UiMode, AuthState } from './types'

const defaultUser: TianUser = {
  id: 'demo-user',
  email: 'demo@tian.com',
  name: 'Demo User',
  department: 'Engineering',
  role: 'citizen_developer',
  allowedModes: ['chat', 'terminal'],
  preferences: {
    uiMode: 'chat',
    defaultModel: 'gpt-4o',
    defaultProvider: 'openai',
    thinkingLevel: 'medium',
    persistSessions: true,
    autoCheckpointInterval: 5,
    notifications: {
      email: false,
      slack: false,
    },
    apiKeys: {},
  },
}

export const useAuthStore = create<AuthState>((set) => ({
  user: defaultUser,
  isAuthenticated: true,

  login: (user: TianUser) => {
    set({ user, isAuthenticated: true })
  },

  logout: () => {
    set({ user: null, isAuthenticated: false })
  },

  switchMode: (mode: UiMode) => {
    set((state) => {
      if (!state.user) return state
      if (!state.user.allowedModes.includes(mode)) return state
      
      return {
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            uiMode: mode,
          },
        },
      }
    })
  },
}))
