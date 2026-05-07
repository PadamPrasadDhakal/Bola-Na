import React from 'react'
import { Avatar } from './Avatar'
import { cn, formatTime, getInitials } from '@/utils/helpers'
import { User } from '@/types'
import { Check, CheckCheck } from 'lucide-react'

interface MessageBubbleProps {
  content?: string
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'file'
  mediaName?: string
  sender: User
  timestamp: string
  isOwn: boolean
  isSeenByAll?: boolean
  seenAt?: string | null
  seenCount?: number
  isDivided?: boolean
  onReply?: () => void
}

export function MessageBubble({
  content,
  mediaUrl,
  mediaType,
  mediaName,
  sender,
  timestamp,
  isOwn,
  isSeenByAll,
  seenAt,
  seenCount,
  isDivided,
  onReply,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex gap-2 mb-1 group',
        isOwn ? 'flex-row-reverse' : 'flex-row',
        isDivided && 'mt-4'
      )}
    >
      {!isOwn && <Avatar src={sender.profile_picture || ''} initials={getInitials(sender.display_name)} size="sm" />}

      <div className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
        {isDivided && (
          <div className="px-3 py-1">
            <p className={cn('text-xs font-medium', isOwn ? 'text-right' : 'text-left')}>
              {sender.display_name}
            </p>
          </div>
        )}

        <div
          className={cn(
            'px-3 py-2 rounded-2xl max-w-xs break-words',
            isOwn
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-900 rounded-bl-none'
          )}
        >
          {content && <p className="text-sm">{content}</p>}

          {mediaUrl && mediaType === 'image' && (
            <img src={mediaUrl} alt="message" className="rounded-lg max-w-xs max-h-64 object-cover" />
          )}

          {mediaUrl && mediaType === 'video' && (
            <video
              src={mediaUrl}
              className="rounded-lg max-w-xs max-h-64 object-cover"
              controls
            />
          )}

          {mediaUrl && mediaType === 'file' && (
            <div className="flex items-center gap-2">
              <span>📄</span>
              <a href={mediaUrl} download className="text-blue-400 hover:underline text-sm">
                {mediaName || 'Download'}
              </a>
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex items-center gap-1 text-xs text-gray-500 px-3 opacity-0 group-hover:opacity-100 transition-opacity',
            isOwn ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <span>{formatTime(timestamp)}</span>
          {isOwn && (
            <>
              {isSeenByAll ? (
                <CheckCheck size={14} className="text-blue-500" />
              ) : (
                <Check size={14} />
              )}

              {seenAt && (
                <span className="ml-2 text-xs text-gray-400">Seen {formatTime(seenAt)}</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
