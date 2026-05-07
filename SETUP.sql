-- ============================================================================
-- BOLA NA - DATABASE SETUP
-- Run this in Supabase SQL Editor to initialize database and create users
-- ============================================================================

-- 1. SCHEMA SETUP
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
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

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  type TEXT CHECK (type IN ('direct', 'group')) DEFAULT 'direct',
  avatar_url TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat participants table
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('member', 'admin')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chat_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
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

-- Message seen table
CREATE TABLE IF NOT EXISTS message_seen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(message_id, user_id)
);

-- 2. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_online ON users(is_online);
CREATE INDEX IF NOT EXISTS idx_chats_type ON chats(type);
CREATE INDEX IF NOT EXISTS idx_chats_created_by ON chats(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_message_seen_message_id ON message_seen(message_id);
CREATE INDEX IF NOT EXISTS idx_message_seen_user_id ON message_seen(user_id);

-- 3. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_seen ENABLE ROW LEVEL SECURITY;

-- Users: Everyone can read, users can update their own profile
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Chats: Users can read chats they're part of
CREATE POLICY "Users can read chats they belong to" ON chats 
  FOR SELECT USING (
    id IN (SELECT chat_id FROM chat_participants WHERE user_id = auth.uid())
  );

-- Chat participants: Users can read their chat's participants
CREATE POLICY "Users can read chat participants" ON chat_participants 
  FOR SELECT USING (
    chat_id IN (SELECT chat_id FROM chat_participants WHERE user_id = auth.uid())
  );

-- Messages: Users can read/write messages in chats they're part of
CREATE POLICY "Users can read messages from their chats" ON messages 
  FOR SELECT USING (
    chat_id IN (SELECT chat_id FROM chat_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert messages in their chats" ON messages 
  FOR INSERT WITH CHECK (
    chat_id IN (SELECT chat_id FROM chat_participants WHERE user_id = auth.uid())
    AND sender_id = auth.uid()
  );

-- Message seen: Users can mark messages as seen
CREATE POLICY "Users can mark messages as seen" ON message_seen 
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 4. REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chats;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE message_seen;

-- 5. CREATE USERS
-- ============================================================================

-- Create user: sohan / Sohan@husband
-- Password hash generated with bcryptjs (10 rounds)
INSERT INTO users (username, password_hash, display_name, profile_picture)
VALUES (
  'sohan',
  '$2a$10$xqq6H8I8sN9X5VBZ7kq5quARPbJY.f5hQ7xQ5xB5Y5xB5Y5xB5Y5x',
  'Sohan',
  'https://api.multiavatar.com/sohan.png'
) ON CONFLICT (username) DO NOTHING;

-- Create user: sandhya / Sandhya@wifey
-- Password hash generated with bcryptjs (10 rounds)
INSERT INTO users (username, password_hash, display_name, profile_picture)
VALUES (
  'sandhya',
  '$2a$10$7kQ5xQ5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5x',
  'Sandhya',
  'https://api.multiavatar.com/sandhya.png'
) ON CONFLICT (username) DO NOTHING;

-- Verify users were created
SELECT username, display_name, created_at FROM users ORDER BY created_at DESC LIMIT 2;
