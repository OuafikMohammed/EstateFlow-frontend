# Quick Testing Guide - EstateFlow Authentication

## Start the App
```bash
npm run dev
# or
pnpm dev
```

App will run at `http://localhost:3000`

## Test Scenario 1: Fresh Signup (Recommended First Test)

1. **Open browser to** `http://localhost:3000/signup`
2. **Fill in the form:**
   - Company Name: `Test Company`
   - Full Name: `John Doe`
   - Email: `john.doe@example.com` (must be unique)
   - Password: `SecurePassword123`
   - Confirm Password: `SecurePassword123`
3. **Click "Create Account"**
4. **Expected:**
   - ✅ See green success toast: "Account created successfully..."
   - ✅ Redirected to `/dashboard` (auto-redirect, no button needed)
   - ✅ Navbar shows "J D" avatar with user initials
   - ✅ Dropdown shows user name, email, company

## Test Scenario 2: Login

1. **Open browser to** `http://localhost:3000/login`
2. **Fill in the form:**
   - Email: `john.doe@example.com` (from scenario 1)
   - Password: `SecurePassword123`
3. **Click "Sign In"**
4. **Expected:**
   - ✅ See green success toast: "Welcome back!"
   - ✅ Redirected to `/dashboard`
   - ✅ Navbar shows correct user info

## Test Scenario 3: Route Protection

1. **From dashboard, click logout**
   - ✅ See success toast
   - ✅ Redirected to home page `/`
   
2. **Try to visit** `http://localhost:3000/dashboard`
   - ✅ Automatically redirected to `/login`
   
3. **Try to visit** `http://localhost:3000/settings`
   - ✅ Automatically redirected to `/login`

## Test Scenario 4: Authenticated User Can't Access Login

1. **Make sure you're logged in**
2. **Visit** `http://localhost:3000/login`
   - ✅ Automatically redirected to `/dashboard`
3. **Visit** `http://localhost:3000/signup`
   - ✅ Automatically redirected to `/dashboard`

## Test Scenario 5: Error Handling

### Invalid Email
1. Open `/signup`
2. Enter: `invalidemail` (no @ symbol)
3. Click submit
4. **Expected:** Red error: "Please enter a valid email address" (stays on form)

### Password Too Short
1. Open `/signup`
2. Enter password: `123` (less than 8 characters)
3. Click submit
4. **Expected:** Red error: "Password must be at least 8 characters"

### Passwords Don't Match
1. Open `/signup`
2. Enter password: `SecurePass123`
3. Enter confirm: `DifferentPass456`
4. Click submit
5. **Expected:** Red error: "Passwords do not match"

### Duplicate Email
1. Open `/signup`
2. Enter email: `john.doe@example.com` (already exists)
3. Fill other fields
4. Click submit
5. **Expected:** Red error toast: "Email already registered"

### Wrong Password on Login
1. Open `/login`
2. Enter correct email but wrong password
3. Click submit
4. **Expected:** Red error toast: "Invalid email or password"

## Test Scenario 6: Settings Page

1. **From dashboard, click settings (gear icon)**
2. **Navigate to** `http://localhost:3000/settings`
3. **Expected:**
   - ✅ Page loads with 5 tabs: Profile, Agency, Notifications, Billing, Security
   - ✅ Profile tab shows:
     - User's full name (disabled)
     - User's email (disabled)
     - Role (disabled)
     - Company name (disabled)
   - ✅ All fields are disabled (read-only for now)

## Test Scenario 7: Navigation Links

1. **From login page:**
   - Click "Sign up" link → goes to `/signup`
   - Click EstateFlow logo/home → goes to `/` (home page)

2. **From signup page:**
   - Click "Log in" link → goes to `/login`
   - Click EstateFlow logo/home → goes to `/` (home page)

3. **From dashboard:**
   - Click on navigation items (dashboard, properties, leads, etc.)
   - All should work without redirect

## Browser Console Checks

Open DevTools (F12) and check console for errors:
- ❌ Should NOT see: `"Failed to fetch user"` errors
- ❌ Should NOT see: `"CORS"` errors
- ❌ Should NOT see: `"Invalid session"` errors
- ✅ Should see: Normal navigation logs

## Network Tab Checks

In DevTools Network tab, after login:
- ✅ `POST` request to signup or signin endpoint
- ✅ Response status: `200` or `302` (redirect)
- ✅ No `4xx` or `5xx` errors

## Common Issues & Fixes

### Issue: Form not submitting
- **Check:** Is form validation passing? (no red errors)
- **Check:** Is "Create Account" or "Sign In" button clickable?
- **Fix:** Clear browser cache and reload

### Issue: Redirected to login even though logged in
- **Cause:** Session cookie expired
- **Fix:** Log out and log back in
- **Check:** `NEXT_PUBLIC_SUPABASE_URL` and key are correct in `.env.local`

### Issue: Can't see user info in navbar
- **Check:** Did signup complete successfully?
- **Check:** Are you on `/dashboard` or another protected page?
- **Fix:** Refresh the page (Ctrl+R)

### Issue: Settings page shows blank
- **Cause:** useAuth hook still loading
- **Expected:** 2-3 second loading spinner, then data appears
- **If stuck:** Check browser console for errors

## Success Indicators ✅

You'll know everything is working when:
1. ✅ Can sign up with new email
2. ✅ Automatically redirected to dashboard
3. ✅ Navbar shows user info (name, email, company)
4. ✅ Can log out and are redirected home
5. ✅ Can't access protected routes when logged out
6. ✅ Can't access login/signup when logged in (redirects to dashboard)
7. ✅ Error messages appear for invalid form input
8. ✅ Settings page shows user info
9. ✅ No console errors or warnings
10. ✅ Network requests complete successfully

## Cleanup Between Tests

If you want to test signup again with the same email:
1. Go to Supabase dashboard
2. Find the project
3. Go to Auth > Users
4. Delete the test user
5. Go to Database > Tables > profiles
6. Delete the profile record
7. Go to tables > companies
8. Delete the company record
9. Now you can sign up again with the same email

Or just use a different email each time (john2@example.com, john3@example.com, etc.)
