'use client'

import React, { useState, useEffect } from 'react'
import { useChatStore, useAuthStore } from '@/store'
import { useChats } from '@/hooks/useChat'
import { ChatItem } from './ui/ChatItem'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Search, LogOut, Settings, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

interface SidebarProps {
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
  onCreateChat?: () => void
}

export function Sidebar({ selectedChatId, onSelectChat, onCreateChat }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const { chats } = useChatStore()
  const { loadChats } = useChats()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredChats, setFilteredChats] = useState(chats)

  useEffect(() => {
    loadChats()
  }, [loadChats])

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
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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
        <p className="text-sm text-gray-600">Welcome, <span className="font-semibold">{user?.display_name}</span></p>
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
              chat={chat}
              isSelected={chat.id === selectedChatId}
              onClick={() => onSelectChat(chat.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
