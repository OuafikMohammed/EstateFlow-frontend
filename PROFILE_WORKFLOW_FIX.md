# User Profile Workflow - Complete Fix

## Problem
Users were getting "User profile not found" error when trying to login with an account that existed in Supabase auth but had no corresponding profile record.

**Root Cause:** 
- Old users created before the profile auto-creation system were missing profile records
- Signup flow wasn't guaranteed to create profiles if it failed partway through
- No database trigger to auto-create profiles on auth user creation

## Solution

The fix has 3 parts:

### Part 1: Auto-Create Profiles in Login Flow
**File:** `lib/actions/auth.ts`

Added `ensureUserProfile()` helper function that:
- Checks if user has a profile
- If missing, creates a default company and profile for them
- Allows users with missing profiles to login (instead of failing)

```typescript
// This function is called before fetching the profile
await ensureUserProfile(supabase, userId, userEmail)
```

### Part 2: Database Trigger for Automatic Profile Creation
**File:** `migrations/fix_profile_auto_creation.sql`

Run this migration in Supabase console (SQL Editor):
- Creates a trigger on `auth.users` table
- Automatically creates company and profile when new auth user is created
- Provides a safety net for any future users created outside our signup flow

**To apply:** Copy the SQL from the migration file and run in Supabase console

### Part 3: Fix Existing Users Without Profiles
**File:** `migrations/fix_existing_users_without_profiles.sql`

Run this migration in Supabase console to:
- Find all auth users without profiles
- Create companies for them
- Create profile records for them
- Link them together

**To apply:** Copy the SQL from the migration file and run in Supabase console

---

## Complete Workflow

### Signup Flow
```
User submits signup form
  ↓
Validate inputs (email, password, names)
  ↓
Create auth user in Supabase
  ↓
Create company record with user's email and company name
  ↓
Create profile with company_id, admin role
  ↓
Redirect to dashboard
```

**Error handling:** If any step fails, previous steps are rolled back (company and auth user deleted)

### Login Flow (Updated)
```
User submits login form
  ↓
Validate inputs (email, password)
  ↓
Authenticate with Supabase (verify password)
  ↓
CALL: ensureUserProfile() → If no profile exists, create one
  ↓
Fetch user profile from database
  ↓
Check if profile is active
  ↓
Redirect to dashboard
```

**Key change:** If user doesn't have a profile, it's created automatically instead of failing

---

## How to Fix Your Current Issue

### Step 1: Update Code (DONE ✅)
The signup and login flows in `lib/actions/auth.ts` have been updated with the `ensureUserProfile()` function.

### Step 2: Apply Database Migrations

#### Migration 1: Add Auto-Create Trigger
1. Open Supabase dashboard → Your Project
2. Go to SQL Editor
3. Copy content from `migrations/fix_profile_auto_creation.sql`
4. Paste into SQL Editor and run
5. Should see: "Success"

#### Migration 2: Fix Existing Users
1. Open Supabase dashboard → Your Project
2. Go to SQL Editor
3. Copy content from `migrations/fix_existing_users_without_profiles.sql`
4. Paste into SQL Editor and run
5. Should see rows affected message

### Step 3: Test
1. Stop dev server (Ctrl+C)
2. Start dev server: `npm run dev`
3. Try logging in with user that was failing before
4. Should now see success message and dashboard

---

## What Happens Behind the Scenes

### When User Logs In (Example)

```
User: john@example.com exists in auth.users (ID: abc123)
User: john@example.com NOT in profiles table

Login attempt:
  1. Authenticate: ✅ Password verified, auth session created
  2. Call ensureUserProfile('abc123', 'john@example.com')
     - Check if profile exists: ❌ Not found
     - Create company: ✅ Company created with name "john's Company"
     - Create profile: ✅ Profile created, linked to company, admin role
  3. Fetch profile: ✅ Profile now exists
  4. Check is_active: ✅ True
  5. Redirect: ✅ User sent to dashboard
```

### Error Scenarios

#### User has no profile, ensureUserProfile fails
- Company creation fails? → Login fails with "Failed to create user company"
- Profile creation fails? → Login fails with "Failed to create user profile"
- But most likely: One of these steps succeeds, user can login

#### User profile exists but is_active = false
- Immediately signs user out and shows: "Your account has been deactivated"

#### User profile exists and is_active = true
- Normal login flow, no ensureUserProfile call made

---

## Files Modified/Created

### Modified
- `lib/actions/auth.ts` - Added `ensureUserProfile()` function and updated `signIn()` to call it

### Created
- `migrations/fix_profile_auto_creation.sql` - Database trigger for auto-creating profiles
- `migrations/fix_existing_users_without_profiles.sql` - Migration to fix legacy users

---

## Important Notes

### The Fix is Backward Compatible
- Existing users with profiles: No change, works as before
- Existing users without profiles: Now automatically fixed on login
- New users: Signup creates profile, trigger also creates as backup

### The Trigger Handles These Cases
1. User created through Supabase console (no profile created)
2. User created through a different app
3. User created through Supabase API without profile
4. Any future code that creates auth users without creating profiles

### The ensureUserProfile() Handles These Cases
1. Existing users from before profile system was implemented
2. Auth users created by mistake without profiles
3. Any user in the database that's missing a profile record

---

## Verification

### To Check if Users Have Profiles
Run this query in Supabase SQL Editor:

```sql
-- Find auth users without profiles
SELECT au.id, au.email, au.created_at, p.id as has_profile
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

**Result should be:**
- Empty (no rows) = All users have profiles ✅
- Has rows = Still missing profiles, run the fix migration again

### To Check if Trigger is Working
Run this query:

```sql
-- Check if trigger exists
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Expected result:**
- 1 row with trigger_name = "on_auth_user_created" ✅

---

## Troubleshooting

### Still Getting "User profile not found"?

**Cause 1: Migrations not applied**
- Check: Have you run both migration SQL files?
- Fix: Run the migrations in Supabase SQL Editor

**Cause 2: Code not reloaded**
- Check: Did you restart `npm run dev` after code changes?
- Fix: Stop dev server and start again

**Cause 3: Different Supabase project**
- Check: Is your app connected to the right Supabase project?
- Fix: Verify `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`

**Cause 4: RLS policy blocking profile creation**
- Check: Do RLS policies allow authenticated users to insert profiles?
- Fix: Check `supabase-schema.sql` for profiles RLS policies

### Migration Fails With Error?

**Error: "Duplicate key value violates unique constraint"**
- Cause: Profile already exists for this user
- Fix: Safe to ignore, profile already there

**Error: "Column not found"**
- Cause: Schema is different from expected
- Fix: Check your Supabase schema matches `supabase-schema.sql`

**Error: "Permission denied"**
- Cause: User doesn't have permission to run migration
- Fix: Use Supabase admin account to run migrations

---

## Security Notes

✅ **ensureUserProfile() is SECURE because:**
- Only runs after authentication is successful
- Only creates profiles for authenticated users
- Uses server-side database access (not exposed to client)
- Creates profiles with default values (admin role - adjust if needed)

✅ **Database trigger is SECURE because:**
- Uses SECURITY DEFINER to run with proper permissions
- Wrapped in exception handler to prevent errors from breaking signup
- Only creates one profile per auth user (can't be duplicated)

---

## What's Next

After applying these fixes:

1. ✅ All existing users can login (profiles auto-created if missing)
2. ✅ All new users get auto-created profiles (trigger + signup)
3. ✅ No more "User profile not found" errors

**Optional improvements:**
- Create a job to sync profiles monthly
- Add profile status dashboard to admin panel
- Implement user deactivation workflows
- Add profile verification step before dashboard access
