import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Trash2, Plus, Settings, ChevronDown, Bot, User, Loader2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

    // Add placeholder for assistant response
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }
    setMessages(prev => [...prev, assistantMessage])

    // Simulate streaming response (replace with actual agent call)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const responseText = "I'm Tian-gong Agent, an AI assistant. How can I help you today? You can ask me to:\n\n• Write and debug code\n• Analyze files and documents\n• Execute terminal commands\n• Create interactive artifacts\n\nWhat would you like me to help you with?"
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: responseText, isStreaming: false }
          : msg
      ))
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: 'Sorry, an error occurred. Please try again.', isStreaming: false }
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
      {/* Header Bar */}
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
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Claude Sonnet 4.5</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="btn btn-sm btn-ghost">
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="btn btn-sm btn-ghost">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="h-full flex flex-col items-center justify-center px-4">
            <div 
              className="w-16 h-16 flex items-center justify-center mb-6 bg-card"
            >
              <Bot className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Tian-gong Agent</h1>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              A powerful AI assistant with terminal and chat capabilities. 
              How can I help you today?
            </p>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {[
                { icon: '📝', label: 'Write code', prompt: 'Write a Python script that' },
                { icon: '🐛', label: 'Debug code', prompt: 'Debug this code:' },
                { icon: '📁', label: 'Analyze files', prompt: 'Analyze the files in' },
                { icon: '💻', label: 'Terminal command', prompt: 'Run the following terminal command:' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => setInput(action.prompt)}
                  className="flex items-center gap-3 px-4 py-3 bg-card border border-border hover:border-primary transition-colors text-left"
                >
                  <span className="text-xl">{action.icon}</span>
                  <span className="text-sm text-foreground">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages List */
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div 
                  className={`w-8 h-8 flex items-center justify-center shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'border border-border bg-card text-muted-foreground'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 min-w-0 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className="text-xs text-muted-foreground mb-1">
                    {message.role === 'user' ? 'You' : 'Tian-gong'}
                    <span className="ml-2">{formatTime(message.timestamp)}</span>
                  </div>
                  <div 
                    className={`inline-block px-4 py-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card text-foreground'
                    }`}
                  >
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

      {/* Input Area */}
      <div className="border-t border-border bg-card px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div 
            className="flex items-end gap-2 p-2 border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-ring transition-colors bg-background"
          >
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Attach files"
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
              AI can make mistakes. Consider checking important information.
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
