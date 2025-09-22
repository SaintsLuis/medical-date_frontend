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
  toggleClinicStatusAction,
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

      // Ensure coordinates are provided
      const finalData = {
        ...clinicData,
        coordinates: clinicData.coordinates || {
          lat: 18.486058,
          lng: -69.931212,
        },
        services: clinicData.services || [],
        amenities: clinicData.amenities || [],
      }

      return createClinicAction(finalData)
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

      // Clear all caches and force refetch
      queryClient.clear()

      // Alternative: More targeted invalidation
      queryClient.invalidateQueries({ queryKey: clinicKeys.all })
      queryClient.refetchQueries({ queryKey: clinicKeys.detail(id) })
      queryClient.refetchQueries({ queryKey: clinicKeys.lists() })

      // Force a hard refresh of the specific clinic
      setTimeout(() => {
        queryClient.resetQueries({ queryKey: clinicKeys.detail(id) })
      }, 100)
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

      // Handle specific error messages from backend
      let errorMessage = 'Error al eliminar la clínica. Inténtalo de nuevo.'

      if (error instanceof Error) {
        const message = error.message.toLowerCase()
        if (
          message.includes('doctores asociados') ||
          message.includes('doctors associated')
        ) {
          errorMessage =
            'No se puede eliminar una clínica que tiene doctores asociados. Primero debe desasociar todos los doctores.'
        } else {
          errorMessage = error.message
        }
      }

      toast.error(errorMessage)
    },
  })
}

/**
 * Hook para cambiar el estado activo/inactivo de una clínica
 */
export const useToggleClinicStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => toggleClinicStatusAction(id),
    onSuccess: (response, id) => {
      const isNowActive = response.success && response.data?.isActive
      toast.success(
        isNowActive
          ? 'Clínica activada exitosamente'
          : 'Clínica desactivada exitosamente'
      )

      // Invalidate all clinic queries to refresh the data
      queryClient.invalidateQueries({ queryKey: clinicKeys.all })
      queryClient.invalidateQueries({ queryKey: clinicKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clinicKeys.stats() })
      queryClient.invalidateQueries({ queryKey: clinicKeys.detail(id) })
    },
    onError: (error) => {
      console.error('Error toggling clinic status:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al cambiar el estado de la clínica. Inténtalo de nuevo.'
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
  const toggleStatus = useToggleClinicStatus()

  return {
    createClinic,
    updateClinic,
    deleteClinic,
    toggleStatus,
    isLoading:
      createClinic.isPending ||
      updateClinic.isPending ||
      deleteClinic.isPending ||
      toggleStatus.isPending,
  }
}
