// components/skeletons/dashboard-skeleton.tsx
import { StatCardSkeleton } from './stat-card-skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page header */}
      <div className="space-y-2">
        <div className="skeleton h-8 w-56 rounded-lg" />
        <div className="skeleton h-4 w-80 rounded-md" />
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Chart + table row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 glass rounded-xl border border-white/5 p-6 space-y-4">
          <div className="skeleton h-5 w-32 rounded-md" />
          <div className="skeleton h-48 w-full rounded-xl" />
        </div>
        {/* Recent activity */}
        <div className="glass rounded-xl border border-white/5 p-6 space-y-4">
          <div className="skeleton h-5 w-28 rounded-md" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3.5 w-full rounded-md" />
                <div className="skeleton h-3 w-2/3 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
