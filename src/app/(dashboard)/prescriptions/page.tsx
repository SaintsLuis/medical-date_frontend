import { PrescriptionsList } from '@/features/prescriptions/components/prescriptions-list'

export default function PrescriptionsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Prescripciones</h1>
        <p className='text-muted-foreground'>
          Gestiona todas las prescripciones del sistema
        </p>
      </div>

      <PrescriptionsList />
    </div>
  )
}
