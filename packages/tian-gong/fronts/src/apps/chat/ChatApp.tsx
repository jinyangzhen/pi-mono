import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Trash2, Plus, ChevronDown, Bot, User, Loader2 } from 'lucide-react'
import { AppProps } from '../../shared/types'

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

  const [selectedProvider, setSelectedProvider] = useState<string>('openai')
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o')
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showProviderDropdown, setShowProviderDropdown] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }


  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  // Fetch providers and models on mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/providers')
        const data: ProvidersResponse = await response.json()
        setProviders(data.providers)
        setModels(data.models)
        
        // Set defaults based on available data
        if (data.providers.length > 0) {
          const firstProvider = data.providers[0].id
          setSelectedProvider(firstProvider)
          
          if (data.models[firstProvider] && data.models[firstProvider].length > 0) {
            setSelectedModel(data.models[firstProvider][0].id)
          }
        }
      } catch (error) {
        console.error('Failed to fetch providers:', error)
        // Keep default values if fetch fails
      }
    }
    
    fetchProviders()
  }, [])
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false)
        setShowProviderDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Update selected model when provider changes
  useEffect(() => {
    if (models[selectedProvider] && models[selectedProvider].length > 0) {
      setSelectedModel(models[selectedProvider][0].id)
    }
  }, [selectedProvider, models])
  
  const getProviderName = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId)
    return provider?.name || providerId
  }
  
  const getModelName = (modelId: string) => {
    const providerModels = models[selectedProvider] || []
    const model = providerModels.find(m => m.id === modelId)
    return model?.name || modelId
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
      
      const responseText = `I'm Tian-gong Agent (Model: ${getModelName(selectedModel)}), an AI assistant. How can I help you today?`
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: responseText, isStreaming: false }
          : msg
      ))
      
      onSessionChange?.(initialSessionId || crypto.randomUUID())
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
                  onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                  className="flex items-center gap-1.5 px-2 py-1 hover:bg-accent rounded transition-colors"
                >
                  <Bot className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{getProviderName(selectedProvider)}</span>
                  <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showProviderDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showProviderDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 min-w-[150px]">
                    {providers.map(provider => (
                      <button
                        key={provider.id}
                        onClick={() => {
                          setSelectedProvider(provider.id)
                          setShowProviderDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${
                          selectedProvider === provider.id ? 'bg-accent' : ''
                        }`}
                      >
                        {provider.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="flex items-center gap-1.5 px-2 py-1 hover:bg-accent rounded transition-colors"
                >
                  <span className="text-sm text-foreground">{getModelName(selectedModel)}</span>
                  <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showModelDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 min-w-[200px] max-h-60 overflow-y-auto">
                    {(models[selectedProvider] || []).map(model => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id)
                          setShowModelDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${
                          selectedModel === model.id ? 'bg-accent' : ''
                        }`}
                      >
                        {model.name}
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
