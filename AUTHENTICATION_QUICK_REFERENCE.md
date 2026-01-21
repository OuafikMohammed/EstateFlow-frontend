# EstateFlow Authentication - Quick Reference

## Quick Start Checklist

### Environment Setup
```bash
# 1. Install dependencies (if needed)
npm install bcryptjs jsonwebtoken

# 2. Set environment variables in .env.local
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Migration
```bash
# Apply the updated schema with team_invitations table
supabase db push

# Or manually run migrations:
# - Add team_invitations table
# - Add team_invitations RLS policies
# - Add team_invitations timestamp trigger
```

### Test Each Journey

#### 1. Signup Flow
```
URL: http://localhost:3000/signup
Form:
  - Company Name: Test Company
  - Full Name: Test User
  - Email: test@example.com
  - Password: testPass123
Expected: Redirects to /dashboard, company created
```

#### 2. Invitation Flow
```
1. Login as company admin
2. Go to /dashboard/team (create this page)
3. Click "Invite Team Member"
4. Enter:
   - Email: agent@example.com
   - Name: Test Agent
   - Role: Agent
5. Get invitation token from console/email
6. Visit: /invite/[token]
7. Accept invitation with password
Expected: New user created, redirects to login
```

#### 3. Login Flow
```
URL: http://localhost:3000/login
Form:
  - Email: test@example.com
  - Password: testPass123
Expected: Redirects to /dashboard
```

#### 4. Logout Flow
```
1. In dashboard, click user dropdown
2. Click Logout
Expected: Redirects to /login, session cleared
```

---

## File Structure & Key Files

```
EstateFlow/
├── lib/
│   ├── auth-utils.ts                    # Utility functions
│   ├── actions/
│   │   └── auth.ts                      # Server actions (signup, signin, logout)
│   └── supabase/
│       ├── server.ts                    # Supabase client
│       └── middleware.ts                # Session refresh
│
├── components/auth/
│   ├── login-form.tsx                   # Login form with Google OAuth
│   ├── signup-form.tsx                  # Signup form
│   └── logout-button.tsx                # Logout button
│
├── app/
│   ├── api/auth/
│   │   ├── create-company/route.ts      # Create company during signup
│   │   ├── send-invitation/route.ts     # Send invitation
│   │   ├── verify-invitation/route.ts   # Verify token
│   │   ├── accept-invitation/route.ts   # Accept invitation
│   │   └── google/route.ts              # Google OAuth flow
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx               # Login page
│   │   └── signup/page.tsx              # Signup page
│   │
│   ├── invite/[token]/page.tsx          # Invitation acceptance page
│   └── middleware.ts                    # Route protection
│
├── types/
│   └── auth.types.ts                    # TypeScript definitions
│
├── supabase-schema.sql                  # Database schema
└── AUTHENTICATION_IMPLEMENTATION_GUIDE.md
```

---

## Common Tasks

### Add a New Protected Route

```typescript
// 1. Add to protectedRoutes in middleware.ts
const protectedRoutes = ['/dashboard', '/properties', '/leads', '/team']

// 2. Wrap page with user check
'use client'
import { getCurrentUser } from '@/lib/actions/auth'

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  
  return <div>Protected content</div>
}
```

### Display Current User

```typescript
'use client'
import { getCurrentUser } from '@/lib/actions/auth'

export async function UserInfo() {
  const user = await getCurrentUser()
  
  return (
    <div>
      {user?.fullName} ({user?.role})
    </div>
  )
}
```

### Add Logout Button to Navigation

```typescript
import { LogoutButton } from '@/components/auth/logout-button'

export function Navbar() {
  return (
    <nav className="flex justify-between items-center">
      <h1>EstateFlow</h1>
      <LogoutButton />
    </nav>
  )
}
```

### Handle Auth Errors

```typescript
import { transformAuthError } from '@/lib/auth-utils'

