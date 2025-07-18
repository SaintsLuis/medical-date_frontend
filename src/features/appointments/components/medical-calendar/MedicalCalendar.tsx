'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  View,
} from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
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
  Clock,
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

import { Appointment } from '../../types'

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

  const [currentDate, setCurrentDate] = useState(new Date())
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
    const baseParams = {
      page: 1,
      limit: 1000,
      status: filters.appointmentStatuses?.length
        ? filters.appointmentStatuses[0]
        : undefined,
      type: filters.appointmentTypes?.length
        ? filters.appointmentTypes[0]
        : undefined,
    }
    if (!user) return baseParams
    if (user.roles.includes(UserRole.DOCTOR)) {
      return { ...baseParams, doctorId: user.id }
    }
    if (user.roles.includes(UserRole.PATIENT)) {
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
      if (selectedAppointment) {
        // Actualizar cita existente
        await onAppointmentUpdate?.(selectedAppointment.id, appointmentData)
      } else {
        // Crear nueva cita
        const newConflicts = checkAppointmentConflicts(
          appointmentData as Partial<Appointment>,
          appointments,
          doctors
        )

        if (newConflicts.length > 0) {
          // Para simplificar, solo loggeamos los conflictos por ahora
          console.warn('Conflictos detectados:', newConflicts)
        }

        await onAppointmentCreate?.(appointmentData)
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
          borderRadius: '6px',
          fontSize: '12px',
          padding: '2px 6px',
          opacity: appointment.status === 'CANCELLED' ? 0.6 : 1,
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

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className='flex items-center gap-2 h-full'>
              {appointment.type === 'VIRTUAL' ? (
                <Video className='h-3 w-3 flex-shrink-0' />
              ) : (
                <MapPin className='h-3 w-3 flex-shrink-0' />
              )}
              <div className='min-w-0 flex-1'>
                <div className='text-xs font-medium truncate'>
                  {formatCalendarTime(new Date(appointment.date))}
                </div>
                <div className='text-xs truncate opacity-90'>
                  {doctor
                    ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                    : 'Doctor'}
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className='max-w-xs space-y-2'>
              <div className='font-medium'>
                {appointment.type === 'VIRTUAL'
                  ? 'Cita Virtual'
                  : 'Cita Presencial'}
              </div>

              {/* Información del paciente */}
              {appointment.patient && (
                <div className='flex items-center gap-2 text-sm'>
                  <User className='h-3 w-3 text-blue-600' />
                  <span className='font-medium'>
                    {appointment.patient.firstName}{' '}
                    {appointment.patient.lastName}
                  </span>
                </div>
              )}

              {/* Información del doctor */}
              {doctor && (
                <div className='flex items-center gap-2 text-sm'>
                  <Stethoscope className='h-3 w-3 text-green-600' />
                  <span>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </span>
                </div>
              )}

              {/* Fecha y hora */}
              <div className='flex items-center gap-2 text-sm'>
                <CalendarIcon className='h-3 w-3 text-gray-600' />
                <span>
                  {format(new Date(appointment.date), 'dd/MM/yyyy HH:mm', {
                    locale: es,
                  })}
                </span>
              </div>

              {/* Duración */}
              <div className='flex items-center gap-2 text-sm'>
                <Clock className='h-3 w-3 text-gray-600' />
                <span>{formatAppointmentDuration(appointment.duration)}</span>
              </div>

              {/* Estado */}
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-xs'>
                  {appointment.status === 'SCHEDULED' && 'Programada'}
                  {appointment.status === 'CONFIRMED' && 'Confirmada'}
                  {appointment.status === 'COMPLETED' && 'Completada'}
                  {appointment.status === 'CANCELLED' && 'Cancelada'}
                  {appointment.status === 'NO_SHOW' && 'No Asistió'}
                </Badge>
              </div>

              {/* Notas */}
              {appointment.notes && (
                <div className='text-xs text-gray-600 border-t pt-2'>
                  <span className='font-medium'>Notas:</span>{' '}
                  {appointment.notes}
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
          appointment={
            selectedAppointment?.appointment || selectedAppointment || undefined
          }
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
