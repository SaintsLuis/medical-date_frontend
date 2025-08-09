'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getSecretaries,
  getAllSecretaries,
  getSecretaryById,
  getSecretaryStats,
  createSecretaryAction,
  updateSecretaryAction,
  deleteSecretaryAction,
  toggleSecretaryStatusAction,
  assignDoctorsToSecretaryAction,
  unassignDoctorFromSecretaryAction,
  searchSecretariesAction,
  getSecretariesByDoctorAction,
  getAvailableSecretariesAction,
} from '../actions/secretary-actions'
import type {
  UpdateSecretaryData,
  QuerySecretariesParams,
} from '../types/secretary-types'

// ==============================================
// Query Keys
// ==============================================

export const secretaryKeys = {
  all: ['secretaries'] as const,
  lists: () => [...secretaryKeys.all, 'list'] as const,
  list: (params: QuerySecretariesParams) =>
    [...secretaryKeys.lists(), params] as const,
  details: () => [...secretaryKeys.all, 'detail'] as const,
  detail: (id: string) => [...secretaryKeys.details(), id] as const,
  stats: () => [...secretaryKeys.all, 'stats'] as const,
  search: (query: string) => [...secretaryKeys.all, 'search', query] as const,
  byDoctor: (doctorId: string) =>
    [...secretaryKeys.all, 'byDoctor', doctorId] as const,
  available: () => [...secretaryKeys.all, 'available'] as const,
}

// ==============================================
// Hooks de Consulta (Queries)
// ==============================================

/**
 * Hook para obtener la lista paginada de secretarias.
 */
export function useSecretaries(params: QuerySecretariesParams = {}) {
  return useQuery({
    queryKey: secretaryKeys.list(params),
    queryFn: () => getSecretaries(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener todas las secretarias (sin paginación).
 */
export function useAllSecretaries() {
  return useQuery({
    queryKey: secretaryKeys.lists(),
    queryFn: getAllSecretaries,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para obtener una secretaria específica por ID.
 */
export function useSecretary(id: string, enabled = true) {
  return useQuery({
    queryKey: secretaryKeys.detail(id),
    queryFn: () => getSecretaryById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para obtener estadísticas de secretarias.
 */
export function useSecretaryStats() {
  return useQuery({
    queryKey: secretaryKeys.stats(),
    queryFn: getSecretaryStats,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para buscar secretarias.
 */
export function useSecretarySearch(searchTerm: string) {
  return useQuery({
    queryKey: secretaryKeys.search(searchTerm),
    queryFn: () => searchSecretariesAction(searchTerm),
    enabled: searchTerm.length >= 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para obtener secretarias asignadas a un doctor específico.
 */
export function useSecretariesByDoctor(doctorId: string, enabled = true) {
  return useQuery({
    queryKey: secretaryKeys.byDoctor(doctorId),
    queryFn: () => getSecretariesByDoctorAction(doctorId),
    enabled: enabled && !!doctorId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para obtener secretarias disponibles (sin doctores asignados o con capacidad).
 */
export function useAvailableSecretaries() {
  return useQuery({
    queryKey: secretaryKeys.available(),
    queryFn: getAvailableSecretariesAction,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

// ==============================================
// Hooks de Mutación (Mutations)
// ==============================================

/**
 * Hook para crear una nueva secretaria.
 */
export function useCreateSecretary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSecretaryAction,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Secretaria creada exitosamente')
        queryClient.invalidateQueries({ queryKey: secretaryKeys.lists() })
        queryClient.invalidateQueries({ queryKey: secretaryKeys.stats() })
        queryClient.invalidateQueries({ queryKey: secretaryKeys.available() })
      } else {
        toast.error(result.error || 'Error al crear secretaria')
      }
    },
    onError: (error) => {
      console.error('Create secretary error:', error)
      toast.error('Error al crear secretaria')
    },
  })
}

/**
 * Hook para actualizar una secretaria existente.
 */
export function useUpdateSecretary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSecretaryData }) =>
      updateSecretaryAction(id, data),
    onSuccess: (result, { id }) => {
      if (result.success) {
        toast.success('Secretaria actualizada exitosamente')
        queryClient.invalidateQueries({ queryKey: secretaryKeys.lists() })
        queryClient.invalidateQueries({ queryKey: secretaryKeys.detail(id) })
        queryClient.invalidateQueries({ queryKey: secretaryKeys.stats() })
        queryClient.invalidateQueries({ queryKey: secretaryKeys.available() })
      } else {
        toast.error(result.error || 'Error al actualizar secretaria')
      }
    },
    onError: (error) => {
      console.error('Update secretary error:', error)
      toast.error('Error al actualizar secretaria')
    },
  })
}

/**
 * Hook para eliminar una secretaria.
 */
export function useDeleteSecretary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSecretaryAction,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Secretaria eliminada exitosamente')
        queryClient.invalidateQueries({ queryKey: secretaryKeys.lists() })
        queryClient.invalidateQueries({ queryKey: secretaryKeys.stats() })
        queryClient.invalidateQueries({ queryKey: secretaryKeys.available() })
      } else {
        toast.error(result.error || 'Error al eliminar secretaria')
      }
    },
    onError: (error) => {
      console.error('Delete secretary error:', error)
      toast.error('Error al eliminar secretaria')
    },
  })
}

/**
 * Hook para cambiar el estado activo/inactivo de una secretaria.
 */
export function useToggleSecretaryStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleSecretaryStatusAction,
    onSuccess: (result) => {
      if (result.success) {
        const isActive = result.data?.isActive
        toast.success(
          isActive
            ? 'Secretaria activada exitosamente'
            : 'Secretaria desactivada exitosamente'
        )
        queryClient.invalidateQueries({ queryKey: secretaryKeys.lists() })
        queryClient.invalidateQueries({ queryKey: secretaryKeys.stats() })
        queryClient.invalidateQueries({ queryKey: secretaryKeys.available() })
      } else {
        toast.error(result.error || 'Error al cambiar estado de la secretaria')
      }
    },
    onError: (error) => {
      console.error('Toggle secretary status error:', error)
      toast.error('Error al cambiar estado de la secretaria')
    },
  })
}

/**
 * Hook para asignar doctores a una secretaria.
 */
export function useAssignDoctorsToSecretary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      secretaryId,
      doctorIds,
    }: {
      secretaryId: string
      doctorIds: string[]
    }) => assignDoctorsToSecretaryAction(secretaryId, doctorIds),
    onSuccess: (result, { secretaryId }) => {
      if (result.success) {
        toast.success('Doctores asignados exitosamente')
        queryClient.invalidateQueries({ queryKey: secretaryKeys.lists() })
        queryClient.invalidateQueries({
          queryKey: secretaryKeys.detail(secretaryId),
        })
        queryClient.invalidateQueries({ queryKey: secretaryKeys.stats() })
        queryClient.invalidateQueries({ queryKey: secretaryKeys.available() })
      } else {
        toast.error(result.error || 'Error al asignar doctores')
      }
    },
    onError: (error) => {
      console.error('Assign doctors error:', error)
      toast.error('Error al asignar doctores')
    },
  })
}

