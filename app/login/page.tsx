'use client'

import React from 'react'
import { SecureLoginForm } from '@/components/auth/secure-login-form'
import Logo from '@/components/logo'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">EstateFlow</h1>
          <p className="text-slate-400 mt-1">Premium Real Estate Management</p>
        </div>

        {/* Login Form Component */}
        <SecureLoginForm
          onSuccess={() => {
            // Component handles redirect to dashboard
            console.log('Login successful')
          }}
        />

        {/* Footer Links */}
        <div className="mt-6 space-y-2 text-center text-sm">
          <div className="text-slate-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
              Create one
            </Link>
          </div>
          <div className="text-slate-400">
            <Link href="#" className="text-blue-400 hover:text-blue-300 font-medium">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
