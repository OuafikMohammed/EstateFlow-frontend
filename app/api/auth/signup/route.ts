/**
 * API Route: /api/auth/signup
 * OWASP A01:2021 - Broken Access Control
 * OWASP A07:2021 - Identification and Authentication Failures
 *
 * Secure signup endpoint with:
 * - Rate limiting (3 requests per hour per IP)
 * - Input validation
 * - Password strength requirements
 * - Company and user profile creation
 */

import { NextRequest } from 'next/server'
import { createRateLimiter, RATE_LIMITS, getClientIP } from '@/lib/security/rate-limiter'
import { validateRequest, validationErrorResponse, Schemas } from '@/lib/security/validation'
import { createErrorResponse, createSecureResponse } from '@/lib/security/security-utils'
import { signUpUser } from '@/lib/supabase/auth-handler'

const signupLimiter = createRateLimiter(RATE_LIMITS.public.signup)

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = signupLimiter(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Parse request body
    const body = await request.json()

    // Validate input
    const validation = validateRequest(body, Schemas.signupRequest)
    if (!validation.success) {
      return validationErrorResponse(validation.errors || {})
    }

    // Type-safe extraction from validated data
    const validatedData = validation.data as {
      email: string
      password: string
      fullName: string
      companyName: string
    }

    // Attempt signup
    const result = await signUpUser({
      email: validatedData.email,
      password: validatedData.password,
      fullName: validatedData.fullName,
      companyName: validatedData.companyName,
    })

    return createSecureResponse(
      {
        success: true,
        message: result.message,
        userId: result.userId,
      },
      201
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Signup failed'
    const stack = error instanceof Error ? error.stack : undefined

    // Log full error details for debugging
    console.error('[SIGNUP ERROR]', {
      message,
      stack,
      timestamp: new Date().toISOString(),
    })

    // In development, return full error details for debugging
    if (process.env.NODE_ENV === 'development') {
      return createErrorResponse(
        message,
        400,
        { stack: stack?.split('\n').slice(0, 5) || [] }
      )
    }

    // In production, only expose known safe errors
    const knownErrors = [
      'Email already registered',
      'Please confirm your email',
      'Invalid email',
      'Password must be',
      'Failed to create',
      'email is required',
      'name is required',
      'Database connection error',
      'Invalid API key',
    ]
    
    const isKnownError = knownErrors.some(msg => 
      message.toLowerCase().includes(msg.toLowerCase())
    )

    return createErrorResponse(
      isKnownError ? message : 'An error occurred during signup. Please try again.',
      400
    )
  }
}

// Prevent GET requests
export function GET() {
  return createErrorResponse('Method not allowed', 405)
}
