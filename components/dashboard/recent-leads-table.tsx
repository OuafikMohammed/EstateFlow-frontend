"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Phone, Loader2 } from "lucide-react"
import { useRecentLeads } from "@/hooks/use-data"
import Link from "next/link"

export function RecentLeadsTable() {
  const { data: leads = [], isLoading } = useRecentLeads(5)

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "bg-[var(--color-danger)] text-white"
      case "contacted":
        return "bg-yellow-500 text-white"
      case "qualified":
        return "bg-[var(--color-success)] text-white"
      case "closed_won":
        return "bg-[var(--color-brand-green)] text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass rounded-xl p-6"
    >
      <h2 className="text-xl font-serif font-bold text-[var(--color-text-light)] mb-6">Recent Leads</h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary-gold)]" />
        </div>
      ) : leads.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-light)]">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-light)]">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-light)]">Phone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-light)]">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-light)]">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-light)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, index) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-card)] transition-colors"
                >
                  <td className="py-4 px-4 text-[var(--color-text-light)]">{`${lead.first_name} ${lead.last_name}`}</td>
                  <td className="py-4 px-4 text-[var(--color-text-light)]">{lead.email || "—"}</td>
                  <td className="py-4 px-4 text-[var(--color-muted-foreground)]">{lead.phone || "—"}</td>
                  <td className="py-4 px-4">
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status?.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-[var(--color-muted-foreground)]">
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <Link href={`/leads/${lead.id}`}>
                        <Button variant="ghost" size="icon" className="text-[var(--color-text-light)]">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="text-[var(--color-text-light)]">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-[var(--color-muted-foreground)] text-center py-8">No recent leads</p>
      )}

      <div className="mt-6 text-center">
        <Link href="/leads">
          <Button variant="outline" className="text-[var(--color-primary-gold)]">
            View All Leads
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
