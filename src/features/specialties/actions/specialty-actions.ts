// medical-date_frontend/src/features/specialties/actions/specialty-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { serverApi, type ServerApiResponse } from '@/lib/api/server-client'
import {
  Specialty,
  CreateSpecialtyData,
  UpdateSpecialtyData,
  QuerySpecialtiesParams,
  PaginatedSpecialtiesResponse,
  BackendSpecialtyStats,
} from '../types'

// ==============================================
// Server Actions con Auto-Refresh Centralizado
// ==============================================

// ===================================
// Acciones para Componentes de Servidor
// ===================================

export async function getSpecialties(
  params: QuerySpecialtiesParams
): Promise<ServerApiResponse<PaginatedSpecialtiesResponse>> {
  // Construir parámetros de query manualmente
  const queryParams = new URLSearchParams()

  if (params.page !== undefined) queryParams.set('page', String(params.page))
  if (params.limit !== undefined) queryParams.set('limit', String(params.limit))
  if (params.search) queryParams.set('search', params.search)
  if (params.includeDoctorCount !== undefined)
    queryParams.set('includeDoctorCount', String(params.includeDoctorCount))

  const queryString = queryParams.toString()
  const url = `/specialties${queryString ? `?${queryString}` : ''}`

  return serverApi.get<PaginatedSpecialtiesResponse>(url)
}

export async function getAllActiveSpecialties(): Promise<
  ServerApiResponse<Specialty[]>
> {
  return serverApi.get<Specialty[]>('/specialties/all')
}

export async function getSpecialtyById(
  id: string
): Promise<ServerApiResponse<Specialty>> {
  return serverApi.get<Specialty>(`/specialties/${id}`)
}

export async function getSpecialtyStats(): Promise<
  ServerApiResponse<BackendSpecialtyStats>
> {
  console.log('🔍 Calling specialty stats endpoint: /specialties/stats')

  const result = await serverApi.get<BackendSpecialtyStats>(
    '/specialties/stats'
  )

  console.log('📊 Specialty stats response:', {
    success: result.success,
    hasData: !!result.data,
    error: result.error,
  })

  return result
}

// ===================================
// Acciones para Componentes de Cliente (Mutaciones)
// ===================================

export async function createSpecialtyAction(
  data: CreateSpecialtyData
): Promise<ServerApiResponse<Specialty>> {
  const result = await serverApi.post<Specialty>('/specialties', data)

  if (result.success) {
    revalidatePath('/(dashboard)/specialties')
  }

  return result
}

export async function updateSpecialtyAction(
  id: string,
  data: UpdateSpecialtyData
): Promise<ServerApiResponse<Specialty>> {
  const result = await serverApi.patch<Specialty>(`/specialties/${id}`, data)

  if (result.success) {
    revalidatePath('/(dashboard)/specialties')
  }

  return result
}

export async function deleteSpecialtyAction(
  id: string
): Promise<ServerApiResponse<null>> {
  const result = await serverApi.delete<null>(`/specialties/${id}`)

  if (result.success) {
    revalidatePath('/(dashboard)/specialties')
  }

  return result
}
