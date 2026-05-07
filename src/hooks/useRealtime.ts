import { useEffect, useRef } from 'react'
import { useChatStore, useAuthStore } from '@/store'
import { messageService } from '@/services/supabaseService'
import { supabase } from '@/lib/supabase'
import { Message } from '@/types'
import toast from 'react-hot-toast'

export function useRealtimeMessages(chatId: string | null) {
  const { addMessage, updateMessage, deleteMessage, setSelectedChat } = useChatStore()
  const { user } = useAuthStore()
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    if (!chatId || !user) return

    // Subscribe to real-time messages
    subscriptionRef.current = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          addMessage(chatId, newMessage)

          // Notify only for incoming messages from other users.
          if (newMessage.sender_id !== user.id) {
            if (typeof window !== 'undefined' && 'Notification' in window) {
              if (Notification.permission === 'default') {
                Notification.requestPermission().catch(() => {
                  // Ignore permission request failures.
                })
              }

              if (Notification.permission === 'granted') {
                const bodyText = newMessage.content?.trim() || 'Sent you an attachment'
                const browserNotification = new Notification('New message in Bola Na', {
                  body: bodyText,
                  tag: `chat-${newMessage.chat_id}`,
                })

                browserNotification.onclick = () => {
                  window.focus()
                  setSelectedChat(newMessage.chat_id)
                  browserNotification.close()
                }
              } else {
                toast('New message received')
              }
            } else {
              toast('New message received')
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message
          updateMessage(chatId, updatedMessage.id, updatedMessage)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const deletedMessage = payload.old as Message
          deleteMessage(chatId, deletedMessage.id)
        }
      )
      .subscribe()

    // Subscribe to message_seen inserts to update seen counts/timestamps
    const seenSub = supabase
      .channel(`message_seen:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_seen',
        },
        async (payload) => {
          try {
            const messageId = payload.new.message_id
            // Only update if this message belongs to current chat
            const localMessages = useChatStore.getState().messages[chatId] || []
            if (!localMessages.some((m) => m.id === messageId)) return

            const [count, latest] = await Promise.all([
              messageService.getMessageSeenCount(messageId),
              messageService.getLatestSeenAt(messageId),
            ])

            // update message in store
            useChatStore.getState().updateMessage(chatId, messageId, {
              seen_by_count: count,
              last_seen_at: latest,
            })
          } catch (err) {
            console.error('Failed to update message seen info:', err)
          }
        }
      )
      .subscribe()

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
      if (seenSub) {
        seenSub.unsubscribe()
      }
    }
  }, [chatId, user, addMessage, updateMessage, deleteMessage, setSelectedChat])
}

export function useRealtimeTyping(chatId: string | null) {
  const { setTypingUsers, addTypingUser, removeTypingUser } = useChatStore()
  const { user } = useAuthStore()
  const subscriptionRef = useRef<any>(null)
  const typingTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

  useEffect(() => {
    if (!chatId || !user) return

    subscriptionRef.current = supabase
      .channel(`typing:${chatId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user_id !== user.id) {
          addTypingUser(chatId, payload.payload.user_id)

          // Clear existing timeout
          if (typingTimeoutRef.current[payload.payload.user_id]) {
            clearTimeout(typingTimeoutRef.current[payload.payload.user_id])
          }

          // Set new timeout to remove typing indicator
          typingTimeoutRef.current[payload.payload.user_id] = setTimeout(() => {
            removeTypingUser(chatId, payload.payload.user_id)
          }, 3000)
        }
      })
      .subscribe()

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
      Object.values(typingTimeoutRef.current).forEach(clearTimeout)
    }
  }, [chatId, user, addTypingUser, removeTypingUser])

  const sendTypingIndicator = async () => {
    if (!chatId || !user) return

    try {
      await supabase.channel(`typing:${chatId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: user.id,
          display_name: user.display_name,
        },
      })
    } catch (error) {
      console.error('Failed to send typing indicator:', error)
    }
  }

  return { sendTypingIndicator }
}

export function useRealtimePresence(chatId: string | null) {
  const { setOnlineUsers, addOnlineUser, removeOnlineUser } = useChatStore()
  const { user } = useAuthStore()
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    if (!chatId || !user) return

    subscriptionRef.current = supabase
      .channel(`presence:${chatId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: user.id },
        },
      })
      .on('presence', { event: 'sync' }, () => {
        const state = subscriptionRef.current.presenceState()
        const onlineUserIds = new Set(Object.keys(state))
        setOnlineUsers(onlineUserIds)
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        addOnlineUser(key)
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        removeOnlineUser(key)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await subscriptionRef.current.track({
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [chatId, user, setOnlineUsers, addOnlineUser, removeOnlineUser])
}

export function useSeenStatus(messageId: string, chatId: string) {
  const { user } = useAuthStore()
  const seenRef = useRef(false)

  useEffect(() => {
    if (!user || seenRef.current) return

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('message_seen')
          .insert({
            message_id: messageId,
            user_id: user.id,
          })

        if (!error || error?.message.includes('duplicate')) {
          seenRef.current = true
        }
      } catch (error) {
        console.error('Failed to mark message as seen:', error)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [messageId, user])
}
