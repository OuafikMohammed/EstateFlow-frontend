/**
 * Secure Signup Form Component — EstateFlow Premium Redesign
 * OWASP A07:2021 - Identification and Authentication Failures
 *
 * Features:
 * - Form validation with live feedback
 * - Password strength indicator (4-segment gold bar)
 * - Google OAuth 2.0 integration
 * - Rate limit handling
 * - Secure error handling (no sensitive info disclosure)
 * - 2-step progress indicator
 * - Premium gold/black luxury styling
 * - Framer Motion entrance animation
 */

'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Building2, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

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
  const [currentStep, setCurrentStep] = useState(1)
  const [showConfetti, setShowConfetti] = useState(false)
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

  const metCount = passwordStrength.filter(req => req.met).length
  const allRequirementsMet = passwordStrength.every(req => req.met)

  // Step 1 valid if name and company filled
  const step1Valid = formData.fullName.trim().length > 0 && formData.companyName.trim().length > 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
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
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          setError(
            `Too many signup attempts. Try again in ${retryAfter} minutes.`
          )
          return
        }

        if (data.details && typeof data.details === 'object') {
          const errorMessages = Object.values(data.details as Record<string, string[]>)
          const firstError = Array.isArray(errorMessages[0]) ? errorMessages[0][0] : String(errorMessages[0])
          setError(firstError || data.message || 'Validation failed')
          return
        }

        console.error('[SIGNUP RESPONSE ERROR]', {
          status: response.status,
          data,
        })

        setError(data.message || 'Signup failed')
        return
      }

      // Success — trigger gold confetti burst
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2000)

      if (onSuccess) {
        onSuccess(data.userId)
      }

      // Redirect to onboarding with pre-filled data
      const onboardingParams = new URLSearchParams({
        email: formData.email,
        company: formData.companyName,
        name: formData.fullName,
      })
      
      setTimeout(() => {
        router.push(`/onboarding?${onboardingParams.toString()}`)
      }, 800)
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
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md relative"
    >
      {/* Gold Confetti Burst */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-2xl">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  x: '50%',
                  y: '50%',
                  scale: 0,
                }}
                animate={{
                  opacity: 0,
                  x: `${50 + (Math.random() - 0.5) * 140}%`,
                  y: `${50 + (Math.random() - 0.5) * 140}%`,
                  scale: Math.random() * 1.5 + 0.5,
                  rotate: Math.random() * 360,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 + Math.random() * 0.8, ease: 'easeOut' }}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: i % 3 === 0
                    ? '#C9A84C'
                    : i % 3 === 1
                    ? '#e8d4a0'
                    : '#D4A843',
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

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

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-0">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div className={`step-dot ${currentStep >= 1 ? (step1Valid ? 'completed' : 'current') : ''}`} />
              <span className={`text-xs font-medium ${currentStep === 1 ? 'text-[#C9A84C]' : 'text-white/40'}`}>
                Account Info
              </span>
            </div>

            {/* Line */}
            <div className={`step-line mx-3 ${step1Valid ? 'completed' : ''}`} />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div className={`step-dot ${currentStep === 2 ? 'current' : ''} ${currentStep > 2 ? 'completed' : ''}`} />
              <span className={`text-xs font-medium ${currentStep === 2 ? 'text-[#C9A84C]' : 'text-white/40'}`}>
                Security
              </span>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-serif font-bold text-white mb-2">
          Create Your Account
        </h2>
        <p className="text-sm text-white/40 mb-6">
          Set up your company workspace and start managing your real estate business
        </p>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* Full Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="signup-fullName"
                    className="block text-[13px] font-medium text-white"
                  >
                    Full Name
                  </label>
                  <input
                    id="signup-fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    disabled={loading}
                    required
                    className="auth-input w-full h-11 px-4 rounded-lg text-sm focus:ring-0"
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="signup-companyName"
                    className="block text-[13px] font-medium text-white"
                  >
                    Company Name
                  </label>
                  <input
                    id="signup-companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Acme Realty"
                    disabled={loading}
                    required
                    className="auth-input w-full h-11 px-4 rounded-lg text-sm focus:ring-0"
                  />
                </div>

                {/* Next Step Button */}
                <button
                  type="button"
                  disabled={!step1Valid}
                  onClick={() => setCurrentStep(2)}
                  className="btn-gold-shimmer w-full h-12 rounded-lg text-[#0A0A0A] font-bold text-sm
                             transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed
                             hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
                  style={{
                    background: step1Valid
                      ? 'linear-gradient(135deg, #C9A84C, #D4A843)'
                      : '#333',
                    color: step1Valid ? '#0A0A0A' : '#666',
                  }}
                >
                  Continue to Security Setup
                </button>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-[13px] text-[#C9A84C] hover:text-[#e8d4a0] transition-colors mb-2 flex items-center gap-1"
                >
                  ← Back to Account Info
                </button>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="signup-email"
                    className="block text-[13px] font-medium text-white"
                  >
                    Email Address
                  </label>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    disabled={loading}
                    required
                    className="auth-input w-full h-11 px-4 rounded-lg text-sm focus:ring-0"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="signup-password"
                    className="block text-[13px] font-medium text-white"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter strong password"
                      disabled={loading}
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

                  {/* Password Strength Bar */}
                  <div className="flex gap-1.5 mt-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`strength-segment ${metCount > i ? 'active' : ''}`}
                      />
                    ))}
                  </div>

                  {/* Password Requirements */}
                  <div className="mt-3 space-y-1.5">
                    {passwordStrength.map((req, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-[13px]"
                      >
                        {req.met ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A84C]" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-[#333]" />
                        )}
                        <span className={req.met ? 'text-white' : 'text-[#555]'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || googleLoading || !allRequirementsMet || !formData.email}
                  className="btn-gold-shimmer w-full h-12 rounded-lg text-[#0A0A0A] font-bold text-sm
                             transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed
                             hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]
                             flex items-center justify-center gap-2"
                  style={{
                    background: (allRequirementsMet && formData.email)
                      ? 'linear-gradient(135deg, #C9A84C, #D4A843)'
                      : '#333',
                    color: (allRequirementsMet && formData.email) ? '#0A0A0A' : '#666',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Create Account
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Sign In Link */}
          <p className="text-center text-sm text-white/50 mt-6">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[#C9A84C] hover:text-[#e8d4a0] font-medium transition-colors"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </motion.div>
  )
}
