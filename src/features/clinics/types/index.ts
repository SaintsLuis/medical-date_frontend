/**
 * Types for Clinic Management System
 * Following the same pattern as specialties, doctors, and patients modules
 */

// ==============================================
// Core Clinic Interface
// ==============================================

export interface Clinic {
  id: string
  name: string
  address: string
  phone: string
  email: string
  coordinates: {
    lat: number
    lng: number
  }
  description?: string
  website?: string
  isActive: boolean
  workingHours?: {
    monday: { start: string; end: string; isOpen: boolean }
    tuesday: { start: string; end: string; isOpen: boolean }
    wednesday: { start: string; end: string; isOpen: boolean }
    thursday: { start: string; end: string; isOpen: boolean }
    friday: { start: string; end: string; isOpen: boolean }
    saturday: { start: string; end: string; isOpen: boolean }
    sunday: { start: string; end: string; isOpen: boolean }
  }
  services: string[]
  amenities: string[]
  totalDoctors: number
  totalPatients: number
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
  doctors?: Array<{
    id: string
    firstName: string
    lastName: string
    specialties: Array<{
      id: string
      name: string
    }>
    officeNumber?: string
    directPhone?: string
    workingDays: string[]
    workingHours: string
    isPrimary: boolean
  }>
  specialties?: Array<{
    id: string
    name: string
    description: string
    doctorCount: number
  }>
  createdAt: string
  updatedAt: string
}

// ==============================================
// Extended Clinic Interfaces
// ==============================================

export interface ClinicWithDetails extends Clinic {
  fullAddress: string
  statusDisplay: string
  doctorCountDisplay: string
  patientCountDisplay: string
  servicesDisplay: string
}

// ==============================================
// Form Data Types
// ==============================================

export interface CreateClinicData {
  name: string
  address: string
  phone: string
  email: string
  coordinates: {
    lat: number
    lng: number
  }
  description?: string
  website?: string
  workingHours: {
    monday: { start: string; end: string; isOpen: boolean }
    tuesday: { start: string; end: string; isOpen: boolean }
    wednesday: { start: string; end: string; isOpen: boolean }
    thursday: { start: string; end: string; isOpen: boolean }
    friday: { start: string; end: string; isOpen: boolean }
    saturday: { start: string; end: string; isOpen: boolean }
    sunday: { start: string; end: string; isOpen: boolean }
  }
  services: string[]
  amenities: string[]
}

export interface UpdateClinicData {
  name?: string
  address?: string
  phone?: string
  email?: string
  coordinates?: {
    lat: number
    lng: number
  }
  description?: string
  website?: string
  workingHours?: {
    monday?: { start: string; end: string; isOpen: boolean }
    tuesday?: { start: string; end: string; isOpen: boolean }
    wednesday?: { start: string; end: string; isOpen: boolean }
    thursday?: { start: string; end: string; isOpen: boolean }
    friday?: { start: string; end: string; isOpen: boolean }
    saturday?: { start: string; end: string; isOpen: boolean }
    sunday?: { start: string; end: string; isOpen: boolean }
  }
  services?: string[]
  amenities?: string[]
  isActive?: boolean
}

// ==============================================
// Query Parameters
// ==============================================

