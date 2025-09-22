// ==============================================
// Tipos de Enumeración
// ==============================================

export type AppointmentType = 'VIRTUAL' | 'IN_PERSON'
export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'PAYPAL' | 'CASH'

// ==============================================
// Interfaces Principales
// ==============================================

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  date: string // ISO string
  duration: number // minutos
  type: AppointmentType
  status: AppointmentStatus
  notes?: string
  videoLink?: string // Campo calculado del meetingLink del doctor (solo para VIRTUAL+CONFIRMED)
  price?: number
  reminderSent: boolean
  confirmationSent: boolean
  cancelledReason?: string
  rescheduleCount: number
  isRecurring: boolean
  recurringPattern?: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY'
  parentAppointmentId?: string
  createdBy?: string
  updatedBy?: string
  source?: 'web' | 'mobile' | 'admin'
  deletedAt?: string
  createdAt: string
  updatedAt: string

  // Relaciones expandidas
  patient?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber?: string
  }
  doctor?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber?: string
    specialties?: Array<{
      id: string
      name: string
    }>
  }
  clinic?: {
    id: string
    name: string
    address: string
  }
}

// ==============================================
// Interfaces de Respuesta del Backend
// ==============================================

export interface BackendAppointment {
  id: string
  patientId: string
  doctorId: string
  date: string
  duration: number
  type: AppointmentType
  status: AppointmentStatus
  notes?: string
  videoLink?: string // Campo calculado del meetingLink del doctor (solo para VIRTUAL+CONFIRMED)
  price?: number
  reminderSent: boolean
  confirmationSent: boolean
  cancelledReason?: string
  rescheduleCount: number
  isRecurring: boolean
  recurringPattern?: string
  parentAppointmentId?: string
  createdBy?: string
  updatedBy?: string
  source?: string
  deletedAt?: string
  createdAt: string
  updatedAt: string

  // Relaciones del backend
  patient?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber?: string
  }
  doctor?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber?: string
    specialties?: Array<{
      id: string
      name: string
    }>
  }
  invoice?: {
    id: string
    amount: number
    status: PaymentStatus
  }
}

// ==============================================
// Interfaces de Datos de Formulario
// ==============================================

export interface CreateAppointmentData {
  patientId: string
  doctorId: string
  date: string // ISO string
  duration: number
  type: AppointmentType
  notes?: string
  price?: number
  isRecurring?: boolean
  recurringPattern?: string
  source?: string
}

export interface UpdateAppointmentData {
  date?: string
  duration?: number
  type?: AppointmentType
  status?: AppointmentStatus
  notes?: string
  price?: number
  cancelledReason?: string
}

// ==============================================
// Interfaces de Consulta y Filtros
// ==============================================

export interface QueryAppointmentsParams {
  page?: number
  limit?: number
  patientId?: string
  doctorId?: string
  status?: AppointmentStatus
  type?: AppointmentType
  startDate?: string
  endDate?: string
  todayOnly?: boolean
  includePatient?: boolean
  includeDoctor?: boolean
  includeInvoice?: boolean
  sortByDate?: 'asc' | 'desc'
  thisWeekOnly?: boolean
}

export interface QueryDoctorAvailabilityParams {
  doctorId: string
  date: string // YYYY-MM-DD
  duration?: number // minutos
}

// ==============================================
// Interfaces de Respuesta Paginada
// ==============================================

