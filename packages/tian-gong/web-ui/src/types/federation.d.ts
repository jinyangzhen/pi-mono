declare module 'chat/ChatApp' {
  import type { AppProps } from '../shared/types'
  const ChatApp: React.ComponentType<AppProps>
  export default ChatApp
}

declare module 'terminal/TerminalApp' {
  import type { AppProps } from '../shared/types'
  const TerminalApp: React.ComponentType<AppProps>
  export default TerminalApp
}
