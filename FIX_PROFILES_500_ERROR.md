# 🔧 Fix: 500 Error on Profiles Query

## The Problem

```
GET /profiles?select=full_name,email,role,company_id&id=eq.bdbf3038...
Status: 500 Internal Server Error
```

The authentication is working (200 OK), but the profiles query is failing on Supabase.

---

## Root Causes (Most Likely)

### 1. ❌ RLS Policy Issue
The profiles table RLS policy is blocking the query.

### 2. ❌ No Profile Record Exists
The user doesn't have a profile in the database.

### 3. ❌ Query Syntax Error
The query format is incorrect.

---

## Solution: 3-Step Fix

### Step 1: Check RLS Policies in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Go to **Authentication** → **Policies** (or **SQL Editor**)
3. Run this query:

```sql
-- Check RLS policies on profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY tablename, policyname;
```

**Expected Result:** Should show at least one policy allowing users to read their own profiles.

**If missing, create the policy:**

```sql
-- Create RLS policy to allow users to read their own profile
CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

---

### Step 2: Verify Profile Record Exists

Run this query in Supabase SQL Editor:

```sql
-- Check if profile exists for the user
SELECT 
  id,
  full_name,
  email,
  role,
  company_id,
  is_active,
  created_at
FROM profiles
WHERE id = 'bdbf3038-b547-4ad0-ba80-d2d438da9301';
```

**Expected Result:** Should return one row with user's profile data.

**If NO result:** The profile doesn't exist. Create it:

```sql
-- Create missing profile
INSERT INTO profiles (id, full_name, email, role, company_id, is_active)
VALUES (
  'bdbf3038-b547-4ad0-ba80-d2d438da9301',
  'John Doe',  -- Replace with actual name
  'user@example.com',  -- Replace with actual email
  'Agent',  -- Replace with actual role
  NULL,  -- Add company_id if user has one
  true
);
```

---

### Step 3: Verify RLS is Enabled Correctly

Run this in SQL Editor:

```sql
-- Check if RLS is enabled on profiles table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';
```

**Expected Result:** `rowsecurity = true`

**If false:** Enable it:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## Complete Fix: Apply All at Once

If you want to fix everything in one go, run this in Supabase SQL Editor:

```sql
-- Step 1: Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies (if any conflict)
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Step 3: Create correct RLS policies
CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Step 4: Verify the user has a profile (check if empty first)
-- If no profiles exist, you may need to create them during signup

-- Check how many profiles exist
SELECT COUNT(*) as profile_count FROM profiles;

-- Check auth users
SELECT COUNT(*) as auth_user_count FROM auth.users;
```

---

## Testing After Fix

After applying the fix:

1. **Clear browser cache:**
   - Press `Ctrl+Shift+Delete`
   - Clear all cookies and cache
   - Close browser completely

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Log in again:**
   - Go to `http://localhost:3000/login`
   - Log in with your user account

4. **Check the request:**
   - Open DevTools (F12)
   - Go to Network tab
   - The profiles request should return **200 OK** now

---

## If Still Getting 500 Error

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Go to **Logs** → **API** or **Postgres**
3. Look for error messages related to the profiles query
4. Common errors:
   - `permission denied for schema public` → RLS policy issue
   - `relation "profiles" does not exist` → Table not created
   - `column "..." does not exist` → Schema mismatch

### Double-Check Your Query

Make sure the code uses the correct syntax:

```tsx
// ❌ WRONG - using 'id' as filter (not how it works)
const { data } = await supabase
  .from("profiles")
  .select("full_name, email, role, company_id")
  .eq("id", user.id)  // This is the user's ID column
  .single()

// ✅ CORRECT - Same as above, but make sure user.id matches
```

---

## Prevention: Automatic Profile Creation

To prevent this in the future, create profiles automatically on signup:

```tsx
// In your signup function
async function createUserProfile(userId: string, email: string, fullName: string) {
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: userId,  // Must match auth.users.id
      full_name: fullName,
      email: email,
      role: 'Agent',  // Default role
      is_active: true
    })
  
  if (error) {
    console.error('Error creating profile:', error)
    throw error
  }
}
```

---

## Quick Checklist

- [ ] Checked RLS policies exist
- [ ] Verified profile record exists for user
- [ ] Enabled RLS on profiles table
- [ ] Cleared browser cache
- [ ] Restarted dev server
- [ ] Tested login again
- [ ] Check DevTools Network tab shows 200 OK

---

## Need More Help?

### Common Issues & Solutions

**Q: "relation 'profiles' does not exist"**
A: The profiles table hasn't been created. Create it:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'Agent',
  company_id UUID REFERENCES companies(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Q: "permission denied"**
A: RLS policies are blocking. Create the policies shown above.

**Q: "column 'id' does not exist"**
A: The profiles table schema is different. Check Supabase table definition.

---

## Status

- ❌ **Before:** 500 Error on profiles query
- ✅ **After:** 200 OK with user profile data
- 🎯 **Time to Fix:** 5-10 minutes

Apply the fixes above and let me know if it works!
