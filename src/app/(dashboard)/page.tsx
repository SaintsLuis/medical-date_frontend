// app/(dashboard)/page.tsx
import { Suspense } from 'react'
import { DoctorDashboardMetrics } from '@/features/dashboard/components/doctor-dashboard-metrics'
import { DoctorDashboardCharts } from '@/features/dashboard/components/doctor-dashboard-charts'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

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

// Server Component principal
export default async function DashboardPage() {
  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Dashboard del Doctor
        </h1>
        <p className='text-muted-foreground'>
          Métricas y análisis de tu práctica médica
        </p>
      </div>

      {/* Suspense boundaries para diferentes secciones */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}

// Componente separado para el contenido del dashboard
function DashboardContent() {
  return (
    <div className='space-y-8'>
      {/* Métricas principales del doctor */}
      <DoctorDashboardMetrics />

      {/* Gráficos y tendencias */}
      <DoctorDashboardCharts />
    </div>
  )
}
