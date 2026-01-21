'use client'

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className = '', showStrength = true, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const password = (props.value as string) || ''

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: 'bg-gray-300', strength: 0 }

    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++

    const strengthMap = {
      1: { label: 'Weak', color: 'bg-red-500', strength: 1 },
      2: { label: 'Fair', color: 'bg-orange-500', strength: 2 },
      3: { label: 'Good', color: 'bg-yellow-500', strength: 3 },
      4: { label: 'Strong', color: 'bg-blue-500', strength: 4 },
      5: { label: 'Very Strong', color: 'bg-green-500', strength: 5 },
    }

    return strengthMap[strength as keyof typeof strengthMap] || { label: '', color: 'bg-gray-300', strength: 0 }
  }

  const strength = getPasswordStrength(password)

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${className}`}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-text)] transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      {showStrength && password && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i < strength.strength ? strength.color : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Strength: <span className="text-blue-400">{strength.label}</span>
          </p>
        </div>
      )}
    </div>
  )
})

PasswordInput.displayName = 'PasswordInput'
