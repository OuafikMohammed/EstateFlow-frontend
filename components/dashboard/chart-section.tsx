"use client"

import { motion } from "framer-motion"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Loader2 } from "lucide-react"
import { useLeadsTimeline, usePropertyBreakdown } from "@/hooks/use-data"

export function ChartSection() {
  const { data: timelineData = [], isLoading: timelineLoading } = useLeadsTimeline(30)
  const { data: breakdownData = [], isLoading: breakdownLoading } = usePropertyBreakdown()

  // Format timeline data for the chart
  const chartTimelineData = Array.isArray(timelineData) 
    ? timelineData.map((item: any) => ({
        name: item.name || item.date,
        leads: item.leads || item.count || 0,
      }))
    : []

  // Format breakdown data for pie chart
  const chartBreakdownData = Array.isArray(breakdownData)
    ? breakdownData.map((item: any) => ({
        name: item.name,
        value: item.value,
        color: item.color,
      }))
    : [
        { name: "Apartments", value: 45, color: "#C5A059" },
        { name: "Houses", value: 30, color: "#1B4332" },
        { name: "Commercial", value: 15, color: "#52B788" },
        { name: "Land", value: 10, color: "#E8D4A0" },
      ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="lg:col-span-2 glass rounded-xl p-6"
      >
        <h2 className="text-xl font-serif font-bold text-[var(--color-text-light)] mb-6">Leads Over Time</h2>
        {timelineLoading ? (
          <div className="flex justify-center items-center h-80">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-gold)]" />
          </div>
        ) : chartTimelineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartTimelineData}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C5A059" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="name" stroke="#A0A0A0" />
              <YAxis stroke="#A0A0A0" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2A2A2A",
                  borderRadius: "8px",
                  color: "#F8F9FA",
                }}
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="#C5A059"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLeads)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-80 text-[var(--color-muted-foreground)]">
            No data available
          </div>
        )}
      </motion.div>

      {/* Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-6"
      >
        <h2 className="text-xl font-serif font-bold text-[var(--color-text-light)] mb-6">Properties by Type</h2>
        {breakdownLoading ? (
          <div className="flex justify-center items-center h-80">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-gold)]" />
          </div>
        ) : chartBreakdownData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #2A2A2A",
                    borderRadius: "8px",
                    color: "#F8F9FA",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {chartBreakdownData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-[var(--color-text-light)]">
                    {item.name}: {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-80 text-[var(--color-muted-foreground)]">
            No data available
          </div>
        )}
      </motion.div>
    </div>
  )
}
