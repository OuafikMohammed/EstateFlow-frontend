/**
 * API Route: GET /api/dashboard/leads-timeline
 * Fetch leads timeline data for chart
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

    // Get days parameter from query string
    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get('days') || '30', 10)

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch leads created in the date range, grouped by date
    const { data: leads, error } = await supabase
      .from('leads')
      .select('created_at')
      .eq('company_id', companyId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (error) {
      console.error('Leads timeline query error:', error)
      return createErrorResponse('Failed to fetch leads timeline', 500)
    }

    // Group leads by date
    const timeline: { [key: string]: number } = {}
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      timeline[dateStr] = 0
    }

    // Count leads by date
    leads?.forEach((lead) => {
      const dateStr = new Date(lead.created_at).toISOString().split('T')[0]
      timeline[dateStr] = (timeline[dateStr] || 0) + 1
    })

    // Convert to array format for Recharts
    const data = Object.entries(timeline).map(([date, count]) => ({
      date,
      leads: count,
    }))

    return createSecureResponse({ success: true, data })
  } catch (error: unknown) {
    console.error('Leads timeline error:', error)
    return createErrorResponse('Failed to fetch leads timeline', 500)
  }
}
