'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react'
import Logo from '@/components/logo'
import Link from 'next/link'

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [isResending, setIsResending] = useState(false)

  const handleResendEmail = async () => {
    setIsResending(true)
    // TODO: Implement resend verification email
    setTimeout(() => {
      setIsResending(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">EstateFlow</h1>
        </div>

        {/* Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle>Confirm Your Email</CardTitle>
            <CardDescription>
              We've sent a confirmation link to:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Address */}
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <p className="text-slate-900 font-medium">{email || 'your email'}</p>
            </div>

            {/* Instructions */}
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                Please check your email and click the confirmation link to activate your account.
              </p>
              <p>
                If you don't see the email, please check your spam folder.
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? 'Sending...' : 'Resend Email'}
              </Button>
              <Link href="/login" className="block">
                <Button variant="default" className="w-full">
                  Go to Login
                </Button>
              </Link>
            </div>

            {/* Help Text */}
            <div className="text-xs text-slate-500 text-center pt-4 border-t">
              <p>
                After confirming your email, you can log in with your credentials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
