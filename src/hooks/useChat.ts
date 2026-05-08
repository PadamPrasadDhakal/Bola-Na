import { useState, useCallback } from 'react'
import { useChatStore, useAuthStore } from '@/store'
import { chatService, messageService, storageService } from '@/services/supabaseService'
import { compressVideoTo720p } from '@/utils/videoCompression'
import toast from 'react-hot-toast'

export function useChats() {
  const { chats, setChats, addChat } = useChatStore()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const loadChats = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const userChats = await chatService.getChats(user.id)
      setChats(userChats)
    } catch (error) {
      console.error('Failed to load chats:', error)
      toast.error('Failed to load chats')
    } finally {
      setIsLoading(false)
    }
  }, [user, setChats])

  const createDirectChat = useCallback(
    async (otherUserId: string) => {
      if (!user) return null

      try {
        const chat = await chatService.createDirectChat(user.id, otherUserId)
        addChat(chat)
        return chat
      } catch (error) {
        console.error('Failed to create chat:', error)
        toast.error('Failed to create chat')
        return null
      }
    },
    [user, addChat]
  )

  const createGroupChat = useCallback(
    async (name: string, participantIds: string[], avatarUrl?: string) => {
      if (!user) return null

      try {
        const chat = await chatService.createGroupChat(user.id, name, participantIds, avatarUrl)
        addChat(chat)
        return chat
      } catch (error) {
        console.error('Failed to create group chat:', error)
        toast.error('Failed to create group chat')
        return null
      }
    },
    [user, addChat]
  )

  return {
    chats,
    isLoading,
    loadChats,
    createDirectChat,
    createGroupChat,
  }
}

export function useMessages(chatId: string | null) {
  const { messages, setMessages, addMessage } = useChatStore()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const loadMessages = useCallback(async () => {
    if (!chatId || !user) return

    try {
      setIsLoading(true)
      const chatMessages = await messageService.getMessages(chatId)

      // Enrich messages with seen info for messages sent by current user
      const enriched = await Promise.all(
        chatMessages.map(async (m) => {
          if (m.sender_id === user.id) {
            try {
              const [count, latest] = await Promise.all([
                messageService.getMessageSeenCount(m.id),
                messageService.getLatestSeenAt(m.id),
              ])
              return { ...m, seen_by_count: count, last_seen_at: latest }
            } catch (err) {
              return { ...m, seen_by_count: 0, last_seen_at: null }
            }
          }

          return { ...m, seen_by_count: 0, last_seen_at: null }
        })
      )

      setMessages(chatId, enriched)
    } catch (error) {
      console.error('Failed to load messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }, [chatId, user, setMessages])

  const sendMessage = useCallback(
    async (
      content?: string,
      mediaUrl?: string,
      mediaType?: string,
      mediaName?: string,
      replyToMessageId?: string
    ) => {
      if (!chatId || !user) return null

      try {
        const message = await messageService.sendMessage(
          chatId,
          user.id,
          content,
          mediaUrl,
          mediaType as 'image' | 'video' | 'file' | undefined,
          mediaName,
          replyToMessageId
        )
        addMessage(chatId, message)
        return message
      } catch (error) {
        console.error('Failed to send message:', error)
        toast.error('Failed to send message')
        return null
      }
    },
    [chatId, user, addMessage]
  )

  const uploadMedia = useCallback(
    async (file: File) => {
      try {
        const fileToUpload = file.type.startsWith('video/')
          ? await compressVideoTo720p(file)
          : file

        const url = await storageService.uploadFile(fileToUpload)
        return url
      } catch (error) {
        console.error('Failed to upload media:', error)
        toast.error('Failed to upload media')
        return null
      }
    },
    []
  )

  return {
    messages: messages[chatId || ''] || [],
    isLoading,
    loadMessages,
    sendMessage,
    uploadMedia,
  }
}
