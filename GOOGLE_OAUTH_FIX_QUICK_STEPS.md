# Google OAuth Fix - Step-by-Step Guide (Visual)

## The Problem
You're getting: **Error 400: redirect_uri_mismatch**

This happens because Google doesn't recognize the callback URL that Supabase is trying to use.

---

## Quick Fix (2 minutes)

### Step 1: Open Google Cloud Console
```
https://console.cloud.google.com
```
- Select your project from dropdown (top-left)

### Step 2: Go to Credentials
In left sidebar:
```
APIs & Services
  └─ Credentials
```

### Step 3: Find OAuth Client
Under "OAuth 2.0 Client IDs" section, click on:
```
Web client (your app)
```

It looks like this in the list:
```
Name: Web client (or your project name)
Client ID: 6384997967-qbihtl5gl050nq19tcc3tfhiiusrfmot.apps.googleusercontent.com
```

### Step 4: Add Redirect URIs
Scroll down to **"Authorized redirect URIs"** section.

You'll see empty field(s). Click **"+ Add URI"** button.

**Add this URL:**
```
http://localhost:3000/auth/v1/callback
```

Click **"+ Add URI"** again.

**Add this URL:**
```
https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback
```

### Step 5: Save
Click **SAVE** button (bottom right of the form).

### Step 6: Wait
Google takes 5-10 minutes to apply changes.

### Step 7: Test
1. Hard refresh your browser: **Ctrl+Shift+R** (or Cmd+Shift+R on Mac)
2. Clear cookies: F12 > Application > Cookies > Clear
3. Go to: **http://localhost:3000/signup**
4. Click **"Sign Up with Google"**
5. Should work! ✅

---

## What Your Settings Should Look Like

### Before (❌ Wrong)
```
OAuth 2.0 Client ID
├─ Client ID: 6384997967-...apps.googleusercontent.com
├─ Client Secret: GOCSPX-...
├─ Authorized JavaScript origins:
│  └─ [empty or missing]
└─ Authorized redirect URIs:
   └─ [empty or incorrect URLs]
```

### After (✅ Correct)
```
OAuth 2.0 Client ID
├─ Client ID: 6384997967-...apps.googleusercontent.com
├─ Client Secret: GOCSPX-...
├─ Authorized JavaScript origins:
│  ├─ http://localhost:3000          ✅
│  └─ https://uozchnrhxeiyywyvbyxb.supabase.co  ✅
└─ Authorized redirect URIs:
   ├─ http://localhost:3000/auth/v1/callback     ✅
   └─ https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback  ✅
```

---

## Exact URLs to Add

### Copy-Paste These Exactly

**URL #1 (Local Development):**
```
http://localhost:3000/auth/v1/callback
```

**URL #2 (Production):**
```
https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback
```

⚠️ Make sure:
- ✅ No extra spaces
- ✅ No typos
- ✅ Exact case (lowercase)
- ✅ No trailing slash `/`

---

## Verify Your Env File

Open `.env.local` and check these are there:

```env
GOOGLE_CLIENT_ID=6384997967-qbihtl5gl050nq19tcc3tfhiiusrfmot.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

If you changed them, restart: **Ctrl+C** then **pnpm dev**

---

## Chrome DevTools Debugging

If still getting error:

1. **Open DevTools**: F12
2. **Go to Network tab**
3. **Try Google sign up again**
4. **Look for request starting with:**
   ```
   accounts.google.com/...
   ```
5. **Click on it**
6. **Check the redirect_uri in the URL**
7. **Verify it matches what you added to Google**

---

## Timeline

```
Now:    Add URLs to Google Cloud Console
+5min:  Google applies changes (might be instant)
+5min:  Clear browser cache (Ctrl+Shift+R)
+2min:  Test signup with Google
```

**Total time: ~10-15 minutes** ⏱️

---

## If Still Not Working

### Troubleshooting Checklist

- [ ] Added `http://localhost:3000/auth/v1/callback`?
- [ ] Added `https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback`?
- [ ] Clicked **SAVE** button?
- [ ] Waited 5+ minutes?
- [ ] Did hard refresh (Ctrl+Shift+R)?
- [ ] Cleared browser cookies?
- [ ] Checked .env.local has correct credentials?
- [ ] Restarted dev server (Ctrl+C, then pnpm dev)?

### Check Google Settings Directly

Go back to Google Cloud Console:
1. Click on your Web Client ID again
2. Scroll to **Authorized redirect URIs**
3. Verify BOTH URLs are showing:
   ```
   ✅ http://localhost:3000/auth/v1/callback
   ✅ https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback
   ```

If not showing, click **+ Add URI** and add them again.

---

## Success Signs

When it's working, you'll see:

1. Click "Sign Up with Google" on signup page
2. ✅ Redirects to Google (not error page)
3. ✅ Google consent screen appears
4. ✅ Sign in with your Google account
5. ✅ Redirected back to your app
6. ✅ User created in database

---

## Alternative: Use Email/Password

While you're fixing Google OAuth, you can still test with email:

1. Go to: http://localhost:3000/signup
2. Use "Email & Password" instead
3. Fill form:
   - Company: "Your Company"
   - Name: "Your Name"
   - Email: "test@example.com"
   - Password: "SecurePass123!@#"
4. Click "Sign Up"
5. Should work and redirect to onboarding ✅

This lets you test the whole flow while fixing Google OAuth.

---

**Summary**: Add 2 URLs to Google Cloud Console, wait 5 minutes, clear cache, done! ✅
