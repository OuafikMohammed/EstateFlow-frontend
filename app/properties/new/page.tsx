"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, X, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ImageUpload } from "@/components/properties/image-upload"
import { propertiesApi } from "@/lib/utils/api"

export default function NewPropertyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    status: "available",
    price: "",
    city: "",
    address: "",
    description: "",
    bedrooms: 0,
    bathrooms: 0,
    area: "",
    floor: "",
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

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    try {
      setSubmitError(null)
      setIsSubmitting(true)

      // Validate required fields
      if (!formData.title || !formData.type || !formData.price || !formData.city) {
        setSubmitError("Please fill in all required fields")
        setStep(1)
        return
      }

      // Validate minimum 3 images
      if (formData.images.length < 3) {
        setSubmitError("Please upload at least 3 photos (you can upload up to 10)")
        setStep(3)
        return
      }

      // Create property object
      const propertyData = {
        title: formData.title,
        property_type: formData.type.toLowerCase(),
        status: formData.status.toLowerCase(),
        price: parseFloat(formData.price),
        city: formData.city,
        address: formData.address,
        description: formData.description,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        area: parseFloat(formData.area) || 0,
        floor: formData.floor ? parseInt(formData.floor) : null,
        amenities: formData.amenities,
        images: formData.images,
      }

      // Submit to API
      const response = await propertiesApi.create(propertyData)
      
      setSubmitSuccess(true)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/properties")
      }, 2000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create property"
      setSubmitError(errorMessage)
      console.error("Property creation error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/properties">
            <Button variant="ghost" className="text-[var(--color-text-light)]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-[var(--color-text-light)]">Add New Property</h1>
          <div className="w-20" />
        </div>

        {/* Progress Steps */}
        <div className="glass rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    s === step
                      ? "bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] text-[var(--color-bg-dark)]"
                      : s < step
                        ? "bg-[var(--color-success)] text-white"
                        : "bg-[var(--color-bg-card)] text-[var(--color-muted-foreground)]"
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`h-1 w-16 md:w-32 mx-2 rounded transition-all ${
                      s < step ? "bg-[var(--color-success)]" : "bg-[var(--color-border)]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-light)]">Basic Info</span>
            <span className="text-[var(--color-text-light)]">Details</span>
            <span className="text-[var(--color-text-light)]">Photos</span>
            <span className="text-[var(--color-text-light)]">Preview</span>
          </div>
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-lg p-6"
          >
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-bold text-[var(--color-text-light)] mb-6">Basic Information</h2>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[var(--color-text-light)]">
                    Property Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Modern 3BR Apartment in Anfa"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                    className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-[var(--color-text-light)]">
                      Type
                    </Label>
                    <Select value={formData.type} onValueChange={(value) => updateFormData("type", value)}>
                      <SelectTrigger className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-[var(--color-text-light)]">
                      Status
                    </Label>
                    <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
                      <SelectTrigger className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Reserved">Reserved</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-[var(--color-text-light)]">
                    Price (DH)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="2500000"
                    value={formData.price}
                    onChange={(e) => updateFormData("price", e.target.value)}
                    className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-[var(--color-text-light)]">
                      City
                    </Label>
                    <Select value={formData.city} onValueChange={(value) => updateFormData("city", value)}>
                      <SelectTrigger className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Casablanca">Casablanca</SelectItem>
                        <SelectItem value="Rabat">Rabat</SelectItem>
                        <SelectItem value="Marrakech">Marrakech</SelectItem>
                        <SelectItem value="Tangier">Tangier</SelectItem>
                        <SelectItem value="Agadir">Agadir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-[var(--color-text-light)]">
                      Address
                    </Label>
                    <Input
                      id="address"
                      placeholder="123 Boulevard Anfa"
                      value={formData.address}
                      onChange={(e) => updateFormData("address", e.target.value)}
                      className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-bold text-[var(--color-text-light)] mb-6">Property Details</h2>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[var(--color-text-light)]">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the property..."
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)] min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms" className="text-[var(--color-text-light)]">
                      Bedrooms
                    </Label>
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
                        id="bedrooms"
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

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms" className="text-[var(--color-text-light)]">
                      Bathrooms
                    </Label>
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
                        id="bathrooms"
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

                  <div className="space-y-2">
                    <Label htmlFor="area" className="text-[var(--color-text-light)]">
                      Area (m²)
                    </Label>
                    <Input
                      id="area"
                      type="number"
                      placeholder="120"
                      value={formData.area}
                      onChange={(e) => updateFormData("area", e.target.value)}
                      className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floor" className="text-[var(--color-text-light)]">
                      Floor
                    </Label>
                    <Input
                      id="floor"
                      type="number"
                      placeholder="5"
                      value={formData.floor}
                      onChange={(e) => updateFormData("floor", e.target.value)}
                      className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[var(--color-text-light)]">Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
            )}

            {/* Step 3: Photos */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-bold text-[var(--color-text-light)] mb-6">Photos & Media</h2>

                <ImageUpload
                  onImagesUploaded={(urls) => updateFormData("images", urls)}
                  maxFiles={10}
                  existingImages={formData.images}
                />
              </div>
            )}

            {/* Step 4: Preview */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-bold text-[var(--color-text-light)] mb-6">Preview & Publish</h2>

                {/* Success State */}
                {submitSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[var(--color-success)]/10 border border-[var(--color-success)] rounded-lg p-6 text-center"
                  >
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-[var(--color-success)]" />
                    <p className="text-lg font-semibold text-[var(--color-text-light)] mb-2">Property Created!</p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">Redirecting to properties list...</p>
                  </motion.div>
                )}

                {/* Error State */}
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-500 mb-1">Error Creating Property</p>
                      <p className="text-sm text-red-400">{submitError}</p>
                      <p className="text-xs text-red-400 mt-2">Make sure all required fields are filled</p>
                    </div>
                  </motion.div>
                )}

                {/* Preview */}
                {!submitSuccess && (
                  <div className="border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                    <div>
                      <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Title</p>
                      <p className="text-lg font-semibold text-[var(--color-text-light)]">{formData.title || "N/A"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Type</p>
                        <p className="text-[var(--color-text-light)]">{formData.type || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Price</p>
                        <p className="text-[var(--color-text-light)]">
                          {formData.price ? `${formData.price} DH` : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Location</p>
                        <p className="text-[var(--color-text-light)]">{formData.city || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Area</p>
                        <p className="text-[var(--color-text-light)]">{formData.area ? `${formData.area} m²` : "N/A"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-muted-foreground)] mb-2">Photos ({formData.images.length})</p>
                      {formData.images.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {formData.images.slice(0, 3).map((img, i) => (
                            <div key={i} className="aspect-video rounded overflow-hidden">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--color-muted-foreground)]">No photos uploaded</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="border-[var(--color-border)] text-[var(--color-text-light)] bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < 4 ? (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] text-[var(--color-bg-dark)]"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || submitSuccess}
              className="bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] text-[var(--color-bg-dark)] disabled:opacity-50"
            >
              {isSubmitting ? "Publishing..." : submitSuccess ? "Published!" : "Publish Property"}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
