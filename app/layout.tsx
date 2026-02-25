// app/layout.tsx — SERVER COMPONENT (no 'use client')
// Preloads user session + profile ONCE on the server.
// Passes data to SessionStoreInitializer which hydrates the Zustand store
// before first paint → eliminates auth flicker entirely.

import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { ReactQueryProvider } from "@/components/providers/query-client-provider"
import { ConfirmProvider } from "@/components/providers/confirm-provider"
import { SessionStoreInitializer } from "@/components/providers/session-store-initializer"
import { createClient } from "@/lib/supabase/server"
import type { UserProfile } from "@/store/session-store"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })

export const metadata: Metadata = {
  title: "EstateFlow - Premium Real Estate Management",
  description: "Luxury real estate property management platform for Morocco & MENA",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png",  media: "(prefers-color-scheme: dark)"  },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // ── Server-side session preload ──────────────────────────────────────────
  // This runs ONCE per request on the Edge/Node server.
  // The result is serialized into the initial HTML — no client HTTP round-trip.
  let user = null
  let profile: UserProfile | null = null

  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (authUser) {
      user = authUser
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, avatar_url, company_id")
        .eq("id", authUser.id)
        .single()

      if (data) {
        profile = {
          id: data.id,
          full_name: data.full_name,
          email: data.email ?? authUser.email ?? null,
          role: data.role,
          avatar_url: data.avatar_url,
          company_id: data.company_id,
        }
      }
    }
  } catch {
    // Supabase not configured or session expired — continue as unauthenticated
  }
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {/* Hydrates Zustand store BEFORE first paint — zero auth flicker */}
        <SessionStoreInitializer user={user} profile={profile} />

        <ReactQueryProvider>
          <ThemeProvider>
            {/* Global confirm modal system — available everywhere via useConfirm() */}
            <ConfirmProvider>
              {children}
              <Toaster />
            </ConfirmProvider>
          </ThemeProvider>
        </ReactQueryProvider>

        <Analytics />
      </body>
    </html>
  )
}
