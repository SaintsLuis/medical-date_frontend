import {
  format,
  parse,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays,
  isSameDay,
  isAfter,
  isBefore,
  differenceInMinutes,
  eachDayOfInterval,
  getDay,
  setHours,
  setMinutes,
} from 'date-fns'
import { es } from 'date-fns/locale'
import type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  CalendarEvent,
  CalendarView,
  CalendarFilters,
  CalendarSettings,
  Doctor,
  Patient,
  TimeSlot,
  DoctorAvailabilitySlot,
  AppointmentConflict,
  CalendarTheme,
} from './types'

// ==============================================
// Constantes del Calendario Médico
// ==============================================

export const DEFAULT_CALENDAR_SETTINGS: CalendarSettings = {
  view: 'week',
  startHour: 8,
  endHour: 18,
  slotDuration: 30,
  weekStartsOn: 1, // Lunes
  timezone: 'America/Santo_Domingo',
  showWeekends: false,
  showBusinessHours: true,
  enableDragAndDrop: true,
  enableResizing: true,
  autoSaveChanges: false,
  notificationSettings: {
    showReminders: true,
    reminderMinutes: [15, 30, 60],
    emailNotifications: true,
    pushNotifications: false,
  },
}

export const DEFAULT_CALENDAR_FILTERS: CalendarFilters = {
  doctors: [],
  appointmentTypes: [],
  appointmentStatuses: [],
  specialties: [],
  clinics: [],
  dateRange: {
    start: new Date(),
    end: addDays(new Date(), 30),
  },
  showVirtualOnly: false,
  showInPersonOnly: false,
  showAvailableSlots: false,
  hideCompletedAppointments: false,
}

export const MEDICAL_CALENDAR_THEME: CalendarTheme = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  background: '#ffffff',
  surface: '#f8fafc',
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    disabled: '#cbd5e1',
  },
  appointment: {
    scheduled: '#e0e7ff', // Azul claro
    confirmed: '#bbf7d0', // Verde claro
    inProgress: '#fef3c7', // Amarillo claro
    completed: '#d1fae5', // Verde muy claro
    cancelled: '#fee2e2', // Rojo claro
    noShow: '#f3f4f6', // Gris claro
  },
  appointmentType: {
    virtual: '#ddd6fe', // Morado claro
    inPerson: '#fecaca', // Rosa claro
    emergency: '#fee2e2', // Rojo claro
    followUp: '#e0f2fe', // Azul cyan claro
    routine: '#f0fdf4', // Verde muy claro
  },
}

export const APPOINTMENT_DURATION_OPTIONS = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1 hora 30 minutos' },
  { value: 120, label: '2 horas' },
]

export const WORKING_HOURS = {
  start: 8,
  end: 18,
  lunchBreak: {
    start: 12,
    end: 13,
  },
}

// ==============================================
// Utilidades de Conversión de Datos
// ==============================================

export function appointmentToCalendarEvent(
  appointment: Appointment,
  doctor?: Doctor
): CalendarEvent {
  // 🔧 FIX: Construir fechas usando UTC para evitar conversión automática del navegador
  const originalDate = new Date(appointment.date)

  // Extraer componentes UTC de la fecha original
  const year = originalDate.getUTCFullYear()
  const month = originalDate.getUTCMonth()
  const day = originalDate.getUTCDate()
  const hours = originalDate.getUTCHours()
  const minutes = originalDate.getUTCMinutes()

  // Construir fechas que React Big Calendar interprete como hora local
  const start = new Date(year, month, day, hours, minutes)
  const end = new Date(start.getTime() + appointment.duration * 60 * 1000)

  return {
    id: appointment.id,
    title: appointment.patient
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
      : 'Cita sin paciente',
    start,
    end,
    appointment,
    resource: {
      id: doctor?.id || appointment.doctorId,
      title: doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Doctor',
      type: 'doctor',
      color: '#3B82F6',
      isAvailable: true,
    },
  }
}

