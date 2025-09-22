// Componentes
export { ClinicForm } from './components/clinic-form'
export { ClinicsManagement } from './components/clinics-management'
export { ClinicsSkeletion } from './components/clinics-skeleton'

// Hooks
export {
  useClinics,
  useAllActiveClinics,
  useCreateClinic,
  useUpdateClinic,
  useDeleteClinic,
  useClinicStats,
  useClinicActions,
  clinicKeys,
} from './hooks/use-clinics'

// Acciones
export {
  getClinics,
  getAllClinics,
  getAllActiveClinics,
  getClinicById,
  getClinicStats,
  createClinicAction,
  updateClinicAction,
  deleteClinicAction,
  toggleClinicStatusAction,
  searchClinicsAction,
  getClinicsByLocationAction,
  getClinicsByCityAction,
  getClinicsByServicesAction,
  getClinicsByAmenitiesAction,
  getClinicsNearbyAction,
  assignDoctorsToClinicAction,
  removeDoctorsFromClinicAction,
  updateClinicWorkingHoursAction,
  getClinicAvailabilityAction,
  updateClinicServicesAction,
  updateClinicAmenitiesAction,
  getClinicAnalyticsAction,
  getClinicsPerformanceReportAction,
  exportClinicsAction,
  uploadClinicProfilePhotoAction,
  deleteClinicProfilePhotoAction,
} from './actions/clinic-actions'

// Tipos
export type {
  Clinic,
  ClinicWithDetails,
  CreateClinicData,
  UpdateClinicData,
  QueryClinicsParams,
  PaginatedClinicsResponse,
  CreateClinicResponse,
  BackendClinicStats,
  ClinicStats,
  ClinicFormData,
  ClinicFilters,
  ClinicAnalytics,
  WorkingDay,
  WeeklySchedule,
} from './types'

// Constantes y utilidades
export {
  CLINIC_FORM_DEFAULTS,
  CLINIC_VALIDATION,
  COMMON_CLINIC_SERVICES,
  COMMON_CLINIC_AMENITIES,
  formatWorkingHours,
  calculateDistance,
  isClinicOpen,
  formatAddress,
  validateCoordinates,
} from './types'
