// ===================================
// Specialties Feature Exports
// ===================================

// Types
export type {
  Specialty,
  SpecialtyWithDoctors,
  CreateSpecialtyData,
  UpdateSpecialtyData,
  QuerySpecialtiesParams,
  PaginatedSpecialtiesResponse,
  SpecialtyStats,
} from './types'

// Actions (Server-side)
export {
  getSpecialties,
  getAllActiveSpecialties,
  getSpecialtyById,
  getSpecialtyStats,
  createSpecialtyAction,
  updateSpecialtyAction,
  deleteSpecialtyAction,
} from './actions/specialty-actions'

// Hooks (Client-side)
export {
  useSpecialties,
  useAllActiveSpecialties,
  useSpecialty,
  useSpecialtyStats,
  useCreateSpecialty,
  useUpdateSpecialty,
  useDeleteSpecialty,
  specialtyKeys,
} from './hooks/use-specialties'

// Components
export { SpecialtyForm } from './components/specialty-form'
export { SpecialtiesManagement } from './components/specialties-management'
export { SpecialtiesSkeleton } from './components/specialties-skeleton'
export { SpecialtyCharts } from './components/specialty-charts'

// Constants
export { SPECIALTY_VALIDATION } from './types'
