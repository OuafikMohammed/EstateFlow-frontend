"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export interface User {
  id: string
  email: string
  fullName?: string
  companyId: string
  companyName?: string
  role: "admin" | "agent" | "viewer"
  isActive: boolean
  avatarUrl?: string
  phone?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        // Get current auth user
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
          console.error("Auth error:", authError)
          setUser(null)
          setError(authError)
          return
        }

        if (!authUser) {
          // User is not logged in
          setUser(null)
          return
        }

        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(
            `
            id,
            full_name,
            company_id,
            role,
            is_active,
            avatar_url,
            phone
          `
          )
          .eq("id", authUser.id)
          .single()

        if (profileError) {
          console.error("Profile fetch error:", {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
          })
          setUser(null)
          setError(profileError)
          return
        }

        if (!profileData) {
          console.error("No profile data found for user:", authUser.id)
          setUser(null)
          return
        }

        // Fetch company data separately
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("id, name")
          .eq("id", profileData.company_id)
          .single()

        if (companyError) {
          console.warn("Company fetch warning:", companyError.message)
          // Don't fail if company fetch fails, just continue without company name
        }

        // Map to User interface
        const userData: User = {
          id: authUser.id,
          email: authUser.email || "",
          fullName: profileData.full_name || undefined,
          companyId: profileData.company_id,
          companyName: companyData?.name || undefined,
          role: profileData.role,
          isActive: profileData.is_active,
          avatarUrl: profileData.avatar_url || undefined,
          phone: profileData.phone || undefined,
        }

        setUser(userData)
        setError(null)
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err))
        setError(e)
        console.error("useAuth error:", e)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading, error }
}