// hooks/use-confirm.ts
// Simple consumer hook — import this everywhere you need a confirm dialog

import { useConfirmContext } from '@/components/providers/confirm-provider'

export const useConfirm = () => useConfirmContext().confirm
