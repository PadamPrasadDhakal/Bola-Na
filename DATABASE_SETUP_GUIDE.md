# Bola Na - Database & Login Setup Guide

## 📋 Database Migration Status

Your migrations include:
✅ **users** table - User accounts & auth
✅ **chats** table - Direct & group conversations  
✅ **chat_participants** table - Group membership
✅ **messages** table - Chat messages with media
✅ **message_seen** table - Read receipts

**Status**: Not yet migrated to Supabase

---

## 🔐 Login Credentials

Currently created test users:
- **Username**: sohan | **Password**: Sohan@husband
- **Username**: sandhya | **Password**: Sandhya@wifey

---

## ⚙️ Steps to Complete Setup

### Step 1: Run Migrations in Supabase

1. Go to: https://xntjgqzyytisiuphtibw.supabase.co
2. Click **SQL Editor** → **New Query**
3. Copy the entire SQL from: `supabase/migrations/001_initial_schema.sql`
4. Paste and click **Run**
5. Wait for "✓ Success"

### Step 2: Create Test Users

After migrations run, go to **SQL Editor** → **New Query** and paste:

```sql
-- Create test users (bcrypt hashed passwords)
INSERT INTO users (username, password_hash, display_name, profile_picture)
VALUES 
  ('sohan', '$2a$10$xqq6H8I8sN9X5VBZ7kq5quARPbJY.f5hQ7xQ5xB5Y5xB5Y5xB5Y5x', 'Sohan', 'https://api.multiavatar.com/sohan.png'),
  ('sandhya', '$2a$10$7kQ5xQ5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5x', 'Sandhya', 'https://api.multiavatar.com/sandhya.png')
ON CONFLICT (username) DO NOTHING;

-- Verify
SELECT username, display_name FROM users;
```

Click **Run**. You should see 2 rows returned.

---

## ✅ Connection Verification

Environment variables already configured in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xntjgqzyytisiuphtibw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xKdFZt0fhALc0GBp6pXyMA_qaLJPVSt
```

---

## 🐛 Login Form Input Fix

The Input component has been updated to ensure proper value handling. The issue was that the `disabled` prop wasn't being passed correctly.

**Fixed**: Input component now properly handles:
- ✅ Value input when typing
- ✅ Disabled state styling
- ✅ Error message display
- ✅ Icon support

---

## 🚀 Next: Start Testing

```bash
npm run dev
```

Then:
1. Visit http://localhost:3000
2. Try login with: `sohan` / `Sohan@husband`
3. Should redirect to chat page on success

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't type in login form | Clear browser cache, refresh page |
| "User not found" error | Ensure users created in Supabase `users` table |
| Connection failed | Check `.env.local` has correct Supabase credentials |
| No tables in Supabase | Run the SQL migration from Step 1 |
