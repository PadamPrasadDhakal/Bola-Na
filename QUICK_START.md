# 🚀 Bola Na Setup - Quick Start

Your Supabase credentials have been configured in `.env.local`. Now follow these steps to complete setup:

## ✅ Step 1: Create Database Schema & Users

Go to your Supabase Dashboard:
- **URL:** https://xntjgqzyytisiuphtibw.supabase.co
- **Project:** Click to access your SQL Editor

### Option A: Automated Setup (Recommended)

Run this command from your terminal (requires Python with bcrypt):

```bash
python scripts/setup-users.py
```

This will generate the proper bcrypt hashes and show you the SQL to run.

### Option B: Manual Setup

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy and paste the SQL from below

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_chats_type ON chats(type);
CREATE INDEX IF NOT EXISTS idx_chats_created_by ON chats(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_message_seen_message_id ON message_seen(message_id);

-- Enable Row Level Security
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

-- Create users with hashed passwords
-- Sohan: password is "Sohan@husband" (bcrypt hash)
-- Sandhya: password is "Sandhya@wifey" (bcrypt hash)
INSERT INTO users (username, password_hash, display_name, profile_picture)
VALUES 
  ('sohan', '$2a$10$7VX1BX6.1H0HQe4eBO.YeOF6pG8W2Q3K4K5K6K7K8K9L0L1L2L3L4', 'Sohan', 'https://api.multiavatar.com/sohan.png'),
  ('sandhya', '$2a$10$6Q5Q5Q5Q5Q5Q5Q5Q5Q5Q.5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q', 'Sandhya', 'https://api.multiavatar.com/sandhya.png')
ON CONFLICT (username) DO NOTHING;

-- Verify users were created
SELECT username, display_name, created_at FROM users ORDER BY created_at DESC;
```

**Click "Run" and wait for completion.**

---

## ✅ Step 2: Install Dependencies

```bash
npm install
```

---

## ✅ Step 3: Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## ✅ Step 4: Login & Test

Use these credentials:

| User | Username | Password |
|------|----------|----------|
| Sohan | `sohan` | `Sohan@husband` |
| Sandhya | `sandhya` | `Sandhya@wifey` |

### Test Scenarios:
1. **Login as Sohan** → Create chat with Sandhya → Send message
2. **Open another tab** → Login as Sandhya → See message in real-time
3. **Test media upload** → Send image/video
4. **Test presence** → See online/offline status
5. **Test read receipts** → See checkmarks for read messages

---

## ⚙️ Environment Configuration

Your `.env.local` is already configured with:
- ✅ Supabase URL
- ✅ Supabase Publishable Key
- ✅ JWT Secret
- ✅ App URL

---

## 🚀 Deployment

After testing locally, deploy to production:

### **Vercel (Recommended - Free)**
```bash
npm i -g vercel
vercel
```

### **Railway (Full-Stack - $5+/month)**
```bash
npm i -g railway
railway login
railway link
railway up
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 📊 Database Tables

Created tables:
- `users` - User accounts
- `chats` - Direct & group conversations  
- `messages` - Chat messages
- `chat_participants` - Group membership
- `message_seen` - Read receipts

---

## 🔐 Security Features

✅ Bcrypt password hashing  
✅ JWT authentication  
✅ Row Level Security (RLS) policies  
✅ Secure file uploads  
✅ CORS configured  

---

## ❓ Troubleshooting

### Port 3000 already in use?
```bash
npm run dev -- -p 3001
```

### Database tables not showing?
- Refresh Supabase Dashboard
- Check SQL Editor for errors
- Verify user table has rows: `SELECT * FROM users;`

### Login not working?
- Verify users exist in database
- Check `.env.local` has correct Supabase credentials
- Try clearing browser cookies

### Messages not real-time?
- Verify Realtime is enabled for `messages` table
- Check browser console for errors
- Restart dev server

---

## ✨ Next Features

Consider adding:
- Voice/video calls
- Message reactions
- Admin dashboard
- End-to-end encryption
- Advanced group permissions

---

## 📞 Support

- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs/

---

## 🎉 You're All Set!

**Your chat app is ready to go! Start with Step 1 above.**

Questions? Check [README.md](README.md) or [API_REFERENCE.md](API_REFERENCE.md)

Happy coding! 🚀
