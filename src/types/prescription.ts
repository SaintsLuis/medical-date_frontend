export interface Prescription {
  id: string
  patientId: string
  doctorId: string
  appointmentId?: string
  medicationName: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  instructions: string
  refills: number
  refillsRemaining: number
  patient: {
    id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    profilePhoto?: string
  }
  doctor: {
    id: string
    firstName: string
    lastName: string
    specialty: string
    licenseNumber: string
  }
  status: 'ACTIVE' | 'FILLED' | 'CANCELLED' | 'EXPIRED'
  prescribedDate: string
  expiryDate?: string
  lastFilledDate?: string
  pharmacy?: {
    id: string
    name: string
    address: string
    phone: string
  }
  notes?: string
  isGeneric: boolean
  cost?: number
  currency?: string
  createdAt: string
  updatedAt: string
}

export interface PrescriptionMetrics {
  totalPrescriptions: number
  activePrescriptions: number
  expiredPrescriptions: number
  filledPrescriptions: number
  prescriptionsThisMonth: number
  topMedications: Array<{
    medication: string
    count: number
  }>
  prescriptionsByStatus: Record<string, number>
  prescriptionsBySpecialty: Array<{
    specialty: string
    count: number
  }>
}

export interface PrescriptionFilters {
  search?: string
  status?: string
  patientId?: string
  doctorId?: string
  medicationName?: string
  dateRange?: {
    start: string
    end: string
  }
  isGeneric?: boolean
  hasRefills?: boolean
}

export interface CreatePrescriptionData {
  patientId: string
  doctorId: string
  appointmentId?: string
  medicationName: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  instructions: string
  refills: number
  expiryDate?: string
  notes?: string
  isGeneric: boolean
}

export interface UpdatePrescriptionData
  extends Partial<CreatePrescriptionData> {
  id: string
}
