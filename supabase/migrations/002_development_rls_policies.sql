-- Development policy migration (idempotent)
-- This migration assumes schema objects are already created by 001_initial_schema.sql.

-- Ensure RLS is enabled on the existing tables.
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS message_seen ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on chat tables so dev policies can be applied safely.
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('users', 'chats', 'chat_participants', 'messages', 'message_seen')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- ============================================================================
-- ROW LEVEL SECURITY - DEVELOPMENT MODE (Permissive)
-- ============================================================================
-- For production, implement stricter policies with proper authentication

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_seen ENABLE ROW LEVEL SECURITY;

-- Users: Allow all reads/writes in development
CREATE POLICY "users_select_policy" ON users
  FOR SELECT USING (true);

CREATE POLICY "users_update_policy" ON users
  FOR UPDATE USING (true);

CREATE POLICY "users_insert_policy" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users_delete_policy" ON users
  FOR DELETE USING (true);

-- Chats: Allow reads for all (development), restrict writes
CREATE POLICY "chats_select_policy" ON chats
  FOR SELECT USING (true);

CREATE POLICY "chats_insert_policy" ON chats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "chats_update_policy" ON chats
  FOR UPDATE USING (true);

CREATE POLICY "chats_delete_policy" ON chats
  FOR DELETE USING (true);

-- Chat participants: Allow all operations (development)
CREATE POLICY "chat_participants_select_policy" ON chat_participants
  FOR SELECT USING (true);

CREATE POLICY "chat_participants_insert_policy" ON chat_participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "chat_participants_update_policy" ON chat_participants
  FOR UPDATE USING (true);

CREATE POLICY "chat_participants_delete_policy" ON chat_participants
  FOR DELETE USING (true);

-- Messages: Allow all operations (development)
CREATE POLICY "messages_select_policy" ON messages
  FOR SELECT USING (true);

CREATE POLICY "messages_insert_policy" ON messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "messages_update_policy" ON messages
  FOR UPDATE USING (true);

CREATE POLICY "messages_delete_policy" ON messages
  FOR DELETE USING (true);

-- Message seen: Allow all operations
CREATE POLICY "message_seen_select_policy" ON message_seen
  FOR SELECT USING (true);

CREATE POLICY "message_seen_insert_policy" ON message_seen
  FOR INSERT WITH CHECK (true);

CREATE POLICY "message_seen_delete_policy" ON message_seen
  FOR DELETE USING (true);

-- ============================================================================
-- ENABLE REALTIME
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chats'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chats;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'message_seen'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE message_seen;
  END IF;
END $$;

-- ============================================================================
-- INSERT TEST DATA
-- ============================================================================
INSERT INTO users (username, password_hash, display_name, profile_picture)
VALUES 
  ('sohan', '$2a$10$xqq6H8I8sN9X5VBZ7kq5quARPbJY.f5hQ7xQ5xB5Y5xB5Y5xB5Y5x', 'Sohan', 'https://api.multiavatar.com/sohan.png'),
  ('sandhya', '$2a$10$7kQ5xQ5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5x', 'Sandhya', 'https://api.multiavatar.com/sandhya.png')
ON CONFLICT (username) DO NOTHING;

-- Verify users created
SELECT username, display_name FROM users ORDER BY created_at DESC;
