"use client"

import { motion } from "framer-motion"
import { Home, Building2, Hammer, TreePine, Layers } from "lucide-react"

interface PropertyMetricsProps {
  data: {
    total_properties: number
    property_types: {
      house: number
      condo: number
      townhouse: number
      commercial: number
      land: number
      multi_family: number
    }
    property_status: {
      available: number
      under_contract: number
      sold: number
      expired: number
      withdrawn: number
    }
  }
}

const PROPERTY_TYPES = [
  { key: "house" as const, label: "House", icon: Home, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { key: "condo" as const, label: "Condo", icon: Building2, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { key: "townhouse" as const, label: "Townhouse", icon: Hammer, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  { key: "commercial" as const, label: "Commercial", icon: Layers, color: "text-green-500", bgColor: "bg-green-500/10" },
  { key: "land" as const, label: "Land", icon: TreePine, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  { key: "multi_family" as const, label: "Multi-Family", icon: Building2, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
]

const STATUS_CONFIG = [
  { key: "available" as const, label: "Available", color: "from-green-500 to-green-600" },
  { key: "under_contract" as const, label: "Under Contract", color: "from-yellow-500 to-yellow-600" },
  { key: "sold" as const, label: "Sold", color: "from-blue-500 to-blue-600" },
  { key: "expired" as const, label: "Expired", color: "from-red-500 to-red-600" },
  { key: "withdrawn" as const, label: "Withdrawn", color: "from-gray-500 to-gray-600" },
]

export function PropertyMetrics({ data }: PropertyMetricsProps) {
  const typeTotal = Object.values(data.property_types).reduce((sum, val) => sum + val, 0)
  const statusTotal = Object.values(data.property_status).reduce((sum, val) => sum + val, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6"
    >
      {/* Property Types */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-light)]">Property Types</h2>
          <span className="text-2xl font-bold text-[var(--color-primary-gold)]">{data.total_properties}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {PROPERTY_TYPES.map(({ key, label, icon: Icon, color, bgColor }, index) => {
            const count = data.property_types[key]
            const percentage = typeTotal > 0 ? (count / typeTotal) * 100 : 0

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + index * 0.05 }}
                className={`${bgColor} rounded-lg p-4 text-center hover:shadow-lg transition-shadow`}
              >
                <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                <p className="text-xs font-medium text-[var(--color-text-light)] mb-2">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{count}</p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                  {percentage.toFixed(0)}%
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Property Status */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-light)] mb-6">Property Status</h2>

        <div className="space-y-4">
          {STATUS_CONFIG.map(({ key, label, color }, index) => {
            const count = data.property_status[key]
            const percentage = statusTotal > 0 ? (count / statusTotal) * 100 : 0

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-[var(--color-text-light)]">{label}</label>
                  <span className="text-sm font-semibold text-[var(--color-primary-gold)]">{count}</span>
                </div>
                <div className="relative w-full bg-[var(--color-border)] rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 + index * 0.05 }}
                    className={`h-full bg-gradient-to-r ${color}`}
                  />
                </div>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                  {percentage.toFixed(1)}%
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
