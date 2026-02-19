"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Loader2, Edit2, Trash2, AlertCircle, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useProperties, useCurrentUserProfile, useDeleteProperty } from "@/hooks/use-data"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DeleteConfirmProps {
  isOpen: boolean
  propertyTitle: string
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

function DeleteConfirmationDialog({ isOpen, propertyTitle, isDeleting, onConfirm, onCancel }: DeleteConfirmProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--color-bg-card)] rounded-xl max-w-md w-full border border-[var(--color-border)]"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-serif font-bold text-[var(--color-text-light)]">Delete Property</h2>
          </div>

          <p className="text-[var(--color-muted-foreground)] mb-4">
            Are you sure you want to delete <span className="font-semibold text-[var(--color-text-light)]">"{propertyTitle}"</span>?
          </p>

          <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
            This action cannot be undone. The property and all associated data will be permanently deleted.
          </p>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isDeleting}
              className="border-[var(--color-border)] text-[var(--color-text-light)]"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Property
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ManagePropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [propertyType, setPropertyType] = useState<string | undefined>("all")
  const [propertyStatus, setPropertyStatus] = useState<string | undefined>("all")
  const [sortBy, setSortBy] = useState("created_at")
  const [page, setPage] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)
  const [deleteState, setDeleteState] = useState<{
    isOpen: boolean
    propertyId: string
    propertyTitle: string
  }>({
    isOpen: false,
    propertyId: "",
    propertyTitle: "",
  })
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const { data: userProfile } = useCurrentUserProfile()
  const deleteProperty = useDeleteProperty()

  // Set user ID when available
  useEffect(() => {
    if (userProfile?.id) {
      setUserId(userProfile.id)
    }
  }, [userProfile])

  // Fetch only user's own properties
  const { data: propertiesData, isLoading, error, refetch } = useProperties({
    page,
    limit: 10,
    propertyType: propertyType !== "all" ? propertyType : undefined,
    status: propertyStatus !== "all" ? propertyStatus : undefined,
    sortBy,
    sortOrder: "desc",
    searchQuery: searchQuery || undefined,
  })

  const properties = propertiesData?.items?.filter((p) => p.created_by === userId) || []
  const total = properties.length
  const pages = Math.ceil(total / 10)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "under_contract":
        return "bg-blue-100 text-blue-800"
      case "sold":
        return "bg-gray-100 text-gray-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "withdrawn":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    const typeMap: Record<string, string> = {
      house: "bg-blue-100 text-blue-800",
      condo: "bg-cyan-100 text-cyan-800",
      commercial: "bg-orange-100 text-orange-800",
      land: "bg-green-100 text-green-800",
      multi_family: "bg-indigo-100 text-indigo-800",
      townhouse: "bg-pink-100 text-pink-800",
    }
    return typeMap[type] || "bg-gray-100 text-gray-800"
  }

  const handleDeleteClick = (propertyId: string, propertyTitle: string) => {
    setDeleteState({
      isOpen: true,
      propertyId,
      propertyTitle,
    })
  }

  const handleConfirmDelete = async () => {
    setIsDeletingId(deleteState.propertyId)
    try {
      await deleteProperty.mutateAsync(deleteState.propertyId)
      toast({
        title: "Success",
        description: "Property deleted successfully",
      })
      setDeleteState({ isOpen: false, propertyId: "", propertyTitle: "" })
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete property",
        variant: "destructive",
      })
    } finally {
      setIsDeletingId(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteState({ isOpen: false, propertyId: "", propertyTitle: "" })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/properties">
              <Button
                variant="ghost"
                size="icon"
                className="text-[var(--color-text-light)] hover:bg-[var(--color-bg-card)]"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-text-light)]">
                Manage Properties
              </h1>
              <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                Edit and manage your property listings
              </p>
            </div>
          </div>
          <Link href="/properties/new">
            <Button className="flex items-center gap-2 bg-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold-dark)] w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              New Property
            </Button>
          </Link>
        </div>

        {/* Filters - Responsive Grid */}
        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
              />
            </div>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="land">Land</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="multi_family">Multi-Family</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
              </SelectContent>
            </Select>
            <Select value={propertyStatus} onValueChange={setPropertyStatus}>
              <SelectTrigger className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="under_contract">Under Contract</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Newest</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-gold)]" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass rounded-xl p-6 bg-red-500/10 border border-red-500/20">
            <p className="text-red-500">Failed to load properties. Please try again.</p>
          </div>
        )}

        {/* Table View - Desktop */}
        {!isLoading && !error && properties.length > 0 && (
          <div className="hidden sm:block glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property, index) => (
                    <motion.tr
                      key={property.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-[var(--color-bg-hover)] transition-colors"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-[var(--color-text-light)]">{property.title}</p>
                          <p className="text-sm text-[var(--color-muted-foreground)]">
                            {property.address}, {property.city}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getTypeColor(property.property_type)} text-xs`}>
                          {property.property_type.replace(/_/g, " ").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(property.status)} text-xs`}>
                          {property.status.replace(/_/g, " ").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {property.price ? `${property.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} DH` : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/properties/${property.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold)]/10"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span className="hidden sm:inline ml-2">Edit</span>
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:bg-red-500/10"
                            onClick={() => handleDeleteClick(property.id, property.title)}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline ml-2">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Card View - Mobile */}
        {!isLoading && !error && properties.length > 0 && (
          <div className="sm:hidden space-y-4">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-lg p-4 border border-[var(--color-border)]"
              >
                <div className="space-y-3">
                  <div>
                    <h3 className="font-serif font-bold text-[var(--color-text-light)] line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-1">
                      {property.address}, {property.city}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${getTypeColor(property.property_type)} text-xs`}>
                      {property.property_type.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                    <Badge className={`${getStatusColor(property.status)} text-xs`}>
                      {property.status.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)]">
                    <p className="font-semibold text-[var(--color-primary-gold)]">
                      {property.price ? `${property.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} DH` : "N/A"}
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/properties/${property.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold)]/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-500/10"
                        onClick={() => handleDeleteClick(property.id, property.title)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && properties.length === 0 && (
          <div className="glass rounded-xl p-8 sm:p-12 text-center">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--color-text-light)] mb-2">
              No properties yet
            </h3>
            <p className="text-[var(--color-muted-foreground)] mb-6">
              You haven't created any properties yet. Start by creating your first property.
            </p>
            <Link href="/properties/new">
              <Button className="bg-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold-dark)]">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Property
              </Button>
            </Link>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && pages > 1 && (
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(Math.max(1, page - 1))}
              size="sm"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  onClick={() => setPage(p)}
                  size="sm"
                  className={page === p ? "bg-[var(--color-primary-gold)]" : ""}
                >
                  {p}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              disabled={page === pages}
              onClick={() => setPage(Math.min(pages, page + 1))}
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteState.isOpen}
        propertyTitle={deleteState.propertyTitle}
        isDeleting={isDeletingId === deleteState.propertyId}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </DashboardLayout>
  )
}
