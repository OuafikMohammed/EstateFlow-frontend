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
import { LoginScene } from "@/components/3d/login-scene"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login - redirect to dashboard
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10"
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center mb-8"
          >
            <Image 
              src="/estateflow-logo.png" 
              alt="EstateFlow" 
              width={157} 
              height={40}
              className="h-8 sm:h-10 md:h-12 w-auto"
              priority
            />
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-8 shadow-xl"
          >
            <h1 className="text-3xl font-serif font-bold mb-2 text-[var(--color-text-light)]">Welcome Back</h1>
            <p className="text-[var(--color-muted-foreground)] mb-6">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[var(--color-text-light)]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)] focus:border-[var(--color-primary-gold)] transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[var(--color-text-light)]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)] focus:border-[var(--color-primary-gold)] transition-all"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm text-[var(--color-text-light)] cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm hover:underline"
                  style={{ color: "var(--color-primary-gold)" }}
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] text-[var(--color-bg-dark)] font-semibold hover:opacity-90 transition-all hover:scale-[1.02]"
                size="lg"
              >
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
              Don't have an account?{" "}
              <Link href="/register" className="hover:underline" style={{ color: "var(--color-primary-gold)" }}>
                Sign up
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - 3D Scene */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden lg:block w-1/2 relative bg-gradient-to-br from-[var(--color-bg-dark)] to-[var(--color-bg-card)]"
      >
        <LoginScene />
      </motion.div>
    </div>
  )
}
