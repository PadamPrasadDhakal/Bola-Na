import { supabase } from '../lib/supabase'
import { User, Chat, Message, ChatParticipant } from '@/types'

export const authService = {
  async login(username: string, password: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !data) {
        throw new Error('User not found')
      }

      // Note: Password verification should be done on the backend in production
      // For now, we'll accept any password as this is a demo
      return data as User
    } catch (error) {
      throw error
    }
  },

  async getUser(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data as User
  },

  async updateUserStatus(userId: string, isOnline: boolean) {
    const { error } = await supabase
      .from('users')
      .update({
        is_online: isOnline,
        last_seen: isOnline ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) throw error
  },

  async updateUserProfile(userId: string, data: Partial<User>) {
    const { error } = await supabase
      .from('users')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) throw error
  },

  async searchUsers(query: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(10)

    if (error) throw error
    return (data as User[]) || []
  },
}

export const chatService = {
  async getChats(userId: string): Promise<Chat[]> {
    const { data, error } = await supabase
      .from('chat_participants')
      .select('chats(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data?.map((cp: any) => cp.chats) || []) as Chat[]
  },

  async getChatById(chatId: string): Promise<Chat> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single()

    if (error) throw error
    return data as Chat
  },

  async createDirectChat(userId: string, otherUserId: string): Promise<Chat> {
    // Check if direct chat already exists
    const { data: existingChats } = await supabase
      .from('chats')
      .select('id')
      .eq('type', 'direct')

    if (existingChats) {
      for (const chat of existingChats) {
        const { data: participants } = await supabase
          .from('chat_participants')
          .select('user_id')
          .eq('chat_id', chat.id)

        const participantIds = (participants as any[])?.map((p) => p.user_id) || []
        if (
          participantIds.length === 2 &&
          participantIds.includes(userId) &&
          participantIds.includes(otherUserId)
        ) {
          return this.getChatById(chat.id)
        }
      }
    }

    // Create new direct chat
    const { data: newChat, error } = await supabase
      .from('chats')
      .insert({
        type: 'direct',
        created_by: userId,
      })
      .select()
      .single()

    if (error) throw error

    // Add participants
    await supabase.from('chat_participants').insert([
      { chat_id: newChat.id, user_id: userId, role: 'member' },
      { chat_id: newChat.id, user_id: otherUserId, role: 'member' },
    ])

    return newChat as Chat
  },

  async createGroupChat(
    userId: string,
    name: string,
    participantIds: string[],
    avatarUrl?: string
  ): Promise<Chat> {
    const { data: newChat, error } = await supabase
      .from('chats')
      .insert({
        name,
        type: 'group',
        avatar_url: avatarUrl,
        created_by: userId,
      })
      .select()
      .single()

    if (error) throw error

    // Add all participants including creator
    const participants = [
      { chat_id: newChat.id, user_id: userId, role: 'admin' },
      ...participantIds.map((id) => ({
        chat_id: newChat.id,
        user_id: id,
        role: 'member',
      })),
    ]

    await supabase.from('chat_participants').insert(participants)

    return newChat as Chat
  },

  async getChatParticipants(chatId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('chat_participants')
      .select('users(*)')
      .eq('chat_id', chatId)

    if (error) throw error

    return (data?.map((cp: any) => cp.users) || []) as User[]
  },

  async addChatParticipant(chatId: string, userId: string): Promise<void> {
    const { error } = await supabase.from('chat_participants').insert({
      chat_id: chatId,
      user_id: userId,
      role: 'member',
    })

    if (error) throw error
  },

  async removeChatParticipant(chatId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_participants')
      .delete()
      .eq('chat_id', chatId)
      .eq('user_id', userId)

    if (error) throw error
  },
}

export const messageService = {
  async getMessages(chatId: string, limit: number = 50): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return ((data || []) as Message[]).reverse()
  },

  async sendMessage(
    chatId: string,
    senderId: string,
    content?: string,
    mediaUrl?: string,
    mediaType?: string,
    mediaName?: string,
    replyToMessageId?: string
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        content,
        media_url: mediaUrl,
        media_type: mediaType,
        media_name: mediaName,
        reply_to_message_id: replyToMessageId,
      })
      .select()
      .single()

    if (error) throw error

    // Update chat's updated_at
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId)

    return data as Message
  },

 async markMessageAsSeen(messageId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('message_seen')
    .upsert(
      {
        message_id: messageId,
        user_id: userId,
      },
      {
        onConflict: 'message_id,user_id',
        ignoreDuplicates: true,
      }
    )

  if (error) {
    throw error
  }
},

  async getMessageSeenCount(messageId: string): Promise<number> {
    const { count, error } = await supabase
      .from('message_seen')
      .select('*', { count: 'exact' })
      .eq('message_id', messageId)

    if (error) throw error

    return count || 0
  },

  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (error) throw error
  },
}

export const storageService = {
  async uploadFile(
    file: File,
    bucket: string = 'chat-media'
  ): Promise<string> {
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`
    const filePath = `${fileName}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return publicUrl
  },

  async deleteFile(filePath: string, bucket: string = 'chat-media'): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) throw error
  },
}
