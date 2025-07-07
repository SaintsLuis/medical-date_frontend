import { PatientsList } from '@/features/patients/components/patients-list'

export default function PatientsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Pacientes</h1>
        <p className='text-muted-foreground'>
          Gestiona todos los pacientes del sistema
        </p>
      </div>

      <PatientsList />
    </div>
  )
}
