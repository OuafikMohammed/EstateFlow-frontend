/**
 * API Route: /api/onboarding/complete
 * 
 * Completes the onboarding process by storing company details,
 * logo, and marking onboarding as complete.
 */

import { NextRequest } from 'next/server'
import { createErrorResponse, createSecureResponse } from '@/lib/security/security-utils'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Parse form data first
    const formData = await request.formData()
    const userEmailFromForm = formData.get('userEmail') as string | null
    const logo = formData.get('logo') as File | null
    const companyDetailsStr = formData.get('companyDetails') as string
    const inviteEmail = formData.get('inviteEmail') as string | null

    const supabase = await createClient(request)

    // Try to get current user from session
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let userId: string | undefined

    if (user) {
      // Logged-in user
      userId = user.id
    } else if (userEmailFromForm) {
      // New user during signup - verify email exists in profiles
      // Use admin client to bypass RLS for new user verification
      try {
        const admin = createAdminClient()
        const { data: profiles, error: profileError } = await admin
          .from('profiles')
          .select('id')
          .eq('email', userEmailFromForm)

        console.log('[ONBOARDING PROFILE LOOKUP]', {
          email: userEmailFromForm,
          foundProfiles: profiles?.length || 0,
          profileError: profileError?.message,
        })

        if (profileError) {
          console.error('[ONBOARDING PROFILE ERROR]', {
            email: userEmailFromForm,
            error: profileError.message,
            code: profileError.code,
          })
          return createErrorResponse('Unauthorized', 401)
        }

        if (!profiles || profiles.length === 0) {
          console.error('[ONBOARDING NO PROFILE]', {
            email: userEmailFromForm,
          })
          return createErrorResponse('Unauthorized', 401)
        }

        userId = profiles[0].id
      } catch (err) {
        console.error('[ONBOARDING ADMIN CLIENT ERROR]', {
          email: userEmailFromForm,
          error: err instanceof Error ? err.message : String(err),
        })
        return createErrorResponse('Unauthorized', 401)
      }
    } else {
      return createErrorResponse('Unauthorized', 401)
    }

    interface CompanyDetails {
      industry?: string
      teamSize?: string
      phone?: string
      address?: string
    }

    let companyDetails: CompanyDetails = {}
    if (companyDetailsStr) {
      try {
        companyDetails = JSON.parse(companyDetailsStr) as CompanyDetails
      } catch (err) {
        console.error('[PARSE COMPANY DETAILS ERROR]', err)
      }
    }

    let logoUrl: string | null = null

    // Upload logo if present
    if (logo) {
      try {
        const fileName = `${userId}-${Date.now()}-${logo.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('company-logos')
          .upload(fileName, logo, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error('[LOGO UPLOAD ERROR]', uploadError)
        } else if (uploadData) {
          const {
            data: { publicUrl },
          } = supabase.storage
            .from('company-logos')
            .getPublicUrl(uploadData.path)

          logoUrl = publicUrl
        }
      } catch (err) {
        console.error('[LOGO UPLOAD EXCEPTION]', err)
        // Continue even if logo upload fails
      }
    }

    // Update company with onboarding details
    // Note: Only update columns that exist in the schema
    const updatePayload: Record<string, any> = {
      logo_url: logoUrl,
      updated_at: new Date().toISOString(),
    }

    // Add optional fields if they exist in the form
    if (companyDetails.phone) {
      updatePayload.phone = companyDetails.phone
    }
    if (companyDetails.address) {
      updatePayload.address = companyDetails.address
    }

    const { error: updateError } = await supabase
      .from('companies')
      .update(updatePayload)
      .eq('created_by', userId)

    if (updateError) {
      console.error('[UPDATE COMPANY ERROR]', {
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        userId: userId,
      })
      return createErrorResponse(
        `Failed to save company details: ${updateError.message || 'Unknown error'}`,
        400
      )
    }

    // Send invite if email provided
    if (inviteEmail) {
      try {
        const inviteResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/onboarding/send-invite`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
            },
            body: JSON.stringify({ email: inviteEmail }),
          }
        )

        if (!inviteResponse.ok) {
          console.error('[INVITE ERROR]', await inviteResponse.text())
        }
      } catch (err) {
        console.error('[INVITE SEND ERROR]', err)
        // Continue even if invite fails
      }
    }

    return createSecureResponse(
      {
        success: true,
        message: 'Onboarding completed successfully',
      },
      200
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to complete onboarding'
    console.error('[ONBOARDING COMPLETE ERROR]', {
      message,
      error,
      timestamp: new Date().toISOString(),
    })

    return createErrorResponse(message, 500)
  }
}

export function GET() {
  return createErrorResponse('Method not allowed', 405)
}
