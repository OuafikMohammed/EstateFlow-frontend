"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PropertyCard } from "@/components/property/property-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Loader2, Settings } from "lucide-react"
import Link from "next/link"
import { useProperties, useCurrentUserProfile } from "@/hooks/use-data"

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [propertyType, setPropertyType] = useState("all")
  const [propertyStatus, setPropertyStatus] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")
  const [page, setPage] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)

  // Get current user
  const { data: userProfile } = useCurrentUserProfile()

  // Set user ID when available
  useEffect(() => {
    if (userProfile?.id) {
      setUserId(userProfile.id)
    }
  }, [userProfile])

  // Fetch properties from API
  const { data: propertiesData, isLoading, error, refetch } = useProperties({
    page,
    limit: 12,
    propertyType: propertyType !== "all" ? (propertyType as any) : undefined,
    status: propertyStatus !== "all" ? (propertyStatus as any) : undefined,
    sortBy,
    sortOrder: "desc",
    searchQuery: searchQuery || undefined,
  })

  const properties = propertiesData?.items || []
  const total = propertiesData?.total || 0
  const pages = propertiesData?.pages || 0


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[var(--color-text-light)] mb-2">Properties</h1>
            <p className="text-[var(--color-muted-foreground)]">Browse and view all available properties</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/properties/manage">
              <Button className="flex items-center gap-2 border-[var(--color-primary-gold)] bg-transparent text-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold)]/10">
                <Settings className="w-4 h-4" />
                Manage My Properties
              </Button>
            </Link>
            <Link href="/properties/new">
              <Button className="flex items-center gap-2 bg-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold-dark)]">
                <Plus className="w-4 h-4" />
                New Property
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
              <Input
                placeholder="Search by title, location, address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
              />
            </div>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
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
                <SelectValue placeholder="Property Status" />
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
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Added</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="price">Price: High to Low</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
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

        {/* Property Grid */}
        {!isLoading && properties.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PropertyCard 
                  property={property} 
                  isOwner={userId ? property.created_by === userId : false}
                  onDeleted={() => refetch()}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && properties.length === 0 && (
          <div className="glass rounded-xl p-12 text-center">
            <h3 className="text-xl font-serif font-bold text-[var(--color-text-light)] mb-2">No properties found</h3>
            <p className="text-[var(--color-muted-foreground)] mb-6">Try adjusting your search filters or create a new property</p>
            <Link href="/properties/new">
              <Button className="bg-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold-dark)]">
                Create First Property
              </Button>
            </Link>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  onClick={() => setPage(p)}
                  className={page === p ? "bg-[var(--color-primary-gold)]" : ""}
                >
                  {p}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              disabled={page === pages}
              onClick={() => setPage(p => Math.min(pages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
