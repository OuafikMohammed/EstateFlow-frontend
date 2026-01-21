/**
 * API Route: /api/auth/session
 * Purpose: Get current user session (Supabase)
 * 
 * Returns:
 * - { user, session } if logged in
 * - { user: null, session: null } if not logged in
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { user: null, session: null },
        { status: 200 }
      )
    }

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return NextResponse.json(
      { user, session },
      { status: 200 }
    )
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}
