// src/features/medical-records/types/index.ts

// ==============================================
// Enums y tipos base
// ==============================================

export enum MedicalRecordCategory {
  CONSULTATION = 'CONSULTATION',
  EMERGENCY = 'EMERGENCY',
  FOLLOW_UP = 'FOLLOW_UP',
  ROUTINE_CHECKUP = 'ROUTINE_CHECKUP',
  SURGERY = 'SURGERY',
  DIAGNOSTIC = 'DIAGNOSTIC',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum MedicalRecordStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  AMENDED = 'AMENDED',
}

// ==============================================
// Interfaces principales
// ==============================================

export interface VitalSigns {
  id: string
  medicalRecordId: string
  bloodPressure?: string
  heartRate?: number
  temperature?: number
  weight?: number
  height?: number
  oxygenSaturation?: number
  respiratoryRate?: number
  bmi?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PatientBasicInfo {
  id: string
  firstName: string
  lastName: string
  email: string
  birthDate?: string
  gender?: string
  bloodType?: string
}

export interface DoctorBasicInfo {
  id: string
  firstName: string
  lastName: string
  email: string
  doctorProfile?: {
    id: string
    license: string
    specialties: Array<{
      specialty: {
        id: string
        name: string
      }
    }>
  }
}

export interface PatientProfile {
  id: string
  userId: string
  birthDate?: string
  gender?: string
  bloodType?: string
  user: PatientBasicInfo
}

export interface AppointmentBasicInfo {
  id: string
  date: string
  duration: number
  type: string
}

export interface MedicalRecord {
  id: string
  patientProfileId: string
  doctorId: string
  date: string
  category?: MedicalRecordCategory
  priority?: Priority
  status: MedicalRecordStatus
  symptoms: string[]
  diagnosis: string
  treatment?: string
  notes?: string
  allergies: string[]
  followUpDate?: string
  appointmentId?: string
  archivedAt?: string
  archivedBy?: string
  archiveReason?: string
  createdAt: string
  updatedAt: string
  // Relaciones
  patientProfile?: PatientProfile
  doctor?: DoctorBasicInfo
  appointment?: AppointmentBasicInfo
  vitalSigns?: VitalSigns
  attachments?: File[]
  // TEMP: Backend sends patient directly instead of patientProfile.user
  patient?: PatientBasicInfo
}

// ==============================================
// DTOs para formularios
// ==============================================

export interface CreateMedicalRecordDto {
  patientProfileId: string
  doctorId: string
  category?: MedicalRecordCategory
  priority?: Priority
  symptoms: string[]
  diagnosis: string
  treatment?: string
  notes?: string
  allergies: string[]
  followUpDate?: string
  appointmentId?: string
  vitalSigns?: CreateVitalSignsDto
}

export interface CreateVitalSignsDto {
  bloodPressure?: string
  heartRate?: number
  temperature?: number
  weight?: number
  height?: number
  oxygenSaturation?: number
  respiratoryRate?: number
  notes?: string
}

export interface UpdateMedicalRecordDto {
  category?: MedicalRecordCategory
  priority?: Priority
  symptoms?: string[]
  diagnosis?: string
  treatment?: string
  notes?: string
  allergies?: string[]
  followUpDate?: string
  vitalSigns?: CreateVitalSignsDto
}

export interface ArchiveMedicalRecordDto {
  reason: string
}

// ==============================================
// Parámetros de consulta
// ==============================================

export interface QueryMedicalRecordsParams {
  page?: number
  limit?: number
  patientProfileId?: string
  doctorId?: string
  category?: MedicalRecordCategory
  priority?: Priority
  startDate?: string
  endDate?: string
  search?: string
  followUpOnly?: boolean
  includePatient?: boolean
  includeDoctor?: boolean
  includeAppointment?: boolean
  includeVitalSigns?: boolean
  includeAttachments?: boolean
}

// ==============================================
// Respuestas paginadas
// ==============================================

export interface PaginatedMedicalRecordsResponse {
  data: MedicalRecord[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// ==============================================
// Formularios
// ==============================================

export interface MedicalRecordFormData {
  patientProfileId: string
  category: MedicalRecordCategory | ''
  priority: Priority | ''
  symptoms: string[]
  diagnosis: string
  treatment: string
  notes: string
  allergies: string[]
  followUpDate: string
  appointmentId: string
  // Signos vitales
  vitalSigns: {
    bloodPressure: string
    heartRate: string
    temperature: string
    weight: string
    height: string
    oxygenSaturation: string
    respiratoryRate: string
    notes: string
  }
}

export interface MedicalRecordFilters {
  patientProfileId: string
  doctorId: string
  category: MedicalRecordCategory | 'ALL'
  priority: Priority | 'ALL'
  startDate: string
  endDate: string
  search: string
  followUpOnly: boolean
}

// ==============================================
// Analytics y estadísticas
// ==============================================

export interface MedicalRecordStats {
  total: number
  byCategory: Array<{
    category: MedicalRecordCategory
    count: number
  }>
  byPriority: Array<{
    priority: Priority
    count: number
  }>
  recentRecords: number
  followUpsPending: number
  monthlyTrend: Array<{
    month: string
    count: number
  }>
}

export interface DoctorMedicalRecordAnalytics {
  totalRecords: number
  totalPatients: number
  followUpsPending: number
  categoriesDistribution: Array<{
    category: string
    count: number
    percentage: number
  }>
  priorityDistribution: Array<{
    priority: string
    count: number
    percentage: number
  }>
  monthlyActivity: Array<{
    month: string
    records: number
    patients: number
  }>
  topConditions: Array<{
    condition: string
    count: number
  }>
}

// ==============================================
// Constantes y defaults
// ==============================================

export const MEDICAL_RECORD_FORM_DEFAULTS: MedicalRecordFormData = {
  patientProfileId: '',
  category: '',
  priority: '',
  symptoms: [],
  diagnosis: '',
  treatment: '',
  notes: '',
  allergies: [],
  followUpDate: '',
  appointmentId: '',
  vitalSigns: {
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    oxygenSaturation: '',
    respiratoryRate: '',
    notes: '',
  },
}

export const MEDICAL_RECORD_FILTER_DEFAULTS: MedicalRecordFilters = {
  patientProfileId: 'ALL_PATIENTS',
  doctorId: '',
  category: 'ALL',
  priority: 'ALL',
  startDate: '',
  endDate: '',
  search: '',
  followUpOnly: false,
}

// ==============================================
// Utility functions
// ==============================================

export const getCategoryText = (category: MedicalRecordCategory): string => {
  const categoryTexts: Record<MedicalRecordCategory, string> = {
    [MedicalRecordCategory.CONSULTATION]: 'Consulta General',
    [MedicalRecordCategory.EMERGENCY]: 'Emergencia',
    [MedicalRecordCategory.FOLLOW_UP]: 'Seguimiento',
    [MedicalRecordCategory.ROUTINE_CHECKUP]: 'Chequeo de Rutina',
    [MedicalRecordCategory.SURGERY]: 'Cirugía',
    [MedicalRecordCategory.DIAGNOSTIC]: 'Diagnóstico',
  }
  return categoryTexts[category] || category
}

export const getPriorityText = (priority: Priority): string => {
  const priorityTexts: Record<Priority, string> = {
    [Priority.LOW]: 'Baja',
    [Priority.MEDIUM]: 'Media',
    [Priority.HIGH]: 'Alta',
    [Priority.URGENT]: 'Urgente',
  }
  return priorityTexts[priority] || priority
}

export const getPriorityColor = (priority: Priority): string => {
  const priorityColors: Record<Priority, string> = {
    [Priority.LOW]: 'bg-blue-100 text-blue-800',
    [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
    [Priority.HIGH]: 'bg-orange-100 text-orange-800',
    [Priority.URGENT]: 'bg-red-100 text-red-800',
  }
  return priorityColors[priority] || 'bg-gray-100 text-gray-800'
}

export const getStatusText = (status: MedicalRecordStatus): string => {
  const statusTexts: Record<MedicalRecordStatus, string> = {
    [MedicalRecordStatus.ACTIVE]: 'Activo',
    [MedicalRecordStatus.ARCHIVED]: 'Archivado',
    [MedicalRecordStatus.UNDER_REVIEW]: 'En Revisión',
    [MedicalRecordStatus.AMENDED]: 'Enmendado',
  }
  return statusTexts[status] || status
}

export const getStatusColor = (status: MedicalRecordStatus): string => {
  const statusColors: Record<MedicalRecordStatus, string> = {
    [MedicalRecordStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [MedicalRecordStatus.ARCHIVED]: 'bg-gray-100 text-gray-800',
    [MedicalRecordStatus.UNDER_REVIEW]: 'bg-yellow-100 text-yellow-800',
    [MedicalRecordStatus.AMENDED]: 'bg-blue-100 text-blue-800',
  }
  return statusColors[status] || 'bg-gray-100 text-gray-800'
}

export const getCategoryColor = (category: MedicalRecordCategory): string => {
  const categoryColors: Record<MedicalRecordCategory, string> = {
    [MedicalRecordCategory.EMERGENCY]: 'bg-red-100 text-red-800',
    [MedicalRecordCategory.CONSULTATION]: 'bg-green-100 text-green-800',
    [MedicalRecordCategory.FOLLOW_UP]: 'bg-blue-100 text-blue-800',
    [MedicalRecordCategory.ROUTINE_CHECKUP]: 'bg-purple-100 text-purple-800',
    [MedicalRecordCategory.SURGERY]: 'bg-orange-100 text-orange-800',
    [MedicalRecordCategory.DIAGNOSTIC]: 'bg-yellow-100 text-yellow-800',
  }
  return categoryColors[category] || 'bg-gray-100 text-gray-800'
}

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const isFollowUpOverdue = (followUpDate?: string): boolean => {
  if (!followUpDate) return false
  const today = new Date()
  const followUp = new Date(followUpDate)
  return followUp < today
}

export const getDaysUntilFollowUp = (followUpDate?: string): number => {
  if (!followUpDate) return 0
  const today = new Date()
  const followUp = new Date(followUpDate)
  const diffTime = followUp.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const calculateBMI = (
  weight?: number,
  height?: number
): number | null => {
  if (!weight || !height) return null
  const heightInMeters = height / 100
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1))
}

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Bajo peso'
  if (bmi < 25) return 'Peso normal'
  if (bmi < 30) return 'Sobrepeso'
  return 'Obesidad'
}

export const validateVitalSigns = (
  vitalSigns: CreateVitalSignsDto
): string[] => {
  const errors: string[] = []

  if (
    vitalSigns.heartRate &&
    (vitalSigns.heartRate < 30 || vitalSigns.heartRate > 220)
  ) {
    errors.push('La frecuencia cardíaca debe estar entre 30 y 220 lpm')
  }

  if (
    vitalSigns.temperature &&
    (vitalSigns.temperature < 35 || vitalSigns.temperature > 42)
  ) {
    errors.push('La temperatura debe estar entre 35°C y 42°C')
  }

  if (
    vitalSigns.oxygenSaturation &&
    (vitalSigns.oxygenSaturation < 50 || vitalSigns.oxygenSaturation > 100)
  ) {
    errors.push('La saturación de oxígeno debe estar entre 50% y 100%')
  }

  if (vitalSigns.weight && (vitalSigns.weight < 1 || vitalSigns.weight > 500)) {
    errors.push('El peso debe estar entre 1kg y 500kg')
  }

  if (
    vitalSigns.height &&
    (vitalSigns.height < 30 || vitalSigns.height > 250)
  ) {
    errors.push('La altura debe estar entre 30cm y 250cm')
  }

  return errors
}

// ==============================================
// Map functions para transformar datos del API
// ==============================================

export function mapMedicalRecordFromApi(record: unknown): MedicalRecord {
  const rec = record as Record<string, unknown>
  return {
    id: String(rec.id),
    patientProfileId: String(rec.patientProfileId),
    doctorId: String(rec.doctorId),
    date: String(rec.date),
    category: rec.category as MedicalRecordCategory,
    priority: rec.priority as Priority,
    status: (rec.status as MedicalRecordStatus) || MedicalRecordStatus.ACTIVE,
    symptoms: Array.isArray(rec.symptoms) ? (rec.symptoms as string[]) : [],
    diagnosis: String(rec.diagnosis),
    treatment: rec.treatment ? String(rec.treatment) : undefined,
    notes: rec.notes ? String(rec.notes) : undefined,
    allergies: Array.isArray(rec.allergies) ? (rec.allergies as string[]) : [],
    followUpDate: rec.followUpDate ? String(rec.followUpDate) : undefined,
    appointmentId: rec.appointmentId ? String(rec.appointmentId) : undefined,
    archivedAt: rec.archivedAt ? String(rec.archivedAt) : undefined,
    archivedBy: rec.archivedBy ? String(rec.archivedBy) : undefined,
    archiveReason: rec.archiveReason ? String(rec.archiveReason) : undefined,
    createdAt: String(rec.createdAt),
    updatedAt: String(rec.updatedAt),
    patientProfile: rec.patientProfile as PatientProfile,
    doctor: rec.doctor as DoctorBasicInfo,
    appointment: rec.appointment as AppointmentBasicInfo,
    vitalSigns: rec.vitalSigns as VitalSigns,
    attachments: rec.attachments as File[],
  }
}

export function mapVitalSignsFromApi(vitalSigns: unknown): VitalSigns {
  const vs = vitalSigns as Record<string, unknown>
  return {
    id: String(vs.id),
    medicalRecordId: String(vs.medicalRecordId),
    bloodPressure: vs.bloodPressure ? String(vs.bloodPressure) : undefined,
    heartRate: vs.heartRate ? Number(vs.heartRate) : undefined,
    temperature: vs.temperature ? Number(vs.temperature) : undefined,
    weight: vs.weight ? Number(vs.weight) : undefined,
    height: vs.height ? Number(vs.height) : undefined,
    oxygenSaturation: vs.oxygenSaturation
      ? Number(vs.oxygenSaturation)
      : undefined,
    respiratoryRate: vs.respiratoryRate
      ? Number(vs.respiratoryRate)
      : undefined,
    bmi: vs.bmi ? Number(vs.bmi) : undefined,
    notes: vs.notes ? String(vs.notes) : undefined,
    createdAt: String(vs.createdAt),
    updatedAt: String(vs.updatedAt),
  }
}

// ==============================================
// Utility function for blood type formatting
// ==============================================

export const formatBloodType = (bloodType: string): string => {
  const bloodTypeMap: Record<string, string> = {
    A_POSITIVE: 'A+',
    A_NEGATIVE: 'A-',
    B_POSITIVE: 'B+',
    B_NEGATIVE: 'B-',
    AB_POSITIVE: 'AB+',
    AB_NEGATIVE: 'AB-',
    O_POSITIVE: 'O+',
    O_NEGATIVE: 'O-',
  }

  return bloodTypeMap[bloodType] || bloodType
}
