# 📋 EstateFlow User Journey Maps

## Overview
This document maps the complete user flows for EstateFlow, covering signup, login, agent invitations, and logout with detailed security measures.

---

## JOURNEY 1: Company Admin Signup (New Agency)

### STEP 1: Landing Page → Signup
```
User Action: Clicks "Start Free Trial" or "Sign Up"
Route: / → /signup
```

### STEP 2: Signup Form
```
User fills in:
├── Company Name: "Acme Realty Morocco"
├── Your Full Name: "Ahmed Benjelloun"
├── Work Email: "ahmed@acmerealty.ma"
├── Password: "SecurePassword123!" (must meet requirements)
├── Confirm Password: "SecurePassword123!"
└── [x] I agree to Terms & Privacy

UI Feedback:
├── Real-time password strength indicator
├── Password requirements checklist
└── Submit button enabled when all requirements met
```

### STEP 3: Backend Process
```
POST /api/auth/signup
│
├── Input Validation
│   ├── Email format: RFC 5322
│   ├── Password strength: 12+ chars, uppercase, lowercase, number, special char
│   ├── Full Name: Required, 2-100 chars
│   └── Company Name: Required, 2-100 chars
│
├── Security Checks
│   ├── Rate limiting: 3 signups per hour per IP
│   ├── Check if email already exists
│   └── No SQL injection risk (parameterized queries)
│
├── Supabase Auth Creation
│   └── admin.auth.admin.createUser()
│       ├── email: "ahmed@acmerealty.ma"
│       ├── password: hashed with bcrypt (cost: 12)
│       └── email_confirm: true (auto-confirmed for development)
│
├── Database Operations
│   ├── INSERT companies table
│   │   └── name, email, created_at
│   │
│   └── INSERT profiles table
│       ├── id: user_id (UUID)
│       ├── company_id: company_uuid
│       ├── full_name: "Ahmed Benjelloun"
│       ├── email: "ahmed@acmerealty.ma"
│       ├── role: "company_admin"
│       ├── is_company_admin: true
│       ├── is_active: true
│       └── created_at: now()
│
└── Response: { success: true, userId, message }
```

### STEP 4: Auto-Login
```
Frontend Process:
├── Supabase Auth automatically creates session
├── JWT token stored in httpOnly cookie (XSS-safe)
├── Middleware validates session
└── Router redirects to /onboarding or /dashboard
```

### STEP 5: Onboarding Wizard (Optional)
```
Route: /onboarding

Steps (Optional but Professional):
├── Step 1: Upload Company Logo
│   └── Logo storage: Supabase Storage
│
├── Step 2: Configure Company Details
│   ├── Phone number
│   ├── Address
│   ├── Website
│   └── Industry specialization
│
├── Step 3: Invite First Team Member
│   └── Email agent → invitation sent
│
└── Redirect: /dashboard
```

### Security Measures ✅
- ✅ Passwords never logged or exposed
- ✅ Rate limiting: 3 attempts/hour per IP
- ✅ Email validation
- ✅ Password strength requirements enforced
- ✅ Bcrypt hashing with cost factor 12
- ✅ Session stored in secure httpOnly cookie
- ✅ CSRF protection via Supabase

---

## JOURNEY 2: Agent Invitation & Signup

### STEP 1: Company Admin Invites Agent
```
Route: /dashboard/team

Admin Actions:
├── Clicks "Invite Team Member" button
├── Fills invitation form:
│   ├── Email: "sara@acmerealty.ma"
│   ├── Full Name: "Sara Alami"
│   └── Role: [Agent ▼]
└── Clicks "Send Invitation"

Backend Process: POST /api/auth/send-invitation
├── Input Validation
│   ├── Email format check
│   ├── Verify email not already invited
│   └── Verify email not already registered
│
├── Database Operation
│   └── INSERT team_invitations
│       ├── id: UUID (unique token)
│       ├── company_id: admin's company_id
│       ├── email: "sara@acmerealty.ma"
│       ├── inviter_id: admin's user_id
│       ├── role: "agent"
│       ├── status: "pending"
│       ├── expires_at: now() + 7 days
│       └── created_at: now()
│
├── Email Service
│   └── Send invitation email with link:
│       https://estateflow.ma/invite/[invitation-token]
│
└── Response: { success: true, message }
```

