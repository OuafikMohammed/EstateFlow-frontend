"use server"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import {
  CreateClientSchema,
  UpdateClientSchema,
  ClientsQuerySchema,
  type ApiResponse,
  type ClientResponse,
  type ClientsResponse,
  type CreateClientResponse,
  type UpdateClientResponse,
  type DeleteClientResponse,
} from "@/lib/validators/client"
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
 * Create a new client
 */
export async function createClient(
  input: unknown
): Promise<CreateClientResponse> {
  try {
    // Validate input
    const validatedInput = CreateClientSchema.parse(input)
    
    // Get current user
    const userId = await getCurrentUserId()
    
    // Initialize Supabase client
    const supabase = await createSupabaseClient()
    
    // Get user's company
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .single()

    if (profileError || !profile?.company_id) {
      return {
        success: false,
        error: "User company not found",
      }
    }

    // Check if client with same phone/email already exists (not soft deleted)
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("phone", validatedInput.phone)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single()
    
    if (existingClient) {
      return {
        success: false,
        error: "A client with this phone number already exists",
      }
    }
    
    // Create client
    const { data, error } = await supabase
      .from("clients")
      .insert({
        ...validatedInput,
        user_id: userId,
        created_by: userId,
        company_id: profile.company_id,
        preferred_type: validatedInput.preferred_type ?? null,
        preferred_location: validatedInput.preferred_location ?? null,
      })
      .select()
      .single()
    
    if (error) {
      console.error("Supabase error:", error)
      return {
        success: false,
        error: error.message || "Failed to create client",
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
      error: "An unexpected error occurred",
    }
  }
}

/**
 * Get all clients with pagination, search, and filters
 */
export async function getClients(
  query: unknown
): Promise<ClientsResponse> {
  try {
    // Validate query
    const validatedQuery = ClientsQuerySchema.parse(query) as z.infer<typeof ClientsQuerySchema>
    
    // Get current user
    const userId = await getCurrentUserId()
    
    // Initialize Supabase client
    const supabase = await createSupabaseClient()
    
    // Build query
    let queryBuilder = supabase
      .from("clients")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .is("deleted_at", null) // Exclude soft deleted records
    
    // Apply status filter
    if (validatedQuery.status) {
      queryBuilder = queryBuilder.eq("status", validatedQuery.status)
    }
    
    // Apply search filter (name or phone)
    if (validatedQuery.search) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${validatedQuery.search}%,phone.ilike.%${validatedQuery.search}%`
      )
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
        error: error.message || "Failed to fetch clients",
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
      error: "An unexpected error occurred",
    }
  }
}

/**
 * Get a single client by ID
 */
export async function getClientById(
  clientId: string
): Promise<ApiResponse<ClientResponse>> {
  try {
    // Validate client ID
    if (!clientId || typeof clientId !== "string") {
      return {
        success: false,
        error: "Invalid client ID",
      }
    }
    
    // Get current user
    const userId = await getCurrentUserId()
    
    // Initialize Supabase client
    const supabase = await createSupabaseClient()
    
    // Fetch client
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .eq("user_id", userId)
      .is("deleted_at", null) // Exclude soft deleted records
      .single()
    
    if (error) {
      if (error.code === "PGRST116") {
        return {
          success: false,
          error: "Client not found",
        }
      }
      console.error("Supabase error:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch client",
      }
    }
    
    return {
      success: true,
      data,
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
      error: "An unexpected error occurred",
    }
  }
}

/**
 * Update a client
 */
export async function updateClient(
  input: unknown
): Promise<UpdateClientResponse> {
  try {
    // Validate input
    const validatedInput = UpdateClientSchema.parse(input)
    const { id, ...updateData } = validatedInput
    
    // Get current user
    const userId = await getCurrentUserId()
    
    // Initialize Supabase client
    const supabase = await createSupabaseClient()
    
    // Check if client exists and belongs to user
    const { data: existingClient, error: fetchError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single()
    
    if (fetchError || !existingClient) {
      return {
        success: false,
        error: "Client not found or you don't have permission to update it",
      }
    }
    
    // If updating phone, check for duplicates
    if (updateData.phone) {
      const { data: duplicateClient } = await supabase
        .from("clients")
        .select("id")
        .eq("phone", updateData.phone)
        .neq("id", id)
        .eq("user_id", userId)
        .is("deleted_at", null)
        .single()
      
      if (duplicateClient) {
        return {
          success: false,
          error: "Another client with this phone number already exists",
        }
      }
    }
    
    // Update client
    const { data, error } = await supabase
      .from("clients")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single()
    
    if (error) {
      console.error("Supabase error:", error)
      return {
        success: false,
        error: error.message || "Failed to update client",
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
      error: "An unexpected error occurred",
    }
  }
}

/**
 * Soft delete a client
 */
export async function deleteClient(
  clientId: string
): Promise<DeleteClientResponse> {
  try {
    // Validate client ID
    if (!clientId || typeof clientId !== "string") {
      return {
        success: false,
        error: "Invalid client ID",
      }
    }
    
    // Get current user
    const userId = await getCurrentUserId()
    
    // Initialize Supabase client
    const supabase = await createSupabaseClient()
    
    // Check if client exists and belongs to user
    const { data: existingClient, error: fetchError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single()
    
    if (fetchError || !existingClient) {
      return {
        success: false,
        error: "Client not found or you don't have permission to delete it",
      }
    }
    
    // Soft delete (set deleted_at timestamp)
    const { error } = await supabase
      .from("clients")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", clientId)
      .eq("user_id", userId)
    
    if (error) {
      console.error("Supabase error:", error)
      return {
        success: false,
        error: error.message || "Failed to delete client",
      }
    }
    
    return {
      success: true,
      data: { id: clientId },
      message: "Client deleted successfully",
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
      error: "An unexpected error occurred",
    }
  }
}

/**
 * Permanently delete a client (hard delete)
 * Use with caution - this cannot be undone
 */
export async function permanentlyDeleteClient(
  clientId: string
): Promise<DeleteClientResponse> {
  try {
    // Validate client ID
    if (!clientId || typeof clientId !== "string") {
      return {
        success: false,
        error: "Invalid client ID",
      }
    }
    
    // Get current user
    const userId = await getCurrentUserId()
    
    // Initialize Supabase client
    const supabase = await createSupabaseClient()
    
    // Check if client exists and belongs to user
    const { data: existingClient, error: fetchError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .eq("user_id", userId)
      .single()
    
    if (fetchError || !existingClient) {
      return {
        success: false,
        error: "Client not found or you don't have permission to delete it",
      }
    }
    
    // Hard delete
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", clientId)
      .eq("user_id", userId)
    
    if (error) {
      console.error("Supabase error:", error)
      return {
        success: false,
        error: error.message || "Failed to permanently delete client",
      }
    }
    
    return {
      success: true,
      data: { id: clientId },
      message: "Client permanently deleted",
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
      error: "An unexpected error occurred",
    }
  }
}

/**
 * Bulk status update
 */
export async function updateClientsStatus(
  clientIds: string[],
  status: string
): Promise<ApiResponse<{ updated: number }>> {
  try {
    // Validate status
    if (!["hot", "warm", "cold"].includes(status)) {
      return {
        success: false,
        error: "Invalid status",
      }
    }
    
    // Get current user
    const userId = await getCurrentUserId()
    
    // Initialize Supabase client
    const supabase = await createSupabaseClient()
    
    // Update clients
    const { error, count } = await supabase
      .from("clients")
      .update({ status })
      .eq("user_id", userId)
      .in("id", clientIds)
      .is("deleted_at", null)
    
    if (error) {
      console.error("Supabase error:", error)
      return {
        success: false,
        error: error.message || "Failed to update clients",
      }
    }
    
    return {
      success: true,
      data: { updated: count || 0 },
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
      error: "An unexpected error occurred",
    }
  }
}

/**
 * Get clients statistics
 */
export async function getClientsStats(): Promise<
  ApiResponse<{
    total: number
    hot: number
    warm: number
    cold: number
  }>
> {
  try {
    // Get current user
    const userId = await getCurrentUserId()
    
    // Initialize Supabase client
    const supabase = await createSupabaseClient()
    
    // Get counts by status
    const { data, error } = await supabase
      .from("clients")
      .select("status", { count: "exact" })
      .eq("user_id", userId)
      .is("deleted_at", null)
    
    if (error) {
      console.error("Supabase error:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch statistics",
      }
    }
    
    const clients = data || []
    
    return {
      success: true,
      data: {
        total: clients.length,
        hot: clients.filter((c: any) => c.status === "hot").length,
        warm: clients.filter((c: any) => c.status === "warm").length,
        cold: clients.filter((c: any) => c.status === "cold").length,
      },
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
      error: "An unexpected error occurred",
    }
  }
}
