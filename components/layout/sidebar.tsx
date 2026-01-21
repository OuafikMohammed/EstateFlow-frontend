"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Home, Users, BarChart3, SettingsIcon, Menu, X, Calendar, UserCheck } from "lucide-react"
import { ProfileCard } from "./profile-card"

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Home, label: "Properties", href: "/properties" },
    { icon: Users, label: "Leads", href: "/leads" },
    { icon: UserCheck, label: "Clients", href: "/clients" },
    { icon: Calendar, label: "Showings", href: "/showings" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: SettingsIcon, label: "Settings", href: "/settings" },
  ]

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden text-[var(--color-text-light)]"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isCollapsed ? -280 : 0,
          width: isCollapsed ? 0 : 280,
        }}
        transition={{ duration: 0.3 }}
        className={`fixed lg:relative h-screen glass border-r border-[var(--color-border)] z-40 ${
          isCollapsed ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="flex flex-col w-[280px] p-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center mb-8">
            <Image 
              src="/estateflow-logo.png" 
              alt="EstateFlow" 
              width={157} 
              height={40}
              className="h-8 sm:h-10 w-auto"
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] text-[var(--color-bg-dark)] shadow-lg"
                        : "text-[var(--color-text-light)] hover:bg-[var(--color-bg-card)]"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 w-1 h-8 bg-[var(--color-primary-gold)] rounded-r"
                      />
                    )}
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* User Profile Card */}
          <ProfileCard />
        </div>
      </motion.aside>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsCollapsed(true)} />
      )}
    </>
  )
}
