# EstateFlow Authentication Implementation Guide

## Overview

This document provides a complete reference for the EstateFlow authentication system, covering four main user journeys:

1. Company Admin Signup (New Agency)
2. Agent Invitation & Signup
3. Regular Login (All Roles)
4. Logout

## System Architecture

### Key Components

- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth + JWT tokens in httpOnly cookies
- **OAuth**: Google OAuth 2.0 integration
- **Frontend**: Next.js 16 with React Server Components

### Database Schema

#### Core Tables

```
companies (id, name, email, phone, website, logo_url, timezone, ...)
profiles (id, company_id, full_name, email, role, is_active, ...)
team_invitations (id, company_id, email, token, expires_at, accepted_at, ...)
```

#### User Roles

- **super_admin**: Platform owner - manages all companies
- **company_admin**: Company owner - manages their company
- **agent**: Real estate agent - manages assigned leads
- **client**: End customer - read-only access

---

## JOURNEY 1: Company Admin Signup (New Agency)

### Step-by-Step Flow

#### 1. User Clicks "Start Free Trial"
- User navigates to landing page
- Clicks "Start Free Trial" button
- Redirects to `/signup`

#### 2. Signup Form
User fills in:
- **Company Name**: "Acme Realty Morocco"
- **Your Full Name**: "Ahmed Benjelloun"
- **Work Email**: "ahmed@acmerealty.ma"
- **Password**: Min 6 characters (validation recommended: uppercase, lowercase, number)
- **Confirm Password**: Must match
- **Agree to Terms & Privacy**: Checkbox

#### 3. Client-Side Validation
`components/auth/signup-form.tsx`:
```typescript
// Validates:
// - Company name not empty
// - Full name not empty
// - Valid email format
// - Password min 6 chars
// - Passwords match
// - Terms accepted
```

#### 4. Backend Processing
`lib/actions/auth.ts` - `signUp()`:

```
1. Validate all inputs on server
2. Check if email already exists in profiles table
3. Create Supabase auth user:
   - Email: "ahmed@acmerealty.ma"
   - Password: Hashed by Supabase
   - User metadata: { full_name: "Ahmed Benjelloun" }
4. Call `/api/auth/create-company` to:
   - Create company record
   - Create user profile with role='company_admin'
5. Return success or error
```

#### 5. API Route: `/api/auth/create-company`
`app/api/auth/create-company/route.ts`:

```typescript
// POST request with:
{
  userId: "uuid",
  companyName: "Acme Realty Morocco",
  email: "ahmed@acmerealty.ma",
  fullName: "Ahmed Benjelloun"
}

// Creates:
// 1. companies record
// 2. profiles record with company_id and role='company_admin'
```

#### 6. Auto-Login
- Supabase auth session created automatically
- JWT token stored in httpOnly cookie
- Supabase middleware maintains session

#### 7. Redirect to Dashboard
- After signup, user redirected to `/dashboard`
- Can start inviting team members immediately

### File References

