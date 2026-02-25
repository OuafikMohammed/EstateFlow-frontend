// components/skeletons/table-skeleton.tsx
interface TableSkeletonProps {
  rows?: number
  cols?: number
}

export function TableSkeleton({ rows = 6, cols = 5 }: TableSkeletonProps) {
  return (
    <div className="glass rounded-xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className={`skeleton h-4 rounded-md ${i === 0 ? 'w-8' : 'flex-1'}`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-0"
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={colIdx}
              className={`skeleton h-4 rounded-md ${
                colIdx === 0 ? 'w-8' :
                colIdx === 1 ? 'w-32' :
                'flex-1'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
