'use client'
// components/ui/confirm-dialog.tsx
// Animated, theme-consistent confirmation modal
// Supports destructive / warning / default variants with loading state

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Info, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  variant: 'destructive' | 'warning' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  const variantConfig = {
    destructive: {
      icon: AlertTriangle,
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-400',
      border: 'border-red-500/20',
      glow: 'shadow-red-500/10',
      btnClass: 'bg-red-600 hover:bg-red-700 text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
      border: 'border-amber-500/20',
      glow: 'shadow-amber-500/10',
      btnClass: 'bg-amber-500 hover:bg-amber-600 text-black hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    },
    default: {
      icon: Info,
      iconBg: 'bg-[var(--color-primary-gold)]/10',
      iconColor: 'text-[var(--color-primary-gold)]',
      border: 'border-[var(--color-primary-gold)]/20',
      glow: 'shadow-[var(--color-primary-gold)]/10',
      btnClass: 'bg-gradient-to-r from-[#c5a059] to-[#e8d4a0] text-black hover:shadow-[0_0_24px_rgba(197,160,89,0.5)]',
    },
  }

  const cfg = variantConfig[variant]
  const Icon = cfg.icon

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90]"
            onClick={!loading ? onCancel : undefined}
          />

          {/* Dialog */}
          <motion.div
            key="confirm-dialog"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[91]
                        w-full max-w-md rounded-2xl border ${cfg.border}
                        bg-[var(--color-bg-card)] p-6
                        shadow-2xl ${cfg.glow}`}
          >
            {/* Close button */}
            {!loading && (
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground
                           hover:text-foreground hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className={`shrink-0 p-2.5 rounded-xl ${cfg.iconBg}`}>
                <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground leading-tight">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="border-white/10 bg-white/5 hover:bg-white/10 text-foreground"
              >
                {cancelLabel}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={loading}
                className={`min-w-[90px] transition-all duration-200 ${cfg.btnClass}`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  confirmLabel
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
