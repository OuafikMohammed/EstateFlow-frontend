/**
 * API Route: /api/onboarding/send-invite
 * 
 * Sends an email invitation to join the user's company workspace.
 */

import { NextRequest } from 'next/server'
import { createErrorResponse, createSecureResponse } from '@/lib/security/security-utils'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json()
    const validation = inviteSchema.safeParse(body)

    if (!validation.success) {
      return createErrorResponse(
        'Invalid email address',
        400,
        { errors: validation.error.errors }
      )
    }

    const { email } = validation.data

    // Get user's company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('created_by', user.id)
      .single()

    if (companyError || !company) {
      console.error('[COMPANY FETCH ERROR]', companyError)
      return createErrorResponse('Company not found', 404)
    }

    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingUser) {
      // Check if user is already in company
      const { data: existingMember } = await supabase
        .from('company_members')
        .select('id')
        .eq('user_id', existingUser.id)
        .eq('company_id', company.id)
        .single()

      if (existingMember) {
        return createErrorResponse('User is already a member of this company', 400)
      }
    }

    // Create invite token
    const inviteToken = Buffer.from(`${company.id}:${email}:${Date.now()}`).toString(
      'base64'
    )

    // Store invite in database
    const { error: inviteError } = await supabase
      .from('company_invites')
      .insert({
        company_id: company.id,
        email: email.toLowerCase(),
        invited_by: user.id,
        token: inviteToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })

    if (inviteError) {
      console.error('[INVITE INSERT ERROR]', inviteError)
      return createErrorResponse('Failed to create invite', 400)
    }

    // In production, send email using your email service
    // For now, just return success
    try {
      // This would use your email service (SendGrid, Resend, etc.)
      // Example with Resend:
      // await resend.emails.send({
      //   from: 'noreply@estateflow.com',
      //   to: email,
      //   subject: `You've been invited to join ${company.name} on EstateFlow`,
      //   html: inviteEmailTemplate(company.name, `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${inviteToken}`),
      // })
      console.log('[INVITE EMAIL SENT]', {
        to: email,
        company: company.name,
        token: inviteToken,
      })
    } catch (emailError) {
      console.error('[EMAIL SEND ERROR]', emailError)
      // Don't fail the invite creation if email fails
    }

    return createSecureResponse(
      {
        success: true,
        message: `Invitation sent to ${email}`,
      },
      201
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send invite'
    console.error('[SEND INVITE ERROR]', {
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
