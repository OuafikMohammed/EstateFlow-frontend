# Authentication Setup Guide

## Files Created

### 1. `types/auth.types.ts` - TypeScript Types
Complete type definitions for all auth operations:
- `SignUpFormData` - Input for signup
- `SignInFormData` - Input for signin
- `AuthResponse<T>` - Generic response type
- `SignUpResponse` - Specific signup response
- `SignInResponse` - Specific signin response
- `AuthUser` - Current user info
- `Company` - Company data
- `UserProfile` - User profile data

### 2. `lib/actions/auth.ts` - Server Actions
Five core authentication functions:

#### signUp(formData)
Creates a new user account with company and profile setup.

**Input:**
```typescript
{
  companyName: string
  fullName: string
  email: string
  password: string
}
```

**Process:**
1. Validates all inputs (email format, password length, etc.)
2. Checks if email already exists
3. Creates Supabase auth user
4. Creates company record in database
5. Updates user profile with company_id and admin role
6. Returns success with user and company IDs

**Returns:**
```typescript
{
  success: boolean
  error?: string
  data?: {
    userId: string
    companyId: string
    email: string
  }
}
```

**Example:**
```typescript
const result = await signUp({
  companyName: 'Acme Real Estate',
  fullName: 'John Doe',
  email: 'john@example.com',
  password: 'secure123'
})

if (result.success) {
  console.log('User ID:', result.data?.userId)
  console.log('Company ID:', result.data?.companyId)
} else {
  console.error('Error:', result.error)
}
```

#### signIn(formData)
Authenticates an existing user.

**Input:**
```typescript
{
  email: string
  password: string
}
```

**Process:**
1. Validates inputs
2. Authenticates with Supabase
3. Fetches user profile
4. Verifies user is active
5. Returns success with user details

**Returns:**
```typescript
{
  success: boolean
  error?: string
  data?: {
    userId: string
    email: string
    fullName?: string
  }
}
```

**Example:**
```typescript
const result = await signIn({
  email: 'john@example.com',
  password: 'secure123'
})

if (result.success) {
  console.log('Signed in as:', result.data?.fullName)
} else {
  console.error('Error:', result.error)
}
```

#### signOut()
Signs out the current user and redirects to login.

**Example:**
```typescript
const result = await signOut()
// Automatically redirects to /login
```

#### getCurrentUser()
Fetches the currently logged-in user's information.

**Returns:**
```typescript
{
  id: string
  email: string
  fullName?: string
  companyId?: string
  role?: 'admin' | 'agent' | 'viewer'
  isActive?: boolean
} | null
```

**Example:**
```typescript
const user = await getCurrentUser()
if (user) {
  console.log('Logged in as:', user.fullName)
  console.log('Company ID:', user.companyId)
}
```

#### updateProfile(userId, updates)
Updates user profile information.

**Input:**
```typescript
{
  fullName?: string
  avatarUrl?: string
  phone?: string
}
```

**Returns:**
```typescript
{
  success: boolean
  error?: string
}
```

**Example:**
```typescript
const result = await updateProfile(userId, {
  fullName: 'Jane Doe',
  phone: '+1-555-0123'
})
```

#### changePassword(currentPassword, newPassword)
Changes the user's password.

**Input:** Two strings (current and new passwords)

**Returns:**
```typescript
{
  success: boolean
  error?: string
}
```

**Example:**
```typescript
const result = await changePassword('oldpass123', 'newpass456')
```

### 3. `components/auth/auth-examples.tsx` - Example Components
Three ready-to-use components:

#### SignUpForm
Complete signup form with validation.

```typescript
import { SignUpForm } from '@/components/auth/auth-examples'

export default function RegisterPage() {
  return <SignUpForm />
}
```

#### SignInForm
Complete signin form.

```typescript
import { SignInForm } from '@/components/auth/auth-examples'

export default function LoginPage() {
  return <SignInForm />
}
```

#### SignOutButton
Logout button component.

```typescript
import { SignOutButton } from '@/components/auth/auth-examples'

export default function Navbar() {
  return (
    <nav>
      <SignOutButton />
    </nav>
  )
}
```

## Error Handling

All server actions include comprehensive error handling:

**Common errors:**

1. **Validation errors:**
   - Empty required fields
   - Invalid email format
   - Weak password (< 6 chars)
   - Company name required

2. **Auth errors:**
   - Email already registered
   - Invalid credentials
   - User not found
   - Account deactivated

3. **Database errors:**
   - Company creation failed
   - Profile update failed
   - Database connection errors

4. **Unexpected errors:**
   - Generic fallback error message
   - Logged to console for debugging

## Signup Flow Explanation

The signup process is complex because of the relationship between auth users and profiles:

```
1. User submits signup form
   ↓
2. Create Supabase auth user
   ↓
3. Auth trigger auto-creates empty profile record
   ↓
4. Create company record
   ↓
5. Update profile with:
   - company_id (link to company)
   - full_name
   - role = 'admin' (first user)
   - is_active = true
   ↓
6. Return success
   ↓
7. Redirect to dashboard
```

If any step fails, the transaction is rolled back where possible.

## Usage in Pages

### Login Page Example
```typescript
// app/login/page.tsx
import { SignInForm } from '@/components/auth/auth-examples'

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      <SignInForm />
    </div>
  )
}
```

### Register Page Example
```typescript
// app/register/page.tsx
import { SignUpForm } from '@/components/auth/auth-examples'

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>
      <SignUpForm />
    </div>
  )
}
```

### Dashboard with Logout Example
```typescript
// app/dashboard/page.tsx
import { getCurrentUser } from '@/lib/actions/auth'
import { SignOutButton } from '@/components/auth/auth-examples'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Welcome, {user.fullName}</h1>
        <SignOutButton />
      </div>
      {/* Dashboard content */}
    </div>
  )
}
```

## Security Features

✅ **Password validation** - Minimum 6 characters
✅ **Email validation** - Format and uniqueness checks
✅ **Server-side only** - All auth logic on server (via 'use server')
✅ **Session management** - Supabase handles secure sessions
✅ **Active user check** - Deactivated accounts can't sign in
✅ **Company isolation** - Each user belongs to exactly one company
✅ **Role-based access** - Users have defined roles (admin, agent, viewer)

## Edge Cases Handled

✅ Email already registered
✅ Invalid email format
✅ Weak password
✅ Company creation failure (rolls back user)
✅ Profile update failure
✅ Inactive user login attempt
✅ Missing profile data
✅ Invalid credentials
✅ Network errors
✅ Database errors

## Next Steps

1. ✅ Auth types created
2. ✅ Server actions created
3. ✅ Example components created
4. Next: Create login/register pages
5. Next: Integrate with middleware for route protection
6. Next: Add 2FA/OAuth if needed

## Testing Checklist

- [ ] Test signup with valid data
- [ ] Test signup with invalid email
- [ ] Test signup with weak password
- [ ] Test signup with existing email
- [ ] Test signin with correct credentials
- [ ] Test signin with wrong password
- [ ] Test signin as deactivated user
- [ ] Test signout redirect
- [ ] Test getCurrentUser in protected page
- [ ] Test updateProfile
- [ ] Test changePassword
