'use client'

import React from 'react'
import { SecureSignupForm } from '@/components/auth/secure-signup-form'
import Logo from '@/components/logo'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">EstateFlow</h1>
          <p className="text-slate-400 mt-1">Enterprise real estate management platform</p>
        </div>

        {/* Signup Form Component */}
        <SecureSignupForm
          onSuccess={(userId) => {
            // User is successfully registered, component handles redirect
            console.log('Signup successful for user:', userId)
          }}
        />

        {/* Footer Link */}
        <div className="text-center text-sm mt-6">
          <span className="text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}
