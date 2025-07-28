'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  useAppointmentTrends,
  useRevenueTrends,
  useAppointmentStatusStats,
} from '../hooks/use-doctor-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, Calendar, DollarSign, BarChart3 } from 'lucide-react'

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-5 w-32' />
        <Skeleton className='h-4 w-48' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-64 w-full' />
      </CardContent>
    </Card>
  )
}

function ErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex items-center space-x-2 text-red-600 justify-center h-32'>
          <AlertTriangle className='w-5 h-5' />
          <span>{message}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyStateCard({
  title,
  description,
  message,
  icon: Icon = AlertTriangle,
}: {
  title: string
  description?: string
  message: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className='flex flex-col items-center justify-center py-8 space-y-3 text-muted-foreground'>
          <Icon className='w-12 h-12 opacity-50' />
          <p className='text-center text-sm max-w-sm leading-relaxed'>
            {message}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function DoctorDashboardCharts() {
  const {
    data: appointmentTrends,
    isLoading: appointmentTrendsLoading,
    error: appointmentTrendsError,
  } = useAppointmentTrends(30)

  const {
    data: revenueTrends,
    isLoading: revenueTrendsLoading,
    error: revenueTrendsError,
  } = useRevenueTrends(6)

  const {
    data: appointmentStatusStats,
    isLoading: appointmentStatusLoading,
    error: appointmentStatusError,
  } = useAppointmentStatusStats()

  return (
    <div className='grid gap-6 md:grid-cols-2'>
      {/* Gráfico de tendencias de citas */}
      <div className='md:col-span-2 mb-2'>
        {appointmentTrendsLoading ? (
          <ChartSkeleton />
        ) : appointmentTrendsError ? (
          <ErrorCard
            title='Tendencias de Citas (últimos 30 días)'
            message='Error al cargar las tendencias de citas'
          />
        ) : !appointmentTrends?.length ||
          appointmentTrends.every((trend) => trend.count === 0) ? (
          <EmptyStateCard
            title='Tendencias de Citas (últimos 30 días)'
            description='Número de citas programadas por día'
            message='No hay citas registradas en los últimos 30 días. Las citas aparecerán aquí cuando sean agendadas.'
            icon={Calendar}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Tendencias de Citas (últimos 30 días)</CardTitle>
              <CardDescription>
                Número de citas programadas por día
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={appointmentTrends}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='date'
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => {
                      const date = new Date(value as string)
                      return date.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    }}
                    formatter={(value: number) => [value, 'Citas']}
                  />
                  <Line
                    type='monotone'
                    dataKey='count'
                    stroke='#0088FE'
                    strokeWidth={2}
                    dot={{ fill: '#0088FE' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gráfico de ingresos mensuales */}
      <Card>
        {revenueTrendsLoading ? (
          <>
            <CardHeader>
              <Skeleton className='h-5 w-32' />
              <Skeleton className='h-4 w-48' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-64 w-full' />
            </CardContent>
          </>
        ) : revenueTrendsError ? (
          <>
            <CardHeader>
              <CardTitle>Ingresos Mensuales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center space-x-2 text-red-600 justify-center h-32'>
                <AlertTriangle className='w-5 h-5' />
                <span>Error al cargar ingresos</span>
              </div>
            </CardContent>
          </>
        ) : !revenueTrends?.length ||
          revenueTrends.every((trend) => trend.revenue === 0) ? (
          <EmptyStateCard
            title='Ingresos Mensuales'
            description='Evolución de ingresos por mes'
            message='No hay facturas registradas aún. Los ingresos aparecerán aquí cuando se generen las primeras facturas.'
            icon={DollarSign}
          />
        ) : (
          <>
            <CardHeader>
              <CardTitle>Ingresos Mensuales</CardTitle>
              <CardDescription>Evolución de ingresos por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={250}>
                <BarChart data={revenueTrends}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      'Ingresos',
                    ]}
                  />
                  <Bar dataKey='revenue' fill='#00C49F' />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </>
        )}
      </Card>

      {/* Gráfico circular de estado de citas */}
      <Card>
        {appointmentStatusLoading ? (
          <>
            <CardHeader>
              <Skeleton className='h-5 w-32' />
              <Skeleton className='h-4 w-48' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-64 w-full' />
            </CardContent>
          </>
        ) : appointmentStatusError || !appointmentStatusStats?.length ? (
          <EmptyStateCard
            title='Estado de Citas'
            description='Distribución por estado actual'
            message='No hay citas para mostrar estadísticas. Los datos aparecerán cuando se agenden citas.'
            icon={BarChart3}
          />
        ) : (
          <>
            <CardHeader>
              <CardTitle>Estado de Citas</CardTitle>
              <CardDescription>Distribución por estado actual</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={250}>
                <PieChart>
                  <Pie
                    data={appointmentStatusStats}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey='value'
                  >
                    {appointmentStatusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Porcentaje']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className='flex justify-center space-x-4 mt-4'>
                {appointmentStatusStats.map((item) => (
                  <div key={item.name} className='flex items-center space-x-1'>
                    <div
                      className='w-3 h-3 rounded-full'
                      style={{ backgroundColor: item.color }}
                    />
                    <span className='text-xs text-muted-foreground'>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
