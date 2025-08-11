// ==============================================
// Exports del Módulo de Secretarias
// ==============================================

// Components
export { SecretaryForm } from './components/secretary-form'
export { SecretariesManagement } from './components/secretaries-management'
export { SecretariesSkeleton } from './components/secretaries-skeleton'

// Actions
export {
  getSecretaries,
  getAllSecretaries,
  getSecretaryById,
  getSecretaryStats,
  createSecretaryAction,
  updateSecretaryAction,
  deleteSecretaryAction,
  toggleSecretaryStatusAction,
  assignDoctorsToSecretaryAction,
  unassignDoctorFromSecretaryAction,
  searchSecretariesAction,
  getSecretariesByDoctorAction,
  getAvailableSecretariesAction,
} from './actions/secretary-actions'

// Hooks
export {
  useSecretaries,
  useAllSecretaries,
  useSecretary,
  useSecretaryStats,
  useSecretarySearch,
  useSecretariesByDoctor,
  useAvailableSecretaries,
  useCreateSecretary,
  useUpdateSecretary,
  useDeleteSecretary,
  useToggleSecretaryStatus,
  useAssignDoctorsToSecretary,
  useUnassignDoctorFromSecretary,
  usePrefetchSecretary,
  useSecretaryManagement,
} from './hooks/use-secretaries'

// Types
export type {
  Secretary,
  SecretaryWithDetails,
  CreateSecretaryData,
  UpdateSecretaryData,
  QuerySecretariesParams,
  PaginatedSecretariesResponse,
  BackendSecretaryStats,
  SecretaryStats,
  SecretaryFormData,
  SecretaryFilters,
  SecretaryAnalytics,
  WorkScheduleType,
} from './types'

export {
  SECRETARY_FORM_DEFAULTS,
  SECRETARY_VALIDATION,
  secretaryFormSchema,
  SECRETARY_FILTER_DEFAULTS,
  WORK_SCHEDULE_OPTIONS,
} from './types'
