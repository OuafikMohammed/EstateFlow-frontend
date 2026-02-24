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
import { Loader2, TrendingUp } from "lucide-react"
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

  const totalLeads = chartTimelineData.reduce((sum, item) => sum + item.leads, 0)

  return (
    <div className="space-y-6">
      {/* Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-6 border border-[var(--color-border)]/30 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-light)] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--color-primary-gold)]" />
              Leads Growth Over Time
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
              Statistics for the last 30 days
            </p>
          </div>
          {totalLeads > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-[var(--color-primary-gold)] to-[var(--color-accent)] rounded-lg px-4 py-2"
            >
              <p className="text-sm text-white font-semibold">
                {totalLeads} leads
              </p>
            </motion.div>
          )}
        </div>

        {timelineLoading ? (
          <div className="flex justify-center items-center h-80">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
              <Loader2 className="w-8 h-8 text-[var(--color-primary-gold)]" />
            </motion.div>
          </div>
        ) : chartTimelineData.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartTimelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255, 255, 255, 0.1)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-muted-foreground)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(26, 26, 26, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "#F8F9FA",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                  }}
                  cursor={{ fill: "rgba(197, 160, 89, 0.1)" }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#C5A059"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorLeads)"
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center h-80 text-[var(--color-muted-foreground)]"
          >
            No data available
          </motion.div>
        )}
      </motion.div>

      {/* Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-6 border border-[var(--color-border)]/30"
      >
        <h2 className="text-lg font-bold text-[var(--color-text-light)] mb-6">
          Properties Distribution by Type
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {breakdownLoading ? (
            <div className="lg:col-span-3 flex justify-center items-center h-80">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                <Loader2 className="w-8 h-8 text-[var(--color-primary-gold)]" />
              </motion.div>
            </div>
          ) : chartBreakdownData.length > 0 ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-1 flex items-center justify-center"
              >
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {chartBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} opacity={0.9} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(26, 26, 26, 0.95)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        color: "#F8F9FA",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="lg:col-span-2 space-y-3"
              >
                {chartBreakdownData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="bg-[var(--color-bg-card)]/50 rounded-lg p-4 border border-[var(--color-border)]/20 hover:border-[var(--color-border)]/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                          whileHover={{ scale: 1.2 }}
                        />
                        <span className="text-[var(--color-text-light)] font-medium">
                          {item.name}
                        </span>
                      </div>
                      <motion.span
                        className="text-[var(--color-primary-gold)] font-bold group-hover:text-[var(--color-accent)] transition-colors"
                        whileHover={{ scale: 1.1 }}
                      >
                        {item.value}%
                      </motion.span>
                    </div>
                    <div className="mt-2 h-2 bg-[var(--color-border)]/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.55 + index * 0.05 }}
                        className="h-full bg-gradient-to-r"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${item.color}, ${item.color}dd)`,
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="lg:col-span-3 flex justify-center items-center h-80 text-[var(--color-muted-foreground)]"
            >
              No data available
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
