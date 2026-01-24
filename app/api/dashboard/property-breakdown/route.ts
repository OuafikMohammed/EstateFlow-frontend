/**
 * API Route: GET /api/dashboard/property-breakdown
 * Fetch property type breakdown for chart
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

    // Fetch properties grouped by type
    const { data: properties, error } = await supabase
      .from('properties')
      .select('property_type')
      .eq('company_id', companyId)

    if (error) {
      console.error('Property breakdown query error:', error)
      return createErrorResponse('Failed to fetch property breakdown', 500)
    }

    // Count properties by type
    const breakdown: { [key: string]: number } = {}
    properties?.forEach((prop) => {
      const type = prop.property_type || 'Other'
      breakdown[type] = (breakdown[type] || 0) + 1
    })

    // Convert to array format for Recharts with colors
    const colors: { [key: string]: string } = {
      house: '#C5A059',
      condo: '#1B4332',
      townhouse: '#52B788',
      commercial: '#E8D4A0',
      land: '#FFB703',
      multi_family: '#8B5A3C',
      apartment: '#40916C',
    }

    const data = Object.entries(breakdown).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' '),
      value: count,
      fill: colors[type] || '#999999',
    }))

    return createSecureResponse({ success: true, data })
  } catch (error: unknown) {
    console.error('Property breakdown error:', error)
    return createErrorResponse('Failed to fetch property breakdown', 500)
  }
}
