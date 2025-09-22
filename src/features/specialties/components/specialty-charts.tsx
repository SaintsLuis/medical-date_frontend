'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
} from 'recharts'
import {
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  RefreshCw,
  Award,
  Target,
  Loader2,
} from 'lucide-react'
import { useSpecialtyStats, useSpecialties } from '../hooks/use-specialties'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Mock data para hacer los charts más interesantes (SOLO para pestañas que no sean Resumen)
const mockSpecialtyData = [
  {
    name: 'Cardiología',
    doctors: 45,
    appointments: 1240,
    patients: 892,
    revenue: 125000,
    satisfaction: 4.8,
    growth: 12.5,
    color: 'hsl(var(--chart-1))',
  },
  {
    name: 'Neurología',
    doctors: 32,
    appointments: 890,
    patients: 645,
    revenue: 95000,
    satisfaction: 4.7,
    growth: 8.3,
    color: 'hsl(var(--chart-2))',
  },
  {
    name: 'Pediatría',
    doctors: 28,
    appointments: 1560,
    patients: 1120,
    revenue: 78000,
    satisfaction: 4.9,
    growth: 15.2,
    color: 'hsl(var(--chart-3))',
  },
  {
    name: 'Ginecología',
    doctors: 24,
    appointments: 780,
    patients: 567,
    revenue: 67000,
    satisfaction: 4.6,
    growth: 6.7,
    color: 'hsl(var(--chart-4))',
  },
  {
    name: 'Oncología',
    doctors: 18,
    appointments: 456,
    patients: 234,
    revenue: 89000,
    satisfaction: 4.8,
    growth: 4.2,
    color: 'hsl(var(--chart-5))',
  },
  {
    name: 'Dermatología',
    doctors: 15,
    appointments: 654,
    patients: 445,
    revenue: 52000,
    satisfaction: 4.5,
    growth: 9.8,
    color: 'hsl(var(--primary))',
  },
]

const monthlyTrends = [
  { month: 'Ene', total: 45, new: 3, inactive: 1 },
  { month: 'Feb', total: 47, new: 4, inactive: 2 },
  { month: 'Mar', total: 49, new: 3, inactive: 1 },
  { month: 'Abr', total: 52, new: 5, inactive: 2 },
  { month: 'May', total: 54, new: 3, inactive: 1 },
  { month: 'Jun', total: 57, new: 4, inactive: 1 },
]

const performanceData = mockSpecialtyData.map((specialty) => ({
  specialty: specialty.name,
  efficiency: (specialty.appointments / specialty.doctors).toFixed(1),
  satisfaction: specialty.satisfaction,
  revenue: specialty.revenue,
  growth: specialty.growth,
}))

