"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PropertyCard } from "@/components/property/property-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [propertyType, setPropertyType] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  // Mock properties data
  const properties = [
    {
      id: "1",
      title: "Modern 3BR Apartment in Anfa",
      price: 2500000,
      location: "Casablanca, Morocco",
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      status: "Available" as const,
      images: ["/modern-luxury-apartment.png"],
      type: "Apartment",
    },
    {
      id: "2",
      title: "Luxury Villa with Sea View",
      price: 8500000,
      location: "Rabat, Morocco",
      bedrooms: 5,
      bathrooms: 4,
      area: 350,
      status: "Available" as const,
      images: ["/luxury-villa-sea-view.jpg"],
      type: "House",
    },
    {
      id: "3",
      title: "Commercial Space Downtown",
      price: 4200000,
      location: "Marrakech, Morocco",
      bedrooms: 0,
      bathrooms: 2,
      area: 200,
      status: "Reserved" as const,
      images: ["/commercial-office-space.png"],
      type: "Commercial",
    },
    {
      id: "4",
      title: "Penthouse with Panoramic Views",
      price: 6800000,
      location: "Casablanca, Morocco",
      bedrooms: 4,
      bathrooms: 3,
      area: 280,
      status: "Available" as const,
      images: ["/penthouse-luxury-apartment.jpg"],
      type: "Apartment",
    },
    {
      id: "5",
      title: "Beachfront Property",
      price: 12000000,
      location: "Tangier, Morocco",
      bedrooms: 6,
      bathrooms: 5,
      area: 450,
      status: "Sold" as const,
      images: ["/beachfront-luxury-property.jpg"],
      type: "House",
    },
    {
      id: "6",
      title: "Investment Land Plot",
      price: 3500000,
      location: "Agadir, Morocco",
      bedrooms: 0,
      bathrooms: 0,
      area: 1000,
      status: "Available" as const,
      images: ["/land-plot-investment.jpg"],
      type: "Land",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[var(--color-text-light)] mb-2">Properties</h1>
            <p className="text-[var(--color-muted-foreground)]">Manage your property listings</p>
          </div>
          <Link href="/properties/new">
            <Button className="bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] text-[var(--color-bg-dark)] hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="glass rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
              <Input
                placeholder="Search by title, location, price..."
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
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date Added</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Property Grid */}
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
              <PropertyCard property={property} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
