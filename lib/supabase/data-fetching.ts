/**
 * Secure Supabase Data Fetching Module
 * OWASP A01:2021 - Broken Access Control (via RLS)
 *
 * Provides type-safe data fetching with Supabase RLS
 * All queries respect database-level access control
 */

import { createClient } from '@/lib/supabase/server'
import { createClient as createClientBrowser } from '@/lib/supabase/client'

/**
 * Fetch user's company properties
 * RLS ensures user can only see their company's data
 */
export async function fetchCompanyProperties(
  filters?: {
    status?: string
    propertyType?: string
    city?: string
  },
  pagination?: {
    page: number
    limit: number
  }
) {
  const supabase = await createClient()
  const page = pagination?.page || 1
  const limit = pagination?.limit || 20

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .range((page - 1) * limit, page * limit - 1)

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.propertyType) {
    query = query.eq('property_type', filters.propertyType)
  }
  if (filters?.city) {
    query = query.ilike('city', `%${filters.city}%`)
  }

  const { data, error, count } = await query.order('created_at', {
    ascending: false,
  })

  if (error) {
    throw new Error(`Failed to fetch properties: ${error.message}`)
  }

  return {
    properties: data || [],
    total: count || 0,
    page,
    limit,
    hasMore: (page - 1) * limit + limit < (count || 0),
  }
}

/**
 * Fetch user's leads with activity count
 */
export async function fetchCompanyLeads(
  filters?: {
    status?: string
    assignedTo?: string
  },
  pagination?: {
    page: number
    limit: number
  }
) {
  const supabase = await createClient()
  const page = pagination?.page || 1
  const limit = pagination?.limit || 20

  let query = supabase.from('leads').select(
    `
    *,
    lead_activities (count)
  `,
    { count: 'exact' }
  )

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo)
  }

  const { data, error, count } = await query
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch leads: ${error.message}`)
  }

  return {
    leads: data || [],
    total: count || 0,
    page,
    limit,
  }
}

/**
 * Fetch property details with related data
 */
export async function fetchPropertyDetails(propertyId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .select(
      `
    *,
    created_by:profiles (
      id,
      full_name,
      email
    )
  `
    )
    .eq('id', propertyId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Property not found')
    }
    throw new Error(`Failed to fetch property: ${error.message}`)
  }

  return data
}

/**
 * Fetch lead with complete activity history
 */
export async function fetchLeadDetails(leadId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('leads')
    .select(
      `
    *,
    assigned_to:profiles (
      id,
      full_name,
      email
    ),
    lead_activities (
      id,
      type,
      description,
      created_at,
      created_by:profiles (
        full_name
      )
    )
  `
    )
    .eq('id', leadId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Lead not found')
    }
    throw new Error(`Failed to fetch lead: ${error.message}`)
  }

  return data
}

/**
 * Fetch dashboard statistics
 */
export async function fetchDashboardStats() {
  const supabase = await createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Not authenticated')
    }

    // Get user's company
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.company_id) {
      throw new Error('Company not found')
    }

    // Fetch stats in parallel
    const [propertiesResult, leadsResult, clientsResult] = await Promise.all([
      supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', profile.company_id),
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', profile.company_id),
      supabase.rpc('count_company_clients', {
        company_id_param: profile.company_id,
      }),
    ])

    return {
      properties: propertiesResult.count || 0,
      leads: leadsResult.count || 0,
      clients: clientsResult.data || 0,
      lastUpdated: new Date(),
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    throw error
  }
}

/**
 * Client-side data fetching (use in client components)
 * For real-time subscriptions
 */
export function useSupabaseClient() {
  return createClientBrowser()
}

/**
 * Subscribe to property changes
 * Uses Supabase v2+ API with RealtimeChannel
 */
export function subscribeToProperties(
  companyId: string,
  onUpdate: (payload: { new?: any; old?: any; eventType: string }) => void
) {
  const supabase = createClientBrowser()

  // Use the newer Supabase realtime API
  const channel = supabase
    .channel(`properties:company_id=eq.${companyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'properties',
        filter: `company_id=eq.${companyId}`,
      },
      (payload: { new?: any; old?: any; eventType: string }) => {
        onUpdate(payload)
      }
    )
    .subscribe()

  return channel
}

/**
 * Subscribe to lead status changes
 * Uses Supabase v2+ API with RealtimeChannel
 */
export function subscribeToLeads(
  companyId: string,
  onUpdate: (payload: { new?: any; old?: any; eventType: string }) => void
) {
  const supabase = createClientBrowser()

  const channel = supabase
    .channel(`leads:company_id=eq.${companyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'leads',
        filter: `company_id=eq.${companyId}`,
      },
      (payload: { new?: any; old?: any; eventType: string }) => {
        onUpdate(payload)
      }
    )
    .subscribe()

  return channel
}
