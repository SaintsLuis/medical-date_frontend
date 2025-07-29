'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import {
  getPrescriptionsAction,
  createPrescriptionAction,
  updatePrescriptionAction,
  deletePrescriptionAction,
  downloadPrescriptionPdfAction,
} from '../actions/prescription-actions'
import {
  //Prescription,
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  PrescriptionFilters,
  PaginatedPrescriptionsResponse,
} from '../types'

// ==============================================
// Query Keys
// ==============================================

export const prescriptionKeys = {
  all: ['prescriptions'] as const,
  lists: () => [...prescriptionKeys.all, 'list'] as const,
  list: (params: PrescriptionFilters) =>
    [...prescriptionKeys.lists(), params] as const,
  details: () => [...prescriptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...prescriptionKeys.details(), id] as const,
}

// ==============================================
// Query Hook
// ==============================================

export function usePrescriptions(
  params: PrescriptionFilters = {},
  enabled = true
) {
  return useQuery({
    queryKey: prescriptionKeys.list(params),
    queryFn: async (): Promise<PaginatedPrescriptionsResponse> => {
      console.log('🎣 Hook: Fetching prescriptions with params:', params)
      const result = await getPrescriptionsAction({
        page: params.page,
        limit: params.pageSize,
        status: params.status,
        doctorId: params.doctorId,
        patientId: params.patientId,
        medicalRecordId: params.medicalRecordId,
        startDate: params.startDate,
        endDate: params.endDate,
        search: params.search,
      })

      console.log('📨 Hook: Received result from action:', result)

      if (!result.success) {
        throw new Error(result.error || 'Error al cargar prescripciones')
      }
      if (!result.data) {
        throw new Error('No se recibieron datos del servidor')
      }

      console.log('✅ Hook: Returning data:', result.data)
      return result.data
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// ==============================================
// Mutation Hooks
// ==============================================

export function useCreatePrescription() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePrescriptionDto) => {
      const result = await createPrescriptionAction(data)

      if (!result.success) {
        throw new Error(result.error || 'Error al crear prescripción')
      }
      if (!result.data) {
        throw new Error('No se recibieron datos del servidor')
      }

      return result.data
    },
    onSuccess: (data) => {
      // Set the new prescription in cache
      queryClient.setQueryData(prescriptionKeys.detail(data.id), data)

      // Invalidate and refetch prescriptions queries
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.all })
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() })
      toast.success('Prescripción creada exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear prescripción')
    },
  })
}

export function useUpdatePrescription() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdatePrescriptionDto
    }) => {
      const result = await updatePrescriptionAction(id, data)

      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar prescripción')
      }
      if (!result.data) {
        throw new Error('No se recibieron datos del servidor')
      }

      return result.data
    },
    onSuccess: (data) => {
      // Update the prescription in cache
      queryClient.setQueryData(prescriptionKeys.detail(data.id), data)

      // Invalidate and refetch prescriptions queries
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.all })
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() })
      toast.success('Prescripción actualizada exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar prescripción')
    },
  })
}

export function useDeletePrescription() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deletePrescriptionAction(id)

      if (!result.success) {
        throw new Error(result.error || 'Error al eliminar prescripción')
      }

      return result.data
    },
    onSuccess: (_, id) => {
      toast.success('Prescripción eliminada exitosamente')

      // Remove the specific record from cache
      queryClient.removeQueries({ queryKey: prescriptionKeys.detail(id) })

      // Invalidate ALL prescription queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.all })

      // Also invalidate specific query patterns to be extra sure
      queryClient.invalidateQueries({ queryKey: prescriptionKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar prescripción')
    },
  })
}

export function useDownloadPrescriptionPdf() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (prescriptionId: string) => {
      const result = await downloadPrescriptionPdfAction(prescriptionId)

      if (!result.success) {
        throw new Error(result.error || 'Error al descargar PDF')
      }
      if (!result.data) {
        throw new Error('No se recibieron datos del servidor')
      }

      return result.data
    },
    onSuccess: (data) => {
      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(data.blob)
      const link = document.createElement('a')
      link.href = url
      link.download = data.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('PDF descargado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al descargar PDF')
    },
  })
}
