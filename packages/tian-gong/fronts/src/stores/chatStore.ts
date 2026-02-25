import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatModel {
  providerId: string
  providerName: string
  modelId: string
  modelName: string
}

interface ChatStore {
  selectedModel: ChatModel | null
  setSelectedModel: (model: ChatModel) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      selectedModel: null,
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    {
      name: 'tian-gong-chat-store',
    }
  )
)
