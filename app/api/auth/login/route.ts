/**
 * API Route: /api/auth/login
 * OWASP A01:2021 - Broken Access Control
 * OWASP A07:2021 - Identification and Authentication Failures
 *
 * Secure login endpoint with:
 * - Rate limiting (5 requests per 15 minutes per IP)
 * - Input validation
 * - Timing-safe credential verification
 * - Account status checking
 */

import { NextRequest } from 'next/server'
import { createRateLimiter, RATE_LIMITS } from '@/lib/security/rate-limiter'
import { validateRequest, validationErrorResponse, Schemas } from '@/lib/security/validation'
import { createErrorResponse, createSecureResponse } from '@/lib/security/security-utils'
import { signInUser } from '@/lib/supabase/auth-handler'

const loginLimiter = createRateLimiter(RATE_LIMITS.public.login)

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = loginLimiter(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Parse request body
    const body = await request.json()

    // Validate input
    const validation = validateRequest(body, Schemas.loginRequest)
    if (!validation.success) {
      return validationErrorResponse(validation.errors || {})
    }

    // Type-safe extraction from validated data
    const validatedData = validation.data as {
      email: string
      password: string
    }

    // Attempt login
    const result = await signInUser({
      email: validatedData.email,
      password: validatedData.password,
    })

    return createSecureResponse(
      {
        success: true,
        message: result.message,
        userId: result.userId,
      },
      200
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed'
    
    // Log error for debugging
    console.error('[API /auth/login] Error:', {
      error: message,
      timestamp: new Date().toISOString(),
    })

    // Generic error message to prevent user enumeration
    return createErrorResponse('Invalid email or password', 401)
  }
}

// Prevent GET requests
export function GET() {
  return createErrorResponse('Method not allowed', 405)
}

// Prevent other methods
export function PUT() {
  return createErrorResponse('Method not allowed', 405)
}

export function DELETE() {
  return createErrorResponse('Method not allowed', 405)
}
