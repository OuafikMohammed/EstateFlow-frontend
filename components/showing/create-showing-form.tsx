"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock } from "lucide-react"
import { createShowing } from "@/lib/actions/showings"
import { getProperties } from "@/lib/actions/properties"
import { getClients } from "@/lib/actions/clients"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Property {
  id: string
  title: string
  address: string
  price?: number
}

interface Client {
  id: string
  name: string
  phone?: string
  email?: string
}

interface CreateShowingFormProps {
  onSuccess?: () => void
}

export function CreateShowingForm({ onSuccess }: CreateShowingFormProps) {
  const [loading, setLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const [properties, setProperties] = useState<Property[]>([])
  const [clients, setClients] = useState<Client[]>([])

  const [formData, setFormData] = useState({
    property_id: "",
    client_id: "",
    scheduled_date: "",
    scheduled_time: "10:00",
    status: "scheduled" as const,
    feedback: "",
    interest_level: null as string | null,
  })

  // Load properties and clients on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true)
        
        // Fetch properties
        const propertiesResult = await getProperties({ limit: 100 })
        if (propertiesResult.success && propertiesResult.data?.items) {
          setProperties(propertiesResult.data.items as unknown as Property[])
        }

        // Fetch clients
        const clientsResult = await getClients({ limit: 100 })
        if (clientsResult.success && clientsResult.data?.items) {
          setClients(clientsResult.data.items as unknown as Client[])
        }
      } catch (err) {
        console.error("Failed to load data:", err)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [])

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

    // Validate required fields
    if (!formData.property_id || !formData.client_id || !formData.scheduled_date || !formData.scheduled_time) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)

      // Combine date and time into ISO format
      const [year, month, day] = formData.scheduled_date.split("-")
      const [hours, minutes] = formData.scheduled_time.split(":")
      const scheduledDateTime = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      )

      // Note: The agent_id will be set by the server action based on the current user session
      const showingData = {
        property_id: formData.property_id,
        client_id: formData.client_id,
        agent_id: "", // Will be set by server action
        scheduled_at: scheduledDateTime.toISOString(),
        status: formData.status,
        feedback: formData.feedback || undefined,
        interest_level: formData.interest_level || undefined,
      }

      const result = await createShowing(showingData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Showing created successfully",
        })

        setFormData({
          property_id: "",
          client_id: "",
          scheduled_date: "",
          scheduled_time: "10:00",
          status: "scheduled",
          feedback: "",
          interest_level: null,
        })

        if (onSuccess) {
          onSuccess()
        }
      } else {
        setError(result.error || "Failed to create showing")
        toast({
          title: "Error",
          description: result.error || "Failed to create showing",
          variant: "destructive",
        })
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

  const selectedProperty = properties.find((p) => p.id === formData.property_id)
  const selectedClient = clients.find((c) => c.id === formData.client_id)

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "Not selected"
    const [year, month, day] = dateStr.split("-")
    return `${day}/${month}/${year}`
  }

  const getTimeDisplay = () => {
    return formData.scheduled_time || "Not set"
  }

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert variant="destructive">{error}</Alert>}

        {isLoadingData ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <>
            {/* Property Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Property <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500">Choose a property</p>
              <Select value={formData.property_id} onValueChange={(value) => handleSelectChange("property_id", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">No properties available</div>
                  ) : (
                    properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title} - {property.address}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Client Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Client <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500">Choose a client</p>
              <Select value={formData.client_id} onValueChange={(value) => handleSelectChange("client_id", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">No clients available</div>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                        {client.phone ? ` - ${client.phone}` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Appointment Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-sm">Appointment</h3>

              {/* Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={handleChange}
                  placeholder="jj/mm/aaaa"
                  disabled={loading}
                  required
                  className="w-full"
                />
              </div>

              {/* Time */}
              <div className="space-y-2">
                <label className="block text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  name="scheduled_time"
                  value={formData.scheduled_time}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Appointment Summary */}
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm">Appointment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Property:</span>
                  <span className="font-medium text-right max-w-xs">
                    {selectedProperty ? selectedProperty.title : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium text-right max-w-xs">
                    {selectedClient ? selectedClient.name : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {formData.scheduled_date ? formatDateDisplay(formData.scheduled_date) : "Not set"} at{" "}
                    {getTimeDisplay()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <div className="space-y-3 border-t pt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Feedback</label>
                <Textarea
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  placeholder="Add any notes about the showing"
                  disabled={loading}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || isLoadingData}
              className="w-full bg-[var(--color-primary-gold)] text-black hover:bg-[var(--color-primary-gold)]/90"
            >
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Creating...
                </>
              ) : (
                "Schedule New Showing"
              )}
            </Button>
          </>
        )}
      </form>
    </div>
  )
}
