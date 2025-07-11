// ==============================================
// Exports del Módulo de Pacientes
// ==============================================

// Componentes
export { PatientsManagement } from './components/patients-management'
export { PatientForm } from './components/patient-form'
export { PatientsSkeleton } from './components/patients-skeleton'

// Hooks
export {
  usePatients,
  useAllPatients,
  usePatient,
  usePatientStats,
  usePatientSearch,
  usePatientsByGender,
  usePatientsByBloodType,
  usePatientsByLocation,
  usePatientsWithAllergies,
  usePatientsByAgeRange,
  usePatientMedicalHistory,
  usePatientAppointments,
  useUpdatePatient,
  useDeletePatient,
  useExportPatients,
  usePatientAnalytics,
  usePatientManagement,
} from './hooks/use-patients'

// Actions
export {
  getPatients,
  getAllPatients,
  getPatientById,
  getPatientStats,
  updatePatientAction,
  deletePatientAction,
  searchPatientsAction,
  getPatientsByGenderAction,
  getPatientsByBloodTypeAction,
  getPatientsByLocationAction,
  getPatientsWithAllergiesAction,
  getPatientsByAgeRangeAction,
  getPatientMedicalHistoryAction,
  getPatientAppointmentsAction,
  exportPatientsAction,
  getPatientAnalyticsAction,
} from './actions/patient-actions'

// Types
export type {
  Patient,
  UpdatePatientData,
  PatientFormData,
  QueryPatientsParams,
  PaginatedPatientsResponse,
  BackendPatientStats,
  PatientStats,
  MedicalHistory,
} from './types'

// Utils
export {
  BLOOD_TYPES,
  GENDERS,
  AGE_GROUPS,
  formatBloodType,
  formatGender,
  calculateAge,
  getAgeGroup,
} from './types'
