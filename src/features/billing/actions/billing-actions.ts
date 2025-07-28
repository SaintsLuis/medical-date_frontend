'use server'

import { serverApi, type ServerApiResponse } from '@/lib/api/server-client'
import { BillingStats } from '../types'

interface Invoice {
  id: string
  appointmentId: string
  amount: number
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  paymentMethod?: 'PAYPAL' | 'CASH'
  paymentId?: string
  paidAt?: string
  dueDate: string
  createdAt: string
  updatedAt: string
  appointment?: {
    id: string
    date: string
    duration: number
    type: string
    patient: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
    doctor: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
  }
  payments?: Array<{
    id: string
    amount: number
    currency: string
    status: string
    paymentMethod: string
    paymentId: string
    createdAt: string
    updatedAt: string
  }>
}

interface PaginatedInvoicesResponse {
  data: Invoice[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}

export async function getAdminBillingStatsAction(): Promise<
  ServerApiResponse<BillingStats>
> {
  return serverApi.get<BillingStats>('/billing/stats')
}

export async function getDoctorBillingStatsAction(): Promise<
  ServerApiResponse<BillingStats>
> {
  return serverApi.get<BillingStats>('/billing/doctor/stats')
}

export async function getMyInvoicesAction(
  params: {
    page?: number
    limit?: number
    status?: string
  } = {}
): Promise<ServerApiResponse<PaginatedInvoicesResponse>> {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.status) queryParams.append('status', params.status)

  const url = `/invoices/my-invoices${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`

  return serverApi.get<PaginatedInvoicesResponse>(url)
}

export async function getInvoicesAction(
  params: {
    page?: number
    limit?: number
    status?: string
    patientId?: string
    doctorId?: string
    includeAppointment?: boolean
    includePayments?: boolean
  } = {}
): Promise<ServerApiResponse<PaginatedInvoicesResponse>> {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.status) queryParams.append('status', params.status)
  if (params.patientId) queryParams.append('patientId', params.patientId)
  if (params.doctorId) queryParams.append('doctorId', params.doctorId)
  if (params.includeAppointment)
    queryParams.append('includeAppointment', 'true')
  if (params.includePayments) queryParams.append('includePayments', 'true')

  const url = `/invoices${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`

  return serverApi.get<PaginatedInvoicesResponse>(url)
}

export async function getInvoiceByIdAction(
  id: string,
  includeAppointment = true,
  includePayments = true
): Promise<ServerApiResponse<Invoice>> {
  const queryParams = new URLSearchParams()
  if (includeAppointment) queryParams.append('includeAppointment', 'true')
  if (includePayments) queryParams.append('includePayments', 'true')

  const url = `/invoices/${id}${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`

  return serverApi.get<Invoice>(url)
}

export async function downloadInvoicePdfAction(
  invoiceId: string
): Promise<ServerApiResponse<{ blob: Blob; filename: string }>> {
  try {
    // Importamos serverFetch dinámicamente para acceder a él
    const { serverFetch } = await import('@/lib/api/server-client')

    const response = await serverFetch(`/invoices/${invoiceId}/download-pdf`, {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error('Error al descargar el PDF de la factura')
    }

    const blob = await response.blob()

    // Generate filename with current date
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD format
    const filename = `factura-${invoiceId}-${dateStr}.pdf`

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

export async function getInvoicesByPatientAction(
  patientId: string
): Promise<ServerApiResponse<Invoice[]>> {
  return serverApi.get<Invoice[]>(`/invoices/patient/${patientId}`)
}

export async function getInvoicesByDoctorAction(
  doctorId: string
): Promise<ServerApiResponse<Invoice[]>> {
  return serverApi.get<Invoice[]>(`/invoices/doctor/${doctorId}`)
}

export async function createInvoiceAction(data: {
  appointmentId: string
  amount: number
  dueDate: string
  paymentMethod?: 'PAYPAL' | 'CASH'
}): Promise<ServerApiResponse<Invoice>> {
  return serverApi.post<Invoice>('/invoices', data)
}

export async function updateInvoiceAction(
  id: string,
  data: {
    amount?: number
    dueDate?: string
    status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
    paymentMethod?: 'PAYPAL' | 'CASH'
  }
): Promise<ServerApiResponse<Invoice>> {
  return serverApi.patch<Invoice>(`/invoices/${id}`, data)
}

export async function deleteInvoiceAction(
  id: string
): Promise<ServerApiResponse<{ message: string }>> {
  return serverApi.delete<{ message: string }>(`/invoices/${id}`)
}

export async function markInvoiceAsCashPaidAction(
  id: string
): Promise<ServerApiResponse<Invoice>> {
  return serverApi.post<Invoice>(`/invoices/${id}/mark-cash-paid`)
}
