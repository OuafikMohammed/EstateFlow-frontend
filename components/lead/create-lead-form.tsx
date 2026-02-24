"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface CreateLeadFormProps {
  onSuccess?: () => void
}

export function CreateLeadForm({ onSuccess }: CreateLeadFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    status: "new",
    preferredPropertyType: "",
    preferredLocation: "",
    budgetMin: "",
    budgetMax: "",
    notes: "",
    source: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError(null)
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First name and last name are required")
      return false
    }

    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required")
      return false
    }

    if (formData.budgetMin && formData.budgetMax) {
      if (parseInt(formData.budgetMin) > parseInt(formData.budgetMax)) {
        setError("Minimum budget cannot be greater than maximum budget")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      const leadData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        status: formData.status,
        preferred_property_type: formData.preferredPropertyType || null,
        preferred_location: formData.preferredLocation || null,
        budget_min: formData.budgetMin ? parseInt(formData.budgetMin) : null,
        budget_max: formData.budgetMax ? parseInt(formData.budgetMax) : null,
        notes: formData.notes || (formData.source ? `Source: ${formData.source}` : null),
      }

      // Create lead via API
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadData),
      })

      const responseData = await response.json()
      console.log('API Response:', responseData, 'Status:', response.status)

      if (!response.ok) {
        const errorMessage = 
          responseData?.error?.message ||
          responseData?.message ||
          responseData?.error ||
          responseData?.data?.message ||
          "Failed to create lead"
        
        console.error('Error Details:', {
          status: response.status,
          errorMessage,
          fullResponse: responseData
        })
        
        throw new Error(errorMessage)
      }

      const data = responseData.data || responseData

      setSuccess(true)
      toast({
        title: "Success",
        description: "Lead created successfully",
      })

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        status: "new",
        preferredPropertyType: "",
        preferredLocation: "",
        budgetMin: "",
        budgetMax: "",
        notes: "",
        source: "",
      })

      // Redirect to leads page after 2 seconds
      setTimeout(() => {
        router.push("/leads")
        if (onSuccess) onSuccess()
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while creating the lead"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Back Button */}
      <Link href="/leads">
        <Button
          variant="ghost"
          className="mb-6 gap-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-text-light)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leads
        </Button>
      </Link>

      {/* Form Container */}
      <div className="glass rounded-xl p-8 border border-[var(--color-border)]/30">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[var(--color-text-light)] mb-2">
            Add New Lead
          </h1>
          <p className="text-[var(--color-muted-foreground)]">
            Create a new lead and start building relationships with potential clients
          </p>
        </motion.div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="bg-green-500/10 border border-green-500/30 text-green-500">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Lead created successfully! Redirecting to leads page...
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="bg-red-500/10 border border-red-500/30 text-red-500">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-lg font-semibold text-[var(--color-text-light)] mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-light)]">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="bg-[var(--color-bg-card)]/50 border-[var(--color-border)]/30 text-[var(--color-text-light)]"
                  disabled={loading}
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-light)]">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="bg-[var(--color-bg-card)]/50 border-[var(--color-border)]/30 text-[var(--color-text-light)]"
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-light)]">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="bg-[var(--color-bg-card)]/50 border-[var(--color-border)]/30 text-[var(--color-text-light)]"
                  disabled={loading}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-light)]">
                  Phone <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="bg-[var(--color-bg-card)]/50 border-[var(--color-border)]/30 text-[var(--color-text-light)]"
                  disabled={loading}
                />
              </div>
            </div>
          </motion.div>

          {/* Lead Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-[var(--color-text-light)] mb-4">
              Lead Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-light)]">
                  Status
                </label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger className="bg-[var(--color-bg-card)]/50 border-[var(--color-border)]/30 text-[var(--color-text-light)]">
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
              </div>

              {/* Lead Source */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-light)]">
                  Lead Source
                </label>
                <Select value={formData.source} onValueChange={(value) => handleSelectChange("source", value)}>
                  <SelectTrigger className="bg-[var(--color-bg-card)]/50 border-[var(--color-border)]/30 text-[var(--color-text-light)]">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Property Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-light)]">
                  Preferred Property Type
                </label>
                <Select
                  value={formData.preferredPropertyType}
                  onValueChange={(value) => handleSelectChange("preferredPropertyType", value)}
                >
                  <SelectTrigger className="bg-[var(--color-bg-card)]/50 border-[var(--color-border)]/30 text-[var(--color-text-light)]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="multi_family">Multi-Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-light)]">
                  Preferred Location
                </label>
                <Input
                  type="text"
                  name="preferredLocation"
                  value={formData.preferredLocation}
                  onChange={handleChange}
                  placeholder="City or area"
                  className="bg-[var(--color-bg-card)]/50 border-[var(--color-border)]/30 text-[var(--color-text-light)]"
                  disabled={loading}
                />
              </div>
            </div>
          </motion.div>

          {/* Budget Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-lg font-semibold text-[var(--color-text-light)] mb-4">
              Budget Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Budget Min */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-light)]">
                  Minimum Budget ($)
                </label>
                <Input
                  type="number"
                  name="budgetMin"
                  value={formData.budgetMin}
                  onChange={handleChange}
                  placeholder="100000"
                  className="bg-[var(--color-bg-card)]/50 border-[var(--color-border)]/30 text-[var(--color-text-light)]"
                  disabled={loading}
                />
              </div>

              {/* Budget Max */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-light)]">
                  Maximum Budget ($)
                </label>
                <Input
                  type="number"
                  name="budgetMax"
                  value={formData.budgetMax}
                  onChange={handleChange}
                  placeholder="500000"
                  className="bg-[var(--color-bg-card)]/50 border-[var(--color-border)]/30 text-[var(--color-text-light)]"
                  disabled={loading}
                />
              </div>
            </div>
          </motion.div>

          {/* Notes Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-light)]">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional notes about this lead..."
                className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-card)]/50 border border-[var(--color-border)]/30 text-[var(--color-text-light)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-gold)]/50 resize-none min-h-24"
                disabled={loading}
              />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex gap-4 pt-4"
          >
            <Link href="/leads" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full border-[var(--color-border)]/30 text-[var(--color-text-light)]"
                disabled={loading}
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] hover:opacity-90 text-white gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Lead...
                </>
              ) : (
                "Create Lead"
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  )
}
