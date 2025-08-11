'use server'

import { revalidatePath } from 'next/cache'
import { serverApi, type ServerApiResponse } from '@/lib/api/server-client'
import {
  Secretary,
  CreateSecretaryData,
  UpdateSecretaryData,
  QuerySecretariesParams,
  PaginatedSecretariesResponse,
  BackendSecretaryStats,
} from '../types'

// ==============================================
// Server Actions con Auto-Refresh Centralizado
// ==============================================

// ===================================
// Acciones para Componentes de Servidor
// ===================================

export async function getSecretaries(
  params: QuerySecretariesParams
): Promise<ServerApiResponse<PaginatedSecretariesResponse>> {
  // Construir parámetros de query manualmente
  const queryParams = new URLSearchParams()

  if (params.page !== undefined) queryParams.set('page', String(params.page))
  if (params.limit !== undefined) queryParams.set('limit', String(params.limit))
  if (params.search) queryParams.set('search', params.search)
  if (params.isActive !== undefined)
    queryParams.set('isActive', String(params.isActive))
  if (params.includeDoctors !== undefined)
    queryParams.set('includeDoctors', String(params.includeDoctors))
  if (params.sortBy) queryParams.set('sortBy', params.sortBy)
  if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder)

  const queryString = queryParams.toString()
  const url = `/secretaries${queryString ? `?${queryString}` : ''}`

  return serverApi.get<PaginatedSecretariesResponse>(url)
}

export async function getAllSecretaries(): Promise<
  ServerApiResponse<Secretary[]>
> {
  return serverApi.get<Secretary[]>('/secretaries/all')
}

export async function getSecretaryById(
  id: string
): Promise<ServerApiResponse<Secretary>> {
  return serverApi.get<Secretary>(`/secretaries/${id}`)
}

export async function getSecretaryStats(): Promise<
  ServerApiResponse<BackendSecretaryStats>
> {
  console.log('🔍 Calling secretary stats endpoint: /secretaries/stats')

  const result = await serverApi.get<BackendSecretaryStats>(
    '/secretaries/stats'
  )

  console.log('📊 Secretary stats response:', {
    success: result.success,
    hasData: !!result.data,
    error: result.error,
  })

  return result
}

// ===================================
// Acciones para Componentes de Cliente (Mutaciones)
// ===================================

export async function createSecretaryAction(
  data: CreateSecretaryData
): Promise<ServerApiResponse<Secretary>> {
  // Asegurar que se envían los campos correctos al backend
  const payload = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    phoneNumber: data.phoneNumber,
    doctorProfileIds: data.doctorProfileIds,
    notes: data.notes,
  }

  const result = await serverApi.post<Secretary>('/secretaries', payload)

  if (result.success) {
    revalidatePath('/(dashboard)/secretaries')
    revalidatePath('/(dashboard)/users')
  }

  return result
}

export async function updateSecretaryAction(
  id: string,
  data: UpdateSecretaryData
): Promise<ServerApiResponse<Secretary>> {
  // Asegurar que se envían solo los campos permitidos al backend
  const payload: Partial<{
    firstName: string
    lastName: string
    email: string
    password: string
    phoneNumber: string
    doctorProfileIds: string[]
    notes: string
  }> = {}

  if (data.firstName !== undefined) payload.firstName = data.firstName
  if (data.lastName !== undefined) payload.lastName = data.lastName
  if (data.email !== undefined) payload.email = data.email
  if (data.password !== undefined) payload.password = data.password
  if (data.phoneNumber !== undefined) payload.phoneNumber = data.phoneNumber
  if (data.doctorProfileIds !== undefined)
    payload.doctorProfileIds = data.doctorProfileIds
  if (data.notes !== undefined) payload.notes = data.notes

  const result = await serverApi.patch<Secretary>(`/secretaries/${id}`, payload)

  if (result.success) {
    revalidatePath('/(dashboard)/secretaries')
    revalidatePath('/(dashboard)/users')
  }

  return result
}

export async function deleteSecretaryAction(
  id: string
): Promise<ServerApiResponse<null>> {
  const result = await serverApi.delete<null>(`/secretaries/${id}`)

  if (result.success) {
    revalidatePath('/(dashboard)/secretaries')
    revalidatePath('/(dashboard)/users')
  }

  return result
}

export async function toggleSecretaryStatusAction(
  id: string
): Promise<ServerApiResponse<Secretary>> {
  const result = await serverApi.patch<Secretary>(
    `/secretaries/${id}/toggle-status`,
    {}
  )

  if (result.success) {
    revalidatePath('/(dashboard)/secretaries')
    revalidatePath('/(dashboard)/users')
  }

  return result
}

// ===================================
// Acciones para Asignación de Doctores
// ===================================

export async function assignDoctorsToSecretaryAction(
  secretaryId: string,
  doctorIds: string[]
): Promise<ServerApiResponse<Secretary>> {
  const result = await serverApi.post<Secretary>(
    `/secretaries/${secretaryId}/assign-doctors`,
    { doctorIds }
  )

  if (result.success) {
    revalidatePath('/(dashboard)/secretaries')
    revalidatePath('/(dashboard)/users')
  }

  return result
}

export async function unassignDoctorFromSecretaryAction(
  secretaryId: string,
  doctorId: string
): Promise<ServerApiResponse<Secretary>> {
  const result = await serverApi.delete<Secretary>(
    `/secretaries/${secretaryId}/unassign-doctor/${doctorId}`
  )

  if (result.success) {
    revalidatePath('/(dashboard)/secretaries')
    revalidatePath('/(dashboard)/users')
  }

  return result
}

// ===================================
// Acciones para Búsqueda y Filtros
// ===================================

export async function searchSecretariesAction(
  query: string
): Promise<ServerApiResponse<Secretary[]>> {
  return serverApi.get<Secretary[]>(
    `/secretaries/search?q=${encodeURIComponent(query)}`
  )
}

export async function getSecretariesByDoctorAction(
  doctorId: string
): Promise<ServerApiResponse<Secretary[]>> {
  return serverApi.get<Secretary[]>(`/secretaries/by-doctor/${doctorId}`)
}

export async function getAvailableSecretariesAction(): Promise<
  ServerApiResponse<Secretary[]>
> {
  return serverApi.get<Secretary[]>('/secretaries/available')
}
