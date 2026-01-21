# Supabase Setup & Testing Guide

## 🔧 Prerequisites

Before testing, ensure you have:
- Node.js 18+ installed
- A Supabase project created
- Environment variables configured

## 📋 Step 1: Environment Variables Setup

Create or update `.env.local` with these variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NextAuth Configuration (if still using NextAuth)
NEXTAUTH_SECRET=your_secret_min_32_chars_here
NEXTAUTH_URL=http://localhost:3000
```

### How to Get These Keys:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role secret key - **KEEP PRIVATE**)

> ⚠️ **IMPORTANT**: Never commit `.env.local` to git. Add it to `.gitignore`

## 📊 Step 2: Database Schema Setup

Run the Supabase migrations to create required tables:

```bash
# If using Supabase CLI
supabase db push

# Or import manually via Supabase dashboard:
# SQL Editor → New Query → paste contents of supabase-schema.sql
```

### Expected Tables After Setup:
- `companies` - Stores company/organization data
- `profiles` - User profiles linked to companies
- `properties` - Real estate listings
- `leads` - Sales leads
- `clients` - Client contacts
- `showings` - Property showing records
- `lead_activities` - Lead interaction history

## 🧪 Step 3: Test the Signup Flow

### Test 3.1: Fresh Signup (Happy Path)

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to signup:**
   - Go to `http://localhost:3000`
   - Click "Start Free Trial" button
   - Should redirect to `/signup`

3. **Fill signup form with valid data:**
   ```
   Company Name: TestCo Real Estate
   Full Name: Ahmed Test
   Email: test@example.com
   Password: TestPassword123!@#
   ```

4. **Verify validation:**
   - ✅ Password field should show strength indicator
   - ✅ All 5 requirements should turn green when met:
     - 12+ characters
     - Uppercase letter
     - Lowercase letter
     - Number
     - Special character

5. **Submit form:**
   - Click "Create Your Account" button
   - Should see loading state
   - API should POST to `/api/auth/signup`

6. **Verify API response:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Look for `signup` request
   - Should return `201 Created` with:
     ```json
     {
       "success": true,
       "message": "Signup successful. Check your email for confirmation.",
       "userId": "uuid-here"
     }
     ```

7. **Verify database records:**
   - Go to Supabase dashboard
   - Check `auth.users` table for new user
   - Check `companies` table for new company
   - Check `profiles` table for new profile linked to user

### Expected Database State After Signup:
```sql
-- Check auth user was created
SELECT id, email, created_at FROM auth.users 
WHERE email = 'test@example.com';

-- Check company was created
SELECT id, name FROM companies 
WHERE name = 'TestCo Real Estate';

-- Check profile was created
SELECT id, user_id, company_id, full_name FROM profiles
WHERE email = 'test@example.com';
```

### Test 3.2: Validation Errors

Test each validation rule individually:

#### Test Invalid Email:
```
Email: invalid.email
Expected: Error "Invalid email format"
```

#### Test Weak Password:
```
Password: Test1!
Expected: Error "Password must be at least 12 characters"
```

#### Test Missing Special Character:
```
Password: TestPassword123
Expected: Error "Password must contain special character"
```

#### Test Duplicate Email:
```
Email: test@example.com (already registered)
Expected: Error "Email already registered"
```

### Test 3.3: Rate Limiting

The signup endpoint is rate-limited to **3 requests per hour per IP**.

To test rate limiting:

1. **Send multiple requests quickly:**
   ```bash
   # In terminal, run signup 4 times
   for i in {1..4}; do
     curl -X POST http://localhost:3000/api/auth/signup \
       -H "Content-Type: application/json" \
       -d '{"email":"test'$i'@example.com","password":"TestPassword123!@#","fullName":"Test","companyName":"Test"}'
   done
   ```

2. **4th request should return:**
   - Status: `429 Too Many Requests`
   - Header: `Retry-After: 60` (seconds until rate limit resets)
   - Body: `{ "error": "Rate limit exceeded", "retryAfter": 60 }`

3. **In frontend:**
   - User should see toast: "Too many signup attempts. Try again in 1 minute."

