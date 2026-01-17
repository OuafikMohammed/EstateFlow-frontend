"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Trash2, Search, Edit } from "lucide-react"
// Firebase imports removed - using Supabase instead
// import { Showing } from "@/lib/firebase/services"
// import { deleteShowing, updateShowing } from "@/lib/firebase/services"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"

interface Showing {
  id: string
  property_id: string
  agent_id: string
  client_id: string
  scheduled_date: Date | string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  [key: string]: any
}

interface ShowingsTableProps {
  showings: Showing[]
  isLoading: boolean
  onRefresh?: () => void
}

export function ShowingsTable({ showings, isLoading, onRefresh }: ShowingsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [filteredShowings, setFilteredShowings] = useState<Showing[]>(showings)
  const { toast } = useToast()

  useEffect(() => {
    let filtered = showings

    if (searchQuery) {
      filtered = filtered.filter(
        (showing) =>
          showing.client_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          showing.property_id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((showing) => showing.status === statusFilter)
    }

    setFilteredShowings(filtered)
  }, [showings, searchQuery, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500 text-white"
      case "completed":
        return "bg-green-500 text-white"
      case "cancelled":
        return "bg-red-500 text-white"
      case "no-show":
        return "bg-yellow-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const handleDeleteShowing = async (id: string) => {
    try {
      // await deleteShowing(id)  // Firebase function - will be replaced with Supabase
      toast({
        title: "Success",
        description: "Showing deleted successfully",
      })
      if (onRefresh) onRefresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete showing",
        variant: "destructive",
      })
    }
  }

  const formatDate = (date: Date | any) => {
    if (date?.toDate) {
      return date.toDate().toLocaleDateString()
    }
    if (date instanceof Date) {
      return date.toLocaleDateString()
    }
    return new Date(date).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="glass rounded-xl p-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
          <Input
            placeholder="Search by client or property..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no-show">No Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property ID</TableHead>
              <TableHead>Client ID</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Agent ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShowings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-[var(--color-muted-foreground)]">No showings found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredShowings.map((showing, index) => (
                <motion.tr
                  key={showing.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  <TableCell className="font-medium text-sm">{showing.property_id}</TableCell>
                  <TableCell className="text-sm">{showing.client_id}</TableCell>
                  <TableCell className="text-sm">{formatDate(showing.scheduled_date)}</TableCell>
                  <TableCell className="text-sm">{showing.agent_id}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(showing.status)} text-xs font-semibold`}>
                      {showing.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm truncate max-w-xs">{showing.notes || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[var(--color-primary-gold)]"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteShowing(showing.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-[var(--color-muted-foreground)]">
        Showing {filteredShowings.length} of {showings.length} showings
      </div>
    </div>
  )
}
