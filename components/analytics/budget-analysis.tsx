"use client"

import { motion } from "framer-motion"
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react"

interface BudgetAnalysisProps {
  data: {
    avg_budget_min: number | null
    avg_budget_max: number | null
  }
}

export function BudgetAnalysis({ data }: BudgetAnalysisProps) {
  const formatCurrency = (value: number | null) => {
    if (!value) return "$0"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const avgBudgetMin = data.avg_budget_min ?? 0
  const avgBudgetMax = data.avg_budget_max ?? 0
  const avgBudgetRange = avgBudgetMax - avgBudgetMin

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-xl p-6"
    >
      <h2 className="text-lg font-semibold text-[var(--color-text-light)] mb-6">Budget Analysis</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Average Minimum Budget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-[var(--color-bg-card)] rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--color-muted-foreground)]">Avg Min Budget</span>
            <TrendingDown className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-500 mb-2">
            {formatCurrency(avgBudgetMin)}
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Minimum budget range
          </p>
        </motion.div>

        {/* Average Maximum Budget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[var(--color-bg-card)] rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--color-muted-foreground)]">Avg Max Budget</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-500 mb-2">
            {formatCurrency(avgBudgetMax)}
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Maximum budget range
          </p>
        </motion.div>

        {/* Budget Range */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
          className="bg-[var(--color-bg-card)] rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--color-muted-foreground)]">Avg Range</span>
            <DollarSign className="w-4 h-4 text-[var(--color-primary-gold)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--color-primary-gold)] mb-2">
            {formatCurrency(avgBudgetRange)}
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Difference between min & max
          </p>
        </motion.div>
      </div>

      {/* Budget Range Visualization */}
      <div className="mt-6 bg-[var(--color-bg-card)] rounded-lg p-6">
        <p className="text-sm text-[var(--color-text-light)] mb-4 font-medium">Budget Distribution</p>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--color-muted-foreground)]">Minimum</span>
              <span className="text-sm font-semibold text-blue-500">{formatCurrency(avgBudgetMin)}</span>
            </div>
            <div className="relative w-full bg-[var(--color-border)] rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--color-muted-foreground)]">Maximum</span>
              <span className="text-sm font-semibold text-green-500">{formatCurrency(avgBudgetMax)}</span>
            </div>
            <div className="relative w-full bg-[var(--color-border)] rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-green-500 to-green-600"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
