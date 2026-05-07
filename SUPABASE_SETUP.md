# Supabase Setup Guide for Bola Na

Complete step-by-step guide to set up Supabase for the Bola Na chat application.

## Prerequisites

- A Supabase account (free tier available)
- Your project ready to configure
- Environment variables template ready

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and log in
2. Click "New Project"
3. Fill in project details:
   - **Name**: bola-na-chat (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Select region closest to you
4. Click "Create new project"
5. Wait 2-3 minutes for project initialization

## Step 2: Get Your Credentials

1. Once project is created, go to **Settings** (gear icon)
2. Click **API** in the left sidebar
3. You'll see:
   - `Project URL` - Copy this as `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key - Copy this as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key - Copy this as `SUPABASE_SERVICE_ROLE_KEY`

4. Create `.env.local` file in project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your_key_here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...service_role_key
JWT_SECRET=your_generated_jwt_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Step 3: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run**
5. Wait for all tables to be created successfully

The schema includes:
- `users` table
- `chats` table
- `chat_participants` table
- `messages` table
- `message_seen` table
- Row Level Security policies
- Indexes for performance
- Helper functions

## Step 4: Create Storage Bucket

1. In Supabase dashboard, go to **Storage** (left sidebar)
2. Click **Create new bucket**
3. Fill in bucket details:
   - **Name**: `chat-media`
   - **Public**: Toggle ON (to allow public downloads)
   - **Allowed MIME types**: Leave empty (all types allowed)
   - **File size limit**: 100MB (or adjust as needed)
4. Click **Create bucket**

## Step 5: Configure Row Level Security (RLS)

The RLS policies are created in the SQL migration, but verify they're active:

1. Go to **SQL Editor**
2. Run this query to verify RLS is enabled:
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = true`.

## Step 6: Create Test Users

1. Go to **SQL Editor**
2. Click **New Query**
3. Run this query to create test users:

```sql
-- Insert test users
-- Note: In production, passwords should be properly hashed
INSERT INTO users (username, password_hash, display_name, profile_picture, is_online, created_at) VALUES
('john', 'hashedpwd123', 'John Doe', NULL, false, NOW()),
('jane', 'hashedpwd456', 'Jane Smith', NULL, false, NOW()),
('mike', 'hashedpwd789', 'Mike Wilson', NULL, false, NOW()),
('sarah', 'hashedpwd101', 'Sarah Johnson', NULL, false, NOW());
```

4. Click **Run**

To get the user IDs for reference:
```sql
SELECT id, username, display_name FROM users ORDER BY created_at;
```

## Step 7: Create Direct Chat Between Test Users

1. Go to **SQL Editor**
2. Create a direct chat:

```sql
-- Create a direct chat between john and jane
WITH chat_insert AS (
  INSERT INTO chats (type, created_by, created_at, updated_at)
  VALUES ('direct', (SELECT id FROM users WHERE username = 'john'), NOW(), NOW())
  RETURNING id
)
INSERT INTO chat_participants (chat_id, user_id, role, joined_at) 
SELECT ci.id, u.id, 'member', NOW()
FROM chat_insert ci, users u
WHERE u.username IN ('john', 'jane');

-- Create another chat: mike and john
WITH chat_insert AS (
  INSERT INTO chats (type, created_by, created_at, updated_at)
  VALUES ('direct', (SELECT id FROM users WHERE username = 'mike'), NOW(), NOW())
  RETURNING id
)
INSERT INTO chat_participants (chat_id, user_id, role, joined_at) 
SELECT ci.id, u.id, 'member', NOW()
FROM chat_insert ci, users u
WHERE u.username IN ('mike', 'john');
```

3. Click **Run**

## Step 8: Enable Realtime

1. Go to **Database** → **Replication**
2. Under "Replication" section, look for publication
3. Toggle ON for these tables:
   - `messages`
   - `users`
   - `chat_participants`
   - `message_seen`
4. Realtime changes will now be broadcast for these tables

Alternatively, use SQL:
```sql
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE message_seen;
```

## Step 9: Test the Connection

1. In your project root, run:
```bash
npm install
npm run dev
```

2. Open browser to `http://localhost:3000`
3. Login with:
   - Username: `john`
   - Password: `hashedpwd123`

4. You should be redirected to chat page

## Step 10: Verify Real-time Features

1. Open two browser windows
2. Login as different users (john in one, jane in the other)
3. Send a message from john
4. Message should appear immediately in jane's window (real-time)

## Production Setup

### Environment Variables
Before deploying to production:

1. Generate a strong JWT_SECRET:
```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((1..32 | ForEach-Object { [char](Get-Random -Minimum 33 -Maximum 127) } | Join-String)))
```

2. Update all environment variables in your hosting platform

### Database Backups

1. In Supabase dashboard, go to **Settings** → **Backups**
2. Configure automatic daily backups
3. Test restore procedure

### Security Best Practices

1. **Update JWT Secret**: Use a strong, unique secret
2. **Review RLS Policies**: Ensure they match your security requirements
3. **Enable Database Encryption**: Check Settings → Database encryption
4. **Regular Backups**: Enable automated backups
5. **Monitor Usage**: Check Storage and API usage limits

### Rate Limiting

Supabase has built-in rate limiting. For production with high traffic:

1. Upgrade to Pro plan if needed
2. Configure Custom Rate Limits (Pro plan feature)
3. Implement client-side caching with React Query

## Troubleshooting

### Issue: Can't connect to Supabase

**Solution:**
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
# Should output your Supabase URL

# Verify keys are correct in .env.local
# Check no extra spaces or quotes
```

### Issue: RLS policies blocking queries

**Solution:**
1. Go to Supabase dashboard
2. Check SQL Editor → Policies tab
3. Verify policies for each table
4. Test policy with:
```sql
SELECT * FROM messages LIMIT 1;
```

### Issue: Real-time updates not working

**Solution:**
1. Verify publication is enabled (Step 8)
2. Check browser console for subscription errors
3. Restart development server
4. Try in different browser tab

### Issue: Storage bucket not accessible

**Solution:**
```sql
-- Check bucket settings
SELECT * FROM storage.buckets WHERE name = 'chat-media';

-- Should show is_public = true
```

### Issue: Users can't upload files

**Solution:**
1. Verify bucket exists: `chat-media`
2. Check bucket is public
3. Verify CORS in Storage settings:
```json
[
  {
    "origin": "http://localhost:3000",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allowedHeaders": ["*"],
    "maxAgeSeconds": 86400
  }
]
```

## Helpful SQL Queries

### Count messages in a chat
```sql
SELECT COUNT(*) as total_messages 
FROM messages 
WHERE chat_id = 'chat-uuid-here';
```

### Get unread messages for a user
```sql
SELECT COUNT(*) as unread_count
FROM messages m
LEFT JOIN message_seen ms ON m.id = ms.message_id AND ms.user_id = 'user-uuid'
WHERE m.chat_id = 'chat-uuid' AND ms.id IS NULL;
```

### Check online users
```sql
SELECT username, is_online, last_seen 
FROM users 
WHERE is_online = true;
```

### Delete old messages (older than 30 days)
```sql
DELETE FROM messages 
WHERE created_at < NOW() - INTERVAL '30 days';
```

## Monitor and Maintain

### Weekly Checklist
- [ ] Check database size usage
- [ ] Verify backups are working
- [ ] Review error logs
- [ ] Check API usage

### Monthly Checklist
- [ ] Review and delete old media files
- [ ] Check and optimize slow queries
- [ ] Update dependencies
- [ ] Review security policies

## Getting Help

- **Supabase Docs**: https://supabase.com/docs
- **Discord Community**: https://discord.supabase.io
- **GitHub Issues**: Report bugs and request features
- **Status Page**: Check service status at status.supabase.com

---

**Ready to go! Your Bola Na chat application is now connected to Supabase.**
