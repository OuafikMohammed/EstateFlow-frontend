"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"

interface ConversionChartProps {
  conversionRate: number
  totalLeads: number
  closedWonLeads: number
}

export function ConversionChart({ conversionRate, totalLeads, closedWonLeads }: ConversionChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <h2 className="text-lg font-semibold text-[var(--color-text-light)] mb-6">Conversion Rate</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Conversion Rate */}
        <div className="bg-[var(--color-bg-card)] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--color-muted-foreground)]">Overall Rate</span>
            <div className="flex items-center gap-1 text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">{conversionRate}%</span>
            </div>
          </div>
          <div className="relative w-full bg-[var(--color-border)] rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${conversionRate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[var(--color-primary-gold)] to-green-500"
            ></motion.div>
          </div>
        </div>

        {/* Total Leads */}
        <div className="bg-[var(--color-bg-card)] rounded-lg p-6">
          <p className="text-sm text-[var(--color-muted-foreground)] mb-2">Total Leads</p>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-[var(--color-primary-gold)]"
          >
            {totalLeads}
          </motion.div>
        </div>

        {/* Closed Won */}
        <div className="bg-[var(--color-bg-card)] rounded-lg p-6">
          <p className="text-sm text-[var(--color-muted-foreground)] mb-2">Closed Won</p>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-[var(--color-success)]"
          >
            {closedWonLeads}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
