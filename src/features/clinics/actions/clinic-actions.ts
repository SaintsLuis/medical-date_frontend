'use server'

import { revalidatePath } from 'next/cache'
import { serverApi, type ServerApiResponse } from '@/lib/api/server-client'
import {
  Clinic,
  CreateClinicData,
  UpdateClinicData,
  QueryClinicsParams,
  PaginatedClinicsResponse,
  CreateClinicResponse,
  BackendClinicStats,
} from '../types'

// ==============================================
// Server Actions con Auto-Refresh Centralizado
// ==============================================

// ===================================
// Acciones para Componentes de Servidor
// ===================================

/**
 * Obtener lista paginada de clínicas con filtros.
 */
export async function getClinics(
  params: QueryClinicsParams
): Promise<ServerApiResponse<PaginatedClinicsResponse>> {
  // Construir parámetros de query manualmente
  const queryParams = new URLSearchParams()

  if (params.page !== undefined) queryParams.set('page', String(params.page))
  if (params.limit !== undefined) queryParams.set('limit', String(params.limit))
  if (params.search) queryParams.set('search', params.search)
  if (params.location) queryParams.set('location', params.location)
  if (params.city) queryParams.set('city', params.city)
  if (params.isActive !== undefined)
    queryParams.set('isActive', String(params.isActive))
  if (params.hasServices && params.hasServices.length > 0)
    queryParams.set('hasServices', params.hasServices.join(','))
  if (params.hasAmenities && params.hasAmenities.length > 0)
    queryParams.set('hasAmenities', params.hasAmenities.join(','))
  if (params.includeDoctors !== undefined)
    queryParams.set('includeDoctors', String(params.includeDoctors))
  if (params.includeSpecialties !== undefined)
    queryParams.set('includeSpecialties', String(params.includeSpecialties))
  if (params.sortBy) queryParams.set('sortBy', params.sortBy)
  if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder)

  const queryString = queryParams.toString()
  const url = `/clinics${queryString ? `?${queryString}` : ''}`

  return serverApi.get<PaginatedClinicsResponse>(url)
}

/**
 * Obtener todas las clínicas (sin paginación).
 */
export async function getAllClinics(): Promise<ServerApiResponse<Clinic[]>> {
  return serverApi.get<Clinic[]>('/clinics/all')
}

/**
 * Obtener todas las clínicas activas (para dropdowns y selects).
 */
export async function getAllActiveClinics(): Promise<
  ServerApiResponse<Clinic[]>
> {
  return serverApi.get<Clinic[]>('/clinics/all')
}

/**
 * Obtener una clínica específica por ID.
 */
export async function getClinicById(
  id: string
): Promise<ServerApiResponse<Clinic>> {
  return serverApi.get<Clinic>(`/clinics/${id}`)
}

/**
 * Obtener estadísticas de clínicas.
 */
export async function getClinicStats(): Promise<
  ServerApiResponse<BackendClinicStats>
> {
  const result = await serverApi.get<BackendClinicStats>('/clinics/stats')
  return result
}

// ===================================
// Acciones para Componentes de Cliente (Mutaciones)
// ===================================

/**
 * Crear una nueva clínica (solo administradores).
 */
export async function createClinicAction(
  data: CreateClinicData
): Promise<ServerApiResponse<CreateClinicResponse>> {
  const result = await serverApi.post<CreateClinicResponse>('/clinics', data)

  if (result.success) {
    revalidatePath('/(dashboard)/clinics')
  }

  return result
}

/**
 * Actualizar una clínica existente.
 */
export async function updateClinicAction(
  id: string,
  data: UpdateClinicData
): Promise<ServerApiResponse<Clinic>> {
  const result = await serverApi.patch<Clinic>(`/clinics/${id}`, data)

  if (result.success) {
    revalidatePath('/(dashboard)/clinics')
    revalidatePath(`/(dashboard)/clinics/${id}`)
  }

  return result
}

/**
 * Eliminar una clínica.
 */