export interface PaginatedAppointmentsResponse {
  data: Appointment[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}

export interface BackendPaginatedAppointmentsResponse {
  data: BackendAppointment[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}

// ==============================================
// Interfaces de Disponibilidad
// ==============================================

export interface TimeSlot {
  startTime: string // HH:mm
  endTime: string // HH:mm
  isAvailable: boolean
  appointmentId?: string
  appointmentStatus?: AppointmentStatus
}

export interface DoctorAvailabilityResponse {
  doctorId: string
  date: string
  timeSlots: TimeSlot[]
  totalAvailableSlots: number
  totalBookedSlots: number
  workingHours: {
    start: string
    end: string
  }
  timeZone: string
}

export interface BackendDoctorAvailabilityResponse {
  doctorId: string
  date: string
  timeSlots: Array<{
    startTime: string
    endTime: string
    isAvailable: boolean
    appointmentId?: string
    appointmentStatus?: string
  }>
  totalAvailableSlots: number
  totalBookedSlots: number
  workingHours: {
    start: string
    end: string
  }
  timeZone: string
}

// ==============================================
// Interfaces de Estadísticas
// ==============================================

export interface AppointmentStats {
  total: number
  scheduled: number
  confirmed: number
  completed: number
  cancelled: number
  noShow: number
  virtual: number
  inPerson: number
  today: number
  thisWeek: number
  thisMonth: number
  byStatus: Array<{
    status: AppointmentStatus
    count: number
    percentage: number
  }>
  byType: Array<{
    type: AppointmentType
    count: number
    percentage: number
  }>
  byDoctor: Array<{
    doctorId: string
    doctorName: string
    count: number
  }>
  bySpecialty: Array<{
    specialty: string
    count: number
  }>
}

export interface BackendAppointmentStats {
  total: number
  scheduled: number
  confirmed: number
  completed: number
  cancelled: number
  noShow: number
  virtual: number
  inPerson: number
  today: number
  thisWeek: number
  thisMonth: number
  byStatus: Array<{
    status: string
    count: number
    percentage: number
  }>
  byType: Array<{
    type: string
    count: number
    percentage: number
  }>
  byDoctor: Array<{
    doctorId: string
    doctorName: string
    count: number
  }>
  bySpecialty: Array<{
    specialty: string
    count: number
  }>
}

// ==============================================
// Interfaces de Formulario
// ==============================================

export interface AppointmentFormData {
  patientId: string
  doctorId: string
  date: string
  time: string
  duration: number
  type: AppointmentType
  notes: string
  price?: number
  isRecurring: boolean
  recurringPattern?: string
}

// ==============================================
// Interfaces de Filtros
// ==============================================

export interface AppointmentFilters {
  search: string
  status: AppointmentStatus | ''
  type: AppointmentType | ''
  patientId: string
  doctorId: string
  startDate: string
  endDate: string
  todayOnly: boolean
  includeCompleted: boolean
}

// ==============================================
// Interfaces de Analytics
// ==============================================

export interface AppointmentAnalytics {
  registrationTrend: Array<{
    date: string
    count: number
  }>
  statusDistribution: Array<{
    status: AppointmentStatus
    count: number
    percentage: number
  }>
  typeDistribution: Array<{
    type: AppointmentType
    count: number
    percentage: number
  }>
  dailyDistribution: Array<{
    day: string
    count: number
  }>
  hourlyDistribution: Array<{
    hour: string
    count: number
  }>
  topDoctors: Array<{
    doctorId: string
    doctorName: string
    appointments: number
    revenue: number
  }>
  revenueTrend: Array<{
    date: string
    revenue: number
    appointments: number
  }>
}

// ==============================================
// Interfaces de Respuesta de Acciones
// ==============================================

export interface ServerApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface CreateAppointmentResponse {
  message: string
  appointmentId: string
}

export interface CancelAppointmentResponse {
  message: string
  appointmentId: string
  cancelledReason?: string
}

// ==============================================
// Constantes y Valores por Defecto
// ==============================================

export const APPOINTMENT_DURATIONS = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1.5 horas' },
  { value: 120, label: '2 horas' },
] as const

export const APPOINTMENT_TYPES = [
  { value: 'IN_PERSON', label: 'Presencial' },
  { value: 'VIRTUAL', label: 'Virtual' },
] as const

export const APPOINTMENT_STATUSES = [
  { value: 'SCHEDULED', label: 'Programada' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'CANCELLED', label: 'Cancelada' },
  { value: 'NO_SHOW', label: 'No asistió' },
] as const

export const RECURRING_PATTERNS = [
  { value: 'DAILY', label: 'Diario' },
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'BIWEEKLY', label: 'Quincenal' },
  { value: 'MONTHLY', label: 'Mensual' },
  { value: 'QUARTERLY', label: 'Trimestral' },
] as const

// ==============================================
// Funciones de Utilidad
// ==============================================

export const getStatusColor = (status: AppointmentStatus): string => {
  switch (status) {
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-800'
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800'
    case 'COMPLETED':
      return 'bg-gray-100 text-gray-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    case 'NO_SHOW':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getStatusText = (status: AppointmentStatus): string => {
  switch (status) {
    case 'SCHEDULED':
      return 'Programada'
    case 'CONFIRMED':
      return 'Confirmada'
    case 'COMPLETED':
      return 'Completada'
    case 'CANCELLED':
      return 'Cancelada'
    case 'NO_SHOW':
      return 'No asistió'
    default:
      return 'Desconocido'
  }
}

export const getTypeText = (type: AppointmentType): string => {
  switch (type) {
    case 'IN_PERSON':
      return 'Presencial'
    case 'VIRTUAL':
      return 'Virtual'
    default:
      return 'Desconocido'
  }
}

export const getTypeIcon = (type: AppointmentType): string => {
  switch (type) {
    case 'IN_PERSON':
      return '🏥'
    case 'VIRTUAL':
      return '💻'
    default:
      return '📅'
  }
}

export const formatAppointmentDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatAppointmentTime = (dateString: string): string => {
  // 🔧 CORREGIDO: Usar UTC directo para consistencia con mobile
  const date = new Date(dateString)
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 === 0 ? 12 : hours % 12

  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

export const formatAppointmentDateTime = (dateString: string): string => {
  // 🔧 CORREGIDO: Usar UTC directo para consistencia con mobile
  const date = new Date(dateString)
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 === 0 ? 12 : hours % 12
  const timeFormatted = `${displayHours}:${minutes
    .toString()
    .padStart(2, '0')} ${period}`

  // Para la fecha, usar formato local sin problemas
  const dateFormatted = date.toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return `${dateFormatted} ${timeFormatted}`
}

export const isAppointmentToday = (dateString: string): boolean => {
  const appointmentDate = new Date(dateString)
  const today = new Date()
  return (
    appointmentDate.getDate() === today.getDate() &&
    appointmentDate.getMonth() === today.getMonth() &&
    appointmentDate.getFullYear() === today.getFullYear()
  )
}

export const isAppointmentPast = (dateString: string): boolean => {
  const appointmentDate = new Date(dateString)
  const now = new Date()
  return appointmentDate < now
}

export const canCancelAppointment = (appointment: Appointment): boolean => {
  return (
    appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED'
  )
}

export const canRescheduleAppointment = (appointment: Appointment): boolean => {
  return (
    appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED'
  )
}

export const getAppointmentDurationText = (duration: number): string => {
  if (duration < 60) {
    return `${duration} minutos`
  }
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  if (minutes === 0) {
    return `${hours} hora${hours > 1 ? 's' : ''}`
  }
  return `${hours} hora${hours > 1 ? 's' : ''} ${minutes} minutos`
}
