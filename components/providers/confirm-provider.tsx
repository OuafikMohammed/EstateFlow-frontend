'use client'
// components/providers/confirm-provider.tsx
// Global confirmation modal system — use via useConfirm() hook anywhere in the app
// Supports async actions, loading states, and animated entrance/exit

import { createContext, useContext, useRef, useState } from 'react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export interface ConfirmOptions {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'destructive' | 'warning' | 'default'
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<{ confirm: ConfirmFn } | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { open: boolean }) | null>(null)
  const resolverRef = useRef<((val: boolean) => void) | null>(null)

  const confirm: ConfirmFn = (options) => {
    setState({ ...options, open: true })
    return new Promise((resolve) => {
      resolverRef.current = resolve
    })
  }

  const handleConfirm = () => {
    resolverRef.current?.(true)
    setState(null)
  }

  const handleCancel = () => {
    resolverRef.current?.(false)
    setState(null)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <ConfirmDialog
          open={state.open}
          title={state.title}
          description={state.description}
          confirmLabel={state.confirmLabel ?? 'Confirm'}
          cancelLabel={state.cancelLabel ?? 'Cancel'}
          variant={state.variant ?? 'destructive'}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirmContext() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirmContext must be used inside <ConfirmProvider>')
  return ctx
}
