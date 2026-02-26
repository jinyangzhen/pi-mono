import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Trash2, ChevronDown, Plus, Check, Eye, EyeOff, Pencil } from 'lucide-react'




interface SettingsPageProps {
  onBack: () => void
}

const maskKey = (key: string): string => {
  if (!key || key.length <= 4) return key
  return key.slice(0, 4) + '•'.repeat(key.length - 4)
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const [allProviders, setAllProviders] = useState<Array<{ id: string; name: string }>>([])
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})


  const [systemApiKeys, setSystemApiKeys] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
  const [activeSection, setActiveSection] = useState<'api-keys'>('api-keys')
  const [showAddProvider, setShowAddProvider] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const providerLabels: Record<string, string> = {
    'openai-responses': 'OpenAI',
    'openai-completions': 'OpenAI (Legacy)',
    'anthropic-messages': 'Anthropic',
    'google-ai-generative': 'Google AI',
    'azure-openai-responses': 'Azure OpenAI',
    'bedrock-converse-stream': 'AWS Bedrock',
    'cohere-chat': 'Cohere',
    'perplexity-chat': 'Perplexity',
    'mistral-chat': 'Mistral',
  }

  useEffect(() => {
    fetchApiKeys()
    fetchSystemApiKeys()
  }, [])

  useEffect(() => {
    if (editingKey && inputRefs.current[editingKey]) {
      inputRefs.current[editingKey]?.focus()
    }
  }, [editingKey])

  useEffect(() => {
    fetchAllProviders()
  }, [])

  const fetchAllProviders = async () => {
    try {
      const res = await fetch('/api/providers/all')
      if (!res.ok) throw new Error('Failed to fetch providers')
      const data = await res.json()
      setAllProviders(data.providers || [])
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    }
  }

  const fetchApiKeys = async () => {
    try {
      const res = await fetch('/api/me/api-keys')
      if (!res.ok) throw new Error('Failed to fetch API keys')
      const data = await res.json()
      setApiKeys(data.apiKeys || {})
    } catch (error) {
      console.error('Failed to fetch API keys:', error)
    }
  }

  const fetchSystemApiKeys = async () => {
    try {
      const res = await fetch('/api/system/env-keys')
      if (!res.ok) throw new Error('Failed to fetch system API keys')
      const data = await res.json()
      setSystemApiKeys(data.apiKeys || {})
    } catch (error) {
      console.error('Failed to fetch system API keys:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/me/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKeys })
      })
      if (!res.ok) throw new Error('Failed to save API keys')
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save API keys:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleKeyVisibility = (provider: string) => {
    setVisibleKeys(prev => ({ ...prev, [provider]: !prev[provider] }))
  }

  const startEditing = (providerId: string) => {
    setEditingKey(providerId)
    setEditValue(apiKeys[providerId] || '')
  }

  const stopEditing = () => {
    if (editingKey) {
      setApiKeys(prev => ({ ...prev, [editingKey]: editValue }))
      setEditingKey(null)
      setEditValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      stopEditing()
    } else if (e.key === 'Escape') {
      setEditingKey(null)
      setEditValue('')
    }
  }

  const addProvider = async (providerId: string) => {
    const newKeys = { ...apiKeys, [providerId]: '' }
    setApiKeys(newKeys)
    setShowAddProvider(false)
    
    try {
      const res = await fetch('/api/me/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKeys: newKeys })
      })
      if (!res.ok) throw new Error('Failed to add provider')
    } catch (error) {
      console.error('Failed to add provider:', error)
    }
  }

  const removeProvider = async (providerId: string) => {
    const newKeys = { ...apiKeys }
    delete newKeys[providerId]
    setApiKeys(newKeys)
    
    try {
      const res = await fetch('/api/me/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKeys: newKeys })
      })
      if (!res.ok) throw new Error('Failed to remove provider')
    } catch (error) {
      console.error('Failed to remove provider:', error)
    }
  }

  const systemProviders = Object.keys(systemApiKeys)
  const userApiKeys = Object.keys(apiKeys).filter(key => !systemApiKeys[key])
  // Filter out providers that are already configured (system or user level)
  const configuredProviders = new Set([...systemProviders, ...userApiKeys])
  const availableProviders = allProviders.filter(p => !configuredProviders.has(p.id))
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button
          onClick={onBack}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">Settings</h2>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-48 border-r border-border flex-shrink-0">
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveSection('api-keys')}
              className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors ${
                activeSection === 'api-keys'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              API Keys
            </button>
            <button
              disabled
              className="w-full text-left px-3 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-50"
            >
              Appearance
            </button>
          </nav>
        </aside>

        <div className="flex-1 overflow-visible">
          {activeSection === 'api-keys' && (
            <div className="p-6">
              <h3 className="text-sm font-semibold mb-1 text-foreground">API Keys</h3>
              <p className="text-xs text-muted-foreground mb-6">Manage your API keys for different providers</p>

              {systemProviders.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    System API Keys
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {systemProviders.map(provider => (
                      <div
                        key={`system-${provider}`}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-muted border border-border cursor-default"
                      >
                        <span className="text-sm font-mono text-foreground">
                          {providerLabels[provider] || provider}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm font-mono text-muted-foreground">
                          {maskKey(systemApiKeys[provider])}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    User API Keys
                  </h4>
                  {availableProviders.length > 0 && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowAddProvider(!showAddProvider)}
                        className="btn btn-sm btn-outline flex items-center gap-2"
                      >
                        <Plus className="w-3 h-3" />
                        Add New
                        <ChevronDown className={`w-3 h-3 transition-transform ${showAddProvider ? 'rotate-180' : ''}`} />
                      </button>
                      {showAddProvider && (
                        <div className="absolute right-0 top-8 z-50 min-w-[200px] max-h-[240px] overflow-y-auto border border-border bg-card shadow-lg">
                          {availableProviders.map(provider => (
                            <button
                              key={provider.id}
                              type="button"
                              onClick={() => { addProvider(provider.id); setShowAddProvider(false); }}
                              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors block"
                            >
                              {providerLabels[provider.id] || provider.id}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {userApiKeys.length === 0 && availableProviders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No API keys configured
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userApiKeys.map(providerId => {
                      const hasValue = apiKeys[providerId] && apiKeys[providerId].trim().length > 0
                      const isEditing = editingKey === providerId
                      
                      return (
                        <div
                          key={providerId}
                          className="group flex items-center gap-3 px-3 py-2 bg-muted border border-border hover:border-border/80 transition-colors"
                        >
                          <span className="flex-1 text-sm font-mono text-foreground">
                            {providerLabels[providerId] || providerId}
                          </span>
                          
                          {isEditing ? (
                            <input
                              ref={el => { inputRefs.current[providerId] = el }}
                              type="text"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onBlur={stopEditing}
                              onKeyDown={handleKeyDown}
                              className="flex-1 input text-sm font-mono"
                              placeholder="Enter API key"
                            />
                          ) : (
                            <button
                              onClick={() => startEditing(providerId)}
                              className="flex-1 flex items-center gap-2 text-left text-sm font-mono text-muted-foreground hover:text-foreground transition-colors group/key"
                              title="Click to edit"
                            >
                              <span className="truncate">
                                {hasValue 
                                  ? (visibleKeys[providerId] ? apiKeys[providerId] : maskKey(apiKeys[providerId])) 
                                  : 'Click to set key'
                                }
                              </span>
                              
                              <Pencil className="w-3 h-3 opacity-0 group-hover/key:opacity-100 transition-opacity text-muted-foreground" />
                            </button>
                          )}
                          
                          
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleKeyVisibility(providerId)}
                              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                              title={visibleKeys[providerId] ? 'Hide' : 'Show'}
                            >
                              {visibleKeys[providerId] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => removeProvider(providerId)}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>


      <div className="flex items-center gap-2 p-4 border-t border-border">
        {saveSuccess && (
          <span className="text-sm text-green-500 flex items-center gap-1">
            <Check className="w-4 h-4" /> Saved successfully
          </span>
        )}
        <div className="flex-1" />
        <button
          onClick={onBack}
          disabled={saving}
          className="btn btn-ghost"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}
