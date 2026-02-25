// components/ui/gold-button.tsx
// Brand CTA button with shimmer sweep animation and gold glow on hover
// Use for primary actions: "Get Started", "Create Property", "Save Changes"

import { Loader2 } from 'lucide-react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pending?: boolean
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

const sizeStyles = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-base',
}

export function GoldButton({
  children,
  pending = false,
  fullWidth = false,
  size = 'md',
  className,
  disabled,
  asChild = false,
  ...props
}: GoldButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      disabled={pending || disabled}
      className={cn(
        'relative rounded-xl font-semibold overflow-hidden transition-all duration-300',
        'bg-gradient-to-r from-[#c5a059] to-[#e8d4a0] text-black',
        'hover:shadow-[0_0_28px_rgba(197,160,89,0.55)] hover:scale-[1.02]',
        'active:scale-[0.97]',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none',
        'group inline-flex items-center justify-center',
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className
      )}
      {...(props as any)}
    >
      {asChild ? (
        children
      ) : (
        <>
          {/* Shimmer sweep */}
          <span
            className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                       transition-transform duration-700 ease-in-out
                       bg-gradient-to-r from-transparent via-white/25 to-transparent
                       pointer-events-none"
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
          </span>
        </>
      )}
    </Comp>
  )
}

