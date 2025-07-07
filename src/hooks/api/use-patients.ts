import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type {
  Patient,
  CreatePatientData,
  UpdatePatientData,
} from '@/types/patient'

// Query keys para pacientes
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...patientKeys.lists(), filters] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
}

// Hook para obtener todos los pacientes
export function usePatients(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: patientKeys.list(filters || {}),
    queryFn: async () => {
      const response = await apiClient.get<Patient[]>('/patients', {
        params: filters,
      })
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para obtener un paciente específico
export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<Patient>(`/patients/${id}`)
      return response
    },
    enabled: !!id,
  })
}

// Hook para crear un nuevo paciente
export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePatientData) => {
      const response = await apiClient.post<Patient>('/patients', data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
    },
  })
}

// Hook para actualizar un paciente
export function useUpdatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdatePatientData
    }) => {
      const response = await apiClient.put<Patient>(`/patients/${id}`, data)
      return response
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(patientKeys.detail(variables.id), data)
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
    },
  })
}

// Hook para eliminar un paciente
export function useDeletePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/patients/${id}`)
      return id
    },
    onSuccess: (id) => {
      queryClient.removeQueries({ queryKey: patientKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
    },
  })
}
