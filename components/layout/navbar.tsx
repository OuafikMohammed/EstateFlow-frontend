"use client"

import { useState } from "react"
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

export function Navbar() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleLogout = () => {
    router.push("/login")
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] flex items-center justify-center">
                  <User className="w-4 h-4 text-[var(--color-bg-dark)]" />
                </div>
                <span className="hidden md:block">Ahmed</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[var(--color-bg-card)] border-[var(--color-border)]">
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="text-[var(--color-text-light)] cursor-pointer"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[var(--color-border)]" />
              <DropdownMenuItem onClick={handleLogout} className="text-[var(--color-danger)] cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
