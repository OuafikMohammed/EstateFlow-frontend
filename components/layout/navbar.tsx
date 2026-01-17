"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Search, User, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/actions/auth"

export function Navbar() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
      // signOut() uses redirect(), which will throw a special error
      // This line will not be reached if redirect() succeeds
    } catch (error: any) {
      // Only handle actual errors, not redirect() which Next.js handles
      if (error.message?.includes('NEXT_REDIRECT')) {
        // This is a redirect from Next.js, let it propagate
        throw error
      }
      
      console.error("Logout error:", error)
      // Fallback redirect only for actual errors
      router.push("/")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getInitials = (name?: string): string => {
    if (!name) return "U"
    return name
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-[var(--color-text-light)]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] flex items-center justify-center text-xs font-semibold text-[var(--color-bg-dark)]">
                  {loading ? "..." : getInitials(user?.fullName)}
                </div>
                <span className="hidden md:block text-sm max-w-[100px] truncate">
                  {loading ? "Loading..." : user?.fullName || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-[var(--color-bg-card)] border-[var(--color-border)]">
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-[var(--color-border)]">
                <p className="font-semibold text-[var(--color-text-light)] text-sm">{user?.fullName || "User"}</p>
                <p className="text-xs text-[var(--color-muted-foreground)] truncate">{user?.email}</p>
                {user?.companyName && (
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{user.companyName}</p>
                )}
              </div>

              {/* Role Badge */}
              {user && (
                <div className="px-4 py-2 flex items-center gap-2">
                  <span className="text-xs bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] text-[var(--color-bg-dark)] px-2 py-1 rounded capitalize">
                    {user.role}
                  </span>
                </div>
              )}

              <DropdownMenuSeparator className="bg-[var(--color-border)]" />

              {/* Settings */}
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="text-[var(--color-text-light)] cursor-pointer"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[var(--color-border)]" />

              {/* Logout */}
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="text-[var(--color-danger)] cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
