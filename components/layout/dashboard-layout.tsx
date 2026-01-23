"use client"

import type { ReactNode } from "react"
import dynamic from "next/dynamic"
import { Sidebar } from "./sidebar"

const Navbar = dynamic(() => import("./navbar").then((mod) => ({ default: mod.Navbar })), {
  ssr: false,
})

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
