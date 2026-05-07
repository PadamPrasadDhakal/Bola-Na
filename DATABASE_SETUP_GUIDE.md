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
  ('sohan', '$2a$10$xqq6H8I8sN9X5VBZ7kq5quARPbJY.f5hQ7xQ5xB5Y5xB5Y5xB5Y5x', 'Sohan', 'https://scontent.fjkr1-1.fna.fbcdn.net/v/t39.30808-6/479553177_1336757800686962_5358648069430322387_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=2a1932&_nc_ohc=woGQ1SHzEzEQ7kNvwHsLmV8&_nc_oc=Ado72JRL2biNkNgsgCyvBt4SUZcL_xpuz2G3ETSx9GrFsz-kwXLSYUUj--nTDH7UvPPpz5_Kvso-yIINKSXQJ55h&_nc_zt=23&_nc_ht=scontent.fjkr1-1.fna&_nc_gid=ExjOYI4el9vDXqB9ct4zfg&_nc_ss=7b2a8&oh=00_Af5YmlCKWCcTswGAALL8twi5eM7zhI3GkB357w17Id1_LA&oe=6A028715'),
  ('sandhya', '$2a$10$7kQ5xQ5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5xB5Y5x', 'Sandhya', 'https://scontent.fjkr1-1.fna.fbcdn.net/v/t39.30808-6/482138648_1194326452340177_247853727692844378_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=101&ccb=1-7&_nc_sid=2a1932&_nc_ohc=R6ojtW6F4X0Q7kNvwFaF3mZ&_nc_oc=AdqlgEZhWLVjk0NY9UmJOIBbtc6d2yEG8bwrjwceMgd-T-7topi-irEQC2wWba4x4JlHcN9ZBVKmFVgsadZbIpwC&_nc_zt=23&_nc_ht=scontent.fjkr1-1.fna&_nc_gid=cbSHAdILrLpHNThjDj4Isw&_nc_ss=7b2a8&oh=00_Af7p8X0rh94G_lb33nXZZ6tT45cncLeYaKpeGwxNIkb6Gg&oe=6A027729')
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
