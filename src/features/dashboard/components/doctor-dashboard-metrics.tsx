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
} from 'lucide-react'
import { useDoctorDashboardMetrics } from '../hooks/use-doctor-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
// import { JoinMeetButton } from '@/components/dashboard/join-meet-button'

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
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

export function DoctorDashboardMetrics() {
  const { data: metrics, isLoading, error } = useDoctorDashboardMetrics()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <Card className='col-span-full'>
        <CardContent className='p-6'>
          <div className='flex items-center space-x-2 text-red-600'>
            <AlertTriangle className='w-5 h-5' />
            <span>Error al cargar las métricas del dashboard</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return null
  }

  const { appointments, prescriptions, medicalRecords, billing } = metrics

  return (
    <div className='space-y-6'>
      {/* Botón para unirse a Meet
      <JoinMeetButton /> */}

      {/* Métricas principales */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* Citas de hoy */}
        <MetricCard
          title='Citas de Hoy'
          value={appointments.todayAppointments}
          description={`${appointments.weekAppointments} esta semana`}
          icon={<Calendar className='w-4 h-4' />}
          color='blue'
          trend={{
            value: appointments.weekAppointments,
            label: 'últimos 7 días',
          }}
        />

        {/* Total de Citas */}
        <MetricCard
          title='Total de Citas'
          value={appointments.total}
          description={`${appointments.confirmed} confirmadas`}
          icon={<Users className='w-4 h-4' />}
          color='green'
        />

        {/* Prescripciones Activas */}
        <MetricCard
          title='Prescripciones Activas'
          value={prescriptions.active}
          description={`${prescriptions.thisMonthPrescriptions} este mes`}
          icon={<Pill className='w-4 h-4' />}
          color='purple'
        />

        {/* Ingresos del Mes */}
        <MetricCard
          title='Ingresos del Mes'
          value={`$${billing.thisMonthRevenue.toLocaleString()}`}
          description={`$${billing.totalRevenue.toLocaleString()} total`}
          icon={<DollarSign className='w-4 h-4' />}
          color='green'
        />
      </div>

      {/* Métricas secundarias */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* Citas Pendientes */}
        <MetricCard
          title='Citas Pendientes'
          value={appointments.pending}
          description='Esperando confirmación'
          icon={<Clock className='w-4 h-4' />}
          color='yellow'
        />

        {/* Citas Completadas */}
        <MetricCard
          title='Citas Completadas'
          value={appointments.completed}
          description='Finalizadas exitosamente'
          icon={<CheckCircle className='w-4 h-4' />}
          color='green'
        />

        {/* Expedientes del Mes */}
        <MetricCard
          title='Expedientes del Mes'
          value={medicalRecords.thisMonthRecords}
          description={`${medicalRecords.total} total`}
          icon={<FileText className='w-4 h-4' />}
          color='blue'
        />

        {/* Pagos Pendientes */}
        <MetricCard
          title='Pagos Pendientes'
          value={billing.pendingPayments}
          description={`${billing.completedPayments} completados`}
          icon={<AlertTriangle className='w-4 h-4' />}
          color='red'
        />
      </div>

      {/* Breakdown de categorías de expedientes */}
      {medicalRecords.categoriesBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Categorías de Expedientes Médicos</CardTitle>
            <CardDescription>Distribución por tipo de consulta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {medicalRecords.categoriesBreakdown.map((category) => (
                <Badge key={category.category} variant='secondary'>
                  {category.category}: {category.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
