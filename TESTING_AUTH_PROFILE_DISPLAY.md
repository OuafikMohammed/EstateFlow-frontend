# 🧪 Testing Guide - User Authentication & Profile Display

## Pre-Testing Checklist

- [ ] Dev server is running (`npm run dev`)
- [ ] Supabase is connected and active
- [ ] Database tables exist: `auth.users`, `profiles`, `companies`
- [ ] Browser console (F12) is open for debugging

---

## Test 1: Landing Page - Not Logged In

### Steps:
1. Open incognito/private window (or logout first)
2. Navigate to `http://localhost:3000`
3. Look at the navbar on the right side

### Expected Result: ✅
- [ ] "Sign In" button visible
- [ ] "Get Started ▶" button visible
- [ ] No profile card shown
- [ ] No dropdown menu

### What to Check:
- Both buttons should be clickable
- No console errors should appear

---

## Test 2: Landing Page - Logged In

### Steps:
1. Log in with a valid user account
2. Navigate back to `http://localhost:3000`
3. Check the navbar on the right side

### Expected Result: ✅
- [ ] Profile button with initials (e.g., "JD") visible
- [ ] User info card visible on desktop (shows name and role)
- [ ] "Sign In" and "Get Started" buttons NOT visible
- [ ] No loading spinner (or brief skeleton)

### What to Check:
- Initials match user's name
- Profile card shows correct name
- Profile card shows correct role

---

## Test 3: Profile Dropdown Menu

### Steps:
1. Logged in on landing page
2. Click on the rounded profile button (with initials)
3. Dropdown menu should appear

### Expected Result: ✅
- [ ] User name displayed
- [ ] User email displayed
- [ ] Company name displayed (if user has company)
- [ ] "⚙️ Settings" menu item visible
- [ ] "🚪 Logout" menu item visible (in red)

### What to Check:
```
Dropdown should show:
┌──────────────────────────────┐
│ John Doe                     │
│ john@email.com              │
│ ACME Realty Co              │
├──────────────────────────────┤
│ ⚙️  Settings               │
├──────────────────────────────┤
│ 🚪 Logout                  │
└──────────────────────────────┘
```

---

## Test 4: Settings Link

### Steps:
1. Logged in on landing page
2. Click profile button
3. Click "⚙️ Settings"

### Expected Result: ✅
- [ ] Navigate to `/settings` page
- [ ] Settings page loads successfully
- [ ] User profile information visible on settings page

---

## Test 5: Logout Function

### Steps:
1. Logged in on landing page
2. Click profile button
3. Click "🚪 Logout"

### Expected Result: ✅
- [ ] Page redirects to login page
- [ ] Session cleared
- [ ] Landing page shows "Sign In" and "Get Started" buttons again
- [ ] No console errors

---

## Test 6: Sidebar Profile Card

### Steps:
1. Log in to the application
2. Navigate to `/dashboard`
3. Look at the sidebar on the left

### Expected Result: ✅
- [ ] Profile card shows at bottom of sidebar
- [ ] User avatar with initials displayed
- [ ] User name displayed (actual user, not "Ahmed El Mansouri")
- [ ] User role displayed
- [ ] Company name displayed

### What to Check:
```
Sidebar should show:
┌──────────────────────┐
│ 📊 Dashboard         │
│ 🏠 Properties        │
│ ...menu items...     │
├──────────────────────┤
│ [JD]                 │
│ John Doe            │
│ Agent                │
│ ACME Realty         │
└──────────────────────┘
```

---

## Test 7: Mobile Responsive (Landing Page)

### Steps:
1. Open landing page on mobile (or use DevTools)
2. Check viewport width < 640px
3. Look at navbar

### Expected Result: ✅
- [ ] User info card HIDDEN on small screens
- [ ] Profile button STILL VISIBLE
- [ ] Profile button clickable
- [ ] Dropdown menu appears correctly

---

## Test 8: Mobile Responsive (Sidebar)

### Steps:
1. Open dashboard on mobile (or use DevTools)
2. Check viewport width < 1024px
3. Toggle sidebar menu

### Expected Result: ✅
- [ ] Profile card visible when sidebar is open
- [ ] Profile card shows all information
- [ ] Sidebar collapse/expand works correctly

---

