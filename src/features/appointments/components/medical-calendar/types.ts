import type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from '../../types'

// Re-export types for components
export type { AppointmentStatus, AppointmentType }

// Tipos específicos para el calendario médico
// Compatibilidad con el tipo Doctor de features/doctors/types
export interface Doctor {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  specialties?: Array<{
    id: string
    name: string
    description?: string
  }>
  license?: string
  consultationFee?: number
  isActive: boolean
  // Compatibilidad con features/doctors/types
  user?: {
    id: string
    email: string
    firstName: string
    lastName: string
    phoneNumber?: string
    isActive: boolean
  }
  profilePhoto?: {
    id: string
    filename: string
    originalName: string
    path: string
    thumbnailUrl: string
    mimeType: string
    size: number
    fileType: string
    category: string
    isPublic: boolean
    metadata: Record<string, unknown>
    createdAt: string
    updatedAt: string
  }
  address?: string
  bio?: string
  education?: string[]
  experience?: number
  languages?: string[]
  timeZone?: string
  publicEmail?: string
  publicPhone?: string
  certifications?: string[]
  awards?: string[]
  publications?: string[]
  clinics?: Array<{
    clinic: {
      id: string
      name: string
      address: string
      phone: string
      email: string
      coordinates: { lat: number; lng: number }
    }
    officeNumber: string
    directPhone: string
    workingDays: string[]
    workingHours: string
    notes?: string
    isPrimary: boolean
  }>
}

export interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  birthDate?: string
  gender?: string
  bloodType?: string
  allergies?: string[]
  isActive: boolean
}

// ==============================================
// Tipos del Calendario Médico
// ==============================================

export type CalendarView = 'month' | 'week' | 'day' | 'agenda' | 'workweek'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: CalendarResource
  allDay?: boolean
  appointment: Appointment
}

export interface CalendarResource {
  id: string
  title: string
  type: 'doctor' | 'room' | 'equipment'
  color: string
  isAvailable: boolean
  metadata?: Record<string, unknown>
}

export interface DoctorSchedule {
  doctorId: string
  doctor: Doctor
  availability: DoctorAvailabilitySlot[]
  appointments: Appointment[]
  color: string
  isOnCall: boolean
}

export interface DoctorAvailabilitySlot {
  id: string
  dayOfWeek: number // 0-6 (Domingo-Sábado)
  startTime: string // HH:mm
  endTime: string // HH:mm
  isAvailable: boolean
  breakTime?: {
    start: string
    end: string
    reason: string
  }[]
}

export interface TimeSlot {
  start: Date
  end: Date
  isAvailable: boolean
  doctorId?: string
  appointmentId?: string
  conflictLevel?: 'none' | 'warning' | 'conflict'
}

export interface CalendarFilters {
  doctors: string[]
  appointmentTypes: AppointmentType[]
  appointmentStatuses: AppointmentStatus[]
  specialties: string[]
  clinics: string[]
  dateRange: {
    start: Date
    end: Date
  }
  showVirtualOnly: boolean
  showInPersonOnly: boolean
  showAvailableSlots: boolean
  hideCompletedAppointments: boolean
}

export interface CalendarSettings {
  view: CalendarView
  startHour: number // 0-23
  endHour: number // 0-23
  slotDuration: number // minutes
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 // Día de la semana
  timezone: string
  showWeekends: boolean
  showBusinessHours: boolean
  enableDragAndDrop: boolean
  enableResizing: boolean
  autoSaveChanges: boolean
  notificationSettings: {
    showReminders: boolean
    reminderMinutes: number[]
    emailNotifications: boolean
    pushNotifications: boolean
  }
}

export interface AppointmentConflict {
  id: string
  type:
    | 'time_overlap'
    | 'doctor_unavailable'
    | 'double_booking'
    | 'location_conflict'
  severity: 'info' | 'warning' | 'error'
  message: string
  conflictingAppointments: string[]
  suggestedActions: ConflictAction[]
  existingAppointment?: Appointment
  suggestions?: string[]
}

export interface ConflictAction {
  id: string
  label: string
  action:
    | 'reschedule'
    | 'reassign_doctor'
    | 'change_location'
    | 'cancel'
    | 'override'
  metadata?: Record<string, unknown>
}

export interface RecurringAppointmentPattern {
  type: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'
  interval: number
  daysOfWeek?: number[] // Para patrones semanales
  dayOfMonth?: number // Para patrones mensuales
  endDate?: Date
  maxOccurrences?: number
  exceptions?: Date[] // Fechas a excluir
}

export interface CalendarNotification {
  id: string
  type: 'reminder' | 'conflict' | 'change' | 'cancellation' | 'new_appointment'
  title: string
  message: string
  timestamp: Date
  appointmentId?: string
  severity: 'info' | 'warning' | 'error'
  actions?: NotificationAction[]
  isRead: boolean
}

export interface NotificationAction {
  id: string
  label: string
  action: string
  style: 'primary' | 'secondary' | 'destructive'
}

