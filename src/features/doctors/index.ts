// ==============================================
// Exports del Módulo de Doctores
// ==============================================

// Componentes
export { DoctorsManagement } from './components/doctors-management'
export { DoctorForm } from './components/doctor-form'
export { DoctorsSkeleton } from './components/doctors-skeleton'

// Hooks
export {
  useDoctors,
  useAllDoctors,
  useDoctor,
  useDoctorStats,
  useDoctorSearch,
  useDoctorsBySpecialty,
  useDoctorsByLocation,
  useCreateDoctor,
  useUpdateDoctor,
  useDeleteDoctor,
  useToggleDoctorStatus,
  usePrefetchDoctor,
  useDoctorManagement,
} from './hooks/use-doctors'

// Actions
export {
  getDoctors,
  getAllDoctors,
  getDoctorById,
  getDoctorStats,
  createDoctorAction,
  updateDoctorAction,
  deleteDoctorAction,
  toggleDoctorStatusAction,
  searchDoctorsAction,
  getDoctorsBySpecialtyAction,
  getDoctorsByLocationAction,
  getDoctorAvailabilityAction,
  updateDoctorAvailabilityAction,
  assignSpecialtiesAction,
  removeSpecialtiesAction,
} from './actions/doctor-actions'

// Tipos
export type {
  Doctor,
  DoctorWithDetails,
  CreateDoctorData,
  UpdateDoctorData,
  QueryDoctorsParams,
  PaginatedDoctorsResponse,
  CreateDoctorResponse,
  DoctorStats,
  DoctorFormData,
  DoctorFilters,
  DoctorAnalytics,
  DoctorAvailability,
  AvailabilitySchedule,
  DoctorSpecialty,
} from './types'

export {
  DOCTOR_FORM_DEFAULTS,
  DOCTOR_VALIDATION,
  DOCTOR_FILTER_DEFAULTS,
} from './types'
