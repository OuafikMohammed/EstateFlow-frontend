// File: app/invite/[token]/page.tsx
// Purpose: Invitation acceptance page where agents set their password

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import type { InvitationDetails, AcceptInvitationFormData } from '@/types/auth.types'

interface PageProps {
  params: {
    token: string
  }
}

interface FormErrors {
  password?: string
  confirmPassword?: string
  general?: string
}

export default function InvitationPage({ params }: PageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState<AcceptInvitationFormData>({
    password: '',
    confirmPassword: '',
  })

  // Verify invitation on mount
  useEffect(() => {
    const verifyInvitation = async () => {
      try {
        const response = await fetch('/api/auth/verify-invitation', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        } as RequestInit & { headers: Record<string, string> })

        // Create URL with token
        const url = new URL('/api/auth/verify-invitation', window.location.origin)
        url.searchParams.append('token', params.token)

        const verifyResponse = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (!verifyResponse.ok) {
          const data = await verifyResponse.json()
          setError(data.error || 'Invalid or expired invitation link')
          setIsLoading(false)
          return
        }

        const data = await verifyResponse.json()
        if (data.success && data.invitation) {
          setInvitation(data.invitation)
          setError(null)
        } else {
          setError(data.error || 'Unable to verify invitation')
        }
      } catch (err) {
        console.error('Verification error:', err)
        setError('Network error. Please check your connection.')
      } finally {
        setIsLoading(false)
      }
    }

    verifyInvitation()
  }, [params.token])

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: params.token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to accept invitation')
        toast({
          title: 'Error',
          description: data.error || 'Failed to accept invitation',
          variant: 'destructive',
        })
        return
      }

      // Success
      toast({
        title: 'Success',
        description: 'Invitation accepted! Redirecting to login...',
      })

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (err) {
      console.error('Submission error:', err)
      const errorMsg = 'Network error. Please try again.'
      setError(errorMsg)
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Verifying invitation...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Invitation Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-6">{error || 'Invalid invitation'}</p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            Accept Invitation
          </CardTitle>
          <CardDescription className="mt-2">
            Welcome to {invitation.companyName}!
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Invitation Details (Read-only) */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div>
                <Label className="text-xs font-semibold text-slate-600 uppercase">Email</Label>
                <p className="text-sm font-medium text-slate-900 mt-1">{invitation.email}</p>
              </div>
              {invitation.fullName && (
                <div>
                  <Label className="text-xs font-semibold text-slate-600 uppercase">Name</Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{invitation.fullName}</p>
                </div>
              )}
              <div>
                <Label className="text-xs font-semibold text-slate-600 uppercase">Role</Label>
                <p className="text-sm font-medium text-slate-900 mt-1 capitalize">{invitation.role}</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}

            {/* Password Field */}
            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Set Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password (min. 6 characters)"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  if (errors.password) {
                    setErrors({ ...errors, password: undefined })
                  }
                }}
                className={errors.password ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value })
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: undefined })
                  }
                }}
                className={errors.confirmPassword ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                'Accept Invitation & Create Account'
              )}
            </Button>

            {/* Alternative Login */}
            <div className="text-center">
              <p className="text-xs text-slate-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-primary font-semibold hover:underline"
                >
                  Log in instead
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
