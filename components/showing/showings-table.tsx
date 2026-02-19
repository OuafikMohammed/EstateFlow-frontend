"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Trash2, Search, Edit, Check, X, Star } from "lucide-react"
import { updateShowing, cancelShowing } from "@/lib/actions/showings"
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
  client_id: string
  scheduled_at: Date | string
  status: "scheduled" | "completed" | "cancelled"
  interest_level?: string | null
  notes?: string
  property?: { title: string; address: string }
  client?: { name: string; phone?: string }
  [key: string]: any
}

interface ShowingsTableProps {
  showings: Showing[]
  isLoading: boolean
  onRefresh?: () => void
}

interface EditingRow {
  showingId: string
  field: "status" | "interest_level"
  value: string | null
}

export function ShowingsTable({ showings, isLoading, onRefresh }: ShowingsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [filteredShowings, setFilteredShowings] = useState<Showing[]>(showings)
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let filtered = showings

    if (searchQuery) {
      filtered = filtered.filter(
        (showing) =>
          (showing.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            showing.property?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            showing.client_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            showing.property_id.toLowerCase().includes(searchQuery.toLowerCase())),
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
      const result = await cancelShowing(id)
      if (result.success) {
        toast({
          title: "Success",
          description: "Showing cancelled successfully",
        })
        if (onRefresh) onRefresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to cancel showing",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel showing",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (showing: Showing, newStatus: string) => {
    if (editingRow?.showingId === showing.id && editingRow?.field === "status") {
      // If already editing this field, confirm the change
      try {
        setIsUpdating(true)
        const result = await updateShowing(showing.id, {
          status: newStatus as "scheduled" | "completed" | "cancelled",
        })

        if (result.success) {
          toast({
            title: "Success",
            description: "Status updated successfully",
          })
          setEditingRow(null)
          if (onRefresh) onRefresh()
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update status",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update status",
          variant: "destructive",
        })
      } finally {
        setIsUpdating(false)
      }
    } else {
      // Start editing
      setEditingRow({
        showingId: showing.id,
        field: "status",
        value: newStatus,
      })
    }
  }

  const handleInterestLevelChange = async (showing: Showing, level: string) => {
    if (editingRow?.showingId === showing.id && editingRow?.field === "interest_level") {
      // If already editing this field, confirm the change
      try {
        setIsUpdating(true)
        const result = await updateShowing(showing.id, {
          interest_level: level as "1" | "2" | "3" | "4" | "5",
        })

        if (result.success) {
          toast({
            title: "Success",
            description: "Interest level updated successfully",
          })
          setEditingRow(null)
          if (onRefresh) onRefresh()
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update interest level",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update interest level",
          variant: "destructive",
        })
      } finally {
        setIsUpdating(false)
      }
    } else {
      // Start editing
      setEditingRow({
        showingId: showing.id,
        field: "interest_level",
        value: level,
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingRow(null)
  }

  const renderStarRating = (level: string | null | undefined, showing: Showing, isEditing: boolean) => {
    const currentLevel = isEditing && editingRow?.value ? parseInt(editingRow.value) : (level ? parseInt(level) : 0)

    return (
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !isUpdating && handleInterestLevelChange(showing, star.toString())}
            disabled={isUpdating}
            className={`transition-colors ${
              star <= currentLevel ? "text-yellow-400" : "text-gray-300"
            } hover:text-yellow-400`}
            title={`${star} star${star !== 1 ? "s" : ""}`}
          >
            <Star className="w-4 h-4 fill-current" />
          </button>
        ))}
        {isEditing && editingRow?.showingId === showing.id && editingRow?.field === "interest_level" && (
          <div className="ml-2 flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleInterestLevelChange(showing, editingRow.value || "")}
              disabled={isUpdating}
              className="h-6 w-6 p-0"
            >
              <Check className="w-3 h-3 text-green-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelEdit}
              disabled={isUpdating}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3 text-red-600" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  const formatDate = (date: Date | string | any) => {
    if (date?.toDate) {
      return date.toDate().toLocaleDateString()
    }
    if (date instanceof Date) {
      return date.toLocaleDateString()
    }
    return new Date(date).toLocaleDateString()
  }

  const formatTime = (date: Date | string | any) => {
    if (date instanceof Date) {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    }
    return new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
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
              <TableHead>Property</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShowings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
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
                  <TableCell className="font-medium text-sm">
                    <div>
                      <p className="font-semibold">{showing.property?.title || showing.property_id}</p>
                      <p className="text-xs text-gray-500">{showing.property?.address || ""}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <p className="font-medium">{showing.client?.name || showing.client_id}</p>
                    {showing.client?.phone && <p className="text-xs text-gray-500">{showing.client.phone}</p>}
                  </TableCell>
                  <TableCell className="text-sm">
                    <p>{formatDate(showing.scheduled_at)}</p>
                    <p className="text-xs text-gray-500">{formatTime(showing.scheduled_at)}</p>
                  </TableCell>
                  <TableCell>
                    {editingRow?.showingId === showing.id && editingRow?.field === "status" ? (
                      <div className="flex gap-1 items-center">
                        <Select
                          value={editingRow.value || showing.status}
                          onValueChange={(value) =>
                            setEditingRow({
                              ...editingRow,
                              value,
                            })
                          }
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="no-show">No Show</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(showing, editingRow.value || showing.status)}
                          disabled={isUpdating}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="w-3 h-3 text-green-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={isUpdating} className="h-6 w-6 p-0">
                          <X className="w-3 h-3 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <Badge
                        className={`${getStatusColor(showing.status)} text-xs font-semibold cursor-pointer hover:opacity-80`}
                        onClick={() => handleStatusChange(showing, showing.status)}
                      >
                        {showing.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {renderStarRating(
                      showing.interest_level,
                      showing,
                      editingRow?.showingId === showing.id && editingRow?.field === "interest_level"
                    )}
                  </TableCell>
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
                        title="Cancel"
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