## 🔐 Step 4: Test the Login Flow

### Test 4.1: Valid Login

1. **Navigate to login:**
   - Click "Sign In" in navbar or footer
   - Should go to `/login`

2. **Enter credentials:**
   ```
   Email: test@example.com
   Password: TestPassword123!@#
   ```

3. **Submit:**
   - Should POST to `/api/auth/login`
   - Should redirect to `/dashboard`

4. **Verify API response:**
   - Status: `200 OK`
   - Body: 
     ```json
     {
       "success": true,
       "message": "Login successful",
       "userId": "uuid-here"
     }
     ```

5. **Verify session:**
   - Navbar should show user info
   - Logout button should be visible

### Test 4.2: Invalid Credentials

Test with wrong password:
```
Email: test@example.com
Password: WrongPassword123!
Expected: Error "Invalid email or password"
```

Test with non-existent email:
```
Email: nouser@example.com
Password: TestPassword123!
Expected: Error "Invalid email or password" (same message for security)
```

### Test 4.3: Rate Limiting (Login)

Login endpoint is rate-limited to **5 requests per 15 minutes per IP**.

## 📱 Step 5: Test Navigation Buttons

### Homepage CTA Buttons:
- ✅ "Start Free Trial" → `/signup`
- ✅ "Watch Demo" → scrolls to demo section
- ✅ Navbar "Sign In" → `/login`
- ✅ Navbar "Sign Up" → `/signup`

### Signup/Login Page:
- ✅ "Already have an account?" → `/login`
- ✅ "Don't have an account?" → `/signup`

## 🐛 Debugging Tips

### Check Rate Limiter Status:
```typescript
// In browser console on signup page:
console.log('Rate limiter tracking IP requests');
// Check Network tab to see Retry-After headers
```

### Verify RLS Policies:
```sql
-- Check RLS is enabled on tables
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'properties';

-- Check policies
SELECT * FROM pg_policies 
WHERE tablename IN ('properties', 'leads', 'clients');
```

### Monitor API Logs:
```bash
# Check Supabase logs
supabase logs push

# Or view in dashboard: Project → Logs
```

### Test with Curl:

**Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl@test.com",
    "password": "TestPassword123!@#",
    "fullName": "Curl Test",
    "companyName": "Curl Test Co"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl@test.com",
    "password": "TestPassword123!@#"
  }'
```

## ✅ Checklist: Complete Test Suite

### TypeScript & Compilation
- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors in VS Code
- [ ] Dev server starts without errors

### Signup Flow
- [ ] Form validates all password requirements
- [ ] Valid signup creates user in Supabase
- [ ] Email validation rejects invalid emails
- [ ] Password validation enforces 12+ chars
- [ ] Rate limiting returns 429 on excess
- [ ] Database records created (user, company, profile)

### Login Flow
- [ ] Valid credentials allow login
- [ ] Invalid email shows generic error
- [ ] Invalid password shows generic error
- [ ] Successful login redirects to `/dashboard`
- [ ] Rate limiting protects against brute force

### Navigation
- [ ] Homepage buttons redirect correctly
- [ ] Signup/Login page links work
- [ ] Navbar shows correct user state
- [ ] Logout button appears when logged in

### Security
- [ ] Passwords never logged in API responses
- [ ] Error messages don't reveal user enumeration info
- [ ] Rate limit headers include Retry-After
- [ ] Request validation rejects extra fields
- [ ] RLS policies prevent cross-company access

## 🚀 Next Steps After Testing

1. **Set environment variables in production/staging**
2. **Run full test suite**: `npm test`
3. **Deploy to staging environment**
4. **Run load testing with k6 or Artillery**
5. **Monitor Supabase logs for errors**
6. **Set up error tracking (Sentry)**
7. **Deploy to production**

## 📞 Support

If tests fail:

1. **Check network requests** - DevTools Network tab
2. **Review API errors** - Check response body
3. **Check Supabase logs** - Dashboard → Logs
4. **Verify env vars** - Ensure all set correctly
5. **Check database** - Verify tables exist and have data

---

**Created**: January 2026  
**Status**: Testing Ready  
**Version**: 1.0.0
