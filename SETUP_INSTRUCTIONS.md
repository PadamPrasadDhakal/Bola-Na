# Bola Na - Database Setup Instructions

## Step 1: Generate Password Hashes

Run this command in your terminal to generate bcrypt password hashes:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log('Sohan password hash:', bcrypt.hashSync('Sohan@husband', 10)); console.log('Sandhya password hash:', bcrypt.hashSync('Sandhya@wifey', 10));"
```

This will output two hashes. Save them for the next step.

## Step 2: Go to Supabase SQL Editor

1. Log in to your Supabase dashboard: https://supabase.com
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**

## Step 3: Create Database Schema

Copy and paste this SQL into the SQL Editor and run it:

```sql
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_chats_type ON chats(type);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_message_seen_message_id ON message_seen(message_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_seen ENABLE ROW LEVEL SECURITY;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chats;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE message_seen;
```

## Step 4: Create Users

Replace `YOUR_SOHAN_HASH` and `YOUR_SANDHYA_HASH` with the hashes from Step 1, then run:

```sql
-- Create user: sohan (password: Sohan@husband)
INSERT INTO users (username, password_hash, display_name, profile_picture)
VALUES (
  'sohan',
  'YOUR_SOHAN_HASH',
  'Sohan',
  'https://api.multiavatar.com/sohan.png'
);

-- Create user: sandhya (password: Sandhya@wifey)
INSERT INTO users (username, password_hash, display_name, profile_picture)
VALUES (
  'sandhya',
  'YOUR_SANDHYA_HASH',
  'Sandhya',
  'https://api.multiavatar.com/sandhya.png'
);
```

## Step 5: Verify

Run this to verify the users were created:

```sql
SELECT id, username, display_name, created_at FROM users ORDER BY created_at DESC;
```

You should see both Sohan and Sandhya.

## Step 6: Start the App

```bash
npm install
npm run dev
```

Then visit http://localhost:3000 and login with:
- **Username:** sohan, **Password:** Sohan@husband
- **Username:** sandhya, **Password:** Sandhya@wifey

---

## Alternative: Automated Setup (Node.js)

If you prefer automated setup, run:

```bash
npm install
node -e "
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://xntjgqzyytisiuphtibw.supabase.co';
const key = 'sb_publishable_xKdFZt0fhALc0GBp6pXyMA_qaLJPVSt';
const supabase = createClient(url, key);

(async () => {
  const sohanHash = bcrypt.hashSync('Sohan@husband', 10);
  const sandhyaHash = bcrypt.hashSync('Sandhya@wifey', 10);
  
  await supabase.from('users').insert([
    { username: 'sohan', password_hash: sohanHash, display_name: 'Sohan', profile_picture: 'https://api.multiavatar.com/sohan.png' },
    { username: 'sandhya', password_hash: sandhyaHash, display_name: 'Sandhya', profile_picture: 'https://api.multiavatar.com/sandhya.png' }
  ]);
  
  console.log('✅ Users created!');
})();
"
```

---

## Your Credentials

- **Project URL:** https://xntjgqzyytisiuphtibw.supabase.co
- **Publishable Key:** sb_publishable_xKdFZt0fhALc0GBp6pXyMA_qaLJPVSt
- **Environment File:** Already configured in `.env.local`

---

## Next Steps

1. Complete this setup ✅
2. Run `npm install` if not done
3. Run `npm run dev`
4. Open http://localhost:3000
5. Login and start chatting!

Enjoy Bola Na! 🚀
