'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useMessages } from '@/hooks/useChat'
import { useRealtimeMessages, useRealtimeTyping } from '@/hooks/useRealtime'
import { useAuthStore } from '@/store'
import { supabase } from '@/lib/supabase'
import { MessageBubble } from './ui/MessageBubble'
import { Button } from './ui/Button'
import { Textarea } from './ui/Textarea'
import { MediaPreview } from './ui/MediaPreview'
import { User } from '@/types'
import { scrollToBottom, getMimeType } from '@/utils/helpers'
import {
  ALLOWED_FILE_TYPES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
} from '@/utils/constants'
import { Send, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

interface ChatWindowProps {
  chatId: string
  chat: any
  participants: User[]
  onBack?: () => void
}

export function ChatWindow({ chatId, chat, participants, onBack }: ChatWindowProps) {
  const { user } = useAuthStore()
  const { messages, loadMessages, sendMessage, uploadMedia } = useMessages(chatId)
  const { sendTypingIndicator } = useRealtimeTyping(chatId)
  const [messageText, setMessageText] = useState('')
  const [media, setMedia] = useState<{ file: File; preview: string; type: 'image' | 'video' | 'file' } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const dragCounterRef = useRef(0)
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
    loadMessages()
  }, [loadMessages])

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

  const validateMediaFile = (file: File) => {
    const type = getMimeType(file)
    const isSupportedImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isSupportedVideo = ALLOWED_VIDEO_TYPES.includes(file.type)
    const isSupportedFile = ALLOWED_FILE_TYPES.includes(file.type)

    if (type === 'image' && !isSupportedImage) {
      toast.error('Unsupported image type')
      return false
    }

    if (type === 'video' && !isSupportedVideo) {
      toast.error('Unsupported video type')
      return false
    }

    if (type === 'file' && !isSupportedFile) {
      toast.error('Unsupported file type')
      return false
    }

    if (type === 'image' && file.size > MAX_IMAGE_SIZE) {
      toast.error('Images must be 10MB or smaller')
      return false
    }

    if (type === 'file' && file.size > MAX_FILE_SIZE) {
      toast.error('Files must be 50MB or smaller')
      return false
    }

    return true
  }

  const handleMediaFile = (file: File | null | undefined) => {
    if (!file) return

    if (!validateMediaFile(file)) return

    const type = getMimeType(file)
    const reader = new FileReader()

    reader.onload = (event) => {
      const preview = event.target?.result as string
      setMedia({ file, preview, type })
    }

    reader.readAsDataURL(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleMediaFile(e.target.files?.[0])
    e.target.value = ''
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.types.includes('Files')) return

    e.preventDefault()
    dragCounterRef.current += 1
    setIsDragOver(true)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.types.includes('Files')) return

    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.types.includes('Files')) return

    e.preventDefault()
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1)

    if (dragCounterRef.current === 0) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.types.includes('Files')) return

    e.preventDefault()
    dragCounterRef.current = 0
    setIsDragOver(false)
    handleMediaFile(e.dataTransfer.files?.[0])
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div
      className="relative flex flex-col h-full w-full bg-white"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-blue-500/10 backdrop-blur-[1px] border-2 border-dashed border-blue-500 pointer-events-none">
          <div className="rounded-2xl bg-white px-5 py-4 shadow-lg text-center">
            <p className="text-base font-semibold text-gray-900">Drop media to send</p>
            <p className="text-sm text-gray-500 mt-1">Photos, videos, and files upload as a message</p>
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="flex items-center justify-between gap-3 p-3 sm:p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 text-gray-700"
              aria-label="Back to chats"
            >
              ←
            </button>
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{chat.name || participants[0]?.display_name}</h2>
            <p className="text-xs text-gray-500">
              {participants.length} {participants.length === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-4 space-y-2" id="messages-container">
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
                isSeenByAll={
                  message.sender_id === user?.id
                    ? ((message as any).seen_by_count || 0) >= Math.max(0, participants.length - 1)
                    : false
                }
                seenAt={(message as any).last_seen_at || null}
                seenCount={(message as any).seen_by_count || 0}
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
      <div className="border-t border-gray-200 bg-white p-3 sm:p-4 sticky bottom-0">
        <div className="flex gap-2 sm:gap-3 items-end">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-blue-500 transition-colors shrink-0"
          >
            <Plus size={24} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,.mp4,.webm,.ogg,.mov,.m4v,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />

          <Textarea
            value={messageText}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            className="flex-1 text-black placeholder:text-gray-500 min-h-[52px] sm:min-h-[72px]"
            rows={3}
          />

          <Button
            onClick={handleSendMessage}
            disabled={isLoading || (!messageText.trim() && !media)}
            size="md"
            className="h-[52px] sm:h-full shrink-0"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  )
}
