// File: components/auth/auth-footer.tsx
// Purpose: Footer component with link to login/signup

import Link from 'next/link'

interface AuthFooterProps {
  question: string
  linkText: string
  href: string
}

export function AuthFooter({ question, linkText, href }: AuthFooterProps) {
  return (
    <div className="text-center pt-4 border-t border-gray-200">
      <p className="text-sm text-gray-600">
        {question}{' '}
        <Link
          href={href}
          className="font-medium text-blue-600 hover:text-blue-700 underline"
        >
          {linkText}
        </Link>
      </p>
    </div>
  )
}
