/**
 * API Route: /auth/callback
 * Purpose: Handle OAuth redirect from Supabase Auth
 * 
 * When user signs in with Google, Supabase redirects here with auth codes
 * This route exchanges the code for a session and redirects to dashboard
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('[OAUTH ERROR]', {
      error,
      description: errorDescription,
    })

    const errorMessage = encodeURIComponent(
      errorDescription || error || 'Authentication failed'
    )
    return NextResponse.redirect(
      new URL(`/login?error=${errorMessage}`, requestUrl.origin)
    )
  }

  if (code) {
    try {
      const supabase = await createClient()

      // Exchange code for session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('[OAUTH EXCHANGE ERROR]', exchangeError)
        return NextResponse.redirect(
          new URL(
            `/login?error=${encodeURIComponent(exchangeError.message)}`,
            requestUrl.origin
          )
        )
      }

      // Success - check if profile and company exist
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      if (!profile?.company_id) {
        // New user or incomplete profile - redirect to onboarding
        console.log('[AUTH CALLBACK] No company found, redirecting to onboarding')
        return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
      }

      // Existing user with company - redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
    } catch (err) {
      console.error('[CALLBACK ERROR]', err)
      const message = err instanceof Error ? err.message : 'Unknown error'
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(message)}`,
          requestUrl.origin
        )
      )
    }
  }

  // No code or error - redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
