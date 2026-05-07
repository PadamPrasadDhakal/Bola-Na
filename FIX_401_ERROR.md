# Fix 401 Unauthorized Error

## Problem
You're getting a **401 Unauthorized** error when accessing the Supabase API:
```
POST https://xntjgqzyytisiuphtibw.supabase.co/rest/v1/chats?select=*
Status Code: 401 Unauthorized
```

## Root Causes

1. **Migrations not applied** - Your database schema hasn't been deployed to Supabase
2. **RLS policies too strict** - The original policies require authentication and chat membership
3. **No authenticated user** - The API request is missing auth credentials

---

## Solution: Apply Development Migrations

### Step 1: Go to Supabase SQL Editor
1. Open: https://xntjgqzyytisiuphtibw.supabase.co
2. Click **SQL Editor** → **New Query**

### Step 2: Run Initial Schema (if not done yet)
Copy everything from: `supabase/migrations/001_initial_schema.sql`
Paste into SQL Editor and click **Run**

If you get `ERROR: 42P07: relation "users" already exists`, your schema is already present (fully or partially). Do not keep rerunning `001_initial_schema.sql` as-is.

### Step 3: Run Development RLS Policies
Copy everything from: `supabase/migrations/002_development_rls_policies.sql`
Paste into SQL Editor and click **Run**

This will:
✅ Create all tables  
✅ Create permissive RLS policies (for development)  
✅ Create test users (sohan, sandhya)  
✅ Enable Realtime subscriptions

### Recovery for `relation already exists`

Run this first to verify existing tables:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users','chats','chat_participants','messages','message_seen')
ORDER BY table_name;
```

If all 5 tables exist, skip `001_initial_schema.sql` and run only `002_development_rls_policies.sql`.

If some tables are missing, either:
1. Create only the missing tables manually from `001_initial_schema.sql`, then run `002_development_rls_policies.sql`, or
2. Reset your public schema (destructive) and rerun both migrations in order.

### Step 4: Verify Success
Run this query in SQL Editor:
```sql
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as chat_count FROM chats;
```

Should return counts without 401 error.

---

## If You Still Get 401 Error

### Check 1: Environment Variables
Verify `.env.local` has both:
```
NEXT_PUBLIC_SUPABASE_URL=https://xntjgqzyytisiuphtibw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xKdFZt0fhALc0GBp6pXyMA_qaLJPVSt
```

### Check 2: Disable RLS Temporarily (Debug)
In Supabase Dashboard:
1. Go to **Authentication** → **Policies**
2. For each table, click **Disable RLS** (temporarily)
3. Test API call
4. Re-enable RLS after debugging

### Check 3: Check Row Level Security
In Supabase Dashboard:
1. Go to **Database** → **Tables**
2. Click each table
3. Go to **RLS** tab
4. Verify policies are created

### Check 4: Clear Browser Cache
```bash
# Hard refresh browser
Ctrl + Shift + Delete  (on Chrome)
```

---

## Production RLS Policies

For production, replace the permissive policies with strict ones:

```sql
-- Users: Can read all, can update own profile
CREATE POLICY "users_select" ON users FOR SELECT USING (true);
CREATE POLICY "users_update" ON users FOR UPDATE USING (auth.uid() = id);

-- Chats: Can read if participant
CREATE POLICY "chats_select" ON chats FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_id = chats.id AND user_id = auth.uid()
  )
);

-- Messages: Can read if in chat
CREATE POLICY "messages_select" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_id = messages.chat_id AND user_id = auth.uid()
  )
);
```

---

## Quick Test

After applying migrations:

```bash
npm run dev
```

Then test login with:
- **Username**: sohan
- **Password**: Sohan@husband

The app should now work without 401 errors!
