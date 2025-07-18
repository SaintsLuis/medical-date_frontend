'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'
import {
  getAdminBillingStatsAction,
  getDoctorBillingStatsAction,
  getInvoicesAction,
  getMyInvoicesAction,
  getInvoiceByIdAction,
  getInvoicesByPatientAction,
  getInvoicesByDoctorAction,
  createInvoiceAction,
  updateInvoiceAction,
  deleteInvoiceAction,
  downloadInvoicePdfAction,
} from '../actions/billing-actions'
import { mapInvoiceFromApi } from '../types'
import type { QueryInvoicesParams } from '../types'

// Billing Stats Hooks
export function useAdminBillingStats(enabled = true) {
  return useQuery({
    queryKey: ['billing', 'stats', 'admin'],
    queryFn: async () => {
      const result = await getAdminBillingStatsAction()
      if (!result.success) {
        throw new Error(result.error ?? 'Error al obtener estadísticas')
      }
      return result.data
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useDoctorBillingStats(enabled = true) {
  return useQuery({
    queryKey: ['billing', 'stats', 'doctor'],
    queryFn: async () => {
      const result = await getDoctorBillingStatsAction()
      if (!result.success) {
        throw new Error(result.error ?? 'Error al obtener estadísticas')
      }
      return result.data
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Invoices Hooks
export function useInvoices(
  params: {
    page?: number
    limit?: number
    status?: string
    patientId?: string
    doctorId?: string
    includeAppointment?: boolean
    includePayments?: boolean
  } = {}
) {
  const { user } = useAuthStore()
  const isDoctor = user?.roles?.includes(UserRole.DOCTOR)

  const query = useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const res = await getInvoicesAction(params)
      if (!res.success || !res.data || !Array.isArray(res.data.data)) {
        throw new Error(res.error ?? 'Error al obtener facturas')
      }
      return {
        ...res.data,
        data: res.data.data.map((inv) => mapInvoiceFromApi(inv)),
      }
    },
    enabled: !isDoctor, // Solo para no-doctores (admins)
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
  return { ...query, refetch: query.refetch }
}

export const useMyInvoices = (params: QueryInvoicesParams) => {
  const { user } = useAuthStore()
  const isDoctor = user?.roles?.includes(UserRole.DOCTOR)

  return useQuery({
    queryKey: ['invoices', 'my-invoices', params],
    queryFn: async () => {
      const res = await getMyInvoicesAction(params)
      if (!res.success || !res.data || !Array.isArray(res.data.data)) {
        throw new Error(res.error ?? 'Error al obtener mis facturas')
      }
      return {
        ...res.data,
        data: res.data.data.map((inv) => mapInvoiceFromApi(inv)),
      }
    },
    enabled: isDoctor,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

export function useInvoice(id: string, enabled = true) {
  const query = useQuery({
    enabled,
    queryKey: ['invoice', id],
    queryFn: async () => {
      const res = await getInvoiceByIdAction(id)
      if (!res.success || !res.data)
        throw new Error(res.error ?? 'Error al obtener factura')
      return mapInvoiceFromApi(res.data)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
  return { ...query, refetch: query.refetch }
}

export function useInvoicesByPatient(patientId: string, enabled = true) {
  const query = useQuery({
    enabled,
    queryKey: ['invoices', 'patient', patientId],
    queryFn: async () => {
      const res = await getInvoicesByPatientAction(patientId)
      if (!res.success || !Array.isArray(res.data))
        throw new Error(res.error ?? 'Error al obtener facturas')
      return res.data.map((inv) => mapInvoiceFromApi(inv))
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
  return { ...query, refetch: query.refetch }
}

export function useInvoicesByDoctor(doctorId: string, enabled = true) {
  const query = useQuery({
    enabled,
    queryKey: ['invoices', 'doctor', doctorId],
    queryFn: async () => {
      const res = await getInvoicesByDoctorAction(doctorId)
      if (!res.success || !Array.isArray(res.data))
        throw new Error(res.error ?? 'Error al obtener facturas')
      return res.data.map((inv) => mapInvoiceFromApi(inv))
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
  return { ...query, refetch: query.refetch }
}

// Download PDF Hook
export function useDownloadInvoicePdf() {
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const result = await downloadInvoicePdfAction(invoiceId)

      if (!result.success || !result.data) {
        throw new Error(
          result.error || 'Error al descargar el PDF de la factura'
        )
      }

      return result.data
    },
    onSuccess: (data) => {
      if (!data) return
      const url = URL.createObjectURL(data.blob)
      const link = document.createElement('a')
      link.href = url
      link.download = data.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('PDF descargado exitosamente')
    },
    onError: (error) => {
      console.error('Error downloading PDF:', error)
      toast.error('Error al descargar el PDF')
    },
  })
}

// Create Invoice Hook
export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      appointmentId: string
      amount: number
      dueDate: string
      paymentMethod?: 'PAYPAL' | 'CASH'
    }) => {
      const result = await createInvoiceAction(data)
      if (!result.success || !result.data) {
        throw new Error(result.error ?? 'Error al crear la factura')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'invoices'] })
      queryClient.invalidateQueries({ queryKey: ['billing', 'stats'] })
      toast.success('Factura creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating invoice:', error)
      toast.error('Error al crear la factura')
    },
  })
}

// Update Invoice Hook
export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: {
        amount?: number
        dueDate?: string
        status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
        paymentMethod?: 'PAYPAL' | 'CASH'
      }
    }) => {
      const result = await updateInvoiceAction(id, data)
      if (!result.success || !result.data) {
        throw new Error(result.error ?? 'Error al actualizar la factura')
      }
      return result.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['billing', 'invoices', variables.id],
      })
      queryClient.invalidateQueries({ queryKey: ['billing', 'invoices'] })
      queryClient.invalidateQueries({ queryKey: ['billing', 'stats'] })
      toast.success('Factura actualizada exitosamente')
    },
    onError: (error) => {
      console.error('Error updating invoice:', error)
      toast.error('Error al actualizar la factura')
    },
  })
}

// Delete Invoice Hook
export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteInvoiceAction(id)
      if (!result.success || !result.data) {
        throw new Error(result.error ?? 'Error al eliminar la factura')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'invoices'] })
      queryClient.invalidateQueries({ queryKey: ['billing', 'stats'] })
      toast.success('Factura eliminada exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting invoice:', error)
      toast.error('Error al eliminar la factura')
    },
  })
}

// Prefetch Hooks for Performance
export function usePrefetchInvoice(id: string) {
  const queryClient = useQueryClient()

  return () => {
    queryClient.prefetchQuery({
      queryKey: ['billing', 'invoices', id],
      queryFn: async () => {
        const result = await getInvoiceByIdAction(id, true, true)
        if (!result.success || !result.data) {
          throw new Error(result.error ?? 'Error al obtener factura')
        }
        return result.data
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }
}

// Combined hook for managing billing operations
export function useBillingManagement() {
  const createInvoice = useCreateInvoice()
  const updateInvoice = useUpdateInvoice()
  const deleteInvoice = useDeleteInvoice()
  const downloadPdf = useDownloadInvoicePdf()

  return {
    createInvoice,
    updateInvoice,
    deleteInvoice,
    downloadPdf,
    isLoading:
      createInvoice.isPending ||
      updateInvoice.isPending ||
      deleteInvoice.isPending ||
      downloadPdf.isPending,
  }
}
