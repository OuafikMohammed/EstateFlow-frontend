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

const lineData = [
  { name: "Week 1", leads: 12 },
  { name: "Week 2", leads: 19 },
  { name: "Week 3", leads: 15 },
  { name: "Week 4", leads: 25 },
  { name: "Week 5", leads: 22 },
  { name: "Week 6", leads: 30 },
]

const pieData = [
  { name: "Apartments", value: 45, color: "#C5A059" },
  { name: "Houses", value: 30, color: "#1B4332" },
  { name: "Commercial", value: 15, color: "#52B788" },
  { name: "Land", value: 10, color: "#E8D4A0" },
]

export function ChartSection() {
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
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={lineData}>
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
      </motion.div>

      {/* Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-6"
      >
        <h2 className="text-xl font-serif font-bold text-[var(--color-text-light)] mb-6">Properties by Type</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
              {pieData.map((entry, index) => (
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
          {pieData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-[var(--color-text-light)]">
                {item.name}: {item.value}%
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