export function calendarEventToAppointment(
  event: CalendarEvent,
  updates: Partial<Appointment> = {}
): Partial<Appointment> {
  return {
    ...event.appointment,
    date: event.start.toISOString(),
    duration: differenceInMinutes(event.end, event.start),
    ...updates,
  }
}

// ==============================================
// Utilidades de Formateo
// ==============================================

export function formatCalendarDate(
  date: Date,
  formatStr: string = 'PP'
): string {
  return format(date, formatStr, { locale: es })
}

export function formatCalendarTime(
  date: Date,
  use24Hour: boolean = false
): string {
  // 🔧 CORREGIDO: Usar UTC directo para consistencia con mobile
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()

  if (use24Hour) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`
  } else {
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 === 0 ? 12 : hours % 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }
}

export function formatAppointmentDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes}min`
  } else if (remainingMinutes === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${remainingMinutes}min`
  }
}

export function formatDoctorName(
  doctor: Doctor,
  includeTitle: boolean = true
): string {
  const prefix = includeTitle ? 'Dr. ' : ''
  return `${prefix}${doctor.firstName} ${doctor.lastName}`
}

export function formatPatientName(patient: Patient): string {
  return `${patient.firstName} ${patient.lastName}`
}

// ==============================================
// Utilidades de Color y Estilo
// ==============================================

export function getAppointmentStatusColor(
  status: AppointmentStatus,
  theme: CalendarTheme = MEDICAL_CALENDAR_THEME
): string {
  return (
    theme.appointment[status.toLowerCase() as keyof typeof theme.appointment] ||
    theme.appointment.scheduled
  )
}

export function getAppointmentTypeColor(
  type: AppointmentType,
  theme: CalendarTheme = MEDICAL_CALENDAR_THEME
): string {
  const typeKey = type
    .toLowerCase()
    .replace('_', '') as keyof typeof theme.appointmentType
  return theme.appointmentType[typeKey] || theme.appointmentType.routine
}

export function getDoctorColor(doctorId: string): string {
  // Generar color consistente basado en el ID del doctor
  const colors = [
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#06b6d4',
    '#6366f1',
  ]

  const hash = doctorId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)

  return colors[Math.abs(hash) % colors.length]
}

export function getConflictSeverityColor(
  severity: 'info' | 'warning' | 'error'
): string {
  const colors = {
    info: '#3b82f6',
    warning: '#f59e0b',
    error: '#ef4444',
  }
  return colors[severity]
}

// ==============================================
// Utilidades de Tiempo y Horarios
// ==============================================

export function generateTimeSlots(
  startHour: number = 8,
  endHour: number = 18,
  slotDuration: number = 30,
  date: Date = new Date()
): TimeSlot[] {
  const slots: TimeSlot[] = []
  const startTime = setHours(setMinutes(startOfDay(date), 0), startHour)
  const endTime = setHours(setMinutes(startOfDay(date), 0), endHour)

  let currentSlot = startTime

  while (isBefore(currentSlot, endTime)) {
    // Corregir: slotDuration está en minutos, no en días
    const nextSlot = new Date(currentSlot.getTime() + slotDuration * 60 * 1000)

    slots.push({
      start: new Date(currentSlot),
      end: new Date(nextSlot),
      isAvailable: true,
      conflictLevel: 'none',
    })

    currentSlot = nextSlot
  }

  return slots
}

export function getBusinessHours(date: Date): { start: Date; end: Date } {
  return {
    start: setHours(setMinutes(startOfDay(date), 0), WORKING_HOURS.start),
    end: setHours(setMinutes(startOfDay(date), 0), WORKING_HOURS.end),
  }
}

export function isBusinessHour(date: Date): boolean {
  const hour = date.getHours()
  return hour >= WORKING_HOURS.start && hour < WORKING_HOURS.end
}

export function roundToNearestSlot(
  date: Date,
  slotDuration: number = 30
): Date {
  const minutes = date.getMinutes()
  const roundedMinutes = Math.round(minutes / slotDuration) * slotDuration
  return setMinutes(date, roundedMinutes)
}

// ==============================================
// Utilidades de Disponibilidad y Conflictos
// ==============================================

export function checkAppointmentConflicts(
  newAppointment: Partial<Appointment>,
  existingAppointments: Appointment[]
): AppointmentConflict[] {
  const conflicts: AppointmentConflict[] = []

  if (
    !newAppointment.date ||
    !newAppointment.duration ||
    !newAppointment.doctorId
  ) {
    return conflicts
  }

  const newStart = new Date(newAppointment.date)
  // Corregir: duration está en minutos, no en días
  const newEnd = new Date(
    newStart.getTime() + newAppointment.duration * 60 * 1000
  )

  // Verificar conflictos de tiempo con el mismo doctor
  existingAppointments.forEach((existing) => {
    if (existing.doctorId !== newAppointment.doctorId) return
    if (existing.status === 'CANCELLED') return
    if (existing.id === newAppointment.id) return // Si es una actualización

    const existingStart = new Date(existing.date)
    // Corregir: duration está en minutos, no en días
    const existingEnd = new Date(
      existingStart.getTime() + existing.duration * 60 * 1000
    )

    // Verificar solapamiento
    if (
      (isBefore(newStart, existingEnd) && isAfter(newEnd, existingStart)) ||
      isSameDay(newStart, existingStart)
    ) {
      conflicts.push({
        id: `conflict-${existing.id}`,
        type: 'time_overlap',
        severity: 'error',
        message: `Conflicto de horario con cita existente de ${formatCalendarTime(
          existingStart
        )} a ${formatCalendarTime(existingEnd)}`,
        conflictingAppointments: [existing.id],
        suggestedActions: [
          {
            id: 'reschedule',
            label: 'Reprogramar cita',
            action: 'reschedule',
          },
          {
            id: 'change-doctor',
            label: 'Cambiar doctor',
            action: 'reassign_doctor',
          },
        ],
      })
    }
  })

  return conflicts
}

export function findAvailableSlots(
  doctorId: string,
  date: Date,
  duration: number,
  appointments: Appointment[],
  availability?: DoctorAvailabilitySlot[]
): TimeSlot[] {
  const dayOfWeek = getDay(date)
  const doctorAvailability = availability?.find(
    (slot) => slot.dayOfWeek === dayOfWeek && slot.isAvailable
  )

  if (!doctorAvailability) {
    return []
  }

  // Generar slots para el día
  const startTime = parse(doctorAvailability.startTime, 'HH:mm', date)
  const endTime = parse(doctorAvailability.endTime, 'HH:mm', date)

  const allSlots = generateTimeSlots(
    startTime.getHours(),
    endTime.getHours(),
    30, // slot duration
    date
  )

  // Filtrar slots ocupados
  const doctorAppointments = appointments.filter(
    (apt) =>
      apt.doctorId === doctorId &&
      isSameDay(new Date(apt.date), date) &&
      apt.status !== 'CANCELLED'
  )

  return allSlots.filter((slot) => {
    // Verificar que el slot tenga suficiente duración
    if (differenceInMinutes(slot.end, slot.start) < duration) {
      return false
    }

    // Verificar que no haya conflictos
    return !doctorAppointments.some((apt) => {
      const aptStart = new Date(apt.date)
      // Corregir: duration está en minutos, no en días
      const aptEnd = new Date(aptStart.getTime() + apt.duration * 60 * 1000)

      return isBefore(slot.start, aptEnd) && isAfter(slot.end, aptStart)
    })
  })
}

// ==============================================
// Utilidades de Filtrado y Búsqueda
// ==============================================

export function filterAppointments(
  appointments: Appointment[],
  filters: CalendarFilters
): Appointment[] {
  return appointments.filter((appointment) => {
    // Filtrar por doctores
    if (
      filters.doctors.length > 0 &&
      !filters.doctors.includes(appointment.doctorId)
    ) {
      return false
    }

    // Filtrar por tipos de cita
    if (
      filters.appointmentTypes.length > 0 &&
      !filters.appointmentTypes.includes(appointment.type)
    ) {
      return false
    }

    // Filtrar por estados
    if (
      filters.appointmentStatuses.length > 0 &&
      !filters.appointmentStatuses.includes(appointment.status)
    ) {
      return false
    }

    // Filtrar por rango de fechas
    const appointmentDate = new Date(appointment.date)
    if (
      isBefore(appointmentDate, filters.dateRange.start) ||
      isAfter(appointmentDate, filters.dateRange.end)
    ) {
      return false
    }

    // Filtrar solo virtuales
    if (filters.showVirtualOnly && appointment.type !== 'VIRTUAL') {
      return false
    }

    // Filtrar solo presenciales
    if (filters.showInPersonOnly && appointment.type !== 'IN_PERSON') {
      return false
    }

    // Ocultar citas completadas
    if (
      filters.hideCompletedAppointments &&
      appointment.status === 'COMPLETED'
    ) {
      return false
    }

    return true
  })
}

export function searchAppointments(
  appointments: Appointment[],
  searchTerm: string
): Appointment[] {
  if (!searchTerm.trim()) {
    return appointments
  }

  const lowercaseSearch = searchTerm.toLowerCase()

  return appointments.filter((appointment) => {
    // Buscar en nombre del paciente
    if (appointment.patient) {
      const patientName =
        `${appointment.patient.firstName} ${appointment.patient.lastName}`.toLowerCase()
      if (patientName.includes(lowercaseSearch)) {
        return true
      }
    }

    // Buscar en nombre del doctor
    if (appointment.doctor) {
      const doctorName =
        `${appointment.doctor.firstName} ${appointment.doctor.lastName}`.toLowerCase()
      if (doctorName.includes(lowercaseSearch)) {
        return true
      }
    }

    // Buscar en notas
    if (appointment.notes?.toLowerCase().includes(lowercaseSearch)) {
      return true
    }

    // Buscar en ID
    if (appointment.id.toLowerCase().includes(lowercaseSearch)) {
      return true
    }

    return false
  })
}

// ==============================================
// Utilidades de Cálculo y Estadísticas
// ==============================================

export function calculateDoctorUtilization(
  doctor: Doctor,
  appointments: Appointment[],
  dateRange: { start: Date; end: Date },
  availability?: DoctorAvailabilitySlot[]
): {
  doctorId: string
  doctorName: string
  utilization: number
  totalSlots: number
  bookedSlots: number
  totalHours: number
  bookedHours: number
} {
  const doctorAppointments = appointments.filter(
    (apt) =>
      apt.doctorId === doctor.id &&
      apt.status !== 'CANCELLED' &&
      isAfter(new Date(apt.date), dateRange.start) &&
      isBefore(new Date(apt.date), dateRange.end)
  )

  const totalBookedMinutes = doctorAppointments.reduce(
    (sum, apt) => sum + apt.duration,
    0
  )

  // Calcular total de slots disponibles en el rango de fechas
  const daysInRange = eachDayOfInterval(dateRange)
  const totalAvailableMinutes = daysInRange.reduce((sum, day) => {
    const dayOfWeek = getDay(day)
    const dayAvailability = availability?.find(
      (slot) => slot.dayOfWeek === dayOfWeek && slot.isAvailable
    )

    if (!dayAvailability) return sum

    const startTime = parse(dayAvailability.startTime, 'HH:mm', day)
    const endTime = parse(dayAvailability.endTime, 'HH:mm', day)

    return sum + differenceInMinutes(endTime, startTime)
  }, 0)

  const utilization =
    totalAvailableMinutes > 0
      ? (totalBookedMinutes / totalAvailableMinutes) * 100
      : 0

  return {
    doctorId: doctor.id,
    doctorName: formatDoctorName(doctor),
    utilization: Math.round(utilization),
    totalSlots: Math.floor(totalAvailableMinutes / 30), // Asumiendo slots de 30 min
    bookedSlots: Math.floor(totalBookedMinutes / 30),
    totalHours: totalAvailableMinutes / 60,
    bookedHours: totalBookedMinutes / 60,
  }
}

// ==============================================
// Utilidades de Navegación del Calendario
// ==============================================

export function getCalendarDateRange(
  view: CalendarView,
  date: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1
): { start: Date; end: Date } {
  switch (view) {
    case 'day':
      return {
        start: startOfDay(date),
        end: endOfDay(date),
      }

    case 'week':
    case 'workweek':
      return {
        start: startOfWeek(date, { weekStartsOn }),
        end: endOfWeek(date, { weekStartsOn }),
      }

    case 'month':
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
      }

    case 'agenda':
      return {
        start: startOfDay(date),
        end: addDays(startOfDay(date), 30),
      }

    default:
      return {
        start: startOfDay(date),
        end: endOfDay(date),
      }
  }
}

export function navigateCalendar(
  currentDate: Date,
  view: CalendarView,
  action: 'prev' | 'next' | 'today'
): Date {
  if (action === 'today') {
    return new Date()
  }

  const increment = action === 'next' ? 1 : -1

  switch (view) {
    case 'day':
      return addDays(currentDate, increment)

    case 'week':
    case 'workweek':
      return addDays(currentDate, increment * 7)

    case 'month':
      return addDays(currentDate, increment * 30)

    case 'agenda':
      return addDays(currentDate, increment * 30)

    default:
      return currentDate
  }
}

// ==============================================
// Utilidades de Validación
// ==============================================

export function validateAppointmentTime(
  start: Date,
  duration: number,
  doctorAvailability?: DoctorAvailabilitySlot[]
): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Verificar que la fecha no sea en el pasado
  if (isBefore(start, new Date())) {
    errors.push('No se pueden programar citas en el pasado')
  }

  // Verificar que sea en horario laboral
  if (!isBusinessHour(start)) {
    warnings.push('La cita está fuera del horario laboral normal')
  }

  // Verificar disponibilidad del doctor
  if (doctorAvailability) {
    const dayOfWeek = getDay(start)
    const availability = doctorAvailability.find(
      (slot) => slot.dayOfWeek === dayOfWeek && slot.isAvailable
    )

    if (!availability) {
      errors.push('El doctor no está disponible este día')
    } else {
      const startTime = parse(availability.startTime, 'HH:mm', start)
      const endTime = parse(availability.endTime, 'HH:mm', start)
      // Corregir: duration está en minutos, no en días
      const appointmentEnd = new Date(start.getTime() + duration * 60 * 1000)

      if (isBefore(start, startTime) || isAfter(appointmentEnd, endTime)) {
        errors.push('La cita está fuera del horario disponible del doctor')
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// ==============================================
// Utilidades de Export/Import
// ==============================================

export function exportCalendarData(
  appointments: Appointment[],
  format: 'csv' | 'ics' | 'json' = 'csv'
): string {
  switch (format) {
    case 'csv':
      const headers = [
        'Fecha',
        'Hora',
        'Paciente',
        'Doctor',
        'Tipo',
        'Estado',
        'Duración',
        'Notas',
      ]
      const rows = appointments.map((apt) => [
        formatCalendarDate(new Date(apt.date), 'dd/MM/yyyy'),
        formatCalendarTime(new Date(apt.date)),
        apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : '',
        apt.doctor ? `${apt.doctor.firstName} ${apt.doctor.lastName}` : '',
        apt.type,
        apt.status,
        formatAppointmentDuration(apt.duration),
        apt.notes || '',
      ])

      return [headers, ...rows].map((row) => row.join(',')).join('\n')

    case 'json':
      return JSON.stringify(appointments, null, 2)

    case 'ics':
      // Implementar formato ICS si es necesario
      return 'ICS format not implemented yet'

    default:
      return ''
  }
}
