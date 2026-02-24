"use client"

import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ChartSection } from "@/components/dashboard/chart-section"
import { LeadsStatsChart } from "@/components/dashboard/leads-stats-chart"
import { RecentLeadsTable } from "@/components/dashboard/recent-leads-table"
import { Building2, Users, TrendingUp, Wallet, ArrowRight } from "lucide-react"
import { useDashboardStats } from "@/hooks/use-data"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface DashboardStats {
  total_properties: number
  not_contacted_leads: number
  properties_sold: number
  total_revenue: number
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboardStats() as { data: any; isLoading: boolean }
  const stats = data || {}
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
      value: stats?.not_contacted_leads || 0,
      subtitle: "Awaiting Contact",
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
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      }
    },
  }

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  }

  return (
    <DashboardLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8 pb-8"
      >
        {/* Header Section */}
        <motion.div variants={headerVariants} className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-[var(--color-text-light)] mb-2">
              Dashboard
            </h1>
            <p className="text-[var(--color-muted-foreground)] text-lg">
              Welcome back! Here's a summary of your business performance today.
            </p>
          </div>
        </motion.div>

        {/* Quick Stats Cards */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {displayStats.map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Analytics Section Divider */}
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-[var(--color-border)] to-transparent"></div>
          <h2 className="text-lg font-semibold text-[var(--color-text-light)]">
            Performance Analytics
          </h2>
          <div className="flex-1 h-px bg-gradient-to-l from-[var(--color-border)] to-transparent"></div>
        </motion.div>

        {/* Charts Grid - Optimized Layout */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Chart - Takes 2 columns */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <ChartSection />
          </motion.div>

          {/* Lead Stats - Takes 1 column */}
          <motion.div variants={itemVariants}>
            <LeadsStatsChart />
          </motion.div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-light)]">
                Recent Activity
              </h2>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                Latest leads and properties added
              </p>
            </div>
            <Link href="/leads">
              <Button
                variant="ghost"
                className="text-[var(--color-primary-gold)] hover:text-[var(--color-accent)] gap-2"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <RecentLeadsTable />
        </motion.div>

        {/* Quick Actions Footer */}
        <motion.div variants={itemVariants} className="pt-4">
          <div className="glass rounded-xl p-6 border border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-text-light)] mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link href="/leads/new">
                <Button 
                  variant="outline" 
                  className="w-full justify-center hover:bg-blue-500/10 hover:text-blue-500 border-[var(--color-border)]"
                >
                  Add New Lead
                </Button>
              </Link>
              <Link href="/properties/new">
                <Button 
                  variant="outline" 
                  className="w-full justify-center hover:bg-green-500/10 hover:text-green-500 border-[var(--color-border)]"
                >
                  Add New Property
                </Button>
              </Link>
              <Link href="/showings/new">
                <Button 
                  variant="outline" 
                  className="w-full justify-center hover:bg-yellow-500/10 hover:text-yellow-500 border-[var(--color-border)]"
                >
                  Schedule Showing
                </Button>
              </Link>
              <Link href="/analytics">
                <Button 
                  variant="outline" 
                  className="w-full justify-center hover:bg-purple-500/10 hover:text-purple-500 border-[var(--color-border)]"
                >
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
