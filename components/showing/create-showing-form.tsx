"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, Search, Check, MapPin, User, ChevronDown } from "lucide-react"
import { createShowing } from "@/lib/actions/showings"
import { getProperties } from "@/lib/actions/properties"
import { getClients } from "@/lib/actions/clients"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Property {
  id: string
  title: string
  address: string
  price?: number
  city?: string
  property_type?: string
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
  const [success, setSuccess] = useState(false)
  const [progressValue, setProgressValue] = useState(0)
  const { toast } = useToast()

  const [properties, setProperties] = useState<Property[]>([])
  const [clients, setClients] = useState<Client[]>([])
  
  const [propertySearch, setPropertySearch] = useState("")
  const [clientSearch, setClientSearch] = useState("")
  const [openPropertyPopover, setOpenPropertyPopover] = useState(false)
  const [openClientPopover, setOpenClientPopover] = useState(false)

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
        
        // Fetch properties (max limit is 50)
        const propertiesResult = await getProperties({ limit: 50 })
        if (propertiesResult.success && propertiesResult.data?.items) {
          setProperties(propertiesResult.data.items as unknown as Property[])
        } else {
          console.error("Failed to fetch properties:", propertiesResult.error)
          // Still set empty array, properties will show "No properties found"
          setProperties([])
        }

        // Fetch clients (max limit is 50)
        const clientsResult = await getClients({ limit: 50 })
        if (clientsResult.success && clientsResult.data?.items) {
          setClients(clientsResult.data.items as unknown as Client[])
        } else {
          console.error("Failed to fetch clients:", clientsResult.error)
          // Still set empty array
          setClients([])
        }
      } catch (err) {
        console.error("Failed to load data:", err)
        setProperties([])
        setClients([])
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

  const filteredProperties = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.address.toLowerCase().includes(propertySearch.toLowerCase())
  )

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase()))
  )

  const simulateProgress = async () => {
    setProgressValue(0)
    const interval = setInterval(() => {
      setProgressValue((prev) => {
        const next = prev + Math.random() * 25
        return next > 90 ? 90 : next
      })
    }, 300)
    return interval
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
      const progressInterval = await simulateProgress()

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
        scheduled_at: scheduledDateTime.toISOString(),
        status: formData.status,
        feedback: formData.feedback || undefined,
        interest_level: formData.interest_level || undefined,
      }

      const result = await createShowing(showingData)

      clearInterval(progressInterval)
      setProgressValue(100)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
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

          // Reset success after delay
          setTimeout(() => setSuccess(false), 3000)
        }, 500)
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
      setProgressValue(0)
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

  // Success Animation Component
  if (success) {
    return (
      <motion.div
        className="w-full flex items-center justify-center py-16"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        <div className="text-center">
          <motion.div
            className="flex justify-center mb-6"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: 2 }}
          >
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
              <Check className="w-12 h-12 text-green-500" />
            </div>
          </motion.div>
          <motion.h2
            className="text-3xl font-bold text-[var(--color-text-light)] mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Showing Scheduled!
          </motion.h2>
          <motion.p
            className="text-gray-400 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Your showing appointment has been successfully created
          </motion.p>
          <motion.div
            className="text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p>
              <span className="text-gray-400">Property:</span>{" "}
              <span className="text-[var(--color-text-light)] font-medium">
                {selectedProperty?.title}
              </span>
            </p>
            <p className="mt-1">
              <span className="text-gray-400">Client:</span>{" "}
              <span className="text-[var(--color-text-light)] font-medium">
                {selectedClient?.name}
              </span>
            </p>
            <p className="mt-1">
              <span className="text-gray-400">Scheduled:</span>{" "}
              <span className="text-[var(--color-text-light)] font-medium">
                {formatDateDisplay(formData.scheduled_date)} at {getTimeDisplay()}
              </span>
            </p>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400"
          >
            <Alert variant="destructive">{error}</Alert>
          </motion.div>
        )}

        {/* Progress Bar - Only visible during submission */}
        {loading && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Creating showing...</span>
              <span className="text-sm font-semibold text-[var(--color-primary-gold)]">
                {Math.round(progressValue)}%
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </motion.div>
        )}

        {isLoadingData ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <>
            {/* Property Selection with Search and Table */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Select Property *
              </label>
              <Popover open={openPropertyPopover} onOpenChange={setOpenPropertyPopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)] hover:bg-[var(--color-bg-card)]"
                    disabled={loading}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin size={16} className="text-[var(--color-primary-gold)]" />
                      {selectedProperty?.title || "Search and select a property..."}
                    </span>
                    <ChevronDown size={16} className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-[var(--color-bg-card)] border-[var(--color-border)]">
                  <div className="p-4 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <Input
                        placeholder="Search properties..."
                        value={propertySearch}
                        onChange={(e) => setPropertySearch(e.target.value)}
                        className="pl-8 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      />
                    </div>

                    {/* Properties Table */}
                    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-[var(--color-border)] hover:bg-transparent">
                            <TableHead className="text-xs text-gray-400 font-semibold">Property</TableHead>
                            <TableHead className="text-xs text-gray-400 font-semibold">Address</TableHead>
                            <TableHead className="text-xs text-gray-400 font-semibold">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProperties.length > 0 ? (
                            filteredProperties.map((property) => (
                              <TableRow
                                key={property.id}
                                className="border-b border-[var(--color-border)]/30 hover:bg-[var(--color-bg-dark)] cursor-pointer transition-colors"
                                onClick={() => {
                                  setFormData({ ...formData, property_id: property.id })
                                  setOpenPropertyPopover(false)
                                  setPropertySearch("")
                                }}
                              >
                                <TableCell className="text-sm text-[var(--color-text-light)] font-medium">
                                  {property.title}
                                </TableCell>
                                <TableCell className="text-xs text-gray-500">
                                  {property.address}
                                </TableCell>
                                <TableCell className="text-sm text-[var(--color-primary-gold)] font-semibold">
                                  {property.price ? `$${property.price.toLocaleString()}` : "-"}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                                No properties found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {selectedProperty && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-[var(--color-bg-dark)] rounded-lg border border-[var(--color-primary-gold)]/20"
                >
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Selected Property</p>
                  <p className="text-sm font-semibold text-[var(--color-text-light)] mt-1">
                    {selectedProperty.title}
                  </p>
                  <p className="text-xs text-gray-500">{selectedProperty.address}</p>
                </motion.div>
              )}
            </div>

            {/* Client Selection with Search */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Select Client *
              </label>
              <Popover open={openClientPopover} onOpenChange={setOpenClientPopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)] hover:bg-[var(--color-bg-card)]"
                    disabled={loading}
                  >
                    <span className="flex items-center gap-2">
                      <User size={16} className="text-[var(--color-primary-gold)]" />
                      {selectedClient?.name || "Search and select a client..."}
                    </span>
                    <ChevronDown size={16} className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-[var(--color-bg-card)] border-[var(--color-border)]">
                  <div className="p-4 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <Input
                        placeholder="Search clients..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="pl-8 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      />
                    </div>

                    {/* Clients List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <motion.button
                            key={client.id}
                            type="button"
                            whileHover={{ x: 4 }}
                            onClick={() => {
                              setFormData({ ...formData, client_id: client.id })
                              setOpenClientPopover(false)
                              setClientSearch("")
                            }}
                            className="w-full text-left p-3 bg-[var(--color-bg-dark)] hover:bg-[var(--color-bg-dark)]/80 rounded-lg border border-[var(--color-border)]/30 hover:border-[var(--color-primary-gold)]/40 transition-colors"
                          >
                            <p className="text-sm font-medium text-[var(--color-text-light)]">{client.name}</p>
                            {client.email && <p className="text-xs text-gray-500">{client.email}</p>}
                            {client.phone && <p className="text-xs text-gray-500">{client.phone}</p>}
                          </motion.button>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-8">No clients found</div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {selectedClient && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-[var(--color-bg-dark)] rounded-lg border border-[var(--color-primary-gold)]/20"
                >
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Selected Client</p>
                  <p className="text-sm font-semibold text-[var(--color-text-light)] mt-1">{selectedClient.name}</p>
                  {selectedClient.email && <p className="text-xs text-gray-500">{selectedClient.email}</p>}
                </motion.div>
              )}
            </div>

            {/* Date & Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Date *
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="date"
                    name="scheduled_date"
                    value={formData.scheduled_date}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="pl-9 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Time *
                </label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="time"
                    name="scheduled_time"
                    value={formData.scheduled_time}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="pl-9 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)]"
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Additional Notes
              </label>
              <Textarea
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
                placeholder="Add any notes about this showing..."
                className="min-h-24 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)] placeholder-gray-600"
                disabled={loading}
              />
            </div>

            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-br from-[var(--color-primary-gold)]/10 to-transparent border border-[var(--color-primary-gold)]/20 rounded-lg"
            >
              <h3 className="text-sm font-semibold text-[var(--color-text-light)] mb-3">
                Appointment Summary
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-400">
                  <span className="text-gray-500">Property:</span>{" "}
                  <span className="text-[var(--color-text-light)] font-medium">
                    {selectedProperty?.title || "Not selected"}
                  </span>
                </p>
                <p className="text-gray-400">
                  <span className="text-gray-500">Client:</span>{" "}
                  <span className="text-[var(--color-text-light)] font-medium">
                    {selectedClient?.name || "Not selected"}
                  </span>
                </p>
                {formData.scheduled_date && (
                  <p className="text-gray-400">
                    <span className="text-gray-500">Date & Time:</span>{" "}
                    <span className="text-[var(--color-text-light)] font-medium">
                      {formatDateDisplay(formData.scheduled_date)} at {getTimeDisplay()}
                    </span>
                  </p>
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-[var(--color-border)]">
              <Button
                type="reset"
                variant="outline"
                disabled={loading}
                className="border-[var(--color-border)] text-[var(--color-text-light)] hover:bg-[var(--color-bg-card)]"
                onClick={() => {
                  setFormData({
                    property_id: "",
                    client_id: "",
                    scheduled_date: "",
                    scheduled_time: "10:00",
                    status: "scheduled",
                    feedback: "",
                    interest_level: null,
                  })
                  setPropertySearch("")
                  setClientSearch("")
                }}
              >
                Clear
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.property_id || !formData.client_id || !formData.scheduled_date}
                className="rounded-lg border border-[var(--color-primary-gold)] bg-[var(--color-primary-gold)] text-[var(--color-bg-dark)] font-semibold hover:bg-[var(--color-primary-gold)] hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="w-4 h-4" />
                    Scheduling...
                  </span>
                ) : (
                  "Schedule Showing"
                )}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
