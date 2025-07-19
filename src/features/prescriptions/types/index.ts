// Prescription types based on backend schema - Dominican Republic style (free text)

export interface PrescriptionMedicine {
  id: string
  medicineName: string // Ej: "Amoxicilina", "Acetaminofén", "Ibuprofeno Advil"
  concentration?: string // Ej: "500mg", "250mg/5ml", "200mg"
  form?: string // Ej: "tabletas", "jarabe", "cápsulas", "gotas"
  dosage: string // Ej: "1 tableta", "5ml", "2 cápsulas"
  frequency: string // Ej: "cada 8 horas", "dos veces al día", "cada 12 horas"
  duration: string // Ej: "por 7 días", "por 10 días", "hasta terminar"
  instructions?: string // Ej: "con las comidas", "en ayunas", "antes de dormir"
  quantity?: string // Ej: "30 tabletas", "120ml", "1 frasco"
  createdAt: string
  updatedAt: string
}

export interface Prescription {
  id: string
  medicalRecordId: string
  doctorId: string
  patientId: string
  status: PrescriptionStatus
  validUntil: string
  notes?: string
  appointmentId?: string
  createdAt: string
  updatedAt: string
  medications: PrescriptionMedicine[]
  medicalRecord?: {
    id: string
    date: string
    diagnosis: string
    category?: string
    priority?: string
  }
  appointment?: {
    id: string
    date: string
    type: string
    status: string
  }
  doctor?: {
    id: string
    firstName: string
    lastName: string
    email: string
    doctorProfile?: {
      license: string
      specialties: Array<{
        specialty: {
          id: string
          name: string
        }
      }>
    }
  }
  patient?: {
    id: string
    firstName: string
    lastName: string
    email: string
    patientProfile?: {
      birthDate?: string
      gender?: string
      bloodType?: string
      address?: string
    }
  }
}

export enum PrescriptionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface CreatePrescriptionDto {
  medicalRecordId: string
  doctorId: string
  patientId: string
  status?: PrescriptionStatus
  validUntil: string
  notes?: string
  appointmentId?: string
  medications: Array<{
    medicineName: string
    concentration?: string
    form?: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
    quantity?: string
  }>
}

export interface UpdatePrescriptionDto {
  status?: PrescriptionStatus
  validUntil?: string
  notes?: string
  medications?: Array<{
    medicineName: string
    concentration?: string
    form?: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
    quantity?: string
  }>
}

export interface PrescriptionFilters {
  // Pagination
  page?: number
  pageSize?: number
  // Filters
  status?: PrescriptionStatus | 'ALL'
  doctorId?: string
  patientId?: string
  medicalRecordId?: string
  startDate?: string
  endDate?: string
  search?: string
}

export interface PaginatedPrescriptionsResponse {
  data: Prescription[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}

export const PRESCRIPTION_FILTER_DEFAULTS: PrescriptionFilters = {
  status: 'ALL',
  search: '',
}

// Helper functions
export const getPrescriptionStatusText = (
  status: PrescriptionStatus
): string => {
  const statusMap = {
    [PrescriptionStatus.ACTIVE]: 'Activa',
    [PrescriptionStatus.COMPLETED]: 'Completada',
    [PrescriptionStatus.CANCELLED]: 'Cancelada',
    [PrescriptionStatus.EXPIRED]: 'Expirada',
  }
  return statusMap[status] || status
}

export const getPrescriptionStatusColor = (
  status: PrescriptionStatus
): string => {
  const colorMap = {
    [PrescriptionStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [PrescriptionStatus.COMPLETED]: 'bg-blue-100 text-blue-800',
    [PrescriptionStatus.CANCELLED]: 'bg-red-100 text-red-800',
    [PrescriptionStatus.EXPIRED]: 'bg-yellow-100 text-yellow-800',
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}
