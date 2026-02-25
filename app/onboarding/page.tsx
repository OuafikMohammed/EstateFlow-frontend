'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { createClient } from '@/lib/supabase/client'
import { GoldAurora } from '@/components/auth/gold-aurora'
import { Loader2 } from 'lucide-react'

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [user, setUser] = useState<{ email: string; user_metadata?: { full_name?: string } } | null>(null)
  const [company, setCompany] = useState<{ name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initOnboarding = async () => {
      try {
        // Get current user
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        // Extract params once for use throughout the component
        const emailFromParams = searchParams.get('email')
        const companyFromParams = searchParams.get('company')

        if (authError || !authUser) {
          if (emailFromParams && companyFromParams) {
            setUser({
              email: emailFromParams,
              user_metadata: { full_name: searchParams.get('name') || undefined },
            })
            setCompany({ name: companyFromParams })
          } else {
            // Redirect to login if no auth and no params
            router.push('/login')
          }
          return
        }

        setUser({
          email: authUser.email || '',
          user_metadata: authUser.user_metadata,
        })

        // Get user's company info
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('id, name')
          .eq('created_by', authUser.id)
          .maybeSingle()

        if (companyError) {
          console.error('[COMPANY FETCH ERROR]', {
            error: companyError.message || companyError.code || companyError,
            userId: authUser.id,
          })
        }

        if (companyData) {
          setCompany(companyData)
        } else if (companyFromParams) {
          setCompany({ name: companyFromParams })
        } else {
          // If no company was fetched and no company from params, set error
          console.warn('[COMPANY DATA WARNING] No company found for user and no company from params')
        }
      } catch (err) {
        console.error('[ONBOARDING INIT ERROR]', err)
        setError('Failed to load onboarding. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    initOnboarding()
  }, [supabase, searchParams, router])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-[#C9A84C] animate-spin" />
        <p className="text-[#C9A84C]/80 font-medium animate-pulse">Initializing your luxury workspace...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-black/40 backdrop-blur-xl border border-red-500/20 rounded-2xl max-w-md w-full mx-auto relative z-10">
        <p className="text-red-400 mb-6 font-medium">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-gradient-to-r from-[#C9A84C] to-[#E5C767] text-black font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] transition-all duration-300"
        >
          Return to home
        </button>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative z-10 w-full">
      <OnboardingWizard
        userEmail={user.email}
        companyName={company?.name || 'Your Company'}
      />
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gold Aurora Background */}
      <GoldAurora />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 168, 76, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 168, 76, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 text-[#C9A84C] animate-spin" />
          <p className="text-[#C9A84C]/80 font-medium">Preparing EstateFlow...</p>
        </div>
      }>
        <OnboardingContent />
      </Suspense>
    </div>
  )
}
