import { AnalyticsDashboard } from '@/features/analytics/components/analytics-dashboard'

export default function AnalyticsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Analíticas</h1>
        <p className='text-muted-foreground'>
          Visualiza métricas y estadísticas del sistema
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  )
}
