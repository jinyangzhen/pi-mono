import { useState, useEffect } from 'react'
import { Eye, EyeOff, X, Trash2, ChevronDown, Plus } from 'lucide-react'



interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const maskKey = (key: string): string => {
  if (!key || key.length <= 4) return key
  return key.slice(0, 4) + '•'.repeat(key.length - 4)
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [systemApiKeys, setSystemApiKeys] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
  const [allProviders, setAllProviders] = useState<Array<{ id: string; name: string }>>([])
  const [activeSection, setActiveSection] = useState<'api-keys'>('api-keys')
  const [showAddProvider, setShowAddProvider] = useState(false)



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
    if (open) {
      fetchApiKeys()
      fetchSystemApiKeys()
      fetchAllProviders()
    }
  }, [open])

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
      const res = await fetch('/api/system/api-keys')
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
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save API keys:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleKeyVisibility = (provider: string) => {
    setVisibleKeys(prev => ({ ...prev, [provider]: !prev[provider] }))
  }

  const addProvider = (providerId: string) => {
    setApiKeys(prev => ({ ...prev, [providerId]: '' }))
    setShowAddProvider(false)
  }

  const removeProvider = (providerId: string) => {
    setApiKeys(prev => {
      const newKeys = { ...prev }
      delete newKeys[providerId]
      return newKeys
    })
  }

  if (!open) return null

  const systemProviders = Object.keys(systemApiKeys)
  const userApiKeys = Object.keys(apiKeys).filter(key => !systemApiKeys[key])
  // Filter out providers that are already configured (system or user level)
  const configuredProviders = new Set([...systemProviders, ...userApiKeys])
  const availableProviders = allProviders.filter(p => !configuredProviders.has(p.id))
  return (
    <div className="dialog-overlay" onClick={() => onOpenChange(false)}>
      <div className="dialog-content max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button 
            onClick={() => onOpenChange(false)}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[500px]">
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
                          <div className="absolute right-0 top-8 z-50 min-w-[200px] border border-border bg-card shadow-lg">
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

                  {Object.keys(apiKeys).length === 0 && availableProviders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No API keys configured
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Object.keys(apiKeys).map(providerId => {
                        const isEditing = (window as any).__editingProviderId__ === providerId
                        const hasValue = apiKeys[providerId] && apiKeys[providerId].trim().length > 0
                        
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
                                type="text"
                                autoFocus
                                value={apiKeys[providerId] || ''}
                                onChange={e => setApiKeys(prev => ({ ...prev, [providerId]: e.target.value }))}
                                onBlur={() => { (window as any).__editingProviderId__ = null }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' || e.key === 'Escape') {
                                    (window as any).__editingProviderId__ = null
                                  }
                                }}
                                className="flex-1 input input-xs"
                                disabled={saving}
                              />
                            ) : (
                              <>
                                <span className="flex-1 text-sm font-mono text-muted-foreground">
                                  {hasValue ? (visibleKeys[providerId] ? apiKeys[providerId] : maskKey(apiKeys[providerId])) : 'Click to set key'}
                                </span>
                                
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
                                    onClick={() => { (window as any).__editingProviderId__ = providerId }}
                                    className="p-1 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                                    title="Edit"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
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
                              </>
                            )}
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

        <div className="dialog-footer">
          <button
            onClick={() => onOpenChange(false)}
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
    </div>
  )
}
