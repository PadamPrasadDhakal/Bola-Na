export interface User {
  id: string
  username: string
  display_name: string
  profile_picture: string | null
  is_online: boolean
  last_seen: string | null
  created_at: string
  password_hash?: string
}

export interface Chat {
  id: string
  name: string | null
  type: 'direct' | 'group'
  avatar_url: string | null
  created_at: string
  updated_at: string
  created_by: string
}

export interface ChatParticipant {
  id: string
  chat_id: string
  user_id: string
  joined_at: string
  role: 'member' | 'admin'
}

export interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string | null
  media_url: string | null
  media_type: 'image' | 'video' | 'file' | null
  media_name: string | null
  reply_to_message_id: string | null
  created_at: string
  updated_at: string
}

export interface MessageSeen {
  id: string
  message_id: string
  user_id: string
  seen_at: string
}

export interface TypingIndicator {
  chat_id: string
  user_id: string
  username: string
  display_name: string
  profile_picture: string | null
}

export interface AuthPayload {
  user: User
  token: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface ChatWithLastMessage extends Chat {
  last_message?: Message
  last_message_sender?: User
  unread_count: number
  participants: User[]
}

export interface ReplyMessage extends Message {
  sender?: User
}

export interface MessageWithSeenInfo extends Message {
  sender?: User
  reply_to?: ReplyMessage
  seen_by_count: number
  is_seen: boolean
}

export interface OnlineUserPresence {
  user_id: string
  is_online: boolean
  last_seen: string | null
}
