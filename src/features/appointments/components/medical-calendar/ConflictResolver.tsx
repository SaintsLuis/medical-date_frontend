'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// UI Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Icons
import {
  AlertTriangle,
  Clock,
  User,
  Stethoscope,
  Calendar,
  CheckCircle,
  X,
} from 'lucide-react'

// Types
import type { ConflictResolverProps } from './types'

// ==============================================
// Componente Principal
// ==============================================

export function ConflictResolver({
  isOpen,
  conflicts = [],
  onResolve,
  onClose,
}: ConflictResolverProps) {
  const [selectedResolution, setSelectedResolution] = useState<string | null>(
    null
  )
  const [isResolving, setIsResolving] = useState(false)

  const handleResolve = async (action: string) => {
    setIsResolving(true)
    try {
      await onResolve(action, conflicts)
      onClose()
    } catch (error) {
      console.error('Error resolving conflicts:', error)
    } finally {
      setIsResolving(false)
    }
  }

  if (!isOpen || conflicts.length === 0) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-orange-600'>
            <AlertTriangle className='h-5 w-5' />
            Conflictos de Citas Detectados
          </DialogTitle>
          <DialogDescription>
            Se han encontrado conflictos con citas existentes. Por favor,
            selecciona cómo proceder.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Lista de conflictos */}
          <div className='space-y-4'>
            <h3 className='text-sm font-medium text-gray-900'>
              Conflictos encontrados ({conflicts.length})
            </h3>

            {conflicts.map((conflict, index) => (
              <Alert key={index} className='border-orange-200 bg-orange-50'>
                <AlertTriangle className='h-4 w-4 text-orange-600' />
                <AlertDescription>
                  <div className='space-y-3'>
                    <div className='font-medium text-orange-800'>
                      {conflict.type === 'doctor_unavailable' &&
                        'Doctor no disponible'}
                      {conflict.type === 'double_booking' && 'Doble reserva'}
                      {conflict.type === 'time_overlap' &&
                        'Solapamiento de horarios'}
                      {conflict.type === 'location_conflict' &&
                        'Conflicto de ubicación'}
                    </div>

                    <div className='text-sm text-orange-700'>
                      {conflict.message}
                    </div>

                    {/* Cita existente */}
                    {conflict.existingAppointment && (
                      <div className='mt-3 p-3 bg-white rounded-md border'>
                        <div className='text-xs font-medium text-gray-500 mb-2'>
                          CITA EXISTENTE
                        </div>

                        <div className='grid grid-cols-2 gap-4 text-sm'>
                          <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                              <User className='h-3 w-3 text-gray-400' />
                              <span>
                                {
                                  conflict.existingAppointment.patient
                                    ?.firstName
                                }{' '}
                                {conflict.existingAppointment.patient?.lastName}
                              </span>
                            </div>

                            <div className='flex items-center gap-2'>
                              <Stethoscope className='h-3 w-3 text-gray-400' />
                              <span>
                                Dr.{' '}
                                {conflict.existingAppointment.doctor?.firstName}{' '}
                                {conflict.existingAppointment.doctor?.lastName}
                              </span>
                            </div>
                          </div>

                          <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                              <Calendar className='h-3 w-3 text-gray-400' />
                              <span>
                                {format(
                                  new Date(conflict.existingAppointment.date),
                                  'dd/MM/yyyy',
                                  { locale: es }
                                )}
                              </span>
                            </div>

                            <div className='flex items-center gap-2'>
                              <Clock className='h-3 w-3 text-gray-400' />
                              <span>
                                {format(
                                  new Date(conflict.existingAppointment.date),
                                  'HH:mm',
                                  { locale: es }
                                )}{' '}
                                ({conflict.existingAppointment.duration} min)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className='mt-2'>
                          <Badge variant='outline' className='text-xs'>
                            {conflict.existingAppointment.status}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Sugerencias de resolución */}
                    {conflict.suggestions &&
                      conflict.suggestions.length > 0 && (
                        <div className='mt-3'>
                          <div className='text-xs font-medium text-gray-500 mb-2'>
                            SUGERENCIAS
                          </div>
                          <div className='space-y-1'>
                            {conflict.suggestions.map(
                              (suggestion, suggestionIndex) => (
                                <div
                                  key={suggestionIndex}
                                  className='text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded'
                                >
                                  {suggestion}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>

          {/* Opciones de resolución */}
          <div className='space-y-4'>
            <h3 className='text-sm font-medium text-gray-900'>
              ¿Cómo deseas proceder?
            </h3>

            <div className='space-y-3'>
              <button
                onClick={() => setSelectedResolution('cancel')}
                className={`w-full text-left p-4 border rounded-lg transition-colors ${
                  selectedResolution === 'cancel'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      selectedResolution === 'cancel'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedResolution === 'cancel' && (
                      <CheckCircle className='h-4 w-4 text-white' />
                    )}
                  </div>
                  <div>
                    <div className='font-medium text-gray-900'>
                      Cancelar la nueva cita
                    </div>
                    <div className='text-sm text-gray-500'>
                      No crear la cita y mantener las existentes
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedResolution('force')}
                className={`w-full text-left p-4 border rounded-lg transition-colors ${
                  selectedResolution === 'force'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      selectedResolution === 'force'
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedResolution === 'force' && (
                      <CheckCircle className='h-4 w-4 text-white' />
                    )}
                  </div>
                  <div>
                    <div className='font-medium text-gray-900'>
                      Crear cita de todas formas
                    </div>
                    <div className='text-sm text-gray-500'>
                      Crear la cita ignorando los conflictos (no recomendado)
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedResolution('reschedule')}
                className={`w-full text-left p-4 border rounded-lg transition-colors ${
                  selectedResolution === 'reschedule'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      selectedResolution === 'reschedule'
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedResolution === 'reschedule' && (
                      <CheckCircle className='h-4 w-4 text-white' />
                    )}
                  </div>
                  <div>
                    <div className='font-medium text-gray-900'>
                      Buscar otro horario
                    </div>
                    <div className='text-sm text-gray-500'>
                      Volver al formulario para seleccionar otra fecha/hora
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className='flex justify-end gap-2 pt-4 border-t'>
          <Button variant='outline' onClick={onClose} disabled={isResolving}>
            <X className='h-4 w-4 mr-2' />
            Cancelar
          </Button>

          <Button
            onClick={() =>
              selectedResolution && handleResolve(selectedResolution)
            }
            disabled={!selectedResolution || isResolving}
            className='min-w-[120px]'
          >
            {isResolving ? (
              <>
                <div className='h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent' />
                Resolviendo...
              </>
            ) : (
              <>
                <CheckCircle className='h-4 w-4 mr-2' />
                Continuar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
