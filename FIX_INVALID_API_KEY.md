# Fix: Invalid Supabase API Key

## Problem
Error: **"Failed to create user account: Invalid API key"**

This means your `SUPABASE_SERVICE_ROLE_KEY` is either:
- Missing or incomplete
- Malformed/corrupted
- Doesn't match your Supabase project
- Has expired

## Solution Steps

### Step 1: Get Fresh Keys from Supabase

1. Go to https://app.supabase.com
2. Log in with your account
3. Select your project (uozchnrhxeiyywyvbyxb)
4. Click **Settings** (bottom left)
5. Click **API** in the sidebar
6. Copy these keys:
   - **Project URL** (starts with https://uozchnrhx...)
   - **Anon key** (under "Project API keys")
   - **Service Role key** (under "Project API keys") ⚠️ Keep this SECRET!

### Step 2: Update .env.local

Replace the values in `d:\PERSONAL PROJECTS\EstateFlow\.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uozchnrhxeiyywyvbyxb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[paste-your-anon-key-here]
SUPABASE_SERVICE_ROLE_KEY=[paste-your-service-role-key-here]
```

### Step 3: Restart Dev Server

1. Stop the current dev server (Ctrl+C in the terminal)
2. Wait for it to fully stop
3. Run: `npm run dev`
4. Wait for "ready - started server on" message

### Step 4: Test Signup Again

Try signing up with:
- Email: test-email@example.com
- Password: TestPassword123!
- Full Name: Test User
- Company: Test Company

## Important Notes

- The service role key is **SENSITIVE** - never commit it to git
- It's already in `.gitignore` ✓
- Each environment should have its own keys
- Keys look like JWT tokens (3 parts separated by dots)

## Verification Checklist

- [ ] Copied fresh keys from Supabase dashboard
- [ ] Updated both URL and keys in .env.local
- [ ] Restarted dev server
- [ ] Server shows "ready" message
- [ ] Tried signup with new email address

## If Still Failing

1. Check Supabase project status (should be green)
2. Verify the URL matches the project ID (uozchnrhxeiyywyvbyxb)
3. Check if database migrations were applied:
   - Go to Supabase SQL Editor
   - Run: `SELECT * FROM companies LIMIT 1;`
   - If error: tables don't exist, run the migration
