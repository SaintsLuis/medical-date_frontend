'use server'

import { revalidatePath } from 'next/cache'
import { serverApi } from '@/lib/api/server-client'
import type {
  Appointment,
  BackendAppointment,
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
  ServerApiResponse,
} from '../types'

// ==============================================
// Mappers - Backend to Frontend
// ==============================================

const mapBackendAppointment = (
  backendAppointment: BackendAppointment
): Appointment => {
  return {
    id: backendAppointment.id,
    patientId: backendAppointment.patientId,
    doctorId: backendAppointment.doctorId,
    date: backendAppointment.date,
    duration: backendAppointment.duration,
    type: backendAppointment.type,
    status: backendAppointment.status,
    notes: backendAppointment.notes,
    videoLink: backendAppointment.videoLink,
    meetingId: backendAppointment.meetingId,
    meetingPassword: backendAppointment.meetingPassword,
    price: backendAppointment.price,
    reminderSent: backendAppointment.reminderSent,
    confirmationSent: backendAppointment.confirmationSent,
    cancelledReason: backendAppointment.cancelledReason,
    rescheduleCount: backendAppointment.rescheduleCount,
    isRecurring: backendAppointment.isRecurring,
    recurringPattern: backendAppointment.recurringPattern as
      | 'DAILY'
      | 'WEEKLY'
      | 'BIWEEKLY'
      | 'MONTHLY'
      | 'QUARTERLY'
      | undefined,
    parentAppointmentId: backendAppointment.parentAppointmentId,
    createdBy: backendAppointment.createdBy,
    updatedBy: backendAppointment.updatedBy,
    source: backendAppointment.source as 'web' | 'mobile' | 'admin' | undefined,
    deletedAt: backendAppointment.deletedAt,
    createdAt: backendAppointment.createdAt,
    updatedAt: backendAppointment.updatedAt,
    patient: backendAppointment.patient,
    doctor: backendAppointment.doctor,
  }
}

const mapBackendPaginatedResponse = (
  response: BackendPaginatedAppointmentsResponse
): PaginatedAppointmentsResponse => {
  return {
    data: response.data.map(mapBackendAppointment),
    meta: response.meta,
  }
}

const mapBackendDoctorAvailability = (
  response: BackendDoctorAvailabilityResponse
): DoctorAvailabilityResponse => {
  return {
    doctorId: response.doctorId,
    date: response.date,
    timeSlots: response.timeSlots.map((slot) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
      appointmentId: slot.appointmentId,
      appointmentStatus: slot.appointmentStatus as
        | 'SCHEDULED'
        | 'CONFIRMED'
        | 'CANCELLED'
        | 'COMPLETED'
        | 'NO_SHOW'
        | undefined,
    })),
    totalAvailableSlots: response.totalAvailableSlots,
    totalBookedSlots: response.totalBookedSlots,
    workingHours: response.workingHours,
    timeZone: response.timeZone,
  }
}

const mapBackendAppointmentStats = (
  response: BackendAppointmentStats
): AppointmentStats => {
  return {
    total: response.total,
    scheduled: response.scheduled,
    confirmed: response.confirmed,
    completed: response.completed,
    cancelled: response.cancelled,
    noShow: response.noShow,
    virtual: response.virtual,
    inPerson: response.inPerson,
    today: response.today,
    thisWeek: response.thisWeek,
    thisMonth: response.thisMonth,
    byStatus: response.byStatus.map((item) => ({
      status: item.status as
        | 'SCHEDULED'
        | 'CONFIRMED'
        | 'CANCELLED'
        | 'COMPLETED'
        | 'NO_SHOW',
      count: item.count,
      percentage: item.percentage,
    })),
    byType: response.byType.map((item) => ({
      type: item.type as 'VIRTUAL' | 'IN_PERSON',
      count: item.count,
      percentage: item.percentage,
    })),
    byDoctor: response.byDoctor,
    bySpecialty: response.bySpecialty,
  }
}

