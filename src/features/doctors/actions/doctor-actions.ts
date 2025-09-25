'use server'

import { revalidatePath } from 'next/cache'
import { serverApi, type ServerApiResponse } from '@/lib/api/server-client'
import {
  Doctor,
  CreateDoctorData,
  UpdateDoctorData,
  QueryDoctorsParams,
  PaginatedDoctorsResponse,
  CreateDoctorResponse,
  DoctorStats,
} from '../types'

// ==============================================
// Server Actions con Auto-Refresh Centralizado
// ==============================================

// ===================================
// Acciones para Componentes de Servidor
// ===================================

/**
 * Obtener lista paginada de doctores con filtros.
 */
export async function getDoctors(
  params: QueryDoctorsParams
): Promise<ServerApiResponse<PaginatedDoctorsResponse>> {
  // Construir parámetros de query manualmente
  const queryParams = new URLSearchParams()

  if (params.page !== undefined) queryParams.set('page', String(params.page))
  if (params.limit !== undefined) queryParams.set('limit', String(params.limit))
  if (params.search) queryParams.set('search', params.search)
  if (params.specialtyId) queryParams.set('specialtyId', params.specialtyId)
  if (params.location) queryParams.set('location', params.location)
  if (params.includeAvailability !== undefined)
    queryParams.set('includeAvailability', String(params.includeAvailability))
  if (params.includeSpecialties !== undefined)
    queryParams.set('includeSpecialties', String(params.includeSpecialties))
  if (params.sortByFee) queryParams.set('sortByFee', params.sortByFee)

  const queryString = queryParams.toString()
  const url = `/doctors${queryString ? `?${queryString}` : ''}`

  return serverApi.get<PaginatedDoctorsResponse>(url)
}

/**
 * Obtener todos los doctores (sin paginación).
 */
export async function getAllDoctors(): Promise<ServerApiResponse<Doctor[]>> {
  return serverApi.get<Doctor[]>('/doctors/all')
}

/**
 * Obtener un doctor específico por ID.
 */
export async function getDoctorById(
  id: string
): Promise<ServerApiResponse<Doctor>> {
  return serverApi.get<Doctor>(`/doctors/${id}`)
}

/**
 * Obtener estadísticas de doctores.
 */
export async function getDoctorStats(): Promise<
  ServerApiResponse<DoctorStats>
> {
  console.log('🔍 Calling doctor stats endpoint: /doctors/stats')

  const result = await serverApi.get<DoctorStats>('/doctors/stats')

  console.log('📊 Doctor stats response:', {
    success: result.success,
    hasData: !!result.data,
    error: result.error,
  })

  return result
}

// ===================================
// Acciones para Componentes de Cliente (Mutaciones)
// ===================================

/**
 * Crear un nuevo doctor (solo administradores).
 */
export async function createDoctorAction(
  data: CreateDoctorData
): Promise<ServerApiResponse<CreateDoctorResponse>> {
  console.log('🆕 Creating new doctor:', {
    email: data.email,
    firstName: data.firstName,
    specialtyIds: data.specialtyIds?.length || 0,
    clinicIds: data.clinicIds?.length || 0,
  })

  // Ahora el backend soporta specialtyIds y clinicIds directamente
  const result = await serverApi.post<CreateDoctorResponse>(
    '/auth/create-doctor',
    data
  )

  if (result.success) {
    console.log('✅ Doctor created successfully with specialties and clinics')
    revalidatePath('/(dashboard)/doctors')
  } else {
    console.error('❌ Failed to create doctor:', result.error)
  }

  return result
}

/**
 * Actualizar un doctor existente.
 */
export async function updateDoctorAction(
  id: string,
  data: UpdateDoctorData
): Promise<ServerApiResponse<Doctor>> {
  const result = await serverApi.patch<Doctor>(`/doctors/${id}`, data)

  if (result.success) {
    revalidatePath('/(dashboard)/doctors')
  }

  return result
}

/**
 * Eliminar un doctor.
 */
export async function deleteDoctorAction(
  id: string
): Promise<ServerApiResponse<null>> {
  const result = await serverApi.delete<null>(`/doctors/${id}`)

  if (result.success) {
    revalidatePath('/(dashboard)/doctors')
  }

  return result
}

/**
 * Cambiar el estado activo/inactivo de un doctor.
 */
export async function toggleDoctorStatusAction(
  id: string
): Promise<ServerApiResponse<Doctor>> {
  const result = await serverApi.patch<Doctor>(
    `/doctors/${id}/toggle-status`,
    {}
  )

  if (result.success) {
    revalidatePath('/(dashboard)/doctors')
  }

  return result
}

// ===================================
// Acciones para Búsqueda y Filtros
// ===================================

/**
 * Buscar doctores por término de búsqueda.
 */
export async function searchDoctorsAction(
  query: string
): Promise<ServerApiResponse<Doctor[]>> {
  return serverApi.get<Doctor[]>(
    `/doctors/search?q=${encodeURIComponent(query)}`
  )
}

/**
 * Obtener doctores por especialidad.
 */
export async function getDoctorsBySpecialtyAction(
  specialtyId: string
): Promise<ServerApiResponse<Doctor[]>> {
  return serverApi.get<Doctor[]>(`/doctors/by-specialty/${specialtyId}`)
}

/**
 * Obtener doctores por ubicación.
 */
export async function getDoctorsByLocationAction(
  location: string
): Promise<ServerApiResponse<Doctor[]>> {
  return serverApi.get<Doctor[]>(
    `/doctors/by-location?location=${encodeURIComponent(location)}`
  )
}

// ===================================
// Acciones para Disponibilidad
// ===================================

/**
 * Obtener disponibilidad de un doctor.
 */
export async function getDoctorAvailabilityAction(
  doctorId: string
): Promise<ServerApiResponse<Record<string, unknown>>> {
  return serverApi.get<Record<string, unknown>>(
    `/doctors/${doctorId}/availability`
  )
}

/**
 * Actualizar disponibilidad de un doctor.
 */
export async function updateDoctorAvailabilityAction(
  doctorId: string,
  availability: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
    isAvailable: boolean
  }>
): Promise<ServerApiResponse<Record<string, unknown>>> {
  const result = await serverApi.patch<Record<string, unknown>>(
    `/doctors/${doctorId}/availability`,
    availability
  )

  if (result.success) {
    revalidatePath('/(dashboard)/doctors')
  }

  return result
}

// ===================================
// Acciones para Especialidades
// ===================================

/**
 * Asignar especialidades a un doctor.
 */
export async function assignSpecialtiesAction(
  doctorId: string,
  specialtyIds: string[]
): Promise<ServerApiResponse<Doctor>> {
  const result = await serverApi.post<Doctor>(
    `/doctors/${doctorId}/specialties`,
    { specialtyIds }
  )

  if (result.success) {
    revalidatePath('/(dashboard)/doctors')
  }

  return result
}

/**
 * Remover especialidades de un doctor.
 */
export async function removeSpecialtiesAction(
  doctorId: string,
  specialtyIds: string[]
): Promise<ServerApiResponse<Doctor>> {
  const result = await serverApi.delete<Doctor>(
    `/doctors/${doctorId}/specialties?specialtyIds=${specialtyIds.join(',')}`
  )

  if (result.success) {
    revalidatePath('/(dashboard)/doctors')
  }

  return result
}
