"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"

interface CreateClientFormProps {
  onSuccess?: () => void
}

export function CreateClientForm({ onSuccess }: CreateClientFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "buyer" as const,
    status: "active" as const,
    budget_min: "",
    budget_max: "",
    lead_source: "",
    agent_assigned: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please fill in all required fields")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return
    }

    try {
      setLoading(true)

      const clientData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: formData.type,
        status: formData.status,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : undefined,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : undefined,
        lead_source: formData.lead_source || undefined,
        agent_assigned: formData.agent_assigned || undefined,
        preferred_locations: [],
        preferred_property_types: [],
        properties_viewed: [],
        properties_favorited: [],
        created_at: new Date(),
      }

      // await createClient(clientData)  // Firebase function - will be replaced with Supabase

      toast({
        title: "Success",
        description: "Client created successfully",
      })

      setFormData({
        name: "",
        email: "",
        phone: "",
        type: "buyer",
        status: "active",
        budget_min: "",
        budget_max: "",
        lead_source: "",
        agent_assigned: "",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create client"
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}

      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Client name"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email *</label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="client@example.com"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone *</label>
        <Input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 (555) 123-4567"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select client type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buyer">Buyer</SelectItem>
            <SelectItem value="renter">Renter</SelectItem>
            <SelectItem value="investor">Investor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="closed_deal">Closed Deal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Budget Min</label>
          <Input
            type="number"
            name="budget_min"
            value={formData.budget_min}
            onChange={handleChange}
            placeholder="0"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Budget Max</label>
          <Input
            type="number"
            name="budget_max"
            value={formData.budget_max}
            onChange={handleChange}
            placeholder="0"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Lead Source</label>
        <Input
          name="lead_source"
          value={formData.lead_source}
          onChange={handleChange}
          placeholder="e.g., Website, Referral, Cold Call"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Agent Assigned</label>
        <Input
          name="agent_assigned"
          value={formData.agent_assigned}
          onChange={handleChange}
          placeholder="Agent ID or name"
          disabled={loading}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-[var(--color-primary-gold)] text-black">
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Creating...
          </>
        ) : (
          "Create Client"
        )}
      </Button>
    </form>
  )
}
