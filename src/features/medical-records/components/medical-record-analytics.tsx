'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDoctorMedicalRecordAnalytics } from '../hooks/use-medical-records'
import {
  getCategoryText,
  getPriorityText,
  MedicalRecordCategory,
  Priority,
} from '../types'
import { Loader2, TrendingUp, Users, Calendar, AlertCircle } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

interface MedicalRecordAnalyticsProps {
  doctorId: string
}

// Tipos para las estadísticas (basados en los types del backend)
interface CategoryStats {
  category: string
  count: number
  percentage: number
}

interface PriorityStats {
  priority: string
  count: number
  percentage: number
}

// Colores para los gráficos
const COLORS = {
  primary: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'],
  priority: {
    LOW: '#10B981',
    MEDIUM: '#F59E0B',
    HIGH: '#EF4444',
    URGENT: '#DC2626',
  },
  category: {
    CONSULTATION: '#3B82F6',
    EMERGENCY: '#EF4444',
    FOLLOW_UP: '#F59E0B',
    ROUTINE_CHECKUP: '#10B981',
    SURGERY: '#8B5CF6',
    DIAGNOSTIC: '#06B6D4',
  },
}

export function MedicalRecordAnalytics({
  doctorId,
}: MedicalRecordAnalyticsProps) {
  const {
    data: analytics,
    isLoading,
    error,
  } = useDoctorMedicalRecordAnalytics(doctorId)

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <span className='ml-2'>Cargando analíticas...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <AlertCircle className='h-8 w-8 text-red-500' />
        <span className='ml-2 text-red-500'>
          Error al cargar las analíticas
        </span>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  const statsCards = [
    {
      title: 'Total Registros',
      value: analytics.totalRecords,
      icon: TrendingUp,
      description: 'Registros médicos creados',
    },
    {
      title: 'Total Pacientes',
      value: analytics.totalPatients,
      icon: Users,
      description: 'Pacientes únicos atendidos',
    },
    {
      title: 'Seguimientos Pendientes',
      value: analytics.followUpsPending,
      icon: Calendar,
      description: 'Citas de seguimiento programadas',
    },
  ]

  return (
    <div className='space-y-6'>
      {/* Tarjetas de estadísticas principales */}
      <div className='grid gap-4 md:grid-cols-3'>
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {stat.title}
              </CardTitle>
              <stat.icon className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
              <p className='text-xs text-muted-foreground'>
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos en pestañas */}
      <Tabs defaultValue='categories' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='categories'>Por Categoría</TabsTrigger>
          <TabsTrigger value='priority'>Por Prioridad</TabsTrigger>
          <TabsTrigger value='timeline'>Línea de Tiempo</TabsTrigger>
          <TabsTrigger value='symptoms'>Síntomas Comunes</TabsTrigger>
          <TabsTrigger value='diagnoses'>Diagnósticos Comunes</TabsTrigger>
        </TabsList>

        <TabsContent value='categories'>
          <Card>
            <CardHeader>
              <CardTitle>Registros por Categoría</CardTitle>
              <CardDescription>
                Distribución de registros médicos por tipo de consulta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={400}>
                <PieChart>
                  <Pie
                    data={analytics.categoriesDistribution}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ category, percentage }) =>
                      `${getCategoryText(
                        category as MedicalRecordCategory
                      )}: ${percentage}%`
                    }
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='count'
                  >
                    {analytics.categoriesDistribution.map(
                      (entry: CategoryStats, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            COLORS.category[
                              entry.category as keyof typeof COLORS.category
                            ] || COLORS.primary[index % COLORS.primary.length]
                          }
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='priority'>
          <Card>
            <CardHeader>
              <CardTitle>Registros por Prioridad</CardTitle>
              <CardDescription>
                Distribución de registros médicos por nivel de prioridad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={400}>
                <BarChart data={analytics.priorityDistribution}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='priority'
                    tickFormatter={(value) =>
                      getPriorityText(value as Priority)
                    }
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='count' fill='#8884d8'>
                    {analytics.priorityDistribution.map(
                      (entry: PriorityStats, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            COLORS.priority[
                              entry.priority as keyof typeof COLORS.priority
                            ] || COLORS.primary[index % COLORS.primary.length]
                          }
                        />
                      )
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='timeline'>
          <Card>
            <CardHeader>
              <CardTitle>Tendencia Mensual</CardTitle>
              <CardDescription>
                Evolución de registros médicos en los últimos 12 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={400}>
                <LineChart data={analytics.monthlyActivity}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type='monotone'
                    dataKey='records'
                    stroke='#8884d8'
                    strokeWidth={2}
                    name='Registros'
                  />
                  <Line
                    type='monotone'
                    dataKey='patients'
                    stroke='#82ca9d'
                    strokeWidth={2}
                    name='Pacientes'
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='symptoms'>
          <Card>
            <CardHeader>
              <CardTitle>Condiciones Más Comunes</CardTitle>
              <CardDescription>
                Top 10 de condiciones más frecuentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={400}>
                <BarChart data={analytics.topConditions} layout='horizontal'>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis type='number' />
                  <YAxis dataKey='condition' type='category' width={150} />
                  <Tooltip />
                  <Bar dataKey='count' fill='#10B981' />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='diagnoses'>
          <Card>
            <CardHeader>
              <CardTitle>Condiciones por Frecuencia</CardTitle>
              <CardDescription>
                Gráfico circular de las condiciones más tratadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={400}>
                <PieChart>
                  <Pie
                    data={analytics.topConditions}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ condition, count }) => `${condition}: ${count}`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='count'
                  >
                    {analytics.topConditions.map((entry, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS.primary[index % COLORS.primary.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
