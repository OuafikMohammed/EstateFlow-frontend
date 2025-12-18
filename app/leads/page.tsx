"use client"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LeadsTable } from "@/components/lead/leads-table"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Users, UserCheck, UserX, CheckCircle2 } from "lucide-react"

export default function LeadsPage() {
  const stats = [
    {
      title: "Total Leads",
      value: 156,
      subtitle: "All Time",
      icon: Users,
      gradient: "from-[var(--color-bg-dark)] to-[var(--color-primary-gold)]",
    },
    {
      title: "New",
      value: 23,
      subtitle: "Uncontacted",
      icon: UserCheck,
      gradient: "from-[var(--color-bg-dark)] to-[var(--color-danger)]",
    },
    {
      title: "In Progress",
      value: 45,
      subtitle: "Being Contacted",
      icon: UserX,
      gradient: "from-[var(--color-bg-dark)] to-yellow-500",
    },
    {
      title: "Closed Won",
      value: 12,
      subtitle: "This Month",
      icon: CheckCircle2,
      gradient: "from-[var(--color-bg-dark)] to-[var(--color-success)]",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-[var(--color-text-light)] mb-2">Leads Management</h1>
          <p className="text-[var(--color-muted-foreground)]">Track and manage your property leads</p>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
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
