/**
 * Showings Loading Skeleton
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function ShowingsLoading() {
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
        {/* Calendar or Schedule View */}
        <Card className="border-0 shadow-lg p-6">
          <Skeleton className="h-10 w-full mb-6" />
          <div className="grid grid-cols-7 gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