// ==============================================
// Server Actions - Appointments CRUD
// ==============================================

export async function getAppointments(
  params: QueryAppointmentsParams = {}
): Promise<ServerApiResponse<PaginatedAppointmentsResponse>> {
  try {
    const searchParams = new URLSearchParams()

    // Agregar parámetros de consulta
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.patientId) searchParams.append('patientId', params.patientId)
    if (params.doctorId) searchParams.append('doctorId', params.doctorId)
    if (params.status) searchParams.append('status', params.status)
    if (params.type) searchParams.append('type', params.type)
    if (params.startDate) searchParams.append('startDate', params.startDate)
    if (params.endDate) searchParams.append('endDate', params.endDate)
    if (params.todayOnly) searchParams.append('todayOnly', 'true')
    if (params.includePatient !== undefined)
      searchParams.append('includePatient', params.includePatient.toString())
    if (params.includeDoctor !== undefined)
      searchParams.append('includeDoctor', params.includeDoctor.toString())
    if (params.includeInvoice !== undefined)
      searchParams.append('includeInvoice', params.includeInvoice.toString())
    if (params.sortByDate) searchParams.append('sortByDate', params.sortByDate)
    if (params.thisWeekOnly) searchParams.append('thisWeekOnly', 'true')

    const url = `/appointments?${searchParams.toString()}`
    const response = await serverApi.get<BackendPaginatedAppointmentsResponse>(
      url
    )

    if (response.success && response.data) {
      return {
        success: true,
        data: mapBackendPaginatedResponse(response.data),
      }
    }

    return {
      success: false,
      error: response.error || 'Error al obtener citas',
    }
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return {
      success: false,
      error: 'Error al obtener citas',
    }
  }
}

export async function getAppointmentById(
  id: string
): Promise<ServerApiResponse<Appointment>> {
  try {
    const response = await serverApi.get<BackendAppointment>(
      `/appointments/${id}`
    )

    if (response.success && response.data) {
      return {
        success: true,
        data: mapBackendAppointment(response.data),
      }
    }

    return {
      success: false,
      error: response.error || 'Error al obtener cita',
    }
  } catch (error) {
    console.error('Error fetching appointment:', error)
    return {
      success: false,
      error: 'Error al obtener cita',
    }
  }
}

export async function createAppointmentAction(
  data: CreateAppointmentData
): Promise<ServerApiResponse<CreateAppointmentResponse>> {
  try {
    const response = await serverApi.post<CreateAppointmentResponse>(
      '/appointments',
      data
    )

    if (response.success) {
      revalidatePath('/(dashboard)/appointments')
    }

    return {
      success: response.success,
      data: response.data,
      error: response.error || undefined,
    }
  } catch (error) {
    console.error('Error creating appointment:', error)
    return {
      success: false,
      error: 'Error al crear cita',
    }
  }
}

export async function updateAppointmentAction(
  id: string,
  data: UpdateAppointmentData
): Promise<ServerApiResponse<Appointment>> {
  try {
    const response = await serverApi.patch<BackendAppointment>(
      `/appointments/${id}`,
      data
    )

    if (response.success) {
      revalidatePath('/(dashboard)/appointments')
      revalidatePath(`/(dashboard)/appointments/${id}`)
    }

    if (response.success && response.data) {
      return {
        success: true,
        data: mapBackendAppointment(response.data),
      }
    }

    return {
      success: false,
      error: response.error || 'Error al actualizar cita',
    }
  } catch (error) {
    console.error('Error updating appointment:', error)
    return {
      success: false,
      error: 'Error al actualizar cita',
    }
  }
}

