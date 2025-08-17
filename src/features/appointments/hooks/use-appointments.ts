'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store/auth'
import type {
  CreateAppointmentData,
  UpdateAppointmentData,
  QueryAppointmentsParams,
  QueryDoctorAvailabilityParams,
} from '../types'
import {
  getAppointments,
  getAppointmentById,
  createAppointmentAction,
  updateAppointmentAction,
  cancelAppointmentAction,
  getDoctorAvailabilityAction,
  getAppointmentStatsAction,
} from '../actions/appointment-actions'

// ==============================================
// Hooks de Consulta (GET)
// ==============================================

export function useAppointments(params: QueryAppointmentsParams = {}) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['appointments', user?.id, params],
    queryFn: () => getAppointments(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!user, // Solo ejecutar si hay usuario autenticado
  })
}

export function useAppointment(id: string, enabled = true) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['appointments', user?.id, id],
    queryFn: () => getAppointmentById(id),
    enabled: enabled && !!id && !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useDoctorAvailability(
  params: QueryDoctorAvailabilityParams,
  enabled = true
) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['doctor-availability', user?.id, params],
    queryFn: () => getDoctorAvailabilityAction(params),
    enabled: enabled && !!params.doctorId && !!params.date && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos para disponibilidad
    gcTime: 5 * 60 * 1000,
  })
}

export function useAppointmentStats() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['appointment-stats', user?.id],
    queryFn: () => getAppointmentStatsAction(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// ==============================================
// Hooks de Mutación (POST, PATCH, DELETE)
// ==============================================

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (data: CreateAppointmentData) => createAppointmentAction(data),
    onSuccess: () => {
      // Invalidar queries relacionadas CON user ID
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id] })
      queryClient.invalidateQueries({
        queryKey: ['appointment-stats', user?.id],
      })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user?.id] })
    },
    onError: (error) => {
      console.error('Error creating appointment:', error)
    },
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentData }) =>
      updateAppointmentAction(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar queries relacionadas CON user ID
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id] })
      queryClient.invalidateQueries({
        queryKey: ['appointments', user?.id, id],
      })
      queryClient.invalidateQueries({
        queryKey: ['appointment-stats', user?.id],
      })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user?.id] })
    },
    onError: (error) => {
      console.error('Error updating appointment:', error)
    },
  })
}

export function useCancelAppointment() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelAppointmentAction(id, reason),
    onSuccess: (_, { id }) => {
      // Invalidar queries relacionadas CON user ID
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id] })
      queryClient.invalidateQueries({
        queryKey: ['appointments', user?.id, id],
      })
      queryClient.invalidateQueries({
        queryKey: ['appointment-stats', user?.id],
      })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user?.id] })
    },
    onError: (error) => {
      console.error('Error canceling appointment:', error)
    },
  })
}

// ==============================================
// Hooks de Conveniencia
// ==============================================

export function useAppointmentsByStatus(status: string) {
  return useAppointments({
    status: status as
      | 'SCHEDULED'
      | 'CONFIRMED'
      | 'CANCELLED'
      | 'COMPLETED'
      | 'NO_SHOW',
    includePatient: true,
    includeDoctor: true,
  })
}

export function useAppointmentsByDoctor(doctorId: string) {
  return useAppointments({
    doctorId,
    includePatient: true,
    includeDoctor: true,
  })
}

export function useAppointmentsByPatient(patientId: string) {
  return useAppointments({
    patientId,
    includePatient: true,
    includeDoctor: true,
  })
}

export function useTodayAppointments() {
  return useAppointments({
    todayOnly: true,
    includePatient: true,
    includeDoctor: true,
  })
}

export function useUpcomingAppointments() {
  const today = new Date().toISOString().split('T')[0]
  return useAppointments({
    startDate: today,
    includePatient: true,
    includeDoctor: true,
    sortByDate: 'asc',
  })
}

export function usePastAppointments() {
  const today = new Date().toISOString().split('T')[0]
  return useAppointments({
    endDate: today,
    includePatient: true,
    includeDoctor: true,
    sortByDate: 'desc',
  })
}

// ==============================================
// Hooks de Gestión de Estado
// ==============================================

export function useAppointmentManagement() {
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()
  const cancelAppointment = useCancelAppointment()

  return {
    createAppointment,
    updateAppointment,
    cancelAppointment,
    isLoading:
      createAppointment.isPending ||
      updateAppointment.isPending ||
      cancelAppointment.isPending,
    error:
      createAppointment.error ||
      updateAppointment.error ||
      cancelAppointment.error,
  }
}

// ==============================================
// Hooks de Prefetch
// ==============================================

export function usePrefetchAppointment(id: string) {
  const queryClient = useQueryClient()

  return () => {
    queryClient.prefetchQuery({
      queryKey: ['appointments', id],
      queryFn: () => getAppointmentById(id),
      staleTime: 5 * 60 * 1000,
    })
  }
}

export function usePrefetchDoctorAvailability(
  params: QueryDoctorAvailabilityParams
) {
  const queryClient = useQueryClient()

  return () => {
    queryClient.prefetchQuery({
      queryKey: ['doctor-availability', params],
      queryFn: () => getDoctorAvailabilityAction(params),
      staleTime: 2 * 60 * 1000,
    })
  }
}

// ==============================================
// Hooks de Filtros y Búsqueda
// ==============================================

export function useAppointmentSearch(searchTerm: string) {
  const { data, isLoading, error } = useAppointments({
    includePatient: true,
    includeDoctor: true,
  })

  // Filtrar por término de búsqueda en el cliente
  const filteredAppointments =
    data?.data?.data?.filter((appointment) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        appointment.patient?.firstName?.toLowerCase().includes(searchLower) ||
        appointment.patient?.lastName?.toLowerCase().includes(searchLower) ||
        appointment.doctor?.firstName?.toLowerCase().includes(searchLower) ||
        appointment.doctor?.lastName?.toLowerCase().includes(searchLower) ||
        appointment.notes?.toLowerCase().includes(searchLower)
      )
    }) || []

  return {
    appointments: filteredAppointments,
    meta: data?.data?.meta,
    isLoading,
    error,
  }
}

export function useAppointmentsByDateRange(startDate: string, endDate: string) {
  return useAppointments({
    startDate,
    endDate,
    includePatient: true,
    includeDoctor: true,
    sortByDate: 'asc',
  })
}

// ==============================================
// Hooks de Analytics y Reportes
// ==============================================

export function useAppointmentAnalytics() {
  const { data: stats, isLoading, error } = useAppointmentStats()

  return {
    stats: stats?.data,
    isLoading,
    error,
    // Métricas calculadas
    completionRate: stats?.data
      ? (stats.data.completed / stats.data.total) * 100
      : 0,
    cancellationRate: stats?.data
      ? (stats.data.cancelled / stats.data.total) * 100
      : 0,
    noShowRate: stats?.data ? (stats.data.noShow / stats.data.total) * 100 : 0,
    virtualRate: stats?.data
      ? (stats.data.virtual / stats.data.total) * 100
      : 0,
  }
}

export function useAppointmentTrends() {
  const { data: stats, isLoading, error } = useAppointmentStats()

  return {
    trends: {
      today: stats?.data?.today || 0,
      thisWeek: stats?.data?.thisWeek || 0,
      thisMonth: stats?.data?.thisMonth || 0,
    },
    isLoading,
    error,
  }
}
