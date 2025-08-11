'use client'

import { Suspense } from 'react'
import { DoctorDashboardMetrics } from '@/features/dashboard/components/doctor-dashboard-metrics'
import { DoctorDashboardCharts } from '@/features/dashboard/components/doctor-dashboard-charts'
import { AdminDashboardMetrics } from '@/features/dashboard/components/admin-dashboard-metrics'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/features/auth/store/auth'
import { UserRole } from '@/types/auth'

// Loading component para Suspense
function DashboardSkeleton() {
  return (
    <div className='space-y-6'>
      <div>
        <Skeleton className='h-8 w-48 mb-2' />
        <Skeleton className='h-4 w-96' />
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-7 w-16 mb-1' />
              <Skeleton className='h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4'>
          <CardHeader>
            <Skeleton className='h-5 w-32' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-[300px] w-full' />
          </CardContent>
        </Card>
        <Card className='col-span-3'>
          <CardHeader>
            <Skeleton className='h-5 w-32' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-[300px] w-full' />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente principal del dashboard
export default function DashboardPage() {
  const { user } = useAuthStore()
  const userRoles = user?.roles || []
  const isAdmin = userRoles.includes(UserRole.ADMIN)
  const isDoctor = userRoles.includes(UserRole.DOCTOR)
  const isSecretary = userRoles.includes(UserRole.SECRETARY)

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          {isAdmin
            ? 'Dashboard Administrativo'
            : isDoctor
            ? 'Dashboard del Doctor'
            : isSecretary
            ? 'Dashboard de Secretaria'
            : 'Dashboard'}
        </h1>
        <p className='text-muted-foreground'>
          {isAdmin
            ? 'Resumen general del sistema médico'
            : isDoctor
            ? 'Métricas y análisis de tu práctica médica'
            : isSecretary
            ? 'Gestión de citas y pacientes asignados'
            : 'Panel de control'}
        </p>
      </div>

      {/* Suspense boundaries para diferentes secciones */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent
          isAdmin={isAdmin}
          isDoctor={isDoctor}
          isSecretary={isSecretary}
        />
      </Suspense>
    </div>
  )
}

// Componente separado para el contenido del dashboard
function DashboardContent({
  isAdmin,
  isDoctor,
  isSecretary,
}: {
  isAdmin: boolean
  isDoctor: boolean
  isSecretary: boolean
}) {
  // Si es admin, mostrar dashboard administrativo
  if (isAdmin) {
    return (
      <div className='space-y-8'>
        {/* Métricas principales del administrador */}
        <AdminDashboardMetrics />

        {/* Aquí podrías agregar gráficos administrativos */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <Card className='col-span-4'>
            <CardHeader>
              <h3 className='text-lg font-semibold'>Análisis del Sistema</h3>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>
                Gráficos y análisis detallados del sistema estarán disponibles
                próximamente.
              </p>
            </CardContent>
          </Card>
          <Card className='col-span-3'>
            <CardHeader>
              <h3 className='text-lg font-semibold'>Actividad Reciente</h3>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>
                Actividad reciente del sistema estará disponible próximamente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Si es doctor, mostrar dashboard del doctor
  if (isDoctor) {
    return (
      <div className='space-y-8'>
        {/* Métricas principales del doctor */}
        <DoctorDashboardMetrics />

        {/* Gráficos y tendencias */}
        <DoctorDashboardCharts />
      </div>
    )
  }

  // Si es secretaria, mostrar dashboard de secretaria
  if (isSecretary) {
    return (
      <div className='space-y-8'>
        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>Dashboard de Secretaria</h3>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              Dashboard específico para secretarias estará disponible
              próximamente. Aquí podrás gestionar citas, pacientes y horarios de
              los doctores asignados.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si no tiene rol específico, mostrar mensaje
  return (
    <div className='space-y-8'>
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Acceso Restringido</h3>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>
            No tienes permisos para acceder al dashboard. Contacta al
            administrador.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
