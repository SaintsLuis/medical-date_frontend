// ==============================================
// Exports del Módulo de Doctores
// ==============================================

// Components
export { DoctorForm } from './components/doctor-form'
export { DoctorsManagement } from './components/doctors-management'
export { DoctorsSkeleton } from './components/doctors-skeleton'

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
  assignSpecialtiesAction,
  removeSpecialtiesAction,
} from './actions/doctor-actions'

// Hooks
export { useDoctors } from './hooks/use-doctors'
export { useUpdateDoctor } from './hooks/use-doctors'

// Types
export type {
  Doctor,
  CreateDoctorData,
  UpdateDoctorData,
  DoctorFormData,
  QueryDoctorsParams,
  PaginatedDoctorsResponse,
  CreateDoctorResponse,
  DoctorStats,
} from './types'