try {
  // auth operation
} catch (error) {
  const { title, message } = transformAuthError(error)
  toast({
    title,
    description: message,
    variant: 'destructive'
  })
}
```

---

## API Endpoints Reference

### Signup
```
POST /api/auth/create-company
Body: {
  userId: string
  companyName: string
  email: string
  fullName: string
}
Response: { success: true, companyId: string }
```

### Send Invitation
```
POST /api/auth/send-invitation
Headers: Authorization: Bearer [JWT]
Body: {
  email: string
  fullName: string
  role: 'agent' | 'company_admin'
}
Response: { success: true, invitationId: string, invitationLink: string }
```

### Verify Invitation
```
GET /api/auth/verify-invitation?token=abc123
Response: {
  success: true,
  invitation: {
    email: string
    fullName: string
    role: string
    companyName: string
  }
}
```

### Accept Invitation
```
POST /api/auth/accept-invitation
Body: {
  token: string
  password: string
  confirmPassword: string
}
Response: { success: true, email: string }
```

### Google OAuth
```
POST /api/auth/google
Response: { url: 'https://accounts.google.com/...' }

GET /api/auth/google?code=...&state=...
(Redirects to dashboard after successful auth)
```

---

## User Roles & Permissions

### company_admin
- ✅ Invite team members
- ✅ Manage company settings
- ✅ View all company data
- ✅ Create properties and leads
- ✅ Assign leads to agents

### agent
- ✅ View assigned leads
- ✅ View company properties
- ✅ Create activities on leads
- ✅ Schedule showings
- ❌ Cannot invite other users
- ❌ Cannot see other agents' leads

### client
- ✅ View assigned properties (future)
- ✅ View activity on properties
- ❌ Cannot create leads
- ❌ Cannot manage properties

### super_admin
- ✅ See all companies
- ✅ Manage all users
- ✅ Platform analytics
- ✅ System settings

---

## Testing Tips

### Test OAuth Locally
1. Google Cloud Console must have OAuth 2.0 credentials
2. Add `http://localhost:3000/auth/callback` to redirect URIs
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Supabase project must have Google provider enabled

### Test Invitations
```typescript
// In browser console, manually construct invite link:
const token = '...' // from database
window.location.href = '/invite/' + token
```

### Debug Auth Issues
```typescript
// Check current session in browser console:
// Get Supabase client first, then:
const { data } = await supabase.auth.getSession()
console.log(data.session)

// Check if cookies are set:
document.cookie
```

---

## Performance Optimization

### Database Indexes
Already set up for:
- `profiles.company_id`
- `profiles.email`
- `profiles.is_active`
- `team_invitations.token`
- `team_invitations.email`
- `team_invitations.expires_at`

### Caching
- User profile cached in component state
- Use `revalidatePath()` after auth state changes
- Consider `unstable_cache()` for frequently accessed user data

### Session Refresh
- Automatic via middleware
- Or manual with `supabase.auth.refreshSession()`

---

## Security Reminders

🔒 **Never commit**
- SUPABASE_SERVICE_ROLE_KEY
- Google OAuth secrets
- Database credentials

🔒 **Always use**
- httpOnly cookies for tokens
- HTTPS in production
- Row Level Security policies
- Environment variables for secrets

🔒 **Validate**
- All inputs server-side (never trust client)
- Email format and uniqueness
- Password requirements
- Token expiration

---

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Run Supabase locally
supabase start

# Push schema changes
supabase db push

# View database
supabase db pull  # Download current schema
```

---

## Frequently Asked Questions

**Q: How long do sessions last?**
A: 7 days by default. Can be customized in Supabase project settings.

**Q: Can users sign up with Google directly?**
A: Yes! The `/api/auth/google` endpoint handles both login and signup.

**Q: How do I send real invitation emails?**
A: Integrate SendGrid, Mailgun, or AWS SES. See AUTHENTICATION_IMPLEMENTATION_GUIDE.md for details.

**Q: Can I customize the invitation message?**
A: Yes, update the email template in your email service after integrating one.

**Q: How do I add 2FA?**
A: Supabase has built-in MFA. Enable in project settings, then customize in your UI.

**Q: What if invitation link expires?**
A: User sees error message "Invitation has expired. Please contact your company admin."

**Q: Can I change user role after creation?**
A: Yes, update the role in profiles table. They need to log out and back in to see changes.

---

## Support Resources

- 📚 [Full Implementation Guide](./AUTHENTICATION_IMPLEMENTATION_GUIDE.md)
- 🔗 [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- 🔗 [Next.js Auth Guide](https://nextjs.org/docs/authentication)
- 🔗 [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- 📧 Contact: dev@estateflow.ma (or your support email)

---

**Last Updated**: January 20, 2026
**Version**: 1.0
**Status**: ✅ Complete & Ready for Development
