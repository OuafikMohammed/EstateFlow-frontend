# Signup Database Error Fix

## Problem
When users tried to sign up, they received: **"Database error saving new user"** (Status 500)

## Root Cause
The issue was a conflict between:
1. **Database Trigger**: Automatically created a profile for each new auth user, assigning them a random company
2. **Signup Logic**: Tried to UPDATE that profile with the correct company_id
3. **RLS Policies**: Required the user to be an 'admin' to update profiles, but new users are 'agent' by default

The sequence of events:
```
1. User signs up → Auth user created
   ↓
2. Trigger fires → Auto-creates profile as 'agent' with wrong company_id
   ↓
3. Signup logic tries to UPDATE profile
   ↓
4. RLS policy blocks UPDATE (requires role='admin', but user is 'agent')
   ↓
5. Error: "Unexpected failure" (500)
```

## Solution
**Removed the automatic trigger** and **changed signup to INSERT directly**

### Changes Made

#### 1. Database Schema (`supabase-schema.sql`)
- ❌ **Removed**: The `on_auth_user_created` trigger that auto-created profiles
- ❌ **Removed**: The `handle_new_user()` function
- ✅ **Added**: New RLS policy `"Users can insert their own profile"` to allow users to create their own profile during signup

#### 2. Signup Logic (`lib/actions/auth.ts`)
Changed from:
```typescript
// OLD: Update existing profile (fails due to RLS)
const { error: profileError } = await supabase
  .from('profiles')
  .update({ company_id, full_name, role: 'admin' })
  .eq('id', userId)
```

To:
```typescript
// NEW: Insert new profile directly (allowed by RLS policy)
const { error: profileError } = await supabase
  .from('profiles')
  .insert({
    id: userId,
    company_id: companyId,
    full_name: formData.fullName.trim(),
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
```

## Benefits
✅ Eliminates RLS conflict  
✅ Gives first signup user 'admin' role (they deserve it!)  
✅ Better control over profile data on signup  
✅ Clearer signup flow (no hidden triggers)  
✅ Easier to debug and maintain  

## Testing
1. **Clear your build cache**: `.next` folder was deleted
2. **Restart dev server**: Run `pnpm dev`
3. **Try signing up** with a new account
4. **Verify**: New user has admin role and correct company_id

## If Still Getting Errors

If you're still getting database errors:

1. **Check Supabase Database** is initialized with the updated schema:
   ```bash
   # Run migrations (if you have a migration system set up)
   # or manually execute supabase-schema.sql in your Supabase SQL editor
   ```

2. **Verify RLS Policy** exists:
   - Go to Supabase Dashboard → SQL Editor
   - Run: `SELECT * FROM auth.uid();` to verify auth context works

3. **Check auth.ts implementation**:
   - Ensure you're using `createClient()` correctly
   - The client must have proper permissions to insert into profiles

## Architecture Notes

The signup flow now works like this:
```
1. User submits form (email, password, name, company)
   ↓
2. Backend creates Supabase auth user
   ↓
3. Backend creates company record
   ↓
4. Backend creates profile record (INSERT, not UPDATE)
   ↓
5. RLS policy allows it because: id = auth.uid()
   ↓
6. Success! User can now login
```

Much simpler and more secure! 🎉
