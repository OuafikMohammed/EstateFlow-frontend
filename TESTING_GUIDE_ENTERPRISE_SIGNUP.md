# Enterprise Signup Journey - Testing Guide

## Overview
This guide walks you through testing the complete EstateFlow company admin signup journey from landing page to dashboard.

---

## Prerequisites

### Environment Setup
```bash
# 1. Ensure dev server is running
pnpm dev
# Should start on http://localhost:3000

# 2. Verify Supabase connection
# Check .env.local for valid credentials:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Before Testing Google OAuth
⚠️ **Manual Step Required**: [Enable Google in Supabase Dashboard](./GOOGLE_OAUTH_SETUP_GUIDE.md)
- Takes 2-3 minutes
- Critical for Google OAuth testing

---

## Test Flow 1: Email/Password Signup ✅

### Steps
1. **Navigate to signup**
   - Open `http://localhost:3000/signup`
   - You should see:
     - Company Name field
     - Full Name field
     - Email field
     - Password field with strength indicator
     - Password requirements checklist
     - "Sign Up" button
     - "Sign Up with Google" button (after enabling)

2. **Fill signup form**
   ```
   Company Name: "Acme Real Estate Inc"
   Full Name: "John Smith"
   Email: "john@example.com"
   Password: "SecurePass123!@#"
   ```
   
   Password should meet all 5 requirements:
   - ✅ 12+ characters
   - ✅ Uppercase letter
   - ✅ Lowercase letter
   - ✅ Number
   - ✅ Special character

3. **Click "Sign Up"**
   - Form should submit
   - Show loading spinner
   - No errors should appear

4. **Expected behavior**
   - ✅ User created in Supabase Auth
   - ✅ Company created in database
   - ✅ Profile created automatically
   - ✅ Auto-login happens
   - ✅ Redirects to onboarding page with URL params

5. **Verify redirect**
   - URL should look like:
     ```
     http://localhost:3000/onboarding?email=john@example.com&company=Acme%20Real%20Estate%20Inc&name=John%20Smith
     ```
   - Onboarding wizard should load

---

## Test Flow 2: Onboarding Journey ✅

### Page Load (After Signup)
The onboarding page should:
- ✅ Fetch authenticated user
- ✅ Fetch user's company from database
- ✅ Display onboarding wizard
- ✅ Show current step indicator (Step 1 of 3)

### Step 1: Upload Company Logo

**Interface should show:**
- Logo upload area (drag & drop)
- File picker button
- Logo preview
- Next/Skip buttons

**Test uploading a logo:**
1. **Prepare image file**
   - Format: PNG or JPEG (webp/svg allowed)
   - Size: Under 5MB
   - Resolution: Recommended 1024x1024px or larger

2. **Upload image**
   - Click upload area or "Choose File"
   - Select image
   - Preview should appear
   - Click "Next"

3. **Expected result**
   - ✅ File uploaded to `company-logos` bucket
   - ✅ Wizard moves to Step 2
   - ✅ Logo URL saved to companies table

**Test skipping:**
1. Click "Skip"
2. ✅ Should move to Step 2 without uploading

### Step 2: Company Details

**Form fields:**
- Industry (dropdown/select)
- Team Size (dropdown)
- Phone number
- Address

**Fill form:**
```
Industry: "Real Estate"
Team Size: "11-50 employees"
Phone: "(555) 123-4567"
Address: "123 Business St, Suite 100"
```

**Expected behavior:**
- ✅ Form validates input
- ✅ Click "Next" to proceed to Step 3
- ✅ Click "Back" to return to Step 1

### Step 3: Invite Team Members

**Interface:**
- Email input field
- Add button
- List of invited members
- Complete/Skip buttons

**Test inviting member:**
1. **Enter email**
   ```
   Email: "agent@acmerealestate.com"
   ```

2. **Click "Add Invite"**
   - Email should be added to list
   - Input field should clear
   - Invite shows in list

3. **Try inviting again**
   - Add another team member email
   - Should appear in list

4. **Click "Complete Onboarding"**
   - Show loading state
   - ✅ Save company details to database
   - ✅ Create invites in company_invites table
   - ✅ (Optional) Send invitation emails*
   - ✅ Redirect to dashboard

