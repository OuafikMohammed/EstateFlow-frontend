/**
 * API Route: GET /api/dashboard/recent-leads
 * Fetch recent leads for dashboard widget
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, createSecureResponse } from '@/lib/security/security-utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(request)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Get user's company
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.company_id) {
      return createErrorResponse('User company not found', 400)
    }

    const companyId = profile.company_id

    // Get limit parameter from query string
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '5', 10)

    // Fetch recent leads
    const { data: leads, error } = await supabase
      .from('leads')
      .select('id, first_name, last_name, email, phone, status, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Recent leads query error:', error)
      return createErrorResponse('Failed to fetch recent leads', 500)
    }

    return createSecureResponse({ success: true, data: leads || [] })
  } catch (error: unknown) {
    console.error('Recent leads error:', error)
    return createErrorResponse('Failed to fetch recent leads', 500)
  }
}
