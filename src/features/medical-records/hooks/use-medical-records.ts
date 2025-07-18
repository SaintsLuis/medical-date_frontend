// src/features/medical-records/hooks/use-medical-records.ts

'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'
import {
  getMedicalRecordsAction,
  getMedicalRecordByIdAction,
  getPatientMedicalRecordsAction,
  getPatientMedicalRecordsByUserIdAction,
  getDoctorMedicalRecordsAction,
  getFollowUpRecordsAction,
  createMedicalRecordAction,
  updateMedicalRecordAction,
  deleteMedicalRecordAction,
  getDoctorMedicalRecordAnalyticsAction,
} from '../actions/medical-records-actions'
import type {
  QueryMedicalRecordsParams,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  MedicalRecord,
  PaginatedMedicalRecordsResponse,
  DoctorMedicalRecordAnalytics,
} from '../types'

// ==============================================
// Query Keys
// ==============================================

export const medicalRecordKeys = {
  all: ['medical-records'] as const,
  lists: () => [...medicalRecordKeys.all, 'list'] as const,
  list: (params: QueryMedicalRecordsParams) =>
    [...medicalRecordKeys.lists(), params] as const,
  details: () => [...medicalRecordKeys.all, 'detail'] as const,
  detail: (id: string) => [...medicalRecordKeys.details(), id] as const,
  patient: (patientProfileId: string) =>
    [...medicalRecordKeys.all, 'patient', patientProfileId] as const,
  patientByUser: (patientId: string) =>
    [...medicalRecordKeys.all, 'patient-by-user', patientId] as const,
  doctor: (doctorId: string) =>
    [...medicalRecordKeys.all, 'doctor', doctorId] as const,
  followUp: () => [...medicalRecordKeys.all, 'follow-up'] as const,
  analytics: () => [...medicalRecordKeys.all, 'analytics'] as const,
  doctorAnalytics: (doctorId: string) =>
    [...medicalRecordKeys.analytics(), 'doctor', doctorId] as const,
}

// ==============================================
// Basic Query Hooks
// ==============================================

