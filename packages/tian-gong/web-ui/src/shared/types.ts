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
export interface Session {
  id: string
  createdAt: Date
  mode: UiMode
  userId: string
}
export interface AppProps {
  initialSessionId?: string
  onSessionChange?: (sessionId: string) => void
  apiKeys?: Record<string, string>
}
