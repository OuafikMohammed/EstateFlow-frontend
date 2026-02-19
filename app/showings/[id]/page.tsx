"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  MapPin,
  User,
  Calendar,
  Clock,
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { completeShowing, cancelShowing } from "@/lib/actions/showings"

interface Showing {
  id: string
  property: {
    id: string
    title: string
    address: string
    bedrooms?: number
    bathrooms?: number
    price?: number
  }
  client: {
    id: string
    name: string
    email: string
    phone: string
  }
  agent: {
    id: string
    email: string
    full_name?: string
  }
  scheduled_at: string
  status: "scheduled" | "completed" | "cancelled"
  feedback: string | null
  interest_level: string | null
}

export default function ShowingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const showingId = params.id as string

  const [showing, setShowing] = useState<Showing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string>("")
  const [feedback, setFeedback] = useState("")
  const [interestLevel, setInterestLevel] = useState(0)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)

  // Load showing details on mount
  useEffect(() => {
    const loadShowing = async () => {
      try {
        setIsLoading(true)
        setError("")

        // For demo: using mock data
        // In production, you'd fetch from a getShowingById server action
        const mockShowings: Record<string, Showing> = {
          "1": {
            id: "1",
            property: {
              id: "1",
              title: "Luxury Downtown Penthouse",
              address: "123 Main St, Downtown",
              bedrooms: 3,
              bathrooms: 2,
              price: 950000,
            },
            client: {
              id: "1",
              name: "John Smith",
              email: "john@example.com",
              phone: "+1 (555) 123-4567",
            },
            agent: {
              id: "1",
              email: "sarah@agent.com",
              full_name: "Sarah",
            },
            scheduled_at: new Date(Date.now() + 86400000).toISOString(),
            status: "scheduled",
            feedback: null,
            interest_level: null,
          },
          "3": {
            id: "3",
            property: {
              id: "3",
              title: "Suburban Family Home",
              address: "789 Oak Lane, Suburbs",
              bedrooms: 4,
              bathrooms: 3,
              price: 450000,
            },
            client: {
              id: "3",
              name: "Michael Chen",
              email: "michael@example.com",
              phone: "+1 (555) 345-6789",
            },
            agent: {
              id: "1",
              email: "sarah@agent.com",
              full_name: "Sarah",
            },
            scheduled_at: new Date(Date.now() - 86400000).toISOString(),
            status: "completed",
            feedback: "Great viewing experience. Positive feedback from client.",
            interest_level: "4",
          },
        }

        const showingData = mockShowings[showingId]
        if (showingData) {
          setShowing(showingData)
          setFeedback(showingData.feedback || "")
          setInterestLevel(showingData.interest_level ? parseInt(showingData.interest_level) : 0)
        } else {
          setError("Showing not found")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load showing")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadShowing()
  }, [showingId])

  const handleCompleteShowing = async () => {
    if (!showing || interestLevel === 0) {
      setError("Please select an interest level")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const result = await completeShowing({
        id: showing.id,
        feedback: feedback || undefined,
        interest_level: interestLevel.toString(),
      })

      if (!result.success) {
        setError(result.error || "Failed to complete showing")
        return
      }

      router.push("/showings")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete showing")
      console.error(err)
    } finally {
      setIsSaving(false)
      setShowCompleteDialog(false)
    }
  }

  const handleCancelShowing = async () => {
    if (!showing) return

    setIsSaving(true)
    setError("")

    try {
      const result = await cancelShowing(showing.id)

      if (!result.success) {
        setError(result.error || "Failed to cancel showing")
        return
      }

      router.push("/showings")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel showing")
      console.error(err)
    } finally {
      setIsSaving(false)
      setShowCancelDialog(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const statusColors = {
    scheduled: { bg: "rgba(197, 160, 89, 0.1)", color: "rgb(197, 160, 89)" },
    completed: { bg: "rgba(82, 183, 136, 0.1)", color: "rgb(82, 183, 136)" },
    cancelled: { bg: "rgba(128, 128, 128, 0.1)", color: "rgb(128, 128, 128)" },
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader size={32} className="text-[var(--color-primary-gold)]" />
          </motion.div>
        </div>
      </DashboardLayout>
    )
  }

  if (!showing) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-xl text-[var(--color-text-light)]">Showing not found</h2>
            <Link href="/showings">
              <Button className="mt-4 text-[var(--color-primary-gold)]">Back to Showings</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
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

          <Badge
            style={{
              backgroundColor: statusColors[showing.status as keyof typeof statusColors].bg,
              color: statusColors[showing.status as keyof typeof statusColors].color,
              border: `1px solid ${statusColors[showing.status as keyof typeof statusColors].color}`,
            }}
            className="capitalize"
          >
            {showing.status}
          </Badge>
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {/* Property Info */}
            <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--color-text-light)]">
                  <MapPin size={20} className="text-[var(--color-primary-gold)]" />
                  Property
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-light)]">
                    {showing.property.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{showing.property.address}</p>
                </div>
                {showing.property.bedrooms && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--color-border)]">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Bedrooms</p>
                      <p className="text-lg font-semibold text-[var(--color-text-light)]">
                        {showing.property.bedrooms}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Bathrooms</p>
                      <p className="text-lg font-semibold text-[var(--color-text-light)]">
                        {showing.property.bathrooms}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Price</p>
                      <p className="text-lg font-semibold text-[var(--color-primary-gold)]">
                        ${showing.property.price ? (showing.property.price / 1000000).toFixed(1) : "N/A"}M
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client & Agent Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Info */}
              <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--color-text-light)]">
                    <User size={20} className="text-[var(--color-primary-gold)]" />
                    Client
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Name</p>
                    <p className="text-sm font-semibold text-[var(--color-text-light)]">
                      {showing.client.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                    <p className="text-sm text-[var(--color-text-light)] break-all">
                      {showing.client.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                    <p className="text-sm text-[var(--color-text-light)]">{showing.client.phone}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Agent Info */}
              <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--color-text-light)]">
                    <User size={20} className="text-[var(--color-primary-gold)]" />
                    Agent
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Name</p>
                    <p className="text-sm font-semibold text-[var(--color-text-light)]">
                      {showing.agent.full_name || "Agent"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                    <p className="text-sm text-[var(--color-text-light)] break-all">
                      {showing.agent.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Appointment Details */}
            <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--color-text-light)]">
                  <Calendar size={20} className="text-[var(--color-primary-gold)]" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                    <p className="text-sm font-semibold text-[var(--color-text-light)] mt-1">
                      {formatDate(showing.scheduled_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Time</p>
                    <p className="text-sm font-semibold text-[var(--color-text-light)] mt-1">
                      {formatTime(showing.scheduled_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Section - Only shown for completed showings */}
            {showing.status === "completed" && (
              <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--color-text-light)]">
                    <MessageSquare size={20} className="text-[var(--color-primary-gold)]" />
                    Feedback & Rating
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showing.feedback && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Notes</p>
                      <p className="text-sm text-[var(--color-text-light)] mt-2 leading-relaxed">
                        {showing.feedback}
                      </p>
                    </div>
                  )}

                  {showing.interest_level && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Interest Level</p>
                      <div className="flex gap-2 mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="text-2xl">
                              {showing.interest_level && i < parseInt(showing.interest_level) ? "★" : "☆"}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {showing.interest_level} out of 5 stars
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Right Column - Actions */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            {/* Status Card */}
            <Card className="bg-gradient-to-br from-[var(--color-primary-gold)]/10 to-transparent border-[var(--color-primary-gold)]/20">
              <CardHeader>
                <CardTitle className="text-[var(--color-text-light)]">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Current Status</p>
                  <Badge
                    className="mt-2 capitalize"
                    style={{
                      backgroundColor:
                        statusColors[showing.status as keyof typeof statusColors].bg,
                      color: statusColors[showing.status as keyof typeof statusColors].color,
                      border: `1px solid ${
                        statusColors[showing.status as keyof typeof statusColors].color
                      }`,
                    }}
                  >
                    {showing.status}
                  </Badge>
                </div>

                {showing.status === "scheduled" && (
                  <Button
                    onClick={() => setShowCompleteDialog(true)}
                    className="w-full rounded-lg bg-[var(--color-success)] hover:bg-[var(--color-success)]/80 text-white font-semibold"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Complete Showing
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Complete Showing Form - Only for scheduled */}
            {showing.status === "scheduled" && (
              <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
                <CardHeader>
                  <CardTitle className="text-[var(--color-text-light)]">
                    Complete This Showing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Interest Rating */}
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Interest Level
                    </label>
                    <div className="flex gap-2 mt-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setInterestLevel(i + 1)}
                          className="text-3xl transition-all hover:scale-110"
                        >
                          {i < interestLevel ? (
                            <span className="text-[var(--color-primary-gold)]">★</span>
                          ) : (
                            <span className="text-gray-600 hover:text-[var(--color-primary-gold)]">
                              ☆
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    {interestLevel > 0 && (
                      <p className="text-xs text-gray-400 mt-2">
                        {interestLevel} out of 5 stars
                      </p>
                    )}
                  </div>

                  {/* Feedback */}
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Feedback (Optional)
                    </label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Add any notes about this showing..."
                      className="mt-2 bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)] min-h-[100px]"
                    />
                  </div>

                  <Button
                    onClick={handleCompleteShowing}
                    disabled={isSaving || interestLevel === 0}
                    className="w-full rounded-lg bg-[var(--color-success)] hover:bg-[var(--color-success)]/80 text-white font-semibold disabled:opacity-50"
                  >
                    {isSaving ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Cancel Button - Always visible except for cancelled/completed */}
            {showing.status !== "cancelled" && (
              <Button
                onClick={() => setShowCancelDialog(true)}
                disabled={isSaving}
                className="w-full rounded-lg border border-[var(--color-danger)] text-[var(--color-danger)] bg-transparent hover:bg-[var(--color-danger)]/10 font-semibold disabled:opacity-50"
              >
                <XCircle size={16} className="mr-2" />
                Cancel Showing
              </Button>
            )}
          </motion.div>
        </div>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[var(--color-text-light)]">
                Cancel Showing?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to cancel this showing? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3">
              <AlertDialogCancel className="border-[var(--color-border)] text-[var(--color-text-light)] hover:bg-[var(--color-bg-dark)]">
                Keep It
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelShowing}
                disabled={isSaving}
                className="bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/80 text-white disabled:opacity-50"
              >
                {isSaving ? "Cancelling..." : "Cancel Showing"}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Complete Confirmation Dialog */}
        <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <AlertDialogContent className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[var(--color-text-light)]">
                Complete Showing Form?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Please fill out the feedback form on the right to complete this showing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3">
              <AlertDialogCancel className="border-[var(--color-border)] text-[var(--color-text-light)] hover:bg-[var(--color-bg-dark)]">
                Got It
              </AlertDialogCancel>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
