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

    // Get user's company and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.company_id) {
      console.error('Profile fetch error:', profileError)
      return createErrorResponse('User company not found', 400)
    }

    console.log('User profile:', { userId: user.id, company_id: profile.company_id, role: profile.role })

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

    // Build search filter with proper Supabase syntax
    if (q) {
      console.log('Searching for:', q)
      query = query.or(
        `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`
      )
    }

    // Apply pagination and sorting
    const { data: leads, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Leads fetch error:', error)
      console.error('Search query was:', q)
      return createErrorResponse('Failed to fetch leads', 500)
    }

    console.log('Fetched leads count:', count, 'page:', page, 'limit:', limit, 'results:', leads?.length)

    return createSecureResponse({
      items: leads || [],
      total: count || 0,
      page,
      limit,
      pages: Math.ceil((count || 0) / limit),
    })
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return createErrorResponse('An unexpected error occurred', 500)
  }
}

/**
 * POST /api/leads
 * Create new lead
 */
export async function POST(request: NextRequest) {
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
      console.error('Auth error:', authError)
      return createErrorResponse('Unauthorized', 401)
    }

    // Get user's company
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.company_id) {
      console.error('Profile error:', profileError)
      return createErrorResponse('User company not found', 400)
    }

    // Parse request body
    const body = await request.json()
    console.log('Received lead data:', body)

    // Extract and validate lead data
    const leadData = {
      first_name: body.first_name?.trim() || '',
      last_name: body.last_name?.trim() || '',
      email: body.email?.trim() || '',
      phone: body.phone?.trim() || '',
      status: body.status || 'new',
      interested_types: body.preferred_property_type ? [body.preferred_property_type] : [],
      preferred_cities: body.preferred_location ? [body.preferred_location] : [],
      budget_min: body.budget_min || null,
      budget_max: body.budget_max || null,
      notes: body.notes || null,
      company_id: profile.company_id,
      created_by: user.id,
      assigned_to: null,
    }

    console.log('Lead data to insert:', leadData)

    // Validate required fields
    if (!leadData.first_name || !leadData.last_name || !leadData.email || !leadData.phone) {
      console.error('Validation error: Missing required fields', leadData)
      return createErrorResponse('First name, last name, email, and phone are required', 400)
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(leadData.email)) {
      console.error('Invalid email format:', leadData.email)
      return createErrorResponse('Invalid email format', 400)
    }

    // Validate budget if provided
    if (leadData.budget_min && leadData.budget_max && leadData.budget_min > leadData.budget_max) {
      console.error('Invalid budget range:', leadData.budget_min, leadData.budget_max)
      return createErrorResponse('Minimum budget cannot be greater than maximum budget', 400)
    }

    // Insert lead into database
    const { data: lead, error: createError } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single()

    if (createError) {
      console.error('Supabase insert error:', createError)
      return createErrorResponse(
        `Failed to create lead: ${createError.message}`,
        500
      )
    }

    console.log('Lead created successfully:', lead)
    return createSecureResponse({ success: true, data: lead }, 201)
  } catch (error: unknown) {
    console.error('Unexpected error in POST /api/leads:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return createErrorResponse(errorMessage, 500)
  }
}
