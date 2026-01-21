# Login & Signup Security Fix - Testing Guide

## Issue Fixed
When users logged in, they received:
- ✅ 200 OK from `/api/auth/login` (server validation passed)
- ❌ 400 Bad Request from Supabase Auth API (credentials failed in Supabase)

**Root Cause**: The login flow was validating against profiles table but user didn't exist in Supabase Auth.

## How to Test

### Option 1: Create a Test User via Signup (Recommended)

1. Go to http://localhost:3000/signup
2. Fill in the form:
   - **Email**: test@example.com
   - **Password**: SecurePassword123!
   - **Full Name**: Test User
   - **Company Name**: Test Company
3. Click "Sign Up"
4. You'll be created in Supabase Auth automatically
5. Go to http://localhost:3000/login and sign in with the same credentials

### Option 2: Create a Test User via API (Development Only)

**POST** to `http://localhost:3000/api/auth/setup-test-user`

```json
{
  "email": "demo@example.com",
  "password": "DemoPassword123!",
  "fullName": "Demo User",
  "companyName": "Demo Company"
}
```

This endpoint:
- ✅ Creates user in Supabase Auth
- ✅ Creates company record
- ✅ Creates user profile
- ✅ Only available in development mode
- ⚠️ Should be removed in production

### Option 3: Test with Existing User

If you already have a user in Supabase:

1. Go to Supabase Dashboard
2. Navigate to Authentication → Users
3. Verify the email address
4. Use those credentials to login

## Updated Security Features

### Server-Side Validation (`/api/auth/login`)
```typescript
✅ Validates user exists in profiles table
✅ Checks if user account is active
✅ Returns generic "Invalid email or password" error (prevents user enumeration)
❌ Does NOT validate password (delegated to Supabase Auth)
```

### Client-Side Authentication
```typescript
✅ Calls supabase.auth.signInWithPassword()
✅ Supabase Auth validates credentials
✅ Session cookie is automatically set
✅ Detailed error messages on auth failure
```

### Signup Process
```typescript
✅ Validates password strength
✅ Creates Supabase Auth user
✅ Creates company record
✅ Creates user profile
✅ Auto-confirms email (can be changed to require confirmation)
✅ Rate limited to 3 requests/hour per IP
```

### Session Management
```typescript
✅ Middleware checks session before allowing access
✅ Protected routes require active session
✅ Session persists via Supabase cookies
✅ Logout properly clears session
```

## Security Best Practices Implemented

### 1. **Password Security**
- ✅ Passwords hashed with bcrypt (signup)
- ✅ Password validation delegated to Supabase Auth (login)
- ✅ Password requirements enforced
- ✅ Passwords never logged or exposed

### 2. **User Enumeration Prevention**
- ✅ Generic error message: "Invalid email or password"
- ✅ Both wrong email and wrong password show same message
- ✅ Account disabled message is different (intentional - security)

### 3. **Rate Limiting**
- ✅ Signup: 3 requests per hour per IP
- ✅ Login: 5 requests per 15 minutes per IP
- ✅ Returns 429 Too Many Requests when exceeded

### 4. **Account Status**
- ✅ Disabled accounts cannot login
- ✅ Clear error message for disabled accounts
- ✅ Admin can enable/disable accounts

### 5. **Session Management**
- ✅ JWT token stored in secure HttpOnly cookies
- ✅ Token expiration: 7 days
- ✅ Automatic session refresh
- ✅ Logout clears session

### 6. **Input Validation**
- ✅ Email format validation
- ✅ Password strength requirements (12+ chars, uppercase, lowercase, numbers, special chars)
- ✅ Full name and company name validation
- ✅ Request rate limiting

## Error Messages Guide

### During Login

| Error | Meaning | Solution |
|-------|---------|----------|
| `Invalid email or password` | Wrong email or wrong password | Check credentials |
| `This account has been disabled` | Account is locked | Contact support |
| `Invalid email or password` | User doesn't exist | Sign up first |
| `Please confirm your email` | Email not confirmed | Check email for confirmation link |

### During Signup

| Error | Meaning | Solution |
|-------|---------|----------|
| `Email already registered` | Email in use | Try different email or login |
| `Password must be...` | Password too weak | Use stronger password |
| `email is required` | Missing email field | Fill in email field |
| `Too many signup attempts` | Rate limited | Wait before trying again |

## Testing Checklist

- [ ] Can sign up with valid credentials
- [ ] Cannot sign up with weak password
- [ ] Cannot sign up with invalid email
- [ ] Can login after signup
- [ ] Cannot login with wrong password
- [ ] Cannot login with non-existent email
- [ ] Disabled accounts cannot login
- [ ] Can access protected routes after login
- [ ] Cannot access protected routes without login
- [ ] Logout clears session
- [ ] Session persists after page reload
- [ ] Rate limiting works (try 6 logins quickly)

## Troubleshooting

### "400 Bad Request" from Supabase

**Cause**: User doesn't exist in Supabase Auth or password is wrong

**Solutions**:
1. Sign up a new user via the signup page
2. Create test user via `/api/auth/setup-test-user` endpoint
3. Check Supabase Dashboard for existing users

### "Cannot find module" errors

**Cause**: Missing dependencies

**Solution**:
```bash
npm install
```

### Middleware not redirecting

**Cause**: Session not found

**Solutions**:
1. Make sure you're logged in (check `/api/auth/session`)
2. Check browser cookies for session token
3. Restart dev server: `npm run dev`

## Next Steps

To make this production-ready:

1. **Remove Development Endpoints**
   - Delete `/api/auth/setup-test-user` endpoint
   - Remove mock users from auth.ts

2. **Enable Email Confirmation**
   - Change `email_confirm: true` to `email_confirm: false` in `signUpUser()`
   - Implement email verification link
   - Require email confirmation before login

3. **Add Password Reset**
   - Implement `/api/auth/forgot-password` endpoint
   - Create password reset email template
   - Handle token validation

4. **Implement Refresh Token Rotation**
   - Rotate refresh tokens on each use
   - Store token version in database
   - Invalidate old tokens

5. **Add Audit Logging**
   - Log all auth events
   - Track failed login attempts
   - Alert on suspicious activity

6. **Two-Factor Authentication**
   - Implement TOTP/authenticator app
   - Or email-based OTP
   - Make it optional/required based on role
