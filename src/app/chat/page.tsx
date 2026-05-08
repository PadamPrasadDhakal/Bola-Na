'use client'

import React, { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Sidebar } from '@/components/Sidebar'
import { ChatWindow } from '@/components/ChatWindow'
import { CreateChatDialog } from '@/components/CreateChatDialog'
import { useAuthStore, useChatStore } from '@/store'
import { useChats } from '@/hooks/useChat'
import { useRouter } from 'next/navigation'
import { chatService } from '@/services/supabaseService'
import { User } from '@/types'

export default function ChatPage() {
  const { user } = useAuthStore()
  const { selectedChatId, setSelectedChat } = useChatStore()
  const { createDirectChat } = useChats()
  const [createChatOpen, setCreateChatOpen] = useState(false)
  const [chatParticipants, setChatParticipants] = useState<User[]>([])
  const [currentChat, setCurrentChat] = useState<any>(null)
  const [selectedChat, setSelectedChatLocal] = useState<any>(null)

  useEffect(() => {
    const loadChatData = async () => {
      if (selectedChatId && user) {
        try {
          const chat = await chatService.getChatById(selectedChatId)
          const participants = await chatService.getChatParticipants(selectedChatId)
          setCurrentChat(chat)
          setChatParticipants(participants)
        } catch (error) {
          console.error('Failed to load chat:', error)
        }
      }
    }

    loadChatData()
  }, [selectedChatId, user])

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId)
  }

  const handleCreateChat = async (selectedUser: User) => {
    if (!user) return

    try {
      const chat = await createDirectChat(selectedUser.id)
      if (chat) {
        setSelectedChat(chat.id)
      }
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
  }

  if (!user) {
    return null
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-white">
        {/* Sidebar - desktop only */}
        <div className="hidden sm:flex w-80 flex-col shrink-0">
          <Sidebar
            selectedChatId={selectedChatId || ''}
            onSelectChat={handleSelectChat}
            onCreateChat={() => setCreateChatOpen(true)}
          />
        </div>

        {/* Mobile chat list or chat view */}
        <div className="flex-1 min-w-0 sm:hidden">
          {!selectedChatId ? (
            <Sidebar
              selectedChatId=""
              onSelectChat={handleSelectChat}
              onCreateChat={() => setCreateChatOpen(true)}
            />
          ) : currentChat ? (
            <ChatWindow
              chatId={selectedChatId}
              chat={currentChat}
              participants={chatParticipants}
              onBack={() => setSelectedChat(null)}
            />
          ) : null}
        </div>

        {/* Desktop chat window */}
        <div className="hidden sm:flex flex-1 min-w-0">
          {selectedChatId && currentChat ? (
            <ChatWindow
              chatId={selectedChatId}
              chat={currentChat}
              participants={chatParticipants}
              onBack={() => setSelectedChat(null)}
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-gray-50">
              <div className="text-center px-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💬</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a chat to start</h2>
                <p className="text-gray-600 mb-6">Choose a conversation or create a new one</p>
                <button
                  onClick={() => setCreateChatOpen(true)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  New Chat
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Chat Dialog */}
        <CreateChatDialog
          open={createChatOpen}
          onOpenChange={setCreateChatOpen}
          onSelectUser={handleCreateChat}
        />

      </div>
    </ProtectedRoute>
  )
}
