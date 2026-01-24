/**
 * API Route: /api/properties/[id]
 * Endpoint for property detail, update, and delete
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, createSecureResponse } from '@/lib/security/security-utils'

/**
 * GET /api/properties/[id]
 * Fetch single property - REQUIRES AUTHENTICATION
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient(request)

    // Get current user - REQUIRED
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized - please log in to view properties', 401)
    }

    if (!id) {
      return createErrorResponse('Property ID is required', 400)
    }

    // Fetch property (RLS will ensure company isolation)
    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !property) {
      console.error('Property fetch error:', error)
      return createErrorResponse('Property not found', 404)
    }

    return createSecureResponse(property)
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return createErrorResponse('An unexpected error occurred', 500)
  }
}

/**
 * PUT /api/properties/[id]
 * Update property - REQUIRES AUTHENTICATION
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient(request)

    // Get current user - REQUIRED
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized - please log in', 401)
    }

    if (!id) {
      return createErrorResponse('Property ID is required', 400)
    }

    const body = await request.json()

    // Update property (RLS will ensure only owner can update)
    const { data: property, error } = await supabase
      .from('properties')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Property update error:', error)
      return createErrorResponse('Failed to update property', 500)
    }

    if (!property) {
      return createErrorResponse('Property not found', 404)
    }

    return createSecureResponse(property)
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return createErrorResponse('An unexpected error occurred', 500)
  }
}

/**
 * DELETE /api/properties/[id]
 * Delete property - REQUIRES AUTHENTICATION
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient(request)

    // Get current user - REQUIRED
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized - please log in', 401)
    }

    if (!id) {
      return createErrorResponse('Property ID is required', 400)
    }

    // Delete property (RLS will ensure only owner can delete)
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Property delete error:', error)
      return createErrorResponse('Failed to delete property', 500)
    }

    return createSecureResponse({ success: true, data: { id } })
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return createErrorResponse('An unexpected error occurred', 500)
  }
}
