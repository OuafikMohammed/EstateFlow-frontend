"use client"

import { use, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useProperty, useCurrentUserProfile } from "@/hooks/use-data"
import { ArrowLeft, Edit, Trash2, MapPin, Home, Maximize2, Bed, Bath, Loader2, AlertCircle, DollarSign, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface DeleteConfirmDialogProps {
  isOpen: boolean
  propertyTitle: string
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

function DeleteConfirmDialog({
  isOpen,
  propertyTitle,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-[var(--color-bg-secondary)] border-[var(--color-gold)]/20 p-6 space-y-4">
        <h2 className="text-xl font-bold text-[var(--color-text-light)]">Delete Property</h2>
        <p className="text-[var(--color-text-muted)]">
          Are you sure you want to delete "<strong>{propertyTitle}</strong>"? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button 
            onClick={onCancel} 
            variant="outline"
            className="border-[var(--color-gold)]/20 text-[var(--color-text-light)]"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isDeleting}
            className="bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}

interface StatusBadgeProps {
  status: string
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    available: {
      label: "Available",
      className: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    under_contract: {
      label: "Under Contract",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    sold: {
      label: "Sold",
      className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    },
    expired: {
      label: "Expired",
      className: "bg-[var(--color-danger)]/20 text-[var(--color-danger)] border-[var(--color-danger)]/30",
    },
    withdrawn: {
      label: "Withdrawn",
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available

  return <Badge className={`${config.className} border`}>{config.label}</Badge>
}

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const { property, loading, error } = useProperty(id)
  const { userProfile } = useCurrentUserProfile()

  const handleDelete = async () => {
    if (!property) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete property")
      }

      router.push("/properties")
    } catch (err) {
      console.error("Failed to delete property", err)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const isOwner = property && userProfile && property.created_by === userProfile.id

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-gold)]" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !property) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Link href="/properties">
            <Button variant="ghost" className="text-[var(--color-text-light)]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
          <Alert className="glass bg-red-500/5 border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">
              Property not found
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  const images = property.images || []

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/properties">
            <Button variant="ghost" className="text-[var(--color-text-light)]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
          {isOwner && (
            <div className="flex gap-2">
              <Link href={`/properties/${property.id}/edit`}>
                <Button className="bg-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold)]/90 text-[var(--color-bg-dark)] gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </Link>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                className="bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 text-white gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          propertyTitle={property.title}
          isDeleting={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />

        {/* Property Header Card */}
        <Card className="glass p-8 border-[var(--color-border)]">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-serif font-bold text-[var(--color-text-light)]">
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 text-[var(--color-muted-foreground)] mt-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {property.address}, {property.city}, {property.state || ""}
                  </span>
                </div>
              </div>

              <div className="text-right">
                {property.price && (
                  <div className="flex items-baseline gap-2">
                    <DollarSign className="w-6 h-6 text-[var(--color-primary-gold)]" />
                    <span className="text-3xl font-bold text-[var(--color-primary-gold)]">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      }).format(property.price)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--color-border)]">
              <StatusBadge status={property.status} />
              <Badge variant="outline" className="border-[var(--color-border)] text-[var(--color-text-light)]">
                {property.property_type}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Property Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {property.bedrooms !== undefined && property.bedrooms !== null && (
            <Card className="glass p-4 border-[var(--color-border)]">
              <div className="flex items-center gap-2 text-[var(--color-muted-foreground)] mb-2">
                <Bed className="w-4 h-4" />
                <span className="text-sm">Bedrooms</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-light)]">
                {property.bedrooms}
              </p>
            </Card>
          )}

          {property.bathrooms !== undefined && property.bathrooms !== null && (
            <Card className="glass p-4 border-[var(--color-border)]">
              <div className="flex items-center gap-2 text-[var(--color-muted-foreground)] mb-2">
                <Bath className="w-4 h-4" />
                <span className="text-sm">Bathrooms</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-light)]">
                {property.bathrooms}
              </p>
            </Card>
          )}

          {property.square_feet !== undefined && property.square_feet !== null && (
            <Card className="glass p-4 border-[var(--color-border)]">
              <div className="flex items-center gap-2 text-[var(--color-muted-foreground)] mb-2">
                <Maximize2 className="w-4 h-4" />
                <span className="text-sm">Square Feet</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-light)]">
                {new Intl.NumberFormat("en-US").format(property.square_feet)}
              </p>
            </Card>
          )}

          {property.year_built && (
            <Card className="glass p-4 border-[var(--color-border)]">
              <div className="flex items-center gap-2 text-[var(--color-muted-foreground)] mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Year Built</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-light)]">
                {property.year_built}
              </p>
            </Card>
          )}
        </div>

        {/* Description and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass p-8 border-[var(--color-border)] lg:col-span-2">
            <h2 className="text-2xl font-serif font-bold text-[var(--color-text-light)] mb-4">
              About the Property
            </h2>
            <p className="text-[var(--color-text-light)] leading-relaxed whitespace-pre-wrap">
              {property.description || "No description provided"}
            </p>
          </Card>

          {/* Property Info Sidebar */}
          <Card className="glass p-8 border-[var(--color-border)]">
            <h3 className="text-lg font-semibold text-[var(--color-text-light)] mb-4">
              Property Details
            </h3>

            <div className="space-y-4">
              {property.property_type && (
                <div>
                  <p className="text-[var(--color-muted-foreground)] text-sm mb-1">
                    Property Type
                  </p>
                  <p className="text-[var(--color-text-light)] capitalize">
                    {property.property_type.replace("_", " ")}
                  </p>
                </div>
              )}

              {property.status && (
                <div>
                  <p className="text-[var(--color-muted-foreground)] text-sm mb-1">
                    Status
                  </p>
                  <StatusBadge status={property.status} />
                </div>
              )}

              {property.lot_size && (
                <div>
                  <p className="text-[var(--color-muted-foreground)] text-sm mb-1">
                    Lot Size
                  </p>
                  <p className="text-[var(--color-text-light)]">{property.lot_size}</p>
                </div>
              )}

              {property.created_at && (
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <p className="text-[var(--color-muted-foreground)] text-sm mb-1">
                    Listed On
                  </p>
                  <p className="text-[var(--color-text-light)]">
                    {new Date(property.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}