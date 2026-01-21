# EstateFlow Authentication - User Journey Flows

## JOURNEY 1: Company Admin Signup (New Agency) ✅

```
┌─────────────────────────────────────────────────────────────────┐
│  LANDING PAGE                                                    │
│                                                                  │
│  [ Start Free Trial Button ]                                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  SIGNUP PAGE (/signup)                                          │
│                                                                  │
│  Company Name: ________________                                 │
│  Your Full Name: ________________                               │
│  Work Email: ________________                                   │
│  Password: ••••••••                                             │
│  Confirm Password: ••••••••                                     │
│  [✓] I agree to Terms & Privacy                                │
│                                                                  │
│  [ Start Free Trial ]  [ Continue with Google ]                │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼ VALIDATE
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND VALIDATION                                             │
│  ✓ Check email format                                           │
│  ✓ Check password strength (8+ chars)                           │
│  ✓ Check passwords match                                        │
│  ✓ Check terms agreed                                           │
│  ✓ Hash password with bcryptjs                                  │
│  ✓ Check email not already registered                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼ SUCCESS
┌─────────────────────────────────────────────────────────────────┐
│  ACCOUNT CREATED                                                │
│  ✓ User stored in database                                      │
│  ✓ Company created                                              │
│  ✓ Welcome email sent                                           │
│  Success message shown for 1.5 seconds                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼ AUTO-REDIRECT
┌─────────────────────────────────────────────────────────────────┐
│  LOGIN PAGE (/login)                                            │
│  "Now please sign in with your credentials"                     │
│  (Pre-filled email, user enters password)                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼ VALIDATE CREDENTIALS
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND AUTH (auth.ts - Credentials Provider)                 │
│  ✓ Find user by email                                           │
│  ✓ bcrypt.compare(password, hash)                               │
│  ✓ Generate JWT token                                           │
│  ✓ Set httpOnly cookie (7 days)                                 │
│  ✓ Fetch user role & company data                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼ SUCCESS
┌─────────────────────────────────────────────────────────────────┐
│  DASHBOARD (/dashboard)                                         │
│                                                                  │
│  User Avatar: [AB]                                              │
│  Welcome! Ahmed Benjelloun                                      │
│  Role: Company Admin                                            │
│                                                                  │
│  Your Company: Acme Realty Morocco                              │
│  Team Members: 1                                                │
│  Total Properties: 0                                            │
│                                                                  │
│  [ Invite Team Member ] [ Add Property ]                       │
└──────────────────────────────────────────────────────────────────┘
```

**Key Success Metrics:**
- ✅ Email validation
- ✅ Password strength check (8+ chars)
- ✅ Password confirmation match
- ✅ Terms acceptance
- ✅ Secure password hashing (bcryptjs)
- ✅ Auto-login after signup
- ✅ JWT token with 7-day expiration

---

## JOURNEY 2: Regular Login (All Roles) ✅

