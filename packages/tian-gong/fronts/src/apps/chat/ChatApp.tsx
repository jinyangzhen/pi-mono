import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Trash2, Plus, ChevronDown, Bot, User, Loader2 } from 'lucide-react'
import { AppProps } from '../../shared/types'
import { useChatStore } from '../../stores/chatStore'

interface Provider {
  id: string
  name: string
}

interface Model {
  id: string
  name: string
}

interface ProvidersResponse {
  providers: Provider[]
  models: Record<string, Model[]>
}


interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isStreaming?: boolean
}



export function ChatApp({ initialSessionId, onSessionChange }: AppProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
const [isLoading, setIsLoading] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])
  const [models, setModels] = useState<Record<string, Model[]>>({})
  // Track current session ID
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId)

  const selectedModel = useChatStore(state => state.selectedModel)
  const setSelectedModel = useChatStore(state => state.setSelectedModel)
  const [showModelDropdown, setShowModelDropdown] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }


  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  // Initialize or restore session ID on mount
  useEffect(() => {
    if (!sessionId) {
      const storedSessionId = localStorage.getItem('tian_session_id')
      if (storedSessionId) {
        setSessionId(storedSessionId)
        onSessionChange?.(storedSessionId)
      }
    } else {
      // Store session ID in localStorage
      localStorage.setItem('tian_session_id', sessionId)
    }
  }, [sessionId, onSessionChange])
  
  // Fetch providers and models on mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/providers?_=' + Date.now())
        const data: ProvidersResponse = await response.json()
        setProviders(data.providers)
        setModels(data.models)
        // Set default model if none selected
        if (!selectedModel && data.providers.length > 0) {
          const firstProvider = data.providers[0]
          const firstModel = data.models[firstProvider.id]?.[0]
          if (firstModel) {
            setSelectedModel({
              providerId: firstProvider.id,
              providerName: firstProvider.name,
              modelId: firstModel.id,
              modelName: firstModel.name
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch providers:', error)
      }
    }
    fetchProviders()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false)

      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Get all available models across all providers
  // Shows ALL system providers; user API keys override at API level
  const getAllModels = (): Array<Model & { providerId: string; providerName: string }> => {
    const allModels: Array<Model & { providerId: string; providerName: string }> = []
    // Show all providers from the system
    for (const provider of providers) {
      const providerModels = models[provider.id] || []
      for (const model of providerModels) {
        allModels.push({ ...model, providerId: provider.id, providerName: provider.name })
      }
    }
    return allModels
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }
    setMessages(prev => [...prev, assistantMessage])

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const responseText = `I'm Tian-gong Agent (Model: ${selectedModel ? `${selectedModel.providerName}/${selectedModel.modelName}` : 'Unknown'}), an AI assistant. How can I help you today?`
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: responseText, isStreaming: false }
          : msg
      ))
      
      // Create new session if none exists
      if (!sessionId) {
        const newSessionId = crypto.randomUUID()
        setSessionId(newSessionId)
        localStorage.setItem('tian_session_id', newSessionId)
        onSessionChange?.(newSessionId)
      }
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: 'Sorry, an error occurred.', isStreaming: false }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setInput('')
    // Create new session for new chat
    const newSessionId = crypto.randomUUID()
    setSessionId(newSessionId)
    localStorage.setItem('tian_session_id', newSessionId)
    onSessionChange?.(newSessionId)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleNewChat}
            className="btn btn-sm btn-ghost flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
          <div className="h-4 w-px bg-border" />
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="flex items-center gap-1.5 px-2 py-1 hover:bg-muted rounded transition-colors"
                >
                  <Bot className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{selectedModel ? `${selectedModel.providerName}/${selectedModel.modelName}` : 'Select model'}</span>
                  <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showModelDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 min-w-[200px] max-h-60 overflow-y-auto">
                    {getAllModels().map(model => (
                      <button
                        key={`${model.providerId}-${model.id}`}
                        onClick={() => {
                          setSelectedModel({
                            providerId: model.providerId,
                            providerName: model.providerName,
                            modelId: model.id,
                            modelName: model.name
                          })
                          setShowModelDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                          selectedModel?.modelId === model.id && selectedModel?.providerId === model.providerId ? 'bg-muted text-foreground' : 'text-foreground'
                        }`}
                      >
                        <div className="font-medium">{model.providerName}/{model.name}</div>
                        <div className="text-xs text-muted-foreground">{model.providerName}</div>
                      </button>
                    ))}
                  </div>
                )}
            </div>
            </div>
          </div>
        </div>
          <div className="flex items-center gap-1">
            <button className="btn btn-sm btn-ghost">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <div className="w-16 h-16 flex items-center justify-center mb-6 bg-card">
              <Bot className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Tian-gong Agent</h1>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              A powerful AI assistant with terminal and chat capabilities.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'border border-border bg-card text-muted-foreground'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div className={`flex-1 min-w-0 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className="text-xs text-muted-foreground mb-1">
                    {message.role === 'user' ? 'You' : 'Tian-gong'}
                    <span className="ml-2">{formatTime(message.timestamp)}</span>
                  </div>
                  <div className={`inline-block px-4 py-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-card text-foreground'
                  }`}>
                    {message.isStreaming ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-muted-foreground">Thinking...</span>
                      </span>
                    ) : (
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {message.content}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border bg-card px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 p-2 border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-ring transition-colors bg-background">
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Tian-gong..."
              className="flex-1 bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground max-h-40 min-h-[40px] py-2"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="btn btn-primary p-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-xs text-muted-foreground">
              AI can make mistakes.
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatApp
