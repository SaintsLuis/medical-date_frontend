// src/features/patients/hooks/use-patients.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getPatients,
  getAllPatients,
  getPatientById,
  getPatientStats,
  updatePatientAction,
  deletePatientAction,
  searchPatientsAction,
  getPatientsByGenderAction,
  getPatientsByBloodTypeAction,
  getPatientsByLocationAction,
  getPatientsWithAllergiesAction,
  getPatientsByAgeRangeAction,
  getPatientMedicalHistoryAction,
  getPatientAppointmentsAction,
  exportPatientsAction,
  getPatientAnalyticsAction,
} from '../actions/patient-actions'
import type { QueryPatientsParams, UpdatePatientData } from '../types'

// ==============================================
// Hooks de Consulta (Queries)
// ==============================================

/**
 * Hook para obtener lista paginada de pacientes.
 */
export function usePatients(params: QueryPatientsParams = {}) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => getPatients(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener todos los pacientes (sin paginación).
 */
export function useAllPatients() {
  return useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => getAllPatients(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  })
}

/**
 * Hook para obtener un paciente específico por ID.
 */
export function usePatient(id: string, enabled = true) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => getPatientById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener estadísticas de pacientes.
 */
export function usePatientStats() {
  return useQuery({
    queryKey: ['patients', 'stats'],
    queryFn: () => getPatientStats(),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para búsqueda de pacientes.
 */
export function usePatientSearch(searchTerm: string) {
  return useQuery({
    queryKey: ['patients', 'search', searchTerm],
    queryFn: () => searchPatientsAction(searchTerm),
    enabled: searchTerm.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para obtener pacientes por género.
 */
export function usePatientsByGender(gender: string, enabled = true) {
  return useQuery({
    queryKey: ['patients', 'gender', gender],
    queryFn: () => getPatientsByGenderAction(gender),
    enabled: enabled && !!gender,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener pacientes por tipo de sangre.
 */
export function usePatientsByBloodType(bloodType: string, enabled = true) {
  return useQuery({
    queryKey: ['patients', 'bloodType', bloodType],
    queryFn: () => getPatientsByBloodTypeAction(bloodType),
    enabled: enabled && !!bloodType,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener pacientes por ubicación.
 */
export function usePatientsByLocation(location: string, enabled = true) {
  return useQuery({
    queryKey: ['patients', 'location', location],
    queryFn: () => getPatientsByLocationAction(location),
    enabled: enabled && !!location,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener pacientes con alergias.
 */
export function usePatientsWithAllergies() {
  return useQuery({
    queryKey: ['patients', 'allergies'],
    queryFn: () => getPatientsWithAllergiesAction(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener pacientes por rango de edad.
 */
export function usePatientsByAgeRange(
  minAge: number,
  maxAge: number,
  enabled = true
) {
  return useQuery({
    queryKey: ['patients', 'ageRange', minAge, maxAge],
    queryFn: () => getPatientsByAgeRangeAction(minAge, maxAge),
    enabled: enabled && minAge >= 0 && maxAge > minAge,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para obtener historial médico de un paciente.
 */
export function usePatientMedicalHistory(patientId: string, enabled = true) {
  return useQuery({
    queryKey: ['patients', patientId, 'medical-history'],
    queryFn: () => getPatientMedicalHistoryAction(patientId),
    enabled: enabled && !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para obtener citas de un paciente.
 */
export function usePatientAppointments(patientId: string, enabled = true) {
  return useQuery({
    queryKey: ['patients', patientId, 'appointments'],
    queryFn: () => getPatientAppointmentsAction(patientId),
    enabled: enabled && !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para obtener análisis de pacientes.
 */
export function usePatientAnalytics() {
  return useQuery({
    queryKey: ['patients', 'analytics'],
    queryFn: () => getPatientAnalyticsAction(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

// ==============================================
// Hooks de Mutación (Mutations)
// ==============================================

/**
 * Hook para actualizar paciente.
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientData }) =>
      updatePatientAction(id, data),
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['patients'] })
        queryClient.invalidateQueries({ queryKey: ['patients', variables.id] })
        queryClient.invalidateQueries({ queryKey: ['patients', 'stats'] })

        toast.success('Paciente actualizado correctamente')
      } else {
        toast.error(result.error || 'Error al actualizar paciente')
      }
    },
    onError: (error) => {
      console.error('Error updating patient:', error)
      toast.error('Error al actualizar paciente')
    },
  })
}

/**
 * Hook para eliminar paciente.
 */
export function useDeletePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePatientAction(id),
    onSuccess: (result, patientId) => {
      if (result.success) {
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['patients'] })
        queryClient.invalidateQueries({ queryKey: ['patients', 'stats'] })
        queryClient.removeQueries({ queryKey: ['patients', patientId] })

        toast.success('Paciente eliminado correctamente')
      } else {
        toast.error(result.error || 'Error al eliminar paciente')
      }
    },
    onError: (error) => {
      console.error('Error deleting patient:', error)
      toast.error('Error al eliminar paciente')
    },
  })
}

/**
 * Hook para exportar pacientes.
 */
export function useExportPatients() {
  return useMutation({
    mutationFn: (format: 'csv' | 'excel') => exportPatientsAction(format),
    onSuccess: (result) => {
      if (result.success && result.data?.downloadUrl) {
        // Descargar archivo
        const link = document.createElement('a')
        link.href = result.data.downloadUrl
        link.download = `pacientes.${
          result.data.downloadUrl.includes('csv') ? 'csv' : 'xlsx'
        }`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success('Archivo exportado correctamente')
      } else {
        toast.error(result.error || 'Error al exportar pacientes')
      }
    },
    onError: (error) => {
      console.error('Error exporting patients:', error)
      toast.error('Error al exportar pacientes')
    },
  })
}

// ==============================================
// Hooks de Utilidad
// ==============================================

/**
 * Hook para prefetch de paciente.
 */
export function usePrefetchPatient(id: string) {
  const queryClient = useQueryClient()

  return () => {
    queryClient.prefetchQuery({
      queryKey: ['patients', id],
      queryFn: () => getPatientById(id),
      staleTime: 5 * 60 * 1000, // 5 minutos
    })
  }
}

/**
 * Hook para gestión completa de pacientes.
 */
export function usePatientManagement() {
  const patients = usePatients()
  const stats = usePatientStats()
  const updateMutation = useUpdatePatient()
  const deleteMutation = useDeletePatient()
  const exportMutation = useExportPatients()

  return {
    // Datos
    patients: patients.data?.data || [],
    meta: patients.data?.data?.meta,
    stats: stats.data,

    // Estados de carga
    isLoading: patients.isLoading || stats.isLoading,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isExporting: exportMutation.isPending,

    // Estados de error
    error: patients.error || stats.error,

    // Mutaciones
    updatePatient: updateMutation.mutate,
    deletePatient: deleteMutation.mutate,
    exportPatients: exportMutation.mutate,

    // Refetch
    refetch: patients.refetch,
    refetchStats: stats.refetch,
  }
}
