"use client"

import { useAnalytics } from "@/hooks/use-data"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { motion } from "framer-motion"
import { ConversionChart } from "@/components/analytics/conversion-chart"
import { LeadStatusBreakdown } from "@/components/analytics/lead-status-breakdown"
import { PropertyMetrics } from "@/components/analytics/property-metrics"
import { BudgetAnalysis } from "@/components/analytics/budget-analysis"
import { RecentActivity } from "@/components/analytics/recent-activity"
import { Loader2 } from "lucide-react"

export default function AnalyticsPage() {
  const { data: analyticsData, isLoading, error } = useAnalytics()

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
            <Loader2 className="w-8 h-8 text-[var(--color-primary-gold)]" />
          </motion.div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !analyticsData?.data) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-8 text-center"
        >
          <p className="text-[var(--color-muted-foreground)]">
            {error ? "Error loading analytics" : "No analytics data available"}
          </p>
        </motion.div>
      </DashboardLayout>
    )
  }

  const analytics = analyticsData.data
  const stats = analyticsData.data?.stats || {}

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 pb-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold text-[var(--color-text-light)] mb-2">Analytics Dashboard</h1>
          <p className="text-[var(--color-muted-foreground)]">
            Comprehensive overview of your sales performance and property portfolio
          </p>
        </motion.div>

        {/* Conversion Rate */}
        <ConversionChart
          conversionRate={Math.round(analytics?.conversion_rate || 0)}
          totalLeads={analytics?.total_leads || 0}
          closedWonLeads={stats?.closed_won || 0}
        />

        {/* Lead Status Breakdown */}
        {analytics?.lead_status_breakdown && (
          <LeadStatusBreakdown
            data={analytics.lead_status_breakdown}
          />
        )}

        {/* Property Metrics */}
        {analytics?.property_type_breakdown && analytics?.property_status_breakdown && (
          <PropertyMetrics
            data={{
              total_properties: analytics.total_properties || 0,
              property_types: analytics.property_type_breakdown,
              property_status: analytics.property_status_breakdown,
            }}
          />
        )}

        {/* Budget Analysis */}
        {(analytics?.budget_stats?.avg_budget_min !== undefined || analytics?.budget_stats?.avg_budget_max !== undefined) && (
          <BudgetAnalysis
            data={{
              avg_budget_min: analytics.budget_stats?.avg_budget_min || null,
              avg_budget_max: analytics.budget_stats?.avg_budget_max || null,
            }}
          />
        )}

        {/* Recent Activity */}
        <RecentActivity
          leads={analytics?.recent_leads || []}
          properties={analytics?.recent_properties || []}
        />
      </motion.div>
    </DashboardLayout>
  )
}