const chartConfig = {
  doctors: {
    label: 'Doctores',
    color: 'hsl(var(--chart-1))',
  },
  appointments: {
    label: 'Citas',
    color: 'hsl(var(--chart-2))',
  },
  patients: {
    label: 'Pacientes',
    color: 'hsl(var(--chart-3))',
  },
  revenue: {
    label: 'Ingresos',
    color: 'hsl(var(--chart-4))',
  },
  satisfaction: {
    label: 'Satisfacción',
    color: 'hsl(var(--chart-5))',
  },
  total: {
    label: 'Total',
    color: 'hsl(var(--primary))',
  },
  new: {
    label: 'Nuevas',
    color: 'hsl(var(--chart-1))',
  },
  inactive: {
    label: 'Inactivas',
    color: 'hsl(var(--chart-2))',
  },
  growth: {
    label: 'Crecimiento',
    color: 'hsl(var(--chart-3))',
  },
  withDoctors: {
    label: 'Con Doctores',
    color: 'hsl(var(--chart-1))',
  },
  withoutDoctors: {
    label: 'Sin Doctores',
    color: 'hsl(var(--chart-2))',
  },
  active: {
    label: 'Activas',
    color: 'hsl(var(--chart-3))',
  },
  deleted: {
    label: 'Eliminadas',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig

interface SpecialtyChartsProps {
  className?: string
}

export function SpecialtyCharts({ className }: SpecialtyChartsProps) {
  const [selectedMetric, setSelectedMetric] = useState('doctors')
  const [timeRange, setTimeRange] = useState('6M')

  // Datos reales del backend
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useSpecialtyStats()
  const {
    data: specialtiesData,
    isLoading: isLoadingSpecialties,
    error: specialtiesError,
  } = useSpecialties({
    page: 1,
    limit: 50, // Obtener más especialidades para los charts
  })

  const getMetricData = () => {
    return mockSpecialtyData.map((item) => ({
      name: item.name,
      value: item[selectedMetric as keyof typeof item] as number,
      color: item.color,
    }))
  }

  const MetricSelector = () => (
    <div className='flex items-center space-x-2'>
      <Select value={selectedMetric} onValueChange={setSelectedMetric}>
        <SelectTrigger className='w-40'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='doctors'>Doctores</SelectItem>
          <SelectItem value='appointments'>Citas</SelectItem>
          <SelectItem value='patients'>Pacientes</SelectItem>
          <SelectItem value='revenue'>Ingresos</SelectItem>
        </SelectContent>
      </Select>
      <Select value={timeRange} onValueChange={setTimeRange}>
        <SelectTrigger className='w-32'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='1M'>1 Mes</SelectItem>
          <SelectItem value='3M'>3 Meses</SelectItem>
          <SelectItem value='6M'>6 Meses</SelectItem>
          <SelectItem value='1Y'>1 Año</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  // ===================================
  // PESTAÑA RESUMEN - CON DATOS REALES
  // ===================================

  // Chart 1: Distribución de especialidades reales
  const RealDistributionChart = () => {
    if (isLoadingStats) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <PieChartIcon className='h-5 w-5 text-blue-500' />
              Estado de Especialidades
            </CardTitle>
            <CardDescription>Distribución por estado</CardDescription>
          </CardHeader>
          <CardContent className='flex items-center justify-center min-h-[300px]'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </CardContent>
        </Card>
      )
    }

    if (statsError || !stats) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <PieChartIcon className='h-5 w-5 text-blue-500' />
              Estado de Especialidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant='destructive'>
              <AlertDescription>
                Error al cargar estadísticas:{' '}
                {statsError?.message || 'Error desconocido'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )
    }

    const pieData = [
      {
        name: 'Con Doctores',
        value: stats.withDoctors,
        color: 'hsl(var(--chart-1))',
      },
      {
        name: 'Sin Doctores',
        value: stats.active - stats.withDoctors,
        color: 'hsl(var(--chart-2))',
      },
      {
        name: 'Eliminadas',
        value: stats.deleted,
        color: 'hsl(var(--chart-4))',
      },
    ].filter((item) => item.value > 0) // Solo mostrar categorías con datos

    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <PieChartIcon className='h-5 w-5 text-blue-500' />
            Estado de Especialidades
          </CardTitle>
          <CardDescription>
            Distribución por estado ({stats.total} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className='mx-auto aspect-square max-h-[350px]'
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value) => [
                      `${value} especialidades`,
                      'Cantidad',
                    ]}
                  />
                }
              />
              <Pie
                data={pieData}
                dataKey='value'
                nameKey='name'
                innerRadius={60}
                strokeWidth={5}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent payload={pieData} />}
                className='-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center'
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  }

  // Chart 2: Top especialidades por doctores (datos reales)
  const TopSpecialtiesChart = () => {
    if (isLoadingSpecialties) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5 text-green-500' />
              Top Especialidades
            </CardTitle>
            <CardDescription>Por número de doctores</CardDescription>
          </CardHeader>
          <CardContent className='flex items-center justify-center min-h-[300px]'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </CardContent>
        </Card>
      )
    }

    if (specialtiesError || !specialtiesData) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5 text-green-500' />
              Top Especialidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant='destructive'>
              <AlertDescription>
                Error al cargar especialidades:{' '}
                {specialtiesError?.message || 'Error desconocido'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )
    }

    // Tomar las top 8 especialidades con más doctores
    const topSpecialties = specialtiesData.data
      .filter((specialty) => specialty.doctorCount > 0)
      .sort((a, b) => b.doctorCount - a.doctorCount)
      .slice(0, 8)
      .map((specialty) => ({
        name:
          specialty.name.length > 15
            ? specialty.name.substring(0, 15) + '...'
            : specialty.name,
        doctors: specialty.doctorCount,
      }))

    if (topSpecialties.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5 text-green-500' />
              Top Especialidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-center min-h-[300px] text-muted-foreground'>
              No hay especialidades con doctores asignados
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BarChart3 className='h-5 w-5 text-green-500' />
            Top Especialidades
          </CardTitle>
          <CardDescription>
            Por número de doctores ({topSpecialties.length} especialidades)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className='min-h-[350px]'>
            <BarChart data={topSpecialties} margin={{ left: 20, right: 20 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='name'
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                angle={-45}
                textAnchor='end'
                height={80}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`${value} doctores`, 'Especialidad']}
                  />
                }
              />
              <Bar
                dataKey='doctors'
                radius={[4, 4, 0, 0]}
                fill='hsl(var(--chart-1))'
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  }

  // Métricas rápidas reales
  const RealQuickMetrics = () => {
    if (isLoadingStats || isLoadingSpecialties) {
      return (
        <div className='grid gap-4 md:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className='p-6'>
                <div className='flex items-center justify-center min-h-[60px]'>
                  <Loader2 className='h-6 w-6 animate-spin' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (statsError || !stats || specialtiesError || !specialtiesData) {
      return (
        <div className='grid gap-4 md:grid-cols-2'>
          <Alert variant='destructive'>
            <AlertDescription>
              Error al cargar métricas del sistema
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    // Encontrar la especialidad con más doctores
    const topSpecialty = specialtiesData.data
      .filter((s) => s.doctorCount > 0)
      .sort((a, b) => b.doctorCount - a.doctorCount)[0]

    return (
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Especialidades
            </CardTitle>
            <BarChart3 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
            <p className='text-xs text-muted-foreground'>
              {stats.active} activas, {stats.deleted} eliminadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Con Doctores</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.withDoctors}</div>
            <p className='text-xs text-muted-foreground'>
              {((stats.withDoctors / stats.active) * 100).toFixed(1)}% de las
              activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Top Especialidad
            </CardTitle>
            <Award className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-lg font-bold truncate'>
              {topSpecialty?.name || 'N/A'}
            </div>
            <p className='text-xs text-muted-foreground'>
              {topSpecialty?.doctorCount || 0} doctores
              <TrendingUp className='inline h-3 w-3 ml-1 text-green-500' />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Promedio</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.withDoctors > 0
                ? (
                    specialtiesData.data
                      .filter((s) => s.doctorCount > 0)
                      .reduce((sum, s) => sum + s.doctorCount, 0) /
                    stats.withDoctors
                  ).toFixed(1)
                : '0.0'}
            </div>
            <p className='text-xs text-muted-foreground'>
              Doctores por especialidad
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ===================================
  // CHARTS MOCK (Para otras pestañas)
  // ===================================

  // Chart 1: Distribución por Especialidades (Pie Chart)
  const DistributionChart = () => (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <PieChartIcon className='h-5 w-5 text-blue-500' />
            Distribución por Especialidades
          </CardTitle>
          <CardDescription>
            {selectedMetric === 'doctors' && 'Doctores por especialidad'}
            {selectedMetric === 'appointments' && 'Citas por especialidad'}
            {selectedMetric === 'patients' && 'Pacientes por especialidad'}
            {selectedMetric === 'revenue' && 'Ingresos por especialidad'}
          </CardDescription>
        </div>
        <MetricSelector />
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[350px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => [
                    selectedMetric === 'revenue'
                      ? `$${value?.toLocaleString()}`
                      : value?.toLocaleString(),
                    'Valor',
                  ]}
                />
              }
            />
            <Pie
              data={getMetricData()}
              dataKey='value'
              nameKey='name'
              innerRadius={60}
              strokeWidth={5}
            >
              {getMetricData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent payload={getMetricData()} />}
              className='-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center'
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )

  // Chart 2: Comparación Multi-métrica (Bar Chart)
  const ComparisonChart = () => (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <BarChart3 className='h-5 w-5 text-green-500' />
          Comparación Multi-métrica
        </CardTitle>
        <CardDescription>
          Doctores vs Citas vs Pacientes por especialidad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='min-h-[350px]'>
          <BarChart data={mockSpecialtyData} margin={{ left: 20, right: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='name'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                value.length > 10 ? value.substring(0, 10) + '...' : value
              }
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey='doctors'
              fill='var(--color-doctors)'
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey='appointments'
              fill='var(--color-appointments)'
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey='patients'
              fill='var(--color-patients)'
              radius={[0, 0, 4, 4]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )

  // Chart 3: Tendencias Mensuales (Area Chart)
  const TrendsChart = () => (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <TrendingUp className='h-5 w-5 text-purple-500' />
          Tendencias Mensuales
        </CardTitle>
        <CardDescription>
          Crecimiento de especialidades en los últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='min-h-[350px]'>
          <AreaChart data={monthlyTrends}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='month'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id='fillTotal' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-total)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-total)'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey='total'
              type='natural'
              fill='url(#fillTotal)'
              fillOpacity={0.4}
              stroke='var(--color-total)'
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )

  // Chart 4: Performance Radial (Radial Bar Chart)
  const PerformanceChart = () => (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Target className='h-5 w-5 text-orange-500' />
          Performance de Especialidades
        </CardTitle>
        <CardDescription>
          Satisfacción y eficiencia por especialidad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[350px]'
        >
          <RadialBarChart
            data={performanceData.slice(0, 4)}
            innerRadius='10%'
            outerRadius='80%'
          >
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    name === 'satisfaction' ? `${value}/5` : value,
                    name === 'satisfaction' ? 'Satisfacción' : 'Eficiencia',
                  ]}
                />
              }
            />
            <RadialBar
              dataKey='satisfaction'
              cornerRadius={10}
              fill='var(--color-satisfaction)'
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )

  // Chart 5: Scatter Chart para Correlaciones
  const CorrelationChart = () => (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Activity className='h-5 w-5 text-indigo-500' />
          Correlación: Doctores vs Satisfacción
        </CardTitle>
        <CardDescription>
          Relación entre número de doctores y satisfacción del paciente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='min-h-[350px]'>
          <ScatterChart data={mockSpecialtyData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              type='number'
              dataKey='doctors'
              name='Doctores'
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type='number'
              dataKey='satisfaction'
              name='Satisfacción'
              domain={[4.0, 5.0]}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => [
                    name === 'doctors' ? `${value} doctores` : `${value}/5`,
                    props?.payload &&
                    typeof props.payload === 'object' &&
                    'name' in props.payload
                      ? String(props.payload.name)
                      : '',
                  ]}
                />
              }
            />
            <Scatter
              dataKey='satisfaction'
              fill='var(--color-satisfaction)'
              stroke='var(--color-satisfaction)'
              strokeWidth={2}
              r={6}
            />
          </ScatterChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )

  // Métricas rápidas mock
  const QuickMetrics = () => (
    <div className='grid gap-4 md:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Especialidad Top
          </CardTitle>
          <Award className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>Cardiología</div>
          <p className='text-xs text-muted-foreground'>
            +12.5% crecimiento
            <TrendingUp className='inline h-3 w-3 ml-1 text-green-500' />
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Mayor Satisfacción
          </CardTitle>
          <Users className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>Pediatría</div>
          <p className='text-xs text-muted-foreground'>4.9/5 ⭐ rating</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Más Eficiente</CardTitle>
          <Activity className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>Pediatría</div>
          <p className='text-xs text-muted-foreground'>55.7 citas/doctor</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
          <TrendingUp className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>$506K</div>
          <p className='text-xs text-muted-foreground'>+9.2% este mes</p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className={className}>
      <Tabs defaultValue='overview' className='space-y-6'>
        <div className='flex items-center justify-between'>
          <TabsList>
            <TabsTrigger value='overview'>🎯 Resumen Real</TabsTrigger>
            <TabsTrigger value='performance'>Performance</TabsTrigger>
            <TabsTrigger value='trends'>Tendencias</TabsTrigger>
            <TabsTrigger value='analysis'>Análisis</TabsTrigger>
          </TabsList>
          <div className='flex items-center space-x-2'>
            <Button variant='outline' size='sm'>
              <RefreshCw className='h-4 w-4 mr-2' />
              Actualizar
            </Button>
            <Button variant='outline' size='sm'>
              <Download className='h-4 w-4 mr-2' />
              Exportar
            </Button>
          </div>
        </div>

        <TabsContent value='overview' className='space-y-6'>
          <RealQuickMetrics />
          <div className='grid gap-6 lg:grid-cols-2'>
            <RealDistributionChart />
            <TopSpecialtiesChart />
          </div>
        </TabsContent>

        <TabsContent value='performance' className='space-y-6'>
          <QuickMetrics />
          <div className='grid gap-6 lg:grid-cols-2'>
            <PerformanceChart />
            <CorrelationChart />
          </div>
          <ComparisonChart />
        </TabsContent>

        <TabsContent value='trends' className='space-y-6'>
          <TrendsChart />
          <div className='grid gap-6 lg:grid-cols-2'>
            <DistributionChart />
            <PerformanceChart />
          </div>
        </TabsContent>

        <TabsContent value='analysis' className='space-y-6'>
          <div className='grid gap-6'>
            <CorrelationChart />
            <div className='grid gap-6 lg:grid-cols-2'>
              <TrendsChart />
              <ComparisonChart />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
