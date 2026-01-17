// File: app/(auth)/login/page.tsx
// Purpose: User login page

import { Card } from '@/components/ui/card'
import { LoginForm } from '@/components/auth/login-form'
import { AuthHeader } from '@/components/auth/auth-header'
import { AuthFooter } from '@/components/auth/auth-footer'

export const metadata = {
  title: 'Login - EstateFlow',
  description: 'Sign in to your EstateFlow account',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <AuthHeader
              title="Welcome Back"
              subtitle="Sign in to your EstateFlow account"
            />

            {/* Login Form */}
            <LoginForm />

            {/* Footer */}
            <AuthFooter
              question="Don't have an account?"
              linkText="Sign up"
              href="/signup"
            />
          </div>
        </Card>

        {/* Divider */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Protected by industry-standard security
          </p>
        </div>
      </div>
    </div>
  )
}