### STEP 2: Agent Receives Email
```
Subject: "You're invited to join Acme Realty on EstateFlow"

Email Body:
┌─────────────────────────────────────────┐
│ Welcome to EstateFlow!                  │
│                                         │
│ Ahmed has invited you to join           │
│ Acme Realty on EstateFlow.              │
│                                         │
│ [Accept Invitation →]                   │
│ https://estateflow.ma/invite/abc123     │
│                                         │
│ This link expires in 7 days             │
└─────────────────────────────────────────┘
```

### STEP 3: Agent Clicks Invitation Link
```
Route: /invite/[token]

Frontend Validation:
├── Check if token exists
├── Check if token is not expired
├── Check if token not already used
└── Show acceptance form

Agent Fills:
├── Email: sara@acmerealty.ma (read-only, pre-filled)
├── Set Password: "••••••••" (must meet requirements)
├── Confirm Password: "••••••••"
└── [Accept Invitation]
```

### STEP 4: Backend Accept Invitation
```
POST /api/auth/accept-invitation/[token]

Validation:
├── Verify token exists
├── Verify token not expired
├── Verify token not already used
└── Verify email matches token

Database Transactions:
├── BEGIN TRANSACTION
│
├── In Supabase Auth:
│   └── Create auth user with password
│
├── In Database:
│   ├── INSERT profiles
│   │   ├── id: auth_user_id
│   │   ├── company_id: from invitation
│   │   ├── full_name: from invitation
│   │   ├── email: from invitation
│   │   ├── role: "agent"
│   │   └── is_active: true
│   │
│   └── UPDATE team_invitations
│       ├── status: "accepted"
│       └── accepted_at: now()
│
└── COMMIT TRANSACTION
```

### STEP 5: Agent First Login
```
Route: /invite/[token] → /dashboard

Post-Acceptance:
├── Auto-login to dashboard
├── Show welcome message
├── Assign to company dashboard
└── Can start accepting leads
```

### Security Measures ✅
- ✅ Invitation tokens are UUIDs (impossible to guess)
- ✅ 7-day expiration for security
- ✅ Single-use tokens (cannot reuse)
- ✅ Email verification (agent must access email)
- ✅ Password requirements enforced
- ✅ Company isolation (agent cannot access other companies)
- ✅ Role-based access control enforced

---

## JOURNEY 3: Regular Login (All Roles)

### STEP 1: User Goes to Login Page
```
Route: /login

User chooses:
├── Option A: Email + Password
│   ├── Email: "ahmed@acmerealty.ma"
│   ├── Password: "••••••••"
│   └── [x] Remember me
│
└── Option B: Sign In with Google
    └── [Sign In with Google]
```

### STEP 2A: Email/Password Login
```
Frontend: handleSubmit()
├── Validate email format
├── Validate password not empty
└── Submit to backend

Backend: POST /api/auth/login
├── Find user by email in profiles table
├── Check if user is_active
└── Return: { success: true, userId }

Frontend: Supabase Auth
├── Call supabase.auth.signInWithPassword()
├── Supabase verifies password against auth.users
├── Supabase returns JWT token
└── Supabase sets httpOnly cookie

Error Handling:
├── If email not found: "Invalid email or password"
├── If password wrong: "Invalid email or password"
├── If account disabled: "This account has been disabled"
├── If email not confirmed: "Please confirm your email"
└── Rate limit exceeded: "Too many attempts. Try again later"
```

