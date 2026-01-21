/**
 * Rate Limiter Module
 * OWASP API1:2023 - Broken Object Level Authorization mitigation
 * OWASP API4:2023 - Unrestricted Resource Consumption Prevention
 *
 * Implements token bucket algorithm for rate limiting:
 * - Per-IP rate limiting for public endpoints
 * - Per-user rate limiting for authenticated endpoints
 * - Configurable limits per endpoint
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number // milliseconds
  keyGenerator?: (request: NextRequest) => string
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

/**
 * In-memory rate limit store
 * NOTE: In production, use Redis for distributed rate limiting
 * This in-memory store is suitable for single-instance deployments
 */
const rateLimitStore: RateLimitStore = {}

/**
 * Cleanup old entries every 5 minutes to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now()
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key]
    }
  })
}, 5 * 60 * 1000)

/**
 * Create rate limiter middleware
 * @param config - Rate limit configuration
 * @returns Middleware function
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (request: NextRequest): NextResponse | null => {
    const key = config.keyGenerator
      ? config.keyGenerator(request)
      : getClientIP(request)

    const now = Date.now()
    const record = rateLimitStore[key] || { count: 0, resetTime: now + config.windowMs }

    if (now > record.resetTime) {
      // Reset window
      record.count = 0
      record.resetTime = now + config.windowMs
    }

    record.count++
    rateLimitStore[key] = record

    if (record.count > config.maxRequests) {
      // Rate limit exceeded
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString(),
          },
        }
      )
    }

    return null
  }
}

/**
 * Extract client IP from request
 * Handles X-Forwarded-For, X-Real-IP headers (set by reverse proxies)
 */
export function getClientIP(request: NextRequest): string {
  // Check for IP from reverse proxy headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // NextRequest doesn't have .ip property, use headers for CF-Connecting-IP (Cloudflare)
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Fallback to unknown if no IP can be determined
  return 'unknown'
}

/**
 * Create per-user rate limiter key generator
 * Combines user ID with IP for defense against account enumeration
 */
export function createUserKeyGenerator(getUserId: (request: NextRequest) => string | null) {
  return (request: NextRequest): string => {
    const userId = getUserId(request)
    const ip = getClientIP(request)
    return userId ? `user:${userId}:${ip}` : `ip:${ip}`
  }
}

/**
 * Standard rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  // Public endpoints - stricter limits
  public: {
    login: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 min
    signup: { maxRequests: 500, windowMs: 60 * 60 * 1000 }, // 500 requests per hour
    passwordReset: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
    general: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
  },

  // Authenticated endpoints - more generous
  authenticated: {
    general: { maxRequests: 1000, windowMs: 60 * 1000 }, // 1000 per minute
    upload: { maxRequests: 50, windowMs: 60 * 1000 }, // 50 per minute
    export: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
  },
}
