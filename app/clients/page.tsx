"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ClientsTable } from "@/components/client/clients-table"
import { CreateClientForm } from "@/components/client/create-client-form"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
// Firebase imports removed - using Supabase instead
// import { Client, subscribeToClients } from "@/lib/firebase/services"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { StatsCard } from "@/components/dashboard/stats-card"

export default function ClientsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const clients: any[] = []

  const stats = [
    {
      title: "Total Clients",
      value: clients.length,
      subtitle: "All Time",
      icon: Users,
      gradient: "from-[var(--color-bg-dark)] to-[var(--color-primary-gold)]",
    },
    {
      title: "Active",
      value: clients.filter((c) => c.status === "active").length,
      subtitle: "Current",
      icon: Users,
      gradient: "from-[var(--color-bg-dark)] to-[var(--color-success)]",
    },
    {
      title: "Buyers",
      value: clients.filter((c) => c.type === "buyer").length,
      subtitle: "Purchasing",
      icon: Users,
      gradient: "from-[var(--color-bg-dark)] to-blue-500",
    },
    {
      title: "Investors",
      value: clients.filter((c) => c.type === "investor").length,
      subtitle: "Portfolio",
      icon: Users,
      gradient: "from-[var(--color-bg-dark)] to-green-500",
    },
  ]

  const handleClientCreated = () => {
    setIsDialogOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[var(--color-text-light)] mb-2">
              Clients Management
            </h1>
            <p className="text-[var(--color-muted-foreground)]">
              Track and manage your property clients (Coming Soon)
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold)]/80 text-black font-semibold" disabled>
                <Plus className="w-4 h-4 mr-2" />
                New Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Client</DialogTitle>
              </DialogHeader>
              <CreateClientForm onSuccess={handleClientCreated} />
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
        {false && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
            Error loading clients
          </div>
        )}

        {/* Table */}
        <ClientsTable clients={clients} isLoading={false} />
      </div>
    </DashboardLayout>
  )
}