### STEP 2B: Google OAuth Login
```
Frontend: handleGoogleSignIn()
├── Call supabase.auth.signInWithOAuth('google')
├── Browser redirects to Google Login
│   └── User authenticates with Google
│
└── Google redirects back to /auth/callback?code=[code]

Backend: GET /auth/callback
├── Extract code from query params
├── Call supabase.auth.exchangeCodeForSession(code)
├── Supabase validates code with Google
└── Session created automatically

Database Auto-Creation:
├── If email new to EstateFlow:
│   ├── INSERT profiles
│   │   ├── id: google_user_id
│   │   ├── full_name: from Google
│   │   ├── email: from Google
│   │   ├── role: "free_user" (default)
│   │   └── is_active: true
│   │
│   └── No company assigned yet
│
└── Redirect: /dashboard or /onboarding
```

### STEP 3: Middleware Session Check
```
Middleware: middleware.ts

For every request:
├── Extract cookies
├── Call updateSession()
│   ├── Create server-side Supabase client
│   ├── Call supabase.auth.getUser()
│   └── Return user or null
│
├── Check protected routes
│   ├── If !user && protectedRoute → redirect /login
│   ├── If user && loginRoute → redirect /dashboard
│   └── Otherwise → allow access
│
└── Continue to page/API
```

### STEP 4: Role-Based Redirect
```
After Authentication:

Company Admin:
├── Role: "company_admin"
├── company_id: set
└── Redirect: /dashboard

Agent:
├── Role: "agent"
├── company_id: set
└── Redirect: /dashboard (with filters)

Super Admin:
├── Role: "super_admin"
├── company_id: null
└── Redirect: /admin/companies

Free User (Google):
├── Role: "free_user"
├── company_id: null
└── Redirect: /onboarding
```

### STEP 5: Session Persistence
```
Session Management:

Cookie Storage:
├── Name: auth.0_token (Supabase)
├── Type: httpOnly (XSS-safe)
├── Secure: true (HTTPS only)
├── SameSite: Lax (CSRF protection)
└── MaxAge: 7 days

Auto-Refresh:
├── Middleware refreshes on each request
├── If expiring within 1 hour → refresh
├── Refresh token rotated automatically
└── Never requires user action

Logout on Inactivity:
├── Configurable: 30 minutes default
├── Tracked in localStorage
├── Auto-logout warning at 25 minutes
└── Redirect: /login

Browser Reload:
├── Session cookie sent automatically
├── No re-login required
├── Seamless user experience
```

### Security Measures ✅
- ✅ Rate limiting: 5 attempts per 15 minutes per IP
- ✅ Generic error message prevents user enumeration
- ✅ Password verified by Supabase (not on server)
- ✅ Google OAuth uses secure OAuth 2.0 flow
- ✅ JWT token in secure httpOnly cookie
- ✅ Token automatically refreshed
- ✅ CSRF protection via SameSite cookies
- ✅ XSS protection via httpOnly flag

---

## JOURNEY 4: Logout

### STEP 1: User Initiates Logout
```
Location: Anywhere in dashboard

User Action:
├── Click user profile dropdown
├── Select "Logout"
└── Confirm logout

Frontend: handleLogout()
├── Call supabase.auth.signOut()
├── Clear all local data
├── Redirect: /login
```

### STEP 2: Backend Cleanup
```
Supabase Auth:
├── Invalidate JWT token
├── Clear refresh token
└── No database changes needed

Session Cleanup:
├── httpOnly cookie automatically removed
├── Browser cannot access it
└── Next request has no auth
```

### STEP 3: Middleware Blocks Access
```
Next Request to /dashboard:

Middleware: middleware.ts
├── Extract cookies
├── Call updateSession()
│   └── Returns user: null (no valid session)
│
├── Check: if !user && protectedRoute
│   └── true → redirect /login ✅
│
└── HTTP 307 redirect
```

### STEP 4: Confirmation & Redirect
```
User Experience:
├── "You've been logged out" message
├── Clear navigation UI
├── Show login page
└── Session completely cleared
```

