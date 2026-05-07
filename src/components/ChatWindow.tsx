'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useMessages, useChats } from '@/hooks/useChat'
import { useRealtimeMessages, useRealtimeTyping } from '@/hooks/useRealtime'
import { useAuthStore, useChatStore } from '@/store'
import { supabase } from '@/lib/supabase'
import { MessageBubble } from './ui/MessageBubble'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'
import { MediaPreview } from './ui/MediaPreview'
import { Message, User } from '@/types'
import { scrollToBottom, getMimeType, truncateText } from '@/utils/helpers'
import { Send, Plus, Smile, Paperclip } from 'lucide-react'
import toast from 'react-hot-toast'

interface ChatWindowProps {
  chatId: string
  chat: any
  participants: User[]
}

export function ChatWindow({ chatId, chat, participants }: ChatWindowProps) {
  const { user } = useAuthStore()
  const { messages, sendMessage, uploadMedia } = useMessages(chatId)
  const { sendTypingIndicator } = useRealtimeTyping(chatId)
  const [messageText, setMessageText] = useState('')
  const [media, setMedia] = useState<{ file: File; preview: string; type: 'image' | 'video' | 'file' } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const seenMessagesRef = useRef<Set<string>>(new Set())

  useRealtimeMessages(chatId)

  // Mark messages as seen
  useEffect(() => {
    if (!user || messages.length === 0) return

    const markSeen = async () => {
      for (const message of messages) {
        if (message.sender_id !== user.id && !seenMessagesRef.current.has(message.id)) {
          try {
            await supabase.from('message_seen').insert({
              message_id: message.id,
              user_id: user.id,
            })
            seenMessagesRef.current.add(message.id)
          } catch (error) {
            // Ignore duplicate key errors
          }
        }
      }
    }

    const timer = setTimeout(markSeen, 500)
    return () => clearTimeout(timer)
  }, [messages, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    sendTypingIndicator()

    typingTimeoutRef.current = setTimeout(() => {
      // Stop typing indicator
    }, 1000)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const type = getMimeType(file)
    const reader = new FileReader()

    reader.onload = (event) => {
      const preview = event.target?.result as string
      setMedia({ file, preview, type })
    }

    reader.readAsDataURL(file)
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() && !media) return

    setIsLoading(true)

    try {
      let mediaUrl: string | undefined
      let mediaType: 'image' | 'video' | 'file' | undefined

      if (media) {
        const uploadedMediaUrl = await uploadMedia(media.file)
        if (!uploadedMediaUrl) {
          throw new Error('Failed to upload media')
        }

        mediaUrl = uploadedMediaUrl
        mediaType = media.type
      }

      await sendMessage(
        messageText.trim() || undefined,
        mediaUrl,
        mediaType,
        media?.file.name
      )

      setMessageText('')
      setMedia(null)
      toast.success('Message sent')
    } catch (error) {
      toast.error('Failed to send message')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{chat.name || participants[0]?.display_name}</h2>
          <p className="text-xs text-gray-500">
            {participants.length} {participants.length === 1 ? 'member' : 'members'}
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2" id="messages-container">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const sender = participants.find((p) => p.id === message.sender_id) || user
            const isDivided = index === 0 || messages[index - 1].sender_id !== message.sender_id

            return (
              <MessageBubble
                key={message.id}
                content={message.content || undefined}
                mediaUrl={message.media_url || undefined}
                mediaType={(message.media_type as any) || undefined}
                mediaName={message.media_name || undefined}
                sender={sender!}
                timestamp={message.created_at}
                isOwn={message.sender_id === user?.id}
                isDivided={isDivided}
              />
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Media Preview */}
      {media && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <MediaPreview
              type={media.type}
              url={media.preview}
              name={media.file.name}
              onRemove={() => setMedia(null)}
            />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4 sticky bottom-0">
        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-blue-500 transition-colors"
          >
            <Plus size={24} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />

          <Textarea
            value={messageText}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            className="flex-1"
            rows={3}
          />

          <Button
            onClick={handleSendMessage}
            disabled={isLoading || (!messageText.trim() && !media)}
            size="md"
            className="h-full"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  )
}
