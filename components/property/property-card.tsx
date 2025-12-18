"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bed, Bath, Square, Eye, Edit } from "lucide-react"
import Link from "next/link"

interface PropertyCardProps {
  property: {
    id: string
    title: string
    price: number
    location: string
    bedrooms: number
    bathrooms: number
    area: number
    status: "Available" | "Reserved" | "Sold"
    images: string[]
    type: string
  }
}

export function PropertyCard({ property }: PropertyCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-[var(--color-success)] text-white"
      case "Reserved":
        return "bg-yellow-500 text-white"
      case "Sold":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
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
          src={property.images[0] || "/placeholder.svg"}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Badge className={`absolute top-4 right-4 ${getStatusColor(property.status)}`}>{property.status}</Badge>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-xl font-serif font-bold text-[var(--color-text-light)] mb-2 line-clamp-1">
            {property.title}
          </h3>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-2">📍 {property.location}</p>
          <p className="text-2xl font-serif font-bold" style={{ color: "var(--color-primary-gold)" }}>
            {property.price.toLocaleString()} DH
          </p>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 mb-4 text-sm text-[var(--color-muted-foreground)]">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.area > 0 && (
            <div className="flex items-center gap-1">
              <Square className="w-4 h-4" />
              <span>{property.area}m²</span>
            </div>
          )}
        </div>

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
          <Button
            variant="ghost"
            size="icon"
            className="text-[var(--color-text-light)] hover:bg-[var(--color-bg-card)]"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
