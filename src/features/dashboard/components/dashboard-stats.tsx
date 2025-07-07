'use client'

import {
  Calendar,
  Users,
  UserCheck,
  Building2,
  CreditCard,
  TrendingUp,
} from 'lucide-react'
import { StatsCard } from '@/components/dashboard/cards/stats-card'

const stats = [
  {
    title: 'Citas Totales',
    value: '1,234',
    description: 'Este mes',
    icon: Calendar,
    trend: { value: 12, isPositive: true },
  },
  {
    title: 'Pacientes Activos',
    value: '567',
    description: 'Registrados',
    icon: Users,
    trend: { value: 8, isPositive: true },
  },
  {
    title: 'Doctores',
    value: '89',
    description: 'En el sistema',
    icon: UserCheck,
    trend: { value: 3, isPositive: true },
  },
  {
    title: 'Clínicas',
    value: '23',
    description: 'Activas',
    icon: Building2,
    trend: { value: 1, isPositive: true },
  },
  {
    title: 'Ingresos',
    value: '$45,678',
    description: 'Este mes',
    icon: CreditCard,
    trend: { value: 15, isPositive: true },
  },
  {
    title: 'Tasa de Crecimiento',
    value: '23.5%',
    description: 'vs mes anterior',
    icon: TrendingUp,
    trend: { value: 5, isPositive: true },
  },
]

export function DashboardStats() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {stats.map((stat) => (
        <StatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={<stat.icon />}
          trend={stat.trend}
        />
      ))}
    </div>
  )
}