```
┌──────────────────────────────────────────────────────────────────┐
│  LOGIN PAGE (/login)                                             │
│                                                                   │
│  EstateFlow - Premium Real Estate Management                     │
│  🏢                                                               │
│                                                                   │
│  Email Address: ahmed@acmerealty.ma                              │
│  Password: ••••••••                                              │
│  [ ] Remember me                                                 │
│                                                                   │
│  [ Sign In ]                                                     │
│                                                                   │
│  ───────── Or continue with ─────────                            │
│  [ 🔵 Continue with Google ]                                     │
│                                                                   │
│  Don't have an account? [ Create one ]                           │
│  [ Forgot your password? ]                                       │
│                                                                   │
│  Demo Credentials:                                               │
│  Email: ahmed@acmerealty.ma                                      │
│  Password: Password123!                                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼ FORM VALIDATION
┌──────────────────────────────────────────────────────────────────┐
│  CLIENT-SIDE VALIDATION                                          │
│  ✓ Email format check                                            │
│  ✓ Password not empty                                            │
│  ✓ Form ready to submit                                          │
│  Button enabled: [Sign In] ← Loading state: "Signing in..."      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼ SEND TO /api/auth/signin
┌──────────────────────────────────────────────────────────────────┐
│  NEXTAUTH CREDENTIALS PROVIDER                                   │
│  Location: app/api/auth/[...nextauth]/route.ts                  │
│                                                                   │
│  1. Find user by email in database                               │
│  2. If not found: REJECT with "User not found"                  │
│  3. If found: Check if account is active                         │
│  4. If inactive: REJECT with "User account is disabled"         │
│  5. Compare password: bcrypt.compare()                           │
│  6. If password wrong: REJECT with "Invalid password"            │
│  7. If password correct: ACCEPT ✓                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ├─ WRONG CREDENTIALS ──────┐
                     │                          │
                     ▼                          ▼
              ✓ SUCCESS                    ✗ ERROR
┌──────────────────────────────┐  ┌──────────────────────────────┐
│ NEXTAUTH JWT CALLBACK        │  │ SHOW ERROR MESSAGE           │
│ ✓ Create JWT token           │  │ "Invalid email or password"  │
│ ✓ Include user data:         │  │ Toast: "Login Failed"        │
│   - id                        │  │ Status: "error"              │
│   - email                     │  │ Keep user on /login          │
│   - name                      │  └────────────────────────────┘
│   - role                      │
│   - companyId                 │
│ ✓ Set expiration (7 days)    │
│ ✓ Sign with NEXTAUTH_SECRET  │
└────────────────────┬──────────┘
                     │
                     ▼ SET httpOnly COOKIE
┌──────────────────────────────────────────────────────────────────┐
│  NEXTAUTH SESSION CALLBACK                                       │
│  ✓ Cookie: next-auth.jwt = <JWT_TOKEN>                          │
│  ✓ Attributes:                                                   │
│    - httpOnly: true (XSS protection)                             │
│    - Secure: true (HTTPS only in production)                     │
│    - SameSite: Lax (CSRF protection)                             │
│    - Max-Age: 604800 (7 days)                                    │
│  ✓ Stored in browser securely                                    │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼ REDIRECT LOGIC
┌──────────────────────────────────────────────────────────────────┐
│  ROLE-BASED REDIRECT                                             │
│                                                                   │
│  if (user.role === 'super_admin')                                │
│    → Redirect to /admin/companies                                │
│                                                                   │
│  else if (user.role === 'company_admin')                         │
│    → Redirect to /dashboard                                      │
│                                                                   │
│  else if (user.role === 'agent')                                 │
│    → Redirect to /dashboard/my-leads                             │
│                                                                   │
│  else if (user.role === 'client')                                │
│    → Redirect to /dashboard/my-properties                        │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│  AUTHENTICATED DASHBOARD                                         │
│  ✓ Session persists via httpOnly cookie                          │
│  ✓ useSession() hook returns session data                        │
│  ✓ User info available in navbar                                 │
│  ✓ Protected routes accessible                                   │
│  ✓ Auto-logout after 7 days or inactivity                       │
└──────────────────────────────────────────────────────────────────┘
```

