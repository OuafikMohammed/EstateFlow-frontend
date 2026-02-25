'use client'
// components/ui/stat-card.tsx
// Animated metric card for dashboards — glowing hover, spring lift, count-up numbers
// Usage: <StatCard title="Properties" value={42} delta={+12} icon={Home} color="gold" />

import { memo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  delta?: number
  deltaLabel?: string
  icon: LucideIcon
  color?: 'gold' | 'green' | 'red' | 'purple' | 'blue'
  loading?: boolean
}

const colorMap = {
  gold: {
    iconBg: 'bg-[var(--color-primary-gold)]/10',
    iconColor: 'text-[var(--color-primary-gold)]',
    hoverGlow: 'hover:shadow-[0_4px_32px_rgba(197,160,89,0.2)]',
    hoverBorder: 'hover:border-[var(--color-primary-gold)]/25',
  },
  green: {
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    hoverGlow: 'hover:shadow-[0_4px_32px_rgba(52,211,153,0.2)]',
    hoverBorder: 'hover:border-emerald-500/25',
  },
  red: {
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    hoverGlow: 'hover:shadow-[0_4px_32px_rgba(239,68,68,0.2)]',
    hoverBorder: 'hover:border-red-500/25',
  },
  purple: {
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    hoverGlow: 'hover:shadow-[0_4px_32px_rgba(168,85,247,0.2)]',
    hoverBorder: 'hover:border-purple-500/25',
  },
  blue: {
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    hoverGlow: 'hover:shadow-[0_4px_32px_rgba(59,130,246,0.2)]',
    hoverBorder: 'hover:border-blue-500/25',
  },
}

function DeltaBadge({ delta, label }: { delta?: number; label?: string }) {
  if (delta === undefined) return null
  const positive = delta > 0
  const neutral = delta === 0
  const Icon = neutral ? Minus : positive ? TrendingUp : TrendingDown
  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
        positive && 'bg-emerald-500/10 text-emerald-400',
        !positive && !neutral && 'bg-red-500/10 text-red-400',
        neutral && 'bg-white/5 text-muted-foreground'
      )}
    >
      <Icon className="w-3 h-3" />
      {positive ? '+' : ''}{delta}%
      {label && <span className="opacity-70">{label}</span>}
    </div>
  )
}

export const StatCard = memo(function StatCard({
  title,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  color = 'gold',
  loading = false,
}: StatCardProps) {
  const c = colorMap[color]

  if (loading) {
    return (
      <div className="glass rounded-xl p-6 border border-white/5 space-y-4">
        <div className="flex justify-between">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
        <div className="skeleton h-9 w-28 rounded-lg" />
        <div className="skeleton h-4 w-36 rounded-md" />
      </div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn(
        'glass rounded-xl p-6 border border-white/5 cursor-default',
        'transition-all duration-300',
        c.hoverGlow,
        c.hoverBorder
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-xl', c.iconBg)}>
          <Icon className={cn('w-5 h-5', c.iconColor)} />
        </div>
        <DeltaBadge delta={delta} label={deltaLabel} />
      </div>

      <p className="text-3xl font-bold font-serif text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
    </motion.div>
  )
})