export async function deleteClinicAction(
  id: string
): Promise<ServerApiResponse<null>> {
  const result = await serverApi.delete<null>(`/clinics/${id}`)

  if (result.success) {
    revalidatePath('/(dashboard)/clinics')
  } else {
    // Provide more specific error handling
    const errorMessage = result.error || 'Error al eliminar la clínica'

    if (
      typeof errorMessage === 'string' &&
      errorMessage.includes('doctores asociados')
    ) {
      throw new Error(
        'No se puede eliminar una clínica que tiene doctores asociados. Primero debe desasociar todos los doctores.'
      )
    } else {
      throw new Error(
        typeof errorMessage === 'string'
          ? errorMessage
          : 'Error al eliminar la clínica. Inténtalo de nuevo.'
      )
    }
  }

  return result
}

/**
 * Cambiar el estado activo/inactivo de una clínica.
 */
export async function toggleClinicStatusAction(
  id: string
): Promise<ServerApiResponse<Clinic>> {
  const result = await serverApi.patch<Clinic>(
    `/clinics/${id}/toggle-status`,
    {}
  )

  if (result.success) {
    revalidatePath('/(dashboard)/clinics')
    revalidatePath(`/(dashboard)/clinics/${id}`)
  }

  return result
}

// ===================================
// Acciones para Búsqueda y Filtros
// ===================================

/**
 * Buscar clínicas por término de búsqueda.
 */
export async function searchClinicsAction(
  query: string
): Promise<ServerApiResponse<Clinic[]>> {
  return serverApi.get<Clinic[]>(
    `/clinics/search?q=${encodeURIComponent(query)}`
  )
}

/**
 * Obtener clínicas por ubicación.
 */
export async function getClinicsByLocationAction(
  location: string
): Promise<ServerApiResponse<Clinic[]>> {
  return serverApi.get<Clinic[]>(
    `/clinics/by-location?location=${encodeURIComponent(location)}`
  )
}

/**
 * Obtener clínicas por ciudad.
 */
export async function getClinicsByCityAction(
  city: string
): Promise<ServerApiResponse<Clinic[]>> {
  return serverApi.get<Clinic[]>(
    `/clinics/by-city?city=${encodeURIComponent(city)}`
  )
}

/**
 * Obtener clínicas que ofrecen servicios específicos.
 */
export async function getClinicsByServicesAction(
  services: string[]
): Promise<ServerApiResponse<Clinic[]>> {
  const servicesParam = services.join(',')
  return serverApi.get<Clinic[]>(
    `/clinics/by-services?services=${encodeURIComponent(servicesParam)}`
  )
}

/**
 * Obtener clínicas con amenidades específicas.
 */
export async function getClinicsByAmenitiesAction(
  amenities: string[]
): Promise<ServerApiResponse<Clinic[]>> {
  const amenitiesParam = amenities.join(',')
  return serverApi.get<Clinic[]>(
    `/clinics/by-amenities?amenities=${encodeURIComponent(amenitiesParam)}`
  )
}

/**
 * Obtener clínicas dentro de un radio específico.
 */
