'use client'
// components/layout/profile-dropdown.tsx
// Premium animated profile dropdown for the header
// Framer Motion spring animation, role color coding, gold glow

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Settings,
  LayoutDashboard,
  LogOut,
  User,
  Shield,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/session-store'
import type { UserProfile } from '@/store/session-store'

interface ProfileDropdownProps {
  profile: UserProfile
}

const roleConfig: Record<string, { label: string; colorClass: string }> = {
  super_admin:   { label: 'Super Admin',    colorClass: 'role-super-admin' },
  company_admin: { label: 'Company Admin',  colorClass: 'role-admin' },
  agent:         { label: 'Agent',          colorClass: 'role-agent' },
  client:        { label: 'Client',         colorClass: 'role-client' },
}

function getInitials(name: string | null, email: string | null): string {
  const s = name || email || 'U'
  return s.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export function ProfileDropdown({ profile }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const clearSession = useSessionStore((s) => s.clearSession)
  const supabase = createClient()

  const roleInfo = roleConfig[profile.role] ?? { label: profile.role, colorClass: 'text-muted-foreground' }

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    setSigningOut(true)
    clearSession()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-2.5 rounded-full
                   border border-white/10 bg-white/5 pl-2.5 pr-3.5 py-1.5
                   hover:border-[var(--color-primary-gold)]/40 hover:bg-white/10
                   transition-all duration-200 focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-[var(--color-primary-gold)]/50"
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c5a059] to-[#1b4332]
                        flex items-center justify-center text-xs font-bold text-white shrink-0">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name ?? ''}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(profile.full_name, profile.email)
          )}
        </div>
        <span className="hidden md:block text-sm font-medium text-foreground max-w-[120px] truncate">
          {profile.full_name ?? profile.email ?? 'User'}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200
                      ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="profile-dropdown"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 440, damping: 34 }}
            className="absolute right-0 top-full mt-2.5 w-60 rounded-2xl
                       border border-white/10 bg-[var(--color-bg-card)]/95 backdrop-blur-2xl
                       shadow-2xl shadow-black/60 overflow-hidden z-50"
          >
            {/* Profile header */}
            <div className="px-4 py-3.5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c5a059] to-[#1b4332]
                                flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {getInitials(profile.full_name, profile.email)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {profile.full_name ?? 'User'}
                  </p>
                  <p className={`text-xs font-semibold ${roleInfo.colorClass}`}>
                    {roleInfo.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5 space-y-0.5">
              <DropdownLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setOpen(false)} />
              <DropdownLink href="/settings" icon={Settings} label="Settings" onClick={() => setOpen(false)} />
              {(profile.role === 'super_admin' || profile.role === 'company_admin') && (
                <DropdownLink href="/settings?tab=team" icon={User} label="Team Management" onClick={() => setOpen(false)} />
              )}
              {profile.role === 'super_admin' && (
                <DropdownLink href="/admin" icon={Shield} label="Super Admin Panel" onClick={() => setOpen(false)} />
              )}
            </div>

            {/* Sign out */}
            <div className="p-1.5 border-t border-white/5">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm
                           text-red-400 hover:bg-red-500/10 hover:text-red-300
                           transition-all duration-150 text-left disabled:opacity-50"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {signingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DropdownLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string
  icon: typeof Settings
  label: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm
                 text-muted-foreground hover:text-foreground hover:bg-white/5
                 transition-all duration-150 group"
    >
      <Icon className="w-4 h-4 shrink-0 group-hover:text-[var(--color-primary-gold)] transition-colors" />
      {label}
    </Link>
  )
}
