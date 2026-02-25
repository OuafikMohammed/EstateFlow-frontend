// components/skeletons/header-auth-skeleton.tsx
// Shown during the brief moment before Zustand store is hydrated
// Matches the exact dimensions of the auth buttons to prevent layout shift

export function HeaderAuthSkeleton() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <div className="skeleton h-9 w-20 rounded-lg" />
      <div className="skeleton h-9 w-32 rounded-full" />
    </div>
  )
}
