// ==============================================
// Calendario Médico - Exportaciones Principales
// ==============================================

// Componente Principal
export { MedicalCalendar } from './MedicalCalendar'

// Componentes de UI
export { CalendarToolbar } from './CalendarToolbar'
export { AppointmentModal } from './AppointmentModal'
export { ConflictResolver } from './ConflictResolver'
export { DoctorSchedulePanel } from './DoctorSchedulePanel'

// Tipos
export type {
  // Tipos principales
  CalendarView,
  CalendarEvent,
  CalendarResource,
  CalendarFilters,
  CalendarSettings,

  // Tipos de datos
  Doctor,
  Patient,
  TimeSlot,
  DoctorSchedule,
  DoctorAvailabilitySlot,

  // Tipos de props
  MedicalCalendarProps,
  CalendarToolbarProps,
  AppointmentFormProps,
  DoctorScheduleViewProps,

  // Tipos de conflictos y patrones
  AppointmentConflict,
  ConflictAction,
  RecurringAppointmentPattern,
  CalendarNotification,
  NotificationAction,

  // Tipos de estadísticas y análisis
  CalendarStats,
  CalendarTheme,
  CalendarState,
  CalendarOperation,

  // Tipos de API
  CalendarApiResponse,
  AppointmentCreateRequest,
  AppointmentUpdateRequest,
  AvailabilityRequest,

  // Tipos de utilidades
  CalendarEventHandler,
  AppointmentOperationType,
} from './types'

// Utilidades
export {
  // Conversión de datos
  appointmentToCalendarEvent,
  calendarEventToAppointment,

  // Formateo
  formatCalendarDate,
  formatCalendarTime,
  formatAppointmentDuration,
  formatDoctorName,
  formatPatientName,

  // Colores y estilos
  getAppointmentStatusColor,
  getAppointmentTypeColor,
  getDoctorColor,
  getConflictSeverityColor,

  // Tiempo y horarios
  generateTimeSlots,
  getBusinessHours,
  isBusinessHour,
  roundToNearestSlot,

  // Disponibilidad y conflictos
  checkAppointmentConflicts,
  findAvailableSlots,

  // Filtrado y búsqueda
  filterAppointments,
  searchAppointments,

  // Cálculos y estadísticas
  calculateDoctorUtilization,

  // Navegación
  getCalendarDateRange,
  navigateCalendar,

  // Validación
  validateAppointmentTime,

  // Export/Import
  exportCalendarData,

  // Constantes
  DEFAULT_CALENDAR_SETTINGS,
  DEFAULT_CALENDAR_FILTERS,
  MEDICAL_CALENDAR_THEME,
  APPOINTMENT_DURATION_OPTIONS,
  WORKING_HOURS,
} from './utils'

// ==============================================
// Hook de Calendario (si existe)
// ==============================================

// export { useMedicalCalendar } from './hooks/useMedicalCalendar'

// ==============================================
// Ejemplo de Uso
// ==============================================

/*
import { 
  MedicalCalendar, 
  type MedicalCalendarProps,
  DEFAULT_CALENDAR_SETTINGS 
} from '@/features/appointments/components/medical-calendar'

function MyCalendarPage() {
  const calendarProps: MedicalCalendarProps = {
    appointments: [],
    doctors: [],
    patients: [],
    settings: {
      ...DEFAULT_CALENDAR_SETTINGS,
      view: 'week',
      startHour: 8,
      endHour: 18
    },
    onAppointmentCreate: async (appointment) => {
      // Lógica para crear cita
    },
    onAppointmentUpdate: async (id, updates) => {
      // Lógica para actualizar cita
    },
    enableAnimations: true,
    showConflicts: true
  }
  
  return (
    <div className="h-screen">
      <MedicalCalendar {...calendarProps} />
    </div>
  )
}
*/
