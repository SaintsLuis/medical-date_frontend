// src/features/doctors/types/index.ts

// ========================
// Tipos Principales
// ========================

/**
 * Representa un doctor en el sistema.
 */
export interface Doctor {
  id: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    phoneNumber: string
    isActive: boolean
  }
  license: string
  phone: string
  address: string
  bio: string
  consultationFee: number
  education: string[]
  experience: number
  languages: string[]
  timeZone: string
  meetingLink?: string
  publicEmail?: string
  publicPhone?: string
  certifications?: string[]
  awards?: string[]
  publications?: string[]
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
  specialties: Array<{
    id: string
    name: string
    description: string
  }>
  availability?: Array<{
    id: string
    dayOfWeek: number
    startTime: string
    endTime: string
    isAvailable: boolean
  }>
  clinics?: Array<{
    clinic: {
      id: string
      name: string
      address: string
      phone: string
      email: string
      coordinates: {
        lat: number
        lng: number
      }
    }
    officeNumber: string
    directPhone: string
    workingDays: string[]
    workingHours: string
    isPrimary: boolean
  }>
  createdAt: string
  updatedAt: string
}

/**
 * Doctor con información extendida para listas.
 */
export interface DoctorWithDetails extends Doctor {
  fullName: string
  specialtyDisplay: string
  statusDisplay: string
  rating?: number
  totalReviews?: number
  totalAppointments?: number
}

// ========================
// Tipos para API & Actions
// ========================

/**
 * Datos para crear un nuevo doctor.
 */
export interface CreateDoctorData {
  email: string
  password: string
  firstName: string
  lastName: string
  license: string
  phone: string
  address: string
  bio: string
  consultationFee: number
  education: string[]
  experience: number
  languages: string[]
  timeZone: string
  meetingLink?: string
  specialtyIds?: string[]
  clinicIds?: string[]
}

/**
 * Datos para actualizar un doctor existente.
 */
export interface UpdateDoctorData {
  phone?: string
  address?: string
  bio?: string
  consultationFee?: number
  education?: string[]
  experience?: number
  languages?: string[]
  timeZone?: string
  meetingLink?: string
  specialtyIds?: string[]
  clinicIds?: string[]
}

/**
 * Parámetros para filtrar y paginar la lista de doctores.
 */
export interface QueryDoctorsParams {
  page?: number
  limit?: number
  search?: string
  specialtyId?: string
  location?: string
  includeAvailability?: boolean
  includeSpecialties?: boolean
  sortByFee?: 'asc' | 'desc'
}

/**
 * Estructura de la respuesta paginada desde la API.
 */
export interface PaginatedDoctorsResponse {
  data: Doctor[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}

/**
 * Respuesta de creación de doctor.
 */
export interface CreateDoctorResponse {
  message: string
  doctorId: string
}

/**
 * Estadísticas clave sobre los doctores.
 */
export interface DoctorStats {
  total: number
  active: number
  bySpecialty: Array<{
    specialtyName: string
    count: number
  }>
}

// ========================
// Tipos para Formularios y UI
// ========================

/**
 * Datos del formulario para crear/editar un doctor.
 */
export interface DoctorFormData {
  email: string
  password?: string
  firstName: string
  lastName: string
  license: string
  phone: string
  address: string
  bio: string
  consultationFee: number
  education: string[]
  experience: number
  languages: string[]
  timeZone: string
  meetingLink?: string
  publicEmail: string
  publicPhone: string
  certifications: string[]
  awards: string[]
  publications: string[]
  specialtyIds: string[]
  clinicIds: string[]
}

/**
 * Valores por defecto para el formulario de doctores.
 */
export const DOCTOR_FORM_DEFAULTS: DoctorFormData = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  license: '',
  phone: '',
  address: '',
  bio: '',
  consultationFee: 0,
  education: [''],
  experience: 0,
  languages: ['Español'],
  timeZone: 'America/Santo_Domingo',
  meetingLink: '',
  publicEmail: '',
  publicPhone: '',
  certifications: [''],
  awards: [''],
  publications: [''],
  specialtyIds: [],
  clinicIds: [],
}

/**
 * Constantes de validación para el formulario.
 */
export const DOCTOR_VALIDATION = {
  email: {
    minLength: 5,
    maxLength: 255,
  },
  firstName: {
    minLength: 2,
    maxLength: 50,
  },
  lastName: {
    minLength: 2,
    maxLength: 50,
  },
  license: {
    minLength: 3,
    maxLength: 50,
  },
  phone: {
    maxLength: 20,
  },
  address: {
    maxLength: 255,
  },
  bio: {
    maxLength: 1000,
  },
  consultationFee: {
    min: 0,
    max: 10000,
  },
  experience: {
    min: 0,
    max: 50,
  },
} as const

// ========================
// Tipos para Filtros y Búsqueda
// ========================

export interface DoctorFilters {
  search: string
  specialtyId: string
  location: string
  minFee: number | null
  maxFee: number | null
  minExperience: number | null
  maxExperience: number | null
  isAvailable: boolean | null
}

export const DOCTOR_FILTER_DEFAULTS: DoctorFilters = {
  search: '',
  specialtyId: '',
  location: '',
  minFee: null,
  maxFee: null,
  minExperience: null,
  maxExperience: null,
  isAvailable: null,
}

// ========================
// Tipos para Gráficos y Analytics
// ========================

export interface DoctorAnalytics {
  registrationTrend: Array<{
    date: string
    count: number
  }>
  specialtyDistribution: Array<{
    specialty: string
    count: number
    percentage: number
  }>
  feeDistribution: Array<{
    range: string
    count: number
  }>
  experienceDistribution: Array<{
    range: string
    count: number
  }>
  topDoctors: Array<{
    id: string
    name: string
    specialty: string
    rating: number
    appointments: number
  }>
}

// ========================
// Tipos para Disponibilidad
// ========================

export interface DoctorAvailability {
  id: string
  doctorId: string
  dayOfWeek: number // 0-6 (Domingo-Sábado)
  startTime: string // HH:mm
  endTime: string // HH:mm
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export interface AvailabilitySchedule {
  [dayOfWeek: number]: {
    startTime: string
    endTime: string
    isAvailable: boolean
  }
}

// ========================
// Tipos para Especialidades
// ========================

export interface DoctorSpecialty {
  id: string
  doctorId: string
  specialtyId: string
  specialty: {
    id: string
    name: string
    description: string
  }
  createdAt: string
  updatedAt: string
}
