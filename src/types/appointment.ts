// types/appointment.ts
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export enum AppointmentType {
  VIRTUAL = 'VIRTUAL',
  IN_PERSON = 'IN_PERSON',
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  date: string
  duration: number
  type: AppointmentType
  status: AppointmentStatus
  notes?: string
  videoLink?: string
  meetingId?: string
  price?: number
  cancelledReason?: string
  createdAt: string
  updatedAt: string

  // Relaciones
  patient?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  doctor?: {
    id: string
    firstName: string
    lastName: string
    specialties: string[]
    profilePhoto?: string
  }
  clinic?: {
    id: string
    name: string
    address: string
    phone?: string
  }
}

export interface CreateAppointmentRequest {
  doctorId: string
  patientId: string
  date: string
  duration: number
  type: AppointmentType
  notes?: string
}

export interface UpdateAppointmentRequest {
  date?: string
  duration?: number
  type?: AppointmentType
  notes?: string
  status?: AppointmentStatus
  cancelledReason?: string
  videoLink?: string
}

export interface AppointmentFilters {
  status?: AppointmentStatus
  type?: AppointmentType
  doctorId?: string
  patientId?: string
  dateFrom?: string
  dateTo?: string
}

export interface DoctorAvailability {
  id: string
  doctorProfileId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface TimeSlot {
  time: string
  available: boolean
}
