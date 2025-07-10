'use server'

import { revalidatePath } from 'next/cache'
import { serverApi, type ServerApiResponse } from '@/lib/api/server-client'
import {
  User,
  UpdateUserData,
  QueryUsersParams,
  PaginatedUsersResponse,
  BackendUserStats,
} from '../types'

// ==============================================
// Server Actions con Auto-Refresh Centralizado
// ==============================================

// ===================================
// Acciones para Componentes de Servidor
// ===================================

export async function getUsers(
  params: QueryUsersParams
): Promise<ServerApiResponse<PaginatedUsersResponse>> {
  // Construir parámetros de query manualmente
  const queryParams = new URLSearchParams()

  if (params.page !== undefined) queryParams.set('page', String(params.page))
  if (params.limit !== undefined) queryParams.set('limit', String(params.limit))
  if (params.search) queryParams.set('search', params.search)
  if (params.userType) queryParams.set('userType', params.userType)
  if (params.isActive !== undefined)
    queryParams.set('isActive', String(params.isActive))

  // Parámetros correctos según la API del backend
  if (params.includePatientProfile !== undefined)
    queryParams.set(
      'includePatientProfile',
      String(params.includePatientProfile)
    )
  if (params.includeDoctorProfile !== undefined)
    queryParams.set('includeDoctorProfile', String(params.includeDoctorProfile))
  if (params.includeRoles !== undefined)
    queryParams.set('includeRoles', String(params.includeRoles))

  const queryString = queryParams.toString()
  const url = `/users${queryString ? `?${queryString}` : ''}`

  return serverApi.get<PaginatedUsersResponse>(url)
}

export async function getAllUsers(): Promise<ServerApiResponse<User[]>> {
  return serverApi.get<User[]>('/users/all')
}

export async function getUserById(
  id: string
): Promise<ServerApiResponse<User>> {
  return serverApi.get<User>(`/users/${id}`)
}

export async function getUserStats(): Promise<
  ServerApiResponse<BackendUserStats>
> {
  console.log('🔍 Calling user stats endpoint: /users/stats')

  const result = await serverApi.get<BackendUserStats>('/users/stats')

  console.log('📊 User stats response:', {
    success: result.success,
    hasData: !!result.data,
    error: result.error,
  })

  return result
}

// ===================================
// Acciones para Componentes de Cliente (Mutaciones)
// ===================================

export async function updateUserAction(
  id: string,
  data: UpdateUserData
): Promise<ServerApiResponse<User>> {
  const result = await serverApi.patch<User>(`/users/${id}`, data)

  if (result.success) {
    revalidatePath('/(dashboard)/users')
  }

  return result
}

export async function deleteUserAction(
  id: string
): Promise<ServerApiResponse<null>> {
  const result = await serverApi.delete<null>(`/users/${id}`)

  if (result.success) {
    revalidatePath('/(dashboard)/users')
  }

  return result
}

export async function toggleUserStatusAction(
  id: string
): Promise<ServerApiResponse<User>> {
  const result = await serverApi.patch<User>(`/users/${id}/toggle-status`, {})

  if (result.success) {
    revalidatePath('/(dashboard)/users')
  }

  return result
}

// ===================================
// Acciones para Búsqueda y Filtros
// ===================================

export async function searchUsersAction(
  query: string
): Promise<ServerApiResponse<User[]>> {
  return serverApi.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`)
}

export async function getUsersByRoleAction(
  role: string
): Promise<ServerApiResponse<User[]>> {
  return serverApi.get<User[]>(`/users/by-role/${role}`)
}
