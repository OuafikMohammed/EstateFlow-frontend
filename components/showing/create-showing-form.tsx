"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"

interface CreateShowingFormProps {
  onSuccess?: () => void
}

export function CreateShowingForm({ onSuccess }: CreateShowingFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    property_id: "",
    agent_id: "",
    client_id: "",
    scheduled_date: "",
    status: "scheduled" as const,
    notes: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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

    if (!formData.property_id || !formData.agent_id || !formData.client_id || !formData.scheduled_date) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)

      const showingData = {
        property_id: formData.property_id,
        agent_id: formData.agent_id,
        client_id: formData.client_id,
        scheduled_date: new Date(formData.scheduled_date),
        status: formData.status,
        notes: formData.notes || undefined,
        created_at: new Date(),
      }

      // await createShowing(showingData)  // Firebase function - will be replaced with Supabase

      toast({
        title: "Success",
        description: "Showing created successfully",
      })

      setFormData({
        property_id: "",
        agent_id: "",
        client_id: "",
        scheduled_date: "",
        status: "scheduled",
        notes: "",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create showing"
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
        <label className="block text-sm font-medium mb-1">Property ID *</label>
        <Input
          name="property_id"
          value={formData.property_id}
          onChange={handleChange}
          placeholder="Enter property ID"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Client ID *</label>
        <Input
          name="client_id"
          value={formData.client_id}
          onChange={handleChange}
          placeholder="Enter client ID"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Agent ID *</label>
        <Input
          name="agent_id"
          value={formData.agent_id}
          onChange={handleChange}
          placeholder="Enter agent ID"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Scheduled Date *</label>
        <Input
          type="datetime-local"
          name="scheduled_date"
          value={formData.scheduled_date}
          onChange={handleChange}
          disabled={loading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no-show">No Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <Textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add any notes about the showing"
          disabled={loading}
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-[var(--color-primary-gold)] text-black">
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Creating...
          </>
        ) : (
          "Create Showing"
        )}
      </Button>
    </form>
  )
}
