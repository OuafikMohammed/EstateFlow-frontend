"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ShowingsTable } from "@/components/showing/showings-table"
import { CreateShowingForm } from "@/components/showing/create-showing-form"
import { Button } from "@/components/ui/button"
import { Plus, Calendar } from "lucide-react"
import { Showing, subscribeToShowings } from "@/lib/firebase/services"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { StatsCard } from "@/components/dashboard/stats-card"

export default function ShowingsPage() {
  const [showings, setShowings] = useState<Showing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    const unsubscribe = subscribeToShowings(
      (data) => {
        setShowings(data)
        setIsLoading(false)
      },
      [],
      (err) => {
        setError(err.message)
        setIsLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const stats = [
    {
      title: "Total Showings",
      value: showings.length,
      subtitle: "All Time",
      icon: Calendar,
      gradient: "from-[var(--color-bg-dark)] to-[var(--color-primary-gold)]",
    },
    {
      title: "Scheduled",
      value: showings.filter((s) => s.status === "scheduled").length,
      subtitle: "Upcoming",
      icon: Calendar,
      gradient: "from-[var(--color-bg-dark)] to-blue-500",
    },
    {
      title: "Completed",
      value: showings.filter((s) => s.status === "completed").length,
      subtitle: "Finished",
      icon: Calendar,
      gradient: "from-[var(--color-bg-dark)] to-[var(--color-success)]",
    },
    {
      title: "Cancelled",
      value: showings.filter((s) => s.status === "cancelled" || s.status === "no-show").length,
      subtitle: "Not Shown",
      icon: Calendar,
      gradient: "from-[var(--color-bg-dark)] to-[var(--color-danger)]",
    },
  ]

  const handleShowingCreated = () => {
    setIsDialogOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[var(--color-text-light)] mb-2">
              Property Showings
            </h1>
            <p className="text-[var(--color-muted-foreground)]">
              Manage and track all property showings
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold)]/80 text-black font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                New Showing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Showing</DialogTitle>
              </DialogHeader>
              <CreateShowingForm onSuccess={handleShowingCreated} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </motion.div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
            Error: {error}
          </div>
        )}

        {/* Table */}
        <ShowingsTable showings={showings} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  )
}
