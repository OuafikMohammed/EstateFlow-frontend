# Google OAuth Fix - Exact Location Guide

## The Error You're Getting

```
Error 400: redirect_uri_mismatch
Callback URL: https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback
```

This means Google doesn't have this URL registered.

---

## STEP-BY-STEP: Where to Add the URLs

### Step 1️⃣: Open Google Cloud Console
```
URL: https://console.cloud.google.com
```

You should see this at the top-left:
```
┌──────────────────────────────┐
│  [Google Cloud] [▼ Project]  │
└──────────────────────────────┘
```

**Click the Project Dropdown** and select your project (if not already selected).

---

### Step 2️⃣: Go to APIs & Services

On the **left sidebar**, find:
```
APIs & Services
```

Click on it. It expands to show:
```
APIs & Services ▼
├─ Library
├─ Credentials      ← CLICK THIS
├─ OAuth consent screen
└─ Quotas
```

Click on **Credentials**.

---

### Step 3️⃣: Find Your OAuth Client

You're now on the Credentials page. Look for:
```
┌─────────────────────────────────────┐
│ OAuth 2.0 Client IDs                │
│                                     │
│ 🔹 Name: Web client                 │
│    Client ID: 6384997967-...        │
│    [Click to edit] ▶                │
└─────────────────────────────────────┘
```

**Click on the "Web client" entry** (or whatever it's named).

---

### Step 4️⃣: You're Now in Edit Mode

The page will show the full OAuth credentials. You'll see:
```
┌─────────────────────────────┐
│ OAuth 2.0 Client            │
│                             │
│ Client ID:                  │
│ 6384997967-...              │
│                             │
│ Client Secret:              │
│ GOCSPX-...                  │
│                             │
│ ✅ Authorized JavaScript    │
│    origins:                 │
│    • http://localhost:3000  │
│    • https://...supabase.co │
│                             │
│ ✅ Authorized redirect URIs:│
│    (This is what we fix!)   │
│                             │
└─────────────────────────────┘
```

---

### Step 5️⃣: Find "Authorized redirect URIs"

**Scroll down** to find this section:
```
┌──────────────────────────────┐
│ Authorized redirect URIs     │
│                              │
│ [ input field or list ]      │
│                              │
│ [+ Add URI] button           │
└──────────────────────────────┘
```

---

### Step 6️⃣: Add the Local Development URL

**Click the [+ Add URI] button**.

A new empty field appears. **Type exactly:**
```
http://localhost:3000/auth/v1/callback
```

⚠️ Important:
- Start with `http://` (NOT https)
- Use `localhost:3000`
- End with `/auth/v1/callback`
- NO trailing slash

---

### Step 7️⃣: Add the Production URL

**Click [+ Add URI] again** to add another field.

**Type exactly:**
```
https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback
```

⚠️ Important:
- Start with `https://` (NOT http)
- Use your Supabase project URL
- End with `/auth/v1/callback`
- NO trailing slash

---

### Step 8️⃣: Verify Both URLs are Added

You should now see:
```
┌──────────────────────────────────────────┐
│ Authorized redirect URIs                 │
│                                          │
│ ✓ http://localhost:3000/auth/v1/callback│
│ ✓ https://uozchnrhxeiyywyvbyxb.supabase │
│     .co/auth/v1/callback                 │
│                                          │
│ [+ Add URI]                              │
│                                          │
│ [SAVE]  [CANCEL]                         │
└──────────────────────────────────────────┘
```

---

### Step 9️⃣: Click SAVE

At the **bottom right** of the form, click the blue **[SAVE]** button.

You should see a message like:
```
✅ OAuth client updated
```

---

### Step 🔟: Wait for Google to Process

Google takes **5-10 minutes** to apply the changes.

**Don't test immediately!** ⏳

---

## What You Just Did

You added 2 redirect URIs to your Google OAuth client:

| Environment | URL |
|-------------|-----|
| Local Dev | `http://localhost:3000/auth/v1/callback` |
| Production | `https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback` |

Now Google knows these are valid callback URLs for your app.

---

## After the Fix

### Wait 5-10 Minutes ⏳

Then:

### Clear Browser Cache
```
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

Or manually:
1. F12 to open DevTools
2. Application tab
3. Cookies > localhost
4. Delete all
5. Close tab
6. Reopen http://localhost:3000

### Test
1. Go to: **http://localhost:3000/signup**
2. Click: **"Sign Up with Google"**
3. Should see Google consent screen ✅

If you see **Google login page**, it worked! 🎉

---

## If You Need to Find These Settings Again

From Google Cloud Console:

```
APIs & Services
  └─ Credentials
     └─ OAuth 2.0 Client IDs
        └─ Web client (click to edit)
           └─ Authorized redirect URIs (scroll down to find)
```

---

## Double-Check Your URLs

Before clicking SAVE, verify these are EXACTLY correct:

### Local URL ✓
```
http://localhost:3000/auth/v1/callback
```

Check for:
- ✅ `http://` (not https)
- ✅ `localhost:3000` (not 127.0.0.1)
- ✅ `/auth/v1/callback` (exact path)
- ✅ NO `/` at the end

### Production URL ✓
```
https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback
```

Check for:
- ✅ `https://` (not http)
- ✅ `uozchnrhxeiyywyvbyxb.supabase.co` (your project URL)
- ✅ `/auth/v1/callback` (exact path)
- ✅ NO `/` at the end

---

## Common Mistakes to Avoid

### ❌ Wrong: Using https for localhost
```
https://localhost:3000/auth/v1/callback
```
→ Change to `http://` (not https)

### ❌ Wrong: Missing /callback
```
http://localhost:3000/auth/v1
```
→ Add `/callback` at the end

### ❌ Wrong: Extra slash at end
```
http://localhost:3000/auth/v1/callback/
```
→ Remove the trailing `/`

### ❌ Wrong: Wrong domain
```
http://localhost:8000/auth/v1/callback
```
→ Use port `3000`, not `8000`

### ❌ Wrong: Only adding one URL
→ Add BOTH local AND production

---

## Screenshots Description

If this guide is unclear, Google the term **"Google Cloud Console OAuth redirect URI"** and you'll find visual guides showing:

1. How to navigate to Credentials
2. Where the "Authorized redirect URIs" field is
3. How to click "Add URI" button
4. Where to paste the URLs
5. Where the SAVE button is

Most screenshots will look very similar to what I've described above.

---

## Verification

After saving, you can verify by:

1. Going back to the Credentials page
2. Clicking on your OAuth client again
3. Scrolling to "Authorized redirect URIs"
4. Seeing both URLs listed:
   ```
   ✓ http://localhost:3000/auth/v1/callback
   ✓ https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback
   ```

If you see them there, you're good! ✅

---

## Timeline

```
T+0min:   Add URLs to Google Cloud Console
T+1min:   Click SAVE
T+5min:   Google processes (might be instant)
T+5min:   Clear browser cache
T+7min:   Test signup with Google
T+8min:   Success! ✅
```

**Total: ~10 minutes**

---

## Still Getting Error?

### Check 1: Exact URL Match
Copy these exactly (no modifications):
- `http://localhost:3000/auth/v1/callback`
- `https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback`

### Check 2: Waited Long Enough
Google sometimes takes 5-10 minutes. If it's been less than 5 minutes, wait and try again.

### Check 3: Hard Refresh
```
Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

### Check 4: Check Google Console
Go back to Credentials, click your OAuth client, scroll down, and verify the URLs are actually saved there.

If they're not showing, you didn't click SAVE successfully.

---

**You've got this! The fix is simple: add 2 URLs, wait 5 min, refresh, done.** ✅
