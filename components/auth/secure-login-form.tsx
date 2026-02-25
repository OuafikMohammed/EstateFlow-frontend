/**
 * Secure Login Form Component — EstateFlow Premium Redesign
 * OWASP A07:2021 - Identification and Authentication Failures
 *
 * Features:
 * - Email/password credentials validation via Supabase Auth
 * - Google OAuth 2.0 integration
 * - Rate limit handling
 * - Generic error messages (no user enumeration)
 * - Remember me functionality
 * - Premium gold/black luxury styling
 * - Framer Motion entrance animation
 */

'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, Eye, EyeOff, Loader2, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface LoginFormProps {
  onSuccess?: () => void
}

export function SecureLoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  /**
   * Handle Google OAuth Sign-In
   * SECURITY: Delegates to Supabase OAuth which handles token management
   */
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false,
        },
      })

      if (oauthError) {
        console.error('[GOOGLE OAUTH ERROR]', oauthError)
        setError('Google sign-in failed. Please try again.')
        return
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Google sign-in error:', err)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // First, validate credentials server-side
      const validationResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!validationResponse.ok) {
        if (validationResponse.status === 429) {
          const retryAfter = validationResponse.headers.get('Retry-After')
          setError(
            `Too many login attempts. Please try again in ${retryAfter} seconds.`
          )
          return
        }
        setError('Invalid email or password')
        return
      }

      // Now establish Supabase session client-side
      const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) {
        console.error('[LOGIN ERROR] Full error object:', signInError)
        console.error('[LOGIN ERROR] Error details:', {
          message: signInError.message,
          status: signInError.status,
          code: signInError.code,
          name: signInError.name,
        })

        const errorMsg = (signInError.message || '').toLowerCase()

        if (errorMsg.includes('invalid credentials') || errorMsg.includes('invalid login')) {
          setError('Invalid email or password')
        } else if (errorMsg.includes('email not confirmed') || errorMsg.includes('not confirmed')) {
          setError('Please confirm your email before logging in')
        } else if (errorMsg.includes('already signed up')) {
          setError('This email is already signed up')
        } else if (errorMsg.includes('user not found') || errorMsg.includes('not found')) {
          setError('Invalid email or password')
        } else if (!errorMsg) {
          setError('Authentication failed. Please try again.')
        } else {
          setError(signInError.message || 'Authentication failed. Please try again.')
        }
        return
      }

      if (!signInData.session || !signInData.user) {
        console.error('[LOGIN ERROR] No session or user returned')
        setError('Authentication failed. Please try again.')
        return
      }

      if (rememberMe) {
        localStorage.setItem('rememberEmail', formData.email)
      }

      if (onSuccess) {
        onSuccess()
      }

      router.push('/dashboard')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('[LOGIN] Unexpected error:', {
        error: errorMsg,
        errorType: err instanceof Error ? 'Error' : typeof err,
        fullError: err,
      })
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load remembered email on mount and check for URL errors
  React.useEffect(() => {
    const remembered = localStorage.getItem('rememberEmail')
    if (remembered) {
      setFormData(prev => ({ ...prev, email: remembered }))
      setRememberMe(true)
    }

    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <div className="auth-card-glass p-8 sm:p-10">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl
                          bg-gradient-to-br from-[#C9A84C] to-[#1b4332]
                          shadow-lg mb-4">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-[28px] font-serif font-bold text-white">
            EstateFlow
          </h1>
          <p className="text-[13px] text-[#C9A84C] tracking-[2px] uppercase mt-1 font-medium">
            Premium Real Estate Management
          </p>
        </div>

        {/* Title */}
        <h2 className="text-xl font-serif font-bold text-white mb-6">
          Sign In
        </h2>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="login-email"
              className="block text-[13px] font-medium text-white"
            >
              Email Address
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled={loading}
              autoComplete="email"
              required
              className="auth-input w-full h-11 px-4 rounded-lg text-sm focus:ring-0"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label
                htmlFor="login-password"
                className="block text-[13px] font-medium text-white"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[13px] text-[#C9A84C] hover:underline transition-all"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
                required
                className="auth-input w-full h-11 px-4 pr-11 rounded-lg text-sm focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9A84C] hover:text-[#e8d4a0] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="login-rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={loading}
              className="gold-checkbox"
            />
            <label
              htmlFor="login-rememberMe"
              className="text-sm text-white/70 cursor-pointer select-none"
            >
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="btn-gold-shimmer w-full h-12 rounded-lg text-[#0A0A0A] font-bold text-sm
                       transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #C9A84C, #D4A843)',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Divider */}
          <div className="auth-divider my-6">
            <span className="text-sm text-[#666]">Or continue with</span>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            disabled={loading || googleLoading}
            onClick={handleGoogleSignIn}
            className="google-auth-btn w-full h-12 rounded-lg flex items-center justify-center gap-2
                       text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In with Google...
              </>
            ) : (
              <>
                {/* Google Icon SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign In with Google
              </>
            )}
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-white/50 mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-[#C9A84C] hover:text-[#e8d4a0] font-medium transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </motion.div>
  )
}
