// src/features/medical-records/index.ts

// ==============================================
// Components exports
// ==============================================

// Main management component
export { MedicalRecordsManagement } from './components/medical-records-management'

// Form components
export { MedicalRecordForm } from './components/medical-record-form'
// export { VitalSignsForm } from './components/vital-signs-form'

// Display components
export { MedicalRecordDetails } from './components/medical-record-details'
export { MedicalRecordsTable } from './components/medical-records-table'
// export { MedicalRecordsAnalytics } from './components/medical-records-analytics'

// Utility components
export {
  MedicalRecordsSkeleton,
  MedicalRecordFormSkeleton,
  MedicalRecordDetailsSkeleton,
  MedicalRecordTableSkeleton,
} from './components/medical-records-skeleton'

// ==============================================
// Hooks exports
// ==============================================

export {
  useMedicalRecords,
  useMedicalRecord,
  usePatientMedicalRecords,
  usePatientMedicalRecordsByUserId,
  useDoctorMedicalRecords,
  useMyMedicalRecords,
  useFollowUpRecords,
  useDoctorMedicalRecordAnalytics,
  useCreateMedicalRecord,
  useUpdateMedicalRecord,
  useDeleteMedicalRecord,
  usePrefetchMedicalRecord,
  usePrefetchPatientMedicalRecords,
  useMedicalRecordManagement,
  useMedicalRecordSearch,
  medicalRecordKeys,
} from './hooks/use-medical-records'

// ==============================================
// Types exports
// ==============================================

export type {
  MedicalRecord,
  VitalSigns,
  PatientBasicInfo,
  DoctorBasicInfo,
  PatientProfile,
  AppointmentBasicInfo,
  CreateMedicalRecordDto,
  CreateVitalSignsDto,
  UpdateMedicalRecordDto,
  QueryMedicalRecordsParams,
  PaginatedMedicalRecordsResponse,
  MedicalRecordFormData,
  MedicalRecordFilters,
  MedicalRecordStats,
  DoctorMedicalRecordAnalytics,
} from './types'

export {
  MedicalRecordCategory,
  Priority,
  MEDICAL_RECORD_FORM_DEFAULTS,
  MEDICAL_RECORD_FILTER_DEFAULTS,
  getCategoryText,
  getPriorityText,
  getPriorityColor,
  getCategoryColor,
  formatDate,
  formatDateTime,
  isFollowUpOverdue,
  getDaysUntilFollowUp,
  calculateBMI,
  getBMICategory,
  validateVitalSigns,
  mapMedicalRecordFromApi,
  mapVitalSignsFromApi,
} from './types'

// ==============================================
// Actions exports
// ==============================================

export {
  getMedicalRecordsAction,
  getMedicalRecordByIdAction,
  getPatientMedicalRecordsAction,
  getPatientMedicalRecordsByUserIdAction,
  getDoctorMedicalRecordsAction,
  getFollowUpRecordsAction,
  createMedicalRecordAction,
  updateMedicalRecordAction,
  deleteMedicalRecordAction,
  getDoctorMedicalRecordAnalyticsAction,
} from './actions/medical-records-actions'
