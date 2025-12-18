"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Phone } from "lucide-react"

const leads = [
  {
    id: 1,
    name: "Sarah Mohammed",
    property: "Modern 3BR Apartment",
    phone: "+212 600 111222",
    status: "New",
    date: "2024-12-10",
  },
  {
    id: 2,
    name: "Karim Alaoui",
    property: "Luxury Villa",
    phone: "+212 600 333444",
    status: "Contacted",
    date: "2024-12-09",
  },
  {
    id: 3,
    name: "Fatima Benali",
    property: "Commercial Space",
    phone: "+212 600 555666",
    status: "Qualified",
    date: "2024-12-08",
  },
]

export function RecentLeadsTable() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-[var(--color-danger)] text-white"
      case "Contacted":
        return "bg-yellow-500 text-white"
      case "Qualified":
        return "bg-[var(--color-success)] text-white"
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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-light)]">Client Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-light)]">Property</th>
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
                <td className="py-4 px-4 text-[var(--color-text-light)]">{lead.name}</td>
                <td className="py-4 px-4 text-[var(--color-text-light)]">{lead.property}</td>
                <td className="py-4 px-4 text-[var(--color-muted-foreground)]">{lead.phone}</td>
                <td className="py-4 px-4">
                  <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                </td>
                <td className="py-4 px-4 text-[var(--color-muted-foreground)]">{lead.date}</td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-[var(--color-text-light)]">
                      <Eye className="w-4 h-4" />
                    </Button>
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
    </motion.div>
  )
}
