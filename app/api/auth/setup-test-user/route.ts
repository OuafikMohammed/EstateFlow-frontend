/**
 * API Route: /api/auth/setup-test-user
 * DEVELOPMENT ONLY: Creates test users in Supabase Auth
 * 
 * Usage: POST /api/auth/setup-test-user
 * Body: { email, password }
 * 
 * WARNING: Remove this endpoint in production!
 */

import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createErrorResponse, createSecureResponse } from '@/lib/security/security-utils'

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return createErrorResponse('This endpoint is only available in development', 403)
  }

  try {
    const body = await request.json()
    const { email, password, fullName, companyName } = body

    if (!email || !password) {
      return createErrorResponse('Email and password are required', 400)
    }

    const admin = createAdminClient()

    // Check if user already exists in profiles
    const { data: existingUser } = await admin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    
    if (existingUser) {
      return createSecureResponse(
        {
          success: true,
          message: 'User already exists',
          userId: existingUser.id,
        },
        200
      )
    }

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for testing
    })

    if (authError || !authData.user) {
      return createErrorResponse(
        `Failed to create auth user: ${authError?.message || 'Unknown error'}`,
        400
      )
    }

    const userId = authData.user.id

    // Create company if provided
    let companyId = 'test-company'
    if (companyName) {
      const { data: companyData, error: companyError } = await admin
        .from('companies')
        .insert({
          name: companyName,
          email,
        })
        .select()
        .single()

      if (companyError) {
        console.error('Company creation failed:', companyError)
        // Continue anyway - company creation is optional
      } else {
        companyId = companyData?.id || 'test-company'
      }
    }

    // Create user profile
    const { error: profileError } = await admin
      .from('profiles')
      .insert({
        id: userId,
        company_id: companyId,
        full_name: fullName || 'Test User',
        email,
        role: 'company_admin',
        is_company_admin: true,
        is_active: true,
      })

    if (profileError) {
      console.error('Profile creation failed:', profileError)
      // Delete the auth user if profile creation fails
      await admin.auth.admin.deleteUser(userId)
      return createErrorResponse(
        `Failed to create user profile: ${profileError.message}`,
        400
      )
    }

    return createSecureResponse(
      {
        success: true,
        message: 'Test user created successfully',
        userId,
        email,
      },
      201
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Setup failed'
    console.error('[SETUP ERROR]', message)
    return createErrorResponse(message, 500)
  }
}
