"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Loader2, AlertCircle, Upload } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Property {
  id: string
  title: string
  description: string
  address: string
  city: string
  property_type: string
  status: string
  price: number
  bedrooms: number
  bathrooms: number
  square_feet: number
  images: string[]
  created_by: string
}

export default function EditPropertyPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const propertyId = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    property_type: "",
    status: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    square_feet: "",
  })

  const [imagePreview, setImagePreview] = useState<string[]>([])

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/properties/${propertyId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Property not found")
          } else if (response.status === 403) {
            setError("You don't have permission to edit this property")
          } else {
            setError("Failed to load property")
          }
          return
        }

        const data = await response.json()
        const propertyData = data.data || data

        if (!propertyData || !propertyData.id) {
          setError("Invalid property data received")
          return
        }

        setProperty(propertyData)
        setIsOwner(true)
        setImagePreview(Array.isArray(propertyData.images) ? propertyData.images : [])
        
        setFormData({
          title: propertyData.title || "",
          description: propertyData.description || "",
          address: propertyData.address || "",
          city: propertyData.city || "",
          property_type: propertyData.property_type || "",
          status: propertyData.status || "",
          price: propertyData.price ? propertyData.price.toString() : "",
          bedrooms: propertyData.bedrooms ? propertyData.bedrooms.toString() : "",
          bathrooms: propertyData.bathrooms ? propertyData.bathrooms.toString() : "",
          square_feet: propertyData.square_feet ? propertyData.square_feet.toString() : "",
        })
      } catch (err) {
        console.error("Error fetching property:", err)
        setError("Failed to load property")
      } finally {
        setIsLoading(false)
      }
    }

    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.address || !formData.city) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        property_type: formData.property_type,
        status: formData.status,
        price: formData.price ? parseInt(formData.price) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        square_feet: formData.square_feet ? parseInt(formData.square_feet) : null,
        images: imagePreview,
      }

      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error("Failed to update property")
      }

      toast({
        title: "Success",
        description: "Property updated successfully",
      })

      router.push("/properties/manage")
    } catch (err) {
      console.error("Error updating property:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update property",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-gold)]" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/properties/manage">
              <Button variant="ghost" size="icon" className="text-[var(--color-text-light)]">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-serif font-bold text-[var(--color-text-light)]">Edit Property</h1>
          </div>

          <div className="glass rounded-xl p-6 bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-500 mb-1">Error</h3>
                <p className="text-red-500">{error}</p>
              </div>
            </div>
          </div>

          <Link href="/properties/manage">
            <Button className="bg-[var(--color-primary-gold)]">Back to Properties</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  if (!property || !isOwner) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/properties/manage">
              <Button variant="ghost" size="icon" className="text-[var(--color-text-light)]">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-serif font-bold text-[var(--color-text-light)]">Edit Property</h1>
          </div>

          <div className="glass rounded-xl p-6 bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-yellow-700">Property not found or you don't have permission to edit it.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/properties/manage">
            <Button variant="ghost" size="icon" className="text-[var(--color-text-light)]">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-text-light)]">
              Edit Property
            </h1>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
              Update your property details
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="glass rounded-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-serif font-bold text-[var(--color-text-light)]">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                  Property Title *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Modern 3-Bedroom House"
                  className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your property..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-gold)]"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h2 className="text-lg font-serif font-bold text-[var(--color-text-light)]">Location</h2>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                  Address *
                </label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g., 123 Main Street"
                  className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                  City *
                </label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., Casablanca"
                  className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                  required
                />
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-serif font-bold text-[var(--color-text-light)]">Property Details</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                    Property Type
                  </label>
                  <Select value={formData.property_type} onValueChange={(value) => handleSelectChange("property_type", value)}>
                    <SelectTrigger className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="multi_family">Multi-Family</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                    Status
                  </label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="under_contract">Under Contract</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <h2 className="text-lg font-serif font-bold text-[var(--color-text-light)]">Specifications</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                    Price (DH)
                  </label>
                  <Input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                    Bedrooms
                  </label>
                  <Input
                    name="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                    Bathrooms
                  </label>
                  <Input
                    name="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">
                    Square Feet (m²)
                  </label>
                  <Input
                    name="square_feet"
                    type="number"
                    value={formData.square_feet}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                  />
                </div>
              </div>
            </div>

            {/* Images Preview */}
            {imagePreview.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-serif font-bold text-[var(--color-text-light)]">Current Images</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreview.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-6 border-t border-[var(--color-border)]">
              <Link href="/properties/manage" className="flex-1 sm:flex-none">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[var(--color-border)] text-[var(--color-text-light)]"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1 sm:flex-none bg-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold-dark)]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Property"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
