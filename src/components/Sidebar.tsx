'use client'

import React, { useState, useEffect } from 'react'
import { useChatStore, useAuthStore } from '@/store'
import { useChats } from '@/hooks/useChat'
import { ChatItem } from './ui/ChatItem'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { chatService, ChatSummary } from '@/services/supabaseService'
import { Avatar } from './ui/Avatar'
import { getInitials } from '@/utils/helpers'
import { Search, LogOut, Settings, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
  onCreateChat?: () => void
}

export function Sidebar({ selectedChatId, onSelectChat, onCreateChat }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const { chats } = useChatStore()
  const { loadChats } = useChats()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredChats, setFilteredChats] = useState(chats)
  const [chatSummaries, setChatSummaries] = useState<Record<string, ChatSummary>>({})
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [directChatUsers, setDirectChatUsers] = useState<Record<string, any>>({})
  const [latestMessages, setLatestMessages] = useState<Record<string, string>>({})

  useEffect(() => {
    loadChats()
  }, [loadChats])

  useEffect(() => {
    const loadChatSummaries = async () => {
      if (!user) return

      try {
        const summaries = await chatService.getChatSummaries(user.id)
        const summaryMap: Record<string, ChatSummary> = {}
        summaries.forEach((summary) => {
          summaryMap[summary.chat_id] = summary
        })
        setChatSummaries(summaryMap)
      } catch (error) {
        console.error('Failed to load chat summaries:', error)
      }
    }

    loadChatSummaries()

    const loadUnreadCounts = async () => {
      if (!user || chats.length === 0) return

      try {
        const entries = await Promise.all(
          chats.map(async (chat) => {
            try {
              const count = await chatService.getUnreadCount(chat.id, user.id)
              return [chat.id, count] as const
            } catch (error) {
              return [chat.id, 0] as const
            }
          })
        )

        setUnreadCounts(Object.fromEntries(entries))
      } catch (error) {
        console.error('Failed to load unread counts:', error)
      }
    }

    loadUnreadCounts()

    const intervalId = window.setInterval(() => {
      loadChatSummaries()
      loadUnreadCounts()
      loadChats()
    }, 5000)

    const handleFocus = () => {
      loadChatSummaries()
      loadUnreadCounts()
      loadChats()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user, chats, loadChats, selectedChatId])

  useEffect(() => {
    // Fetch latest message per chat when summaries don't have one
    const fetchMissingPreviews = async () => {
      if (!user || chats.length === 0) return

      const missing = chats.filter((chat) => !chatSummaries[chat.id] || !chatSummaries[chat.id].last_message)
      if (missing.length === 0) return

      const result: Record<string, string> = { ...latestMessages }

      await Promise.all(
        missing.map(async (chat) => {
          try {
            const msg = await chatService.getLatestMessage(chat.id)
            if (msg && msg.content) {
              result[chat.id] = msg.content
            }
          } catch (err) {
            // ignore
          }
        })
      )

      setLatestMessages(result)
    }

    fetchMissingPreviews()
  }, [user, chats, chatSummaries])

  useEffect(() => {
    const loadDirectChatUsers = async () => {
      if (!user || chats.length === 0) return

      const directChats = chats.filter((chat) => chat.type === 'direct')
      const userMap: Record<string, any> = {}

      await Promise.all(
        directChats.map(async (chat) => {
          try {
            const participants = await chatService.getChatParticipants(chat.id)
            const otherUser = participants.find((participant) => participant.id !== user.id)
            if (otherUser) {
              userMap[chat.id] = otherUser
            }
          } catch (error) {
            console.error(`Failed to load participants for chat ${chat.id}:`, error)
          }
        })
      )

      setDirectChatUsers(userMap)
    }

    loadDirectChatUsers()
  }, [user, chats])

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      setFilteredChats(
        chats.filter((chat) => (chat.name || '').toLowerCase().includes(query))
      )
    } else {
      setFilteredChats(chats)
    }
  }, [searchQuery, chats])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  return (
    <div className="flex flex-col h-screen w-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Bola Na</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/profile')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Settings size={20} className="text-gray-600" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <LogOut size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.profile_picture || ''}
            initials={getInitials(user?.display_name || 'User')}
            size="sm"
          />
          <p className="text-sm text-gray-600">
            Welcome, <span className="font-semibold">{user?.display_name}</span>
          </p>
        </div>
      </div>

      {/* Search and Create */}
      <div className="px-4 py-3 border-b border-gray-200 flex gap-2">
        <Input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={18} />}
          className="flex-1"
        />
        <Button onClick={onCreateChat} size="md" variant="ghost" className="p-2">
          <Plus size={20} />
        </Button>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">No chats yet</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatItem
              key={chat.id}
              unreadCount={unreadCounts[chat.id] ?? chatSummaries[chat.id]?.unread_count ?? 0}
              chat={chat}
              lastMessage={
                chatSummaries[chat.id]?.last_message || latestMessages[chat.id] || undefined
              }
              lastMessageSender={
                chat.type === 'direct'
                  ? directChatUsers[chat.id]
                  : undefined
              }
              isSelected={chat.id === selectedChatId}
              onClick={() => onSelectChat(chat.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
