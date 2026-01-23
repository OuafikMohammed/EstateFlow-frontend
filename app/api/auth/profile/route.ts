/**
 * API Route: /api/auth/profile
 * Purpose: Get current user's profile information
 * 
 * Returns profile data with company information
 * Uses server-side authentication to bypass RLS issues
 * Auto-creates profile if it doesn't exist (for users who signed up but profile wasn't created)
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createErrorResponse, createSecureResponse } from '@/lib/security/security-utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient(request)

    // Get current user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      console.log('[PROFILE API] User not authenticated')
      return createErrorResponse('Unauthorized', 401)
    }

    console.log('[PROFILE API] Fetching profile for user:', authUser.id)

    // Fetch user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        company_id,
        role,
        is_active,
        avatar_url,
        phone,
        email
      `)
      .eq('id', authUser.id)
      .single()

    // If profile doesn't exist, create it
    if (profileError?.code === 'PGRST116') {
      // No rows returned - profile doesn't exist
      console.log('[PROFILE API] Profile not found for user, creating default profile:', authUser.id)

      try {
        // Use admin client to create profile
        const admin = createAdminClient()

        // First, find or create a default company for this user
        const { data: existingCompanies } = await admin
          .from('companies')
          .select('id')
          .eq('created_by', authUser.id)
          .limit(1)

        let companyId = existingCompanies?.[0]?.id

        if (!companyId) {
          // Create a default company for this user
          const { data: newCompany, error: companyCreateError } = await admin
            .from('companies')
            .insert({
              name: authUser.email?.split('@')[0] || 'My Company',
              email: authUser.email || '',
              created_by: authUser.id,
            })
            .select('id')
            .single()

          if (companyCreateError || !newCompany) {
            console.error('[PROFILE API] Failed to create company:', companyCreateError?.message)
            throw new Error('Failed to create default company')
          }

          companyId = newCompany.id
        }

        // Create the profile
        const { data: newProfile, error: profileCreateError } = await admin
          .from('profiles')
          .insert({
            id: authUser.id,
            company_id: companyId,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email || '',
            role: 'company_admin',
            is_company_admin: true,
            is_active: true,
          })
          .select(`
            id,
            full_name,
            company_id,
            role,
            is_active,
            avatar_url,
            phone,
            email
          `)
          .single()

        if (profileCreateError || !newProfile) {
          console.error('[PROFILE API] Failed to create profile:', profileCreateError?.message)
          throw new Error('Failed to create profile')
        }

        // Fetch company data
        const { data: companyData } = await admin
          .from('companies')
          .select('id, name')
          .eq('id', companyId)
          .single()

        return createSecureResponse({
          user: {
            id: authUser.id,
            email: authUser.email || newProfile.email || '',
            fullName: newProfile.full_name || undefined,
            companyId: newProfile.company_id,
            companyName: companyData?.name || undefined,
            role: newProfile.role,
            isActive: newProfile.is_active,
            avatarUrl: newProfile.avatar_url || undefined,
            phone: newProfile.phone || undefined,
          },
        }, 200)
      } catch (createError) {
        console.error('[PROFILE API] Error creating profile:', createError)
        throw createError
      }
    }

    if (profileError) {
      console.error('[PROFILE FETCH ERROR]', {
        code: profileError.code,
        message: profileError.message,
        userId: authUser.id,
      })
      return createErrorResponse('Profile not found', 404)
    }

    if (!profileData) {
      return createErrorResponse('Profile not found', 404)
    }

    // Fetch company data
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', profileData.company_id)
      .single()

    if (companyError) {
      console.warn('[COMPANY FETCH WARNING]', {
        message: companyError.message,
        companyId: profileData.company_id,
      })
      // Don't fail if company fetch fails, just continue without company name
    }

    return createSecureResponse({
      user: {
        id: authUser.id,
        email: authUser.email || profileData.email || '',
        fullName: profileData.full_name || undefined,
        companyId: profileData.company_id,
        companyName: companyData?.name || undefined,
        role: profileData.role,
        isActive: profileData.is_active,
        avatarUrl: profileData.avatar_url || undefined,
        phone: profileData.phone || undefined,
      },
    }, 200)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch profile'
    console.error('[AUTH PROFILE ERROR]', {
      message,
      timestamp: new Date().toISOString(),
    })
    return createErrorResponse(message, 500)
  }
}

export function POST() {
  return createErrorResponse('Method not allowed', 405)
}