| File | Purpose |
|------|---------|
| [components/auth/signup-form.tsx](components/auth/signup-form.tsx) | Signup UI form |
| [lib/actions/auth.ts](lib/actions/auth.ts#L27) | Server-side signup logic |
| [app/api/auth/create-company/route.ts](app/api/auth/create-company/route.ts) | Create company/profile |
| [types/auth.types.ts](types/auth.types.ts#L1) | TypeScript types |

---

## JOURNEY 2: Agent Invitation & Signup

### Step-by-Step Flow

#### 1. Company Admin Invites Agent
Admin navigates to `/dashboard/team`:
- Clicks "Invite Team Member"
- Form appears with:
  - **Email**: "sara@acmerealty.ma"
  - **Full Name**: "Sara Alami"
  - **Role**: Dropdown [Agent, Company Admin]
- Clicks "Send Invitation"

#### 2. Backend: Create Invitation
`app/api/auth/send-invitation/route.ts`:

```typescript
// Validates:
// - User is company_admin
// - Email not already in company
// - No pending invitation for this email

// Generates:
// - UUID invitation token (32 bytes random hex)
// - Expiration: 7 days from now

// Creates team_invitations record:
{
  company_id: "uuid",
  invited_by: "admin-uuid",
  email: "sara@acmerealty.ma",
  full_name: "Sara Alami",
  role: "agent",
  token: "abc123xyz...",
  expires_at: "2026-01-27T12:34:56Z",
  accepted_at: null
}
```

#### 3. Agent Receives Email
Subject: "You're invited to join Acme Realty on EstateFlow"

Body:
```
Ahmed has invited you to join their team as an Agent.

Click here to accept:
https://estateflow.ma/invite/abc123xyz...

This link expires in 7 days.
```

#### 4. Agent Clicks Link
- Goes to `/invite/[token]`
- Page verifies token:
  - Token exists in team_invitations
  - Not yet accepted
  - Not expired
- Shows form to accept invitation

#### 5. Invitation Acceptance Form
`app/invite/[token]/page.tsx`:

```
┌─────────────────────────────────────┐
│ Accept Invitation                   │
│                                     │
│ Welcome to Acme Realty!             │
│                                     │
│ Email: sara@acmerealty.ma (read)    │
│ Role: Agent (read)                  │
│                                     │
│ [Set Password: ________]            │
│ [Confirm Password: ________]        │
│                                     │
│ [Accept Invitation & Create Account]│
└─────────────────────────────────────┘
```

#### 6. Backend: Accept Invitation
`app/api/auth/accept-invitation/route.ts`:

```typescript
// Validates invitation token
// Creates Supabase auth user:
{
  email: "sara@acmerealty.ma",
  password: "user-provided-password",
  email_confirm: true // Auto-confirm invited users
}

// Creates profiles record:
{
  id: "new-user-uuid",
  company_id: "acme-company-uuid",
  full_name: "Sara Alami",
  email: "sara@acmerealty.ma",
  role: "agent",
  is_active: true
}

// Updates team_invitations:
{
  accepted_at: now(),
  accepted_by: "new-user-uuid"
}
```

#### 7. Redirect to Login
- User shown: "Invitation accepted! Redirecting to login..."
- Redirected to `/login`
- User logs in with email and password

### File References

| File | Purpose |
|------|---------|
| [app/api/auth/send-invitation/route.ts](app/api/auth/send-invitation/route.ts) | Send invitation |
| [app/api/auth/verify-invitation/route.ts](app/api/auth/verify-invitation/route.ts) | Verify token |
| [app/api/auth/accept-invitation/route.ts](app/api/auth/accept-invitation/route.ts) | Accept invitation |
| [app/invite/[token]/page.tsx](app/invite/[token]/page.tsx) | Invitation UI |
| [supabase-schema.sql](supabase-schema.sql#L253) | team_invitations table |

---

## JOURNEY 3: Regular Login (All Roles)

### Step-by-Step Flow

#### 1. User Goes to `/login`
Form displays:
- **Email**: "ahmed@acmerealty.ma"
- **Password**: "••••••••"
- **[Remember me]**: Optional checkbox
- **[Sign In]**: Button
- **[Sign In with Google]**: Button

#### 2. Email/Password Sign In
`components/auth/login-form.tsx`:

```typescript
// Client validates:
// - Email not empty
// - Valid email format
// - Password not empty

// Submits to lib/actions/auth.ts - signIn()
```

#### 3. Server-Side Validation
`lib/actions/auth.ts` - `signIn()`:

```typescript
// 1. Validate inputs
// 2. Call supabase.auth.signInWithPassword()
// 3. If error (invalid credentials):
//    Return error: "Invalid email or password"
// 4. If success:
//    Fetch user profile
//    Check is_active
//    If inactive: return error and sign out
//    Else: continue
```

#### 4. Create Session
Supabase automatically:
- Generates JWT token
- Stores in httpOnly cookie (XSS-safe)
- Token expires in 7 days
- Can be refreshed on activity

#### 5. Role-Based Redirect
After successful login, middleware automatically redirects:
- **company_admin** → `/dashboard`
- **agent** → `/dashboard` (or `/dashboard/my-leads`)
- **super_admin** → `/admin/companies`

### Google OAuth Flow

#### Option A: Company Admin Signs In with Google

1. User clicks "Sign In with Google"
2. `POST /api/auth/google` initiates OAuth
3. User redirected to Google login
4. After consent, redirected to `/auth/callback`
5. `GET /api/auth/google` handles callback:
   - Exchanges authorization code for session
   - Checks if profile exists
   - If not, creates company + profile (company_admin role)
   - Redirects to `/dashboard`

#### Option B: Agent Invited to Company with Google

1. Agent receives invitation link
2. Clicks link → `/invite/[token]`
3. Form shows option to accept with Google (future enhancement)
4. If accepted with Google:
   - Creates auth user from Google account
   - Creates profile with invited company_id
   - Marks invitation as accepted
   - Redirects to dashboard

### Session Persistence

#### Token Refresh
- Token valid for 7 days
- Can be set to refresh on each request (via middleware)
- Or explicitly refreshed when needed

#### Security Features
- **httpOnly Cookies**: Cannot be accessed via JavaScript (XSS protection)
- **Secure Flag**: Only transmitted over HTTPS (production)
- **SameSite=Lax**: Protects against CSRF
- **Row Level Security**: Database policies enforce access control

#### Auto-Logout
- No built-in inactivity timeout (can be added)
- User can manually logout
- Session expires after 7 days
- Closing browser with "sessionStorage" clears local auth state

### File References

| File | Purpose |
|------|---------|
| [components/auth/login-form.tsx](components/auth/login-form.tsx) | Login UI form |
| [lib/actions/auth.ts](lib/actions/auth.ts#L112) | Server-side login logic |
| [app/api/auth/google/route.ts](app/api/auth/google/route.ts) | Google OAuth flow |
| [middleware.ts](middleware.ts) | Route protection |

---

## JOURNEY 4: Logout

### Step-by-Step Flow

#### 1. User Clicks Logout
Located in user dropdown (navbar/sidebar):
- User email: "ahmed@acmerealty.ma"
- Dropdown menu with "Logout" option
- Click "Logout"

#### 2. Frontend Button Click
`components/auth/logout-button.tsx`:

```typescript
// Calls lib/actions/auth.ts - signOut()
// Shows loading state: "Logging out..."
// Waits for server response
```

#### 3. Backend Processing
`lib/actions/auth.ts` - `signOut()`:

```typescript
// 1. Call supabase.auth.signOut()
//    - Invalidates current session on backend
//    - Client-side session cleared
// 2. Revalidate all paths:
//    - revalidatePath('/')
//    - revalidatePath('/login')
//    - revalidatePath('/dashboard')
// 3. Redirect to '/login'
```

#### 4. Security Measures
- ✅ JWT token in httpOnly cookie cleared by browser
- ✅ Supabase session invalidated
- ✅ User redirected to login page
- ✅ If user navigates to `/dashboard`, middleware redirects to login

#### 5. User Sees Login Page
- Login form displayed
- "Logged out successfully" toast message (optional)
- User can log in again or go to signup

### File References

| File | Purpose |
|------|---------|
| [components/auth/logout-button.tsx](components/auth/logout-button.tsx) | Logout button |
| [lib/actions/auth.ts](lib/actions/auth.ts#L202) | Server-side logout |
| [middleware.ts](middleware.ts) | Route protection |

---

## Error Handling & UX Messages

### Error Types & User Messages

#### Email Validation Errors
```
❌ "Please enter a valid email address"
   - Empty email
   - Missing @ or .
   - Too short
```

#### Email Uniqueness
```
❌ "This email is already registered. Please log in or use a different email."
   - Email exists in profiles table
```

#### Password Errors
```
❌ "Password must be at least 6 characters"
❌ "Passwords do not match"
❌ "Current password is incorrect"
```

#### Authentication Errors
```
❌ "Invalid email or password"
   - Wrong credentials at login

❌ "Your account has been deactivated"
   - is_active = false
```

#### Network Errors
```
❌ "Network error. Please check your connection and try again."
   - Fetch failed
   - Timeout
   - No internet
```

#### Invitation Errors
```
❌ "Invalid invitation link"
   - Token doesn't exist

❌ "This invitation has already been accepted"
   - accepted_at is not null

❌ "This invitation has expired. Please contact your company admin."
   - Current time > expires_at
```

### Utility Function: `transformAuthError()`

[lib/auth-utils.ts](lib/auth-utils.ts#L201) provides centralized error transformation:

```typescript
// Example usage:
const error = { message: 'Invalid login credentials' }
const {
  title,      // "Login Failed"
  message,    // "Invalid email or password. Please try again."
  isNetworkError,
  isAuthError,
  isValidationError
} = transformAuthError(error)
```

---

## Google OAuth Configuration

### Environment Variables Required

```env
# In .env.local or Vercel dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://estateflow.ma (or http://localhost:3000 for dev)
```

### Google Cloud Console Setup

1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application):
   - Authorized redirect URIs:
     ```
     http://localhost:3000/auth/callback
     https://estateflow.ma/auth/callback
     https://*.supabase.co/auth/v1/callback
     ```
5. Copy Client ID and Client Secret
6. Add to Supabase project:
   - Dashboard → Authentication → Providers
   - Google → Enable
   - Paste Client ID and Secret
   - Add authorized redirect URIs

### Testing OAuth Locally

1. Start dev server: `npm run dev`
2. Navigate to http://localhost:3000/login
3. Click "Sign In with Google"
4. Go through Google OAuth flow
5. Should redirect to `/dashboard`

---

## Database Schema Overview

### companies Table
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  logo_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  full_name VARCHAR(255),
  email VARCHAR(255),
  role user_role DEFAULT 'agent',
  is_company_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### team_invitations Table
```sql
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  invited_by UUID REFERENCES profiles(id),
  email VARCHAR(255),
  full_name VARCHAR(255),
  role user_role DEFAULT 'agent',
  token VARCHAR(255) UNIQUE,
  expires_at TIMESTAMP,
  accepted_at TIMESTAMP,
  accepted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Indexes for Performance
```sql
-- profiles
CREATE INDEX idx_profiles_company_id ON profiles(company_id)
CREATE INDEX idx_profiles_email ON profiles(email)
CREATE INDEX idx_profiles_is_active ON profiles(is_active)

-- team_invitations
CREATE INDEX idx_team_invitations_token ON team_invitations(token)
CREATE INDEX idx_team_invitations_email ON team_invitations(email)
CREATE INDEX idx_team_invitations_expires_at ON team_invitations(expires_at)
```

---

## Row Level Security (RLS) Policies

### profiles Table
- Users can view their own company's profiles
- Company admins can manage profiles in their company
- Super admins can see all profiles
- Users can only update their own profile

### companies Table
- Users can only see their own company
- Company admins can update their company info
- Super admins can update any company

### team_invitations Table
- Company admins can view and create invitations
- Users can view invitations sent to their email

---

## API Route Reference

### Authentication Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/create-company` | POST | Create company during signup |
| `/api/auth/send-invitation` | POST | Send team invitation |
| `/api/auth/verify-invitation` | GET, POST | Verify invitation token |
| `/api/auth/accept-invitation` | POST | Accept invitation & create account |
| `/api/auth/google` | POST | Initiate Google OAuth |
| `/api/auth/google` | GET | Google OAuth callback |

---

## Testing Guide

### Manual Testing Checklist

#### Signup Flow
- [ ] Fill signup form with valid data
- [ ] Try invalid email formats (should show error)
- [ ] Try passwords that don't match (should show error)
- [ ] Submit form → should redirect to dashboard
- [ ] Check database: company and profile created

#### Invitation Flow
- [ ] As admin, go to team settings
- [ ] Invite team member with email
- [ ] Check email for invitation link
- [ ] Click link → should load invitation page
- [ ] Accept invitation with password
- [ ] Log in with email and password
- [ ] Check profile has correct company and role

#### Login Flow
- [ ] Log in with email/password
- [ ] Try invalid credentials → show error
- [ ] Try non-existent email → show error
- [ ] Log in successfully → redirect to dashboard
- [ ] Refresh page → still logged in (session persists)

#### Google OAuth (if configured)
- [ ] Click "Sign In with Google"
- [ ] Sign in with Google account
- [ ] Should redirect to dashboard
- [ ] Check new profile created if first time

#### Logout Flow
- [ ] Click logout in dropdown
- [ ] Confirm logged out
- [ ] Try to navigate to /dashboard
- [ ] Should redirect to /login

#### Protected Routes
- [ ] Access /dashboard without auth → redirect to /login
- [ ] Add ?redirectedFrom=/dashboard to login URL
- [ ] After login, should redirect to /dashboard (not home)

---

## Security Best Practices Implemented

✅ **Password Security**
- Minimum 6 characters (consider 8+ with complexity)
- Bcryptjs hashing for any custom password handling
- Never store plain-text passwords

✅ **Token Security**
- JWT tokens in httpOnly cookies (prevents XSS)
- Secure flag set in production (HTTPS only)
- SameSite=Lax to prevent CSRF
- 7-day expiration

✅ **Database Security**
- Row Level Security on all tables
- Service role key only used server-side
- Policies enforce company-based access
- Email uniqueness constraint

✅ **Invitation Security**
- Unique random tokens (32 bytes)
- 7-day expiration
- Single-use (marked accepted)
- Can't be reused

✅ **OAuth Security**
- Uses Supabase's OAuth implementation
- Authorization code flow (not implicit)
- State parameter prevents CSRF
- Scopes limited to profile and email

---

## Troubleshooting

### Common Issues

#### "Email already registered" after deleting user
**Solution**: Check if profile still exists in profiles table. Delete it manually.

#### Google OAuth not working
**Solution**:
1. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
2. Verify redirect URIs in Google Cloud Console
3. Check Supabase dashboard has Google provider enabled
4. Test with correct environment variables

#### Invitation token keeps expiring
**Solution**: Increase expiration in getInvitationExpiration() function:
```typescript
expirationDate.setDate(expirationDate.getDate() + 14) // 14 days instead of 7
```

#### User can't login after accepting invitation
**Solution**:
1. Verify auth user created in Supabase
2. Verify profile created with correct company_id
3. Check profile is_active = true

#### Session not persisting across page reloads
**Solution**: Check if middleware.ts is properly configured and cookies are enabled.

---

## Next Steps & Enhancements

### Future Improvements
1. **Email Notifications**
   - Send actual emails for invitations
   - Use SendGrid or similar service
   - Email verification for new users

2. **Magic Links**
   - Passwordless login option
   - 24-hour expiring magic links
   - Useful for mobile users

3. **Two-Factor Authentication (2FA)**
   - TOTP (authenticator apps)
   - SMS-based codes
   - Required for company_admin role

4. **Password Reset**
   - Forgot password flow
   - Email verification
   - Reset token expiration

5. **Social Login**
   - LinkedIn OAuth (for B2B)
   - GitHub OAuth (for developers)
   - Apple ID (for iOS users)

6. **Activity Logging**
   - Track user logins
   - Log failed login attempts
   - Monitor suspicious activity

7. **Subscription/Payment**
   - Integrate Stripe
   - Trial period tracking
   - Payment method management

---

## Support & Documentation

For more information:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [OAuth 2.0 Spec](https://tools.ietf.org/html/rfc6749)
