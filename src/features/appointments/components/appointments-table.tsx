'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// UI Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Icons
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  Stethoscope,
  Filter,
  Search,
} from 'lucide-react'

// Types
import type { Appointment, AppointmentStatus } from '../types'

// ==============================================
// Utilidades de Estado
// ==============================================

const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'COMPLETED':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'NO_SHOW':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusText = (status: AppointmentStatus) => {
  switch (status) {
    case 'SCHEDULED':
      return 'Programada'
    case 'CONFIRMED':
      return 'Confirmada'
    case 'CANCELLED':
      return 'Cancelada'
    case 'COMPLETED':
      return 'Completada'
    case 'NO_SHOW':
      return 'No Show'
    default:
      return status
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'VIRTUAL':
      return <Video className='h-4 w-4 text-purple-600' />
    case 'IN_PERSON':
      return <MapPin className='h-4 w-4 text-blue-600' />
    default:
      return <Calendar className='h-4 w-4 text-gray-600' />
  }
}

const getTypeText = (type: string) => {
  switch (type) {
    case 'VIRTUAL':
      return 'Virtual'
    case 'IN_PERSON':
      return 'Presencial'
    default:
      return type
  }
}

// ==============================================
// Componente de Tabla
// ==============================================

interface AppointmentsTableProps {
  data: Appointment[]
}

export function AppointmentsTable({ data }: AppointmentsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'ALL'>(
    'ALL'
  )

  // Filtrar datos
  const filteredData = data.filter((appointment) => {
    const matchesSearch =
      appointment.patient?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.patient?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.doctor?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.doctor?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'ALL' || appointment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleActionClick = (action: string, appointment: Appointment) => {
    switch (action) {
      case 'edit':
        console.log('Editar cita:', appointment.id)
        break
      case 'delete':
        console.log('Eliminar cita:', appointment.id)
        break
      case 'reschedule':
        console.log('Reprogramar cita:', appointment.id)
        break
      default:
        break
    }
  }

  return (
    <div className='space-y-4'>
      {/* Controles de Filtrado */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <div className='flex flex-1 gap-2'>
          <div className='relative flex-1 max-w-sm'>
            <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Buscar pacientes, doctores...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-8'
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='gap-2'>
                <Filter className='h-4 w-4' />
                Estado:{' '}
                {statusFilter === 'ALL' ? 'Todos' : getStatusText(statusFilter)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start'>
              <DropdownMenuItem onClick={() => setStatusFilter('ALL')}>
                Todos los estados
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('SCHEDULED')}>
                Programadas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('CONFIRMED')}>
                Confirmadas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('COMPLETED')}>
                Completadas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('CANCELLED')}>
                Canceladas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('NO_SHOW')}>
                No Show
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='text-sm text-gray-500'>
          {filteredData.length} de {data.length} citas
        </div>
      </div>

      {/* Tabla */}
      <div className='border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead className='w-[100px]'>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='h-24 text-center'>
                  No se encontraron citas.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((appointment) => (
                <TableRow key={appointment.id}>
                  {/* Paciente */}
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <User className='h-4 w-4 text-gray-400' />
                      <div>
                        <div className='font-medium'>
                          {appointment.patient?.firstName}{' '}
                          {appointment.patient?.lastName}
                        </div>
                        {appointment.patient?.email && (
                          <div className='text-sm text-gray-500'>
                            {appointment.patient.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Doctor */}
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Stethoscope className='h-4 w-4 text-gray-400' />
                      <div>
                        <div className='font-medium'>
                          Dr. {appointment.doctor?.firstName}{' '}
                          {appointment.doctor?.lastName}
                        </div>
                        {appointment.doctor?.specialties &&
                          appointment.doctor.specialties.length > 0 && (
                            <div className='text-sm text-gray-500'>
                              {appointment.doctor.specialties[0].name}
                            </div>
                          )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Fecha y Hora */}
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4 text-gray-400' />
                      <div>
                        <div className='font-medium'>
                          {format(new Date(appointment.date), 'dd/MM/yyyy', {
                            locale: es,
                          })}
                        </div>
                        <div className='text-sm text-gray-500 flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          {format(new Date(appointment.date), 'HH:mm', {
                            locale: es,
                          })}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Tipo */}
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      {getTypeIcon(appointment.type)}
                      <span className='text-sm font-medium'>
                        {getTypeText(appointment.type)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    <Badge
                      variant='outline'
                      className={getStatusColor(appointment.status)}
                    >
                      {getStatusText(appointment.status)}
                    </Badge>
                  </TableCell>

                  {/* Duración */}
                  <TableCell>
                    <span className='text-sm text-gray-600'>
                      {appointment.duration} min
                    </span>
                  </TableCell>

                  {/* Notas */}
                  <TableCell>
                    {appointment.notes ? (
                      <div
                        className='text-sm text-gray-600 max-w-[200px] truncate'
                        title={appointment.notes}
                      >
                        {appointment.notes}
                      </div>
                    ) : (
                      <span className='text-sm text-gray-400'>Sin notas</span>
                    )}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <span className='sr-only'>Abrir menú</span>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => handleActionClick('edit', appointment)}
                        >
                          <Edit className='mr-2 h-4 w-4' />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleActionClick('reschedule', appointment)
                          }
                        >
                          <Calendar className='mr-2 h-4 w-4' />
                          Reprogramar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleActionClick('delete', appointment)
                          }
                          className='text-red-600'
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
