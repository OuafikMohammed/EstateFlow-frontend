// store/session-store.ts
// Zustand store for session state — initialized server-side, zero client round-trips
// This eliminates the auth flicker by making session available before first paint

import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  full_name: string | null
  email: string | null
  role: 'super_admin' | 'company_admin' | 'agent' | 'client'
  avatar_url: string | null
  company_id: string | null
  company_name?: string | null
}

interface SessionState {
  user: User | null
  profile: UserProfile | null
  isLoaded: boolean
  setSession: (user: User | null, profile: UserProfile | null) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  profile: null,
  isLoaded: false,
  setSession: (user, profile) => set({ user, profile, isLoaded: true }),
  clearSession: () => set({ user: null, profile: null, isLoaded: true }),
}))
