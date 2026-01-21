"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Search, Settings } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import Link from "next/link"

interface UserProfile {
  full_name?: string
  email?: string
}

export function Navbar() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        setUser(user)

        if (user) {
          // Fetch user profile
          const { data } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", user.id)
            .single()

          setProfile(data)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
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

  return (
    <nav className="glass border-b border-[var(--color-border)] sticky top-0 z-40 backdrop-blur-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
            <Input
              placeholder="Search properties, leads, or clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-[var(--color-text-light)]">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-danger)] rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-[var(--color-bg-card)] border-[var(--color-border)]">
              <div className="p-4">
                <h3 className="font-semibold text-[var(--color-text-light)] mb-2">Notifications</h3>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="text-[var(--color-text-light)]">New lead for Anfa Apartment</p>
                    <p className="text-[var(--color-muted-foreground)] text-xs">5 minutes ago</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-[var(--color-text-light)]">Property sold: Villa in Rabat</p>
                    <p className="text-[var(--color-muted-foreground)] text-xs">2 hours ago</p>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Menu */}
          {user && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-[var(--color-text-light)]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                    {getInitials(profile.full_name, profile.email)}
                  </div>
                  <span className="hidden md:inline text-sm">{profile.full_name || profile.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[var(--color-bg-card)] border-[var(--color-border)]">
                <div className="p-3 border-b border-[var(--color-border)]">
                  <p className="text-sm font-semibold text-[var(--color-text-light)]">{profile.full_name || "User"}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">{profile.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[var(--color-border)]" />
                <DropdownMenuItem asChild>
                  <LogoutButton variant="ghost" size="sm" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" showIcon={false} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
