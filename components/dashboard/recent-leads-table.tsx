"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Phone, Loader2, ArrowRight, Mail } from "lucide-react"
import { useRecentLeads } from "@/hooks/use-data"
import Link from "next/link"

export function RecentLeadsTable() {
  const { data: leads = [], isLoading } = useRecentLeads(5)

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "bg-blue-500/20 text-blue-500 border border-blue-500/30"
      case "contacted":
        return "bg-yellow-500/20 text-yellow-600 border border-yellow-500/30"
      case "qualified":
        return "bg-[var(--color-success)]/20 text-green-500 border border-green-500/30"
      case "proposal_sent":
        return "bg-cyan-500/20 text-cyan-500 border border-cyan-500/30"
      case "closed_won":
        return "bg-green-500/20 text-green-600 border border-green-500/30"
      case "closed_lost":
        return "bg-red-500/20 text-red-500 border border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-500 border border-gray-500/30"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass rounded-xl overflow-hidden border border-[var(--color-border)]/30"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--color-bg-card)]/50 to-transparent p-6 border-b border-[var(--color-border)]/30">
        <h2 className="text-lg font-bold text-[var(--color-text-light)]">Recent Leads Added</h2>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">Latest clients signed up in the system</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
            <Loader2 className="w-6 h-6 text-[var(--color-primary-gold)]" />
          </motion.div>
        </div>
      ) : leads.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]/30 bg-[var(--color-bg-card)]/20">
                <th className="text-left py-4 px-6 text-sm font-bold text-[var(--color-text-light)] uppercase tracking-wide">Name</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-[var(--color-text-light)] uppercase tracking-wide">Email</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-[var(--color-text-light)] uppercase tracking-wide">Phone</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-[var(--color-text-light)] uppercase tracking-wide">Status</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-[var(--color-text-light)] uppercase tracking-wide">Date</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-[var(--color-text-light)] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, index) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-[var(--color-border)]/20 hover:bg-[var(--color-bg-card)]/50 transition-all duration-200 group"
                >
                    <td className="py-4 px-6">
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="text-[var(--color-text-light)] font-medium group-hover:text-[var(--color-primary-gold)] transition-colors"
                      >
                        {`${lead.first_name} ${lead.last_name}`}
                      </motion.div>
                    </td>
                    <td className="py-4 px-6">
                      <a 
                        href={`mailto:${lead.email}`}
                        className="text-[var(--color-muted-foreground)] hover:text-blue-500 transition-colors flex items-center gap-2"
                      >
                        {lead.email ? (
                          <>
                            <Mail className="w-4 h-4" />
                            {lead.email}
                          </>
                        ) : "—"}
                      </a>
                    </td>
                    <td className="py-4 px-6">
                      <a 
                        href={`tel:${lead.phone}`}
                        className="text-[var(--color-muted-foreground)] hover:text-green-500 transition-colors flex items-center gap-2"
                      >
                        {lead.phone ? (
                          <>
                            <Phone className="w-4 h-4" />
                            {lead.phone}
                          </>
                        ) : "—"}
                      </a>
                    </td>
                    <td className="py-4 px-6">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Badge className={`${getStatusColor(lead.status)} font-medium px-3 py-1`}>
                          {lead.status?.replace(/_/g, " ").charAt(0).toUpperCase() + lead.status?.slice(1).toLowerCase().replace(/_/g, " ")}
                        </Badge>
                      </motion.div>
                    </td>
                    <td className="py-4 px-6 text-[var(--color-muted-foreground)] text-sm">
                      {lead.created_at 
                        ? new Date(lead.created_at).toLocaleDateString('ar-SA', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : "—"}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/leads/${lead.id}`}>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold)]/10"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        </Link>
                        {lead.phone && (
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <a href={`tel:${lead.phone}`}>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-green-500 hover:bg-green-500/10"
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                            </a>
                          </motion.div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-[var(--color-muted-foreground)]">No leads available</p>
        </motion.div>
      )}

      {/* Footer */}
      {leads.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-[var(--color-bg-card)]/30 to-transparent px-6 py-4 border-t border-[var(--color-border)]/30 flex justify-between items-center"
        >
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Showing latest {leads.length} leads
          </p>
          <Link href="/leads">
            <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                className="text-[var(--color-primary-gold)] border-[var(--color-primary-gold)]/30 hover:border-[var(--color-primary-gold)]/60 gap-2"
              >
                View All Leads
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      )}
    </motion.div>
  )
}
