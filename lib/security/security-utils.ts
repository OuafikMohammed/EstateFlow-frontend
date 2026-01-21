/**
 * Security Utilities Module
 * OWASP Best Practices for API Security
 *
 * Provides:
 * - Secure header management
 * - CORS configuration
 * - Cookie security
 * - Environment variable validation
 */

import { NextResponse, type NextRequest } from 'next/server'

/**
 * Security headers for API responses
 * OWASP A05:2021 - Broken Access Control
 */
export const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // Enable XSS protection in older browsers
  'X-XSS-Protection': '1; mode=block',
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Content Security Policy (for API endpoints, no need for style-src etc)
  'Content-Security-Policy': "default-src 'none'",
  // Remove powered by header
  'X-Powered-By': 'EstateFlow',
} as const

/**
 * CORS configuration for API endpoints
 * Only allow requests from your frontend domain
 */
export function getCORSHeaders(origin: string): Record<string, string> {
  // List of allowed origins in production
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    ...(process.env.ALLOWED_ORIGINS?.split(',') ?? []),
  ].filter(Boolean)

  const isOriginAllowed = allowedOrigins.includes(origin)

  return {
    'Access-Control-Allow-Origin': isOriginAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Access-Control-Allow-Credentials': 'true',
  }
}

/**
 * Create a secure API response with proper headers
 */
export function createSecureResponse(
  data: unknown,
  status: number = 200,
  additionalHeaders?: Record<string, string>
) {
  const response = NextResponse.json(data, { status })

  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add additional headers if provided
  if (additionalHeaders) {
    Object.entries(additionalHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  return response
}

/**
 * Error response with proper security headers
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
) {
  return createSecureResponse(
    {
      error: true,
      message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    },
    status
  )
}

/**
 * Validate required environment variables
 * Call this during app initialization
 */
export function validateEnvironmentVariables() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file'
    )
  }
}

/**
 * Sanitize user input to prevent XSS
 * Use in combination with parameterized queries
 */
export function sanitizeInput(input: string, maxLength: number = 255): string {
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
}

/**
 * Check if request is from a valid internal source
 * Use for webhook verification or admin operations
 */
export function isValidInternalRequest(request: NextRequest): boolean {
  const internalSecret = process.env.INTERNAL_SECRET
  if (!internalSecret) return false

  const auth = request.headers.get('x-internal-secret')
  return auth === internalSecret
}

/**
 * Mask sensitive data in logs
 * Use when logging user data for debugging
 */
export function maskSensitiveData(data: unknown): unknown {
  if (typeof data === 'string') {
    if (data.includes('@')) return data.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Email
    if (data.match(/^\d{4}/)) return '****' + data.slice(-4) // CC or similar
  }
  if (typeof data === 'object' && data !== null) {
    const masked: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      if (
        ['password', 'token', 'secret', 'apiKey', 'creditCard'].some(k =>
          key.toLowerCase().includes(k.toLowerCase())
        )
      ) {
        masked[key] = '***REDACTED***'
      } else {
        masked[key] = maskSensitiveData(value)
      }
    }
    return masked
  }
  return data
}

/**
 * Generate a secure random string for tokens
 */
export function generateSecureToken(length: number = 32): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify CSRF token
 * Use for form submissions from the frontend
 */
export function verifyCsrfToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length > 0 && sessionToken.length > 0
}
