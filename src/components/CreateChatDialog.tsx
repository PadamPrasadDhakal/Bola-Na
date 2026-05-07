'use client'

import React, { useState } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Dialog } from './ui/Dialog'
import { authService } from '@/services/supabaseService'
import { User } from '@/types'
import { Avatar } from './ui/Avatar'
import { getInitials } from '@/utils/helpers'
import { Search, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

interface CreateChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectUser: (user: User) => void
}

export function CreateChatDialog({ open, onOpenChange, onSelectUser }: CreateChatDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setUsers([])
      return
    }

    setIsLoading(true)

    try {
      const results = await authService.searchUsers(query)
      setUsers(results)
    } catch (error) {
      console.error('Search failed:', error)
      toast.error('Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Start a new chat"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          icon={<Search size={18} />}
        />

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="animate-spin" size={24} />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              {searchQuery ? 'No users found' : 'Start typing to search'}
            </p>
          ) : (
            users.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onSelectUser(user)
                  onOpenChange(false)
                  setSearchQuery('')
                  setUsers([])
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Avatar
                  src={user.profile_picture || ''}
                  initials={getInitials(user.display_name)}
                  size="md"
                />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{user.display_name}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </Dialog>
  )
}
