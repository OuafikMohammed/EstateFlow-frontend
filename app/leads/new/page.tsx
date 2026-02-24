"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CreateLeadForm } from "@/components/lead/create-lead-form"

export default function CreateLeadPage() {
  return (
    <DashboardLayout>
      <div className="py-8">
        <CreateLeadForm />
      </div>
    </DashboardLayout>
  )
}
