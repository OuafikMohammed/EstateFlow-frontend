/**
 * API Route: /api/leads/[id]
 * Endpoint for lead detail, update, and delete
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createErrorResponse, createSecureResponse } from '@/lib/security/security-utils'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/leads/[id]
 * Fetch single lead
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const supabase = await createClient(request)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    if (!id) {
      return createErrorResponse('Lead ID is required', 400)
    }

    // Fetch lead (RLS will ensure company isolation)
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !lead) {
      return createErrorResponse('Lead not found', 404)
    }

    return createSecureResponse(lead)
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return createErrorResponse('An unexpected error occurred', 500)
  }
}

/**
 * PUT /api/leads/[id]
 * Update lead
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

    if (!id) {
      return createErrorResponse('Lead ID is required', 400)
    }

    const body = await request.json()

    // Update lead (RLS will ensure access control)
    const { data: lead, error } = await supabase
      .from('leads')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Lead update error:', error)
      return createErrorResponse('Failed to update lead', 500)
    }

    if (!lead) {
      return createErrorResponse('Lead not found', 404)
    }

    return createSecureResponse(lead)
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return createErrorResponse('An unexpected error occurred', 500)
  }
}

/**
 * DELETE /api/leads/[id]
 * Delete lead
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

    if (!id) {
      return createErrorResponse('Lead ID is required', 400)
    }

    // Delete lead (RLS will ensure access control)
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Lead delete error:', error)
      return createErrorResponse('Failed to delete lead', 500)
    }

    return createSecureResponse({ success: true })
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return createErrorResponse('An unexpected error occurred', 500)
  }
}

/**
 * PATCH /api/leads/[id]/status
 * Update lead status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const { id } = params

    if (!id) {
      return createErrorResponse('Lead ID is required', 400)
    }

    const { status } = await request.json()

    if (!status) {
      return createErrorResponse('Status is required', 400)
    }

    // Update lead status
    const { data: lead, error } = await supabase
      .from('leads')
      .update({ status, last_contacted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Lead status update error:', error)
      return createErrorResponse('Failed to update lead status', 500)
    }

    if (!lead) {
      return createErrorResponse('Lead not found', 404)
    }

    return createSecureResponse({ success: true, data: lead })
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return createErrorResponse('An unexpected error occurred', 500)
  }
}
