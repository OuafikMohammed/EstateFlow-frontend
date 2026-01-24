/**
 * API Route: /api/leads
 * Endpoint for leads management (CRUD operations)
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRateLimiter, RATE_LIMITS, createUserKeyGenerator } from '@/lib/security/rate-limiter'
import { validateRequest, validationErrorResponse, Schemas } from '@/lib/security/validation'
import { createErrorResponse, createSecureResponse } from '@/lib/security/security-utils'

const leadsLimiter = createRateLimiter({
  ...RATE_LIMITS.authenticated.general,
  keyGenerator: createUserKeyGenerator((req) => {
    const authHeader = req.headers.get('authorization')
    return authHeader ? 'authenticated-user' : null
  }),
})

/**
 * GET /api/leads
 * Fetch leads with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = leadsLimiter(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const supabase = await createClient(request)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'))
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    const q = searchParams.get('q')

    // Get user's company
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.company_id) {
      return createErrorResponse('User company not found', 400)
    }

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('company_id', profile.company_id)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }

    if (q) {
      query = query.or(
        `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`,
      )
    }

    // Apply pagination and sorting
    const { data: leads, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Leads fetch error:', error)
      return createErrorResponse('Failed to fetch leads', 500)
    }

    return createSecureResponse({
      success: true,
      data: {
        items: leads || [],
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return createErrorResponse('An unexpected error occurred', 500)
  }
}

/**
 * POST /api/leads
 * Create new lead - supports both public inquiries and authenticated users
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(request)

    // Parse request body
    const body = await request.json()

    console.log('Creating lead with data:', body)

    // Extract lead data - supports both formats
    const leadData = {
      name: body.name || body.first_name || '',
      phone: body.phone || '',
      email: body.email || '',
      message: body.message || '',
      property_id: body.property_id || null,
      status: body.status || 'new',
      company_id: body.company_id || '00000000-0000-0000-0000-000000000001',
      created_at: new Date().toISOString(),
    }

    // Validate required fields
    if (!leadData.name || !leadData.phone || !leadData.email) {
      return createErrorResponse('name, phone, and email are required', 400)
    }

    console.log('Sanitized lead data:', leadData)

    // Insert lead
    const { data: lead, error: createError } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single()

    if (createError) {
      console.error('Lead creation error:', createError)
      return createErrorResponse(`Failed to create lead: ${createError.message}`, 500)
    }

    console.log('Lead created successfully:', lead)
    return createSecureResponse({ success: true, data: lead }, 201)
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return createErrorResponse(errorMessage, 500)
  }
}
