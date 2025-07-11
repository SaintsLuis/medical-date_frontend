// src/features/patients/types/index.ts

// ========================
// Tipos Principales
// ========================

/**
 * Representa un paciente en el sistema.
 */
export interface Patient {
  id: string
  birthDate: string
  gender: 'MALE' | 'FEMALE'
  address: string
  emergencyContact: string
  bloodType:
    | 'A_POSITIVE'
    | 'A_NEGATIVE'
    | 'B_POSITIVE'
    | 'B_NEGATIVE'
    | 'AB_POSITIVE'
    | 'AB_NEGATIVE'
    | 'O_POSITIVE'
    | 'O_NEGATIVE'
  allergies: string[]
  age: number
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
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    phoneNumber: string
    isActive: boolean
  }
  medicalRecords?: Array<{
    id: string
    recordType: string
    title: string
    description: string
    date: string
    status: string
  }>
  appointments?: Array<{
    id: string
    date: string
    status: string
    type: string
  }>
  createdAt: string
  updatedAt: string
}

/**
 * Paciente con información adicional para la UI.
 */
export interface PatientWithDetails extends Patient {
  fullName: string
  ageDisplay: string
  statusDisplay: string
  lastAppointment?: string
  totalAppointments: number
  totalMedicalRecords: number
}

/**
 * Datos para actualizar un paciente.
 */
export interface UpdatePatientData {
  birthDate?: string
  gender?: 'MALE' | 'FEMALE'
  address?: string
  emergencyContact?: string
  bloodType?:
    | 'A_POSITIVE'
    | 'A_NEGATIVE'
    | 'B_POSITIVE'
    | 'B_NEGATIVE'
    | 'AB_POSITIVE'
    | 'AB_NEGATIVE'
    | 'O_POSITIVE'
    | 'O_NEGATIVE'
  allergies?: string[]
}

/**
 * Parámetros para consultar pacientes.
 */
export interface QueryPatientsParams {
  page?: number
  limit?: number
  search?: string
  gender?: 'MALE' | 'FEMALE'
  bloodType?:
    | 'A_POSITIVE'
    | 'A_NEGATIVE'
    | 'B_POSITIVE'
    | 'B_NEGATIVE'
    | 'AB_POSITIVE'
    | 'AB_NEGATIVE'
    | 'O_POSITIVE'
    | 'O_NEGATIVE'
  location?: string
  includeUser?: boolean
  includeMedicalRecords?: boolean
  includeAppointments?: boolean
  sortByAge?: 'asc' | 'desc'
}

/**
 * Respuesta paginada de pacientes.
 */
export interface PaginatedPatientsResponse {
  data: Patient[]
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
 * Estadísticas de pacientes del backend.
 */
export interface BackendPatientStats {
  total: number
  active: number
  byGender: Array<{
    gender: string
    count: number
  }>
  byBloodType: Array<{
    bloodType: string
    count: number
  }>
  averageAge: number
}

/**
 * Estadísticas de pacientes con información adicional.
 */
export interface PatientStats extends BackendPatientStats {
  averageAge: number
  topAllergies: Array<{
    allergy: string
    count: number
  }>
  recentRegistrations: number
}

/**
 * Datos del formulario de paciente.
 */
export interface PatientFormData {
  address: string
  emergencyContact: string
  bloodType:
    | 'A_POSITIVE'
    | 'A_NEGATIVE'
    | 'B_POSITIVE'
    | 'B_NEGATIVE'
    | 'AB_POSITIVE'
    | 'AB_NEGATIVE'
    | 'O_POSITIVE'
    | 'O_NEGATIVE'
  allergies: string[]
}

/**
 * Filtros para pacientes.
 */
export interface PatientFilters {
  search: string
  gender: string
  bloodType: string
  location: string
  minAge: number | null
  maxAge: number | null
  hasAllergies: boolean | null
}

/**
 * Análisis de pacientes.
 */
export interface PatientAnalytics {
  registrationTrend: Array<{
    date: string
    count: number
  }>
  genderDistribution: Array<{
    gender: string
    count: number
    percentage: number
  }>
  bloodTypeDistribution: Array<{
    bloodType: string
    count: number
    percentage: number
  }>
  ageDistribution: Array<{
    range: string
    count: number
  }>
  topAllergies: Array<{
    allergy: string
    count: number
  }>
  appointmentFrequency: Array<{
    patientId: string
    name: string
    appointments: number
  }>
}

/**
 * Información de contacto de emergencia.
 */
export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
  email?: string
}

/**
 * Historial médico resumido.
 */
export interface MedicalHistory {
  id: string
  recordType: string
  title: string
  date: string
  status: string
  doctor?: {
    name: string
    specialty: string
  }
}

/**
 * Cita resumida.
 */
export interface AppointmentSummary {
  id: string
  date: string
  status: string
  type: string
  doctor?: {
    name: string
    specialty: string
  }
  clinic?: {
    name: string
    address: string
  }
}

// ========================
// Constantes
// ========================

export const BLOOD_TYPES = [
  'A_POSITIVE',
  'A_NEGATIVE',
  'B_POSITIVE',
  'B_NEGATIVE',
  'AB_POSITIVE',
  'AB_NEGATIVE',
  'O_POSITIVE',
  'O_NEGATIVE',
] as const

export const GENDERS = ['MALE', 'FEMALE'] as const

export const AGE_GROUPS = [
  { label: '0-17 años', min: 0, max: 17 },
  { label: '18-30 años', min: 18, max: 30 },
  { label: '31-50 años', min: 31, max: 50 },
  { label: '51-65 años', min: 51, max: 65 },
  { label: '65+ años', min: 65, max: 120 },
]

// ========================
// Utilidades
// ========================

/**
 * Calcular edad a partir de fecha de nacimiento.
 */
export const calculateAge = (birthDate: string): number => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

/**
 * Obtener grupo de edad.
 */
export const getAgeGroup = (age: number): string => {
  const group = AGE_GROUPS.find((g) => age >= g.min && age <= g.max)
  return group ? group.label : 'Desconocido'
}

/**
 * Formatear tipo de sangre para mostrar.
 */
export const formatBloodType = (bloodType: string): string => {
  const mapping: Record<string, string> = {
    A_POSITIVE: 'A+',
    A_NEGATIVE: 'A-',
    B_POSITIVE: 'B+',
    B_NEGATIVE: 'B-',
    AB_POSITIVE: 'AB+',
    AB_NEGATIVE: 'AB-',
    O_POSITIVE: 'O+',
    O_NEGATIVE: 'O-',
  }
  return mapping[bloodType] || bloodType
}

/**
 * Formatear género para mostrar.
 */
export const formatGender = (gender: string): string => {
  return gender === 'MALE' ? 'Masculino' : 'Femenino'
}
