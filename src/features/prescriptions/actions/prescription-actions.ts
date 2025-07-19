'use server'

import { serverApi, type ServerApiResponse } from '@/lib/api/server-client'
import {
  Prescription,
  PaginatedPrescriptionsResponse,
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
} from '../types'

export async function getPrescriptionsAction(params: {
  page?: number
  limit?: number
  status?: string
  doctorId?: string
  patientId?: string
  medicalRecordId?: string
  startDate?: string
  endDate?: string
  search?: string
}): Promise<ServerApiResponse<PaginatedPrescriptionsResponse>> {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.status && params.status !== 'ALL')
    queryParams.append('status', params.status)
  if (params.doctorId) queryParams.append('doctorId', params.doctorId)
  if (params.patientId) queryParams.append('patientId', params.patientId)
  if (params.medicalRecordId)
    queryParams.append('medicalRecordId', params.medicalRecordId)
  if (params.startDate) queryParams.append('startDate', params.startDate)
  if (params.endDate) queryParams.append('endDate', params.endDate)
  if (params.search) queryParams.append('search', params.search)

  const url = `/prescriptions${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`
  return serverApi.get<PaginatedPrescriptionsResponse>(url)
}

export async function getPrescriptionByIdAction(
  id: string
): Promise<ServerApiResponse<Prescription>> {
  return serverApi.get<Prescription>(`/prescriptions/${id}`)
}

export async function createPrescriptionAction(
  data: CreatePrescriptionDto
): Promise<ServerApiResponse<Prescription>> {
  return serverApi.post<Prescription>('/prescriptions', data)
}

export async function updatePrescriptionAction(
  id: string,
  data: UpdatePrescriptionDto
): Promise<ServerApiResponse<Prescription>> {
  return serverApi.patch<Prescription>(`/prescriptions/${id}`, data)
}

export async function deletePrescriptionAction(
  id: string
): Promise<ServerApiResponse<{ message: string }>> {
  return serverApi.delete<{ message: string }>(`/prescriptions/${id}`)
}

export async function downloadPrescriptionPdfAction(
  prescriptionId: string
): Promise<ServerApiResponse<{ blob: Blob; filename: string }>> {
  try {
    // Importamos serverFetch dinámicamente para acceder a él
    const { serverFetch } = await import('@/lib/api/server-client')

    const response = await serverFetch(
      `/prescriptions/${prescriptionId}/download-pdf`,
      {
        method: 'GET',
      }
    )

    if (!response.ok) {
      throw new Error('Error al descargar el PDF de la prescripción')
    }

    const blob = await response.blob()

    // El filename viene en el header Content-Disposition o lo generamos
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = `prescripcion-${prescriptionId}.pdf`

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    return {
      success: true,
      data: { blob, filename },
    }
  } catch (error) {
    console.error('Error downloading PDF:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Error al descargar el PDF',
    }
  }
}