export interface CalendarStats {
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  noShowAppointments: number
  averageAppointmentDuration: number
  busiesDay: string
  peakHours: { start: string; end: string }
  doctorUtilization: Array<{
    doctorId: string
    doctorName: string
    utilization: number // percentage
    totalSlots: number
    bookedSlots: number
  }>
  revenueByDay: Array<{
    date: string
    revenue: number
    appointments: number
  }>
}

export interface CalendarTheme {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  background: string
  surface: string
  text: {
    primary: string
    secondary: string
    disabled: string
  }
  appointment: {
    scheduled: string
    confirmed: string
    inProgress: string
    completed: string
    cancelled: string
    noShow: string
  }
  appointmentType: {
    virtual: string
    inPerson: string
    emergency: string
    followUp: string
    routine: string
  }
}

// ==============================================
// Props de Componentes
// ==============================================

export interface MedicalCalendarProps {
  // Datos
  appointments: Appointment[]
  doctors: Doctor[]
  patients?: Patient[]

  // Configuración
  settings?: Partial<CalendarSettings>
  filters?: Partial<CalendarFilters>
  theme?: Partial<CalendarTheme>

  // Callbacks
  onAppointmentSelect?: (appointment: Appointment) => void
  onAppointmentCreate?: (appointment: Partial<Appointment>) => void
  onAppointmentUpdate?: (
    appointmentId: string,
    updates: Partial<Appointment>
  ) => void
  onAppointmentDelete?: (appointmentId: string) => void
  onAppointmentDragEnd?: (
    appointmentId: string,
    newStart: Date,
    newEnd: Date,
    doctorId?: string
  ) => void
  onTimeSlotSelect?: (start: Date, end: Date, doctorId?: string) => void
  onViewChange?: (view: CalendarView) => void
  onDateChange?: (date: Date) => void
  onFiltersChange?: (filters: CalendarFilters) => void

  // Estados
  isLoading?: boolean
  isReadOnly?: boolean
  showConflicts?: boolean
  enableAnimations?: boolean

  // Características avanzadas
  enableRecurringAppointments?: boolean
  enableAppointmentTemplates?: boolean
  enableBulkOperations?: boolean
  enableRealtimeUpdates?: boolean
  enableExport?: boolean
  enablePrint?: boolean
}

export interface CalendarToolbarProps {
  view: CalendarView
  date: Date
  onViewChange: (view: CalendarView) => void
  onNavigate: (action: 'prev' | 'next' | 'today') => void
  onDateChange: (date: Date) => void
  filters: CalendarFilters
  onFiltersChange: (filters: CalendarFilters) => void
  isLoading?: boolean
  enableExport?: boolean
  enablePrint?: boolean
}

export interface AppointmentFormProps {
  appointment?: Partial<Appointment>
  timeSlot?: TimeSlot | null
  doctors: Doctor[]
  patients?: Patient[]
  isOpen: boolean
  onClose: () => void
  onSave: (appointment: Partial<Appointment>) => void
  enableRecurring?: boolean
  suggestedTimes?: TimeSlot[]
}

export interface DoctorScheduleViewProps {
  doctor: Doctor
  appointments: Appointment[]
  availability: DoctorAvailabilitySlot[]
  date: Date
  onAppointmentSelect?: (appointment: Appointment) => void
  onTimeSlotSelect?: (start: Date, end: Date) => void
  isReadOnly?: boolean
}

export interface ConflictResolverProps {
  isOpen: boolean
  conflicts: AppointmentConflict[]
  onResolve: (action: string, conflicts: AppointmentConflict[]) => Promise<void>
  onClose: () => void
}

// ==============================================
// Utilidades de Tipos
// ==============================================

export type CalendarEventHandler<T = unknown> = (
  event: T
) => void | Promise<void>

export type AppointmentOperationType =
  | 'create'
  | 'update'
  | 'delete'
  | 'reschedule'
  | 'cancel'
  | 'complete'
  | 'noshow'

export interface CalendarOperation {
  type: AppointmentOperationType
  appointmentId?: string
  data?: Partial<Appointment>
  timestamp: Date
  userId: string
  reason?: string
}

export interface CalendarState {
  view: CalendarView
  date: Date
  filters: CalendarFilters
  settings: CalendarSettings
  selectedAppointment?: Appointment
  selectedTimeSlot?: { start: Date; end: Date; doctorId?: string }
  conflicts: AppointmentConflict[]
  notifications: CalendarNotification[]
  isLoading: boolean
  error?: string
}

// ==============================================
// API Types
// ==============================================

export interface CalendarApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  conflicts?: AppointmentConflict[]
  suggestions?: TimeSlot[]
}

export interface AppointmentCreateRequest {
  patientId: string
  doctorId: string
  start: Date
  end: Date
  type: AppointmentType
  notes?: string
  recurring?: RecurringAppointmentPattern
  notifyPatient?: boolean
  notifyDoctor?: boolean
}

export interface AppointmentUpdateRequest {
  id: string
  updates: Partial<Appointment>
  reason?: string
  notifyStakeholders?: boolean
}

export interface AvailabilityRequest {
  doctorId: string
  startDate: Date
  endDate: Date
  duration: number
  preferredTimes?: string[] // ['09:00', '14:00']
  excludeExisting?: boolean
}
