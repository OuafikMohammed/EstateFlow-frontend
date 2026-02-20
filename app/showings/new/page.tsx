"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { CreateShowingForm } from "@/components/showing/create-showing-form"

export default function NewShowingPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/showings")
  }

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

        {/* Form Component */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <CreateShowingForm onSuccess={handleSuccess} />
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
