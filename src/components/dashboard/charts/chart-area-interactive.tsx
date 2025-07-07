'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const data = [
  {
    month: 'Ene',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    month: 'Feb',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    month: 'Mar',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    month: 'Abr',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    month: 'May',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    month: 'Jun',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    month: 'Jul',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    month: 'Ago',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    month: 'Sep',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    month: 'Oct',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    month: 'Nov',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    month: 'Dic',
    total: Math.floor(Math.random() * 5000) + 1000,
  },
]

export function ChartAreaInteractive() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de Actividad</CardTitle>
        <CardDescription>
          Análisis de citas y actividad del sistema
        </CardDescription>
      </CardHeader>
      <CardContent className='pl-2'>
        <Tabs defaultValue='citas' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='citas'>Citas</TabsTrigger>
            <TabsTrigger value='ingresos'>Ingresos</TabsTrigger>
            <TabsTrigger value='pacientes'>Pacientes</TabsTrigger>
          </TabsList>
          <TabsContent value='citas' className='space-y-4'>
            <div className='text-2xl font-bold'>+2,350</div>
            <p className='text-xs text-muted-foreground'>
              +180.1% desde el mes pasado
            </p>
            <div className='h-[200px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                  data={data}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id='gradient' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='0%' stopColor='#3b82f6' stopOpacity={0.3} />
                      <stop offset='100%' stopColor='#3b82f6' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    className='stroke-muted'
                  />
                  <XAxis
                    dataKey='month'
                    stroke='#888888'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke='#888888'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip />
                  <Area
                    type='monotone'
                    dataKey='total'
                    stroke='#3b82f6'
                    fill='url(#gradient)'
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value='ingresos' className='space-y-4'>
            <div className='text-2xl font-bold'>+$45,231.89</div>
            <p className='text-xs text-muted-foreground'>
              +20.1% desde el mes pasado
            </p>
            <div className='h-[200px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                  data={data}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id='gradient2' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='0%' stopColor='#10b981' stopOpacity={0.3} />
                      <stop offset='100%' stopColor='#10b981' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    className='stroke-muted'
                  />
                  <XAxis
                    dataKey='month'
                    stroke='#888888'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke='#888888'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip />
                  <Area
                    type='monotone'
                    dataKey='total'
                    stroke='#10b981'
                    fill='url(#gradient2)'
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value='pacientes' className='space-y-4'>
            <div className='text-2xl font-bold'>+573</div>
            <p className='text-xs text-muted-foreground'>
              +201 desde el mes pasado
            </p>
            <div className='h-[200px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                  data={data}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id='gradient3' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='0%' stopColor='#f59e0b' stopOpacity={0.3} />
                      <stop offset='100%' stopColor='#f59e0b' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    className='stroke-muted'
                  />
                  <XAxis
                    dataKey='month'
                    stroke='#888888'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke='#888888'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip />
                  <Area
                    type='monotone'
                    dataKey='total'
                    stroke='#f59e0b'
                    fill='url(#gradient3)'
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
