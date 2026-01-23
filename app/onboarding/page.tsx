'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
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
        } else if (!companyFromParams) {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-slate-400 mt-4">Loading onboarding...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="text-blue-400 hover:text-blue-300"
          >
            Return to home
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <OnboardingWizard
      userEmail={user.email}
      companyName={company?.name || 'Your Company'}
    />
  )
}
