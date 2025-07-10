'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  getSpecialties,
  getAllActiveSpecialties,
  getSpecialtyById,
  getSpecialtyStats,
  createSpecialtyAction,
  updateSpecialtyAction,
  deleteSpecialtyAction,
} from '../actions/specialty-actions'
import type {
  Specialty,
  SpecialtyStats,
  CreateSpecialtyData,
  UpdateSpecialtyData,
  QuerySpecialtiesParams,
  PaginatedSpecialtiesResponse,
} from '../types'

// ===================================
// Query Keys Factory
// ===================================

export const specialtyKeys = {
  all: ['specialties'] as const,
  lists: () => [...specialtyKeys.all, 'list'] as const,
  list: (params: QuerySpecialtiesParams) =>
    [...specialtyKeys.lists(), params] as const,
  active: () => [...specialtyKeys.all, 'active'] as const,
  details: () => [...specialtyKeys.all, 'detail'] as const,
  detail: (id: string) => [...specialtyKeys.details(), id] as const,
  stats: () => [...specialtyKeys.all, 'stats'] as const,
}

// ===================================
// Query Hooks
// ===================================

/**
 * Hook para obtener especialidades paginadas
 */
export function useSpecialties(params: QuerySpecialtiesParams = {}) {
  return useQuery({
    queryKey: specialtyKeys.list(params),
    queryFn: async (): Promise<PaginatedSpecialtiesResponse> => {
      const result = await getSpecialties(params)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al cargar especialidades')
      }
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener todas las especialidades activas (sin paginación)
 */
export function useAllActiveSpecialties() {
  return useQuery({
    queryKey: specialtyKeys.active(),
    queryFn: async (): Promise<Specialty[]> => {
      const result = await getAllActiveSpecialties()
      if (!result.success || !result.data) {
        throw new Error(
          result.error || 'Error al cargar especialidades activas'
        )
      }
      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 20 * 60 * 1000, // 20 minutos
  })
}

/**
 * Hook para obtener una especialidad por ID
 */
export function useSpecialty(id: string, enabled = true) {
  return useQuery({
    queryKey: specialtyKeys.detail(id),
    queryFn: async (): Promise<Specialty> => {
      const result = await getSpecialtyById(id)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al cargar especialidad')
      }
      return result.data
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener estadísticas de especialidades
 */
export function useSpecialtyStats() {
  return useQuery({
    queryKey: specialtyKeys.stats(),
    queryFn: async (): Promise<SpecialtyStats> => {
      console.log('🔍 Fetching specialty stats...')
      const result = await getSpecialtyStats()

      console.log('📊 Specialty stats result:', {
        success: result.success,
        hasData: !!result.data,
        error: result.error,
        dataStructure: result.data ? Object.keys(result.data) : null,
      })

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al cargar estadísticas')
      }

      // El backend solo devuelve algunos campos, calculamos los faltantes
      const backendStats = result.data

      // Calcular campos faltantes
      const averageDoctorsPerSpecialty =
        backendStats.active > 0
          ? backendStats.withDoctors / backendStats.active
          : 0

      // Crear objeto completo con valores por defecto y campos calculados
      const safeStats: SpecialtyStats = {
        total: backendStats.total ?? 0,
        active: backendStats.active ?? 0,
        deleted: backendStats.deleted ?? 0,
        withDoctors: backendStats.withDoctors ?? 0,
        averageDoctorsPerSpecialty,
        topSpecialties: [], // TODO: Implementar cuando el backend lo soporte
        specialtiesWithoutDoctors: [], // TODO: Implementar cuando el backend lo soporte
      }

      console.log('✅ Safe stats processed:', safeStats)
      return safeStats
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      console.error(`❌ Stats query attempt ${failureCount + 1} failed:`, error)
      return failureCount < 2 // Reintentar hasta 2 veces
    },
  })
}

// ===================================
// Mutation Hooks
// ===================================

/**
 * Hook para crear una nueva especialidad
 */
export function useCreateSpecialty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateSpecialtyData): Promise<Specialty> => {
      const result = await createSpecialtyAction(data)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al crear especialidad')
      }
      return result.data
    },
    onSuccess: (newSpecialty) => {
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: specialtyKeys.all })

      // Mensaje de éxito
      toast.success('Especialidad creada correctamente', {
        description: `La especialidad "${newSpecialty.name}" ha sido creada exitosamente.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al crear especialidad', {
        description: error.message || 'Ha ocurrido un error inesperado.',
      })
    },
  })
}

/**
 * Hook para actualizar una especialidad
 */
export function useUpdateSpecialty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      id: string
      data: UpdateSpecialtyData
    }): Promise<Specialty> => {
      const result = await updateSpecialtyAction(params.id, params.data)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al actualizar especialidad')
      }
      return result.data
    },
    onSuccess: (updatedSpecialty) => {
      // Actualizar la cache específica
      queryClient.setQueryData(
        specialtyKeys.detail(updatedSpecialty.id),
        updatedSpecialty
      )

      // Invalidar listas y estadísticas
      queryClient.invalidateQueries({ queryKey: specialtyKeys.lists() })
      queryClient.invalidateQueries({ queryKey: specialtyKeys.stats() })
      queryClient.invalidateQueries({ queryKey: specialtyKeys.active() })

      // Mensaje de éxito
      toast.success('Especialidad actualizada correctamente', {
        description: `La especialidad "${updatedSpecialty.name}" ha sido actualizada exitosamente.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar especialidad', {
        description: error.message || 'Ha ocurrido un error inesperado.',
      })
    },
  })
}

