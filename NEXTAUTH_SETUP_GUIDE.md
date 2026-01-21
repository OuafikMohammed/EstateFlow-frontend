# NextAuth.js Implementation Guide

## Overview
EstateFlow now uses **NextAuth.js v4** for authentication with Google OAuth and email/password sign-in.

## Installation Complete ✅

### Installed Packages
```bash
npm install next-auth bcryptjs
```

## Setup & Configuration

### 1. Environment Variables (.env.local)
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=wnMy0mJIl75G/Gsg0qe/w42smwTUyjwY1iv2FzK61M4=

# Google OAuth
GOOGLE_CLIENT_ID=6384997967-qbihtl5gl050nq19tcc3tfhiiusrfmot.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### 2. File Structure

#### Core Auth Files
- **[auth.ts](auth.ts)** - NextAuth configuration with Google & Credentials providers
- **[app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts)** - API route handler
- **[components/providers/auth-provider.tsx](components/providers/auth-provider.tsx)** - SessionProvider wrapper

#### Pages
- **[app/login/page.tsx](app/login/page.tsx)** - Login page with email/password and Google OAuth
- **[app/signup/page.tsx](app/signup/page.tsx)** - Signup page for new company admins
- **[app/layout.tsx](app/layout.tsx)** - Updated with AuthProvider

#### Components
- **[components/logout-button.tsx](components/logout-button.tsx)** - Logout button component
- **[components/logo.tsx](components/logo.tsx)** - EstateFlow logo
- **[components/layout/navbar.tsx](components/layout/navbar.tsx)** - Updated navbar with session info

## User Journeys

### JOURNEY 1: Company Admin Signup

**Flow:**
1. User clicks "Start Free Trial" → redirects to `/signup`
2. Fills form: Company Name, Full Name, Email, Password
3. Clicks "Start Free Trial"
4. Success message, redirects to `/login`
5. User logs in and redirects to `/dashboard`

**Demo Credentials (for testing):**
```
Email: ahmed@acmerealty.ma
Password: Password123!
```

### JOURNEY 2: Agent Invitation & Signup

**Current Status:** Code structure ready, needs backend integration
- Admin invites agent via `/dashboard/team` (TODO: Create this page)
- Email sent with invite link
- Agent accepts via `/invite/[token]` page
- Creates account and joins company

### JOURNEY 3: Regular Login (Email/Password)

**Flow:**
1. User goes to `/login`
2. Enters email & password
3. Backend validates credentials
4. Redirects to `/dashboard` on success
5. Session managed via JWT in httpOnly cookie

**Features:**
- Client-side validation
- Error messages for invalid credentials
- Loading states
- "Remember me" option (ready to implement)

### JOURNEY 4: Google OAuth SignIn

**Flow:**
1. User clicks "Continue with Google"
2. Redirected to Google login
3. Authorized → callback to `/api/auth/callback/google`
4. Session created
5. Redirected to `/dashboard`

**Note:** Ensure Google credentials are properly configured in `.env.local`

### JOURNEY 5: Logout

**Flow:**
1. Click user avatar → "Logout" in dropdown
2. SessionProvider clears session
3. Redirects to `/login`
4. All cookies cleared

## Testing the Implementation

### Test Login
```
Email: ahmed@acmerealty.ma
Password: Password123!
```

### Test Google OAuth
1. Click "Continue with Google" button
2. Use any Google account
3. Should create session and redirect

### Test Logout
1. Click user avatar in navbar
2. Click "Logout"
3. Should redirect to login page
4. Session should be cleared

## Database Integration

Currently using mock users. To integrate with real database:

1. **Update auth.ts**
   ```typescript
   // Replace MOCK_USERS with database queries
   const user = await db.users.findUnique({
     where: { email: credentials.email }
   });
   ```

2. **Create user in signup**
   - Create API route `/api/auth/signup`
   - Hash password with bcryptjs
   - Store in database
   - Return response

