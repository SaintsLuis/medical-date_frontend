'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  View,
} from 'react-big-calendar'
import {
  format,
  parse,
  startOfWeek,
  getDay,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core'

// UI Components
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Icons
import {
  Video,
  MapPin,
  RefreshCw,
  User,
  Stethoscope,
  Calendar as CalendarIcon,
} from 'lucide-react'

// Types
import type {
  CalendarEvent,
  CalendarView,
  MedicalCalendarProps,
  TimeSlot,
  CalendarSettings,
  CalendarFilters,
  CalendarTheme,
  Doctor,
} from './types'

import { Appointment, AppointmentStatus, AppointmentType } from '../../types'

// Utils
import {
  appointmentToCalendarEvent,
  getAppointmentStatusColor,
  getAppointmentTypeColor,
  formatCalendarTime,
  formatAppointmentDuration,
  checkAppointmentConflicts,
  filterAppointments,
  DEFAULT_CALENDAR_SETTINGS,
  DEFAULT_CALENDAR_FILTERS,
  MEDICAL_CALENDAR_THEME,
} from './utils'

// Hooks
import { useAppointments } from '../../hooks/use-appointments'
import { useDoctors } from '../../../doctors/hooks/use-doctors'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'

// Componentes internos
import { CalendarToolbar } from './CalendarToolbar'
import { AppointmentModal } from './AppointmentModal'
import { DoctorSchedulePanel } from './DoctorSchedulePanel'

// CSS de react-big-calendar
import 'react-big-calendar/lib/css/react-big-calendar.css'

// ==============================================
// Configuración de Localización
// ==============================================

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales: { es },
})

// Mensajes en español para react-big-calendar
const messages = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Cita',
  noEventsInRange: 'No hay citas en este rango de fechas',
  showMore: (total: number) => `+ Ver ${total} más`,
}

// ==============================================
// Componente Principal
// ==============================================

