"use client"

import { useDashboardStats } from "@/hooks/use-data"
import { motion } from "framer-motion"

export function LeadsStatsChart() {
  const { data } = useDashboardStats() as any
  const statsData = data || {}

  const chartData = [
    {
      label: "Not Contacted",
      value: statsData?.not_contacted_leads || 0,
      color: "bg-red-500",
      percentage: statsData?.total_leads ? Math.round((statsData.not_contacted_leads / statsData.total_leads) * 100) : 0,
    },
    {
      label: "Contacted",
      value: statsData?.contacted_leads || 0,
      color: "bg-yellow-500",
      percentage: statsData?.total_leads ? Math.round((statsData.contacted_leads / statsData.total_leads) * 100) : 0,
    },
    {
      label: "Closed Won",
      value: statsData?.closed_won_leads || 0,
      color: "bg-green-500",
      percentage: statsData?.total_leads ? Math.round((statsData.closed_won_leads / statsData.total_leads) * 100) : 0,
    },
  ]

  const totalLeads = statsData?.total_leads || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <h2 className="text-lg font-semibold text-[var(--color-text-light)] mb-6">Leads Distribution</h2>

      <div className="space-y-6">
        {chartData.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="text-sm text-[var(--color-muted-foreground)]">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-[var(--color-text-light)]">
                {item.value} ({item.percentage}%)
              </span>
            </div>
            <div className="w-full bg-[var(--color-bg-card)] rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                className={`h-full ${item.color}`}
              ></motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
        <div className="flex justify-between items-center">
          <span className="text-sm text-[var(--color-muted-foreground)]">Total Leads</span>
          <span className="text-2xl font-bold text-[var(--color-primary-gold)]">{totalLeads}</span>
        </div>
      </div>
    </motion.div>
  )
}
