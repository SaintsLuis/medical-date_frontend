import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'
import { markInvoiceAsCashPaidAction } from '../actions/billing-actions'
import type { Invoice } from '../types'

type DialogState = 'confirm' | 'success' | 'error' | 'loading'

interface CashPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
  onSuccess?: () => void
}

export function CashPaymentDialog({
  open,
  onOpenChange,
  invoice,
  onSuccess,
}: CashPaymentDialogProps) {
  const [state, setState] = useState<DialogState>('confirm')
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    if (!invoice) return
    setState('loading')
    const res = await markInvoiceAsCashPaidAction(invoice.id)
    if (res.success) {
      setState('success')
      setTimeout(() => {
        onOpenChange(false)
        setState('confirm')
        setError('')
        onSuccess?.()
      }, 1200)
    } else {
      setError(res.error || 'Error desconocido')
      setState('error')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {state === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle>¿Confirmar pago en efectivo?</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que el paciente pagó en efectivo esta factura?
              </DialogDescription>
            </DialogHeader>
            <div className='flex justify-end gap-2 mt-4'>
              <Button
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={(state as DialogState) === 'loading'}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={(state as DialogState) === 'loading'}
              >
                {(state as DialogState) === 'loading'
                  ? 'Registrando...'
                  : 'Confirmar'}
              </Button>
            </div>
          </>
        )}
        {state === 'success' && (
          <div className='flex flex-col items-center justify-center py-8'>
            <CheckCircle className='w-12 h-12 text-green-600 mb-2' />
            <div className='text-lg font-semibold mb-1'>
              Pago registrado correctamente
            </div>
            <div className='text-muted-foreground text-sm'>
              La factura ha sido marcada como pagada en efectivo.
            </div>
          </div>
        )}
        {state === 'error' && (
          <div className='flex flex-col items-center justify-center py-8'>
            <XCircle className='w-12 h-12 text-red-600 mb-2' />
            <div className='text-lg font-semibold mb-1'>
              Error al registrar el pago
            </div>
            <div className='text-muted-foreground text-sm'>{error}</div>
            <Button className='mt-4' onClick={() => setState('confirm')}>
              Intentar de nuevo
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
