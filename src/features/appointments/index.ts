// ==============================================
// Exportaciones de Tipos
// ==============================================

export type {
  Appointment,
  BackendAppointment,
  AppointmentType,
  AppointmentStatus,
  PaymentStatus,
  PaymentMethod,
  CreateAppointmentData,
  UpdateAppointmentData,
  QueryAppointmentsParams,
  QueryDoctorAvailabilityParams,
  PaginatedAppointmentsResponse,
  BackendPaginatedAppointmentsResponse,
  DoctorAvailabilityResponse,
  BackendDoctorAvailabilityResponse,
  AppointmentStats,
  BackendAppointmentStats,
  CreateAppointmentResponse,
  CancelAppointmentResponse,
  ServerApiResponse,
  TimeSlot,
  AppointmentFormData,
  AppointmentFilters,
  AppointmentAnalytics,
} from './types'

// ==============================================
// Exportaciones de Constantes
// ==============================================

export {
  APPOINTMENT_DURATIONS,
  APPOINTMENT_TYPES,
  APPOINTMENT_STATUSES,
  RECURRING_PATTERNS,
  getStatusColor,
  getStatusText,
  getTypeText,
  getTypeIcon,
  formatAppointmentDate,
  formatAppointmentTime,
  formatAppointmentDateTime,
  isAppointmentToday,
  isAppointmentPast,
  canCancelAppointment,
  canRescheduleAppointment,
  getAppointmentDurationText,
} from './types'

// ==============================================
// Exportaciones de Acciones
// ==============================================

export {
  getAppointments,
  getAppointmentById,
  createAppointmentAction,
  updateAppointmentAction,
  cancelAppointmentAction,
  getDoctorAvailabilityAction,
  getAppointmentStatsAction,
  sendRemindersManuallyAction,
  sendDailyRemindersAction,
  sendVirtualRemindersAction,
  cleanupOldAppointmentsAction,
} from './actions/appointment-actions'

// ==============================================
// Exportaciones de Hooks
// ==============================================

export {
  useAppointments,
  useAppointment,
  useDoctorAvailability,
  useAppointmentStats,
  useCreateAppointment,
  useUpdateAppointment,
  useCancelAppointment,
  useAppointmentsByStatus,
  useAppointmentsByDoctor,
  useAppointmentsByPatient,
  useTodayAppointments,
  useUpcomingAppointments,
  usePastAppointments,
  useAppointmentManagement,
  usePrefetchAppointment,
  usePrefetchDoctorAvailability,
  useAppointmentSearch,
  useAppointmentsByDateRange,
  useAppointmentAnalytics,
  useAppointmentTrends,
} from './hooks/use-appointments'

// ==============================================
// Exportaciones de Componentes
// ==============================================

export { AppointmentsList } from './components/appointments-list'
export { AppointmentsTable } from './components/appointments-table'
