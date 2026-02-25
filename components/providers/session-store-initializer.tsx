'use client'
// components/providers/session-store-initializer.tsx
// Bridges the server-side session (passed as props from root layout)
// into the Zustand store — runs synchronously before first paint

import { useEffect } from 'react'
import { useSessionStore, type UserProfile } from '@/store/session-store'
import type { User } from '@supabase/supabase-js'

interface SessionStoreInitializerProps {
  user: User | null
  profile: UserProfile | null
}

export function SessionStoreInitializer({ user, profile }: SessionStoreInitializerProps) {
  const setSession = useSessionStore((s) => s.setSession)

  useEffect(() => {
    setSession(user, profile)
  }, [user, profile, setSession])

  return null
}
