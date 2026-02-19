/**
 * API Route: /api/clients/[id]
 * Endpoint for client detail, update, and delete
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, createSecureResponse } from '@/lib/security/security-utils'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/clients/[id]
 * Fetch single client
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params

    // Fetch client
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      console.error('Client fetch error:', error)
      return createErrorResponse('Client not found', 404)
    }

    // Check authorization
    if (client.user_id !== user.id) {
      return createErrorResponse('Unauthorized', 403)
    }

    return createSecureResponse({ success: true, data: client })
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return createErrorResponse('An unexpected error occurred', 500)
  }
}

/**
 * PUT /api/clients/[id]
 * Update client
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params
    const body = await request.json()

    // Check client exists and belongs to user
    const { data: existingClient, error: fetchError } = await supabase
      .from('clients')
      .select('id, user_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existingClient) {
      return createErrorResponse('Client not found', 404)
    }

    if (existingClient.user_id !== user.id) {
      return createErrorResponse('Unauthorized', 403)
    }

    // Update client
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Client update error:', updateError)
      return createErrorResponse('Failed to update client', 500)
    }

    return createSecureResponse({ success: true, data: updatedClient })
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return createErrorResponse('An unexpected error occurred', 500)
  }
}

/**
 * DELETE /api/clients/[id]
 * Delete client (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params

    // Check client exists and belongs to user
    const { data: existingClient, error: fetchError } = await supabase
      .from('clients')
      .select('id, user_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existingClient) {
      return createErrorResponse('Client not found', 404)
    }

    if (existingClient.user_id !== user.id) {
      return createErrorResponse('Unauthorized', 403)
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('clients')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (deleteError) {
      console.error('Client delete error:', deleteError)
      return createErrorResponse('Failed to delete client', 500)
    }

    return createSecureResponse({ success: true, data: { id } })
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return createErrorResponse('An unexpected error occurred', 500)
  }
}
