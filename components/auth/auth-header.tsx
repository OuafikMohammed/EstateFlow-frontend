// File: components/auth/auth-header.tsx
// Purpose: Header component with logo and title

interface AuthHeaderProps {
  title: string
  subtitle?: string
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="text-center space-y-2 mb-8">
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">F</span>
        </div>
        <span className="font-bold text-xl text-gray-900">EstateFlow</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
    </div>
  )
}