/**
 * Hook para eliminar una especialidad
 */
export function useDeleteSpecialty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const result = await deleteSpecialtyAction(id)
      if (!result.success) {
        throw new Error(result.error || 'Error al eliminar especialidad')
      }
    },
    onSuccess: (_, deletedId) => {
      // Remover de la cache específica
      queryClient.removeQueries({ queryKey: specialtyKeys.detail(deletedId) })

      // Invalidar todas las listas y estadísticas
      queryClient.invalidateQueries({ queryKey: specialtyKeys.lists() })
      queryClient.invalidateQueries({ queryKey: specialtyKeys.stats() })
      queryClient.invalidateQueries({ queryKey: specialtyKeys.active() })

      // Mensaje de éxito
      toast.success('Especialidad eliminada correctamente', {
        description: 'La especialidad ha sido eliminada del sistema.',
      })
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar especialidad', {
        description: error.message || 'Ha ocurrido un error inesperado.',
      })
    },
  })
}

// ===================================
// Utility Hooks
// ===================================

/**
 * Hook para buscar especialidades con debounce
 */
export function useSpecialtySearch(searchTerm: string, delay = 500) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, delay)

    return () => clearTimeout(timer)
  }, [searchTerm, delay])

  return useSpecialties({
    search: debouncedSearchTerm || undefined,
    limit: 20,
  })
}

/**
 * Hook para prefetch de una especialidad
 */
export function usePrefetchSpecialty() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: specialtyKeys.detail(id),
      queryFn: async () => {
        const result = await getSpecialtyById(id)
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Error al cargar especialidad')
        }
        return result.data
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
    })
  }
}

/**
 * Hook combinado para gestión completa de especialidades
 */
export function useSpecialtyManagement() {
  const createMutation = useCreateSpecialty()
  const updateMutation = useUpdateSpecialty()
  const deleteMutation = useDeleteSpecialty()

  return {
    // Mutations
    createSpecialty: createMutation.mutate,
    updateSpecialty: updateMutation.mutate,
    deleteSpecialty: deleteMutation.mutate,

    // Estados de loading
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Cualquier operación en progreso
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,

    // Funciones async para usar con await
    createSpecialtyAsync: createMutation.mutateAsync,
    updateSpecialtyAsync: updateMutation.mutateAsync,
    deleteSpecialtyAsync: deleteMutation.mutateAsync,
  }
}
