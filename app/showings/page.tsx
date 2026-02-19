"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar,
  Clock,
  Loader,
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getShowingsByDateRange } from "@/lib/actions/showings"

interface Showing {
  id: string
  property?: { id: string; title: string; address: string }
  property_id?: string
  client?: { id: string; name: string; phone: string }
  client_id?: string
  scheduled_at: string
  status: "scheduled" | "completed" | "cancelled"
  interest_level?: string | null
}

const statusColors = {
  scheduled: "rgb(197, 160, 89)",
  completed: "rgb(82, 183, 136)",
  cancelled: "rgb(128, 128, 128)",
}

const statusBgColors = {
  scheduled: "rgba(197, 160, 89, 0.1)",
  completed: "rgba(82, 183, 136, 0.1)",
  cancelled: "rgba(128, 128, 128, 0.1)",
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
}

export default function ShowingsPage() {
  const router = useRouter()
  const [showings, setShowings] = useState<Showing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Load showings when date filters change
  useEffect(() => {
    const loadShowings = async () => {
      try {
        setIsLoading(true)
        setError("")

        // Calculate date range - if no dates, use last 90 days
        const now = new Date()
        let startDate = fromDate ? new Date(fromDate) : new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        let endDate = toDate ? new Date(toDate) : new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

        // Call server action
        const result = await getShowingsByDateRange({
          from_date: startDate.toISOString(),
          to_date: endDate.toISOString(),
          limit: 100,
        })

        if (result.success && result.data?.items) {
          setShowings(result.data.items)
        } else {
          setError(result.error || "Failed to load showings")
          setShowings([])
        }
      } catch (err) {
        console.error("Failed to load showings:", err)
        setError("An error occurred while loading showings")
        setShowings([])
      } finally {
        setIsLoading(false)
      }
    }

    loadShowings()
  }, [fromDate, toDate])

  // Filter and sort showings
  const filteredShowings = showings.sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  )

  // Pagination
  const totalPages = Math.ceil(filteredShowings.length / itemsPerPage)
  const paginatedShowings = filteredShowings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
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

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <motion.div
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-light)]">
              Showings
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Schedule and track property showings
            </p>
          </div>
          <Link href="/showings/new">
            <Button className="w-full md:w-auto gap-2 rounded-lg border border-[var(--color-primary-gold)] bg-[var(--color-primary-gold)] text-[var(--color-bg-dark)] font-semibold hover:bg-[var(--color-primary-gold)] hover:opacity-90 transition-all">
              <Plus size={18} />
              Schedule Showing
            </Button>
          </Link>
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

        {/* Date Filters */}
        <motion.div
          className="flex flex-col gap-4 md:flex-row md:items-end md:gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              From Date
            </label>
            <div className="relative mt-2">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              To Date
            </label>
            <div className="relative mt-2">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <Input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
              />
            </div>
          </div>

          {(fromDate || toDate) && (
            <Button
              variant="ghost"
              onClick={() => {
                setFromDate("")
                setToDate("")
                setCurrentPage(1)
              }}
              className="text-[var(--color-primary-gold)] hover:bg-[var(--color-bg-card)]"
            >
              Clear Filters
            </Button>
          )}
        </motion.div>

        {/* Desktop Table View */}
        <motion.div
          className="hidden md:block rounded-lg border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-card)] shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader size={32} className="text-[var(--color-primary-gold)]" />
              </motion.div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader className="border-b border-[var(--color-border)]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-gray-400">Property</TableHead>
                  <TableHead className="text-gray-400">Client</TableHead>
                  <TableHead className="text-gray-400">Date & Time</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Interest</TableHead>
                  <TableHead className="text-right text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedShowings.length > 0 ? (
                  paginatedShowings.map((showing, index) => (
                    <motion.tr
                      key={showing.id}
                      className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-dark)] transition-colors"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell className="font-medium text-[var(--color-text-light)]">
                        <div>
                          <p className="font-semibold">{showing.property?.title || "Property"}</p>
                          <p className="text-xs text-gray-500">{showing.property?.address || ""}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-400">
                        <div>
                          <p className="font-medium text-[var(--color-text-light)]">{showing.client?.name || "Client"}</p>
                          <p className="text-xs">{showing.client?.phone || ""}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-[var(--color-primary-gold)]" />
                          <div>
                            <p>{formatDate(showing.scheduled_at)}</p>
                            <p className="text-xs text-gray-500">{formatTime(showing.scheduled_at)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="capitalize"
                          style={{
                            backgroundColor:
                              statusBgColors[
                                showing.status as keyof typeof statusBgColors
                              ],
                            color:
                              statusColors[
                                showing.status as keyof typeof statusColors
                              ],
                            border: `1px solid ${
                              statusColors[
                                showing.status as keyof typeof statusColors
                              ]
                            }`,
                          }}
                        >
                          {showing.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {showing.interest_level ? (
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className="text-lg">
                                {i < parseInt(showing.interest_level || "0") ? "★" : "☆"}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-[var(--color-bg-card)]"
                            >
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                          >
                            <DropdownMenuItem
                              onClick={() => router.push(`/showings/${showing.id}`)}
                              className="cursor-pointer hover:bg-[var(--color-bg-dark)]"
                            >
                              View Details
                            </DropdownMenuItem>
                            {showing.status === "scheduled" && (
                              <DropdownMenuItem
                                className="text-[var(--color-success)] cursor-pointer hover:bg-[var(--color-bg-dark)]"
                              >
                                Complete
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-[var(--color-danger)] cursor-pointer hover:bg-[var(--color-bg-dark)]">
                              <Trash2 size={16} className="mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                      No showings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </motion.div>

        {/* Mobile Card View */}
        <motion.div
          className="md:hidden space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader size={32} className="text-[var(--color-primary-gold)]" />
              </motion.div>
            </div>
          ) : paginatedShowings.length > 0 ? (
            paginatedShowings.map((showing) => (
              <motion.div key={showing.id} variants={itemVariants}>
                <Card
                  className="bg-[var(--color-bg-card)] border-[var(--color-border)] cursor-pointer hover:border-[var(--color-primary-gold)] transition-colors"
                  onClick={() => router.push(`/showings/${showing.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-[var(--color-text-light)]">
                          {showing.property?.title || "Property"}
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-1">{showing.property?.address || ""}</p>
                      </div>
                      <Badge
                        className="capitalize shrink-0"
                        style={{
                          backgroundColor:
                            statusBgColors[showing.status as keyof typeof statusBgColors],
                          color: statusColors[showing.status as keyof typeof statusColors],
                          border: `1px solid ${
                            statusColors[showing.status as keyof typeof statusColors]
                          }`,
                        }}
                      >
                        {showing.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Client</p>
                      <p className="text-sm text-[var(--color-text-light)] font-medium">
                        {showing.client?.name || "Client"}
                      </p>
                      <p className="text-xs text-gray-500">{showing.client?.phone || ""}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-[var(--color-primary-gold)]" />
                      <div>
                        <p className="text-[var(--color-text-light)]">
                          {formatDate(showing.scheduled_at)}
                        </p>
                        <p className="text-xs text-gray-500">{formatTime(showing.scheduled_at)}</p>
                      </div>
                    </div>
                    {showing.interest_level && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Interest</p>
                        <div className="flex gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className="text-lg">
                              {i < parseInt(showing.interest_level || "0") ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 rounded-lg border border-[var(--color-primary-gold)] text-[var(--color-primary-gold)] bg-transparent hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-bg-dark)] transition-all"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/showings/${showing.id}`)
                        }}
                      >
                        View
                      </Button>
                      {showing.status === "scheduled" && (
                        <Button
                          size="sm"
                          className="flex-1 rounded-lg bg-[var(--color-success)] hover:bg-[var(--color-success)]/80 text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
              <CardContent className="py-8 text-center text-gray-400">
                No showings found
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredShowings.length)} of{" "}
              {filteredShowings.length} showings
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-[var(--color-border)] text-[var(--color-text-light)] hover:bg-[var(--color-bg-card)]"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-[var(--color-border)] text-[var(--color-text-light)] hover:bg-[var(--color-bg-card)]"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
