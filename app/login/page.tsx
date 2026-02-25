'use client'

import React from 'react'
import { SecureLoginForm } from '@/components/auth/secure-login-form'
import { GoldParticles } from '@/components/auth/gold-particles'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gold Particle Background */}
      <GoldParticles particleCount={50} maxLinkDistance={130} />

      {/* Glow orbs for depth */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px]
                      rounded-full bg-[#C9A84C]/[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px]
                      rounded-full bg-[#C9A84C]/[0.02] blur-[80px] pointer-events-none" />

      {/* Login Form */}
      <div className="relative z-10">
        <SecureLoginForm
          onSuccess={() => {
            console.log('Login successful')
          }}
        />
      </div>
    </div>
  )
}
