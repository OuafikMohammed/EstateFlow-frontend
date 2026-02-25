// components/skeletons/stat-card-skeleton.tsx
export function StatCardSkeleton() {
  return (
    <div className="glass rounded-xl p-6 border border-white/5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="skeleton h-10 w-10 rounded-xl" />
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
      <div className="skeleton h-9 w-28 rounded-lg" />
      <div className="skeleton h-4 w-36 rounded-md" />
    </div>
  )
}