export async function getClinicsNearbyAction(
  lat: number,
  lng: number,
  radius: number = 10
): Promise<ServerApiResponse<Clinic[]>> {
  return serverApi.get<Clinic[]>(
    `/clinics/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
  )
}

// ===================================
// Acciones para Gestión de Doctores en Clínicas
// ===================================

/**
 * Obtener doctores asignados a una clínica.
 */
export async function getClinicDoctorsAction(
  clinicId: string
): Promise<ServerApiResponse<Record<string, unknown>>> {
  return serverApi.get<Record<string, unknown>>(`/clinics/${clinicId}/doctors`)
}

/**
 * Asignar doctores a una clínica.
 */
export async function assignDoctorsToClinicAction(
  clinicId: string,
  doctorIds: string[]
): Promise<ServerApiResponse<Clinic>> {
  const result = await serverApi.post<Clinic>(`/clinics/${clinicId}/doctors`, {
    doctorIds,
  })

  if (result.success) {
    revalidatePath('/(dashboard)/clinics')
    revalidatePath(`/(dashboard)/clinics/${clinicId}`)
    revalidatePath('/(dashboard)/doctors')
  }

  return result
}

/**
 * Remover doctores de una clínica.
 */
export async function removeDoctorsFromClinicAction(
  clinicId: string,
  doctorIds: string[]
): Promise<ServerApiResponse<Clinic>> {
  const result = await serverApi.delete<Clinic>(
    `/clinics/${clinicId}/doctors?doctorIds=${doctorIds.join(',')}`
  )

  if (result.success) {
    revalidatePath('/(dashboard)/clinics')
    revalidatePath(`/(dashboard)/clinics/${clinicId}`)
    revalidatePath('/(dashboard)/doctors')
  }

  return result
}

// ===================================
// Acciones para Horarios y Disponibilidad
// ===================================

/**
 * Actualizar horarios de trabajo de una clínica.
 */
export async function updateClinicWorkingHoursAction(
  clinicId: string,
  workingHours: Record<string, unknown>
): Promise<ServerApiResponse<Clinic>> {
  const result = await serverApi.patch<Clinic>(
    `/clinics/${clinicId}/working-hours`,
    { workingHours }
  )

  if (result.success) {
    revalidatePath('/(dashboard)/clinics')
    revalidatePath(`/(dashboard)/clinics/${clinicId}`)
  }

  return result
}

/**
 * Obtener horarios de disponibilidad de una clínica.
 */
export async function getClinicAvailabilityAction(
  clinicId: string
): Promise<ServerApiResponse<Record<string, unknown>>> {
  return serverApi.get<Record<string, unknown>>(
    `/clinics/${clinicId}/availability`
  )
}

// ===================================
// Acciones para Servicios y Amenidades
// ===================================

/**
 * Actualizar servicios ofrecidos por una clínica.
 */
export async function updateClinicServicesAction(
  clinicId: string,
  services: string[]
): Promise<ServerApiResponse<Clinic>> {
  const result = await serverApi.patch<Clinic>(
    `/clinics/${clinicId}/services`,
    { services }
  )

  if (result.success) {
    revalidatePath('/(dashboard)/clinics')
    revalidatePath(`/(dashboard)/clinics/${clinicId}`)
  }

  return result
}

/**
 * Actualizar amenidades disponibles en una clínica.
 */
export async function updateClinicAmenitiesAction(
  clinicId: string,
  amenities: string[]
): Promise<ServerApiResponse<Clinic>> {
  const result = await serverApi.patch<Clinic>(
    `/clinics/${clinicId}/amenities`,
    { amenities }
  )

  if (result.success) {
    revalidatePath('/(dashboard)/clinics')
    revalidatePath(`/(dashboard)/clinics/${clinicId}`)
  }

  return result
}

// ===================================
// Acciones para Analytics y Reportes
// ===================================

/**
 * Obtener analytics de una clínica específica.
 */
export async function getClinicAnalyticsAction(
  clinicId: string
): Promise<ServerApiResponse<Record<string, unknown>>> {
  return serverApi.get<Record<string, unknown>>(
    `/clinics/${clinicId}/analytics`
  )
}

/**
 * Obtener reportes de rendimiento de clínicas.
 */
export async function getClinicsPerformanceReportAction(): Promise<
  ServerApiResponse<Record<string, unknown>>
> {
  return serverApi.get<Record<string, unknown>>('/clinics/performance-report')
}

/**
 * Exportar datos de clínicas.
 */
export async function exportClinicsAction(
  format: 'csv' | 'excel' = 'csv'
): Promise<ServerApiResponse<{ downloadUrl: string }>> {
  return serverApi.get<{ downloadUrl: string }>(
    `/clinics/export?format=${format}`
  )
}

// ===================================
// Acciones para Imágenes y Archivos
// ===================================

/**
 * Subir imagen de perfil para una clínica.
 */
export async function uploadClinicProfilePhotoAction(
  clinicId: string,
  formData: FormData
): Promise<ServerApiResponse<Clinic>> {
  const result = await serverApi.post<Clinic>(
    `/clinics/${clinicId}/profile-photo`,
    formData
  )

  if (result.success) {
    revalidatePath('/(dashboard)/clinics')
    revalidatePath(`/(dashboard)/clinics/${clinicId}`)
  }

  return result
}

/**
 * Eliminar imagen de perfil de una clínica.
 */
export async function deleteClinicProfilePhotoAction(
  clinicId: string
): Promise<ServerApiResponse<Clinic>> {
  const result = await serverApi.delete<Clinic>(
    `/clinics/${clinicId}/profile-photo`
  )

  if (result.success) {
    revalidatePath('/(dashboard)/clinics')
    revalidatePath(`/(dashboard)/clinics/${clinicId}`)
  }

  return result
}
