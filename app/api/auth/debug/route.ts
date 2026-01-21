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

    return NextResponse.json(
      {
        status: 'ok',
        env: envCheck,
        supabase_connection: error ? 'failed' : 'success',
        error: error?.message,
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
