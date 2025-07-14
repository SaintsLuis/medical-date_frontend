import { AdminOnlyRoute } from '@/components/auth/protected-route'
import { BillingDashboard } from '@/features/billing/components/billing-dashboard'

export default function BillingPage() {
  return (
    <AdminOnlyRoute>
      <BillingDashboard />
    </AdminOnlyRoute>
  )
}
