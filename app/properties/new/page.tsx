"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, AlertCircle, CheckCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ImageUpload } from "@/components/properties/image-upload"
import { createProperty } from "@/lib/actions/properties"

export default function NewPropertyPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    status: "available",
    price: "",
    city: "",
    address: "",
    zipCode: "",
    country: "",
    latitude: "",
    longitude: "",
    description: "",
    bedrooms: 0,
    bathrooms: 0,
    area: "",
    floor: "",
    year_built: "",
    lot_size: "",
    amenities: [] as string[],
    images: [] as string[],
  })

  const amenitiesList = [
    "Air Conditioning",
    "Balcony",
    "Elevator",
    "Security 24/7",
    "Garden",
    "Gym",
    "Pool",
    "Parking",
    "Concierge",
    "Storage Room",
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handleNextTab = () => {
    if (activeTab === "basic") {
      // Validate basic info before moving to location
      if (!formData.title || !formData.type || !formData.price || !formData.city) {
        setSubmitError("Please fill in all required basic info fields")
        return
      }
      setActiveTab("location")
      setSubmitError(null)
    } else if (activeTab === "location") {
      // Validate location info before moving to media
      if (!formData.address) {
        setSubmitError("Address is required")
        return
      }
      setActiveTab("media")
      setSubmitError(null)
    }
  }

  const handlePrevTab = () => {
    if (activeTab === "location") {
      setActiveTab("basic")
    } else if (activeTab === "media") {
      setActiveTab("location")
    }
    setSubmitError(null)
  }

  const handleSubmit = async () => {
    try {
      setSubmitError(null)
      setIsSubmitting(true)

      // Validate required fields
      if (!formData.title || !formData.type || !formData.price || !formData.city) {
        setSubmitError("Please fill in all required fields")
        return
      }

      if (!formData.address) {
        setSubmitError("Address is required")
        return
      }

      // Validate image count
      if (formData.images.length < 3) {
        setSubmitError(`Please add at least 3 images. Currently you have ${formData.images.length} image${formData.images.length !== 1 ? 's' : ''}.`)
        return
      }

      if (formData.images.length > 10) {
        setSubmitError("You can only upload a maximum of 10 images.")
        return
      }

      // Create property object matching the server action schema
      const propertyData: any = {
        type: formData.type.toLowerCase(),
        transactionType: "sale",
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms || 0,
        bathrooms: formData.bathrooms || 0,
        status: formData.status.toLowerCase(),
        address: formData.address,
        city: formData.city,
        images: formData.images && formData.images.length > 0 ? formData.images : undefined,
        amenities: formData.amenities && formData.amenities.length > 0 ? formData.amenities : undefined,
      }

      // Only include optional fields if provided
      if (formData.area) {
        propertyData.size = parseFloat(formData.area)
      }

      if (formData.description && formData.description.length >= 10) {
        propertyData.description = formData.description
      }

      if (formData.latitude) {
        propertyData.latitude = parseFloat(formData.latitude)
      }

      if (formData.longitude) {
        propertyData.longitude = parseFloat(formData.longitude)
      }

      if (formData.country) {
        propertyData.country = formData.country
      }

      if (formData.zipCode) {
        propertyData.zipCode = formData.zipCode
      }

      console.log('Sending property data to server:', JSON.stringify(propertyData, null, 2))

      // Call the server action
      console.log('About to call createProperty')
      const response = await createProperty(propertyData)
      
      console.log('Response received:', response)
      console.log('Response type:', typeof response)

      if ('success' in response && response.success) {
        setSubmitSuccess(true)
        setTimeout(() => {
          router.push("/properties")
        }, 2000)
      } else {
        const errorResponse = response as any
        const errorMessage = errorResponse?.error?.message || "Failed to create property"
        console.error('Property creation failed with message:', errorMessage)
        console.error('Full error response:', errorResponse)
        setSubmitError(errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error creating property"
      setSubmitError(errorMessage)
      console.error("Property creation error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/properties">
            <Button variant="ghost" size="icon" className="text-[var(--color-text-light)]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-serif font-bold text-[var(--color-text-light)]">
              Add New Property
            </h1>
            <p className="text-[var(--color-muted-foreground)] mt-1">
              Complete the property information with all details
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {submitError && (
          <Alert className="glass bg-red-500/5 border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Form Card */}
        <div className="glass rounded-xl p-8 border border-[var(--color-border)]">
          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-[var(--color-success)]" />
              <h2 className="text-2xl font-serif font-bold text-[var(--color-text-light)] mb-2">
                Property Created Successfully!
              </h2>
              <p className="text-[var(--color-muted-foreground)]">
                Redirecting to properties list...
              </p>
            </motion.div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                <TabsTrigger
                  value="basic"
                  className="text-[var(--color-text-light)] data-[state=active]:bg-[var(--color-primary-gold)] data-[state=active]:text-[var(--color-bg-dark)]"
                >
                  Basic Info
                </TabsTrigger>
                <TabsTrigger
                  value="location"
                  className="text-[var(--color-text-light)] data-[state=active]:bg-[var(--color-primary-gold)] data-[state=active]:text-[var(--color-bg-dark)]"
                >
                  Location
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="text-[var(--color-text-light)] data-[state=active]:bg-[var(--color-primary-gold)] data-[state=active]:text-[var(--color-bg-dark)]"
                >
                  Media
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Basic Info */}
              <TabsContent value="basic" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-[var(--color-text-light)] mb-2 block">Property Title *</Label>
                    <Input
                      placeholder="Modern Family Home with Pool"
                      value={formData.title}
                      onChange={(e) => updateFormData("title", e.target.value)}
                      className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[var(--color-text-light)] mb-2 block">Property Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => updateFormData("type", value)}>
                        <SelectTrigger className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="condo">Condo</SelectItem>
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                          <SelectItem value="multi_family">Multi-Family</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[var(--color-text-light)] mb-2 block">Status *</Label>
                      <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
                        <SelectTrigger className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                          <SelectValue />
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

                  <div>
                    <Label className="text-[var(--color-text-light)] mb-2 block">Price ($) *</Label>
                    <Input
                      type="number"
                      placeholder="750000"
                      value={formData.price}
                      onChange={(e) => updateFormData("price", e.target.value)}
                      className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                    />
                  </div>

                  <div>
                    <Label className="text-[var(--color-text-light)] mb-2 block">Description</Label>
                    <Textarea
                      placeholder="Describe the property features, amenities, condition..."
                      value={formData.description}
                      onChange={(e) => updateFormData("description", e.target.value)}
                      rows={5}
                      className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[var(--color-text-light)] mb-2 block">Bedrooms</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => updateFormData("bedrooms", Math.max(0, formData.bedrooms - 1))}
                          className="border-[var(--color-border)] text-[var(--color-text-light)]"
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={formData.bedrooms}
                          readOnly
                          className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)] text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => updateFormData("bedrooms", formData.bedrooms + 1)}
                          className="border-[var(--color-border)] text-[var(--color-text-light)]"
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-[var(--color-text-light)] mb-2 block">Bathrooms</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => updateFormData("bathrooms", Math.max(0, formData.bathrooms - 1))}
                          className="border-[var(--color-border)] text-[var(--color-text-light)]"
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={formData.bathrooms}
                          readOnly
                          className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)] text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => updateFormData("bathrooms", formData.bathrooms + 1)}
                          className="border-[var(--color-border)] text-[var(--color-text-light)]"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[var(--color-text-light)] mb-2 block">Square Feet</Label>
                      <Input
                        type="number"
                        placeholder="3500"
                        value={formData.area}
                        onChange={(e) => updateFormData("area", e.target.value)}
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      />
                    </div>

                    <div>
                      <Label className="text-[var(--color-text-light)] mb-2 block">Year Built</Label>
                      <Input
                        type="number"
                        placeholder="2020"
                        value={formData.year_built}
                        onChange={(e) => updateFormData("year_built", e.target.value)}
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-[var(--color-text-light)] mb-3">Amenities</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {amenitiesList.map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Checkbox
                            id={amenity}
                            checked={formData.amenities.includes(amenity)}
                            onCheckedChange={() => toggleAmenity(amenity)}
                          />
                          <Label htmlFor={amenity} className="text-sm text-[var(--color-text-light)] cursor-pointer">
                            {amenity}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Location */}
              <TabsContent value="location" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-[var(--color-text-light)] mb-2 block">Street Address *</Label>
                    <Input
                      placeholder="123 Main Street"
                      value={formData.address}
                      onChange={(e) => updateFormData("address", e.target.value)}
                      className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[var(--color-text-light)] mb-2 block">City *</Label>
                      <Input
                        placeholder="New York"
                        value={formData.city}
                        onChange={(e) => updateFormData("city", e.target.value)}
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      />
                    </div>

                    <div>
                      <Label className="text-[var(--color-text-light)] mb-2 block">ZIP Code</Label>
                      <Input
                        placeholder="10001"
                        value={formData.zipCode}
                        onChange={(e) => updateFormData("zipCode", e.target.value)}
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[var(--color-text-light)] mb-2 block">Country</Label>
                      <Input
                        placeholder="USA"
                        value={formData.country}
                        onChange={(e) => updateFormData("country", e.target.value)}
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      />
                    </div>

                    <div>
                      <Label className="text-[var(--color-text-light)] mb-2 block">Lot Size</Label>
                      <Input
                        placeholder="0.5 acres"
                        value={formData.lot_size}
                        onChange={(e) => updateFormData("lot_size", e.target.value)}
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[var(--color-text-light)] mb-2 block">Latitude</Label>
                      <Input
                        type="number"
                        placeholder="40.7128"
                        step="0.0001"
                        value={formData.latitude}
                        onChange={(e) => updateFormData("latitude", e.target.value)}
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      />
                    </div>

                    <div>
                      <Label className="text-[var(--color-text-light)] mb-2 block">Longitude</Label>
                      <Input
                        type="number"
                        placeholder="-74.0060"
                        step="0.0001"
                        value={formData.longitude}
                        onChange={(e) => updateFormData("longitude", e.target.value)}
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Media */}
              <TabsContent value="media" className="space-y-6 mt-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-[var(--color-text-light)] block">Property Images</Label>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`${
                          formData.images.length < 3 
                            ? 'bg-red-500/20 text-red-500' 
                            : formData.images.length > 10 
                            ? 'bg-orange-500/20 text-orange-500'
                            : 'bg-green-500/20 text-green-500'
                        }`}
                      >
                        {formData.images.length} / 10 images
                      </Badge>
                      {formData.images.length < 3 && (
                        <span className="text-xs text-red-500">
                          ({3 - formData.images.length} more needed)
                        </span>
                      )}
                      {formData.images.length === 10 && (
                        <span className="text-xs text-orange-500">Maximum reached</span>
                      )}
                    </div>
                  </div>
                  <ImageUpload
                    onImagesUploaded={(urls) => updateFormData("images", urls)}
                    maxFiles={10}
                    existingImages={formData.images}
                  />
                </div>
              </TabsContent>

              {/* Tab Navigation Buttons */}
              <div className="flex gap-3 justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevTab}
                  disabled={activeTab === "basic"}
                  className="border-[var(--color-border)] text-[var(--color-text-light)] disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                {activeTab !== "media" ? (
                  <Button
                    type="button"
                    onClick={handleNextTab}
                    className="bg-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold)]/90 text-[var(--color-bg-dark)] font-semibold gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-[var(--color-primary-gold)] hover:bg-[var(--color-primary-gold)]/90 text-[var(--color-bg-dark)] font-semibold gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? "Creating..." : "Create Property"}
                  </Button>
                )}
              </div>
            </Tabs>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
