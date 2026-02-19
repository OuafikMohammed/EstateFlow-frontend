"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Search,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Client {
  id: string
  name: string
  phone: string
  email: string
  status: "hot" | "warm" | "cold"
  budget_min: number | null
  budget_max: number | null
  source?: string
}

const statusColors = {
  hot: "rgb(239, 35, 60)",
  warm: "rgb(197, 160, 89)",
  cold: "rgb(82, 183, 136)",
}

const statusBgColors = {
  hot: "rgba(239, 35, 60, 0.1)",
  warm: "rgba(197, 160, 89, 0.1)",
  cold: "rgba(82, 183, 136, 0.1)",
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

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
        })
        
        if (statusFilter !== "all") {
          params.append("status", statusFilter)
        }
        
        if (searchTerm) {
          params.append("q", searchTerm)
        }

        const response = await fetch(`/api/clients?${params}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch clients")
        }

        const data = await response.json()
        setClients(data.data.items || [])
      } catch (err) {
        console.error("Error fetching clients:", err)
        setError("Failed to load clients. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [currentPage, statusFilter, searchTerm])

  // Handle delete client
  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client?")) {
      return
    }

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete client")
      }

      setClients(clients.filter((c) => c.id !== clientId))
    } catch (err) {
      console.error("Error deleting client:", err)
      setError("Failed to delete client")
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Loading clients...</div>
        </div>
      </DashboardLayout>
    )
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
              Clients
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Manage your real estate clients and leads
            </p>
          </div>
          <Link href="/clients/new">
            <Button
              className="w-full md:w-auto gap-2 rounded-lg border border-[var(--color-primary-gold)] bg-[var(--color-primary-gold)] text-[var(--color-bg-dark)] font-semibold hover:bg-[var(--color-primary-gold)] hover:opacity-90 transition-all"
            >
              <Plus size={18} />
              New Client
            </Button>
          </Link>
        </motion.div>

        {error && (
          <motion.div
            className="p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg text-red-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          className="flex flex-col gap-4 md:flex-row md:items-end md:gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Search
            </label>
            <div className="relative mt-2">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <Input
                placeholder="Name, phone, or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)] placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="w-full md:w-48">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Status
            </label>
            <Select 
              value={statusFilter} 
              onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="mt-2 bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="hot">🔥 Hot</SelectItem>
                <SelectItem value="warm">🟠 Warm</SelectItem>
                <SelectItem value="cold">❄️ Cold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Desktop Table View */}
        <motion.div
          className="hidden md:block rounded-lg border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-card)] shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-[var(--color-border)]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-gray-400">Name</TableHead>
                  <TableHead className="text-gray-400">Phone</TableHead>
                  <TableHead className="text-gray-400">Email</TableHead>
                  <TableHead className="text-gray-400">Budget</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-right text-gray-400">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length > 0 ? (
                  clients.map((client, index) => (
                    <motion.tr
                      key={client.id}
                      className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-dark)] transition-colors"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell className="font-medium text-[var(--color-text-light)]">
                        {client.name}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {client.phone}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {client.email}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {client.budget_min && client.budget_max ? (
                          <>
                            ${client.budget_min.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} - $
                            {client.budget_max.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </>
                        ) : (
                          "Not set"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="capitalize"
                          style={{
                            backgroundColor:
                              statusBgColors[
                                client.status as keyof typeof statusBgColors
                              ],
                            color:
                              statusColors[
                                client.status as keyof typeof statusColors
                              ],
                            border: `1px solid ${
                              statusColors[
                                client.status as keyof typeof statusColors
                              ]
                            }`,
                          }}
                        >
                          {client.status}
                        </Badge>
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
                              onClick={() => router.push(`/clients/${client.id}`)}
                              className="cursor-pointer hover:bg-[var(--color-bg-dark)]"
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/clients/${client.id}/edit`)
                              }
                              className="cursor-pointer hover:bg-[var(--color-bg-dark)]"
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClient(client.id)}
                              className="text-[var(--color-danger)] cursor-pointer hover:bg-[var(--color-bg-dark)]"
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-400"
                    >
                      No clients found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* Mobile Card View */}
        <motion.div
          className="md:hidden space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {clients.length > 0 ? (
            clients.map((client) => (
              <motion.div key={client.id} variants={itemVariants}>
                <Card
                  className="bg-[var(--color-bg-card)] border-[var(--color-border)] cursor-pointer hover:border-[var(--color-primary-gold)] transition-colors"
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-[var(--color-text-light)]">
                          {client.name}
                        </CardTitle>
                      </div>
                      <Badge
                        className="capitalize shrink-0"
                        style={{
                          backgroundColor:
                            statusBgColors[
                              client.status as keyof typeof statusBgColors
                            ],
                          color:
                            statusColors[
                              client.status as keyof typeof statusColors
                            ],
                          border: `1px solid ${
                            statusColors[
                              client.status as keyof typeof statusColors
                            ]
                          }`,
                        }}
                      >
                        {client.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Phone
                      </p>
                      <p className="text-sm text-[var(--color-text-light)]">
                        {client.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Email
                      </p>
                      <p className="text-sm text-[var(--color-text-light)] break-all">
                        {client.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Budget
                      </p>
                      <p className="text-sm text-[var(--color-text-light)]">
                        {client.budget_min && client.budget_max ? (
                          <>
                            ${client.budget_min.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} - $
                            {client.budget_max.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </>
                        ) : (
                          "Not set"
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 rounded-lg border border-[var(--color-primary-gold)] text-[var(--color-primary-gold)] bg-transparent hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-bg-dark)] transition-all"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/clients/${client.id}`)
                        }}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-lg bg-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:opacity-80"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClient(client.id)
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="bg-[var(--color-bg-card)] border-[var(--color-border)]">
              <CardContent className="py-8 text-center text-gray-400">
                No clients found
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
