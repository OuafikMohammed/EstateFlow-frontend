// app/(auth)/layout.tsx — Server Component
// Shared layout for login and  signup pages
// Split-screen: left = brand showcase, right = auth form

import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Building2, Globe, Shield, Star, TrendingUp, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "EstateFlow - Sign In",
}

const trustBadges = [
  { icon: Shield, label: "Bank-level encryption" },
  { icon: Globe,  label: "GDPR compliant"         },
  { icon: Star,   label: "4.9 / 5 agency rating"  },
]

const stats = [
  { value: "200+", label: "Agencies" },
  { value: "12K+", label: "Listings" },
  { value: "98%",  label: "Retention" },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ──────────────────────────────────────────────────
          LEFT PANEL — Brand showcase (hidden on mobile)
      ────────────────────────────────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between w-[52%]
                      bg-gradient-to-br from-[#080808] via-[#0d0d0d] to-[#0a1a10]
                      overflow-hidden p-12 border-r border-white/5">

        {/* Animated grid background */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(197,160,89,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(197,160,89,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px",
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-1/4 right-0 w-[480px] h-[480px]
                        rounded-full bg-[#c5a059]/4 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-0 w-[320px] h-[320px]
                        rounded-full bg-[#1b4332]/30 blur-[100px] pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-3 w-fit">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#1b4332]
                          flex items-center justify-center shadow-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-serif font-bold text-foreground">EstateFlow</span>
        </Link>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-serif font-bold leading-[1.1] text-foreground">
              The Future of
              <br />
              <span className="text-gold-gradient">Real Estate</span>
              <br />
              Management
            </h1>
            <p className="text-white/55 text-lg max-w-sm leading-relaxed">
              Trusted by top agencies across Morocco & the MENA region to manage
              thousands of listings and leads.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-8">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold font-serif text-[var(--color-primary-gold)]">{value}</p>
                <p className="text-sm text-white/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label}
                className="flex items-center gap-2 text-sm text-white/45
                           border border-white/8 rounded-full px-3 py-1.5 bg-white/3">
                <Icon className="w-3.5 h-3.5 text-[var(--color-primary-gold)]" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial card */}
        <div className="relative z-10 glass rounded-2xl p-5 gradient-border">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c5a059]/80 to-[#1b4332]
                            flex items-center justify-center text-sm font-bold text-white shrink-0">
              A
            </div>
            <div>
              <p className="text-sm text-white/70 leading-relaxed">
                "EstateFlow cut our lead response time by 60%. It's the CRM we always wanted."
              </p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs font-semibold text-[var(--color-primary-gold)]">Ahmed Benjelloun</p>
                <span className="text-white/20">·</span>
                <p className="text-xs text-white/35">CEO, Acme Realty</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────
          RIGHT PANEL — Auth form
      ────────────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10
                      bg-[var(--color-bg-dark)]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c5a059] to-[#1b4332]
                            flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-serif font-bold">EstateFlow</span>
          </Link>

          {children}
        </div>
      </div>
    </div>
  )
}
