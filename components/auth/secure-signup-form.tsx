/**
 * Secure Signup Form Component
 * OWASP A07:2021 - Identification and Authentication Failures
 *
 * Features:
 * - Form validation with live feedback
 * - Password strength indicator
 * - Google OAuth 2.0 integration
 * - Rate limit handling
 * - Secure error handling (no sensitive info disclosure)
 */

'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Chrome } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { z } from 'zod'

// Password strength requirements
const PASSWORD_REQUIREMENTS = [
  { regex: /.{12,}/, label: '12+ characters' },
  { regex: /[A-Z]/, label: 'Uppercase letter' },
  { regex: /[a-z]/, label: 'Lowercase letter' },
  { regex: /[0-9]/, label: 'Number' },
  { regex: /[^a-zA-Z0-9]/, label: 'Special character' },
]

interface SignupFormProps {
  onSuccess?: (userId: string) => void
}

export function SecureSignupForm({ onSuccess }: SignupFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
  })

  // Password strength check
  const passwordStrength = React.useMemo(() => {
    return PASSWORD_REQUIREMENTS.map(req => ({
      ...req,
      met: req.regex.test(formData.password),
    }))
  }, [formData.password])

  const allRequirementsMet = passwordStrength.every(req => req.met)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null) // Clear error on input change
  }

  /**
   * Handle Google OAuth Sign-Up
   * SECURITY: Delegates to Supabase OAuth which handles token management
   */
  const handleGoogleSignUp = async () => {
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
        setError('Google sign-up failed. Please try again.')
        return
      }

      // Supabase handles the redirect automatically
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Google sign-up error:', err)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          setError(
            `Too many signup attempts. Try again in ${retryAfter} minutes.`
          )
          return
        }

        // Handle validation errors
        if (data.details && typeof data.details === 'object') {
          const errorMessages = Object.values(data.details as Record<string, string[]>)
          const firstError = Array.isArray(errorMessages[0]) ? errorMessages[0][0] : String(errorMessages[0])
          setError(firstError || data.message || 'Validation failed')
          return
        }

        // Log error details for debugging
        console.error('[SIGNUP RESPONSE ERROR]', {
          status: response.status,
          data,
        })

        setError(data.message || 'Signup failed')
        return
      }

      // Success
      if (onSuccess) {
        onSuccess(data.userId)
      }

      // Redirect to onboarding with pre-filled data
      const onboardingParams = new URLSearchParams({
        email: formData.email,
        company: formData.companyName,
        name: formData.fullName,
      })
      router.push(`/onboarding?${onboardingParams.toString()}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.'
      setError(errorMessage)
      console.error('[SIGNUP FETCH ERROR]', {
        error: err,
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  // Check for URL errors (from OAuth callback) on mount
  React.useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  return (
    <Card className="w-full max-w-md border-0 shadow-lg">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
          Create Your Account
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Set up your company workspace and start managing your real estate business
        </p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              disabled={loading}
              required
            />
          </div>

          {/* Company Name */}
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              type="text"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Acme Realty"
              disabled={loading}
              required
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled={loading}
              required
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter strong password"
                disabled={loading}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Requirements */}
            <div className="mt-3 space-y-2">
              {passwordStrength.map((req, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm"
                >
                  {req.met ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300" />
                  )}
                  <span className={req.met ? 'text-green-600' : 'text-slate-500'}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || googleLoading || !allRequirementsMet}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or sign up with</span>
            </div>
          </div>

          {/* Google Sign-Up Button */}
          <Button
            type="button"
            variant="outline"
            disabled={loading || googleLoading}
            onClick={handleGoogleSignUp}
            className="w-full border border-slate-300 hover:bg-slate-50"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing Up with Google...
              </>
            ) : (
              <>
                <Chrome className="w-4 h-4 mr-2" />
                Sign Up with Google
              </>
            )}
          </Button>

          {/* Sign In Link */}
          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign In
            </a>
          </p>
        </form>
      </div>
    </Card>
  )
}
