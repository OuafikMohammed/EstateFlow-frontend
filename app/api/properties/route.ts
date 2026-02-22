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
 * Fetch properties with pagination and filtering - REQUIRES AUTHENTICATION
 * Supports filters: type, status, city, price range, search, ownership
 */
export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = propertyLimiter(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const supabase = await createClient(request)

    // Check authentication - properties only visible to authenticated users
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return createErrorResponse('Unauthorized - please log in to view properties', 401)
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '12'))
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    
    // Filter parameters
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const city = searchParams.get('city')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const bedrooms = searchParams.get('bedrooms')
    const q = searchParams.get('q')
    const ownedByMe = searchParams.get('ownedByMe') === 'true'

    // Build the query
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })

    // Filter by ownership if requested
    if (ownedByMe) {
      query = query.eq('created_by', user.id)
    }

    // Apply filters
    if (type) {
      query = query.eq('property_type', type)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (city) {
      query = query.ilike('city', `%${city}%`)
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }

    if (bedrooms) {
      query = query.eq('bedrooms', parseInt(bedrooms))
    }

    // Search in title, description, address
    if (q) {
      query = query.or(
        `title.ilike.%${q}%,description.ilike.%${q}%,address.ilike.%${q}%`
      )
    }

    // Apply pagination and sorting
    const { data: properties, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Properties fetch error:', error)
      return createErrorResponse(`Failed to fetch properties: ${error.message}`, 500)
    }

    const total = count || 0
    const pages = Math.ceil(total / limit)

    return createSecureResponse({
      items: properties || [],
      total,
      page,
      limit,
      pages,
    })
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return createErrorResponse(errorMessage, 500)
  }
}

/**
 * POST /api/properties
 * Create new property - requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(request)

    // Parse request body
    const body = await request.json()
    
    console.log('Creating property with data:', body)

    // Get current user - REQUIRED
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return createErrorResponse('Unauthorized - please log in to create a property', 401)
    }

    // Extract data
    const propertyData = {
      company_id: body.company_id || '00000000-0000-0000-0000-000000000001',
      created_by: user.id, // Use actual authenticated user ID
      title: body.title || 'Untitled Property',
      description: body.description || '',
      property_type: (body.property_type || body.type || 'apartment').toLowerCase(),
      status: (body.status || 'available').toLowerCase(),
      price: body.price ? parseFloat(body.price) : null,
      address: body.address || '',
      city: body.city || '',
      state: body.state || '',
      zip_code: body.zip_code || body.zipCode || '',
      bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null,
      bathrooms: body.bathrooms ? parseFloat(body.bathrooms) : null,
      square_feet: body.square_feet || body.area ? parseInt(body.area) : null,
      images: Array.isArray(body.images) ? body.images : [],
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
    }

    console.log('Sanitized property data:', propertyData)

    // Insert property
    const { data: property, error: createError } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single()

    if (createError) {
      console.error('Property creation error:', createError)
      return createErrorResponse(`Failed to create property: ${createError.message}`, 500)
    }

    console.log('Property created successfully:', property)
    return createSecureResponse({ success: true, data: property }, 201)
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return createErrorResponse(errorMessage, 500)
  }
}

// Prevent other methods
export function DELETE() {
  return createErrorResponse('Method not allowed', 405)
}

export function PUT() {
  return createErrorResponse('Method not allowed', 405)
}
