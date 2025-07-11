'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback, useMemo } from 'react'
import {
  getClinics,
  getAllClinics,
  getAllActiveClinics,
  getClinicById,
  getClinicStats,
  createClinicAction,
  updateClinicAction,
  deleteClinicAction,
  toggleClinicStatusAction,
  searchClinicsAction,
  getClinicsByLocationAction,
  getClinicsByCityAction,
  getClinicsByServicesAction,
  getClinicsByAmenitiesAction,
  getClinicsNearbyAction,
  exportClinicsAction,
} from '../actions/clinic-actions'
import {
  Clinic,
  QueryClinicsParams,
  CreateClinicData,
  UpdateClinicData,
  PaginatedClinicsResponse,
  BackendClinicStats,
} from '../types'

// ==============================================
// Query Keys para React Query
// ==============================================

export const clinicKeys = {
  all: ['clinics'] as const,
  lists: () => [...clinicKeys.all, 'list'] as const,
  list: (params: QueryClinicsParams) =>
    [...clinicKeys.lists(), params] as const,
  details: () => [...clinicKeys.all, 'detail'] as const,
  detail: (id: string) => [...clinicKeys.details(), id] as const,
  stats: () => [...clinicKeys.all, 'stats'] as const,
  search: (query: string) => [...clinicKeys.all, 'search', query] as const,
  byLocation: (location: string) =>
    [...clinicKeys.all, 'by-location', location] as const,
  byCity: (city: string) => [...clinicKeys.all, 'by-city', city] as const,
  byServices: (services: string[]) =>
    [...clinicKeys.all, 'by-services', services] as const,
  byAmenities: (amenities: string[]) =>
    [...clinicKeys.all, 'by-amenities', amenities] as const,
  nearby: (lat: number, lng: number, radius: number) =>
    [...clinicKeys.all, 'nearby', lat, lng, radius] as const,
}

// ==============================================
// Hooks para Consultas (Queries)
// ==============================================

/**
 * Hook para obtener lista paginada de clínicas.
 */
