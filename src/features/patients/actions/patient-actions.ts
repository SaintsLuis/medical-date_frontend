'use server'

import { revalidatePath } from 'next/cache'
import { serverApi, type ServerApiResponse } from '@/lib/api/server-client'
import {
  Patient,
  UpdatePatientData,
  QueryPatientsParams,
  PaginatedPatientsResponse,
  BackendPatientStats,
} from '../types'

// ==============================================
// Server Actions con Auto-Refresh Centralizado
// ==============================================

// ===================================
// Acciones para Componentes de Servidor
// ===================================

/**
 * Obtener lista paginada de pacientes con filtros.
 */
export async function getPatients(
  params: QueryPatientsParams
): Promise<ServerApiResponse<PaginatedPatientsResponse>> {
  // Construir parámetros de query
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.search) searchParams.append('search', params.search)
  if (params.gender) searchParams.append('gender', params.gender)
  if (params.bloodType) searchParams.append('bloodType', params.bloodType)
  if (params.location) searchParams.append('location', params.location)
  if (params.includeUser !== undefined)
    searchParams.append('includeUser', params.includeUser.toString())
  if (params.includeMedicalRecords !== undefined)
    searchParams.append(
      'includeMedicalRecords',
      params.includeMedicalRecords.toString()
    )
  if (params.includeAppointments !== undefined)
    searchParams.append(
      'includeAppointments',
      params.includeAppointments.toString()
    )
  if (params.sortByAge) searchParams.append('sortByAge', params.sortByAge)

  const queryString = searchParams.toString()
  const url = `/patients${queryString ? `?${queryString}` : ''}`

  return serverApi.get<PaginatedPatientsResponse>(url)
}

/**
 * Obtener todos los pacientes (sin paginación).
 */
export async function getAllPatients(): Promise<ServerApiResponse<Patient[]>> {
  return serverApi.get<Patient[]>('/patients?limit=100')
}

/**
 * Obtener paciente por ID.
 */
export async function getPatientById(
  id: string
): Promise<ServerApiResponse<Patient>> {
  return serverApi.get<Patient>(`/patients/${id}`)
}

/**
 * Obtener estadísticas de pacientes.
 */
export async function getPatientStats(): Promise<
  ServerApiResponse<BackendPatientStats>
> {
  return serverApi.get<BackendPatientStats>('/patients/stats')
}

// ===================================
// Acciones de Mutación
// ===================================

/**
 * Actualizar paciente.
 */
export async function updatePatientAction(
  id: string,
  data: UpdatePatientData
): Promise<ServerApiResponse<Patient>> {
  const result = await serverApi.patch<Patient>(`/patients/${id}`, data)

  if (result.success) {
    revalidatePath('/(dashboard)/patients')
  }

  return result
}

/**
 * Eliminar paciente.
 */
export async function deletePatientAction(
  id: string
): Promise<ServerApiResponse<null>> {
  const result = await serverApi.delete<null>(`/patients/${id}`)

  if (result.success) {
    revalidatePath('/(dashboard)/patients')
  }

  return result
}

/**
 * Buscar pacientes.
 */
export async function searchPatientsAction(
  query: string
): Promise<ServerApiResponse<Patient[]>> {
  return serverApi.get<Patient[]>(
    `/patients?search=${encodeURIComponent(query)}`
  )
}

/**
 * Obtener pacientes por género.
 */
export async function getPatientsByGenderAction(
  gender: string
): Promise<ServerApiResponse<Patient[]>> {
  return serverApi.get<Patient[]>(`/patients?gender=${gender}`)
}

/**
 * Obtener pacientes por tipo de sangre.
 */
export async function getPatientsByBloodTypeAction(
  bloodType: string
): Promise<ServerApiResponse<Patient[]>> {
  return serverApi.get<Patient[]>(`/patients?bloodType=${bloodType}`)
}

/**
 * Obtener pacientes por ubicación.
 */
export async function getPatientsByLocationAction(
  location: string
): Promise<ServerApiResponse<Patient[]>> {
  return serverApi.get<Patient[]>(
    `/patients?location=${encodeURIComponent(location)}`
  )
}

/**
 * Obtener pacientes con alergias.
 */
export async function getPatientsWithAllergiesAction(): Promise<
  ServerApiResponse<Patient[]>
> {
  return serverApi.get<Patient[]>('/patients?hasAllergies=true')
}

/**
 * Obtener pacientes por rango de edad.
 */
export async function getPatientsByAgeRangeAction(
  minAge: number,
  maxAge: number
): Promise<ServerApiResponse<Patient[]>> {
  return serverApi.get<Patient[]>(`/patients?minAge=${minAge}&maxAge=${maxAge}`)
}

/**
 * Obtener historial médico de un paciente.
 */
export async function getPatientMedicalHistoryAction(
  patientId: string
): Promise<ServerApiResponse<Record<string, unknown>>> {
  return serverApi.get<Record<string, unknown>>(
    `/patients/${patientId}/medical-records`
  )
}

/**
 * Obtener citas de un paciente.
 */
export async function getPatientAppointmentsAction(
  patientId: string
): Promise<ServerApiResponse<Record<string, unknown>>> {
  return serverApi.get<Record<string, unknown>>(
    `/patients/${patientId}/appointments`
  )
}

/**
 * Exportar datos de pacientes.
 */
export async function exportPatientsAction(
  format: 'csv' | 'excel' = 'csv'
): Promise<ServerApiResponse<{ downloadUrl: string }>> {
  return serverApi.get<{ downloadUrl: string }>(
    `/patients/export?format=${format}`
  )
}

/**
 * Obtener análisis de pacientes.
 */
export async function getPatientAnalyticsAction(): Promise<
  ServerApiResponse<Record<string, unknown>>
> {
  return serverApi.get<Record<string, unknown>>('/patients/analytics')
}
