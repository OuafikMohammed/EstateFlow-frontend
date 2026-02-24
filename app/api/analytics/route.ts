import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, createSecureResponse } from '@/lib/security/security-utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.company_id) {
      return createErrorResponse('User company not found', 400)
    }

    const companyId = profile.company_id

    // 1. Lead Status Breakdown
    const { data: leadStatusData } = await supabase
      .from('leads')
      .select('status')
      .eq('company_id', companyId)

    const leadStatusBreakdown = {
      new: leadStatusData?.filter(l => l.status === 'new').length || 0,
      contacted: leadStatusData?.filter(l => l.status === 'contacted').length || 0,
      qualified: leadStatusData?.filter(l => l.status === 'qualified').length || 0,
      proposal_sent: leadStatusData?.filter(l => l.status === 'proposal_sent').length || 0,
      negotiating: leadStatusData?.filter(l => l.status === 'negotiating').length || 0,
      closed_won: leadStatusData?.filter(l => l.status === 'closed_won').length || 0,
      closed_lost: leadStatusData?.filter(l => l.status === 'closed_lost').length || 0,
    }

    // 2. Property Type Breakdown
    const { data: propertyData } = await supabase
      .from('properties')
      .select('property_type')
      .eq('company_id', companyId)
      .is('deleted_at', null)

    const propertyTypeBreakdown = {
      house: propertyData?.filter(p => p.property_type === 'house').length || 0,
      condo: propertyData?.filter(p => p.property_type === 'condo').length || 0,
      townhouse: propertyData?.filter(p => p.property_type === 'townhouse').length || 0,
      commercial: propertyData?.filter(p => p.property_type === 'commercial').length || 0,
      land: propertyData?.filter(p => p.property_type === 'land').length || 0,
      multi_family: propertyData?.filter(p => p.property_type === 'multi_family').length || 0,
    }

    // 3. Conversion Rate
    const totalLeads = leadStatusData?.length || 0
    const closedWonLeads = leadStatusBreakdown.closed_won
    const conversionRate = totalLeads > 0 ? Math.round((closedWonLeads / totalLeads) * 100) : 0

    // 4. Property Status
    const { data: propertyStatusData } = await supabase
      .from('properties')
      .select('status')
      .eq('company_id', companyId)
      .is('deleted_at', null)

    const propertyStatusBreakdown = {
      available: propertyStatusData?.filter(p => p.status === 'available').length || 0,
      under_contract: propertyStatusData?.filter(p => p.status === 'under_contract').length || 0,
      sold: propertyStatusData?.filter(p => p.status === 'sold').length || 0,
      expired: propertyStatusData?.filter(p => p.status === 'expired').length || 0,
      withdrawn: propertyStatusData?.filter(p => p.status === 'withdrawn').length || 0,
    }

    // 5. Budget Analysis
    const { data: leadBudgetData } = await supabase
      .from('leads')
      .select('budget_min, budget_max')
      .eq('company_id', companyId)
      .not('budget_min', 'is', null)

    const budgetStats = {
      avg_budget_min: leadBudgetData?.length
        ? Math.round(leadBudgetData.reduce((sum, l) => sum + (l.budget_min || 0), 0) / leadBudgetData.length)
        : 0,
      avg_budget_max: leadBudgetData?.length
        ? Math.round(leadBudgetData.reduce((sum, l) => sum + (l.budget_max || 0), 0) / leadBudgetData.length)
        : 0,
    }

    // 6. Recent Activity
    const { data: recentLeads } = await supabase
      .from('leads')
      .select('id, first_name, last_name, status, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: recentProperties } = await supabase
      .from('properties')
      .select('id, title, status, created_at')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5)

    const analytics = {
      lead_status_breakdown: leadStatusBreakdown,
      property_type_breakdown: propertyTypeBreakdown,
      property_status_breakdown: propertyStatusBreakdown,
      conversion_rate: conversionRate,
      total_leads: totalLeads,
      total_properties: propertyData?.length || 0,
      budget_stats: budgetStats,
      recent_leads: recentLeads || [],
      recent_properties: recentProperties || [],
    }

    return createSecureResponse({ success: true, data: analytics })
  } catch (error: unknown) {
    console.error('Analytics error:', error)
    return createErrorResponse('Failed to fetch analytics', 500)
  }
}
