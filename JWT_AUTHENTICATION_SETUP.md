# EstateFlow JWT Authentication - Complete Fix Guide

## 🔍 Your Supabase Project Status

✅ **Project:** uozchnrhxeiyywyvbyxb  
✅ **URL:** https://uozchnrhxeiyywyvbyxb.supabase.co  
✅ **Database Schema:** Fully configured with all tables and RLS policies  
✅ **Auth Users:** 8 users already created  
❌ **API Keys:** Service role key is INVALID or EXPIRED  

## 🔧 The Real Problem

Your **SUPABASE_SERVICE_ROLE_KEY** is not working because:
1. It may be expired or invalid
2. It doesn't match your current Supabase project
3. It may have been copied incorrectly

## ✅ Step-by-Step Fix

### Step 1: Get Fresh API Keys from Supabase

1. Go to: **https://app.supabase.com**
2. Log in with your account
3. Click on project: **uozchnrhxeiyywyvbyxb**
4. Go to **Settings** (⚙️ icon, bottom left)
5. Click **API** in the sidebar
6. You'll see:
   - **Project URL** (should be: https://uozchnrhxeiyywyvbyxb.supabase.co)
   - **Project API Keys** section:
     - `anon` (public key) - for browser
     - `service_role` (secret key) - for server-side ONLY

### Step 2: Update Your .env.local File

Replace these exact values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uozchnrhxeiyywyvbyxb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[paste-the-anon-key-you-copied-from-supabase-dashboard]
SUPABASE_SERVICE_ROLE_KEY=[paste-the-service_role-key-you-copied-from-supabase-dashboard]

# NextAuth Configuration (keep as is)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=wnMy0mJIl75G/Gsg0qe/w42smwTUyjwY1iv2FzK61M4=

# Google OAuth (keep as is)
GOOGLE_CLIENT_ID=6384997967-qbihtl5gl050nq19tcc3tfhiiusrfmot.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

⚠️ **IMPORTANT:** 
- `SUPABASE_SERVICE_ROLE_KEY` is **SECRET** - never commit it to git
- It's already in `.gitignore` ✓
- The `.env.local` file is local-only, not synced

### Step 3: Verify Key Format

The keys should look like:

**Anon Key (public):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvemNobnJoeGVpeXl3eXZieXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NDI1NDQsImV4cCI6MjA4NDExODU0NH0.9Jt3h79gnAoY17pBicgrSLUkgKrpYniUXu7bRFtZZMY
```

**Service Role Key (secret):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvemNobnJoeGVpeXl3eXZieXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU0MjU0NCwiZXhwIjoyMDg0MTE4NTQ0fQ.[something-different]
```

Both are JWT tokens with 3 parts separated by dots: `header.payload.signature`

### Step 4: Restart Dev Server

```bash
# Stop the current server (Ctrl+C in the terminal)
# Wait for it to stop

# Start it again
npm run dev

# Wait for "ready - started server on 0.0.0.0:3000"
```

### Step 5: Test the Authentication Flow

1. **Open:** http://localhost:3000/signup
2. **Fill in the form:**
   - Full Name: `Test User`
   - Company: `Test Company`
   - Email: `test-new-email@example.com` (use a NEW email, not old ones)
   - Password: `TestPassword123!` (meets all requirements)

3. **Submit and check:**
   - Should redirect to `/auth/confirm-email`
   - Check browser console (F12) for errors
   - Check terminal for `[SIGNUP ERROR]` logs

## 🔐 How JWT Authentication Works in Your App

### Signup Flow (with JWT)
```
1. User fills signup form
2. POST to /api/auth/signup with credentials
3. Supabase creates auth.users entry (JWT capable)
4. Your code creates companies + profiles tables
5. Session cookie set with JWT automatically
6. User redirected to /auth/confirm-email
7. Email confirmation link provided
8. After confirming, user can login with JWT
```

### Login Flow (with JWT)
```
1. User enters email + password
2. Supabase validates against auth.users
3. JWT token issued (access + refresh)
4. Session cookie set with JWT
5. Middleware validates JWT on protected routes
6. User sees personalized dashboard
```

### Logout Flow (JWT cleanup)
```
1. User clicks logout button
2. Session cookie cleared
3. JWT token invalidated
4. User redirected to /login
```

## 📊 Current Database Status

- ✅ **companies:** 0 rows (will be created on signup)
- ✅ **profiles:** 0 rows (will be created on signup)  
- ✅ **auth.users:** 8 rows (from test signups)
- ✅ **All other tables:** Empty but ready

## 🧪 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Invalid API key" | Keys don't match - get fresh ones from Supabase dashboard |
| "Missing required fields" | Make sure all form fields are filled |
| "Email already registered" | Use a different email (not one you've tried before) |
| Server doesn't restart | Close all terminals, open new one, run `npm run dev` |
| Keys look different | Each project has unique keys - verify you're in right project |

## 🔍 Verify Setup is Correct

Run this in your server terminal to see environment validation:

```bash
# The server should show:
# ✓ NEXT_PUBLIC_SUPABASE_URL is set
# ✓ SUPABASE_SERVICE_ROLE_KEY is set  
# ✓ JWT authentication ready
```

## Next Steps After Signup Works

1. ✅ Test full signup flow
2. ✅ Test login with JWT
3. ✅ Test logout
4. ✅ Test protected routes with middleware
5. ✅ Test Google OAuth integration
6. ✅ Deploy to production with new keys

---

**After updating .env.local and restarting the server, try signing up again!**