## Test 9: Data Synchronization

### Steps:
1. Logged in as User A
2. Open browser DevTools (F12)
3. In another browser tab, change User A's profile in Supabase
4. Return to first tab and refresh

### Expected Result: ✅
- [ ] Profile displays updated information
- [ ] No stale data shown

---

## Test 10: Error Handling

### Steps:
1. Logged in normally
2. Open DevTools (F12)
3. Go to Network tab
4. Find Supabase API calls to `profiles` table
5. Check if any errors occur

### Expected Result: ✅
- [ ] No 401/403 errors
- [ ] No CORS errors
- [ ] Console shows no error messages
- [ ] All API calls return 200 status

### Common Issues to Look For:
```
❌ "User profile not found" → Check database
❌ "CORS error" → Check Supabase configuration
❌ "Unauthorized" → Check authentication
❌ "Company not found" → Check company_id in profiles
```

---

## Test 11: Performance (Loading States)

### Steps:
1. Logged in on landing page
2. Watch the navbar while page loads
3. Should see loading skeleton briefly

### Expected Result: ✅
- [ ] Loading skeleton appears briefly (< 2 seconds)
- [ ] Profile card appears smoothly after loading
- [ ] No layout shift (CLS)

---

## Test 12: Multiple User Accounts

### Steps:
1. Log in as User A
2. Check profile shows User A's info
3. Logout
4. Log in as User B
5. Check profile shows User B's info

### Expected Result: ✅
- [ ] Each user sees their own information
- [ ] No data mixing between users
- [ ] Profile updates correctly on user switch

---

## Console Debugging

If tests fail, check browser console (F12 → Console tab):

### Good Signs: ✅
```
No errors
Profile data loaded successfully
Company data loaded successfully
```

### Bad Signs: ❌
```
Error fetching user: ...
Profile fetch error
CORS error from supabase
Unauthorized
User profile not found
```

---

## Supabase SQL Verification

To verify data exists in database:

```sql
-- Check if user has profile
SELECT 
  au.id,
  au.email,
  p.id as profile_exists,
  p.full_name,
  p.role,
  c.name as company_name
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN companies c ON p.company_id = c.id
WHERE au.email = 'test@example.com';
```

Expected result:
```
id        | email            | profile_exists | full_name | role  | company_name
----------|------------------|----------------|-----------|-------|------------------
abc123... | john@example.com | abc123...      | John Doe  | Agent | ACME Realty
```

---

## Test Results Template

Copy this template to document your testing:

```markdown
## Test Results

Date: ____________________
Tester: ____________________

### Test 1: Landing Page - Not Logged In
- Sign In button visible: [ ] ✅ [ ] ❌
- Get Started button visible: [ ] ✅ [ ] ❌
- Notes: _____________________________

### Test 2: Landing Page - Logged In
- Profile button visible: [ ] ✅ [ ] ❌
- User info card visible: [ ] ✅ [ ] ❌
- Notes: _____________________________

### Test 3: Profile Dropdown
- Dropdown opens: [ ] ✅ [ ] ❌
- All info displayed: [ ] ✅ [ ] ❌
- Notes: _____________________________

### Test 4: Settings Navigation
- Settings link works: [ ] ✅ [ ] ❌
- Page loads: [ ] ✅ [ ] ❌
- Notes: _____________________________

### Test 5: Logout
- Logout works: [ ] ✅ [ ] ❌
- Redirects correctly: [ ] ✅ [ ] ❌
- Notes: _____________________________

### Test 6: Sidebar Profile
- Shows user info: [ ] ✅ [ ] ❌
- Shows company: [ ] ✅ [ ] ❌
- Notes: _____________________________

### Overall Status
[ ] ✅ All tests passed
[ ] ⚠️  Some issues found
[ ] ❌ Critical issues

Issues to fix: _____________________________
```

---

## Quick Test Checklist (5 minutes)

For a quick sanity check:

- [ ] Load landing page (not logged in) → See login buttons
- [ ] Log in → See profile instead of login buttons
- [ ] Click profile → See dropdown menu
- [ ] Go to dashboard → See profile in sidebar
- [ ] Log out → See login buttons again

**If all above pass: ✅ Implementation is working!**

---

**Testing Guide Status:** ✅ Complete
