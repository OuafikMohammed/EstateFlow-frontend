'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Mail, Users } from 'lucide-react'
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
      title: 'Company Logo',
      description: 'Upload your company logo for branding',
      icon: <Upload className="w-6 h-6" />,
      completed: logoFile !== null,
    },
    {
      id: 'details',
      title: 'Company Details',
      description: 'Tell us more about your organization',
      icon: <AlertCircle className="w-6 h-6" />,
      completed: !!(companyDetails.industry && companyDetails.teamSize),
    },
    {
      id: 'invite',
      title: 'Invite Team Member',
      description: 'Optionally invite your first team member',
      icon: <Users className="w-6 h-6" />,
      completed: inviteEmail !== '',
    },
  ]

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }

      setLogoFile(file)
      setError(null)

      // Create preview
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
      // Complete onboarding
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

      // Add logo if present
      if (logoFile) {
        formData.append('logo', logoFile)
      }

      // Add company details
      formData.append('companyDetails', JSON.stringify(companyDetails))

      // Add invite email if present
      if (inviteEmail) {
        formData.append('inviteEmail', inviteEmail)
      }

      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to complete onboarding')
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('[ONBOARDING ERROR]', err)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to EstateFlow</h1>
          <p className="text-slate-400">
            Let's set up your {companyName} workspace in a few quick steps
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">
              Step {currentStep + 1} of {steps.length}
            </h2>
            <button
              onClick={handleSkip}
              className="text-sm text-slate-400 hover:text-slate-300"
            >
              Skip for now
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
            />
          </div>
        </div>

        {/* Steps Overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              onClick={() => {
                if (index <= currentStep) {
                  setCurrentStep(index)
                }
              }}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                index === currentStep
                  ? 'bg-blue-600 text-white shadow-lg'
                  : index < currentStep
                    ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                    : 'bg-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                {index < currentStep ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
              </div>
              <p className="text-sm font-medium mt-2">{step.title}</p>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="p-8">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {steps[0].title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {steps[0].description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="max-h-40 mx-auto rounded-lg object-contain"
                        />
                        <button
                          onClick={() => {
                            setLogoFile(null)
                            setLogoPreview(null)
                          }}
                          className="mt-4 text-sm text-slate-600 hover:text-slate-900 dark:hover:text-slate-300"
                        >
                          Choose Different File
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center w-full p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex flex-col items-center">
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Click to upload or drag and drop
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            PNG, JPG or SVG (max 5MB)
                          </span>
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
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {steps[1].title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {steps[1].description}
                    </p>
                  </div>

                  <form className="space-y-4">
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        placeholder="e.g., Real Estate, Finance, Hospitality"
                        value={companyDetails.industry}
                        onChange={(e) =>
                          setCompanyDetails({
                            ...companyDetails,
                            industry: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="teamSize">Team Size</Label>
                      <select
                        id="teamSize"
                        value={companyDetails.teamSize}
                        onChange={(e) =>
                          setCompanyDetails({
                            ...companyDetails,
                            teamSize: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                      >
                        <option value="">Select team size</option>
                        <option value="1-5">1-5 people</option>
                        <option value="6-20">6-20 people</option>
                        <option value="21-50">21-50 people</option>
                        <option value="51+">51+ people</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={companyDetails.phone}
                        onChange={(e) =>
                          setCompanyDetails({
                            ...companyDetails,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="Your company address"
                        value={companyDetails.address}
                        onChange={(e) =>
                          setCompanyDetails({
                            ...companyDetails,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                  </form>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="invite"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {steps[2].title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {steps[2].description}
                    </p>
                  </div>

                  <form onSubmit={handleInvite} className="space-y-4">
                    <div>
                      <Label htmlFor="inviteEmail">Team Member Email</Label>
                      <div className="flex gap-2">
                        <Input
                          id="inviteEmail"
                          type="email"
                          placeholder="colleague@company.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          disabled={!inviteEmail || loading}
                        >
                          Send Invite
                        </Button>
                      </div>
                      {inviteError && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                          {inviteError}
                        </p>
                      )}
                    </div>
                  </form>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      💡 Tip: You can add team members anytime from the settings page.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0 || loading}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={loading}
                className="ml-auto"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
                {currentStep < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 ml-2" />
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Skip Link */}
        {!skipped && currentStep === 0 && (
          <div className="text-center mt-6">
            <button
              onClick={handleSkip}
              disabled={loading}
              className="text-slate-400 hover:text-slate-300 text-sm"
            >
              Skip setup and go to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