export function useClinics(params: QueryClinicsParams = {}) {
  return useQuery({
    queryKey: clinicKeys.list(params),
    queryFn: async (): Promise<PaginatedClinicsResponse> => {
      const result = await getClinics(params)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al cargar clínicas')
      }
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para obtener todas las clínicas.
 */
export function useAllClinics() {
  return useQuery({
    queryKey: clinicKeys.lists(),
    queryFn: async (): Promise<Clinic[]> => {
      const result = await getAllClinics()
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al cargar clínicas')
      }
      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener todas las clínicas activas.
 */
export function useAllActiveClinics() {
  return useQuery({
    queryKey: [...clinicKeys.all, 'active'],
    queryFn: async (): Promise<Clinic[]> => {
      const result = await getAllActiveClinics()
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al cargar clínicas activas')
      }
      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener una clínica específica por ID.
 */
export function useClinic(id: string, enabled = true) {
  return useQuery({
    queryKey: clinicKeys.detail(id),
    queryFn: async (): Promise<Clinic> => {
      const result = await getClinicById(id)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al cargar clínica')
      }
      return result.data
    },
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para obtener estadísticas de clínicas.
 */
export function useClinicStats() {
  return useQuery({
    queryKey: clinicKeys.stats(),
    queryFn: async (): Promise<BackendClinicStats> => {
      const result = await getClinicStats()
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al cargar estadísticas')
      }
      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para buscar clínicas.
 */
export function useClinicSearch(searchTerm: string, delay = 500) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)

  // Debounce del término de búsqueda
  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, delay)

    return () => clearTimeout(timer)
  }, [searchTerm, delay])

  return useQuery({
    queryKey: clinicKeys.search(debouncedSearchTerm),
    queryFn: async (): Promise<Clinic[]> => {
      if (!debouncedSearchTerm) return []
      const result = await searchClinicsAction(debouncedSearchTerm)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error en la búsqueda')
      }
      return result.data
    },
    enabled: debouncedSearchTerm.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

/**
 * Hook para obtener clínicas por ubicación.
 */
export function useClinicsByLocation(location: string, enabled = true) {
  return useQuery({
    queryKey: clinicKeys.byLocation(location),
    queryFn: async (): Promise<Clinic[]> => {
      const result = await getClinicsByLocationAction(location)
      if (!result.success || !result.data) {
        throw new Error(
          result.error || 'Error al cargar clínicas por ubicación'
        )
      }
      return result.data
    },
    enabled: !!location && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener clínicas por ciudad.
 */
export function useClinicsByCity(city: string, enabled = true) {
  return useQuery({
    queryKey: clinicKeys.byCity(city),
    queryFn: async (): Promise<Clinic[]> => {
      const result = await getClinicsByCityAction(city)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al cargar clínicas por ciudad')
      }
      return result.data
    },
    enabled: !!city && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener clínicas por servicios.
 */
export function useClinicsByServices(services: string[], enabled = true) {
  return useQuery({
    queryKey: clinicKeys.byServices(services),
    queryFn: async (): Promise<Clinic[]> => {
      const result = await getClinicsByServicesAction(services)
      if (!result.success || !result.data) {
        throw new Error(
          result.error || 'Error al cargar clínicas por servicios'
        )
      }
      return result.data
    },
    enabled: services.length > 0 && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener clínicas por amenidades.
 */
export function useClinicsByAmenities(amenities: string[], enabled = true) {
  return useQuery({
    queryKey: clinicKeys.byAmenities(amenities),
    queryFn: async (): Promise<Clinic[]> => {
      const result = await getClinicsByAmenitiesAction(amenities)
      if (!result.success || !result.data) {
        throw new Error(
          result.error || 'Error al cargar clínicas por amenidades'
        )
      }
      return result.data
    },
    enabled: amenities.length > 0 && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener clínicas cercanas.
 */
export function useClinicsNearby(
  lat: number,
  lng: number,
  radius = 10,
  enabled = true
) {
  return useQuery({
    queryKey: clinicKeys.nearby(lat, lng, radius),
    queryFn: async (): Promise<Clinic[]> => {
      const result = await getClinicsNearbyAction(lat, lng, radius)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al cargar clínicas cercanas')
      }
      return result.data
    },
    enabled: lat !== 0 && lng !== 0 && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// ==============================================
// Hooks para Mutaciones
// ==============================================

/**
 * Hook para crear una nueva clínica.
 */
export function useCreateClinic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateClinicData) => {
      const result = await createClinicAction(data)
      if (!result.success) {
        throw new Error(result.error || 'Error al crear clínica')
      }
      return result.data
    },
    onSuccess: () => {
      // Invalidar todas las queries relacionadas con clínicas
      queryClient.invalidateQueries({ queryKey: clinicKeys.all })
    },
    onError: (error) => {
      console.error('Error al crear clínica:', error)
    },
  })
}

/**
 * Hook para actualizar una clínica.
 */
export function useUpdateClinic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateClinicData
    }) => {
      const result = await updateClinicAction(id, data)
      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar clínica')
      }
      return result.data
    },
    onSuccess: (updatedClinic, { id }) => {
      // Actualizar cache específico de la clínica
      queryClient.setQueryData(clinicKeys.detail(id), updatedClinic)

      // Invalidar listas para reflejar cambios
      queryClient.invalidateQueries({ queryKey: clinicKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clinicKeys.stats() })
    },
    onError: (error) => {
      console.error('Error al actualizar clínica:', error)
    },
  })
}

/**
 * Hook para eliminar una clínica.
 */
export function useDeleteClinic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteClinicAction(id)
      if (!result.success) {
        throw new Error(result.error || 'Error al eliminar clínica')
      }
      return result.data
    },
    onSuccess: (_, deletedId) => {
      // Remover de cache específico
      queryClient.removeQueries({ queryKey: clinicKeys.detail(deletedId) })

      // Invalidar listas y estadísticas
      queryClient.invalidateQueries({ queryKey: clinicKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clinicKeys.stats() })
    },
    onError: (error) => {
      console.error('Error al eliminar clínica:', error)
    },
  })
}

/**
 * Hook para cambiar el estado de una clínica.
 */
export function useToggleClinicStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await toggleClinicStatusAction(id)
      if (!result.success) {
        throw new Error(result.error || 'Error al cambiar estado de clínica')
      }
      return result.data
    },
    onMutate: async (id) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: clinicKeys.detail(id) })

      // Obtener datos actuales
      const previousClinic = queryClient.getQueryData<Clinic>(
        clinicKeys.detail(id)
      )

      // Actualización optimista
      if (previousClinic) {
        queryClient.setQueryData(clinicKeys.detail(id), {
          ...previousClinic,
          isActive: !previousClinic.isActive,
        })
      }

      return { previousClinic }
    },
    onError: (error, id, context) => {
      // Revertir cambio optimista
      if (context?.previousClinic) {
        queryClient.setQueryData(clinicKeys.detail(id), context.previousClinic)
      }
      console.error('Error al cambiar estado de clínica:', error)
    },
    onSettled: (_, __, id) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: clinicKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: clinicKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clinicKeys.stats() })
    },
  })
}

