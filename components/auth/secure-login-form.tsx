/**
 * Secure Login Form Component
 * OWASP A07:2021 - Identification and Authentication Failures
 *
 * Features:
 * - Email/password credentials validation via Supabase Auth
 * - Google OAuth 2.0 integration
 * - Rate limit handling
 * - Generic error messages (no user enumeration)
 * - Remember me functionality
 * - Proper session establishment
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, Eye, EyeOff, Loader2, Chrome } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface LoginFormProps {
  onSuccess?: () => void
}

export function SecureLoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter()
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

      // Supabase handles the redirect automatically
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
        // Handle rate limiting
        if (validationResponse.status === 429) {
          const retryAfter = validationResponse.headers.get('Retry-After')
          setError(
            `Too many login attempts. Please try again in ${retryAfter} seconds.`
          )
          return
        }

        // Generic error message (prevents user enumeration)
        setError('Invalid email or password')
        return
      }
      // Now establish Supabase session client-side
      const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) {
        console.error('[LOGIN ERROR]', {
          message: signInError.message,
          status: signInError.status,
          code: signInError.code,
        })
        
        // Provide specific error messages based on error code
        if (signInError.message?.includes('Invalid login credentials')) {
          setError('Invalid email or password')
        } else if (signInError.message?.includes('Email not confirmed')) {
          setError('Please confirm your email before logging in')
        } else if (signInError.message?.includes('User already registered')) {
          setError('This email is already registered')
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

      // Save remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberEmail', formData.email)
      }

      // Success
      if (onSuccess) {
        onSuccess()
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load remembered email on mount
  React.useEffect(() => {
    const remembered = localStorage.getItem('rememberEmail')
    if (remembered) {
      setFormData(prev => ({ ...prev, email: remembered }))
      setRememberMe(true)
    }
  }, [])

  return (
    <Card className="w-full max-w-md border-0 shadow-lg">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          Sign In
        </h2>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="password">Password</Label>
              <a
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
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
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={loading}
            />
            <Label htmlFor="rememberMe" className="font-normal cursor-pointer">
              Remember me
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <Button
            type="button"
            variant="outline"
            disabled={loading || googleLoading}
            onClick={handleGoogleSignIn}
            className="w-full border border-slate-300 hover:bg-slate-50"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In with Google...
              </>
            ) : (
              <>
                <Chrome className="w-4 h-4 mr-2" />
                Sign In with Google
              </>
            )}
          </Button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-slate-600 mt-6">
            Don't have an account?{' '}
            <a
              href="/signup"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </Card>
  )
}
