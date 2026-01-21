/**
 * Example: Complete Property Page Implementation
 * OWASP A01:2021 - Broken Access Control
 *
 * This is a complete example of how to use the new security patterns
 * and Supabase integration in a server component
 */

import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchCompanyProperties } from '@/lib/supabase/data-fetching'
import { PropertiesList } from '@/components/property/properties-list'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface PropertiesPageProps {
  searchParams: { page?: string; status?: string; city?: string }
}

/**
 * Server Component - Fetch data securely on server
 * RLS enforced by Supabase - user can only see company properties
 */
export default async function PropertiesPage({
  searchParams,
}: PropertiesPageProps) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    // Redirect to login if not authenticated
    redirect('/login')
  }

  try {
    const currentPage = Math.max(1, parseInt(searchParams.page || '1'))

    // Fetch properties with RLS enforced by Supabase
    // User automatically sees only their company's data
    const result = await fetchCompanyProperties(
      {
        status: searchParams.status,
        city: searchParams.city,
      },
      {
        page: currentPage,
        limit: 20,
      }
    )

    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <PropertiesList
            initialProperties={result.properties}
            totalCount={result.total}
            currentPage={currentPage}
          />
        </div>
      </main>
    )
  } catch (error) {
    console.error('Error fetching properties:', error)

    // Show error message
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Card className="p-8 border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Failed to Load Properties
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  We encountered an error while loading your properties. Please try
                  refreshing the page or contact support.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    )
  }
}
