"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, Calendar, User, MapPin, Clock } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { createShowing } from "@/lib/actions/showings"
import { getProperties } from "@/lib/actions/properties"
import { getClients } from "@/lib/actions/clients"

interface Property {
  id: string
  title: string
  address: string
}

interface Client {
  id: string
  name: string
}

export default function NewShowingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string>("")
  const [formData, setFormData] = useState({
    property_id: "",
    client_id: "",
    scheduled_at: "",
    scheduled_time: "10:00",
  })

  // Load properties and clients on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true)
        setError("")

        const [propsResult, clientsResult] = await Promise.all([
          getProperties({ limit: 100 }),
          getClients({ limit: 100 }),
        ])

        if (propsResult.success && propsResult.data?.items) {
          setProperties(
            propsResult.data.items.map((p: any) => ({
              id: p.id,
              title: p.title,
              address: p.address,
            }))
          )
        }

        if (clientsResult.success && clientsResult.data?.items) {
          setClients(
            clientsResult.data.items.map((c: any) => ({
              id: c.id,
              name: c.name,
            }))
          )
        }
      } catch (err) {
        setError("Failed to load properties and clients")
        console.error(err)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (!authLoading) {
      loadData()
    }
  }, [authLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.property_id || !formData.client_id || !formData.scheduled_at || !user?.id) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Combine date and time into ISO datetime
      const dateTime = new Date(`${formData.scheduled_at}T${formData.scheduled_time}:00`)
      const scheduledAt = dateTime.toISOString()

      const result = await createShowing({
        property_id: formData.property_id,
        client_id: formData.client_id,
        agent_id: user.id,
        scheduled_at: scheduledAt,
        status: "scheduled",
      })

      if (!result.success) {
        setError(result.error || "Failed to create showing")
        return
      }

      // Success - redirect to showings list
      router.push("/showings")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create showing")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedProperty = properties.find((p) => p.id === formData.property_id)
  const selectedClient = clients.find((c: Client) => c.id === formData.client_id)

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href="/showings">
            <Button
              variant="ghost"
              size="sm"
              className="text-[var(--color-primary-gold)] hover:bg-[var(--color-bg-card)]"
            >
              <ChevronLeft size={16} className="mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-light)]">
              Schedule New Showing
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Create a new showing appointment for a property
            </p>
          </div>
        </motion.div>

        {error && (
          <motion.div
            className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        {isLoadingData && (
          <motion.div
            className="p-4 bg-blue-500/10 border border-blue-500 rounded-lg text-blue-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Loading properties and clients...
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Selection Form */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {/* Property Selection */}
              <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--color-text-light)]">
                    <MapPin size={20} className="text-[var(--color-primary-gold)]" />
                    Property
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Select Property *
                    </label>
                    <Select
                      value={formData.property_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, property_id: value })
                      }
                      disabled={isLoadingData}
                    >
                      <SelectTrigger className="mt-2 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)]">
                        <SelectValue placeholder={isLoadingData ? "Loading..." : "Choose a property"} />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
                        {properties.map((property) => (
                          <SelectItem
                            key={property.id}
                            value={property.id}
                            className="text-[var(--color-text-light)]"
                          >
                            {property.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedProperty && (
                    <div className="p-3 bg-[var(--color-bg-dark)] rounded-lg border border-[var(--color-primary-gold)]/20">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">
                        Selected Property
                      </p>
                      <p className="text-sm font-semibold text-[var(--color-text-light)] mt-1">
                        {selectedProperty.title}
                      </p>
                      <p className="text-xs text-gray-500">{selectedProperty.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Client Selection */}
              <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--color-text-light)]">
                    <User size={20} className="text-[var(--color-primary-gold)]" />
                    Client
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Select Client *
                    </label>
                    <Select
                      value={formData.client_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, client_id: value })
                      }
                      disabled={isLoadingData}
                    >
                      <SelectTrigger className="mt-2 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)]">
                        <SelectValue placeholder={isLoadingData ? "Loading..." : "Choose a client"} />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
                        {clients.map((client) => (
                          <SelectItem
                            key={client.id}
                            value={client.id}
                            className="text-[var(--color-text-light)]"
                          >
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedClient && (
                    <div className="p-3 bg-[var(--color-bg-dark)] rounded-lg border border-[var(--color-primary-gold)]/20">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">
                        Selected Client
                      </p>
                      <p className="text-sm font-semibold text-[var(--color-text-light)] mt-1">
                        {selectedClient.name}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Date/Time */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            >
              {/* Date & Time Selection */}
              <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--color-text-light)]">
                    <Calendar size={20} className="text-[var(--color-primary-gold)]" />
                    Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Date *
                    </label>
                    <div className="relative mt-2">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <Input
                        type="date"
                        value={formData.scheduled_at}
                        onChange={(e) =>
                          setFormData({ ...formData, scheduled_at: e.target.value })
                        }
                        required
                        className="pl-9 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Time *
                    </label>
                    <div className="relative mt-2">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <Input
                        type="time"
                        value={formData.scheduled_time}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scheduled_time: e.target.value,
                          })
                        }
                        required
                        className="pl-9 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      />
                    </div>
                  </div>

                  {formData.scheduled_at && (
                    <div className="p-3 bg-[var(--color-bg-dark)] rounded-lg border border-[var(--color-primary-gold)]/20">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">
                        Scheduled For
                      </p>
                      <p className="text-sm font-semibold text-[var(--color-text-light)] mt-1">
                        {new Date(formData.scheduled_at).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        at {formData.scheduled_time}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Summary Card */}
              <Card className="bg-gradient-to-br from-[var(--color-primary-gold)]/10 to-transparent border-[var(--color-primary-gold)]/20">
                <CardHeader>
                  <CardTitle className="text-[var(--color-text-light)]">
                    Appointment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                    <p className="text-gray-400">
                      <span className="text-gray-500">Date & Time:</span>{" "}
                      <span className="text-[var(--color-text-light)] font-medium">
                        {formData.scheduled_at
                          ? `${new Date(formData.scheduled_at).toLocaleDateString()} at ${formData.scheduled_time}`
                          : "Not set"}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            className="flex gap-3 justify-end pt-4 border-t border-[var(--color-border)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Link href="/showings">
              <Button
                type="button"
                variant="outline"
                className="border-[var(--color-border)] text-[var(--color-text-light)] hover:bg-[var(--color-bg-card)]"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading || isLoadingData || authLoading || !formData.property_id || !formData.client_id || !formData.scheduled_at || !user}
              className="rounded-lg border border-[var(--color-primary-gold)] bg-[var(--color-primary-gold)] text-[var(--color-bg-dark)] font-semibold hover:bg-[var(--color-primary-gold)] hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? "Scheduling..." : "Schedule Showing"}
            </Button>
          </motion.div>
        </form>
      </div>
    </DashboardLayout>
  )
}
