'use client'

import { useQuery } from '@tanstack/react-query'
import { getAppointments } from '@/features/appointments/actions/appointment-actions'
import { getPrescriptionsAction } from '@/features/prescriptions/actions/prescription-actions'
import { getMedicalRecordsAction } from '@/features/medical-records/actions/medical-records-actions'
import { getDoctorBillingStatsAction } from '@/features/billing/actions/billing-actions'
import { getMedicalRecordCategoryLabel } from '@/constants/medical-record-categories'

// Tipos para las métricas del dashboard
export interface DoctorDashboardMetrics {
  appointments: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
    todayAppointments: number
    weekAppointments: number
  }
  prescriptions: {
    total: number
    active: number
    expired: number
    thisMonthPrescriptions: number
  }
  medicalRecords: {
    total: number
    thisMonthRecords: number
    categoriesBreakdown: Array<{
      category: string
      count: number
    }>
  }
  billing: {
    totalRevenue: number
    thisMonthRevenue: number
    pendingPayments: number
    completedPayments: number
  }
}

export interface AppointmentTrend {
  date: string
  count: number
}

export interface RevenueTrend {
  month: string
  revenue: number
}

export interface AppointmentStatusStats {
  name: string
  value: number
  color: string
}

// Hook para obtener métricas generales del doctor
export function useDoctorDashboardMetrics() {
  return useQuery({
    queryKey: ['doctor-dashboard-metrics'],
    queryFn: async (): Promise<DoctorDashboardMetrics> => {
      // Hacemos múltiples llamadas a las acciones existentes
      const today = new Date().toISOString().split('T')[0]
      const startOfYear = new Date(new Date().getFullYear(), 0, 1)
        .toISOString()
        .split('T')[0]
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      const thisMonth = new Date().toISOString().split('T')[0].substring(0, 7) // YYYY-MM

      const [
        appointmentsResult,
        prescriptionsResult,
        medicalRecordsResult,
        billingResult,
      ] = await Promise.all([
        getAppointments({
          page: 1,
          limit: 100,
          startDate: startOfYear,
          endDate: today,
        }),
        getPrescriptionsAction({
          page: 1,
          limit: 100,
        }),
        getMedicalRecordsAction({
          page: 1,
          limit: 100,
          startDate: startOfYear,
          endDate: today,
        }),
        getDoctorBillingStatsAction().catch(() => ({
          success: false,
          data: null,
        })), // Billing puede no existir aún
      ])

      // Validar respuestas
      if (!appointmentsResult.success) {
        throw new Error(appointmentsResult.error || 'Error al obtener citas')
      }
      if (!prescriptionsResult.success) {
        throw new Error(
          prescriptionsResult.error || 'Error al obtener prescripciones'
        )
      }
      if (!medicalRecordsResult.success) {
        throw new Error(
          medicalRecordsResult.error || 'Error al obtener expedientes'
        )
      }

      const appointments = appointmentsResult.data?.data || []
      const prescriptions = prescriptionsResult.data?.data || []
      const medicalRecords = medicalRecordsResult.data?.data || []

      // Calcular métricas de citas
      const appointmentMetrics = {
        total: appointments.length,
        pending: appointments.filter((apt) => apt.status === 'SCHEDULED')
          .length,
        confirmed: appointments.filter((apt) => apt.status === 'CONFIRMED')
          .length,
        completed: appointments.filter((apt) => apt.status === 'COMPLETED')
          .length,
        cancelled: appointments.filter((apt) => apt.status === 'CANCELLED')
          .length,
        todayAppointments: appointments.filter(
          (apt) => apt.date?.split('T')[0] === today
        ).length,
        weekAppointments: appointments.filter(
          (apt) => apt.date?.split('T')[0] >= oneWeekAgo
        ).length,
      }

      // Calcular métricas de prescripciones
      const prescriptionMetrics = {
        total: prescriptions.length,
        active: prescriptions.filter((presc) => presc.status === 'ACTIVE')
          .length,
        expired: prescriptions.filter((presc) => presc.status === 'EXPIRED')
          .length,
        thisMonthPrescriptions: prescriptions.filter(
          (presc) => presc.createdAt?.substring(0, 7) === thisMonth
        ).length,
      }

      // Calcular métricas de expedientes médicos
      const categoriesMap = new Map<string, number>()
      medicalRecords.forEach((record) => {
        const category = record.category || 'Sin categoría'
        // Traducir la categoría al español
        const translatedCategory = getMedicalRecordCategoryLabel(category)
        categoriesMap.set(
          translatedCategory,
          (categoriesMap.get(translatedCategory) || 0) + 1
        )
      })

      const medicalRecordMetrics = {
        total: medicalRecords.length,
        thisMonthRecords: medicalRecords.filter(
          (record) => record.date?.substring(0, 7) === thisMonth
        ).length,
        categoriesBreakdown: Array.from(categoriesMap.entries()).map(
          ([category, count]) => ({
            category,
            count,
          })
        ),
      }

      // Calcular métricas de facturación
      const billingData = billingResult.success ? billingResult.data : null

      const billingMetrics = {
        totalRevenue: billingData?.invoices?.totalRevenue || 0,
        thisMonthRevenue:
          Array.isArray(billingData?.monthlyRevenue) &&
          billingData.monthlyRevenue.length > 0
            ? billingData.monthlyRevenue[billingData.monthlyRevenue.length - 1]
                .revenue
            : 0,
        pendingPayments: billingData?.invoices?.pending || 0,
        completedPayments: billingData?.payments?.completed || 0,
      }

      return {
        appointments: appointmentMetrics,
        prescriptions: prescriptionMetrics,
        medicalRecords: medicalRecordMetrics,
        billing: billingMetrics,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // Refetch cada 10 minutos
  })
}

// Hook para obtener tendencias de citas
export function useAppointmentTrends(days: number = 30) {
  return useQuery({
    queryKey: ['appointment-trends', days],
    queryFn: async (): Promise<AppointmentTrend[]> => {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

      const appointmentsResult = await getAppointments({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        page: 1,
        limit: 100,
      })

      if (!appointmentsResult.success) {
        throw new Error(
          appointmentsResult.error || 'Error al obtener tendencias de citas'
        )
      }

      const appointments = appointmentsResult.data?.data || []

      // Agrupar por fecha
      const dateMap = new Map<string, number>()

      // Inicializar todas las fechas con 0
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]
        dateMap.set(dateStr, 0)
      }

      // Contar citas por fecha
      appointments.forEach((apt) => {
        const date = apt.date?.split('T')[0]
        if (date && dateMap.has(date)) {
          dateMap.set(date, (dateMap.get(date) || 0) + 1)
        }
      })

      const result = Array.from(dateMap.entries()).map(([date, count]) => ({
        date,
        count,
      }))

      return result
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para obtener tendencias de ingresos
export function useRevenueTrends(months: number = 6) {
  return useQuery({
    queryKey: ['revenue-trends', months],
    queryFn: async (): Promise<RevenueTrend[]> => {
      try {
        const billingResult = await getDoctorBillingStatsAction()

        if (!billingResult.success || !billingResult.data?.monthlyRevenue) {
          // Retornar estructura vacía pero válida para mostrar estado preparado
          return []
        }

        // Usar los datos reales del backend
        const result = billingResult.data.monthlyRevenue
          .slice(-months)
          .map((item) => ({
            month: item.month,
            revenue: item.revenue,
          }))

        return result
      } catch (error) {
        console.error('Error al obtener tendencias de ingresos:', error)
        // Retornar array vacío en lugar de error para mostrar estado preparado
        return []
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hora
  })
}

// Hook para obtener estadísticas de estado de citas
export function useAppointmentStatusStats() {
  return useQuery({
    queryKey: ['appointment-status-stats'],
    queryFn: async (): Promise<AppointmentStatusStats[]> => {
      try {
        const appointmentsResult = await getAppointments({
          page: 1,
          limit: 100,
        })

        if (!appointmentsResult.success) {
          return []
        }

        const appointments = appointmentsResult.data?.data || []

        if (appointments.length === 0) {
          return []
        }

        // Calcular estadísticas por estado
        const statusCounts = {
          COMPLETED: appointments.filter((apt) => apt.status === 'COMPLETED')
            .length,
          SCHEDULED: appointments.filter((apt) => apt.status === 'SCHEDULED')
            .length,
          CONFIRMED: appointments.filter((apt) => apt.status === 'CONFIRMED')
            .length,
          CANCELLED: appointments.filter((apt) => apt.status === 'CANCELLED')
            .length,
        }

        const total = Object.values(statusCounts).reduce(
          (sum, count) => sum + count,
          0
        )

        if (total === 0) return []

        return [
          {
            name: 'Completadas',
            value: Math.round((statusCounts.COMPLETED / total) * 100),
            color: '#00C49F',
          },
          {
            name: 'Pendientes',
            value: Math.round((statusCounts.SCHEDULED / total) * 100),
            color: '#FFBB28',
          },
          {
            name: 'Confirmadas',
            value: Math.round((statusCounts.CONFIRMED / total) * 100),
            color: '#0088FE',
          },
          {
            name: 'Canceladas',
            value: Math.round((statusCounts.CANCELLED / total) * 100),
            color: '#FF8042',
          },
        ].filter((item) => item.value > 0)
      } catch (error) {
        console.error('Error al obtener estadísticas de citas:', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}
