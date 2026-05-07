import React from 'react'
import { Avatar } from './Avatar'
import { cn, formatTime, truncateText, getInitials } from '@/utils/helpers'
import { Chat, User } from '@/types'

interface ChatItemProps {
  chat: Chat
  lastMessage?: string
  lastMessageSender?: User
  unreadCount?: number
  isSelected?: boolean
  onClick?: () => void
}

export function ChatItem({
  chat,
  lastMessage,
  lastMessageSender,
  unreadCount = 0,
  isSelected,
  onClick,
}: ChatItemProps) {
  const displayName = chat.name || lastMessageSender?.display_name || 'Unknown'
  const displayInitials = getInitials(displayName)
  const hasUnread = unreadCount > 0
  const isSingleUnread = unreadCount === 1

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0 text-left',
        isSelected && 'bg-blue-50 border-b border-gray-200',
        !isSelected && hasUnread && 'bg-yellow-100 border-l-4 border-l-yellow-500 shadow-[inset_0_1px_0_rgba(234,179,8,0.08)]'
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar
          src={chat.avatar_url || lastMessageSender?.profile_picture || ''}
          initials={displayInitials}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={cn('font-semibold text-gray-900 truncate', hasUnread && 'font-bold')}>
              {displayName}
            </h3>
            {lastMessage && (
              <span className="text-xs text-gray-500 ml-2">{formatTime(chat.updated_at)}</span>
            )}
          </div>

          <p className={cn('text-sm truncate', hasUnread ? 'text-gray-900 font-bold' : 'text-gray-600')}>
            {truncateText(lastMessage || 'No messages', 40)}
          </p>
        </div>

        {isSingleUnread ? (
          <div className="ml-2" title="1 unread message">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_0_4px_rgba(234,179,8,0.14)] animate-pulse"
              aria-hidden="true"
            />
          </div>
        ) : null}

        {unreadCount > 1 && (
          <div
            className="flex items-center justify-center bg-red-500 text-white rounded-full min-w-[1.5rem] h-6 px-2 text-xs font-bold shadow-sm"
            title={`${unreadCount} unread messages`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>
    </button>
  )
}