### Security Measures ✅
- ✅ Session immediately invalidated
- ✅ All tokens revoked
- ✅ No residual data in storage
- ✅ CSRF protection maintained
- ✅ Clear user feedback

---

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   EstateFlow Auth Flow                  │
└─────────────────────────────────────────────────────────┘

                    SIGNUP FLOW
                        │
         ┌──────────────┴──────────────┐
         │                             │
    Email+Password              Google OAuth
         │                             │
         ├─→ POST /api/auth/signup     │
         │   ├─ Validate inputs        │
         │   ├─ Create Supabase user   │
         │   └─ Create profile         │
         │                             │
         │                       OAuth 2.0 Flow
         │                             │
         └──────────────┬──────────────┘
                        │
            Auto-login to dashboard
                        │
         ┌──────────────┴──────────────┐
         │                             │
   Onboarding (Optional)         Dashboard
         │                             │
         └──────────────┬──────────────┘
                        │
                   LOGGED IN STATE
                        │
         ┌──────────────┴──────────────┐
         │                             │
    Middleware validates         User can access
    session on each request     protected routes
         │                             │
         └──────────────┬──────────────┘
                        │
                    LOGOUT
                        │
         ┌──────────────┴──────────────┐
         │                             │
  Session invalidated         Token revoked
         │                             │
         └──────────────┬──────────────┘
                        │
              Redirect to /login
```

---

## Security Summary

### Password Security 🔒
- Bcrypt hashing with cost factor 12
- 12+ characters required
- Mix of uppercase, lowercase, numbers, special chars
- Never logged or exposed in errors

### Rate Limiting 🚦
- Signup: 3 requests/hour per IP
- Login: 5 requests/15 min per IP
- Returns 429 Too Many Requests
- Client told when they can retry

### Session Management 🔐
- JWT token in httpOnly cookie
- 7-day expiration
- Auto-refresh on activity
- CSRF protection via SameSite

### OAuth Security 🌐
- Google OAuth 2.0 implementation
- PKCE flow (if mobile in future)
- Automatic profile creation
- User email verified by Google

### User Privacy 👤
- Generic error messages (no enumeration)
- No sensitive data in logs
- Passwords never stored plaintext
- Role-based access control

### Data Protection 🛡️
- All operations in transactions
- Role isolation enforced
- Company data isolated
- Audit logs available (future enhancement)

---

## Testing Checklist

- [ ] Signup with email and password
- [ ] Signup with Google OAuth
- [ ] Login with email and password
- [ ] Login with Google OAuth
- [ ] Password validation works
- [ ] Rate limiting works (try 6 logins)
- [ ] Session persists on page reload
- [ ] Cannot access dashboard when logged out
- [ ] Logout clears all data
- [ ] Invitation link works
- [ ] Invitation expires after 7 days
- [ ] Agent login redirects correctly
- [ ] Admin login redirects correctly
- [ ] Remember me works
- [ ] Forgot password flow (when implemented)

---

## Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# Security
NEXTAUTH_SECRET=xxx (legacy, can be removed)
NEXTAUTH_URL=http://localhost:3000
```

---

## Next Steps (Production Ready)

1. **Email Verification**
   - Set `email_confirm: false` in signup
   - Implement verification email
   - Require confirmation before login

2. **Password Reset**
   - Create `/forgot-password` page
   - Send reset email with token
   - Implement password change

3. **Two-Factor Authentication**
   - Optional TOTP authenticator
   - Email-based OTP option
   - Required for admins

4. **Audit Logging**
   - Log all auth events
   - Track failed attempts
   - Alert on suspicious activity

5. **Session Security**
   - IP-based session validation
   - Device fingerprinting (optional)
   - Concurrent session limits

6. **Mobile App Support**
   - Deep linking for OAuth callback
   - Biometric authentication
   - Offline session caching
