'use server'

import { revalidatePath } from 'next/cache'
import { serverApi } from '@/lib/api/server-client'

export interface AdminDashboardMetrics {
  // Usuarios
  totalUsers: number
  newUsersThisMonth: number
  activeUsersToday: number

  // Doctores
  totalDoctors: number
  newDoctorsThisMonth: number
  activeDoctors: number

  // Clínicas
  totalClinics: number
  activeClinics: number
  clinicsWithDoctors: number

  // Especialidades
  totalSpecialties: number
  popularSpecialties: Array<{
    name: string
    count: number
  }>

  // Citas
  appointmentsToday: number
  appointmentsThisWeek: number
  appointmentsThisMonth: number

  // Facturación
  monthlyRevenue: number
  revenueGrowth: number
  pendingInvoices: number
  completedInvoices: number

  // Sistema
  systemActivity: number
  totalPatients: number
  newPatientsThisMonth: number
}

export async function getAdminDashboardMetrics() {
  try {
    console.log('🔍 Calling admin dashboard metrics endpoint...')

    const response = await serverApi.get<AdminDashboardMetrics>(
      '/admin/dashboard/metrics'
    )

    console.log('📊 Admin dashboard response:', {
      success: response.success,
      hasData: !!response.data,
      error: response.error,
    })

    revalidatePath('/')

    return response
  } catch (error) {
    console.error('❌ Error fetching admin dashboard metrics:', error)
    return {
      success: false,
      error: 'Error de conexión al servidor',
    }
  }
}