/**
 * Hook para exportar clínicas.
 */
export function useExportClinics() {
  return useMutation({
    mutationFn: async (format: 'csv' | 'excel' = 'csv') => {
      const result = await exportClinicsAction(format)
      if (!result.success) {
        throw new Error(result.error || 'Error al exportar clínicas')
      }
      return result.data
    },
    onSuccess: (data) => {
      // Crear un enlace temporal para descargar el archivo
      if (data?.downloadUrl) {
        const link = document.createElement('a')
        link.href = data.downloadUrl
        link.download = `clinicas_${new Date().toISOString().split('T')[0]}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },
    onError: (error) => {
      console.error('Error al exportar clínicas:', error)
    },
  })
}

// ==============================================
// Hooks Utilitarios
// ==============================================

/**
 * Hook para prefetch de una clínica específica.
 */
export function usePrefetchClinic() {
  const queryClient = useQueryClient()

  return useCallback(
    (id: string) => {
      queryClient.prefetchQuery({
        queryKey: clinicKeys.detail(id),
        queryFn: async () => {
          const result = await getClinicById(id)
          if (!result.success || !result.data) {
            throw new Error(result.error || 'Error al cargar clínica')
          }
          return result.data
        },
        staleTime: 5 * 60 * 1000,
      })
    },
    [queryClient]
  )
}

/**
 * Hook combinado para gestión completa de clínicas.
 */
export function useClinicManagement() {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const createMutation = useCreateClinic()
  const updateMutation = useUpdateClinic()
  const deleteMutation = useDeleteClinic()
  const toggleStatusMutation = useToggleClinicStatus()

  const isLoading = useMemo(
    () =>
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      toggleStatusMutation.isPending,
    [
      createMutation.isPending,
      updateMutation.isPending,
      deleteMutation.isPending,
      toggleStatusMutation.isPending,
    ]
  )

  const handleCreate = useCallback(
    async (data: CreateClinicData) => {
      try {
        await createMutation.mutateAsync(data)
        setIsFormOpen(false)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        }
      }
    },
    [createMutation]
  )

  const handleUpdate = useCallback(
    async (id: string, data: UpdateClinicData) => {
      try {
        const result = await updateMutation.mutateAsync({ id, data })
        setSelectedClinic(null)
        setIsFormOpen(false)
        return { success: true, data: result }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        }
      }
    },
    [updateMutation]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id)
        setSelectedClinic(null)
        setIsDeleteDialogOpen(false)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        }
      }
    },
    [deleteMutation]
  )

  const handleToggleStatus = useCallback(
    async (id: string) => {
      try {
        await toggleStatusMutation.mutateAsync(id)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        }
      }
    },
    [toggleStatusMutation]
  )

  return {
    // Estado
    selectedClinic,
    setSelectedClinic,
    isFormOpen,
    setIsFormOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isLoading,

    // Acciones
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleStatus,

    // Mutaciones originales para acceso directo
    createMutation,
    updateMutation,
    deleteMutation,
    toggleStatusMutation,
  }
}