**Test skipping:**
1. Click "Skip Invites"
2. ✅ Should complete without sending invites

---

## Test Flow 3: Google OAuth Signup ⚠️

### Prerequisites
⚠️ **MUST COMPLETE FIRST**: [Enable Google OAuth in Supabase](./GOOGLE_OAUTH_SETUP_GUIDE.md)

### Steps
1. **Navigate to signup**
   - Open `http://localhost:3000/signup`

2. **Click "Sign Up with Google"**
   - Should open Google consent screen in new tab/window
   - Shows: "EstateFlow wants to access your Google Account"

3. **Google Authentication**
   - Sign in with your Google account
   - Grant permission to EstateFlow
   - Google redirects back to app

4. **Expected Supabase behavior**
   - ✅ Creates auth.users entry with Google identity
   - ✅ Sets email from Google account
   - ✅ Triggers automatic profile creation

5. **Missing Data Flow**
   - Since Google doesn't provide company name:
     - May show missing data form
     - Or redirect to onboarding with partial params
     - User should be able to proceed with onboarding

6. **Verify**
   - ✅ New user in auth_users table
   - ✅ Profile created with Google email
   - ✅ Can complete onboarding

---

## Database Verification

### Check User Creation
```sql
-- In Supabase SQL Editor

-- Check auth users
SELECT id, email, created_at FROM auth.users 
WHERE email LIKE '%example.com%'
LIMIT 5;

-- Check companies
SELECT id, name, created_by, logo_url, created_at FROM public.companies
ORDER BY created_at DESC LIMIT 5;

-- Check profiles
SELECT id, email, company_id, is_company_admin, created_at FROM public.profiles
ORDER BY created_at DESC LIMIT 5;

-- Check invites
SELECT id, company_id, email, token, created_at FROM public.company_invites
ORDER BY created_at DESC LIMIT 5;
```

### Verify File Storage
1. Go to Supabase Dashboard
2. Storage section
3. Look for `company-logos` bucket
4. Should contain uploaded logo files
5. Files should be organized (by company or date)

---

## Error Handling Tests

### Test 1: Duplicate Email
1. **Signup first user** with `test@example.com`
2. **Try signup again** with same email
3. **Expected error**: "Email already registered. Please sign in instead."
4. ✅ Should NOT create duplicate account

### Test 2: Weak Password
1. Enter password: `simple`
2. **Expected**: Red indicators for missing requirements
3. ✅ Submit button should be disabled
4. ✅ Cannot submit with weak password

### Test 3: Missing Fields
1. Try submitting without company name
2. **Expected**: "Company name is required"
3. ✅ Form should show validation error

### Test 4: Invalid Email
1. Enter email: `invalid-email`
2. **Expected**: "Invalid email format"
3. ✅ Submit button disabled

### Test 5: Rate Limiting (Signup API)
1. **Attempt signup 3+ times rapidly** from same IP
2. **Expected**: Rate limit error after 3rd attempt
3. ✅ Error message: "Too many signup attempts. Please try again later."
4. ✅ Limits reset after 1 hour

---

## Logo Upload Tests

### Test 1: Valid Image Upload
- **File**: `company-logo.png` (500KB, PNG format)
- **Expected**: ✅ Uploads successfully, preview shows

### Test 2: Invalid Format
- **File**: `document.pdf`
- **Expected**: ❌ Error "Only image files allowed"

### Test 3: File Too Large
- **File**: `large-image.png` (6MB)
- **Expected**: ❌ Error "File must be under 5MB"

### Test 4: Drag & Drop
- **Action**: Drag image onto upload area
- **Expected**: ✅ File accepted, preview shows

---

## Authentication Tests

### Test 1: Auto-Login After Signup
1. **Complete signup flow**
2. **Expected**: 
   - ✅ Session created automatically
   - ✅ No email confirmation needed
   - ✅ Can immediately access onboarding

### Test 2: Protected Routes
1. **Try accessing `/onboarding` without login**
2. **Expected**: ❌ Redirected to login/signup
3. ✅ Cannot view onboarding without auth

### Test 3: Session Persistence
1. **Sign up and complete onboarding**
2. **Refresh page** (F5)
3. **Expected**: ✅ Still logged in, session preserved

