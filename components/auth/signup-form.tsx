// File: components/auth/signup-form.tsx
// Purpose: Signup form with validation and server action

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/actions/auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from './password-input'
import type { SignUpFormData } from '@/types/auth.types'

interface FormErrors {
  companyName?: string
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export function SignupForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState<SignUpFormData & { confirmPassword: string }>({
    companyName: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // Validate email format - simple and permissive
  const isValidEmail = (email: string): boolean => {
    return email.includes('@') && email.includes('.') && email.length > 5
  }

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      // Remove confirmPassword from submission
      const { confirmPassword, ...submitData } = formData

      const result = await signUp(submitData)

      // If we get here, it means signUp returned a response (error case)
      // Successful signUp will redirect and not return here
      if (!result.success) {
        setErrors({
          general: result.error || 'Failed to create account',
        })

        toast({
          title: 'Error',
          description: result.error || 'Failed to create account',
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

      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-sm font-medium">
          Company Name
        </Label>
        <Input
          id="companyName"
          name="companyName"
          type="text"
          placeholder="Your Real Estate Company"
          value={formData.companyName}
          onChange={handleChange}
          disabled={isLoading}
          className={errors.companyName ? 'border-red-500 focus:border-red-500' : ''}
        />
        {errors.companyName && (
          <p className="text-sm text-red-500">{errors.companyName}</p>
        )}
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium">
          Full Name
        </Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={handleChange}
          disabled={isLoading}
          className={errors.fullName ? 'border-red-500 focus:border-red-500' : ''}
        />
        {errors.fullName && (
          <p className="text-sm text-red-500">{errors.fullName}</p>
        )}
      </div>

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
      <PasswordInput
        label="Password"
        placeholder="At least 8 characters"
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

      {/* Confirm Password */}
      <PasswordInput
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={formData.confirmPassword}
        onChange={(value) => {
          setFormData((prev) => ({ ...prev, confirmPassword: value }))
          if (errors.confirmPassword) {
            setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
          }
        }}
        error={errors.confirmPassword}
        disabled={isLoading}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Creating account...
          </span>
        ) : (
          'Create Account'
        )}
      </Button>

      {/* Password Requirements */}
      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700 border border-blue-200">
        <p className="font-medium mb-2">Password requirements:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>At least 8 characters</li>
          <li>Mix of uppercase and lowercase letters</li>
          <li>At least one number or special character</li>
        </ul>
      </div>
    </form>
  )
}
