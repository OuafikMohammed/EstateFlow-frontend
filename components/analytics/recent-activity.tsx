"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Phone, Home } from "lucide-react"

interface RecentActivityProps {
  leads: Array<{
    id: string
    name: string
    email?: string
    phone?: string
    status: string
    created_at?: string
  }>
  properties: Array<{
    id: string
    title: string
    property_type: string
    price?: number
    status: string
    created_at?: string
  }>
}

export function RecentActivity({ leads, properties }: RecentActivityProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const formatCurrency = (value?: number) => {
    if (!value) return ""
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass rounded-xl p-6"
    >
      <h2 className="text-lg font-semibold text-[var(--color-text-light)] mb-6">Recent Activity</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-light)] mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-500" />
            Recent Leads
          </h3>

          <div className="space-y-3">
            {leads && leads.length > 0 ? (
              leads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + index * 0.05 }}
                  className="bg-[var(--color-bg-card)] rounded-lg p-4 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/leads/${lead.id}`}>
                        <p className="font-medium text-[var(--color-text-light)] group-hover:text-[var(--color-primary-gold)] transition-colors">
                          {lead.name}
                        </p>
                      </Link>
                      {lead.email && (
                        <p className="text-xs text-[var(--color-muted-foreground)] truncate">
                          {lead.email}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-500">
                          {lead.status}
                        </span>
                        {lead.created_at && (
                          <span className="text-xs text-[var(--color-muted-foreground)]">
                            {formatDate(lead.created_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--color-muted-foreground)] group-hover:text-[var(--color-primary-gold)] transition-colors" />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-[var(--color-muted-foreground)]">
                <p className="text-sm">No leads yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Properties */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-light)] mb-4 flex items-center gap-2">
            <Home className="w-4 h-4 text-green-500" />
            Recent Properties
          </h3>

          <div className="space-y-3">
            {properties && properties.length > 0 ? (
              properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="bg-[var(--color-bg-card)] rounded-lg p-4 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/properties/${property.id}`}>
                        <p className="font-medium text-[var(--color-text-light)] group-hover:text-[var(--color-primary-gold)] transition-colors line-clamp-1">
                          {property.title}
                        </p>
                      </Link>
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                        {property.property_type}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-500">
                          {property.status}
                        </span>
                        {property.price && (
                          <span className="text-xs font-semibold text-[var(--color-primary-gold)]">
                            {formatCurrency(property.price)}
                          </span>
                        )}
                      </div>
                      {property.created_at && (
                        <p className="text-xs text-[var(--color-muted-foreground)] mt-2">
                          {formatDate(property.created_at)}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--color-muted-foreground)] group-hover:text-[var(--color-primary-gold)] transition-colors" />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-[var(--color-muted-foreground)]">
                <p className="text-sm">No properties yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
