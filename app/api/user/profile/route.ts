/**
 * API Route: /api/user/profile
 * Get current authenticated user's profile
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, createSecureResponse } from '@/lib/security/security-utils'

/**
 * GET /api/user/profile
 * Fetch current user's profile - REQUIRES AUTHENTICATION
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(request)

    // Get current user - REQUIRED
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return createErrorResponse('Unauthorized - please log in', 401)
    }

    // Fetch user's profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      // Return basic user info if profile doesn't exist
      return createSecureResponse({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        phone: user.user_metadata?.phone || '',
      })
    }

    return createSecureResponse(profile)
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return createErrorResponse(errorMessage, 500)
  }
}

// Prevent other methods
export function DELETE() {
  return createErrorResponse('Method not allowed', 405)
}

export function PUT() {
  return createErrorResponse('Method not allowed', 405)
}

export function POST() {
  return createErrorResponse('Method not allowed', 405)
}
