/**
 * Property Actions / Server Actions
 * Backend business logic for property CRUD operations
 * - Authentication & RLS enforcement through Supabase
 * - Input validation with Zod
 * - Pagination support (limit 50)
 * - Soft delete using deleted_at timestamp
 * - Typed responses
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import {
  createPropertySchema,
  updatePropertySchema,
  propertyQuerySchema,
  type CreatePropertyInput,
  type UpdatePropertyInput,
  type PropertyQuery,
} from '@/lib/validators/property'
import { Property } from '@/lib/types/database'
import { ApiResult, SuccessResponse, ErrorResponse } from '@/lib/types/api-responses'

/**
 * Error handling helper
 */
function createErrorResult(message: string, details?: Record<string, any>): ErrorResponse {
  return {
    success: false,
    error: {
      code: 'OPERATION_FAILED',
      message,
      details,
    },
  }
}

/**
 * Success response helper
 */
function createSuccessResult<T>(data: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    message,
  }
}

/**
 * GET: List all properties for current user's company
 * Applies RLS, pagination, search, and filtering
 * @param query - Query parameters including pagination, filters, search
 * @returns Paginated list of properties
 */
export async function getProperties(
  query: Partial<PropertyQuery> = {}
): Promise<ApiResult<{ items: Property[]; total: number; page: number; limit: number; pages: number }>> {
  try {
    // Validate query parameters
    const validatedQuery = propertyQuerySchema.parse({
      page: query.page || 1,
      limit: query.limit || 50,
      search: query.search,
      type: query.type,
      status: query.status,
      transactionType: query.transactionType,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      sortBy: query.sortBy || 'created_at',
      sortOrder: query.sortOrder || 'desc',
    })

    const supabase = await createClient()

    // Get current user - required for RLS to work
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResult('Authentication required', { authError: authError?.message })
    }

    // Get user's profile to access company_id (RLS requires this)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.company_id) {
      return createErrorResult('Unable to determine company access', {
        profileError: profileError?.message,
      })
    }

    // Build query - RLS will filter by company_id automatically
    let queryBuilder = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .is('deleted_at', null) // Exclude soft-deleted properties

    // Apply filters
    if (validatedQuery.type) {
      queryBuilder = queryBuilder.eq('property_type', validatedQuery.type)
    }

    if (validatedQuery.status) {
      queryBuilder = queryBuilder.eq('status', validatedQuery.status)
    }

    if (validatedQuery.minPrice !== undefined) {
      queryBuilder = queryBuilder.gte('price', validatedQuery.minPrice)
    }

    if (validatedQuery.maxPrice !== undefined) {
      queryBuilder = queryBuilder.lte('price', validatedQuery.maxPrice)
    }

    // Search in address and description
    if (validatedQuery.search) {
      const searchTerm = `%${validatedQuery.search}%`
      queryBuilder = queryBuilder.or(
        `address.ilike.${searchTerm},description.ilike.${searchTerm}`
      )
    }

    // Apply sorting
    queryBuilder = queryBuilder.order(validatedQuery.sortBy, {
      ascending: validatedQuery.sortOrder === 'asc',
    })

    // Apply pagination
    const offset = (validatedQuery.page - 1) * validatedQuery.limit
    const { data: properties, error: queryError, count } = await queryBuilder.range(
      offset,
      offset + validatedQuery.limit - 1
    )

    if (queryError) {
      return createErrorResult('Failed to fetch properties', {
        error: queryError.message,
      })
    }

    const total = count || 0
    const pages = Math.ceil(total / validatedQuery.limit)

    return createSuccessResult(
      {
        items: properties || [],
        total,
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        pages,
      },
      `Retrieved ${properties?.length || 0} properties`
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResult('Failed to get properties', { error: message })
  }
}

/**
 * GET: Fetch a single property by ID
 * Applies RLS - only accessible if in same company
 * @param propertyId - Property UUID
 * @returns Single property or error
 */
export async function getPropertyById(propertyId: string): Promise<ApiResult<Property>> {
  try {
    if (!propertyId || propertyId.trim() === '') {
      return createErrorResult('Property ID is required')
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResult('Authentication required')
    }

    // Fetch property - RLS enforces company_id matching
    const { data: property, error: queryError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .is('deleted_at', null) // Exclude soft-deleted
      .single()

    if (queryError) {
      if (queryError.code === 'PGRST116') {
        return createErrorResult('Property not found', { code: 'NOT_FOUND' })
      }
      return createErrorResult('Failed to fetch property', { error: queryError.message })
    }

    if (!property) {
      return createErrorResult('Property not found', { code: 'NOT_FOUND' })
    }

    return createSuccessResult(property, 'Property retrieved successfully')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResult('Failed to get property', { error: message })
  }
}

/**
 * POST: Create a new property
 * Automatically sets company_id from current user's company
 * @param input - Validated property data
 * @returns Created property with ID
 */
export async function createProperty(input: CreatePropertyInput): Promise<ApiResult<Property>> {
  try {
    // Validate input
    const validatedInput = createPropertySchema.parse(input)

    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResult('Authentication required')
    }

    // Get user's profile to get company_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.company_id) {
      return createErrorResult('Unable to determine company context')
    }

    // Prepare property data
    const propertyData = {
      company_id: profile.company_id,
      created_by: user.id,
      property_type: validatedInput.type,
      // Note: transactionType needs to be stored if DB schema supports it
      // For now, it's in the input but not in base schema
      price: validatedInput.price,
      square_feet: validatedInput.size,
      bedrooms: validatedInput.bedrooms,
      bathrooms: validatedInput.bathrooms,
      description: validatedInput.description,
      status: validatedInput.status,
      address: validatedInput.address,
      latitude: validatedInput.latitude,
      longitude: validatedInput.longitude,
      title: `${validatedInput.type} - ${validatedInput.address}`, // Generated title
    }

    // Insert property
    const { data: property, error: insertError } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single()

    if (insertError) {
      return createErrorResult('Failed to create property', {
        error: insertError.message,
      })
    }

    if (!property) {
      return createErrorResult('Property creation returned no data')
    }

    return createSuccessResult(property, 'Property created successfully')
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      // Zod validation error
      return createErrorResult('Validation failed', { details: error })
    }
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResult('Failed to create property', { error: message })
  }
}

