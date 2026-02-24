"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Mail, Phone, DollarSign, MapPin, Calendar, Copy, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Lead {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  status: string
  budget_min: number
  budget_max: number
  interested_types: string[]
  preferred_cities: string[]
  notes: string
  created_at: string
  last_contacted_at?: string
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    fetchLead()
  }, [params.id])

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch lead")
      const lead = await response.json()
      setLead(lead)
      setNewStatus(lead.status)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load lead details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (newStatus === lead?.status) return

    setStatusUpdating(true)
    try {
      const response = await fetch(`/api/leads/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      setLead({ ...lead!, status: newStatus })
      toast({
        title: "Success",
        description: "Lead status updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
      setNewStatus(lead?.status || "")
    } finally {
      setStatusUpdating(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary-gold)]"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!lead) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-center">
            <p className="text-[var(--color-muted-foreground)] text-lg mb-6">Lead not found</p>
            <Button 
              onClick={() => router.push("/leads")} 
              className="bg-[var(--color-primary-gold)] text-black hover:bg-[var(--color-primary-gold)]/90"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leads
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/30"
      case "contacted":
        return "bg-yellow-500/10 text-yellow-600 border border-yellow-500/30"
      case "qualified":
        return "bg-purple-500/10 text-purple-500 border border-purple-500/30"
      case "proposal_sent":
        return "bg-cyan-500/10 text-cyan-500 border border-cyan-500/30"
      case "negotiating":
        return "bg-orange-500/10 text-orange-500 border border-orange-500/30"
      case "closed_won":
        return "bg-green-500/10 text-green-500 border border-green-500/30"
      case "closed_lost":
        return "bg-red-500/10 text-red-500 border border-red-500/30"
      default:
        return "bg-gray-500/10 text-gray-500 border border-gray-500/30"
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-[var(--color-muted-foreground)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-serif font-bold text-[var(--color-text-light)]">
              {lead.first_name} {lead.last_name}
            </h1>
            <p className="text-[var(--color-muted-foreground)]">Lead Details</p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Card: Contact Information */}
            <div className="glass rounded-xl p-6 border border-[var(--color-border)]/30">
              <h2 className="text-lg font-semibold text-[var(--color-text-light)] mb-4">Contact Information</h2>
              <div className="space-y-4">
                {lead.email && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center justify-between p-3 bg-[var(--color-bg-card)]/50 rounded-lg hover:bg-[var(--color-bg-card)] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[var(--color-primary-gold)]" />
                      <div>
                        <p className="text-xs text-[var(--color-muted-foreground)]">Email</p>
                        <p className="text-[var(--color-text-light)] font-medium">{lead.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(lead.email)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4 text-[var(--color-muted-foreground)] hover:text-[var(--color-text-light)]" />
                    </button>
                  </motion.div>
                )}

                {lead.phone && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-between p-3 bg-[var(--color-bg-card)]/50 rounded-lg hover:bg-[var(--color-bg-card)] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-[var(--color-primary-gold)]" />
                      <div>
                        <p className="text-xs text-[var(--color-muted-foreground)]">Phone</p>
                        <p className="text-[var(--color-text-light)] font-medium">{lead.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(lead.phone)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4 text-[var(--color-muted-foreground)] hover:text-[var(--color-text-light)]" />
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Card: Budget Information */}
            {(lead.budget_min || lead.budget_max) && (
              <div className="glass rounded-xl p-6 border border-[var(--color-border)]/30">
                <h2 className="text-lg font-semibold text-[var(--color-text-light)] mb-4">Budget Information</h2>
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-[var(--color-primary-gold)]/10 to-[var(--color-accent)]/10 rounded-lg border border-[var(--color-primary-gold)]/20"
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-[var(--color-primary-gold)]" />
                      <div>
                        <p className="text-sm text-[var(--color-muted-foreground)]">Budget Range</p>
                        <p className="text-[var(--color-text-light)] font-semibold">
                          ${lead.budget_min?.toLocaleString()} - ${lead.budget_max?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Card: Preferences */}
            {(lead.interested_types?.length || lead.preferred_cities?.length) && (
              <div className="glass rounded-xl p-6 border border-[var(--color-border)]/30">
                <h2 className="text-lg font-semibold text-[var(--color-text-light)] mb-4">Preferences</h2>
                <div className="space-y-4">
                  {lead.interested_types && lead.interested_types.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-sm text-[var(--color-muted-foreground)] mb-2">Interested Property Types</p>
                      <div className="flex flex-wrap gap-2">
                        {lead.interested_types.map((type: string) => (
                          <span
                            key={type}
                            className="px-3 py-1 bg-[var(--color-primary-gold)]/20 text-[var(--color-primary-gold)] rounded-full text-xs font-medium border border-[var(--color-primary-gold)]/30"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {lead.preferred_cities && lead.preferred_cities.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                    >
                      <p className="text-sm text-[var(--color-muted-foreground)] mb-2">Preferred Cities</p>
                      <div className="flex flex-wrap gap-2">
                        {lead.preferred_cities.map((city: string) => (
                          <span
                            key={city}
                            className="px-3 py-1 bg-[var(--color-success)]/20 text-[var(--color-success)] rounded-full text-xs font-medium border border-[var(--color-success)]/30 flex items-center gap-2"
                          >
                            <MapPin className="w-3 h-3" />
                            {city}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Card: Notes */}
            {lead.notes && (
              <div className="glass rounded-xl p-6 border border-[var(--color-border)]/30">
                <h2 className="text-lg font-semibold text-[var(--color-text-light)] mb-4">Notes</h2>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 bg-[var(--color-bg-card)]/50 rounded-lg border border-[var(--color-border)]/30 text-[var(--color-text-light)]"
                >
                  {lead.notes}
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Right Column - Status & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Card: Status */}
            <div className="glass rounded-xl p-6 border border-[var(--color-border)]/30 sticky top-20">
              <h2 className="text-lg font-semibold text-[var(--color-text-light)] mb-4">Status</h2>
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className={`text-center py-3 rounded-lg font-semibold px-4 ${getStatusColor(lead.status)}`}
                >
                  {lead.status.replace(/_/g, " ").toUpperCase()}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                      <SelectItem value="negotiating">Negotiating</SelectItem>
                      <SelectItem value="closed_won">Closed Won</SelectItem>
                      <SelectItem value="closed_lost">Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={statusUpdating || newStatus === lead.status}
                    className="w-full bg-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold)]/90 text-black font-semibold"
                  >
                    {statusUpdating ? "Updating..." : "Update Status"}
                  </Button>
                </motion.div>

                {/* Quick Actions */}
                <div className="pt-4 border-t border-[var(--color-border)]/30 space-y-2">
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`}>
                      <Button
                        variant="outline"
                        className="w-full border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                      >
                        <Phone className="w-4 h-4 mr-2" /> Call
                      </Button>
                    </a>
                  )}
                  {lead.email && (
                    <a href={`mailto:${lead.email}`}>
                      <Button
                        variant="outline"
                        className="w-full border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10"
                      >
                        <Mail className="w-4 h-4 mr-2" /> Email
                      </Button>
                    </a>
                  )}
                  {lead.phone && (
                    <a
                      href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="w-full border-green-500/30 text-green-500 hover:bg-green-500/10"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> WhatsApp
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Card: Timeline */}
            <div className="glass rounded-xl p-6 border border-[var(--color-border)]/30">
              <h2 className="text-lg font-semibold text-[var(--color-text-light)] mb-4">Timeline</h2>
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 pb-3 border-b border-[var(--color-border)]"
                >
                  <Calendar className="w-5 h-5 text-[var(--color-primary-gold)]" />
                  <div>
                    <p className="text-xs text-[var(--color-muted-foreground)]">Created</p>
                    <p className="text-[var(--color-text-light)] font-medium">
                      {new Date(lead.created_at).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </motion.div>

                {lead.last_contacted_at && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="flex items-center gap-3"
                  >
                    <Calendar className="w-5 h-5 text-[var(--color-primary-gold)]" />
                    <div>
                      <p className="text-xs text-[var(--color-muted-foreground)]">Last Contacted</p>
                      <p className="text-[var(--color-text-light)] font-medium">
                        {new Date(lead.last_contacted_at).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
