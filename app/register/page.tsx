"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    agencyName: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock registration - redirect to dashboard
    router.push("/dashboard")
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="flex items-center mb-8 justify-center">
          <Image 
            src="/estateflow-logo.png" 
            alt="EstateFlow" 
            width={157} 
            height={40}
            className="h-8 sm:h-10 md:h-12 w-auto"
            priority
          />
        </div>

        {/* Form Card */}
        <div className="glass rounded-xl p-8 shadow-xl">
          <h1 className="text-3xl font-serif font-bold mb-2 text-[var(--color-text-light)] text-center">
            Create Account
          </h1>
          <p className="text-[var(--color-muted-foreground)] mb-6 text-center">Join the premium real estate platform</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agencyName" className="text-[var(--color-text-light)]">
                  Agency Name
                </Label>
                <Input
                  id="agencyName"
                  placeholder="Your Real Estate Agency"
                  value={formData.agencyName}
                  onChange={(e) => handleChange("agencyName", e.target.value)}
                  className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)] focus:border-[var(--color-primary-gold)] transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[var(--color-text-light)]">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)] focus:border-[var(--color-primary-gold)] transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[var(--color-text-light)]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@agency.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)] focus:border-[var(--color-primary-gold)] transition-all"
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
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)] focus:border-[var(--color-primary-gold)] transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[var(--color-text-light)]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)] focus:border-[var(--color-primary-gold)] transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[var(--color-text-light)]">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)] focus:border-[var(--color-primary-gold)] transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="terms"
                checked={formData.terms}
                onCheckedChange={(checked) => handleChange("terms", checked as boolean)}
                required
              />
              <Label htmlFor="terms" className="text-sm text-[var(--color-text-light)] cursor-pointer">
                I agree to the{" "}
                <Link href="/terms" className="underline" style={{ color: "var(--color-primary-gold)" }}>
                  Terms & Conditions
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] text-[var(--color-bg-dark)] font-semibold hover:opacity-90 transition-all hover:scale-[1.02]"
              size="lg"
            >
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
            Already have an account?{" "}
            <Link href="/login" className="hover:underline" style={{ color: "var(--color-primary-gold)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
