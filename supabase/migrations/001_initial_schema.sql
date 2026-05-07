-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  profile_picture TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chats table (supports direct messages and groups)
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  type TEXT CHECK (type IN ('direct', 'group')) DEFAULT 'direct',
  avatar_url TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat participants table
CREATE TABLE chat_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('member', 'admin')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chat_id, user_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'file')),
  media_name TEXT,
  reply_to_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Message seen table for tracking read receipts
CREATE TABLE message_seen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(message_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_chats_type ON chats(type);
CREATE INDEX idx_chats_created_by ON chats(created_by);
CREATE INDEX idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_message_seen_message_id ON message_seen(message_id);
CREATE INDEX idx_message_seen_user_id ON message_seen(user_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_online ON users(is_online);

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_seen ENABLE ROW LEVEL SECURITY;

-- Users: Can read all, can update own profile
CREATE POLICY "Enable read access for users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on user_id" ON users
  FOR UPDATE USING (auth.uid()::text = id::text OR is_admin());

-- Chats: Can read if participant, can create, can update if admin
CREATE POLICY "Enable read chats for participants" ON chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_id = chats.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Enable create chats for authenticated users" ON chats
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Chat participants: Can read, insert only in own chats
CREATE POLICY "Enable read participants" ON chat_participants
  FOR SELECT USING (true);

-- Messages: Can read if in chat, can create if in chat
CREATE POLICY "Enable read messages for chat members" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_id = messages.chat_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Enable insert messages for authenticated users" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_id = messages.chat_id
      AND user_id = auth.uid()
    )
  );

-- Message seen: Can read, can create own
CREATE POLICY "Enable read message_seen" ON message_seen
  FOR SELECT USING (true);

CREATE POLICY "Enable insert message_seen" ON message_seen
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create a function to check if user is admin (you can modify this logic)
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  -- You can implement admin logic here if needed
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create functions for common operations

-- Function to get chats for a user with last message
CREATE OR REPLACE FUNCTION get_user_chats(user_id_param UUID)
RETURNS TABLE (
  chat_id UUID,
  chat_name TEXT,
  chat_type TEXT,
  avatar_url TEXT,
  last_message TEXT,
  last_message_sender_id UUID,
  unread_count BIGINT,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.type,
    c.avatar_url,
    m.content,
    m.sender_id,
    COUNT(CASE WHEN ms.id IS NULL THEN 1 END),
    c.updated_at
  FROM chats c
  INNER JOIN chat_participants cp ON cp.chat_id = c.id AND cp.user_id = user_id_param
  LEFT JOIN messages m ON m.chat_id = c.id AND m.id = (
    SELECT id FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1
  )
  LEFT JOIN message_seen ms ON ms.message_id = m.id AND ms.user_id = user_id_param AND m.sender_id != user_id_param
  GROUP BY c.id, c.name, c.type, c.avatar_url, m.content, m.sender_id, c.updated_at
  ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread count for a chat
CREATE OR REPLACE FUNCTION get_unread_count(chat_id_param UUID, user_id_param UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM messages m
    LEFT JOIN message_seen ms ON ms.message_id = m.id AND ms.user_id = user_id_param
    WHERE m.chat_id = chat_id_param
    AND m.sender_id != user_id_param
    AND ms.id IS NULL
  );
END;
$$ LANGUAGE plpgsql;
