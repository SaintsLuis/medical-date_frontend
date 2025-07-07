import { ClinicsList } from '@/features/clinics/components/clinics-list'

export default function ClinicsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Clínicas</h1>
        <p className='text-muted-foreground'>
          Gestiona todas las clínicas del sistema
        </p>
      </div>

      <ClinicsList />
    </div>
  )
}
