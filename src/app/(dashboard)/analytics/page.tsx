import { AdminOnlyRoute } from '@/components/auth/protected-route'
import { AnalyticsDashboard } from '@/features/analytics/components/analytics-dashboard'

export default function AnalyticsPage() {
  return (
    <AdminOnlyRoute>
      <AnalyticsDashboard />
    </AdminOnlyRoute>
  )
}
