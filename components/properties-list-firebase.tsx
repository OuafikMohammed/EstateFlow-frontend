"use client"

import { useCollectionSubscription } from "@/hooks/useFirebase"
import { subscribeToProperties } from "@/lib/firebase/services"
import { Spinner } from "@/components/ui/spinner"
import { Alert } from "@/components/ui/alert"
import { PropertyCard } from "./property-card"

export default function PropertiesListWithFirebase() {
  const { data: properties, loading, error } = useCollectionSubscription(subscribeToProperties)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <p>Failed to load properties: {error.message}</p>
      </Alert>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No properties found</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
