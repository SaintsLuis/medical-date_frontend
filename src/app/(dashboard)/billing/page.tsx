import { BillingDashboard } from '@/features/billing/components/billing-dashboard'

export default function BillingPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Facturación</h1>
        <p className='text-muted-foreground'>
          Gestiona todos los pagos y facturación del sistema
        </p>
      </div>

      <BillingDashboard />
    </div>
  )
}
