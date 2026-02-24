"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LeadsTable } from "@/components/lead/leads-table"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, UserX, CheckCircle2, Plus } from "lucide-react"
import { useDashboardStats } from "@/hooks/use-data"

export default function LeadsPage() {
  const { data } = useDashboardStats()
  const stats = data || {}
  const displayStats = [
    {
      title: "Total Leads",
      value: stats?.total_leads || 0,
      subtitle: "All Time",
      icon: Users,
      gradient: "from-[var(--color-bg-dark)] to-[var(--color-primary-gold)]",
    },
    {
      title: "Not Contacted",
      value: stats?.not_contacted_leads || 0,
      subtitle: "Uncontacted",
      icon: UserX,
      gradient: "from-[var(--color-bg-dark)] to-[var(--color-danger)]",
    },
    {
      title: "Contacted",
      value: stats?.contacted_leads || 0,
      subtitle: "Being Engaged",
      icon: UserCheck,
      gradient: "from-[var(--color-bg-dark)] to-yellow-500",
    },
    {
      title: "Deal Made",
      value: stats?.closed_won_leads || 0,
      subtitle: "Closed Won",
      icon: CheckCircle2,
      gradient: "from-[var(--color-bg-dark)] to-[var(--color-success)]",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[var(--color-text-light)] mb-2">Leads Management</h1>
            <p className="text-[var(--color-muted-foreground)]">Track and manage your property leads</p>
          </div>
          <Link href="/leads/new">
            <Button className="bg-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold)]/90 text-black font-semibold gap-2">
              <Plus className="w-5 h-5" />
              Create Lead
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {displayStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Leads Table */}
        <LeadsTable />
      </div>
    </DashboardLayout>
  )
}
