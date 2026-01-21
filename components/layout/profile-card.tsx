"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"

interface UserProfile {
  full_name?: string
  email?: string
  role?: string
  company_id?: string
  id?: string
}

interface Company {
  id?: string
  name?: string
}

export function ProfileCard() {
  const supabase = createClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id, full_name, email, role, company_id")
            .eq("id", user.id)
            .single()

          if (profileError) {
            console.error("Profile fetch error:", profileError)
            setLoading(false)
            return
          }

          setProfile(profileData)

          // Fetch company if company_id exists
          if (profileData?.company_id) {
            const { data: companyData, error: companyError } = await supabase
              .from("companies")
              .select("id, name")
              .eq("id", profileData.company_id)
              .single()

            if (companyError) {
              console.error("Company fetch error:", companyError)
            }

            setCompany(companyData)
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setLoading(false)
      }
    }

    getProfileData()
  }, [supabase])

  const getInitials = (name?: string | null, email?: string | null): string => {
    const displayName = name || email
    if (!displayName) return "U"
    return displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (loading || !profile) {
    return (
      <div className="pt-6 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-card)] rounded-lg animate-pulse">
          <div className="w-10 h-10 rounded-full bg-muted" />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-3 bg-muted rounded w-20" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-6 border-t border-[var(--color-border)]">
      <Card className="flex items-center gap-3 p-3 bg-[var(--color-bg-card)] border-0 shadow-none">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-[var(--color-bg-dark)]">
            {getInitials(profile.full_name, profile.email)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-light)] truncate">
            {profile.full_name || "User"}
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)] truncate">
            {profile.role || "Agent"}
          </p>
          {company && (
            <p className="text-xs text-[var(--color-muted-foreground)] truncate mt-0.5">
              {company.name}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
