// File: components/auth/login-form.tsx
// Purpose: Login form with email/password and Google OAuth support

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { PasswordInput } from './password-input'
import { Chrome } from 'lucide-react'
import type { SignInFormData } from '@/types/auth.types'

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
  })

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate before submitting
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: true,
        callbackUrl: '/dashboard',
      })

      // If signIn returns with error, handle it
      if (result?.error) {
        setErrors({
          general: result.error,
        })

        toast({
          title: 'Sign In Error',
          description: result.error,
          variant: 'destructive',
        })
        
        setIsLoading(false)
      }
    } catch (error: any) {
      // Only handle actual errors, not redirect() which Next.js handles
      if (error.message?.includes('NEXT_REDIRECT')) {
        // This is a redirect from Next.js, let it propagate
        throw error
      }
      
      const errorMessage = 'An unexpected error occurred. Please try again.'
      setErrors({
        general: errorMessage,
      })

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      // Get Supabase client to initiate OAuth flow
      const response = await fetch('/api/auth/google', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to initiate Google sign in')
      }

      const data = await response.json()
      
      // Redirect to Google OAuth URL
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Google sign in error:', error)
      toast({
        title: 'Google Sign In Error',
        description: 'Failed to sign in with Google. Please try again.',
        variant: 'destructive',
      })
      setIsGoogleLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* General Error Message */}
      {errors.general && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200 flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <span>{errors.general}</span>
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email Address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading || isGoogleLoading}
          className={`${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
        />
        {errors.email && (
          <p className="text-xs text-red-600 font-medium">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </Label>
          <a 
            href="/forgot-password" 
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Forgot password?
          </a>
        </div>
        <PasswordInput
          id="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev) => ({ ...prev, password: e.target.value }))
            if (errors.password) {
              setErrors((prev) => ({ ...prev, password: undefined }))
            }
          }}
          disabled={isLoading || isGoogleLoading}
          className={errors.password ? 'border-red-500 focus:border-red-500' : ''}
        />
        {errors.password && (
          <p className="text-xs text-red-600 font-medium">{errors.password}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || isGoogleLoading}
        className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold transition-colors"
        size="lg"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <Separator className="flex-1" />
        <span className="text-xs text-slate-500 font-medium">OR</span>
        <Separator className="flex-1" />
      </div>

      {/* Google Sign In Button */}
      <Button
        type="button"
        variant="outline"
        disabled={isLoading || isGoogleLoading}
        onClick={handleGoogleSignIn}
        className="w-full h-11 font-semibold transition-colors"
        size="lg"
      >
        {isGoogleLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Signing in with Google...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Chrome className="w-4 h-4" />
            Sign In with Google
          </span>
        )}
      </Button>

      {/* Link to Signup */}
      <p className="text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <a href="/signup" className="text-primary font-semibold hover:text-primary/80 transition-colors">
          Sign up here
        </a>
      </p>
    </form>
  )
}