export async function cancelAppointmentAction(
  id: string,
  reason?: string
): Promise<ServerApiResponse<Appointment>> {
  try {
    const updateData: UpdateAppointmentData = {
      status: 'CANCELLED',
      cancelledReason: reason,
    }

    const response = await serverApi.patch<BackendAppointment>(
      `/appointments/${id}`,
      updateData
    )

    if (response.success) {
      revalidatePath('/(dashboard)/appointments')
      revalidatePath(`/(dashboard)/appointments/${id}`)
    }

    if (response.success && response.data) {
      return {
        success: true,
        data: mapBackendAppointment(response.data),
      }
    }

    return {
      success: false,
      error: response.error || 'Error al cancelar cita',
    }
  } catch (error) {
    console.error('Error cancelling appointment:', error)
    return {
      success: false,
      error: 'Error al cancelar cita',
    }
  }
}

export async function getDoctorAvailabilityAction(
  params: QueryDoctorAvailabilityParams
): Promise<ServerApiResponse<DoctorAvailabilityResponse>> {
  try {
    const searchParams = new URLSearchParams()
    searchParams.append('date', params.date)
    if (params.duration)
      searchParams.append('duration', params.duration.toString())

    const url = `/appointments/availability/${
      params.doctorId
    }?${searchParams.toString()}`
    const response = await serverApi.get<BackendDoctorAvailabilityResponse>(url)

    if (response.success && response.data) {
      return {
        success: true,
        data: mapBackendDoctorAvailability(response.data),
      }
    }

    return {
      success: false,
      error: response.error || 'Error al obtener disponibilidad',
    }
  } catch (error) {
    console.error('Error fetching doctor availability:', error)
    return {
      success: false,
      error: 'Error al obtener disponibilidad',
    }
  }
}

export async function getAppointmentStatsAction(): Promise<
  ServerApiResponse<AppointmentStats>
> {
  try {
    const response = await serverApi.get<BackendAppointmentStats>(
      '/appointments/stats'
    )

    if (response.success && response.data) {
      return {
        success: true,
        data: mapBackendAppointmentStats(response.data),
      }
    }

    return {
      success: false,
      error: response.error || 'Error al obtener estadísticas',
    }
  } catch (error) {
    console.error('Error fetching appointment stats:', error)
    return {
      success: false,
      error: 'Error al obtener estadísticas',
    }
  }
}

// ==============================================
// Testing & Maintenance Actions
// ==============================================

export async function sendRemindersManuallyAction(): Promise<
  ServerApiResponse<{ message: string }>
> {
  try {
    const response = await serverApi.post<{ message: string }>(
      '/appointments/test/send-reminders',
      {}
    )
    return {
      success: response.success,
      data: response.data,
      error: response.error || undefined,
    }
  } catch (error) {
    console.error('Error sending reminders:', error)
    return {
      success: false,
      error: 'Error al enviar recordatorios',
    }
  }
}

export async function sendDailyRemindersAction(): Promise<
  ServerApiResponse<{ message: string }>
> {
  try {
    const response = await serverApi.post<{ message: string }>(
      '/appointments/test/send-daily-reminders',
      {}
    )
    return {
      success: response.success,
      data: response.data,
      error: response.error || undefined,
    }
  } catch (error) {
    console.error('Error sending daily reminders:', error)
    return {
      success: false,
      error: 'Error al enviar recordatorios diarios',
    }
  }
}

export async function sendVirtualRemindersAction(): Promise<
  ServerApiResponse<{ message: string }>
> {
  try {
    const response = await serverApi.post<{ message: string }>(
      '/appointments/test/send-virtual-reminders',
      {}
    )
    return {
      success: response.success,
      data: response.data,
      error: response.error || undefined,
    }
  } catch (error) {
    console.error('Error sending virtual reminders:', error)
    return {
      success: false,
      error: 'Error al enviar recordatorios virtuales',
    }
  }
}

export async function cleanupOldAppointmentsAction(): Promise<
  ServerApiResponse<{ message: string }>
> {
  try {
    const response = await serverApi.post<{ message: string }>(
      '/appointments/test/cleanup-old',
      {}
    )
    return {
      success: response.success,
      data: response.data,
      error: response.error || undefined,
    }
  } catch (error) {
    console.error('Error cleaning up old appointments:', error)
    return {
      success: false,
      error: 'Error al limpiar citas antiguas',
    }
  }
}
