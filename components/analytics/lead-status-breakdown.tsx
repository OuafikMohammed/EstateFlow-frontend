"use client"

import { motion } from "framer-motion"
import { AlertCircle, Phone, FileCheck, CheckCircle2, XCircle, Clock, Eye } from "lucide-react"

interface LeadStatusBreakdownProps {
  data: {
    new: number
    contacted: number
    qualified: number
    proposal_sent: number
    negotiating: number
    closed_won: number
    closed_lost: number
  }
}

const STATUS_CONFIG = [
  { key: "new" as const, label: "New", icon: AlertCircle, color: "from-blue-500 to-blue-600", textColor: "text-blue-500" },
  { key: "contacted" as const, label: "Contacted", icon: Phone, color: "from-yellow-500 to-yellow-600", textColor: "text-yellow-500" },
  { key: "qualified" as const, label: "Qualified", icon: Eye, color: "from-purple-500 to-purple-600", textColor: "text-purple-500" },
  { key: "proposal_sent" as const, label: "Proposal Sent", icon: FileCheck, color: "from-cyan-500 to-cyan-600", textColor: "text-cyan-500" },
  { key: "negotiating" as const, label: "Negotiating", icon: Clock, color: "from-orange-500 to-orange-600", textColor: "text-orange-500" },
  { key: "closed_won" as const, label: "Closed Won", icon: CheckCircle2, color: "from-green-500 to-green-600", textColor: "text-green-500" },
  { key: "closed_lost" as const, label: "Closed Lost", icon: XCircle, color: "from-red-500 to-red-600", textColor: "text-red-500" },
]

export function LeadStatusBreakdown({ data }: LeadStatusBreakdownProps) {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-xl p-6"
    >
      <h2 className="text-lg font-semibold text-[var(--color-text-light)] mb-6">Lead Status Breakdown</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUS_CONFIG.map(({ key, label, icon: Icon, color, textColor }, index) => {
          const count = data[key]
          const percentage = total > 0 ? (count / total) * 100 : 0

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="bg-[var(--color-bg-card)] rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`rounded-lg p-2 bg-gradient-to-br ${color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted-foreground)]">{label}</p>
                  <p className={`text-xl font-bold ${textColor}`}>{count}</p>
                </div>
              </div>
              
              <div className="w-full bg-[var(--color-border)] rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 + index * 0.05 }}
                  className={`h-full bg-gradient-to-r ${color}`}
                />
              </div>
              
              <p className="text-xs text-[var(--color-muted-foreground)] mt-2">
                {percentage.toFixed(1)}% of total
              </p>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
