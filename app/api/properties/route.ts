/**
 * API Route: /api/properties
 * OWASP A01:2021 - Broken Access Control (via Supabase RLS)
 * OWASP A06:2021 - Vulnerable and Outdated Components
 *
 * Secure properties endpoint with:
 * - Authentication requirement
 * - Input validation
 * - Rate limiting for authenticated users
 * - RLS policies enforced by Supabase
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRateLimiter, RATE_LIMITS, createUserKeyGenerator } from '@/lib/security/rate-limiter'
import { validateRequest, validationErrorResponse, Schemas } from '@/lib/security/validation'
import { createErrorResponse, createSecureResponse } from '@/lib/security/security-utils'

const propertyLimiter = createRateLimiter({
  ...RATE_LIMITS.authenticated.general,
  keyGenerator: createUserKeyGenerator((req) => {
    const authHeader = req.headers.get('authorization')
    return authHeader ? 'authenticated-user' : null
  }),
})

/**
 * GET /api/properties
 * Fetch properties with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = propertyLimiter(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Parse query parameters with validation
    const { searchParams } = new URL(request.url)
    const queryData = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    }
    
    const queryValidation = validateRequest(queryData, Schemas.listQuery)

    if (!queryValidation.success) {
      return validationErrorResponse(queryValidation.errors || {})
    }

    // Type-safe extraction from validated data
    const validatedQuery = queryValidation.data as {
      page: number
      limit: number
      sortBy: string
      sortOrder: 'asc' | 'desc'
    }
    
    const { page, limit, sortBy, sortOrder } = validatedQuery

    // Fetch properties with RLS policies
    const { data: properties, error, count } = await supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1)
      .order(sortBy, { ascending: sortOrder === 'asc' })

    if (error) {
      console.error('Properties fetch error:', error)
      return createErrorResponse('Failed to fetch properties', 500)
    }

    return createSecureResponse({
      success: true,
      data: properties,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (page - 1) * limit + limit < (count || 0),
      },
    })
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return createErrorResponse('An unexpected error occurred', 500)
  }
}

/**
 * POST /api/properties
 * Create new property
 */
export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = propertyLimiter(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(body, Schemas.propertyCreate)

    if (!validation.success) {
      return validationErrorResponse(validation.errors || {})
    }

    // Type-safe extraction from validated data
    const validatedBody = validation.data as {
      title: string
      description?: string
      propertyType: 'house' | 'condo' | 'townhouse' | 'commercial' | 'land' | 'multi_family'
      price?: number
      address: string
      city: string
      state: string
      zipCode: string
      bedrooms?: number
      bathrooms?: number
      squareFeet?: number
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

    // Create property
    const { data: property, error: createError } = await supabase
      .from('properties')
      .insert({
        company_id: profile.company_id,
        created_by: user.id,
        title: validatedBody.title,
        description: validatedBody.description,
        property_type: validatedBody.propertyType,
        price: validatedBody.price,
        address: validatedBody.address,
        city: validatedBody.city,
        state: validatedBody.state,
        zip_code: validatedBody.zipCode,
        bedrooms: validatedBody.bedrooms,
        bathrooms: validatedBody.bathrooms,
        square_feet: validatedBody.squareFeet,
      })
      .select()
      .single()

    if (createError) {
      console.error('Property creation error:', createError)
      return createErrorResponse('Failed to create property', 500)
    }

    return createSecureResponse({ success: true, data: property }, 201)
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return createErrorResponse('An unexpected error occurred', 500)
  }
}

// Prevent other methods
export function DELETE() {
  return createErrorResponse('Method not allowed', 405)
}

export function PUT() {
  return createErrorResponse('Method not allowed', 405)
}
