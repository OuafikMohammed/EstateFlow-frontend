// File: components/auth/login-form.tsx
// Purpose: Login form with email and password validation

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/actions/auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from './password-input'
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
      const result = await signIn(formData)

      // If we get here, it means signIn returned a response (error case)
      // Successful signIn will redirect and not return here
      if (!result.success) {
        setErrors({
          general: result.error || 'Failed to sign in',
        })

        toast({
          title: 'Error',
          description: result.error || 'Failed to sign in',
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* General Error Message */}
      {errors.general && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {errors.general}
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <a href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700">
            Forgot password?
          </a>
        </div>
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(value) => {
            setFormData((prev) => ({ ...prev, password: value }))
            if (errors.password) {
              setErrors((prev) => ({ ...prev, password: undefined }))
            }
          }}
          error={errors.password}
          disabled={isLoading}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium"
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
    </form>
  )
}
