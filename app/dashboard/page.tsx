"use client"

import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ChartSection } from "@/components/dashboard/chart-section"
import { RecentLeadsTable } from "@/components/dashboard/recent-leads-table"
import { Building2, Users, TrendingUp, Wallet } from "lucide-react"
import { useDashboardStats } from "@/hooks/use-data"

interface DashboardStats {
  total_properties: number
  new_leads: number
  properties_sold: number
  total_revenue: number
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats() as { data: DashboardStats; isLoading: boolean }

  const displayStats = [
    {
      title: "Total Properties",
      value: stats?.total_properties || 0,
      subtitle: "Active Listings",
      icon: Building2,
      trend: { value: 12, isPositive: true },
      gradient: "from-[var(--color-brand-green)] to-[var(--color-success)]",
    },
    {
      title: "New Leads",
      value: stats?.new_leads || 0,
      subtitle: "This Week",
      icon: Users,
      trend: { value: 8, isPositive: true },
      gradient: "from-[var(--color-bg-dark)] to-[var(--color-primary-gold)]",
    },
    {
      title: "Properties Sold",
      value: stats?.properties_sold || 0,
      subtitle: "This Month",
      icon: TrendingUp,
      trend: { value: 3, isPositive: true },
      gradient: "from-[var(--color-bg-dark)] to-[var(--color-success)]",
    },
    {
      title: "Revenue",
      value: `${(stats?.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} DH`,
      subtitle: "Total Commissions",
      icon: Wallet,
      trend: { value: 15, isPositive: true },
      gradient: "from-[var(--color-bg-dark)] to-[var(--color-accent)]",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-[var(--color-text-light)] mb-2">Dashboard</h1>
          <p className="text-[var(--color-muted-foreground)]">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {displayStats.map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <ChartSection />

        {/* Recent Leads */}
        <RecentLeadsTable />
      </div>
    </DashboardLayout>
  )
}
