"use client"

import { motion } from "framer-motion"
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: number | string
  subtitle: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  gradient?: string
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, gradient }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, rotateY: 2 }}
      className="glass rounded-xl p-6 relative overflow-hidden group cursor-pointer"
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient || "from-[var(--color-bg-dark)] to-[var(--color-bg-card)]"} opacity-50 group-hover:opacity-70 transition-opacity`}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-card)] flex items-center justify-center">
            <Icon className="w-6 h-6" style={{ color: "var(--color-primary-gold)" }} />
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${trend.isPositive ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}
            >
              {trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {trend.value}%
            </div>
          )}
        </div>

        <h3 className="text-3xl font-serif font-bold text-[var(--color-text-light)] mb-1">
          {typeof value === "number" ? value.toLocaleString() : value}
        </h3>
        <p className="text-sm text-[var(--color-muted-foreground)]">{subtitle}</p>
        <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{title}</p>
      </div>
    </motion.div>
  )
}
