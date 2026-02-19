"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  FileText,
  AlertCircle,
  Loader,
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getClientById, deleteClient } from "@/lib/actions/clients"

interface ClientData {
  id: string
  name: string
  phone: string
  email: string
  status: string
  budget_min: number | null
  budget_max: number | null
  source: string | null
  preferred_type: string | null
  preferred_location: string | null
  bedrooms: string | number | null
  notes: string | null
  created_at: string
}

const statusColors = {
  hot: "rgb(239, 35, 60)",
  warm: "rgb(197, 160, 89)",
  cold: "rgb(82, 183, 136)",
}

const statusBgColors = {
  hot: "rgba(239, 35, 60, 0.1)",
  warm: "rgba(197, 160, 89, 0.1)",
  cold: "rgba(82, 183, 136, 0.1)",
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [client, setClient] = useState<ClientData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch client data
  useEffect(() => {
    const fetchClient = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await getClientById(resolvedParams.id)
        
        if (result.success && result.data) {
          setClient(result.data as ClientData)
        } else {
          setError(result.error || "Failed to load client")
        }
      } catch (err) {
        console.error("Error fetching client:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClient()
  }, [resolvedParams.id])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteClient(resolvedParams.id)
      if (result.success) {
        router.push("/clients")
      } else {
        setError(result.error || "Failed to delete client")
        setIsDeleteDialogOpen(false)
      }
    } catch (err) {
      console.error("Error deleting client:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert className="border-[var(--color-danger)] bg-[var(--color-danger)]/10">
            <AlertCircle className="text-[var(--color-danger)]" />
            <AlertDescription className="text-[var(--color-danger)]">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="text-[var(--color-primary-gold)] animate-spin" size={32} />
          </div>
        ) : !client ? (
          <Alert className="border-[var(--color-danger)] bg-[var(--color-danger)]/10">
            <AlertCircle className="text-[var(--color-danger)]" />
            <AlertDescription className="text-[var(--color-danger)]">
              Client not found
            </AlertDescription>
          </Alert>
        ) : (
          <>
        {/* Header */}
        <motion.div
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
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
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[var(--color-text-light)]">
              {client.name}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Added on {new Date(client.created_at).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link href={`/clients/${resolvedParams.id}/edit`}>
              <Button className="gap-2 rounded-lg border border-[var(--color-primary-gold)] bg-transparent text-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-bg-dark)] transition-all">
                <Edit size={18} />
                Edit
              </Button>
            </Link>
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="gap-2 rounded-lg border border-[var(--color-danger)] bg-transparent text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white transition-all"
            >
              <Trash2 size={18} />
              Delete
            </Button>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column - Client Info */}
          <div className="space-y-6 lg:col-span-2">
            {/* Contact Card */}
            <motion.div variants={itemVariants}>
              <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
                <CardHeader>
                  <CardTitle className="text-[var(--color-text-light)]">
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Mail
                      size={20}
                      className="text-[var(--color-primary-gold)] shrink-0 mt-1"
                    />
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Email
                      </p>
                      <a
                        href={`mailto:${client.email}`}
                        className="mt-1 text-[var(--color-text-light)] hover:text-[var(--color-primary-gold)] transition-colors"
                      >
                        {client.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone
                      size={20}
                      className="text-[var(--color-primary-gold)] shrink-0 mt-1"
                    />
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Phone
                      </p>
                      <a
                        href={`tel:${client.phone}`}
                        className="mt-1 text-[var(--color-text-light)] hover:text-[var(--color-primary-gold)] transition-colors"
                      >
                        {client.phone}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Budget Card */}
            <motion.div variants={itemVariants}>
              <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
                <CardHeader>
                  <CardTitle className="text-[var(--color-text-light)]">
                    Budget Range
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <DollarSign
                      size={24}
                      className="text-[var(--color-primary-gold)]"
                    />
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Estimated Budget
                      </p>
                      <p className="mt-2 text-2xl font-bold text-[var(--color-text-light)]">
                        ${client.budget_min?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} -{" "}
                        <span className="text-[var(--color-primary-gold)]">
                          ${client.budget_max?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Property Preferences Card */}
            <motion.div variants={itemVariants}>
              <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
                <CardHeader>
                  <CardTitle className="text-[var(--color-text-light)]">
                    Property Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Property Type
                      </p>
                      <p className="mt-2 capitalize text-[var(--color-text-light)]">
                        {client.preferred_type || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Bedrooms
                      </p>
                      <p className="mt-2 text-[var(--color-text-light)]">
                        {client.bedrooms || "Not specified"}
                      </p>
                    </div>
                  </div>

                  {client.preferred_location && (
                    <div className="border-t border-[var(--color-border)] pt-4">
                      <div className="flex items-start gap-3">
                        <MapPin
                          size={20}
                          className="text-[var(--color-primary-gold)] shrink-0 mt-0.5"
                        />
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Preferred Location
                          </p>
                          <p className="mt-2 text-[var(--color-text-light)]">
                            {client.preferred_location}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Notes Card */}
            {client.notes && (
              <motion.div variants={itemVariants}>
                <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[var(--color-text-light)]">
                      <FileText size={20} />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{client.notes}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <motion.div className="space-y-6" variants={itemVariants}>
            {/* Status Card */}
            <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
              <CardHeader>
                <CardTitle className="text-sm text-[var(--color-text-light)]">
                  Lead Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Badge
                  className="w-full justify-center py-2 capitalize text-base"
                  style={{
                    backgroundColor:
                      statusBgColors[
                        client.status as keyof typeof statusBgColors
                      ],
                    color:
                      statusColors[client.status as keyof typeof statusColors],
                    border: `1px solid ${
                      statusColors[client.status as keyof typeof statusColors]
                    }`,
                  }}
                >
                  {client.status}
                </Badge>
              </CardContent>
            </Card>

            {/* Source Card */}
            <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
              <CardHeader>
                <CardTitle className="text-sm text-[var(--color-text-light)]">
                  Lead Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="capitalize text-[var(--color-text-light)]">
                  {client.source || "Not specified"}
                </p>
              </CardContent>
            </Card>

            {/* Showing History Card - Placeholder */}
            <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
              <CardHeader>
                <CardTitle className="text-sm text-[var(--color-text-light)]">
                  Property Showings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-[var(--color-bg-dark)] p-3 mb-3">
                    <AlertCircle className="text-gray-500" size={24} />
                  </div>
                  <p className="text-sm text-gray-400">
                    No showings scheduled yet
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-[var(--color-primary-gold)] hover:text-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold)]/10"
                  >
                    Schedule Showing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Showing History - Placeholder */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--color-text-light)]">
                Showing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-[var(--color-bg-dark)] p-4 mb-4">
                  <AlertCircle className="text-gray-500" size={32} />
                </div>
                <p className="text-gray-400">
                  No showings history available yet. Schedule showings to see
                  them here.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
          </>
        )}
      </div>

      {/* Delete Dialog */}
      {client && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[var(--color-text-light)]">
                Delete Client
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to delete {client.name}? This action can be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel className="border-[var(--color-border)] text-[var(--color-text-light)] hover:bg-[var(--color-bg-dark)]">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 text-white"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </DashboardLayout>
  )
}
