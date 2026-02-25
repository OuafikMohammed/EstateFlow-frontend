// hooks/use-role.ts
// Role-based access hook — reads from Zustand store (no async, instant)

import { useSessionStore } from '@/store/session-store'

export type AppRole = 'super_admin' | 'company_admin' | 'agent' | 'client'

export function useRole() {
  const profile = useSessionStore((s) => s.profile)
  const role = profile?.role ?? null

  return {
    role,
    isSuperAdmin: role === 'super_admin',
    isAdmin: role === 'company_admin' || role === 'super_admin',
    isAgent: role === 'agent',
    isClient: role === 'client',
    hasRole: (r: AppRole) => role === r,
    canManageCompany: role === 'super_admin' || role === 'company_admin',
    canManageProperties: role !== 'client',
    canDeleteAny: role === 'super_admin' || role === 'company_admin',
  }
}
