/**
 * 404 Not Found Page with Intelligent Redirect
 * OWASP - Error Handling and Logging
 *
 * Provides user-friendly 404 page with:
 * - Navigation suggestions
 * - Search functionality
 * - Breadcrumb trail
 * - Links to main sections
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Home,
  Building2,
  Users,
  BarChart3,
  ArrowRight,
  Search,
  ChevronLeft,
} from 'lucide-react'

export default function NotFound() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState('')

  const navigationSuggestions = [
    {
      icon: Home,
      title: 'Dashboard',
      description: 'View your overview and analytics',
      href: '/dashboard',
    },
    {
      icon: Building2,
      title: 'Properties',
      description: 'Manage your property listings',
      href: '/properties',
    },
    {
      icon: Users,
      title: 'Clients',
      description: 'View and manage your clients',
      href: '/clients',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'View detailed analytics and reports',
      href: '/settings',
    },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/properties?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation Bar */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* 404 Display */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              404
            </h1>
          </div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            Sorry, we couldn't find the page you're looking for. Let's get you back on track.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="max-w-md mx-auto mb-12"
          >
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search properties, clients..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
              />
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Navigation Suggestions */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Where would you like to go?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {navigationSuggestions.map((suggestion) => {
              const Icon = suggestion.icon
              return (
                <Link key={suggestion.href} href={suggestion.href}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-0 bg-white dark:bg-slate-800">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className="w-6 h-6 text-blue-600" />
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {suggestion.title}
                          </h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {suggestion.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Helpful Links */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Quick Links
          </h3>
          <div className="space-y-2 text-sm">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Return to Dashboard
            </Link>
            <Link
              href="/help"
              className="text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              View Help & Support
            </Link>
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
