"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Phone, Mail, MessageCircle, Trash2, Search, Loader2, Download } from "lucide-react"
import { useLeads, useDeleteLead } from "@/hooks/use-data"
import { LeadStatus } from "@/lib/types/database"

export function LeadsTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      // Reset to page 1 when search changes
      setPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch leads from API
  const { data: leadsData, isLoading, error } = useLeads({
    page,
    limit: 10,
    status: statusFilter !== "all" ? (statusFilter as LeadStatus) : undefined,
    searchQuery: debouncedSearch || undefined,
  })

  const deleteLead = useDeleteLead()

  const leads = leadsData?.items || []
  const total = leadsData?.total || 0
  const pages = leadsData?.pages || 0

  const exportToExcel = () => {
    if (!leads.length) return

    // Prepare CSV content
    const headers = ["First Name", "Last Name", "Email", "Phone", "Status", "Budget Min", "Budget Max", "Created Date"]
    const rows = leads.map(lead => [
      lead.first_name,
      lead.last_name,
      lead.email || "",
      lead.phone || "",
      lead.status.replace(/_/g, " ").toUpperCase(),
      lead.budget_min || "",
      lead.budget_max || "",
      new Date(lead.created_at).toLocaleDateString()
    ])

    // Create CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    // Download
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "bg-[var(--color-danger)] text-white"
      case "contacted":
        return "bg-yellow-500 text-white"
      case "qualified":
        return "bg-[var(--color-success)] text-white"
      case "closed_won":
      case "closed won":
        return "bg-[var(--color-brand-green)] text-white"
      case "closed_lost":
      case "closed lost":
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
            placeholder="Search leads by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-text-light)]"
            >
              ✕
            </button>
          )}
        </div>
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value)
          setPage(1)
        }}>
          <SelectTrigger className="w-full md:w-48 bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="closed_won">Closed Won</SelectItem>
            <SelectItem value="closed_lost">Closed Lost</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={exportToExcel}
          disabled={!leads.length}
          className="bg-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold)]/90 text-black font-semibold gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-gold)]" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <p className="text-red-500">Failed to load leads. Please try again.</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && leads.length > 0 && (
        <>
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
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-card)] transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] flex items-center justify-center">
                          <span className="text-sm font-bold text-[var(--color-bg-dark)]">
                            {`${lead.first_name[0]}${lead.last_name[0]}`.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--color-text-light)]">{`${lead.first_name} ${lead.last_name}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-[var(--color-text-light)] text-sm">{lead.email || "—"}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-[var(--color-text-light)] text-sm">{lead.phone || "—"}</p>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-[var(--color-muted-foreground)] text-sm">
                      {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* View Button */}
                        <Link href={`/leads/${lead.id}`} title="View Details">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold)]/10 h-8 w-8 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>

                        {/* Call Button */}
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} title="Call Lead">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-blue-500 hover:bg-blue-500/10 h-8 w-8 transition-all"
                            >
                              <Phone className="w-4 h-4" />
                            </Button>
                          </a>
                        )}

                        {/* Email Button */}
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} title="Send Email">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-cyan-500 hover:bg-cyan-500/10 h-8 w-8 transition-all"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          </a>
                        )}

                        {/* WhatsApp Button */}
                        {lead.phone && (
                          <a 
                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Send WhatsApp Message"
                          >
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-green-500 hover:bg-green-500/10 h-8 w-8 transition-all"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </a>
                        )}

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-500/10 h-8 w-8 transition-all"
                          onClick={() => deleteLead.mutate(lead.id)}
                          disabled={deleteLead.isPending}
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-[var(--color-muted-foreground)]">
                Page {page} of {pages}
              </span>
              <Button
                variant="outline"
                disabled={page === pages}
                onClick={() => setPage(p => Math.min(pages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && leads.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--color-muted-foreground)]">No leads found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  )
}
