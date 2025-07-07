'use client'

import {
  useAppointments,
  useCancelAppointment,
} from '@/hooks/api/use-appointments'
import { DataTableWrapper } from '@/components/dashboard/tables/data-table-wrapper'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Calendar, User, Clock, AlertCircle } from 'lucide-react'
import type { Appointment } from '@/types/appointment'

export function AppointmentsList() {
  const { data: appointments, isLoading, error, refetch } = useAppointments()

  const cancelAppointment = useCancelAppointment()

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'Confirmada'
      case 'pending':
        return 'Pendiente'
      case 'cancelled':
        return 'Cancelada'
      case 'completed':
        return 'Completada'
      default:
        return status
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment.mutateAsync({
        id: appointmentId,
        reason: 'Cancelada por el usuario',
      })
    } catch (error) {
      console.error('Error al cancelar la cita:', error)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex items-center space-x-2'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span>Cargando citas...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>
          Error al cargar las citas.
          <Button
            variant='link'
            onClick={() => refetch()}
            className='p-0 h-auto font-normal'
          >
            Intentar de nuevo
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Citas Médicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <Calendar className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
            <h3 className='text-lg font-medium mb-2'>
              No hay citas programadas
            </h3>
            <p className='text-muted-foreground'>
              No se encontraron citas médicas en el sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <DataTableWrapper
      title='Citas Médicas'
      description='Lista de todas las citas programadas'
    >
      <div className='space-y-4'>
        {appointments.map((appointment: Appointment) => (
          <Card
            key={appointment.id}
            className='hover:shadow-md transition-shadow'
          >
            <CardContent className='p-6'>
              <div className='flex justify-between items-start'>
                <div className='space-y-3 flex-1'>
                  <div className='flex items-center gap-2'>
                    <User className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>
                      {appointment.patient?.firstName}{' '}
                      {appointment.patient?.lastName}
                    </span>
                    <span className='text-muted-foreground'>→</span>
                    <span className='font-medium'>
                      Dr. {appointment.doctor?.firstName}{' '}
                      {appointment.doctor?.lastName}
                    </span>
                  </div>

                  <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                      <Calendar className='h-4 w-4' />
                      {new Date(appointment.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className='flex items-center gap-1'>
                      <Clock className='h-4 w-4' />
                      {new Date(appointment.date).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className='text-sm text-muted-foreground'>
                      <span className='font-medium'>Notas:</span>{' '}
                      {appointment.notes}
                    </div>
                  )}
                </div>

                <div className='flex flex-col items-end gap-3'>
                  <Badge className={getStatusColor(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Badge>

                  {appointment.status.toLowerCase() === 'pending' && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleCancelAppointment(appointment.id)}
                      disabled={cancelAppointment.isPending}
                    >
                      {cancelAppointment.isPending ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        'Cancelar'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DataTableWrapper>
  )
}