### Test 4: Logout
1. **Sign up and verify logged in**
2. **Find logout button** (likely in dashboard)
3. **Click logout**
4. **Expected**: ✅ Session cleared, redirected to home

---

## Dashboard Access

### After Completing Onboarding
1. **Should automatically redirect** to `/dashboard`
2. **Dashboard should show:**
   - ✅ Company name
   - ✅ Company logo (if uploaded)
   - ✅ User's name and email
   - ✅ Navigation to other features

### Test Dashboard Access
1. **Go to `/dashboard`** directly
2. **Expected**:
   - ✅ If logged in: Shows dashboard
   - ❌ If not logged in: Redirected to login

---

## API Endpoint Tests (curl/Postman)

### Test Signup API
```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!@#",
    "fullName": "Test User",
    "companyName": "Test Company"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "userId": "uuid-here",
  "companyId": "uuid-here",
  "message": "Signup successful"
}
```

### Test Onboarding Complete API
```bash
curl -X POST http://localhost:3000/api/onboarding/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -F "file=@logo.png" \
  -F "companyDetails={\"industry\":\"Real Estate\",\"teamSize\":\"11-50\"}"
```

### Test Team Invite API
```bash
curl -X POST http://localhost:3000/api/onboarding/send-invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "email": "agent@company.com",
    "companyId": "uuid-here"
  }'
```

---

## Performance Checks

### Page Load Times (Ideal)
- Signup page: < 2s
- Onboarding page: < 2s
- Logo upload: < 5s

### Network Tab (Browser DevTools)
- Signup API call: Should complete in < 2s
- Logo upload: Should show progress
- No failed requests

### Database Queries
- Company fetch: Should use `created_by` index
- Profile fetch: Should be fast with proper RLS

---

## Security Verification Checklist

- ✅ Password never sent in logs
- ✅ Email not exposed in error messages
- ✅ Rate limiting working
- ✅ RLS policies preventing data exposure
- ✅ File upload validates MIME types
- ✅ Sessions use secure cookies (if applicable)
- ✅ Can't access other user's data
- ✅ Company invites use secure tokens

---

## Common Issues & Solutions

### Issue: "Invalid API Key" Error
**Solution**: Check `.env.local` has valid Supabase credentials

### Issue: Logo upload fails
**Cause**: Storage bucket policies not configured
**Solution**: Check `BACKEND_IMPLEMENTATION_COMPLETE.md` for bucket setup

### Issue: User redirect not working
**Cause**: Session not created
**Solution**: Check auto-login in auth-handler.ts is running

### Issue: Google OAuth not working
**Cause**: Not enabled in Supabase dashboard
**Solution**: Follow `GOOGLE_OAUTH_SETUP_GUIDE.md`

### Issue: RLS blocking queries
**Cause**: User not in correct company
**Solution**: Check profile.company_id matches companies.id

---

## Test Checklist

### Phase 1: Basic Signup
- [ ] Email/Password signup works
- [ ] Auto-login works
- [ ] Redirects to onboarding
- [ ] User created in database
- [ ] Company created in database
- [ ] Profile created in database

### Phase 2: Onboarding
- [ ] Logo upload works
- [ ] Company details save
- [ ] Team invites create records
- [ ] Complete onboarding works
- [ ] Redirects to dashboard

### Phase 3: Advanced
- [ ] Google OAuth works (after enabling)
- [ ] Rate limiting works
- [ ] Password validation works
- [ ] Error messages clear
- [ ] Session persists

### Phase 4: Production
- [ ] HTTPS working
- [ ] Custom domain working
- [ ] Email service integrated
- [ ] All error scenarios handled
- [ ] Performance optimized

---

## Next Steps After Testing

1. **If all tests pass**:
   - ✅ Move to email service integration
   - ✅ Set up invitation acceptance flow
   - ✅ Deploy to staging environment

2. **If tests fail**:
   - ❌ Check error logs in browser console
   - ❌ Check Supabase logs
   - ❌ Review error messages in BACKEND_IMPLEMENTATION_COMPLETE.md

3. **For Google OAuth**:
   - ⚠️ Must enable in Supabase first
   - ⚠️ See GOOGLE_OAUTH_SETUP_GUIDE.md

---

**Last Updated**: 2025-01-20  
**Status**: Ready for Testing  
**Estimated Time**: 30-45 minutes for full test suite