export interface QueryClinicsParams {
  page?: number
  limit?: number
  search?: string
  location?: string
  city?: string
  isActive?: boolean
  hasServices?: string[]
  hasAmenities?: string[]
  includeDoctors?: boolean
  includeSpecialties?: boolean
  sortBy?: 'name' | 'totalDoctors' | 'totalPatients' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

// ==============================================
// API Response Types
// ==============================================

export interface PaginatedClinicsResponse {
  data: Clinic[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}

export interface CreateClinicResponse {
  message: string
  clinicId: string
}

// ==============================================
// Statistics Types
// ==============================================

export interface BackendClinicStats {
  total: number
  active: number
  inactive: number
  totalDoctors: number
  totalPatients: number
  byLocation: Array<{
    city: string
    count: number
  }>
  byServices: Array<{
    service: string
    count: number
  }>
}

export interface ClinicStats extends BackendClinicStats {
  averageDoctorsPerClinic: number
  averagePatientsPerClinic: number
  topClinics: Array<{
    id: string
    name: string
    totalDoctors: number
  }>
  clinicsWithoutDoctors: Array<{
    id: string
    name: string
    doctorCount: number
  }>
  recentlyAdded: number
}

// ==============================================
// Form Data Types
// ==============================================

export interface ClinicFormData {
  name: string
  address: string
  phone: string
  email: string
  coordinates: {
    lat: number
    lng: number
  }
  description: string
  website: string
  workingHours: {
    monday: { start: string; end: string; isOpen: boolean }
    tuesday: { start: string; end: string; isOpen: boolean }
    wednesday: { start: string; end: string; isOpen: boolean }
    thursday: { start: string; end: string; isOpen: boolean }
    friday: { start: string; end: string; isOpen: boolean }
    saturday: { start: string; end: string; isOpen: boolean }
    sunday: { start: string; end: string; isOpen: boolean }
  }
  services: string[]
  amenities: string[]
  isActive: boolean
}

// ==============================================
// Validation Constants
// ==============================================

export const CLINIC_FORM_DEFAULTS: ClinicFormData = {
  name: '',
  address: '',
  phone: '',
  email: '',
  coordinates: {
    lat: 0,
    lng: 0,
  },
  description: '',
  website: '',
  workingHours: {
    monday: { start: '08:00', end: '17:00', isOpen: true },
    tuesday: { start: '08:00', end: '17:00', isOpen: true },
    wednesday: { start: '08:00', end: '17:00', isOpen: true },
    thursday: { start: '08:00', end: '17:00', isOpen: true },
    friday: { start: '08:00', end: '17:00', isOpen: true },
    saturday: { start: '09:00', end: '13:00', isOpen: false },
    sunday: { start: '09:00', end: '13:00', isOpen: false },
  },
  services: [],
  amenities: [],
  isActive: true,
}

export const CLINIC_VALIDATION = {
  name: {
    minLength: 2,
    maxLength: 100,
    required: true,
  },
  address: {
    minLength: 5,
    maxLength: 200,
    required: true,
  },
  phone: {
    minLength: 10,
    maxLength: 15,
    required: true,
    pattern: /^[+]?[\d\s\-\(\)]+$/,
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  website: {
    required: false,
    pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  },
  coordinates: {
    lat: { min: -90, max: 90, required: true },
    lng: { min: -180, max: 180, required: true },
  },
  description: {
    maxLength: 500,
    required: false,
  },
  services: {
    minItems: 0,
    maxItems: 20,
    required: false,
  },
  amenities: {
    minItems: 0,
    maxItems: 15,
    required: false,
  },
} as const

// ==============================================
// Filter and Search Types
// ==============================================

export interface ClinicFilters {
  search: string
  location: string
  city: string
  isActive: boolean | null
  hasServices: string[]
  hasAmenities: string[]
  minDoctors: number | null
  minPatients: number | null
}

// ==============================================
// Analytics Types
// ==============================================

export interface ClinicAnalytics {
  registrationTrend: Array<{
    date: string
    count: number
  }>
  locationDistribution: Array<{
    city: string
    count: number
    percentage: number
  }>
  serviceDistribution: Array<{
    service: string
    count: number
    percentage: number
  }>
  amenityDistribution: Array<{
    amenity: string
    count: number
    percentage: number
  }>
  ratingDistribution: Array<{
    rating: number
    count: number
  }>
  sizeDistribution: Array<{
    range: string
    count: number
  }>
  topClinics: Array<{
    id: string
    name: string
    rating: number
    totalDoctors: number
    totalPatients: number
  }>
}

// ==============================================
// Working Hours Types
// ==============================================

export interface WorkingDay {
  start: string
  end: string
  isOpen: boolean
}

export interface WeeklySchedule {
  monday: WorkingDay
  tuesday: WorkingDay
  wednesday: WorkingDay
  thursday: WorkingDay
  friday: WorkingDay
  saturday: WorkingDay
  sunday: WorkingDay
}

// ==============================================
// Predefined Data
// ==============================================

export const COMMON_CLINIC_SERVICES = [
  'Consulta General',
  'Medicina Familiar',
  'Cardiología',
  'Dermatología',
  'Ginecología',
  'Pediatría',
  'Neurología',
  'Oftalmología',
  'Ortopedia',
  'Psiquiatría',
  'Radiología',
  'Laboratorio Clínico',
  'Cirugía General',
  'Odontología',
  'Fisioterapia',
  'Nutrición',
  'Psicología',
  'Medicina Interna',
  'Endocrinología',
  'Urología',
] as const

export const COMMON_CLINIC_AMENITIES = [
  'Estacionamiento',
  'Acceso para Discapacitados',
  'Wi-Fi Gratuito',
  'Farmacia',
  'Cafetería',
  'Aire Acondicionado',
  'Sala de Espera',
  'Televisión',
  'Revista y Libros',
  'Área de Juegos para Niños',
  'Ascensor',
  'Baños Públicos',
  'Recepción 24/7',
  'Servicio de Emergencia',
  'Laboratorio In-Situ',
  'Rayos X',
  'Ultrasonido',
  'Tomografía',
  'Resonancia Magnética',
  'Quirófanos',
] as const

// ==============================================
// Utility Functions
// ==============================================

export const formatWorkingHours = (workingHours?: WeeklySchedule): string => {
  if (!workingHours) return 'Horarios no configurados'

  const days = Object.entries(workingHours)
  const openDays = days.filter(([, schedule]) => schedule.isOpen)

  if (openDays.length === 0) return 'Cerrado'
  if (openDays.length === 7) return 'Abierto todos los días'

  const dayNames = {
    monday: 'Lun',
    tuesday: 'Mar',
    wednesday: 'Mié',
    thursday: 'Jue',
    friday: 'Vie',
    saturday: 'Sáb',
    sunday: 'Dom',
  }

  return openDays
    .map(
      ([day, schedule]) =>
        `${dayNames[day as keyof typeof dayNames]}: ${schedule.start}-${
          schedule.end
        }`
    )
    .join(', ')
}

export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371 // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const isClinicOpen = (
  workingHours?: WeeklySchedule,
  date: Date = new Date()
): boolean => {
  // Si no hay horarios configurados, asumimos que está cerrado
  if (!workingHours) return false

  const dayNames = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  const currentDay = dayNames[date.getDay()] as keyof WeeklySchedule
  const schedule = workingHours[currentDay]

  // Si no existe el día o no está abierto
  if (!schedule || !schedule.isOpen) return false

  const currentTime = date.toTimeString().slice(0, 5) // HH:mm format
  return currentTime >= schedule.start && currentTime <= schedule.end
}

export const formatAddress = (address: string): string => {
  return address.trim().replace(/\s+/g, ' ')
}

export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}
