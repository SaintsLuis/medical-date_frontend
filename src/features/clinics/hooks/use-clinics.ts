'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  CreateClinicFormData,
  UpdateClinicFormData,
  QueryClinicsParams,
} from '../types'
import {
  createClinicAction,
  updateClinicAction,
  deleteClinicAction,
  getClinics,
  getClinicById,
  getClinicStats,
  getAllActiveClinics,
} from '../actions/clinic-actions'

// ==============================================
// Query Keys
// ==============================================

export const clinicKeys = {
  all: ['clinics'] as const,
  lists: () => [...clinicKeys.all, 'list'] as const,
  list: (params: QueryClinicsParams) =>
    [...clinicKeys.lists(), params] as const,
  details: () => [...clinicKeys.all, 'detail'] as const,
  detail: (id: string) => [...clinicKeys.details(), id] as const,
  stats: () => [...clinicKeys.all, 'stats'] as const,
}

// ==============================================
// Queries
// ==============================================

export const useClinics = (params: QueryClinicsParams = {}) => {
  return useQuery({
    queryKey: clinicKeys.list(params),
    queryFn: () => getClinics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useClinicById = (id: string) => {
  return useQuery({
    queryKey: clinicKeys.detail(id),
    queryFn: () => getClinicById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useClinicStats = () => {
  return useQuery({
    queryKey: clinicKeys.stats(),
    queryFn: () => getClinicStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useAllActiveClinics = () => {
  return useQuery({
    queryKey: [...clinicKeys.all, 'active'],
    queryFn: () => getAllActiveClinics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ==============================================
// Mutations
// ==============================================

export const useCreateClinic = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClinicFormData) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isActive, ...clinicData } = data
      return createClinicAction({
        ...clinicData,
        services: clinicData.services || [],
        amenities: clinicData.amenities || [],
      })
    },
    onSuccess: () => {
      toast.success('Clínica creada exitosamente')
      queryClient.invalidateQueries({ queryKey: clinicKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clinicKeys.stats() })
    },
    onError: (error) => {
      console.error('Error creating clinic:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al crear la clínica. Inténtalo de nuevo.'
      )
    },
  })
}

export const useUpdateClinic = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClinicFormData }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isActive, ...clinicData } = data
      return updateClinicAction(id, clinicData)
    },
    onSuccess: (response, { id }) => {
      toast.success('Clínica actualizada exitosamente')
      queryClient.invalidateQueries({ queryKey: clinicKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clinicKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: clinicKeys.stats() })
    },
    onError: (error) => {
      console.error('Error updating clinic:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al actualizar la clínica. Inténtalo de nuevo.'
      )
    },
  })
}

export const useDeleteClinic = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteClinicAction(id),
    onSuccess: (response, id) => {
      toast.success('Clínica eliminada exitosamente')
      queryClient.invalidateQueries({ queryKey: clinicKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clinicKeys.stats() })
      // Remove the deleted clinic from cache
      queryClient.removeQueries({ queryKey: clinicKeys.detail(id) })
    },
    onError: (error) => {
      console.error('Error deleting clinic:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al eliminar la clínica. Inténtalo de nuevo.'
      )
    },
  })
}

// ==============================================
// Utility Hooks
// ==============================================

export const useClinicActions = () => {
  const createClinic = useCreateClinic()
  const updateClinic = useUpdateClinic()
  const deleteClinic = useDeleteClinic()

  return {
    createClinic,
    updateClinic,
    deleteClinic,
    isLoading:
      createClinic.isPending ||
      updateClinic.isPending ||
      deleteClinic.isPending,
  }
}