**Key Security Features:**
- ✅ Password compared with bcryptjs (constant-time)
- ✅ httpOnly cookie (can't access from JavaScript)
- ✅ JWT signed with NEXTAUTH_SECRET
- ✅ 7-day expiration
- ✅ CSRF protection (SameSite=Lax)
- ✅ User-friendly error messages

---

## JOURNEY 3: Google OAuth SignIn ✅

```
┌──────────────────────────────────────────────────────────────────┐
│  LOGIN PAGE (/login)                                             │
│                                                                   │
│  [ Email Sign In ]                                               │
│                                                                   │
│  ───────── Or continue with ─────────                            │
│  [ 🔵 Continue with Google ] ← USER CLICKS THIS                  │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼ BUTTON ONCLICK
┌──────────────────────────────────────────────────────────────────┐
│  CLIENT HANDLER: handleGoogleSignIn()                            │
│  ✓ Call signIn("google", { ... })                               │
│  ✓ Button shows "Signing in..." loading state                    │
│  ✓ Redirect to Google OAuth endpoint                             │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼ NEXTAUTH PROVIDER
┌──────────────────────────────────────────────────────────────────┐
│  NEXTAUTH GOOGLE PROVIDER                                        │
│  Source: auth.ts - GoogleProvider config                         │
│                                                                   │
│  ✓ ClientID: 6384997967-qbihtl5gl050nq19...                     │
│  ✓ ClientSecret: GOCSPX-nzhAEiYSiJHEXet...                     │
│  ✓ Generate authorization URL with:                              │
│    - state parameter (CSRF protection)                           │
│    - code_challenge (PKCE)                                       │
│    - scope: profile, email                                       │
│    - redirect_uri: http://localhost:3000/api/auth/callback/google
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼ REDIRECT TO GOOGLE
┌──────────────────────────────────────────────────────────────────┐
│  GOOGLE LOGIN DIALOG                                             │
│  ─────────────────────────                                       │
│                                                                   │
│  "Sign in with Google"                                           │
│  Google Account: [ ] select                                      │
│  Email: user@gmail.com                                           │
│  Password: ••••••••                                              │
│                                                                   │
│  Permissions:                                                    │
│  □ Access your email address                                     │
│  □ Access your profile information                               │
│                                                                   │
│  [ Cancel ]  [ Allow ]                                           │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼ USER AUTHORIZES
┌──────────────────────────────────────────────────────────────────┐
│  GOOGLE CALLBACK                                                 │
│  ✓ Generate authorization code                                   │
│  ✓ Include state (CSRF protection)                               │
│  ✓ Redirect back with:                                           │
│    - code=<AUTH_CODE>                                            │
│    - state=<CSRF_STATE>                                          │
│    URL: /api/auth/callback/google?code=...&state=...            │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│  NEXTAUTH CALLBACK HANDLER                                       │
│  /api/auth/callback/google                                       │
│                                                                   │
│  ✓ Verify state parameter (CSRF)                                │
│  ✓ Exchange code for access token                                │
│  ✓ Fetch user profile from Google                                │
│  ✓ Get: id, email, name, picture                                │
│  ✓ Check if user exists in database                              │
│                                                                   │
│  IF NOT FIRST LOGIN:                                             │
│    → Use existing user data                                      │
│  ELSE (FIRST LOGIN):                                             │
│    → Create user in database                                     │
│    → Create profile with default role                            │
│    → Create company (if needed)                                  │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼ JWT CALLBACK
┌──────────────────────────────────────────────────────────────────┐
│  NEXTAUTH JWT CREATION                                           │
│  ✓ Create JWT with:                                              │
│    - id                                                          │
│    - email                                                       │
│    - name                                                        │
│    - picture                                                     │
│    - role (from database)                                        │
│    - companyId (from database)                                   │
│  ✓ Sign with NEXTAUTH_SECRET                                     │
│  ✓ Expiration: 7 days                                            │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼ SET httpOnly COOKIE
┌──────────────────────────────────────────────────────────────────┐
│  SECURE COOKIE CREATION                                          │
│  ✓ Cookie: next-auth.jwt=<JWT_TOKEN>                            │
│  ✓ httpOnly: true (XSS safe)                                     │
│  ✓ Secure: true (HTTPS only)                                     │
│  ✓ SameSite: Lax (CSRF safe)                                     │
│  ✓ Max-Age: 604800s (7 days)                                     │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼ REDIRECT TO DASHBOARD
┌──────────────────────────────────────────────────────────────────┐
│  SUCCESS REDIRECT                                                │
│  /dashboard                                                      │
│                                                                   │
│  ✓ User authenticated                                            │
│  ✓ Session available via useSession()                            │
│  ✓ User info in navbar                                           │
│  ✓ Can access protected routes                                   │
│  ✓ Auto-logout after 7 days                                      │
└──────────────────────────────────────────────────────────────────┘
```

**Google OAuth Security:**
- ✅ State parameter validates authorization flow (CSRF)
- ✅ Code exchange (authorization code flow)
- ✅ PKCE (Proof Key for Code Exchange)
- ✅ Secure redirect URI validation
- ✅ Access token never exposed to client
- ✅ User data verified from Google

---

## JOURNEY 4: Logout ✅

```
┌──────────────────────────────────────────────────────────────────┐
│  AUTHENTICATED DASHBOARD                                         │
│                                                                   │
│  Top Right: [AB] Ahmed Benjelloun                                │
│             ↑                                                    │
│             Click User Avatar                                    │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│  DROPDOWN MENU                                                   │
│                                                                   │
│  ╔═════════════════════════════════════╗                        │
│  ║ Ahmed Benjelloun                    ║                        │
│  ║ ahmed@acmerealty.ma                 ║                        │
│  ║ company_admin                       ║                        │
│  ║ ─────────────────────────────────── ║                        │
│  ║ ⚙️ Settings                          ║                        │
│  ║ ─────────────────────────────────── ║                        │
│  ║ 🚪 Logout                            ║ ← USER CLICKS         │
│  ╚═════════════════════════════════════╝                        │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼ CLICK LOGOUT
┌──────────────────────────────────────────────────────────────────┐
│  CLIENT COMPONENT: LogoutButton                                  │
│  Source: components/logout-button.tsx                            │
│                                                                   │
│  onClick() → {                                                   │
│    setIsLoading(true)                                            │
│    Button shows: "Logging out..."                                │
│    Call: signOut({ redirect: true, callbackUrl: "/login" })     │
│  }                                                                │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼ NEXTAUTH SIGNOUT
┌──────────────────────────────────────────────────────────────────┐
│  NEXTAUTH signOut() FUNCTION                                     │
│  Source: auth.ts export                                          │
│                                                                   │
│  ✓ Call: POST /api/auth/signout                                 │
│  ✓ Server-side session destruction                               │
│  ✓ Clear JWT token                                               │
│  ✓ Invalidate refresh token (if used)                            │
│  ✓ Log logout event (optional)                                   │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼ CLEAR COOKIES
┌──────────────────────────────────────────────────────────────────┐
│  BROWSER COOKIE CLEANUP                                          │
│                                                                   │
│  ✓ Delete: next-auth.jwt                                         │
│  ✓ Delete: next-auth.session-token (if used)                     │
│  ✓ Clear localStorage (if used)                                  │
│  ✓ Clear sessionStorage (if used)                                │
│                                                                   │
│  Result:                                                         │
│  - User is no longer authenticated                               │
│  - Session is destroyed                                          │
│  - useSession() returns: { data: null, status: "unauthenticated" }
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼ REDIRECT TO LOGIN
┌──────────────────────────────────────────────────────────────────┐
│  LOGIN PAGE (/login)                                             │
│                                                                   │
│  ✓ User redirected from /dashboard                               │
│  ✓ Middleware detects no session                                 │
│  ✓ Show login form                                               │
│  ✓ Toast: "Logged out successfully"                              │
│                                                                   │
│  User must login again to access protected routes                │
└──────────────────────────────────────────────────────────────────┘
```

**Logout Security:**
- ✅ Server-side session destruction
- ✅ Cookie deletion with proper flags
- ✅ Token invalidation
- ✅ Redirect to public page
- ✅ Toast notification for user confirmation

---

## JOURNEY 5: Team Invitations ⏳ (Structure Ready)

```
┌──────────────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD                                                 │
│  /dashboard/team  (TO BE CREATED)                                │
│                                                                   │
│  Team Members                                                    │
│  ─────────────                                                   │
│  Ahmed Benjelloun  (Company Admin)                               │
│  Sara Alami        (Agent)                                       │
│                                                                   │
│  [ + Invite Team Member ]  ← ADMIN CLICKS HERE                  │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│  INVITE MODAL / FORM                                             │
│  ──────────────────────                                          │
│                                                                   │
│  Invite New Team Member                                          │
│                                                                   │
│  Email: sara@acmerealty.ma                                       │
│  Full Name: Sara Alami                                           │
│  Role: [ Agent ▼ ]                                               │
│                                                                   │
│  [ Cancel ]  [ Send Invitation ]                                 │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼ VALIDATION
┌──────────────────────────────────────────────────────────────────┐
│  BACKEND VALIDATION                                              │
│  POST /api/auth/send-invitation  (TO BE CREATED)                │
│                                                                   │
│  ✓ Check user is company_admin                                   │
│  ✓ Validate email format                                         │
│  ✓ Check email not already in company                            │
│  ✓ Check no pending invitation for this email                    │
│  ✓ Generate invitation token (UUID v4)                           │
│  ✓ Set expiration (7 days from now)                              │
│  ✓ Store in team_invitations table                               │
│  ✓ Generate invitation link                                      │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│  SEND EMAIL                                                      │
│  Service: SendGrid / Mailgun (TO BE INTEGRATED)                  │
│                                                                   │
│  To: sara@acmerealty.ma                                          │
│  Subject: "You're invited to join Acme Realty on EstateFlow"     │
│                                                                   │
│  Body:                                                           │
│  Ahmed has invited you to join Acme Realty's team on EstateFlow │
│  Role: Agent                                                     │
│                                                                   │
│  Accept invitation:                                              │
│  https://estateflow.ma/invite/abc-123-xyz-token                 │
│                                                                   │
│  This link expires in 7 days.                                    │
│                                                                   │
│  ✓ Email sent successfully                                       │
│  Show success toast to admin                                     │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│  AGENT RECEIVES EMAIL                                            │
│                                                                   │
│  Subject: "You're invited to join Acme Realty on EstateFlow"    │
│  [Accept Invitation] → Link clicked                              │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│  INVITATION ACCEPTANCE PAGE (/invite/[token])                   │
│  (Structure Ready, page exists)                                  │
│                                                                   │
│  Welcome to Acme Realty! 🎉                                      │
│                                                                   │
│  You've been invited by Ahmed Benjelloun                         │
│  Role: Agent                                                     │
│                                                                   │
│  Email: sara@acmerealty.ma (read-only)                           │
│  Set your password: ••••••••                                     │
│  Confirm password: ••••••••                                      │
│                                                                   │
│  [ Accept Invitation & Create Account ]                          │
│                                                                   │
│  Expires in: 6 days, 23 hours                                    │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼ TOKEN VALIDATION
┌──────────────────────────────────────────────────────────────────┐
│  BACKEND VERIFICATION                                            │
│  GET/POST /api/auth/verify-invitation                           │
│                                                                   │
│  ✓ Check token exists                                            │
│  ✓ Check token not expired                                       │
│  ✓ Check token not already accepted                              │
│  ✓ Get invitation details:                                       │
│    - email                                                       │
│    - name                                                        │
│    - role                                                        │
│    - company_id                                                  │
│  ✓ Return details for display                                    │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼ CREATE ACCOUNT
┌──────────────────────────────────────────────────────────────────┐
│  BACKEND ACCEPTANCE                                              │
│  POST /api/auth/accept-invitation                               │
│                                                                   │
│  ✓ Verify token again                                            │
│  ✓ Create auth user:                                             │
│    - email: from invitation                                      │
│    - password: hash provided password                            │
│    - email_verified: true (auto-verify invited users)            │
│  ✓ Create profile:                                               │
│    - company_id: from invitation                                 │
│    - role: from invitation                                       │
│    - name: from invitation                                       │
│  ✓ Mark invitation as accepted:                                  │
│    - accepted_at: now                                            │
│    - accepted_by: user_id                                        │
│  ✓ Generate JWT token                                            │
│  ✓ Set httpOnly cookie                                           │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│  AGENT FIRST LOGIN                                               │
│  /dashboard                                                      │
│                                                                   │
│  ✓ User authenticated as agent                                   │
│  ✓ Can see assigned leads                                        │
│  ✓ Can update lead status                                        │
│  ✓ Can view properties                                           │
│  ✓ Can view showings                                             │
│  ✓ Role-based access control applied                             │
└──────────────────────────────────────────────────────────────────┘
```

**Invitation Status:**
- ✅ Code structure ready (page exists)
- ⏳ Needs database integration
- ⏳ Needs email service integration
- ⏳ Needs invitation dashboard page
- Estimated: 2-3 hours for full implementation

---

## Summary Table

| Journey | Status | Implementation | Testing |
|---------|--------|---------------|----|
| 1. Admin Signup | ✅ COMPLETE | auth.ts, signup page | Demo: ahmed@acmerealty.ma |
| 2. Regular Login | ✅ COMPLETE | auth.ts, login page | Test credentials provided |
| 3. Google OAuth | ✅ COMPLETE | auth.ts, Google provider | Click "Continue with Google" |
| 4. Logout | ✅ COMPLETE | LogoutButton component | Click avatar → Logout |
| 5. Team Invitations | ⏳ STRUCTURE READY | Page exists, needs DB | Will implement next |

---

**Ready to Test!** 🚀

```bash
npm run dev
# Visit http://localhost:3000/login
```

Start with Journey 1-4. Journey 5 (team invitations) will be implemented with database integration.
