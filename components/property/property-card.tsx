"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bed, Bath, Square, Eye, Edit, Trash2, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useDeleteProperty } from "@/hooks/use-data"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface PropertyCardProps {
  property: {
    id: string
    title: string
    price?: number
    address: string
    city?: string
    bedrooms?: number
    bathrooms?: number
    square_feet?: number
    status: "available" | "under_contract" | "sold" | "expired" | "withdrawn"
    images?: string[]
    property_type: string
    description?: string
    created_by?: string
    user_id?: string
  }
  isOwner?: boolean
  onDeleted?: () => void
}

function DeleteConfirmDialog({
  isOpen,
  propertyTitle,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean
  propertyTitle: string
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
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
            This action cannot be undone. The property will be permanently deleted.
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

export function PropertyCard({ property, isOwner = false, onDeleted }: PropertyCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const deleteProperty = useDeleteProperty()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500 text-white"
      case "under_contract":
        return "bg-blue-500 text-white"
      case "sold":
        return "bg-gray-600 text-white"
      case "expired":
        return "bg-red-500 text-white"
      case "withdrawn":
        return "bg-yellow-600 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getTypeColor = (type: string) => {
    const typeMap: Record<string, string> = {
      house: "bg-blue-100 text-blue-800",
      apartment: "bg-purple-100 text-purple-800",
      condo: "bg-cyan-100 text-cyan-800",
      commercial: "bg-orange-100 text-orange-800",
      land: "bg-green-100 text-green-800",
      multi_family: "bg-indigo-100 text-indigo-800",
      townhouse: "bg-pink-100 text-pink-800",
    }
    return typeMap[type] || "bg-gray-100 text-gray-800"
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteProperty.mutateAsync(property.id)
      toast({
        title: "Success",
        description: "Property deleted successfully",
      })
      setShowDeleteConfirm(false)
      if (onDeleted) {
        onDeleted()
      } else {
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete property",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -8, rotateY: 2 }}
      className="glass rounded-xl overflow-hidden group cursor-pointer"
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={property.images?.[0] || "/placeholder.svg"}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Badge className={`absolute top-4 right-4 ${getStatusColor(property.status)}`}>
          {property.status.replace(/_/g, " ").toUpperCase()}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-serif font-bold text-[var(--color-text-light)] line-clamp-1 flex-1">
              {property.title}
            </h3>
            {isOwner && (
              <Badge variant="outline" className="ml-2 text-xs">
                Your Listing
              </Badge>
            )}
          </div>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-2 line-clamp-1">
            📍 {property.address} {property.city ? `, ${property.city}` : ""}
          </p>
          {property.price && (
            <p className="text-2xl font-serif font-bold" style={{ color: "var(--color-primary-gold)" }}>
              {property.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} DH
            </p>
          )}
        </div>

        {/* Type Badge */}
        <div className="mb-3">
          <Badge className={`${getTypeColor(property.property_type)} text-xs font-semibold`}>
            {property.property_type.replace(/_/g, " ").toUpperCase()}
          </Badge>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 mb-4 text-sm text-[var(--color-muted-foreground)]">
          {property.bedrooms ? (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms}</span>
            </div>
          ) : null}
          {property.bathrooms ? (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms}</span>
            </div>
          ) : null}
          {property.square_feet ? (
            <div className="flex items-center gap-1">
              <Square className="w-4 h-4" />
              <span>{property.square_feet}m²</span>
            </div>
          ) : null}
        </div>

        {/* Description Preview */}
        {property.description && (
          <p className="text-xs text-[var(--color-muted-foreground)] mb-4 line-clamp-2">
            {property.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/properties/${property.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full border-[var(--color-primary-gold)] text-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-bg-dark)] bg-transparent"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </Link>
          {isOwner && (
            <>
              <Link href={`/properties/${property.id}/edit`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[var(--color-text-light)] hover:bg-[var(--color-bg-card)]"
                  title="Edit property"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-red-500/10"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                title="Delete property"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        propertyTitle={property.title}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </motion.div>
  )
}
