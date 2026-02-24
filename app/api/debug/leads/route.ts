/**
 * DEBUG API: Check leads data directly
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(request)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to access this endpoint' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile?.company_id) {
      return NextResponse.json(
        { error: 'No company found for user' },
        { status: 400 }
      )
    }

    // Query all leads for this company
    const { data: leads, count, error } = await supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('company_id', profile.company_id)

    return NextResponse.json({
      user_id: user.id,
      company_id: profile.company_id,
      user_role: profile.role,
      total_leads: count,
      leads: leads || [],
      error: error?.message || null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