3. **Create profile on Google OAuth**
   - Add JWT callback logic
   - Create profile if first-time user
   - Store company_id in session

## Security Features

✅ **httpOnly Cookies** - Session tokens in secure httpOnly cookies (XSS-safe)
✅ **JWT Tokens** - 7-day expiration
✅ **Password Hashing** - bcryptjs for password hashing
✅ **CSRF Protection** - NextAuth handles CSRF tokens automatically
✅ **Session Validation** - JWT validation on every request

## Production Checklist

- [ ] Generate new `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Configure Google OAuth redirect URIs in Google Cloud Console
- [ ] Set up real database connection
- [ ] Implement email service (SendGrid/Mailgun) for invitations
- [ ] Test all OAuth flows in production
- [ ] Set up monitoring/logging for auth errors
- [ ] Implement password reset flow
- [ ] Implement 2FA for company admins

## API Endpoints

### POST `/api/auth/signin`
Sign in with credentials
```typescript
Body: { email: string, password: string }
Response: { status: "success" | "error", message: string }
```

### POST `/api/auth/callback/google`
Google OAuth callback (automatic, handled by NextAuth)

### POST `/api/auth/signout`
Sign out user and clear session

### GET `/api/auth/session`
Get current session (automatic client-side via useSession)

## Debugging

### Check Session
```typescript
// In any client component
"use client"
import { useSession } from "next-auth/react"

export function MyComponent() {
  const { data: session } = useSession()
  console.log("Session:", session)
  return <div>{session?.user?.name}</div>
}
```

### Check Auth Config
- All imports in `auth.ts` are correct
- Google credentials match `.env.local`
- `NEXTAUTH_SECRET` is set and strong
- API route is at `app/api/auth/[...nextauth]/route.ts`

### Common Issues

**Issue:** "SessionProvider not found"
- **Solution:** Ensure `AuthProvider` wraps app content in `layout.tsx`

**Issue:** Google OAuth not working
- **Solution:** Check credentials in `.env.local` and Google Cloud Console

**Issue:** Logout not working
- **Solution:** Ensure `LogoutButton` calls `signOut()` from next-auth/react

## Next Steps

1. **Database Integration**
   - Connect to PostgreSQL/Supabase
   - Update MOCK_USERS queries

2. **Email Invitations**
   - Integrate SendGrid/Mailgun
   - Create `/api/auth/invite` route

3. **Team Management**
   - Create `/dashboard/team` page
   - Admin can invite and manage agents

4. **User Profile**
   - Create `/settings` page
   - Password change, profile editing

5. **Advanced Features**
   - Password reset flow
   - Two-factor authentication
   - Session management (max active sessions)
   - Login history/audit log

## Files Modified

1. `package.json` - Added next-auth, bcryptjs
2. `.env.local` - Added NextAuth variables
3. `auth.ts` (NEW) - NextAuth configuration
4. `app/layout.tsx` - Added AuthProvider
5. `app/login/page.tsx` - Modern login with Google OAuth
6. `app/signup/page.tsx` - Modern signup page
7. `components/logout-button.tsx` - Logout component
8. `components/providers/auth-provider.tsx` (NEW) - SessionProvider wrapper
9. `components/layout/navbar.tsx` - Updated with NextAuth session
10. `components/logo.tsx` (NEW) - Logo component

## UI/UX Features Implemented

✅ Dark gradient backgrounds (slate-900 theme)
✅ Professional card-based layouts
✅ Form validation with error messages
✅ Loading states on buttons
✅ Google OAuth button with Chrome icon
✅ Demo credentials display
✅ User avatar in navbar with initials
✅ Dropdown menu for user options
✅ Responsive design (mobile-friendly)
✅ Toast notifications for feedback

## Support

For questions or issues:
1. Check the "Debugging" section above
2. Review NextAuth.js documentation: https://next-auth.js.org
3. Check console for error messages
4. Ensure all environment variables are set correctly
