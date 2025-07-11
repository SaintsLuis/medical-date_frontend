'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getDoctors,
  getAllDoctors,
  getDoctorById,
  getDoctorStats,
  createDoctorAction,
  updateDoctorAction,
  deleteDoctorAction,
  toggleDoctorStatusAction,
  searchDoctorsAction,
  getDoctorsBySpecialtyAction,
  getDoctorsByLocationAction,
} from '../actions/doctor-actions'
import type {
  CreateDoctorData,
  UpdateDoctorData,
  QueryDoctorsParams,
} from '../types'

// ==============================================
// Query Keys
// ==============================================

export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: (params: QueryDoctorsParams) =>
    [...doctorKeys.lists(), params] as const,
  details: () => [...doctorKeys.all, 'detail'] as const,
  detail: (id: string) => [...doctorKeys.details(), id] as const,
  stats: () => [...doctorKeys.all, 'stats'] as const,
  search: (query: string) => [...doctorKeys.all, 'search', query] as const,
  bySpecialty: (specialtyId: string) =>
    [...doctorKeys.all, 'bySpecialty', specialtyId] as const,
  byLocation: (location: string) =>
    [...doctorKeys.all, 'byLocation', location] as const,
}

// ==============================================
// Hooks de Consulta (Queries)
// ==============================================

/**
 * Hook para obtener la lista paginada de doctores.
 */
export function useDoctors(params: QueryDoctorsParams = {}) {
  return useQuery({
    queryKey: doctorKeys.list(params),
    queryFn: () => getDoctors(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener todos los doctores (sin paginación).
 */
export function useAllDoctors() {
  return useQuery({
    queryKey: doctorKeys.lists(),
    queryFn: getAllDoctors,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para obtener un doctor específico por ID.
 */
export function useDoctor(id: string, enabled = true) {
  return useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: () => getDoctorById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para obtener estadísticas de doctores.
 */
export function useDoctorStats() {
  return useQuery({
    queryKey: doctorKeys.stats(),
    queryFn: getDoctorStats,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para buscar doctores.
 */
export function useDoctorSearch(searchTerm: string) {
  return useQuery({
    queryKey: doctorKeys.search(searchTerm),
    queryFn: () => searchDoctorsAction(searchTerm),
    enabled: searchTerm.length >= 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para obtener doctores por especialidad.
 */
export function useDoctorsBySpecialty(specialtyId: string, enabled = true) {
  return useQuery({
    queryKey: doctorKeys.bySpecialty(specialtyId),
    queryFn: () => getDoctorsBySpecialtyAction(specialtyId),
    enabled: enabled && !!specialtyId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para obtener doctores por ubicación.
 */
export function useDoctorsByLocation(location: string, enabled = true) {
  return useQuery({
    queryKey: doctorKeys.byLocation(location),
    queryFn: () => getDoctorsByLocationAction(location),
    enabled: enabled && !!location,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// ==============================================
// Hooks de Mutación (Mutations)
// ==============================================

/**
 * Hook para crear un nuevo doctor.
 */
export function useCreateDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDoctorData) => createDoctorAction(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Doctor creado exitosamente')
        queryClient.invalidateQueries({ queryKey: doctorKeys.lists() })
        queryClient.invalidateQueries({ queryKey: doctorKeys.stats() })
      } else {
        toast.error(result.error || 'Error al crear doctor')
      }
    },
    onError: (error) => {
      console.error('Create doctor error:', error)
      toast.error('Error al crear doctor')
    },
  })
}

/**
 * Hook para actualizar un doctor existente.
 */
export function useUpdateDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDoctorData }) =>
      updateDoctorAction(id, data),
    onSuccess: (result, { id }) => {
      if (result.success) {
        toast.success('Doctor actualizado exitosamente')
        queryClient.invalidateQueries({ queryKey: doctorKeys.lists() })
        queryClient.invalidateQueries({ queryKey: doctorKeys.detail(id) })
        queryClient.invalidateQueries({ queryKey: doctorKeys.stats() })
      } else {
        toast.error(result.error || 'Error al actualizar doctor')
      }
    },
    onError: (error) => {
      console.error('Update doctor error:', error)
      toast.error('Error al actualizar doctor')
    },
  })
}

/**
 * Hook para eliminar un doctor.
 */
export function useDeleteDoctor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDoctorAction,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Doctor eliminado exitosamente')
        queryClient.invalidateQueries({ queryKey: doctorKeys.lists() })
        queryClient.invalidateQueries({ queryKey: doctorKeys.stats() })
      } else {
        toast.error(result.error || 'Error al eliminar doctor')
      }
    },
    onError: (error) => {
      console.error('Delete doctor error:', error)
      toast.error('Error al eliminar doctor')
    },
  })
}

/**
 * Hook para cambiar el estado activo/inactivo de un doctor.
 */
export function useToggleDoctorStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleDoctorStatusAction,
    onSuccess: (result) => {
      if (result.success) {
        const isActive = result.data?.user.isActive
        toast.success(
          isActive
            ? 'Doctor activado exitosamente'
            : 'Doctor desactivado exitosamente'
        )
        queryClient.invalidateQueries({ queryKey: doctorKeys.lists() })
        queryClient.invalidateQueries({ queryKey: doctorKeys.stats() })
      } else {
        toast.error(result.error || 'Error al cambiar estado del doctor')
      }
    },
    onError: (error) => {
      console.error('Toggle doctor status error:', error)
      toast.error('Error al cambiar estado del doctor')
    },
  })
}

// ==============================================
// Hooks de Utilidad
// ==============================================

/**
 * Hook para prefetch de un doctor específico.
 */
export function usePrefetchDoctor(id: string) {
  const queryClient = useQueryClient()

  return () => {
    queryClient.prefetchQuery({
      queryKey: doctorKeys.detail(id),
      queryFn: () => getDoctorById(id),
      staleTime: 5 * 60 * 1000,
    })
  }
}

/**
 * Hook para gestión completa de doctores (combinación de hooks).
 */
export function useDoctorManagement() {
  const createDoctor = useCreateDoctor()
  const updateDoctor = useUpdateDoctor()
  const deleteDoctor = useDeleteDoctor()
  const toggleDoctorStatus = useToggleDoctorStatus()

  return {
    createDoctor,
    updateDoctor,
    deleteDoctor,
    toggleDoctorStatus,
    isLoading:
      createDoctor.isPending ||
      updateDoctor.isPending ||
      deleteDoctor.isPending ||
      toggleDoctorStatus.isPending,
  }
}
