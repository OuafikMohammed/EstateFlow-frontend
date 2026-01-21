# Google OAuth Setup Guide for Supabase

## Overview
This guide walks you through enabling Google OAuth in your Supabase project for the EstateFlow application.

## Your Project Details
- **Supabase Project URL**: https://uozchnrhxeiyywyvbyxb.supabase.co
- **Supabase Callback URL**: `https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback`
- **Local Dev Callback**: `http://localhost:3000/auth/v1/callback`
- **Google Client ID**: `6384997967-qbihtl5gl050nq19tcc3tfhiiusrfmot.apps.googleusercontent.com`
- **Google Client Secret**: `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`

## Step 1: Verify Google OAuth Configuration

### In Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID (Web application)
5. Verify these settings:
   - **Authorized JavaScript origins**: Should include:
     - `http://localhost:3000` (for local development)
     - Your production domain
   - **Authorized redirect URIs**: Should include:
     - `http://localhost:3000/auth/v1/callback` (local)
     - `https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback` (production)

## Step 2: Enable Google Provider in Supabase Dashboard

1. Open your [Supabase Dashboard](https://app.supabase.com)
2. Select your **EstateFlow** project
3. In the left sidebar, click **Authentication**
4. Click **Providers** (under Configuration)
5. Find and click on **Google** to expand it
6. Toggle **Google Enabled** to **ON**
7. Enter these credentials:
   - **Client ID**: `6384997967-qbihtl5gl050nq19tcc3tfhiiusrfmot.apps.googleusercontent.com`
   - **Client Secret**: `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`
8. Click **Save**

## Step 3: Test Google OAuth Locally

1. Start your Next.js dev server:
   ```bash
   pnpm dev
   ```

2. Navigate to your signup page: `http://localhost:3000/signup`

3. Click the "Sign up with Google" button (if implemented)

4. You should be redirected to Google's consent screen

5. After signing in with Google, you'll be redirected back to your app

## Step 4: Configure Frontend (Already Done)

Your frontend is already configured to use Google OAuth:

### In `components/auth/secure-signup-form.tsx`:
```typescript
const handleGoogleSignUp = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  
  if (error) {
    console.error('Google sign-up error:', error)
    setError(error.message)
  }
}
```

### In `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://uozchnrhxeiyywyvbyxb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
GOOGLE_CLIENT_ID=6384997967-qbihtl5gl050nq19tcc3tfhiiusrfmot.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

## Step 5: Create OAuth Callback Handler (If Not Exists)

If you need to handle the OAuth callback explicitly, create/verify this file:

**File**: `app/auth/callback/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
```

## Troubleshooting

### Error: "Unsupported provider: provider is not enabled"
**Solution**: Google provider is not enabled in Supabase. Follow Step 2 above.

### Error: "Invalid Client ID"
**Solution**: The Client ID or Secret is incorrect. Verify them in Google Cloud Console.

### User not being created after Google sign-in
**Solution**: Check that your database tables exist:
- `auth.users` (Supabase managed)
- `public.profiles` (user profiles)
- `public.companies` (company workspaces)

### Redirect URI mismatch
**Solution**: Ensure the callback URL in Google Cloud Console matches:
- Local: `http://localhost:3000/auth/v1/callback`
- Production: `https://uozchnrhxeiyywyvbyxb.supabase.co/auth/v1/callback`

## Database Tables Required

Make sure these tables exist in your Supabase database:

### profiles table
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  company_id UUID REFERENCES public.companies(id),
  role TEXT,
  is_company_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### companies table
```sql
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  logo_url TEXT,
  industry TEXT,
  team_size TEXT,
  phone TEXT,
  address TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### company_invites table
```sql
CREATE TABLE public.company_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE,
  invited_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
```

## Next Steps

1. ✅ Enable Google OAuth in Supabase dashboard (THIS PAGE)
2. 📋 Verify database tables exist
3. 🔒 Create storage bucket for company logos
4. 📧 Configure email service for invitations
5. 🧪 Test end-to-end flow

## Testing Checklist

- [ ] Google provider enabled in Supabase
- [ ] Can click "Sign up with Google" button
- [ ] Redirected to Google consent screen
- [ ] After approval, redirected back to app
- [ ] User created in `auth.users`
- [ ] Profile created in `public.profiles`
- [ ] Company created in `public.companies` with `created_by`
- [ ] Onboarding wizard loads after signup
- [ ] Logo upload to storage works
- [ ] Team invite email sending works

---

For more information, see the [Supabase Google OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
