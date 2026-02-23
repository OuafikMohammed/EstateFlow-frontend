/**
 * API Route: /api/dashboard
 * Endpoint for dashboard statistics and overview data
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, createSecureResponse } from '@/lib/security/security-utils'

/**
 * GET /api/dashboard/stats
 * Fetch dashboard statistics
 */
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

    // Fetch total properties
    const { count: totalProperties } = await supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)

    // Fetch total leads
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)

    // Fetch not contacted leads (status = 'new')
    const { count: notContactedLeads } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'new')

    // Fetch contacted leads (status != 'new' and not closed)
    const { count: contactedLeads } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .in('status', ['contacted', 'qualified', 'proposal_sent', 'negotiating'])

    // Fetch closed won leads (deal made)
    const { count: closedWonLeads } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'closed_won')

    // Fetch sold properties
    const { count: propertiesSold } = await supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'sold')

    // Calculate revenue (sum of sold properties)
    const { data: soldProperties } = await supabase
      .from('properties')
      .select('price')
      .eq('company_id', companyId)
      .eq('status', 'sold')

    const totalRevenue =
      soldProperties?.reduce((sum, p) => sum + (p.price || 0), 0) || 0

    const stats = {
      total_properties: totalProperties || 0,
      total_leads: totalLeads || 0,
      not_contacted_leads: notContactedLeads || 0,
      contacted_leads: contactedLeads || 0,
      closed_won_leads: closedWonLeads || 0,
      properties_sold: propertiesSold || 0,
      total_revenue: totalRevenue,
    }

    return createSecureResponse({ success: true, data: stats })
  } catch (error: unknown) {
    console.error('Dashboard stats error:', error)
    return createErrorResponse('Failed to fetch dashboard stats', 500)
  }
}