/**
 * Hook para desasignar un doctor de una secretaria.
 */
export function useUnassignDoctorFromSecretary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      secretaryId,
      doctorId,
    }: {
      secretaryId: string
      doctorId: string
    }) => unassignDoctorFromSecretaryAction(secretaryId, doctorId),
    onSuccess: (result, { secretaryId }) => {
      if (result.success) {
        toast.success('Doctor desasignado exitosamente')
        queryClient.invalidateQueries({ queryKey: secretaryKeys.lists() })
        queryClient.invalidateQueries({
          queryKey: secretaryKeys.detail(secretaryId),
        })
        queryClient.invalidateQueries({ queryKey: secretaryKeys.stats() })
        queryClient.invalidateQueries({ queryKey: secretaryKeys.available() })
      } else {
        toast.error(result.error || 'Error al desasignar doctor')
      }
    },
    onError: (error) => {
      console.error('Unassign doctor error:', error)
      toast.error('Error al desasignar doctor')
    },
  })
}

// ==============================================
// Hooks de Utilidad
// ==============================================

/**
 * Hook para prefetch de una secretaria específica.
 */
export function usePrefetchSecretary(id: string) {
  const queryClient = useQueryClient()

  return () => {
    queryClient.prefetchQuery({
      queryKey: secretaryKeys.detail(id),
      queryFn: () => getSecretaryById(id),
      staleTime: 5 * 60 * 1000,
    })
  }
}

/**
 * Hook para gestión completa de secretarias (combinación de hooks).
 */
export function useSecretaryManagement() {
  const createSecretary = useCreateSecretary()
  const updateSecretary = useUpdateSecretary()
  const deleteSecretary = useDeleteSecretary()
  const toggleSecretaryStatus = useToggleSecretaryStatus()
  const assignDoctors = useAssignDoctorsToSecretary()
  const unassignDoctor = useUnassignDoctorFromSecretary()

  return {
    createSecretary,
    updateSecretary,
    deleteSecretary,
    toggleSecretaryStatus,
    assignDoctors,
    unassignDoctor,
    isLoading:
      createSecretary.isPending ||
      updateSecretary.isPending ||
      deleteSecretary.isPending ||
      toggleSecretaryStatus.isPending ||
      assignDoctors.isPending ||
      unassignDoctor.isPending,
  }
}
