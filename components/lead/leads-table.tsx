"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Phone, Mail, MessageCircle, Trash2, Search } from "lucide-react"

const leadsData = [
  {
    id: 1,
    name: "Sarah Mohammed",
    property: "Modern 3BR Apartment",
    propertyImage: "/modern-city-apartment.png",
    phone: "+212 600 111222",
    email: "sarah@example.com",
    status: "New",
    date: "2024-12-10",
  },
  {
    id: 2,
    name: "Karim Alaoui",
    property: "Luxury Villa with Sea View",
    propertyImage: "/luxurious-villa.png",
    phone: "+212 600 333444",
    email: "karim@example.com",
    status: "Contacted",
    date: "2024-12-09",
  },
  {
    id: 3,
    name: "Fatima Benali",
    property: "Commercial Space Downtown",
    propertyImage: "/modern-office-commercial.png",
    phone: "+212 600 555666",
    email: "fatima@example.com",
    status: "Qualified",
    date: "2024-12-08",
  },
  {
    id: 4,
    name: "Omar Tazi",
    property: "Penthouse with Panoramic Views",
    propertyImage: "/luxurious-city-penthouse.png",
    phone: "+212 600 777888",
    email: "omar@example.com",
    status: "New",
    date: "2024-12-07",
  },
]

export function LeadsTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-[var(--color-danger)] text-white"
      case "Contacted":
        return "bg-yellow-500 text-white"
      case "Qualified":
        return "bg-[var(--color-success)] text-white"
      case "Closed Won":
        return "bg-[var(--color-brand-green)] text-white"
      case "Closed Lost":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <div className="glass rounded-xl p-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48 bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="won">Closed Won</SelectItem>
            <SelectItem value="lost">Closed Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-light)]">Client</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-light)]">Property</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-light)]">Contact</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-light)]">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-light)]">Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-light)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leadsData.map((lead, index) => (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-card)] transition-colors group"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] flex items-center justify-center">
                      <span className="text-sm font-bold text-[var(--color-bg-dark)]">
                        {lead.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--color-text-light)]">{lead.name}</p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">{lead.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={lead.propertyImage || "/placeholder.svg"}
                      alt={lead.property}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <span className="text-[var(--color-text-light)] text-sm">{lead.property}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-[var(--color-muted-foreground)] text-sm">{lead.phone}</p>
                </td>
                <td className="py-4 px-4">
                  <Select defaultValue={lead.status.toLowerCase()}>
                    <SelectTrigger className="w-32 bg-transparent border-0 p-0">
                      <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="closed won">Closed Won</SelectItem>
                      <SelectItem value="closed lost">Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-4 px-4 text-[var(--color-muted-foreground)] text-sm">{lead.date}</td>
                <td className="py-4 px-4">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="text-[var(--color-text-light)] h-8 w-8">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-[var(--color-text-light)] h-8 w-8">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-[var(--color-text-light)] h-8 w-8">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-[var(--color-success)] h-8 w-8">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-[var(--color-danger)] h-8 w-8">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
