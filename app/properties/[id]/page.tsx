"use client"

import { use, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProperty, useCurrentUserProfile } from "@/hooks/use-data"
import { ArrowLeft, Phone, Mail, MapPin, Home, Maximize2, DoorOpen, Bath, Loader2, MessageCircle, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [submitMessage, setSubmitMessage] = useState("")

  // Fetch property data and user profile from real database
  const { data: property, isLoading, error } = useProperty(id)
  const { data: userProfile, isLoading: isLoadingProfile } = useCurrentUserProfile()

  const handleContactChange = (field: string, value: string) => {
    setContactForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contactForm.name || !contactForm.phone || !contactForm.email || !contactForm.message) {
      setSubmitStatus("error")
      setSubmitMessage("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // Save lead to database
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: params.id,
          name: contactForm.name,
          phone: contactForm.phone,
          email: contactForm.email,
          message: contactForm.message,
          status: "new",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit contact form")
      }

      setSubmitStatus("success")
      setSubmitMessage("Thank you! We'll contact you within 24 hours.")
      setContactForm({ name: "", phone: "", email: "", message: "" })
    } catch (error) {
      setSubmitStatus("error")
      setSubmitMessage("Error submitting form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-gold)]" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !property) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <Link href="/properties">
            <Button variant="ghost" className="text-[var(--color-text-light)] mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
            <p className="text-red-500">Property not found</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const images = property.images || []
  const mainImage = images[0]
  const thumbnailImages = images.slice(1, 4)

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Link href="/properties">
          <Button variant="ghost" className="text-[var(--color-text-light)]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Button>
        </Link>

        {/* Image Gallery */}
        <div className="grid grid-cols-4 gap-4">
          {/* Main Image */}
          <div className="col-span-3">
            {mainImage ? (
              <img
                src={mainImage}
                alt={property.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-[var(--color-bg-card)] rounded-lg flex items-center justify-center">
                <Home className="w-12 h-12 text-[var(--color-muted-foreground)]" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          <div className="col-span-1 space-y-3">
            {thumbnailImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${property.title} ${idx + 2}`}
                className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
              />
            ))}
            {images.length > 4 && (
              <div className="w-full h-24 bg-[var(--color-bg-card)] rounded-lg flex items-center justify-center text-[var(--color-muted-foreground)]">
                +{images.length - 4} more
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Property Details */}
          <div className="col-span-2 space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-4xl font-serif font-bold text-[var(--color-text-light)] mb-2">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-[var(--color-primary-gold)]" />
                <p className="text-lg text-[var(--color-muted-foreground)]">
                  {property.address}, {property.city}
                </p>
              </div>
              <div className="text-3xl font-bold text-[var(--color-primary-gold)]">
                {property.price?.toLocaleString() || "N/A"} DH
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[var(--color-bg-card)] rounded-lg p-4 text-center">
                <DoorOpen className="w-6 h-6 mx-auto mb-2 text-[var(--color-primary-gold)]" />
                <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Bedrooms</p>
                <p className="text-xl font-bold text-[var(--color-text-light)]">{property.bedrooms || 0}</p>
              </div>
              <div className="bg-[var(--color-bg-card)] rounded-lg p-4 text-center">
                <Bath className="w-6 h-6 mx-auto mb-2 text-[var(--color-primary-gold)]" />
                <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Bathrooms</p>
                <p className="text-xl font-bold text-[var(--color-text-light)]">{property.bathrooms || 0}</p>
              </div>
              <div className="bg-[var(--color-bg-card)] rounded-lg p-4 text-center">
                <Maximize2 className="w-6 h-6 mx-auto mb-2 text-[var(--color-primary-gold)]" />
                <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Area</p>
                <p className="text-xl font-bold text-[var(--color-text-light)]">{property.square_feet || 0} m²</p>
              </div>
              <div className="bg-[var(--color-bg-card)] rounded-lg p-4 text-center">
                <Home className="w-6 h-6 mx-auto mb-2 text-[var(--color-primary-gold)]" />
                <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Type</p>
                <p className="text-xl font-bold text-[var(--color-text-light)] capitalize">{property.property_type}</p>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text-light)] mb-3">About this property</h2>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text-light)] mb-3">Amenities</h2>
                <div className="grid grid-cols-2 gap-3">
                  {property.amenities.map((amenity: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary-gold)]" />
                      <p className="text-[var(--color-text-light)]">{amenity}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Contact Form */}
          <div className="col-span-1 space-y-6">
            {/* Contact Form */}
            <div className="bg-[var(--color-bg-card)] rounded-lg p-6 border border-[var(--color-border)]">
              <h2 className="text-2xl font-serif font-bold text-[var(--color-text-light)] mb-4">
                Interested in this property?
              </h2>

              <form onSubmit={handleSubmitContact} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-[var(--color-text-light)]">
                    Your name
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={contactForm.name}
                    onChange={(e) => handleContactChange("name", e.target.value)}
                    className="bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)]"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-[var(--color-text-light)]">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+212 600 000000"
                    value={contactForm.phone}
                    onChange={(e) => handleContactChange("phone", e.target.value)}
                    className="bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)]"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-[var(--color-text-light)]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={contactForm.email}
                    onChange={(e) => handleContactChange("email", e.target.value)}
                    className="bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)]"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-[var(--color-text-light)]">
                    I'm interested in...
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your interest..."
                    value={contactForm.message}
                    onChange={(e) => handleContactChange("message", e.target.value)}
                    className="bg-[var(--color-bg-dark)] border-[var(--color-border)] text-[var(--color-text-light)] min-h-[100px]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] text-[var(--color-bg-dark)] font-semibold"
                >
                  {isSubmitting ? "Sending..." : "Contact Agent"}
                </Button>
              </form>

              {/* Status Messages */}
              {submitStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-[var(--color-success)]/10 border border-[var(--color-success)] rounded-lg p-3 flex items-start gap-2"
                >
                  <CheckCircle className="w-5 h-5 text-[var(--color-success)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--color-success)]">{submitMessage}</p>
                </motion.div>
              )}

              {submitStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500">{submitMessage}</p>
                </motion.div>
              )}

              <p className="text-xs text-[var(--color-muted-foreground)] mt-4 text-center">
                We'll respond within 24 hours
              </p>
            </div>

            {/* Agent Info */}
            <div className="bg-gradient-to-br from-[var(--color-primary-gold)]/10 to-[var(--color-accent)]/10 rounded-lg p-6 border border-[var(--color-primary-gold)]/20">
              <h3 className="text-lg font-bold text-[var(--color-text-light)] mb-4">Your Agent</h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary-gold)] to-[var(--color-accent)] flex items-center justify-center text-[var(--color-bg-dark)] font-bold">
                  {userProfile?.full_name ? userProfile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'AG'}
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-text-light)]">{userProfile?.full_name || 'Agent'}</p>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Property Agent</p>
                </div>
              </div>

              <div className="space-y-3">
                {userProfile?.phone && (
                  <a
                    href={`tel:${userProfile.phone}`}
                    className="flex items-center gap-2 text-[var(--color-primary-gold)] hover:text-[var(--color-accent)] transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{userProfile.phone}</span>
                  </a>
                )}

                {userProfile?.phone && (
                  <a
                    href={`https://wa.me/${userProfile.phone.replace(/[^\d+]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[var(--color-primary-gold)] hover:text-[var(--color-accent)] transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
