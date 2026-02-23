export type UiMode = 'chat' | 'terminal'

export type UserRole = 'engineer' | 'citizen_developer' | 'manager' | 'admin'

export interface UserPreferences {
  uiMode: UiMode
  defaultModel: string
  defaultProvider: string
  thinkingLevel: 'off' | 'minimal' | 'low' | 'medium' | 'high'
  persistSessions: boolean
  autoCheckpointInterval: number
  notifications: {
    email: boolean
    slack: boolean
  }
  apiKeys: Record<string, string>
}

export interface TianUser {
  id: string
  email: string
  name: string
  department: string
  role: UserRole
  allowedModes: UiMode[]
  preferences: UserPreferences
}

export interface AuthState {
  user: TianUser | null
  isAuthenticated: boolean
  login: (user: TianUser) => void
  logout: () => void
  switchMode: (mode: UiMode) => void
}
