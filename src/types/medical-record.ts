// types/medical-record.ts
export enum MedicalRecordCategory {
  CONSULTATION = 'CONSULTATION',
  EMERGENCY = 'EMERGENCY',
  FOLLOW_UP = 'FOLLOW_UP',
  ROUTINE_CHECKUP = 'ROUTINE_CHECKUP',
  SURGERY = 'SURGERY',
  DIAGNOSTIC = 'DIAGNOSTIC',
  EXAMINATION = 'EXAMINATION',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface MedicalRecord {
  id: string
  patientId: string
  doctorId: string
  appointmentId: string
  patient: {
    id: string
    firstName: string
    lastName: string
    dateOfBirth?: string
    profilePhoto?: string
  }
  doctor: {
    id: string
    firstName: string
    lastName: string
    specialty?: string
  }
  recordType:
    | 'CONSULTATION'
    | 'EXAMINATION'
    | 'FOLLOW_UP'
    | 'EMERGENCY'
    | 'SURGERY'
    | 'THERAPY'
  title: string
  description: string
  symptoms: string[]
  diagnosis: string
  treatment: string
  prescriptions: MedicalPrescription[]
  vitalSigns: VitalSigns
  labResults: LabResult[]
  attachments: MedicalFile[]
  followUpDate?: string
  notes: string
  isConfidential: boolean
  status: 'DRAFT' | 'COMPLETED' | 'PENDING' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}

export interface MedicalPrescription {
  id: string
  medicationName: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

export interface VitalSigns {
  bloodPressure: string
  heartRate: string
  temperature: string
  weight: string
  height: string
  respiratoryRate?: string
  oxygenSaturation?: string
}

export interface LabResult {
  testName: string
  result: string
  normalRange: string
  status: 'Normal' | 'High' | 'Low' | 'Critical'
  testDate?: string
  notes?: string
}

export interface MedicalFile {
  id: string
  fileName: string
  fileType: string
  fileSize: string
  uploadedAt: string
  uploadedBy?: string
  category?: string
}

export interface MedicalRecordFilters {
  search?: string
  recordType?: string
  status?: string
  dateRange?: {
    start: string
    end: string
  }
  patientId?: string
  doctorId?: string
  specialty?: string
}

export interface MedicalRecordMetrics {
  totalRecords: number
  recordsThisMonth: number
  pendingRecords: number
  completedRecords: number
  recordsByType: Record<string, number>
  recordsBySpecialty: Array<{
    specialty: string
    count: number
  }>
}

export interface CreateMedicalRecordRequest {
  patientProfileId: string
  appointmentId?: string
  category?: MedicalRecordCategory
  priority?: Priority
  symptoms: string[]
  diagnosis: string
  treatment?: string
  notes?: string
  allergies?: string[]
  followUpDate?: string
  vitalSigns?: Omit<VitalSigns, 'id' | 'medicalRecordId'>
}
