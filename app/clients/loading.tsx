/**
 * Clients Loading Skeleton
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function ClientsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Search/Filter */}
        <Skeleton className="h-10 w-full mb-6" />

        {/* Table */}
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 py-4 border-b last:border-b-0">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
