'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Mail, Users, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

interface OnboardingWizardProps {
  userEmail: string
  companyName: string
}

export function OnboardingWizard({ userEmail, companyName }: OnboardingWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [skipped, setSkipped] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [companyDetails, setCompanyDetails] = useState({
    industry: '',
    teamSize: '',
    phone: '',
    address: '',
  })
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteError, setInviteError] = useState<string | null>(null)

  const steps: OnboardingStep[] = [
    {
      id: 'logo',
      title: 'Brand Identity',
      description: 'Upload your company logo to define your presence',
      icon: <Upload className="w-5 h-5" />,
      completed: logoFile !== null,
    },
    {
      id: 'details',
      title: 'Organization',
      description: 'Tell us about your prestigious firm',
      icon: <AlertCircle className="w-5 h-5" />,
      completed: !!(companyDetails.industry && companyDetails.teamSize),
    },
    {
      id: 'invite',
      title: 'Collaboration',
      description: 'Invite your elite team members',
      icon: <Users className="w-5 h-5" />,
      completed: inviteEmail !== '',
    },
  ]

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      setLogoFile(file)
      setError(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await completeOnboarding()
    }
  }

  const handleSkip = async () => {
    setSkipped(true)
    await completeOnboarding()
  }

  const completeOnboarding = async () => {
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      if (userEmail) formData.append('userEmail', userEmail)
      if (logoFile) formData.append('logo', logoFile)
      formData.append('companyDetails', JSON.stringify(companyDetails))
      if (inviteEmail) formData.append('inviteEmail', inviteEmail)

      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || `Server error: ${response.statusText}`)
      }
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteError(null)
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setInviteError('Please enter a valid email address')
      return
    }
    try {
      const response = await fetch('/api/onboarding/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to send invite')
      }
      setInviteEmail('')
      setInviteError(null)
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invite')
    }
  }

  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
          Welcome to <span className="bg-gradient-to-r from-[#C9A84C] via-[#F1DB9D] to-[#C9A84C] bg-clip-text text-transparent">EstateFlow</span>
        </h1>
        <p className="text-white/60 text-lg">
          Elevating the {companyName} experience, one step at a time.
        </p>
      </motion.div>

      {/* Progress & Steps Tracker */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white/80 font-medium">
            Phases of Onboarding: <span className="text-[#C9A84C]">{currentStep + 1} / {steps.length}</span>
          </h2>
          <button
            onClick={handleSkip}
            className="text-sm text-white/40 hover:text-[#C9A84C] transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* Integrated Progress Bar and Step Indicators */}
        <div className="relative mb-12">
          {/* Background Track */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2" />
          
          {/* Active Track */}
          <motion.div 
            className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-[#C9A84C] to-[#E5C767] -translate-y-1/2 z-10"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.8, ease: "circOut" }}
          />

          {/* Step Nodes */}
          <div className="relative z-20 flex justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <motion.div
                  onClick={() => index <= currentStep && setCurrentStep(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-2 transition-all duration-500 ${
                    index < currentStep
                      ? 'bg-[#C9A84C] border-[#C9A84C] text-black shadow-[0_0_15px_rgba(201,168,76,0.3)]'
                      : index === currentStep
                      ? 'bg-black border-[#C9A84C] text-[#C9A84C] shadow-[0_0_20px_rgba(201,168,76,0.2)]'
                      : 'bg-[#121212] border-white/10 text-white/20'
                  }`}
                  whileHover={index <= currentStep ? { scale: 1.1 } : {}}
                >
                  {index < currentStep ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
                </motion.div>
                <span className={`text-[10px] mt-2 font-semibold uppercase tracking-widest ${
                  index <= currentStep ? 'text-[#C9A84C]' : 'text-white/20'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <Card className="bg-black/40 backdrop-blur-xl border border-[#C9A84C]/20 shadow-2xl overflow-hidden rounded-2xl relative">
        {/* Decorative corner accents */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A84C]/5 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#C9A84C]/5 blur-3xl rounded-full" />

        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={steps[currentStep].id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {steps[currentStep].title}
                </h3>
                <p className="text-white/50">
                  {steps[currentStep].description}
                </p>
              </div>

              <div className="min-h-[220px]">
                {currentStep === 0 && (
                  <div className="space-y-6">
                    {logoPreview ? (
                      <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-xl border border-white/10">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="max-h-40 rounded-lg object-contain shadow-2xl"
                        />
                        <button
                          onClick={() => {
                            setLogoFile(null)
                            setLogoPreview(null)
                          }}
                          className="mt-6 text-sm text-[#C9A84C] hover:text-[#E5C767] font-medium transition-colors"
                        >
                          Change Logo Image
                        </button>
                      </div>
                    ) : (
                      <label className="group block relative cursor-pointer">
                        <div className="flex flex-col items-center justify-center w-full p-12 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02] group-hover:bg-white/[0.04] group-hover:border-[#C9A84C]/30 transition-all duration-300">
                          <div className="w-16 h-16 bg-[#C9A84C]/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                            <Upload className="w-8 h-8 text-[#C9A84C]" />
                          </div>
                          <span className="text-white/80 font-medium mb-1">Upload your brand mark</span>
                          <span className="text-white/30 text-xs">PNG, JPG or SVG (max 5MB)</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="industry" className="text-white/60 ml-1">Industry</Label>
                      <Input
                        id="industry"
                        placeholder="e.g., Luxury Real Estate"
                        value={companyDetails.industry}
                        onChange={(e) => setCompanyDetails({ ...companyDetails, industry: e.target.value })}
                        className="bg-white/5 border-white/10 focus:border-[#C9A84C] focus:ring-[#C9A84C]/20 text-white h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teamSize" className="text-white/60 ml-1">Team Size</Label>
                      <select
                        id="teamSize"
                        value={companyDetails.teamSize}
                        onChange={(e) => setCompanyDetails({ ...companyDetails, teamSize: e.target.value })}
                        className="w-full h-12 px-4 rounded-md bg-white/5 border border-white/10 focus:border-[#C9A84C] focus:ring-[#C9A84C]/20 text-white outline-none transition-all"
                      >
                        <option value="" className="bg-[#121212]">Select range</option>
                        <option value="1-5" className="bg-[#121212]">1-5 Associates</option>
                        <option value="6-20" className="bg-[#121212]">6-20 Professionals</option>
                        <option value="21-50" className="bg-[#121212]">21-50 Firm Members</option>
                        <option value="51+" className="bg-[#121212]">51+ Enterprise</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white/60 ml-1">International Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={companyDetails.phone}
                        onChange={(e) => setCompanyDetails({ ...companyDetails, phone: e.target.value })}
                        className="bg-white/5 border-white/10 focus:border-[#C9A84C] focus:ring-[#C9A84C]/20 text-white h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-white/60 ml-1">HQ Address</Label>
                      <Input
                        id="address"
                        placeholder="Global headquarters address"
                        value={companyDetails.address}
                        onChange={(e) => setCompanyDetails({ ...companyDetails, address: e.target.value })}
                        className="bg-white/5 border-white/10 focus:border-[#C9A84C] focus:ring-[#C9A84C]/20 text-white h-12"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <form onSubmit={handleInvite} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="inviteEmail" className="text-white/60 ml-1">Core Team Member Email</Label>
                        <div className="flex gap-3">
                          <Input
                            id="inviteEmail"
                            type="email"
                            placeholder="colleague@estateflow.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="bg-white/5 border-white/10 focus:border-[#C9A84C] focus:ring-[#C9A84C]/20 text-white h-12"
                          />
                          <Button
                            type="submit"
                            disabled={!inviteEmail || loading}
                            className="h-12 px-6 bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 hover:bg-[#C9A84C] hover:text-black transition-all duration-300"
                          >
                            Send Invite
                          </Button>
                        </div>
                        {inviteError && (
                          <p className="text-sm text-red-500 mt-2 ml-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {inviteError}
                          </p>
                        )}
                      </div>
                    </form>

                    <div className="p-4 bg-[#C9A84C]/5 rounded-xl border border-[#C9A84C]/10 flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 flex items-center justify-center shrink-0">
                        <span className="text-[#C9A84C] text-lg italic font-serif">i</span>
                      </div>
                      <p className="text-sm text-white/50 leading-relaxed pt-1">
                        EstateFlow thrives on collaboration. You can invite additional team members and manage sophisticated access controls within your dashboard settings.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/5">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0 || loading}
              className="text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-0"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous Phase
            </Button>

            <Button
              onClick={handleNext}
              disabled={loading}
              className="bg-gradient-to-r from-[#C9A84C] to-[#E5C767] text-black font-bold h-12 px-8 rounded-full shadow-[0_4px_15px_rgba(201,168,76,0.2)] hover:shadow-[0_4px_25px_rgba(201,168,76,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {currentStep === steps.length - 1 ? 'Enter Workspace' : 'Continue Experience'}
                  {currentStep < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 ml-2" />
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Footer Branding */}
      <div className="mt-8 text-center opacity-30 flex items-center justify-center gap-2">
        <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white" />
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white">The Gold Standard</span>
        <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white" />
      </div>
    </div>
  )
}
