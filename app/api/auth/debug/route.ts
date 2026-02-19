/**
 * Debug endpoint to test Supabase connection and environment variables
 * DELETE THIS FILE BEFORE PRODUCTION
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗',
      anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗',
      service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗',
    }

    // Try to connect to Supabase
    const admin = createAdminClient()
    
    const { data, error } = await admin
      .from('companies')
      .select('id')
      .limit(1)

    // Get all users in auth system
    const { data: { users = [] }, error: usersError } = await admin.auth.admin.listUsers()

    // Get all profiles
    const { data: profiles = [], error: profilesError } = await admin
      .from('profiles')
      .select('id, email, full_name, is_active')

    // Find mismatches
    const authEmails = users.map(u => u.email).filter(Boolean) as string[]
    const profileEmails = profiles.map(p => p.email).filter(Boolean) as string[]
    
    const missingFromProfiles = authEmails.filter(e => !profileEmails.includes(e))
    const missingFromAuth = profileEmails.filter(e => !authEmails.includes(e))

    return NextResponse.json(
      {
        status: 'ok',
        env: envCheck,
        supabase_connection: error ? 'failed' : 'success',
        database_error: error?.message,
        auth_users_count: users.length,
        auth_users: users.map(u => ({
          id: u.id,
          email: u.email,
          email_confirmed: !!u.email_confirmed_at,
        })),
        profiles_count: profiles.length,
        profiles: profiles.map(p => ({
          id: p.id,
          email: p.email,
          name: p.full_name,
          active: p.is_active,
        })),
        mismatches: {
          missing_from_profiles: missingFromProfiles,
          missing_from_auth: missingFromAuth,
        },
        errors: {
          users_error: usersError?.message,
          profiles_error: profilesError?.message,
        },
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        status: 'error',
        error: message,
      },
      { status: 500 }
    )
  }
}
