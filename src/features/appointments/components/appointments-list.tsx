'use client'

import {
  useAppointments,
  useCancelAppointment,
  getStatusColor,
  getStatusText,
} from '../index'
import { DataTableWrapper } from '@/components/dashboard/tables/data-table-wrapper'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Calendar, User, Clock, AlertCircle } from 'lucide-react'
import type { Appointment } from '../types'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'

export function AppointmentsList() {
  const { user } = useAuthStore()

  // Determinar qué parámetros de filtrado usar basado en el rol del usuario
  const getFilterParams = () => {
    const baseParams = {
      page: 1,
      limit: 100, // Respeta el límite del backend
      includePatient: true,
      includeDoctor: true,
      sortByDate: 'asc' as const,
    }

    if (!user) return baseParams

    // Si es doctor, filtrar por doctorId
    if (user.roles.includes(UserRole.DOCTOR)) {
      return {
        ...baseParams,
        doctorId: user.id,
      }
    }

    // Si es paciente, filtrar por patientId
    if (user.roles.includes(UserRole.PATIENT)) {
      return {
        ...baseParams,
        patientId: user.id,
      }
    }

    // Si es admin, mostrar todas las citas
    return baseParams
  }

  const {
    data: appointmentsResponse,
    isLoading,
    error,
    refetch,
  } = useAppointments(getFilterParams())

  const cancelAppointment = useCancelAppointment()

  // Extraer appointments de la respuesta paginada
  const appointments = appointmentsResponse?.data?.data || []
  const meta = appointmentsResponse?.data?.meta

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
            className='p-0 h-auto font-normal ml-2'
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
      description={`Lista de ${
        meta?.total || appointments.length
      } citas programadas`}
    >
      <div className='space-y-4'>
        {/* Información de paginación */}
        {meta && (
          <div className='text-sm text-muted-foreground mb-4'>
            Mostrando {appointments.length} de {meta.total} citas
            {meta.totalPages > 1 &&
              ` (Página ${meta.page} de ${meta.totalPages})`}
          </div>
        )}

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
                      {appointment.patient?.firstName || 'N/A'}{' '}
                      {appointment.patient?.lastName || ''}
                    </span>
                    <span className='text-muted-foreground'>→</span>
                    <span className='font-medium'>
                      {appointment.doctor?.firstName || 'N/A'}{' '}
                      {appointment.doctor?.lastName || ''}
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

                  {appointment.price && (
                    <div className='text-sm text-muted-foreground'>
                      <span className='font-medium'>Precio:</span> $
                      {appointment.price}
                    </div>
                  )}
                </div>

                <div className='flex flex-col items-end gap-3'>
                  <Badge className={getStatusColor(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Badge>

                  <Badge variant='outline'>
                    {appointment.type === 'VIRTUAL'
                      ? '💻 Virtual'
                      : '🏥 Presencial'}
                  </Badge>

                  {(appointment.status === 'SCHEDULED' ||
                    appointment.status === 'CONFIRMED') && (
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

        {/* Información adicional al final */}
        {meta && meta.totalPages > 1 && (
          <div className='text-center text-sm text-muted-foreground pt-4'>
            Para ver más citas, use los controles de paginación en la parte
            superior.
          </div>
        )}
      </div>
    </DataTableWrapper>
  )
}
