import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from '@/types/appointment'
import { config } from '@/config/app'
import {
  getMockAppointments,
  getMockAppointment,
  cancelMockAppointment,
} from '@/lib/mock/appointments-corrected'

// Query keys para citas
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
}

// Hook para obtener todas las citas
export function useAppointments(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: appointmentKeys.list(filters || {}),
    queryFn: async () => {
      if (config.USE_MOCK_AUTH) {
        return getMockAppointments(filters)
      }
      // apiClient.get expects only the URL and optional RequestInit, not axios-style config
      // So, we need to manually build the query string for filters
      const queryString = filters
        ? '?' +
          Object.entries(filters)
            .map(
              ([key, value]) =>
                encodeURIComponent(key) +
                '=' +
                encodeURIComponent(String(value))
            )
            .join('&')
        : ''
      const response = await apiClient.get<Appointment[]>(
        `/appointments${queryString}`
      )
      return response
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

// Hook para obtener una cita específica
export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: async () => {
      if (config.USE_MOCK_AUTH) {
        return getMockAppointment(id)
      }
      const response = await apiClient.get<Appointment>(`/appointments/${id}`)
      return response
    },
    enabled: !!id, // Solo ejecutar si hay un ID
  })
}

// Hook para crear una nueva cita
export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateAppointmentRequest) => {
      const response = await apiClient.post<Appointment>('/appointments', data)
      return response
    },
    onSuccess: () => {
      // Invalidar y refetch las listas de citas
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
    },
  })
}

// Hook para actualizar una cita
export function useUpdateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateAppointmentRequest
    }) => {
      const response = await apiClient.put<Appointment>(
        `/appointments/${id}`,
        data
      )
      return response
    },
    onSuccess: (data, variables) => {
      // Actualizar la cita específica en el cache
      queryClient.setQueryData(appointmentKeys.detail(variables.id), data)
      // Invalidar las listas de citas
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
    },
  })
}

// Hook para eliminar una cita
export function useDeleteAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/appointments/${id}`)
      return id
    },
    onSuccess: (id) => {
      // Remover la cita del cache
      queryClient.removeQueries({ queryKey: appointmentKeys.detail(id) })
      // Invalidar las listas de citas
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
    },
  })
}

// Hook para cancelar una cita
export function useCancelAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      if (config.USE_MOCK_AUTH) {
        return cancelMockAppointment(id, reason)
      }
      const response = await apiClient.patch<Appointment>(
        `/appointments/${id}/cancel`,
        {
          reason,
        }
      )
      return response
    },
    onSuccess: (data, variables) => {
      // Actualizar la cita específica en el cache
      queryClient.setQueryData(appointmentKeys.detail(variables.id), data)
      // Invalidar las listas de citas
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
    },
  })
}
