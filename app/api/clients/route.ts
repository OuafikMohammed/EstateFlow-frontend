/**
 * API Route: /api/clients
 * Endpoint for clients management (CRUD operations)
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRateLimiter, RATE_LIMITS, createUserKeyGenerator } from '@/lib/security/rate-limiter'
import { createErrorResponse, createSecureResponse } from '@/lib/security/security-utils'

const clientsLimiter = createRateLimiter({
  ...RATE_LIMITS.authenticated.general,
  keyGenerator: createUserKeyGenerator((req) => {
    const authHeader = req.headers.get('authorization')
    return authHeader ? 'authenticated-user' : null
  }),
})

/**
 * GET /api/clients
 * Fetch clients with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = clientsLimiter(request)
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
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '10'))
    const status = searchParams.get('status')
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
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('company_id', profile.company_id)
      .is('deleted_at', null) // Exclude soft deleted

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (q) {
      query = query.or(
        `name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`,
      )
    }

    // Apply pagination and sorting
    const { data: clients, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Clients fetch error:', error)
      return createErrorResponse('Failed to fetch clients', 500)
    }

    return createSecureResponse({
      success: true,
      data: {
        items: clients || [],
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
 * POST /api/clients
 * Create new client
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()

    const { name, email, phone, status, source, budget_min, budget_max, preferred_type, preferred_location, bedrooms, notes } = body

    // Validate required fields
    if (!name || !email || !phone) {
      return createErrorResponse('name, email, and phone are required', 400)
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return createErrorResponse('Invalid email address', 400)
    }

    // Insert client
    const { data: client, error: createError } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        created_by: user.id,
        company_id: profile.company_id,
        name,
        email,
        phone,
        status: status || 'warm',
        source: source || null,
        budget_min: budget_min ? parseInt(budget_min) : null,
        budget_max: budget_max ? parseInt(budget_max) : null,
        preferred_type: preferred_type || [],
        preferred_location: preferred_location || [],
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        notes: notes || null,
      })
      .select()
      .single()

    if (createError) {
      console.error('Client creation error:', createError)
      return createErrorResponse('Failed to create client', 500)
    }

    return createSecureResponse(
      { success: true, data: client },
      201,
    )
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return createErrorResponse('An unexpected error occurred', 500)
  }
}
