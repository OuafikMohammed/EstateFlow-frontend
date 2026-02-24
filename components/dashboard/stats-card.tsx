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
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="glass rounded-xl p-6 relative overflow-hidden group cursor-pointer border border-[var(--color-border)]/30 hover:border-[var(--color-border)]/60 transition-all duration-300"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
      }}
    >
      {/* Animated Gradient Background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradient || "from-[var(--color-bg-dark)] to-[var(--color-bg-card)]"} opacity-20 group-hover:opacity-40 transition-opacity duration-300`}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10"
        animate={{
          x: ["100%", "-100%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary-gold)]/20 to-[var(--color-accent)]/20 flex items-center justify-center border border-[var(--color-primary-gold)]/30 group-hover:border-[var(--color-primary-gold)]/60 transition-colors"
          >
            <Icon className="w-6 h-6 text-[var(--color-primary-gold)]" />
          </motion.div>
          {trend && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full bg-${trend.isPositive ? "green" : "red"}-500/10 ${trend.isPositive ? "text-green-500" : "text-red-500"}`}
            >
              {trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {trend.value}%
            </motion.div>
          )}
        </div>

        <motion.h3 
          className="text-3xl font-bold text-[var(--color-text-light)] mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {typeof value === "number" ? value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : value}
        </motion.h3>
        
        <motion.p 
          className="text-sm font-medium text-[var(--color-muted-foreground)] group-hover:text-[var(--color-text-light)]/70 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {subtitle}
        </motion.p>
        
        <motion.p 
          className="text-xs text-[var(--color-text-light)]/50 mt-3 group-hover:text-[var(--color-primary-gold)]/70 transition-colors font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.p>
      </div>
    </motion.div>
  )
}
