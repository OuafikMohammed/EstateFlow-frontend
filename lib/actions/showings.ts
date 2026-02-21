"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import {
  CreateShowingSchema,
  UpdateShowingSchema,
  ShowingsQuerySchema,
  DateRangeQuerySchema,
  CompleteShowingSchema,
  type ApiResponse,
  type ShowingResponse,
  type ShowingsResponse,
  type CreateShowingResponse,
  type UpdateShowingResponse,
  type CompleteShowingResponse,
  type DeleteShowingResponse,
} from "@/lib/validators/showing"
import { z } from "zod"

/**
 * Get current user ID from session
 */
async function getCurrentUserId(): Promise<string> {
  const supabase = await createSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user?.id) {
    throw new Error("Unauthorized: No active session")
  }

  return session.user.id
}

/**
 * Create a new showing
 */
export async function createShowing(
  input: unknown
): Promise<CreateShowingResponse> {
  try {
    // Validate input
    let validatedInput = CreateShowingSchema.parse(input)

    // Get current user
    const userId = await getCurrentUserId()

    // Use current user as agent if not specified
    if (!validatedInput.agent_id) {
      validatedInput = {
        ...validatedInput,
        agent_id: userId,
      }
    }

    // Initialize Supabase client
    const supabase = await createSupabaseClient()

    // Verify user is the agent or has admin role
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role, company_id")
      .eq("id", userId)
      .single()

    if (!userProfile?.company_id) {
      return {
        success: false,
        error: "User company information not found",
      }
    }

    const isAdmin = userProfile?.role === "company_admin" || userProfile?.role === "super_admin"
    const isAssignedAgent = validatedInput.agent_id === userId

    if (!isAdmin && !isAssignedAgent) {
      return {
        success: false,
        error: "You can only create showings for yourself",
      }
    }

    // Check if property exists
    const { data: property } = await supabase
      .from("properties")
      .select("id")
      .eq("id", validatedInput.property_id)
      .is("deleted_at", null)
      .single()

    if (!property) {
      return {
        success: false,
        error: "Property not found",
      }
    }

    // Check if client exists (if client_id is provided)
    if (validatedInput.client_id) {
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("id", validatedInput.client_id)
        .is("deleted_at", null)
        .single()

      if (!client) {
        return {
          success: false,
          error: "Client not found",
        }
      }
    }

    // Check if lead exists (if lead_id is provided)
    if (validatedInput.lead_id) {
      const { data: lead } = await supabase
        .from("leads")
        .select("id")
        .eq("id", validatedInput.lead_id)
        .single()

      if (!lead) {
        return {
          success: false,
          error: "Lead not found",
        }
      }
    }

    // Check if showing at this time already exists
    const { data: existingShowing } = await supabase
      .from("showings")
      .select("id")
      .eq("property_id", validatedInput.property_id)
      .eq("scheduled_at", validatedInput.scheduled_at)
      .is("deleted_at", null)
      .single()

    if (existingShowing) {
      return {
        success: false,
        error: "A showing is already scheduled for this property at this time",
      }
    }

    // Create showing with company_id
    const { data, error } = await supabase
      .from("showings")
      .insert({
        ...validatedInput,
        company_id: userProfile.company_id,
        scheduled_by: userId,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return {
        success: false,
        error: error.message || "Failed to create showing",
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: "Failed to create showing",
    }
  }
}

/**
 * Update a showing
 */
export async function updateShowing(
  id: unknown,
  input: unknown
): Promise<UpdateShowingResponse> {
  try {
    // Validate ID
    if (typeof id !== "string" || !id.trim()) {
      return {
        success: false,
        error: "Invalid showing ID",
      }
    }

    // Validate input
    const validatedInput = UpdateShowingSchema.parse(input)

    // Get current user
    const userId = await getCurrentUserId()

    // Initialize Supabase client
    const supabase = await createSupabaseClient()

    // Check if showing exists and belongs to user's company
    const { data: existingShowing, error: fetchError } = await supabase
      .from("showings")
      .select("user_id")
      .eq("id", id)
      .is("deleted_at", null)
      .single()

    if (fetchError || !existingShowing) {
      return {
        success: false,
        error: "Showing not found",
      }
    }

    // Check authorization - only owner or admin can update
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    const isAdmin = userProfile?.role === "company_admin" || userProfile?.role === "super_admin"
    const isOwner = existingShowing.user_id === userId

    if (!isAdmin && !isOwner) {
      return {
        success: false,
        error: "You don't have permission to update this showing",
      }
    }

    // Update showing
    const updateData = Object.fromEntries(
      Object.entries(validatedInput).filter(([, value]) => value !== undefined)
    )

    const { data, error } = await supabase
      .from("showings")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return {
        success: false,
        error: error.message || "Failed to update showing",
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: "Failed to update showing",
    }
  }
}

/**
 * Get showings with filters and pagination
 */
export async function getShowings(
  query: unknown
): Promise<ShowingsResponse> {
  try {
    // Validate query
    const validatedQuery = ShowingsQuerySchema.parse(query) as z.infer<typeof ShowingsQuerySchema>

    // Get current user
    const userId = await getCurrentUserId()

    // Initialize Supabase client
    const supabase = await createSupabaseClient()

    // Check user role
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    const isAdmin = userProfile?.role === "company_admin" || userProfile?.role === "super_admin"

    // Build query
    let queryBuilder = supabase
      .from("showings")
      .select("*, properties(id, title, address, city), clients(id, name, phone, email)", { count: "exact" })
      .is("deleted_at", null)

    // Filter by agent if not admin
    if (!isAdmin) {
      queryBuilder = queryBuilder.eq("agent_id", userId)
    } else if (validatedQuery.agent_id) {
      // Admin can filter by specific agent
      queryBuilder = queryBuilder.eq("agent_id", validatedQuery.agent_id)
    }

    // Apply filters
    if (validatedQuery.status) {
      queryBuilder = queryBuilder.eq("status", validatedQuery.status)
    }

    if (validatedQuery.property_id) {
      queryBuilder = queryBuilder.eq("property_id", validatedQuery.property_id)
    }

    if (validatedQuery.client_id) {
      queryBuilder = queryBuilder.eq("client_id", validatedQuery.client_id)
    }

    // Apply date range filter
    if (validatedQuery.from_date) {
      queryBuilder = queryBuilder.gte("scheduled_at", validatedQuery.from_date)
    }

    if (validatedQuery.to_date) {
      queryBuilder = queryBuilder.lte("scheduled_at", validatedQuery.to_date)
    }

    // Apply sorting
    queryBuilder = queryBuilder.order(validatedQuery.sortBy, {
      ascending: validatedQuery.sortOrder === "asc",
    })

    // Apply pagination
    const offset = (validatedQuery.page - 1) * validatedQuery.limit
    queryBuilder = queryBuilder.range(offset, offset + validatedQuery.limit - 1)

    // Execute query
    const { data, error, count } = await queryBuilder

    if (error) {
      console.error("Supabase error:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch showings",
      }
    }

    const total = count || 0
    const pages = Math.ceil(total / validatedQuery.limit)

    return {
      success: true,
      data: {
        items: data || [],
        total,
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        pages,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: "Failed to fetch showings",
    }
  }
}

/**
 * Get showings within a date range
 */
export async function getShowingsByDateRange(
  query: unknown
): Promise<ShowingsResponse> {
  try {
    // Validate query
    const validatedQuery = DateRangeQuerySchema.parse(query)

    // Get current user
    const userId = await getCurrentUserId()

    // Initialize Supabase client
    const supabase = await createSupabaseClient()

    // Check user role
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    const isAdmin = userProfile?.role === "company_admin" || userProfile?.role === "super_admin"

    // Build query
    let queryBuilder = supabase
      .from("showings")
      .select("*, properties(id, title, address, city), clients(id, name, phone, email)", { count: "exact" })
      .gte("scheduled_at", validatedQuery.from_date)
      .lte("scheduled_at", validatedQuery.to_date)
      .is("deleted_at", null)

    // Filter by agent if not admin
    if (!isAdmin) {
      queryBuilder = queryBuilder.eq("agent_id", userId)
    } else if (validatedQuery.agent_id) {
      // Admin can filter by specific agent
      queryBuilder = queryBuilder.eq("agent_id", validatedQuery.agent_id)
    }

    // Sort by date ascending
    queryBuilder = queryBuilder.order("scheduled_at", { ascending: true })

    // Apply pagination
    const offset = (validatedQuery.page - 1) * validatedQuery.limit
    queryBuilder = queryBuilder.range(offset, offset + validatedQuery.limit - 1)

    // Execute query
    const { data, error, count } = await queryBuilder

    if (error) {
      console.error("Supabase error:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch showings",
      }
    }

    const total = count || 0
    const pages = Math.ceil(total / validatedQuery.limit)

    return {
      success: true,
      data: {
        items: data || [],
        total,
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        pages,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: "Failed to fetch showings by date range",
    }
  }
}

/**
 * Complete a showing with feedback and interest level
 */
export async function completeShowing(
  input: unknown
): Promise<CompleteShowingResponse> {
  try {
    // Validate input
    const validatedInput = CompleteShowingSchema.parse(input)

    // Get current user
    const userId = await getCurrentUserId()

    // Initialize Supabase client
    const supabase = await createSupabaseClient()

    // Check if showing exists and belongs to user
    const { data: existingShowing, error: fetchError } = await supabase
      .from("showings")
      .select("agent_id")
      .eq("id", validatedInput.id)
      .is("deleted_at", null)
      .single()

    if (fetchError || !existingShowing) {
      return {
        success: false,
        error: "Showing not found",
      }
    }

    // Check authorization - only assigned agent or admin can complete
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    const isAdmin = userProfile?.role === "company_admin" || userProfile?.role === "super_admin"
    const isAssignedAgent = existingShowing.agent_id === userId

    if (!isAdmin && !isAssignedAgent) {
      return {
        success: false,
        error: "You don't have permission to complete this showing",
      }
    }

    // Update showing with completed status
    const updateData: Record<string, any> = {
      status: "completed",
      updated_at: new Date().toISOString(),
    }

    // Only set feedback/interest_level if they're provided (avoid overwriting with null)
    if (validatedInput.feedback !== undefined) {
      updateData.feedback = validatedInput.feedback
    }
    if (validatedInput.interest_level !== undefined) {
      updateData.interest_level = validatedInput.interest_level
    }

    const { data, error } = await supabase
      .from("showings")
      .update(updateData)
      .eq("id", validatedInput.id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return {
        success: false,
        error: error.message || "Failed to complete showing",
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: "Failed to complete showing",
    }
  }
}

/**
 * Cancel a showing
 */
export async function cancelShowing(
  id: unknown
): Promise<DeleteShowingResponse> {
  try {
    // Validate ID
    if (typeof id !== "string" || !id.trim()) {
      return {
        success: false,
        error: "Invalid showing ID",
      }
    }

    // Get current user
    const userId = await getCurrentUserId()

    // Initialize Supabase client
    const supabase = await createSupabaseClient()

    // Check if showing exists
    const { data: existingShowing, error: fetchError } = await supabase
      .from("showings")
      .select("agent_id, status")
      .eq("id", id)
      .is("deleted_at", null)
      .single()

    if (fetchError || !existingShowing) {
      return {
        success: false,
        error: "Showing not found",
      }
    }

    // Check if already completed
    if (existingShowing.status === "completed") {
      return {
        success: false,
        error: "Cannot cancel a completed showing",
      }
    }

    // Check authorization
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    const isAdmin = userProfile?.role === "company_admin" || userProfile?.role === "super_admin"
    const isAssignedAgent = existingShowing.agent_id === userId

    if (!isAdmin && !isAssignedAgent) {
      return {
        success: false,
        error: "You don't have permission to cancel this showing",
      }
    }

    // Soft delete (set deleted_at timestamp)
    const { error } = await supabase
      .from("showings")
      .update({
        status: "cancelled",
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      return {
        success: false,
        error: error.message || "Failed to cancel showing",
      }
    }

    return {
      success: true,
      data: null,
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: "Failed to cancel showing",
    }
  }
}