/**
 * PATCH: Update an existing property
 * Only allows owner or company admin to update
 * @param propertyId - Property UUID
 * @param input - Partial property data to update
 * @returns Updated property
 */
export async function updateProperty(
  propertyId: string,
  input: UpdatePropertyInput
): Promise<ApiResult<Property>> {
  try {
    if (!propertyId || propertyId.trim() === '') {
      return createErrorResult('Property ID is required')
    }

    // Validate input
    const validatedInput = updatePropertySchema.parse(input)

    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResult('Authentication required')
    }

    // Check property exists and user has access
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !property) {
      return createErrorResult('Property not found or already deleted')
    }

    // Prepare update data - only include provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    // Map input fields to database columns
    if (validatedInput.type) {
      updateData.property_type = validatedInput.type
    }
    if (validatedInput.price !== undefined) {
      updateData.price = validatedInput.price
    }
    if (validatedInput.size !== undefined) {
      updateData.square_feet = validatedInput.size
    }
    if (validatedInput.bedrooms !== undefined) {
      updateData.bedrooms = validatedInput.bedrooms
    }
    if (validatedInput.bathrooms !== undefined) {
      updateData.bathrooms = validatedInput.bathrooms
    }
    if (validatedInput.description) {
      updateData.description = validatedInput.description
    }
    if (validatedInput.status) {
      updateData.status = validatedInput.status
    }
    if (validatedInput.address) {
      updateData.address = validatedInput.address
    }
    if (validatedInput.latitude !== undefined) {
      updateData.latitude = validatedInput.latitude
    }
    if (validatedInput.longitude !== undefined) {
      updateData.longitude = validatedInput.longitude
    }

    // Update property - RLS enforces company_id check
    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .select()
      .single()

    if (updateError) {
      return createErrorResult('Failed to update property', {
        error: updateError.message,
      })
    }

    if (!updatedProperty) {
      return createErrorResult('Property update returned no data')
    }

    return createSuccessResult(updatedProperty, 'Property updated successfully')
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      // Zod validation error
      return createErrorResult('Validation failed', { details: error })
    }
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResult('Failed to update property', { error: message })
  }
}

/**
 * DELETE: Soft delete a property
 * Marks property with deleted_at timestamp instead of removing from DB
 * RLS prevents deletion of properties from other companies
 * @param propertyId - Property UUID
 * @returns Success confirm or error
 */
export async function deleteProperty(
  propertyId: string
): Promise<ApiResult<{ id: string; deleted_at: string }>> {
  try {
    if (!propertyId || propertyId.trim() === '') {
      return createErrorResult('Property ID is required')
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResult('Authentication required')
    }

    // Check property exists and user has access
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !property) {
      return createErrorResult('Property not found or already deleted')
    }

    // Perform soft delete
    const deletedAt = new Date().toISOString()
    const { data: deletedProperty, error: deleteError } = await supabase
      .from('properties')
      .update({
        deleted_at: deletedAt,
        updated_at: deletedAt,
      })
      .eq('id', propertyId)
      .select('id, deleted_at')
      .single()

    if (deleteError) {
      return createErrorResult('Failed to delete property', {
        error: deleteError.message,
      })
    }

    return createSuccessResult(
      {
        id: deletedProperty?.id || propertyId,
        deleted_at: deletedAt,
      },
      'Property deleted successfully'
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResult('Failed to delete property', { error: message })
  }
}

/**
 * BULK SEARCH: Advanced property search
 * Combines multiple search terms and filters
 * @param searchTerm - Free-text search
 * @param filters - Object with optional filter fields
 * @returns Paginated search results
 */
export async function searchProperties(
  searchTerm: string,
  filters: Partial<PropertyQuery> = {},
  page: number = 1
): Promise<ApiResult<{ items: Property[]; total: number; hasMore: boolean }>> {
  try {
    return getProperties({
      ...filters,
      search: searchTerm,
      page,
      limit: 50,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createErrorResult('Search failed', { error: message })
  }
}
