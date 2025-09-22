'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Archive, AlertTriangle, Info, Loader2 } from 'lucide-react'
import { MedicalRecord } from '../types'

interface ArchiveMedicalRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record?: MedicalRecord | null
  onConfirm: (reason: string) => Promise<void>
  isLoading?: boolean
}

export function ArchiveMedicalRecordDialog({
  open,
  onOpenChange,
  record,
  onConfirm,
  isLoading = false,
}: ArchiveMedicalRecordDialogProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      setError('Debe proporcionar una razón para el archivado')
      return
    }

    if (reason.trim().length < 10) {
      setError('La razón debe tener al menos 10 caracteres')
      return
    }

    try {
      setError('')
      await onConfirm(reason.trim())
      setReason('')
      onOpenChange(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  const handleCancel = () => {
    setReason('')
    setError('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Archive className='h-5 w-5 text-amber-600' />
            Archivar Registro Médico
          </DialogTitle>
          <DialogDescription>
            Esta acción archivará permanentemente el registro médico
            seleccionado. Los registros archivados no pueden ser editados pero
            permanecen disponibles para consulta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Información del registro */}
          {record && (
            <div className='rounded-lg bg-gray-50 p-3 border'>
              <div className='text-sm'>
                <div className='font-medium text-gray-900'>
                  Registro del{' '}
                  {new Date(record.date).toLocaleDateString('es-ES')}
                </div>
                <div className='text-gray-600 mt-1'>
                  Diagnóstico: {record.diagnosis}
                </div>
                <div className='text-gray-600'>
                  Paciente: {record.patientProfile?.user?.firstName}{' '}
                  {record.patientProfile?.user?.lastName}
                </div>
              </div>
            </div>
          )}

          {/* Alerta de seguridad médica */}
          <Alert className='border-amber-200 bg-amber-50'>
            <AlertTriangle className='h-4 w-4 text-amber-600' />
            <AlertDescription className='text-amber-800'>
              <strong>Importante:</strong> Los registros médicos archivados
              mantienen su valor legal y están disponibles para auditorías
              médicas y requerimientos regulatorios.
            </AlertDescription>
          </Alert>

          {/* Campo de razón */}
          <div className='space-y-2'>
            <Label htmlFor='archive-reason' className='text-sm font-medium'>
              Razón para el archivado <span className='text-red-500'>*</span>
            </Label>
            <Textarea
              id='archive-reason'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='Ingrese la razón detallada para archivar este registro médico...'
              className='min-h-[100px] resize-none'
              disabled={isLoading}
              maxLength={500}
            />
            <div className='flex justify-between text-xs text-gray-500'>
              <span>Mínimo 10 caracteres</span>
              <span>{reason.length}/500</span>
            </div>
          </div>

          {/* Información adicional */}
          <Alert>
            <Info className='h-4 w-4' />
            <AlertDescription className='text-sm'>
              Esta acción requiere permisos de administrador y se registrará en
              el sistema de auditoría. El registro archivado permanecerá visible
              en la sección de archivos.
            </AlertDescription>
          </Alert>

          {/* Error message */}
          {error && (
            <Alert variant='destructive'>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className='gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              variant='default'
              disabled={
                isLoading || !reason.trim() || reason.trim().length < 10
              }
              className='bg-amber-600 hover:bg-amber-700'
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Archivando...
                </>
              ) : (
                <>
                  <Archive className='mr-2 h-4 w-4' />
                  Archivar Registro
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
