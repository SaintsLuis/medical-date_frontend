'use client'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Icons
import { X, Calendar } from 'lucide-react'

// Types
import type { Appointment } from '../../types'

interface DoctorSchedulePanelProps {
  doctorId: string
  date: Date
  onClose: () => void
  onAppointmentSelect: (appointment: Appointment) => void
  onTimeSlotSelect: (slotInfo: {
    start: Date
    end: Date
    slots: Date[]
  }) => void
}

// ==============================================
// Componente Principal
// ==============================================

export function DoctorSchedulePanel({
  doctorId,
  date,
  onClose,
}: DoctorSchedulePanelProps) {
  return (
    <Card className='w-full h-full'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium flex items-center gap-2'>
          <Calendar className='h-4 w-4' />
          Horario del Doctor
        </CardTitle>
        <Button
          variant='ghost'
          size='sm'
          onClick={onClose}
          className='h-6 w-6 p-0'
        >
          <X className='h-4 w-4' />
        </Button>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='text-center text-gray-500 py-8'>
          <Calendar className='h-8 w-8 mx-auto mb-2 text-gray-400' />
          <p className='text-sm'>Panel de horarios del doctor</p>
          <p className='text-xs text-gray-400 mt-1'>Doctor ID: {doctorId}</p>
          <p className='text-xs text-gray-400'>
            Fecha: {date.toLocaleDateString()}
          </p>
          <div className='mt-4 text-xs text-gray-400'>
            Este componente está pendiente de implementación completa.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
