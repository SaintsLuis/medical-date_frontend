'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  FileText,
  Pill,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Stethoscope,
  Building2,
  UserCheck,
  CreditCard,
  Activity,
} from 'lucide-react'
import { useAdminDashboardMetrics } from '../hooks/use-admin-dashboard'
import { Skeleton } from '@/components/ui/skeleton'

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange'
}

function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
  color = 'blue',
}: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <div className={`p-2 rounded-md ${colorClasses[color]}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        {description && (
          <p className='text-xs text-muted-foreground'>{description}</p>
        )}
        {trend && (
          <div className='flex items-center text-xs text-muted-foreground mt-1'>
            <TrendingUp className='w-3 h-3 mr-1' />
            <span className='font-medium'>{trend.value}</span>
            <span className='ml-1'>{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-8 w-8 rounded-md' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-8 w-16 mb-2' />
            <Skeleton className='h-3 w-32' />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function AdminDashboardMetrics() {
  const { data: metrics, isLoading, error } = useAdminDashboardMetrics()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardContent className='flex items-center justify-center h-32'>
            <div className='text-center'>
              <AlertTriangle className='h-8 w-8 text-red-500 mx-auto mb-2' />
              <p className='text-sm text-muted-foreground'>
                Error al cargar métricas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!metrics) {
    return null
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {/* Usuarios */}
      <MetricCard
        title='Total Usuarios'
        value={metrics.totalUsers}
        description='Usuarios registrados'
        icon={<Users className='h-4 w-4' />}
        trend={{
          value: metrics.newUsersThisMonth,
          label: 'nuevos este mes',
        }}
        color='blue'
      />

      {/* Doctores */}
      <MetricCard
        title='Total Doctores'
        value={metrics.totalDoctors}
        description='Doctores activos'
        icon={<Stethoscope className='h-4 w-4' />}
        trend={{
          value: metrics.newDoctorsThisMonth,
          label: 'nuevos este mes',
        }}
        color='green'
      />

      {/* Clínicas */}
      <MetricCard
        title='Total Clínicas'
        value={metrics.totalClinics}
        description='Clínicas activas'
        icon={<Building2 className='h-4 w-4' />}
        trend={{
          value: metrics.activeClinics,
          label: 'activas',
        }}
        color='purple'
      />

      {/* Especialidades */}
      <MetricCard
        title='Especialidades'
        value={metrics.totalSpecialties}
        description='Especialidades médicas'
        icon={<Pill className='h-4 w-4' />}
        color='orange'
      />

      {/* Citas */}
      <MetricCard
        title='Citas Hoy'
        value={metrics.appointmentsToday}
        description='Citas programadas'
        icon={<Calendar className='h-4 w-4' />}
        trend={{
          value: metrics.appointmentsThisWeek,
          label: 'esta semana',
        }}
        color='yellow'
      />

      {/* Ingresos */}
      <MetricCard
        title='Ingresos del Mes'
        value={`$${metrics.monthlyRevenue.toLocaleString()}`}
        description='Ingresos totales'
        icon={<DollarSign className='h-4 w-4' />}
        trend={{
          value: metrics.revenueGrowth,
          label: '% vs mes anterior',
        }}
        color='green'
      />

      {/* Facturas */}
      <MetricCard
        title='Facturas Pendientes'
        value={metrics.pendingInvoices}
        description='Por cobrar'
        icon={<FileText className='h-4 w-4' />}
        color='red'
      />

      {/* Actividad */}
      <MetricCard
        title='Actividad del Sistema'
        value={metrics.systemActivity}
        description='Usuarios activos hoy'
        icon={<Activity className='h-4 w-4' />}
        color='blue'
      />
    </div>
  )
}
