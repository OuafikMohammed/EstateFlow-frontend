// components/skeletons/property-card-skeleton.tsx
export function PropertyCardSkeleton() {
  return (
    <div className="glass rounded-xl overflow-hidden border border-white/5">
      <div className="skeleton h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded-md" />
        <div className="skeleton h-4 w-1/2 rounded-md" />
        <div className="flex gap-3 mt-2">
          <div className="skeleton h-4 w-14 rounded-full" />
          <div className="skeleton h-4 w-14 rounded-full" />
          <div className="skeleton h-4 w-14 rounded-full" />
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-white/5">
          <div className="skeleton h-5 w-24 rounded-md" />
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
