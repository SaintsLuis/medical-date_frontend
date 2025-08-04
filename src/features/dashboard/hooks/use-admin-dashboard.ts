'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getAdminDashboardMetrics,
  type AdminDashboardMetrics,
} from '../actions/admin-dashboard-actions'

const adminDashboardKeys = {
  all: ['admin-dashboard'] as const,
  metrics: () => [...adminDashboardKeys.all, 'metrics'] as const,
}

export const useAdminDashboardMetrics = () => {
  return useQuery({
    queryKey: adminDashboardKeys.metrics(),
    queryFn: async (): Promise<AdminDashboardMetrics> => {
      const response = await getAdminDashboardMetrics()

      if (!response.success) {
        throw new Error(
          response.error || 'Error al cargar métricas del dashboard'
        )
      }

      if (!response.data) {
        throw new Error('No se recibieron datos del dashboard')
      }

      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos
  })
}
