import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Chat, Message } from '@/types'
import { setAuthToken, clearAuthToken } from '@/lib/auth'

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  setUser: (user: User | null, token?: string) => void
  logout: () => void
}

interface ChatStore {
  selectedChatId: string | null
  chats: Chat[]
  messages: { [key: string]: Message[] }
  typingUsers: { [key: string]: string[] }
  onlineUsers: Set<string>

  setSelectedChat: (chatId: string | null) => void
  setChats: (chats: Chat[]) => void
  addChat: (chat: Chat) => void
  updateChat: (chatId: string, chat: Partial<Chat>) => void
  deleteChat: (chatId: string) => void

  setMessages: (chatId: string, messages: Message[]) => void
  addMessage: (chatId: string, message: Message) => void
  updateMessage: (chatId: string, messageId: string, message: Partial<Message>) => void
  deleteMessage: (chatId: string, messageId: string) => void
  clearMessages: (chatId: string) => void

  setTypingUsers: (chatId: string, users: string[]) => void
  addTypingUser: (chatId: string, userId: string) => void
  removeTypingUser: (chatId: string, userId: string) => void

  setOnlineUsers: (users: Set<string>) => void
  addOnlineUser: (userId: string) => void
  removeOnlineUser: (userId: string) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      setUser: (user, token) => {
        set({ user, token })
        if (token) {
          setAuthToken(token)
        }
      },

      logout: () => {
        set({ user: null, token: null })
        clearAuthToken()
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)

export const useChatStore = create<ChatStore>((set, get) => ({
  selectedChatId: null,
  chats: [],
  messages: {},
  typingUsers: {},
  onlineUsers: new Set(),

  setSelectedChat: (chatId) => set({ selectedChatId: chatId }),

  setChats: (chats) => set({ chats }),

  addChat: (chat) => {
    const { chats } = get()
    if (!chats.find((c) => c.id === chat.id)) {
      set({ chats: [chat, ...chats] })
    }
  },

  updateChat: (chatId, chatData) => {
    const { chats } = get()
    set({
      chats: chats.map((c) => (c.id === chatId ? { ...c, ...chatData } : c)),
    })
  },

  deleteChat: (chatId) => {
    const { chats, messages } = get()
    set({
      chats: chats.filter((c) => c.id !== chatId),
      messages: Object.fromEntries(
        Object.entries(messages).filter(([key]) => key !== chatId)
      ),
    })
  },

  setMessages: (chatId, messages) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: messages,
      },
    }))
  },

  addMessage: (chatId, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    }))
  },

  updateMessage: (chatId, messageId, messageData) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((m) =>
          m.id === messageId ? { ...m, ...messageData } : m
        ),
      },
    }))
  },

  deleteMessage: (chatId, messageId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).filter((m) => m.id !== messageId),
      },
    }))
  },

  clearMessages: (chatId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [],
      },
    }))
  },

  setTypingUsers: (chatId, users) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: users,
      },
    }))
  },

  addTypingUser: (chatId, userId) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: [...new Set([...(state.typingUsers[chatId] || []), userId])],
      },
    }))
  },

  removeTypingUser: (chatId, userId) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: (state.typingUsers[chatId] || []).filter((u) => u !== userId),
      },
    }))
  },

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  addOnlineUser: (userId) => {
    set((state) => ({
      onlineUsers: new Set([...state.onlineUsers, userId]),
    }))
  },

  removeOnlineUser: (userId) => {
    set((state) => {
      const newSet = new Set(state.onlineUsers)
      newSet.delete(userId)
      return { onlineUsers: newSet }
    })
  },
}))