export function useMedicalRecords(
  params: QueryMedicalRecordsParams = {},
  enabled = true
) {
  return useQuery({
    queryKey: medicalRecordKeys.list(params),
    queryFn: async (): Promise<PaginatedMedicalRecordsResponse> => {
      console.log('🎣 Hook: Fetching medical records with params:', params)
      const result = await getMedicalRecordsAction(params)
      console.log('📨 Hook: Received result from action:', result)

      if (!result.success) {
        throw new Error(result.error || 'Error al cargar los registros médicos')
      }
      if (!result.data) {
        throw new Error('No se recibieron datos del servidor')
      }

      console.log('✅ Hook: Returning data:', result.data)
      if (result.data.data.length > 0) {
        console.log('🔍 Hook: First record structure:', result.data.data[0])
      }

      return result.data
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useMedicalRecord(id: string, enabled = true) {
  return useQuery({
    queryKey: medicalRecordKeys.detail(id),
    queryFn: async (): Promise<MedicalRecord> => {
      const result = await getMedicalRecordByIdAction(id)
      if (!result.success) {
        throw new Error(result.error || 'Error al cargar el registro médico')
      }
      if (!result.data) {
        throw new Error('No se recibieron datos del servidor')
      }
      return result.data
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function usePatientMedicalRecords(
  patientProfileId: string,
  params: QueryMedicalRecordsParams = {},
  enabled = true
) {
  return useQuery({
    queryKey: medicalRecordKeys.patient(patientProfileId),
    queryFn: async (): Promise<PaginatedMedicalRecordsResponse> => {
      const result = await getPatientMedicalRecordsAction(
        patientProfileId,
        params
      )
      if (!result.success) {
        throw new Error(
          result.error || 'Error al cargar los registros del paciente'
        )
      }
      if (!result.data) {
        throw new Error('No se recibieron datos del servidor')
      }
      return result.data
    },
    enabled: enabled && !!patientProfileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function usePatientMedicalRecordsByUserId(
  patientId: string,
  params: QueryMedicalRecordsParams = {},
  enabled = true
) {
  return useQuery({
    queryKey: medicalRecordKeys.patientByUser(patientId),
    queryFn: async (): Promise<PaginatedMedicalRecordsResponse> => {
      const result = await getPatientMedicalRecordsByUserIdAction(
        patientId,
        params
      )
      if (!result.success) {
        throw new Error(
          result.error || 'Error al cargar los registros del paciente'
        )
      }
      if (!result.data) {
        throw new Error('No se recibieron datos del servidor')
      }
      return result.data
    },
    enabled: enabled && !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useDoctorMedicalRecords(
  doctorId: string,
  params: QueryMedicalRecordsParams = {},
  enabled = true
) {
  return useQuery({
    queryKey: medicalRecordKeys.doctor(doctorId),
    queryFn: async (): Promise<PaginatedMedicalRecordsResponse> => {
      const result = await getDoctorMedicalRecordsAction(doctorId, params)
      if (!result.success) {
        throw new Error(
          result.error || 'Error al cargar los registros del doctor'
        )
      }
      if (!result.data) {
        throw new Error('No se recibieron datos del servidor')
      }
      return result.data
    },
    enabled: enabled && !!doctorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useMyMedicalRecords(
  params: QueryMedicalRecordsParams = {},
  enabled = true
) {
  const { user } = useAuthStore()
  const isDoctor = user?.roles.includes(UserRole.DOCTOR)
  const userId = user?.id

  return useQuery({
    queryKey: medicalRecordKeys.doctor(userId || ''),
    queryFn: async (): Promise<PaginatedMedicalRecordsResponse> => {
      if (!userId) {
        throw new Error('Usuario no autenticado')
      }

      const result = isDoctor
        ? await getDoctorMedicalRecordsAction(userId, params)
        : await getPatientMedicalRecordsByUserIdAction(userId, params)

      if (!result.success) {
        throw new Error(result.error || 'Error al cargar mis registros médicos')
      }
      if (!result.data) {
        throw new Error('No se recibieron datos del servidor')
      }
      return result.data
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useFollowUpRecords(enabled = true) {
  return useQuery({
    queryKey: medicalRecordKeys.followUp(),
    queryFn: async (): Promise<MedicalRecord[]> => {
      const result = await getFollowUpRecordsAction()
      if (!result.success) {
        throw new Error(
          result.error || 'Error al cargar los registros de seguimiento'
        )
      }
      if (!result.data) {
        throw new Error('No se recibieron datos del servidor')
      }
      return result.data
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes - More frequent updates for follow-ups
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useDoctorMedicalRecordAnalytics(
  doctorId: string,
  enabled = true
) {
  return useQuery({
    queryKey: medicalRecordKeys.doctorAnalytics(doctorId),
    queryFn: async (): Promise<DoctorMedicalRecordAnalytics> => {
      const result = await getDoctorMedicalRecordAnalyticsAction(doctorId)
      if (!result.success) {
        throw new Error(
          result.error || 'Error al cargar las analíticas del doctor'
        )
      }
      if (!result.data) {
        throw new Error('No se recibieron datos del servidor')
      }
      return result.data
    },
    enabled: enabled && !!doctorId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  })
}

// ==============================================
// Mutation Hooks
// ==============================================

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: CreateMedicalRecordDto
    ): Promise<MedicalRecord> => {
      const result = await createMedicalRecordAction(data)
      if (!result.success) {
        throw new Error(result.error || 'Error al crear el registro médico')
      }
      if (!result.data) {
        throw new Error('No se recibieron datos del servidor')
      }
      return result.data
    },
    onSuccess: (data, variables) => {
      toast.success('Registro médico creado exitosamente')

      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.all })
      queryClient.invalidateQueries({
        queryKey: medicalRecordKeys.patient(variables.patientProfileId),
      })
      queryClient.invalidateQueries({
        queryKey: medicalRecordKeys.doctor(variables.doctorId),
      })
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.followUp() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear el registro médico')
    },
  })
}

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateMedicalRecordDto
    }): Promise<MedicalRecord> => {
      const result = await updateMedicalRecordAction(id, data)
      if (!result.success) {
        throw new Error(
          result.error || 'Error al actualizar el registro médico'
        )
      }
      if (!result.data) {
        throw new Error('No se recibieron datos del servidor')
      }
      return result.data
    },
    onSuccess: (data, variables) => {
      toast.success('Registro médico actualizado exitosamente')

      // Update the specific record in cache
      queryClient.setQueryData(medicalRecordKeys.detail(variables.id), data)

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: medicalRecordKeys.patient(data.patientProfileId),
      })
      queryClient.invalidateQueries({
        queryKey: medicalRecordKeys.doctor(data.doctorId),
      })
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.followUp() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar el registro médico')
    },
  })
}

export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const result = await deleteMedicalRecordAction(id)
      if (!result.success) {
        throw new Error(result.error || 'Error al eliminar el registro médico')
      }
    },
    onSuccess: (_, id) => {
      toast.success('Registro médico eliminado exitosamente')

      // Remove the specific record from cache
      queryClient.removeQueries({ queryKey: medicalRecordKeys.detail(id) })

      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.lists() })
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.followUp() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar el registro médico')
    },
  })
}

// ==============================================
// Prefetch Hooks
// ==============================================

export function usePrefetchMedicalRecord() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: medicalRecordKeys.detail(id),
      queryFn: async (): Promise<MedicalRecord> => {
        const result = await getMedicalRecordByIdAction(id)
        if (!result.success) {
          throw new Error(result.error || 'Error al cargar el registro médico')
        }
        if (!result.data) {
          throw new Error('No se recibieron datos del servidor')
        }
        return result.data
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }
}

export function usePrefetchPatientMedicalRecords() {
  const queryClient = useQueryClient()

  return (patientProfileId: string, params: QueryMedicalRecordsParams = {}) => {
    queryClient.prefetchQuery({
      queryKey: medicalRecordKeys.patient(patientProfileId),
      queryFn: async (): Promise<PaginatedMedicalRecordsResponse> => {
        const result = await getPatientMedicalRecordsAction(
          patientProfileId,
          params
        )
        if (!result.success) {
          throw new Error(
            result.error || 'Error al cargar los registros del paciente'
          )
        }
        if (!result.data) {
          throw new Error('No se recibieron datos del servidor')
        }
        return result.data
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }
}

// ==============================================
// Utility Hooks
// ==============================================

export function useMedicalRecordManagement() {
  const createMutation = useCreateMedicalRecord()
  const updateMutation = useUpdateMedicalRecord()
  const deleteMutation = useDeleteMedicalRecord()

  return {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  }
}

// ==============================================
// Search and Filter Hooks
// ==============================================

export function useMedicalRecordSearch(
  initialParams: QueryMedicalRecordsParams = {}
) {
  const [params, setParams] = useState<QueryMedicalRecordsParams>(initialParams)
  const query = useMedicalRecords(params)

  const updateParams = (newParams: Partial<QueryMedicalRecordsParams>) => {
    setParams((prev: QueryMedicalRecordsParams) => ({
      ...prev,
      ...newParams,
      page: 1,
    })) // Reset to page 1 when filtering
  }

  const resetParams = () => {
    setParams(initialParams)
  }

  return {
    ...query,
    params,
    updateParams,
    resetParams,
    setPage: (page: number) =>
      setParams((prev: QueryMedicalRecordsParams) => ({ ...prev, page })),
    setLimit: (limit: number) =>
      setParams((prev: QueryMedicalRecordsParams) => ({
        ...prev,
        limit,
        page: 1,
      })),
  }
}

// Export actions for convenience
export {
  getMedicalRecordsAction,
  getMedicalRecordByIdAction,
  getPatientMedicalRecordsAction,
  getDoctorMedicalRecordsAction,
  getFollowUpRecordsAction,
  createMedicalRecordAction,
  updateMedicalRecordAction,
  deleteMedicalRecordAction,
}
