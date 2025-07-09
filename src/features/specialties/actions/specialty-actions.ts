// medical-date_frontend/src/features/specialties/actions/specialty-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { config } from '@/config/app'
import {
  CreateSpecialtyData,
  UpdateSpecialtyData,
  QuerySpecialtiesParams,
  Specialty,
  PaginatedSpecialtiesResponse,
  BackendSpecialtyStats,
} from '../types'

// ===================================
// Tipos de Respuesta de Acciones
// ===================================

interface ActionResponse<T> {
  success: boolean
  data?: T
  error?: string | null
}

// ===================================
// Helpers
// ===================================

async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('API Error:', { status: response.status, errorData })
    return {
      success: false,
      error: errorData.message || `Error: ${response.status}`,
    }
  }
  try {
    const responseData = await response.json()
    // La data real está en responseData.data según el wrapper del backend
    return { success: true, data: responseData.data }
  } catch (e) {
    console.error('API JSON Parse Error:', e)
    return {
      success: false,
      error: 'Error al procesar la respuesta del servidor.',
    }
  }
}

// ===================================
// Acciones para Componentes de Servidor
// ===================================

export async function getSpecialties(
  params: QuerySpecialtiesParams
): Promise<ActionResponse<PaginatedSpecialtiesResponse>> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return { success: false, error: 'No autenticado' }

  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)
  if (params.includeInactive)
    query.set('includeInactive', String(params.includeInactive))

  try {
    const response = await fetch(
      `${config.API_BASE_URL}/specialties?${query}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    )
    return handleApiResponse(response)
  } catch (error) {
    console.error('Network error in getSpecialties:', error)
    return { success: false, error: 'Error de red al obtener especialidades.' }
  }
}

export async function getAllActiveSpecialties(): Promise<
  ActionResponse<Specialty[]>
> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return { success: false, error: 'No autenticado' }

  try {
    const response = await fetch(`${config.API_BASE_URL}/specialties/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })
    return handleApiResponse(response)
  } catch (error) {
    console.error('Network error in getAllActiveSpecialties:', error)
    return { success: false, error: 'Error de red al obtener especialidades.' }
  }
}

export async function getSpecialtyById(
  id: string
): Promise<ActionResponse<Specialty>> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return { success: false, error: 'No autenticado' }

  try {
    const response = await fetch(`${config.API_BASE_URL}/specialties/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })
    return handleApiResponse(response)
  } catch (error) {
    console.error('Network error in getSpecialtyById:', error)
    return {
      success: false,
      error: `Error de red al obtener la especialidad ${id}.`,
    }
  }
}

export async function getSpecialtyStats(): Promise<
  ActionResponse<BackendSpecialtyStats>
> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return { success: false, error: 'No autenticado' }

  try {
    const response = await fetch(`${config.API_BASE_URL}/specialties/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })
    return handleApiResponse(response)
  } catch (error) {
    console.error('Network error in getSpecialtyStats:', error)
    return { success: false, error: 'Error de red al obtener estadísticas.' }
  }
}

// ===================================
// Acciones para Componentes de Cliente (Mutaciones)
// ===================================

export async function createSpecialtyAction(
  data: CreateSpecialtyData
): Promise<ActionResponse<Specialty>> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return { success: false, error: 'No autenticado' }

  try {
    const response = await fetch(`${config.API_BASE_URL}/specialties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    const result = await handleApiResponse(response)
    if (result.success) {
      revalidatePath('/(dashboard)/specialties')
    }
    return result
  } catch (error) {
    console.error('Network error in createSpecialtyAction:', error)
    return { success: false, error: 'Error de red al crear la especialidad.' }
  }
}

export async function updateSpecialtyAction(
  id: string,
  data: UpdateSpecialtyData
): Promise<ActionResponse<Specialty>> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return { success: false, error: 'No autenticado' }

  try {
    const response = await fetch(`${config.API_BASE_URL}/specialties/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    const result = await handleApiResponse(response)
    if (result.success) {
      revalidatePath('/(dashboard)/specialties')
    }
    return result
  } catch (error) {
    console.error('Network error in updateSpecialtyAction:', error)
    return {
      success: false,
      error: `Error de red al actualizar la especialidad ${id}.`,
    }
  }
}

export async function deleteSpecialtyAction(
  id: string
): Promise<ActionResponse<null>> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return { success: false, error: 'No autenticado' }

  try {
    const response = await fetch(`${config.API_BASE_URL}/specialties/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const result = await handleApiResponse(response)
    if (result.success) {
      revalidatePath('/(dashboard)/specialties')
    }
    return result
  } catch (error) {
    console.error('Network error in deleteSpecialtyAction:', error)
    return {
      success: false,
      error: `Error de red al eliminar la especialidad ${id}.`,
    }
  }
}
