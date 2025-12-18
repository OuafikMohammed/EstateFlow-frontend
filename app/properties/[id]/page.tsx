"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Square, Car, Waves, Shield, ArrowLeft, Share2, Heart, Phone, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function PropertyDetailPage() {
  const params = useParams()
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  })

  // Mock property data
  const property = {
    id: params.id,
    title: "Modern 3BR Apartment in Anfa",
    price: 2500000,
    location: "Anfa, Casablanca",
    status: "Available",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    floor: 5,
    parking: true,
    pool: true,
    images: [
      "/modern-luxury-living-room.png",
      "/modern-luxury-apartment-bedroom.jpg",
      "/modern-luxury-apartment-kitchen.jpg",
      "/modern-luxury-apartment-bathroom.jpg",
    ],
    description:
      "Experience luxury living in this stunning modern apartment located in the prestigious Anfa district. This spacious 3-bedroom residence features premium finishes, floor-to-ceiling windows with panoramic city views, and access to world-class amenities. Perfect for families or professionals seeking an upscale lifestyle in Casablanca's most sought-after neighborhood.",
    amenities: [
      "Air Conditioning",
      "Balcony",
      "Elevator",
      "Security 24/7",
      "Garden",
      "Gym",
      "Concierge",
      "Storage Room",
    ],
    agent: {
      name: "Ahmed El Mansouri",
      phone: "+212 600 123456",
      avatar: "/professional-avatar.png",
    },
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle contact form submission
    console.log("Form submitted:", formData)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link href="/properties">
          <Button variant="ghost" className="text-[var(--color-text-light)] hover:bg-[var(--color-bg-card)]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Button>
        </Link>

        {/* Image Gallery */}
        <div className="glass rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-video md:aspect-square">
              <img
                src={property.images[0] || "/placeholder.svg"}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="grid grid-cols-2 gap-2">
              {property.images.slice(1, 4).map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="aspect-video"
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Property ${index + 2}`}
                    className="w-full h-full object-cover rounded"
                  />
                </motion.div>
              ))}
              <div className="aspect-video bg-[var(--color-bg-card)] rounded flex items-center justify-center cursor-pointer hover:bg-[var(--color-border)] transition-colors">
                <span className="text-[var(--color-text-light)]">+4 more</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="glass rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge
                    className={`mb-2 ${
                      property.status === "Available"
                        ? "bg-[var(--color-success)]"
                        : property.status === "Reserved"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                    } text-white`}
                  >
                    {property.status}
                  </Badge>
                  <h1 className="text-3xl font-serif font-bold text-[var(--color-text-light)] mb-2">
                    {property.title}
                  </h1>
                  <p className="text-[var(--color-muted-foreground)]">📍 {property.location}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-[var(--color-text-light)]">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-[var(--color-text-light)]">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <p className="text-4xl font-serif font-bold" style={{ color: "var(--color-primary-gold)" }}>
                {property.price.toLocaleString()} DH
              </p>
            </div>

            {/* Key Features */}
            <div className="glass rounded-lg p-6">
              <h2 className="text-xl font-serif font-bold text-[var(--color-text-light)] mb-4">Key Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-card)] rounded-lg">
                  <Bed className="w-5 h-5" style={{ color: "var(--color-primary-gold)" }} />
                  <div>
                    <p className="text-sm text-[var(--color-muted-foreground)]">Bedrooms</p>
                    <p className="font-semibold text-[var(--color-text-light)]">{property.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-card)] rounded-lg">
                  <Bath className="w-5 h-5" style={{ color: "var(--color-primary-gold)" }} />
                  <div>
                    <p className="text-sm text-[var(--color-muted-foreground)]">Bathrooms</p>
                    <p className="font-semibold text-[var(--color-text-light)]">{property.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-card)] rounded-lg">
                  <Square className="w-5 h-5" style={{ color: "var(--color-primary-gold)" }} />
                  <div>
                    <p className="text-sm text-[var(--color-muted-foreground)]">Area</p>
                    <p className="font-semibold text-[var(--color-text-light)]">{property.area} m²</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-card)] rounded-lg">
                  <Car className="w-5 h-5" style={{ color: "var(--color-primary-gold)" }} />
                  <div>
                    <p className="text-sm text-[var(--color-muted-foreground)]">Parking</p>
                    <p className="font-semibold text-[var(--color-text-light)]">{property.parking ? "Yes" : "No"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-card)] rounded-lg">
                  <Waves className="w-5 h-5" style={{ color: "var(--color-primary-gold)" }} />
                  <div>
                    <p className="text-sm text-[var(--color-muted-foreground)]">Pool</p>
                    <p className="font-semibold text-[var(--color-text-light)]">{property.pool ? "Yes" : "No"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[var(--color-bg-card)] rounded-lg">
                  <Shield className="w-5 h-5" style={{ color: "var(--color-primary-gold)" }} />
                  <div>
                    <p className="text-sm text-[var(--color-muted-foreground)]">Floor</p>
                    <p className="font-semibold text-[var(--color-text-light)]">{property.floor}th</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="glass rounded-lg p-6">
              <h2 className="text-xl font-serif font-bold text-[var(--color-text-light)] mb-4">Description</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="glass rounded-lg p-6">
              <h2 className="text-xl font-serif font-bold text-[var(--color-text-light)] mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-success)" }} />
                    <span className="text-[var(--color-text-light)]">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="space-y-6">
            {/* Contact Form */}
            <div className="glass rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-serif font-bold text-[var(--color-text-light)] mb-4">
                Interested in this property?
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[var(--color-text-light)]">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[var(--color-text-light)]">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+212 600 000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[var(--color-text-light)]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-[var(--color-text-light)]">
                    Message (Optional)
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="I'm interested in..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                    rows={4}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] text-[var(--color-bg-dark)] font-semibold"
                >
                  Contact Agent
                </Button>
              </form>
              <p className="text-xs text-center text-[var(--color-muted-foreground)] mt-4">
                We'll respond within 24 hours
              </p>

              {/* Agent Info */}
              <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={property.agent.avatar || "/placeholder.svg"}
                    alt={property.agent.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-[var(--color-text-light)]">{property.agent.name}</p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">Property Agent</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full border-[var(--color-border)] text-[var(--color-text-light)] bg-transparent"
                    onClick={() => window.open(`tel:${property.agent.phone}`)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {property.agent.phone}
                  </Button>
                  <Button
                    className="w-full bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]/90"
                    onClick={() => window.open(`https://wa.me/${property.agent.phone.replace(/\D/g, "")}`)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
