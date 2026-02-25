// services/dashboard.service.ts
// Centralized data fetching for dashboard widgets
// All queries are scoped and only fetch what each role needs

import { createClient } from '@/lib/supabase/server'

export type DashboardStatsResult = {
  properties: number
  activeLeads: number
  upcomingShowings: number
  teamMembers?: number
  revenue?: number
  conversionRate?: number
}

/** Fetches company-wide stats for Admin role */
export async function getAdminDashboardStats(companyId: string): Promise<DashboardStatsResult> {
  const supabase = await createClient()

  const [
    { count: properties },
    { count: activeLeads },
    { count: upcomingShowings },
    { count: teamMembers },
  ] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact', head: true })
      .eq('company_id', companyId),
    supabase.from('clients').select('id', { count: 'exact', head: true })
      .eq('company_id', companyId).eq('status', 'active'),
    supabase.from('showings').select('id', { count: 'exact', head: true })
      .eq('company_id', companyId).gte('scheduled_at', new Date().toISOString()),
    supabase.from('profiles').select('id', { count: 'exact', head: true })
      .eq('company_id', companyId).eq('is_active', true),
  ])

  return {
    properties: properties ?? 0,
    activeLeads: activeLeads ?? 0,
    upcomingShowings: upcomingShowings ?? 0,
    teamMembers: teamMembers ?? 0,
  }
}

/** Fetches personal stats for Agent role */
export async function getAgentDashboardStats(agentId: string): Promise<DashboardStatsResult> {
  const supabase = await createClient()

  const [
    { count: properties },
    { count: activeLeads },
    { count: upcomingShowings },
  ] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact', head: true })
      .eq('agent_id', agentId),
    supabase.from('clients').select('id', { count: 'exact', head: true })
      .eq('assigned_agent_id', agentId).eq('status', 'active'),
    supabase.from('showings').select('id', { count: 'exact', head: true })
      .eq('agent_id', agentId).gte('scheduled_at', new Date().toISOString()),
  ])

  return {
    properties: properties ?? 0,
    activeLeads: activeLeads ?? 0,
    upcomingShowings: upcomingShowings ?? 0,
  }
}

/** System-wide stats for Super Admin */
export async function getSuperAdminStats() {
  const supabase = await createClient()

  const [
    { count: companies },
    { count: users },
    { count: properties },
    { count: leads },
  ] = await Promise.all([
    supabase.from('companies').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('properties').select('id', { count: 'exact', head: true }),
    supabase.from('clients').select('id', { count: 'exact', head: true }),
  ])

  return {
    companies: companies ?? 0,
    users: users ?? 0,
    properties: properties ?? 0,
    leads: leads ?? 0,
  }
}
