# 🔑 Getting Fresh Supabase API Keys - Step by Step

## Your Project Details
- **Project ID:** uozchnrhxeiyywyvbyxb
- **Project URL:** https://uozchnrhxeiyywyvbyxb.supabase.co
- **Org:** OuafikMohammed's Org

## ⚡ Quick Start (5 Minutes)

### Step 1: Open Supabase Dashboard
1. Go to: **https://app.supabase.com**
2. Log in with your email/password
3. You should see: **OuafikMohammed's Org**

### Step 2: Select Your Project  
1. Click on the project: **uozchnrhxeiyywyvbyxb**
   - You'll see a card with the project name
   - Click anywhere on it to enter the project

### Step 3: Go to API Settings
1. In the left sidebar, scroll to the bottom
2. Click **Settings** (⚙️ icon)
3. A submenu opens
4. Click **API**
5. You're now in the API section

### Step 4: Copy the Keys

You'll see three sections:

#### A. **Project URL** (Top section)
Copy this exact URL:
```
https://uozchnrhxeiyywyvbyxb.supabase.co
```

#### B. **Project API keys** (Middle section)
You'll see a table with two rows:

**Row 1: "anon"** 
- Description: "Anon key" or "Public key"
- Copy this entire value (it's a long JWT token)
- This goes in: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Row 2: "service_role"**  
- Description: "Service role" or "Secret key"
- Click the **Eye icon 👁️** to reveal it
- Copy this entire value (it's also a long JWT token)
- This goes in: `SUPABASE_SERVICE_ROLE_KEY`
- ⚠️ **KEEP THIS SECRET!** Never share it.

### Step 5: Update .env.local

Open your file: `d:\PERSONAL PROJECTS\EstateFlow\.env.local`

Find and replace these three lines:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uozchnrhxeiyywyvbyxb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[PASTE_ANON_KEY_HERE]
SUPABASE_SERVICE_ROLE_KEY=[PASTE_SERVICE_ROLE_KEY_HERE]
```

Your final file should look like:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uozchnrhxeiyywyvbyxb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvemNobnJoeGVpeXl3eXZieXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NDI1NDQsImV4cCI6MjA4NDExODU0NH0.9Jt3h79gnAoY17pBicgrSLUkgKrpYniUXu7bRFtZZMY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvemNobnJoeGVpeXl3eXZieXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU0MjU0NCwiZXhwIjoyMDg0MTE4NTQ0fQ.[YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE]

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=wnMy0mJIl75G/Gsg0qe/w42smwTUyjwY1iv2FzK61M4=

# Google OAuth
GOOGLE_CLIENT_ID=6384997967-qbihtl5gl050nq19tcc3tfhiiusrfmot.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Step 6: Save & Restart Server

1. **Save** the .env.local file (Ctrl+S)
2. **Stop** the dev server (Ctrl+C in terminal)
3. **Wait** 2 seconds for it to fully stop
4. **Start** it again: `npm run dev`
5. **Wait** for message: `ready - started server on 0.0.0.0:3000`

### Step 7: Test Signup

1. Open: **http://localhost:3000/signup**
2. Fill in the form:
   ```
   Full Name: Test User
   Company: Test Company
   Email: test-unique-email-123@example.com
   Password: TestPassword123!
   ```
3. Click **Create Account**
4. Should redirect to: `/auth/confirm-email`

## ✅ Verify Your Keys Are Correct

Your keys should:
- ✅ Start with `eyJ` (JWT header)
- ✅ Have exactly **3 parts** separated by dots: `aaa.bbb.ccc`
- ✅ Be between 200-500 characters long
- ✅ Not have any spaces or line breaks

## ❌ Common Mistakes

| Mistake | Fix |
|---------|-----|
| Copied wrong key | Make sure you have "anon" key for ANON_KEY and "service_role" for SERVICE_ROLE_KEY |
| Missing parts of key | Copy the ENTIRE key value, including all characters |
| Key has spaces/newlines | Make sure it's one continuous string with no breaks |
| Old/expired keys | Get fresh keys from Supabase dashboard |
| Wrong project | Verify you're in project `uozchnrhxeiyywyvbyxb` |

## 🆘 If It Still Doesn't Work

1. **Check browser console** (F12):
   - Look for error messages
   - Report any `[SIGNUP ERROR]` messages

2. **Check server terminal**:
   - Look for logs that say `[SIGNUP ERROR]`
   - This will tell you the exact problem

3. **Common errors**:
   - **"Invalid API key"** → Keys don't match, get fresh ones
   - **"Missing required fields"** → Form validation error
   - **"Email already registered"** → Use different email
   - **"Database connection error"** → Check Supabase project status

## 📞 Need Help?

If keys are still invalid after getting fresh ones:

1. Go to: https://app.supabase.com/support
2. Create a support ticket
3. Include: Project ID `uozchnrhxeiyywyvbyxb`
4. Describe: "Service role key is invalid when trying to signup"
