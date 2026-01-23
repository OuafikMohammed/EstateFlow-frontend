"use client"

import { useEffect, useState } from "react"

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

        // Fetch user profile from API endpoint
        const response = await fetch('/api/auth/profile', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            // User is not authenticated
            console.log('[useAuth] User not authenticated')
            setUser(null)
            setError(null)
            return
          }

          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
          const errorMessage = errorData.message || `Server error: ${response.statusText}`
          console.error('[useAuth] Profile fetch error:', {
            status: response.status,
            message: errorMessage,
          })
          throw new Error(errorMessage)
        }

        const data = await response.json()
        setUser(data.user)
        setError(null)
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err))
        console.error('[useAuth ERROR]', {
          message: e.message,
          stack: e.stack,
        })
        setError(e)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading, error }
}