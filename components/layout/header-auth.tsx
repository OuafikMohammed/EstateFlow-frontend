'use client'
// components/layout/header-auth.tsx
// Client leaf component for header auth state
// Reads from Zustand store — available instantly on hydration (no HTTP round-trip)
// Falls back to server-passed profile prop to prevent ANY flash

import Link from 'next/link'
import { useSessionStore } from '@/store/session-store'
import { ProfileDropdown } from './profile-dropdown'
import { HeaderAuthSkeleton } from '@/components/skeletons/header-auth-skeleton'
import { GoldButton } from '@/components/ui/gold-button'
import type { UserProfile } from '@/store/session-store'

interface HeaderAuthProps {
  serverProfile: UserProfile | null
}

export function HeaderAuth({ serverProfile }: HeaderAuthProps) {
  const { profile: storeProfile, isLoaded } = useSessionStore()

  // Use server-passed profile as initial value until store is hydrated
  const profile = isLoaded ? storeProfile : serverProfile

  // Show skeleton only if neither source has data yet
  if (!isLoaded && !serverProfile) {
    return <HeaderAuthSkeleton />
  }

  if (!profile) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground hover:text-foreground
                     transition-colors duration-150 px-3 py-1.5"
        >
          Sign In
        </Link>
        <GoldButton size="sm" asChild>
          <Link href="/signup">Get Started</Link>
        </GoldButton>
      </div>
    )
  }

  return <ProfileDropdown profile={profile} />
}