export function MedicalCalendar({
  // Props de datos
  appointments: propAppointments = [],
  doctors: propDoctors = [],
  patients = [],

  // Props de configuración
  settings: propSettings,
  filters: propFilters,
  theme = MEDICAL_CALENDAR_THEME,

  // Props de callbacks
  onAppointmentSelect,
  onAppointmentCreate,
  onAppointmentUpdate,
  onAppointmentDragEnd,
  onTimeSlotSelect,
  onViewChange,
  onDateChange,
  onFiltersChange,

  // Props de estado
  isLoading: propIsLoading = false,
  isReadOnly = false,

  // Props de características avanzadas
  enableRecurringAppointments = true,
  enableExport = true,
  enablePrint = true,
}: MedicalCalendarProps) {
  // ==============================================
  // Estados Locales
  // ==============================================

  const [settings, setSettings] = useState<CalendarSettings>(() => ({
    ...DEFAULT_CALENDAR_SETTINGS,
    ...propSettings,
  }))
  const [filters, setFilters] = useState<CalendarFilters>(() => ({
    ...DEFAULT_CALENDAR_FILTERS,
    ...propFilters,
  }))

  const [currentDate, setCurrentDate] = useState(startOfDay(new Date()))
  const [selectedAppointment, setSelectedAppointment] =
    useState<CalendarEvent | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  )
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [showDoctorPanel, setShowDoctorPanel] = useState(false)
  const [selectedDoctorId] = useState<string | null>(null)

  // ==============================================
  // Hooks de Datos
  // ==============================================

  // Obtener usuario autenticado
  const { user } = useAuthStore()

  // Determinar filtros según el rol
  const getFilterParams = () => {
    // Calcular rango de fechas basado en la vista actual
    const currentView = settings.view
    let startDate: string
    let endDate: string

    if (currentView === 'day') {
      startDate = format(startOfDay(currentDate), 'yyyy-MM-dd')
      endDate = format(endOfDay(currentDate), 'yyyy-MM-dd')
    } else if (currentView === 'week') {
      startDate = format(startOfWeek(currentDate, { locale: es }), 'yyyy-MM-dd')
      endDate = format(endOfWeek(currentDate, { locale: es }), 'yyyy-MM-dd')
    } else if (currentView === 'month') {
      // Para la vista de mes, necesitamos incluir las semanas completas
      // que se muestran en el calendario (días del mes anterior y siguiente)
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)

      // Obtener el primer día de la primera semana mostrada en el mes
      const calendarStart = startOfWeek(monthStart, { locale: es })
      // Obtener el último día de la última semana mostrada en el mes
      const calendarEnd = endOfWeek(monthEnd, { locale: es })

      startDate = format(calendarStart, 'yyyy-MM-dd')
      endDate = format(calendarEnd, 'yyyy-MM-dd')

      console.log('🗓️ Month view date range:', {
        currentDate: currentDate.toISOString(),
        monthStart: monthStart.toISOString(),
        monthEnd: monthEnd.toISOString(),
        calendarStart: calendarStart.toISOString(),
        calendarEnd: calendarEnd.toISOString(),
        startDate,
        endDate,
      })
    } else {
      // agenda - mostrar próximo mes
      startDate = format(startOfDay(currentDate), 'yyyy-MM-dd')
      endDate = format(addDays(startOfDay(currentDate), 30), 'yyyy-MM-dd')
    }

    const baseParams = {
      page: 1,
      limit: 100, // Respeta el límite máximo del backend
      startDate,
      endDate,
      includePatient: true,
      includeDoctor: true,
      sortByDate: 'asc' as const,
      // Para múltiples filtros, tomamos solo el primero por ahora
      // TODO: El backend podría soportar múltiples valores en el futuro
      ...(filters.appointmentStatuses?.length && {
        status: filters.appointmentStatuses[0] as AppointmentStatus,
      }),
      ...(filters.appointmentTypes?.length && {
        type: filters.appointmentTypes[0] as AppointmentType,
      }),
    }

    if (!user) return baseParams

    // Solo aplicar filtro de rol si no es admin
    if (
      user.roles.includes(UserRole.DOCTOR) &&
      !user.roles.includes(UserRole.ADMIN)
    ) {
      return { ...baseParams, doctorId: user.id }
    }
    if (
      user.roles.includes(UserRole.PATIENT) &&
      !user.roles.includes(UserRole.ADMIN)
    ) {
      return { ...baseParams, patientId: user.id }
    }

    return baseParams
  }

  const { data: appointmentsData, isLoading: appointmentsLoading } =
    useAppointments(getFilterParams())

  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors({
    page: 1,
    limit: 100,
  })

  const isLoading = propIsLoading || appointmentsLoading || doctorsLoading

  // ==============================================
  // Datos Computados
  // ==============================================

  const appointments = useMemo(() => {
    const baseAppointments = Array.isArray(propAppointments)
      ? propAppointments
      : appointmentsData?.data && Array.isArray(appointmentsData.data)
      ? appointmentsData.data
      : []

    return filterAppointments(baseAppointments, filters)
  }, [propAppointments, appointmentsData, filters])

  const doctors = useMemo(() => {
    return Array.isArray(propDoctors)
      ? propDoctors
      : doctorsData?.data && Array.isArray(doctorsData.data)
      ? (doctorsData.data as Doctor[])
      : []
  }, [propDoctors, doctorsData])

  const calendarEvents = useMemo(
    () =>
      appointments.map((appointment) => {
        const doctor = doctors.find((d) => d.id === appointment.doctorId)
        return appointmentToCalendarEvent(appointment, doctor)
      }),
    [appointments, doctors]
  )

  // ==============================================
  // Sensores de Drag & Drop
  // ==============================================

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // ==============================================
  // Handlers de Eventos
  // ==============================================

  const handleViewChange = useCallback(
    (view: View) => {
      const calendarView = view as CalendarView
      setSettings((prev) => ({ ...prev, view: calendarView }))
      onViewChange?.(calendarView)
    },
    [onViewChange]
  )

  const handleDateChange = useCallback(
    (date: Date) => {
      setCurrentDate(date)
      onDateChange?.(date)
    },
    [onDateChange]
  )

  const handleEventSelect = useCallback(
    (event: CalendarEvent) => {
      setSelectedAppointment(event)
      setShowAppointmentModal(true)
      onAppointmentSelect?.(event.appointment)
    },
    [onAppointmentSelect]
  )

  const handleSlotSelect = useCallback(
    (slotInfo: { start: Date; end: Date; slots: Date[] }) => {
      if (isReadOnly) return

      const timeSlot: TimeSlot = {
        start: slotInfo.start,
        end: slotInfo.end,
        isAvailable: true,
        doctorId: selectedDoctorId || undefined,
      }

      setSelectedTimeSlot(timeSlot)
      setSelectedAppointment(null)
      setShowAppointmentModal(true)
      onTimeSlotSelect?.(
        slotInfo.start,
        slotInfo.end,
        selectedDoctorId || undefined
      )
    },
    [isReadOnly, selectedDoctorId, onTimeSlotSelect]
  )

  const handleFiltersChange = useCallback(
    (newFilters: Partial<CalendarFilters>) => {
      const updatedFilters = { ...filters, ...newFilters }
      setFilters(updatedFilters)
      onFiltersChange?.(updatedFilters)
    },
    [filters, onFiltersChange]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (isReadOnly) return

      const { active, over } = event

      if (!over) return

      // Aquí implementarías la lógica de drag & drop
      onAppointmentDragEnd?.(
        active.id as string,
        new Date(),
        new Date(),
        selectedDoctorId || undefined
      )
    },
    [isReadOnly, onAppointmentDragEnd, selectedDoctorId]
  )

  const handleAppointmentSave = useCallback(
    async (appointmentData: Record<string, unknown>) => {
      console.log(
        '🔄 MedicalCalendar: handleAppointmentSave called with:',
        appointmentData
      )
      console.log(
        '🔄 MedicalCalendar: selectedAppointment:',
        selectedAppointment
      )
      console.log(
        '🔄 MedicalCalendar: onAppointmentUpdate:',
        typeof onAppointmentUpdate,
        onAppointmentUpdate
      )
      console.log(
        '🔄 MedicalCalendar: onAppointmentCreate:',
        typeof onAppointmentCreate,
        onAppointmentCreate
      )

      if (selectedAppointment) {
        // Actualizar cita existente
        console.log(
          '📝 MedicalCalendar: Updating existing appointment with ID:',
          selectedAppointment.id
        )
        try {
          await onAppointmentUpdate?.(selectedAppointment.id, appointmentData)
          console.log('✅ MedicalCalendar: Appointment updated successfully')
        } catch (error) {
          console.error(
            '❌ MedicalCalendar: Error updating appointment:',
            error
          )
          throw error
        }
      } else {
        // Crear nueva cita
        console.log('📝 MedicalCalendar: Creating new appointment')
        const newConflicts = checkAppointmentConflicts(
          appointmentData as Partial<Appointment>,
          appointments
        )

        if (newConflicts.length > 0) {
          // Para simplificar, solo loggeamos los conflictos por ahora
          console.warn('⚠️  MedicalCalendar: Conflicts detected:', newConflicts)
        }

        try {
          await onAppointmentCreate?.(appointmentData)
          console.log('✅ MedicalCalendar: Appointment created successfully')
        } catch (error) {
          console.error(
            '❌ MedicalCalendar: Error creating appointment:',
            error
          )
          throw error
        }
      }

      setShowAppointmentModal(false)
      setSelectedAppointment(null)
      setSelectedTimeSlot(null)
    },
    [
      selectedAppointment,
      onAppointmentUpdate,
      onAppointmentCreate,
      appointments,
      doctors,
    ]
  )

  // ==============================================
  // Funciones de Estilo
  // ==============================================

  const eventStyleGetter = useCallback(
    (event: CalendarEvent) => {
      const appointment = event.appointment

      const backgroundColor = getAppointmentStatusColor(
        appointment.status,
        theme as CalendarTheme
      )
      const borderColor = getAppointmentTypeColor(
        appointment.type,
        theme as CalendarTheme
      )

      return {
        style: {
          backgroundColor,
          borderLeft: `4px solid ${borderColor}`,
          color: theme.text?.primary || '#000',
          border: 'none',
          borderRadius: '8px',
          fontSize: '11px',
          padding: '4px 8px',
          opacity: appointment.status === 'CANCELLED' ? 0.6 : 1,
          minHeight: '60px', // Altura mínima para mostrar más información
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        },
      }
    },
    [theme]
  )

  // ==============================================
  // Componentes de Renderizado Personalizado
  // ==============================================

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const appointment = event.appointment
    const doctor = doctors.find((d) => d.id === appointment.doctorId)

    // Obtener información del doctor desde múltiples fuentes
    const getDoctorInfo = () => {
      // 1. Intentar desde la lista de doctors
      if (doctor) {
        return {
          firstName: doctor.firstName,
          lastName: doctor.lastName,
        }
      }

      // 2. Intentar desde la relación appointment.doctor
      if (appointment.doctor) {
        return {
          firstName: appointment.doctor.firstName,
          lastName: appointment.doctor.lastName,
        }
      }

      // 3. Si el usuario logueado es doctor y coincide el ID
      if (
        user?.roles.includes(UserRole.DOCTOR) &&
        user.id === appointment.doctorId
      ) {
        return {
          firstName: user.firstName,
          lastName: user.lastName,
        }
      }

      return null
    }

    const doctorInfo = getDoctorInfo()

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className='flex flex-col gap-1 h-full p-1'>
              {/* Primera línea: Hora */}
              <div className='flex items-center gap-1'>
                {appointment.type === 'VIRTUAL' ? (
                  <Video className='h-3 w-3 flex-shrink-0 text-purple-600' />
                ) : (
                  <MapPin className='h-3 w-3 flex-shrink-0 text-blue-600' />
                )}
                <span className='text-xs font-semibold'>
                  {formatCalendarTime(new Date(appointment.date), false)}
                </span>
              </div>

              {/* Segunda línea: Paciente (más prominente) */}
              {appointment.patient ? (
                <div className='text-sm font-medium text-gray-800 truncate'>
                  {appointment.patient.firstName} {appointment.patient.lastName}
                </div>
              ) : (
                <div className='text-sm font-medium text-gray-500 truncate'>
                  Paciente no asignado
                </div>
              )}

              {/* Tercera línea: Doctor (más pequeño) */}
              <div className='text-xs truncate text-gray-600'>
                {doctorInfo
                  ? `${doctorInfo.firstName} ${doctorInfo.lastName}`
                  : 'Doctor no asignado'}
              </div>

              {/* Cuarta línea: Estado */}
              <div className='flex items-center gap-1'>
                <div
                  className={`w-2 h-2 rounded-full ${
                    appointment.status === 'SCHEDULED'
                      ? 'bg-blue-400'
                      : appointment.status === 'CONFIRMED'
                      ? 'bg-green-400'
                      : appointment.status === 'COMPLETED'
                      ? 'bg-green-600'
                      : appointment.status === 'CANCELLED'
                      ? 'bg-red-400'
                      : 'bg-gray-400'
                  }`}
                />
                <span className='text-xs text-gray-600'>
                  {appointment.status === 'SCHEDULED' && 'Programada'}
                  {appointment.status === 'CONFIRMED' && 'Confirmada'}
                  {appointment.status === 'COMPLETED' && 'Completada'}
                  {appointment.status === 'CANCELLED' && 'Cancelada'}
                  {appointment.status === 'NO_SHOW' && 'No Asistió'}
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className='max-w-sm space-y-3 p-2'>
              {/* Encabezado con tipo de cita */}
              <div className='flex items-center gap-2 pb-2 border-b'>
                {appointment.type === 'VIRTUAL' ? (
                  <Video className='h-4 w-4 text-purple-600' />
                ) : (
                  <MapPin className='h-4 w-4 text-blue-600' />
                )}
                <span className='font-semibold text-sm'>
                  {appointment.type === 'VIRTUAL'
                    ? 'Cita Virtual'
                    : 'Cita Presencial'}
                </span>
                <Badge
                  variant='outline'
                  className={`text-xs ml-auto ${
                    appointment.status === 'SCHEDULED'
                      ? 'border-blue-400 text-blue-600'
                      : appointment.status === 'CONFIRMED'
                      ? 'border-green-400 text-green-600'
                      : appointment.status === 'COMPLETED'
                      ? 'border-green-600 text-green-700'
                      : appointment.status === 'CANCELLED'
                      ? 'border-red-400 text-red-600'
                      : 'border-gray-400 text-gray-600'
                  }`}
                >
                  {appointment.status === 'SCHEDULED' && 'Programada'}
                  {appointment.status === 'CONFIRMED' && 'Confirmada'}
                  {appointment.status === 'COMPLETED' && 'Completada'}
                  {appointment.status === 'CANCELLED' && 'Cancelada'}
                  {appointment.status === 'NO_SHOW' && 'No Asistió'}
                </Badge>
              </div>

              {/* Información principal */}
              <div className='space-y-2'>
                {/* Fecha y hora */}
                <div className='flex items-center gap-2 text-sm'>
                  <CalendarIcon className='h-4 w-4 text-gray-600' />
                  <div>
                    <div className='font-medium'>
                      {format(
                        new Date(appointment.date),
                        "EEEE, dd 'de' MMMM 'de' yyyy",
                        {
                          locale: es,
                        }
                      )}
                    </div>
                    <div className='text-gray-600'>
                      {format(new Date(appointment.date), 'h:mm a', {
                        locale: es,
                      })}
                      {' - '}
                      {format(
                        new Date(
                          new Date(appointment.date).getTime() +
                            appointment.duration * 60 * 1000
                        ),
                        'h:mm a',
                        { locale: es }
                      )}{' '}
                      ({formatAppointmentDuration(appointment.duration)})
                    </div>
                  </div>
                </div>

                {/* Información del paciente */}
                {appointment.patient && (
                  <div className='flex items-center gap-2 text-sm'>
                    <User className='h-4 w-4 text-blue-600' />
                    <div>
                      <div className='font-medium'>Paciente</div>
                      <div className='text-gray-600'>
                        {appointment.patient.firstName}{' '}
                        {appointment.patient.lastName}
                      </div>
                    </div>
                  </div>
                )}

                {/* Información del doctor */}
                {doctorInfo && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Stethoscope className='h-4 w-4 text-green-600' />
                    <div>
                      <div className='font-medium'>Doctor</div>
                      <div className='text-gray-600'>
                        {doctorInfo.firstName} {doctorInfo.lastName}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Precio */}
              {appointment.price && (
                <div className='flex items-center gap-2 text-sm pt-2 border-t'>
                  <span className='font-medium'>Precio:</span>
                  <span className='text-green-600 font-semibold'>
                    ${Number(appointment.price).toFixed(2)}
                  </span>
                </div>
              )}

              {/* Notas */}
              {appointment.notes && (
                <div className='text-sm text-gray-600 border-t pt-2'>
                  <div className='font-medium mb-1'>Notas:</div>
                  <div className='text-xs bg-gray-50 p-2 rounded'>
                    {appointment.notes}
                  </div>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // ==============================================
  // Render Principal
  // ==============================================

  if (isLoading) {
    return (
      <Card className='h-[600px]'>
        <CardContent className='flex items-center justify-center h-full'>
          <div className='flex items-center space-x-2'>
            <RefreshCw className='h-4 w-4 animate-spin' />
            <span>Cargando calendario médico...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className='space-y-4'>
        {/* Toolbar del calendario */}
        <CalendarToolbar
          view={settings.view}
          date={currentDate}
          onViewChange={(view) => handleViewChange(view as View)}
          onNavigate={(action) => {
            if (action === 'today') {
              handleDateChange(new Date())
            } else if (action === 'prev') {
              const newDate = new Date(currentDate)
              newDate.setMonth(newDate.getMonth() - 1)
              handleDateChange(newDate)
            } else if (action === 'next') {
              const newDate = new Date(currentDate)
              newDate.setMonth(newDate.getMonth() + 1)
              handleDateChange(newDate)
            }
          }}
          onDateChange={handleDateChange}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          enableExport={enableExport}
          enablePrint={enablePrint}
        />

        <div className='flex gap-4'>
          {/* Panel lateral del doctor (opcional) */}
          <AnimatePresence>
            {showDoctorPanel && selectedDoctorId && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className='flex-shrink-0'
              >
                <DoctorSchedulePanel
                  doctorId={selectedDoctorId}
                  date={currentDate}
                  onClose={() => setShowDoctorPanel(false)}
                  onAppointmentSelect={(appointment) =>
                    handleEventSelect({
                      id: appointment.id,
                      title: '',
                      start: new Date(),
                      end: new Date(),
                      appointment: appointment as Appointment,
                    })
                  }
                  onTimeSlotSelect={handleSlotSelect}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Calendario principal */}
          <Card className='flex-1'>
            <CardContent className='p-0'>
              <div className='h-[600px]'>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={settings.view}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className='h-full'
                  >
                    <BigCalendar
                      localizer={localizer}
                      events={calendarEvents}
                      startAccessor='start'
                      endAccessor='end'
                      titleAccessor='title'
                      resourceAccessor='resource'
                      // Configuración de vista
                      view={settings.view as View}
                      onView={handleViewChange}
                      date={currentDate}
                      onNavigate={setCurrentDate}
                      // Eventos
                      onSelectEvent={handleEventSelect}
                      onSelectSlot={handleSlotSelect}
                      selectable={!isReadOnly}
                      // Personalización
                      eventPropGetter={eventStyleGetter}
                      components={{
                        event: EventComponent,
                      }}
                      // Configuración de tiempo
                      step={15}
                      timeslots={4}
                      min={new Date(2024, 0, 1, 7, 0)} // 7:00 AM
                      max={new Date(2024, 0, 1, 22, 0)} // 10:00 PM
                      // Localización
                      messages={messages}
                      culture='es'
                      // Configuración de agenda
                      length={30}
                      showMultiDayTimes
                      popup
                      popupOffset={30}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal de cita */}
        <AppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          appointment={selectedAppointment?.appointment}
          timeSlot={selectedTimeSlot}
          doctors={doctors}
          patients={patients}
          onSave={handleAppointmentSave}
          enableRecurring={enableRecurringAppointments}
        />

        {/* Separador visual */}
        <Separator className='my-4' />
      </div>
    </DndContext>
  )
}
