/**
 * API Route: /api/onboarding/complete
 * 
 * Completes the onboarding process by storing company details,
 * logo, and marking onboarding as complete.
 */

import { NextRequest } from 'next/server'
import { createErrorResponse, createSecureResponse } from '@/lib/security/security-utils'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Parse form data
    const formData = await request.formData()
    const logo = formData.get('logo') as File | null
    const companyDetailsStr = formData.get('companyDetails') as string
    const inviteEmail = formData.get('inviteEmail') as string | null

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
        const fileName = `${user.id}-${Date.now()}-${logo.name}`
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
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        logo_url: logoUrl,
        industry: companyDetails.industry || null,
        team_size: companyDetails.teamSize || null,
        phone: companyDetails.phone || null,
        address: companyDetails.address || null,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('created_by', user.id)

    if (updateError) {
      console.error('[UPDATE COMPANY ERROR]', updateError)
      return createErrorResponse('Failed to save company details', 400)
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
