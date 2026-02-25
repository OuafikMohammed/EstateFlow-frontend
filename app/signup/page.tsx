'use client'

import React from 'react'
import { SecureSignupForm } from '@/components/auth/secure-signup-form'
import { GoldAurora } from '@/components/auth/gold-aurora'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gold Aurora Background */}
      <GoldAurora />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 168, 76, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 168, 76, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '44px 44px',
        }}
      />

      {/* Signup Form */}
      <div className="relative z-10">
        <SecureSignupForm
          onSuccess={(userId) => {
            console.log('Signup successful for user:', userId)
          }}
        />
      </div>
    </div>
  )
}
