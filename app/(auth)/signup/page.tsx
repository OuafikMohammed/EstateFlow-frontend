// File: app/(auth)/signup/page.tsx
// Purpose: User signup page

import { Card } from '@/components/ui/card'
import { SignupForm } from '@/components/auth/signup-form'
import { AuthHeader } from '@/components/auth/auth-header'
import { AuthFooter } from '@/components/auth/auth-footer'

export const metadata = {
  title: 'Sign Up - EstateFlow',
  description: 'Create a new EstateFlow account',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <AuthHeader
              title="Create Account"
              subtitle="Set up your EstateFlow account to manage properties and leads"
            />

            {/* Signup Form */}
            <SignupForm />

            {/* Footer */}
            <AuthFooter
              question="Already have an account?"
              linkText="Log in"
              href="/login"
            />
          </div>
        </Card>

        {/* Divider */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
