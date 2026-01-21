# Fix Google OAuth redirect_uri_mismatch Error

## Problem
```
Error 400: redirect_uri_mismatch
Callback URL: https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback
```

This means Google Cloud Console doesn't recognize this callback URL.

---

## Solution: Add Redirect URIs to Google Cloud Console

### Step 1: Open Google Cloud Console
1. Go to https://console.cloud.google.com
2. Select your project (top left dropdown)
3. Search for "OAuth" in the search bar
4. Click on **Credentials** from the results

### Step 2: Find Your OAuth Client
1. Click on **APIs & Services** > **Credentials**
2. Under "OAuth 2.0 Client IDs", click on your Web Client ID
   - Should look like: `6384997967-qbihtl5gl050nq19tcc3tfhiiusrfmot.apps.googleusercontent.com`

### Step 3: Add Redirect URIs
You need to add BOTH of these URIs:

#### For Local Development:
```
http://localhost:3000/auth/v1/callback
```

#### For Production (Supabase):
```
https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback
```

### Step 4: Update the Form
1. In Google Cloud Console, find the **"Authorized redirect URIs"** section
2. Click **+ Add URI**
3. Enter: `http://localhost:3000/auth/v1/callback`
4. Click **+ Add URI** again
5. Enter: `https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback`
6. Click **Save**

### Step 5: Copy Client ID & Secret (if needed)
While you're here, verify your credentials:
- Client ID: Should be `6384997967-qbihtl5gl050nq19tcc3tfhiiusrfmot.apps.googleusercontent.com`
- Client Secret: Should be `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`

These are already in your `.env.local` ✅

---

## What Your Google OAuth Settings Should Look Like

```
OAuth 2.0 Client ID (Web application)
├─ Client ID: 6384997967-qbihtl5gl050nq19tcc3tfhiiusrfmot.apps.googleusercontent.com
├─ Client Secret: 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
├─ Authorized JavaScript origins:
│  ├─ http://localhost:3000          ✅
│  └─ https://uozchnrhxeiyywyvbyxb.supabase.co  ✅
└─ Authorized redirect URIs:
   ├─ http://localhost:3000/auth/v1/callback     ✅
   └─ https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback  ✅
```

---

## After Making Changes

### Wait 5-10 Minutes
Google takes a few minutes to propagate changes. Don't test immediately.

### Clear Cache
1. Open your browser DevTools (F12)
2. Right-click the refresh button
3. Click "Empty cache and hard refresh"

### Test Again
1. Go to http://localhost:3000/signup
2. Click "Sign Up with Google"
3. Should now redirect to Google without error

---

## If Still Getting Error

### Check 1: Exact URL Match
- Verify there are NO extra spaces or typos
- Copy-paste from here:
  ```
  http://localhost:3000/auth/v1/callback
  https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback
  ```

### Check 2: HTTPS vs HTTP
- Local development: Use `http://` NOT `https://`
- Production: Use `https://`

### Check 3: Browser Console
1. Open Browser DevTools (F12)
2. Go to Console tab
3. Look for error messages with exact redirect_uri being sent
4. Verify it matches what you added to Google

### Check 4: Clear Browser Storage
1. Open DevTools (F12)
2. Go to Application > Cookies
3. Delete all cookies from `localhost:3000`
4. Try again

---

## Visual Guide (What to Click)

```
Google Cloud Console
  └─ Credentials (left sidebar)
     └─ OAuth 2.0 Client IDs
        └─ Click on your Web Client ID
           └─ Authorized redirect URIs section
              └─ Add both URLs:
                 ├─ http://localhost:3000/auth/v1/callback
                 └─ https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback
              └─ Click Save
```

---

## Common Mistakes

❌ Using `https://` for localhost
```
WRONG: https://localhost:3000/auth/v1/callback
RIGHT: http://localhost:3000/auth/v1/callback
```

❌ Extra `/` at the end
```
WRONG: https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback/
RIGHT: https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback
```

❌ Wrong domain
```
WRONG: https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback
RIGHT: https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback
```

❌ Not adding both URLs
```
WRONG: Only adding production URL
RIGHT: Add BOTH local AND production URLs
```

---

## Also Verify Supabase Settings

Make sure Google is enabled in Supabase:

1. Open https://app.supabase.com
2. Select EstateFlow project
3. Go to **Authentication** > **Providers**
4. Click **Google** to expand
5. Toggle **Google Enabled** to **ON**
6. Enter credentials:
   - Client ID: `6384997967-qbihtl5gl050nq19tcc3tfhiiusrfmot.apps.googleusercontent.com`
   - Client Secret: `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`
7. Click **Save**

---

## Testing Flow After Fix

1. **Clear browser cache** (important!)
2. **Start dev server** if not already running:
   ```bash
   pnpm dev
   ```
3. **Go to signup**: http://localhost:3000/signup
4. **Click "Sign Up with Google"**
5. **Should redirect to Google** without error

If you see the Google consent screen, the fix worked! ✅

---

## Still Having Issues?

### Check the Exact Error
When you click "Sign Up with Google" and get the error, look at the URL. It should show something like:

```
?error=redirect_uri_mismatch&...
```

The URL might also show the redirect_uri it's trying to use. Make sure it matches what you added to Google.

### Check Console Logs
Open Browser DevTools (F12) > Console and look for:
- Any error messages
- The exact redirect_uri being sent

### Verify Environment Variables
```
Your .env.local should have:
GOOGLE_CLIENT_ID=6384997967-qbihtl5gl050nq19tcc3tfhiiusrfmot.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

If you changed these, restart dev server: Ctrl+C then `pnpm dev`

---

**TL;DR**: Add these two URLs to Google Cloud Console in **Authorized redirect URIs**:
- `http://localhost:3000/auth/v1/callback`
- `https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback`

Then wait 5 minutes and try again. ✅
