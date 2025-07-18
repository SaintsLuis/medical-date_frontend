import { MedicalRecordsManagement } from '@/features/medical-records'

export default function MedicalRecordsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Registros Médicos</h1>
        <p className='text-muted-foreground'>
          Gestiona todos los registros médicos del sistema
        </p>
      </div>

      <MedicalRecordsManagement />
    </div>
  )
}
