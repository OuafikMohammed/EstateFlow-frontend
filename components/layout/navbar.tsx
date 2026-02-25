"use client"
// components/layout/navbar.tsx — UPGRADED: reads from Zustand store instantly
// No more useEffect + supabase.auth.getUser() call — zero auth flicker
// Profile data flows from SSR → SessionStoreInitializer → Zustand → this component

import { useState } from "react"
import { useSessionStore } from "@/store/session-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Search } from "lucide-react"
import Link from "next/link"
import { HeaderAuth } from "./header-auth"

export function Navbar({ serverProfile = null }: { serverProfile?: any }) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <nav className="glass header-glow sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-3.5">

        {/* ── Search Bar ── */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search properties, leads, clients…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-white/5 border-white/10 text-foreground
                         placeholder:text-muted-foreground/60
                         focus:border-[var(--color-primary-gold)]/40
                         focus:ring-[var(--color-primary-gold)]/20
                         transition-colors duration-200"
            />
          </div>
        </div>

        {/* ── Right Section ── */}
        <div className="flex items-center gap-3 ml-4">

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"
                className="relative h-9 w-9 rounded-lg border border-white/10 bg-white/5
                           hover:border-[var(--color-primary-gold)]/30 hover:bg-white/10
                           transition-all duration-200">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5
                                 bg-[var(--color-danger)] rounded-full badge-active" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end"
              className="w-80 bg-[var(--color-bg-card)]/95 backdrop-blur-xl border-white/10 rounded-xl shadow-2xl">
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-3 text-foreground">Notifications</h3>
                <div className="space-y-3">
                  {[
                    { title: "New lead for Anfa Apartment", time: "5 min ago" },
                    { title: "Property sold: Villa in Rabat", time: "2 hrs ago" },
                    { title: "Showing confirmed: Ain Diab", time: "Yesterday" },
                  ].map((n) => (
                    <div key={n.title}
                      className="flex items-start gap-3 py-2 cursor-pointer
                                 hover:bg-white/5 rounded-lg px-2 -mx-2 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-gold)]
                                      mt-1.5 shrink-0 badge-gold" />
                      <div>
                        <p className="text-sm text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth section — reads from Zustand (no HTTP call) */}
          <HeaderAuth serverProfile={serverProfile} />
        </div>
      </div>
    </nav>
  )
}

