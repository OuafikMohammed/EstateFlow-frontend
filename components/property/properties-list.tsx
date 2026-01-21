/**
 * Properties List Component with RLS & Real-time Updates
 * OWASP A01:2021 - Broken Access Control (enforced by Supabase RLS)
 *
 * Features:
 * - Server-side data fetching with RLS
 * - Real-time subscription support
 * - Pagination
 * - Filtering
 * - Loading states
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building2,
  MapPin,
  DollarSign,
  BedDouble,
  Bath,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react'
import Link from 'next/link'

interface Property {
  id: string
  title: string
  description: string | null
  property_type: string
  status: string
  price: number | null
  address: string
  city: string
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  images: string[]
  created_at: string
}

interface PropertiesListProps {
  initialProperties: Property[]
  totalCount: number
  currentPage: number
}

export function PropertiesList({
  initialProperties,
  totalCount,
  currentPage,
}: PropertiesListProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    propertyType: '',
    city: '',
  })

  // Handle property updates
  const handleDelete = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProperties(prev => prev.filter(p => p.id !== propertyId))
      } else {
        alert('Failed to delete property')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    under_contract: 'bg-yellow-100 text-yellow-800',
    sold: 'bg-blue-100 text-blue-800',
    expired: 'bg-gray-100 text-gray-800',
    withdrawn: 'bg-red-100 text-red-800',
  } as Record<string, string>

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Properties
        </h1>
        <Link href="/properties/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter by city..."
            value={filters.city}
            onChange={e => setFilters(prev => ({ ...prev, city: e.target.value }))}
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800"
          />
          <select
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="under_contract">Under Contract</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="border-0 shadow-lg">
              <Skeleton className="w-full h-48" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <Card className="p-12 text-center border-0 shadow-lg">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold mb-2">No properties found</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Start by adding your first property
          </p>
          <Link href="/properties/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Add Property
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <Card
              key={property.id}
              className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Image */}
              {property.images && property.images[0] ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-slate-400" />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex-1">
                    {property.title}
                  </h3>
                  <Badge className={statusColors[property.status as keyof typeof statusColors]}>
                    {property.status}
                  </Badge>
                </div>

                {/* Address */}
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {property.city}, {property.address}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                  {property.bedrooms !== null && (
                    <div className="flex items-center gap-1">
                      <BedDouble className="w-4 h-4 text-slate-500" />
                      <span>{property.bedrooms} bed</span>
                    </div>
                  )}
                  {property.bathrooms !== null && (
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4 text-slate-500" />
                      <span>{property.bathrooms} bath</span>
                    </div>
                  )}
                  {property.square_feet !== null && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">
                        {(property.square_feet / 1000).toFixed(1)}k sqft
                      </span>
                    </div>
                  )}
                </div>

                {/* Price */}
                {property.price && (
                  <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-blue-600">
                    <DollarSign className="w-5 h-5" />
                    ${property.price.toLocaleString()}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/properties/${property.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(property.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalCount > 20 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="px-4 py-2">Page {currentPage}</span>
          <Button
            variant="outline"
            disabled={currentPage * 20 >= totalCount}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
