"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Save, AlertCircle, Loader } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getClientById, updateClient } from "@/lib/actions/clients"

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
}

interface ClientData {
  id: string
  name: string
  phone: string
  email: string
  budget_min: number | null
  budget_max: number | null
  preferred_type: string[] | string | null
  preferred_location: string[] | string | null
  bedrooms: number | null
  status: string
  source: string | null
  notes: string | null
}

export default function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [clientId, setClientId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState("")
  const [clientError, setClientError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    budget_min: "",
    budget_max: "",
    preferred_type: "",
    preferred_location: "",
    bedrooms: "",
    status: "warm",
    source: "",
    notes: "",
  })

  // Extract ID from params
  useEffect(() => {
    const extractId = async () => {
      const { id } = await params
      setClientId(id)
    }
    extractId()
  }, [params])

  // Fetch client data
  useEffect(() => {
    if (!clientId) return

    const fetchClient = async () => {
      try {
        setIsInitialLoading(true)
        const result = await getClientById(clientId)

        if (!result.success) {
          setClientError(result.error || "Failed to load client")
          return
        }

        const client: ClientData = result.data as ClientData

        // Convert arrays to string for form
        const preferredType = Array.isArray(client.preferred_type)
          ? client.preferred_type[0] || ""
          : client.preferred_type || ""

        const preferredLocation = Array.isArray(client.preferred_location)
          ? client.preferred_location.join(", ")
          : client.preferred_location || ""

        setFormData({
          name: client.name || "",
          phone: client.phone || "",
          email: client.email || "",
          budget_min: client.budget_min ? client.budget_min.toString() : "",
          budget_max: client.budget_max ? client.budget_max.toString() : "",
          preferred_type: preferredType,
          preferred_location: preferredLocation,
          bedrooms: client.bedrooms ? client.bedrooms.toString() : "",
          status: client.status || "warm",
          source: client.source || "",
          notes: client.notes || "",
        })
      } catch (err) {
        setClientError(
          err instanceof Error ? err.message : "Failed to load client"
        )
      } finally {
        setIsInitialLoading(false)
      }
    }

    fetchClient()
  }, [clientId])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
    setError("")
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError("Name is required")
        setIsLoading(false)
        return
      }
      if (!formData.phone.trim()) {
        setError("Phone number is required")
        setIsLoading(false)
        return
      }
      if (!formData.email.trim()) {
        setError("Email is required")
        setIsLoading(false)
        return
      }

      if (!clientId) {
        setError("Client ID is missing")
        setIsLoading(false)
        return
      }

      // Prepare data with proper type conversions
      const updateData = {
        id: clientId,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        status: formData.status,
        source: formData.source || undefined,
        budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        preferred_type: formData.preferred_type
          ? [formData.preferred_type]
          : [],
        preferred_location: formData.preferred_location
          ? formData.preferred_location.split(",").map((loc) => loc.trim())
          : [],
        notes: formData.notes || null,
      }

      // Call server action
      const result = await updateClient(updateData)

      if (result.success) {
        router.push(`/clients/${clientId}`)
      } else {
        setError(result.error || "Failed to update client")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while fetching client
  if (isInitialLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-[var(--color-primary-gold)] mx-auto mb-4" />
            <p className="text-[var(--color-text-light)]">Loading client...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show error if client not found
  if (clientError) {
    return (
      <DashboardLayout>
        <div className="w-full">
          <motion.div
            className="mb-6 flex items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/clients">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-lg hover:bg-[var(--color-bg-card)]"
              >
                <ArrowLeft size={20} className="text-[var(--color-text-light)]" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text-light)]">
                Edit Client
              </h1>
            </div>
          </motion.div>

          <Alert className="border-[var(--color-danger)] bg-[var(--color-danger)]/10">
            <AlertCircle className="h-4 w-4 text-[var(--color-danger)]" />
            <AlertDescription className="text-[var(--color-danger)]">
              {clientError}
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="w-full">
        {/* Header */}
        <motion.div
          className="mb-6 flex items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href={`/clients/${clientId}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg hover:bg-[var(--color-bg-card)]"
            >
              <ArrowLeft size={20} className="text-[var(--color-text-light)]" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-light)]">
              Edit Client
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Update client information
            </p>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <Alert className="border-[var(--color-danger)] bg-[var(--color-danger)]/10">
              <AlertCircle className="h-4 w-4 text-[var(--color-danger)]" />
              <AlertDescription className="text-[var(--color-danger)]">
                {error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <motion.div
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Contact Information Section */}
            <motion.div className="lg:col-span-2" variants={sectionVariants}>
              <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
                <CardHeader>
                  <CardTitle className="text-[var(--color-text-light)]">
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Name */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-400">
                      Full Name *
                    </Label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Smith"
                      className="mt-2 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)] placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Two-column row for Phone and Email */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Phone */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-400">
                        Phone Number *
                      </Label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className="mt-2 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)] placeholder:text-gray-500"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-400">
                        Email Address *
                      </Label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="mt-2 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)] placeholder:text-gray-500"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Status Section - Sidebar */}
            <motion.div variants={sectionVariants}>
              <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)] sticky top-6">
                <CardHeader>
                  <CardTitle className="text-sm text-[var(--color-text-light)]">
                    Lead Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleSelectChange("status", value)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger className="mt-2 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                        <SelectItem value="hot">🔥 Hot</SelectItem>
                        <SelectItem value="warm">🟠 Warm</SelectItem>
                        <SelectItem value="cold">❄️ Cold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Source
                    </Label>
                    <Select
                      value={formData.source}
                      onValueChange={(value) =>
                        handleSelectChange("source", value)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger className="mt-2 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)]">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="social_media">Social Media</SelectItem>
                        <SelectItem value="phone_call">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="agent_contact">
                          Agent Contact
                        </SelectItem>
                        <SelectItem value="walk_in">Walk In</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Budget Section */}
          <motion.div
            className="mt-6"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--color-text-light)]">
                  Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-sm font-semibold text-gray-400">
                      Minimum Budget
                    </Label>
                    <Input
                      type="number"
                      name="budget_min"
                      value={formData.budget_min}
                      onChange={handleChange}
                      placeholder="500000"
                      className="mt-2 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)] placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-400">
                      Maximum Budget
                    </Label>
                    <Input
                      type="number"
                      name="budget_max"
                      value={formData.budget_max}
                      onChange={handleChange}
                      placeholder="1500000"
                      className="mt-2 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)] placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Property Preferences Section */}
          <motion.div
            className="mt-6"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--color-text-light)]">
                  Property Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-sm font-semibold text-gray-400">
                      Property Type
                    </Label>
                    <Select
                      value={formData.preferred_type}
                      onValueChange={(value) =>
                        handleSelectChange("preferred_type", value)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger className="mt-2 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="multi_family">Multi Family</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-400">
                      Bedrooms
                    </Label>
                    <Select
                      value={formData.bedrooms}
                      onValueChange={(value) =>
                        handleSelectChange("bedrooms", value)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger className="mt-2 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)]">
                        <SelectValue placeholder="Select bedrooms" />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                        <SelectItem value="1">1 Bedroom</SelectItem>
                        <SelectItem value="2">2 Bedrooms</SelectItem>
                        <SelectItem value="3">3 Bedrooms</SelectItem>
                        <SelectItem value="4">4 Bedrooms</SelectItem>
                        <SelectItem value="5+">5+ Bedrooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-400">
                    Preferred Location
                  </Label>
                  <Input
                    type="text"
                    name="preferred_location"
                    value={formData.preferred_location}
                    onChange={handleChange}
                    placeholder="Downtown, Waterfront, Suburbs..."
                    className="mt-2 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)] placeholder:text-gray-500"
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notes Section */}
          <motion.div
            className="mt-6"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
              <CardHeader>
                <CardTitle className="text-[var(--color-text-light)]">
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any additional notes about this client..."
                  rows={4}
                  className="bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)] placeholder:text-gray-500"
                  disabled={isLoading}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Form Actions */}
          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href={`/clients/${clientId}`} className="w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                className="w-full border-[var(--color-border)] text-[var(--color-text-light)] hover:bg-[var(--color-bg-card)]"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto gap-2 rounded-lg border border-[var(--color-primary-gold)] bg-[var(--color-primary-gold)] text-[var(--color-bg-dark)] font-semibold hover:bg-[var(--color-primary-gold)] hover:opacity-90 transition-all disabled:opacity-50"
            >
              <Save size={18} />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </motion.div>
        </form>
      </div>
    </DashboardLayout>
  )
}
